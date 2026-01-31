/**
 * Production smoke test for getAstroChart (self-contained, no Firebase client SDK).
 *
 * Uses: firebase-admin (custom token) + REST signInWithCustomToken + POST callable URL.
 *
 * Env:
 *   GOOGLE_APPLICATION_CREDENTIALS — path to service account JSON (CI: write secret to file).
 *   FIREBASE_WEB_API_KEY — Firebase Web API key (for signInWithCustomToken).
 *   GCLOUD_PROJECT — optional, default aura-2ca80.
 *
 * Run: npm run smoke:astrochart   (from repo root)
 * CI: workflow sets env and runs this script.
 *
 * 5 test cases with thresholds:
 *   (1) Tropical — bodies, angles, houses len 12, longitudes 0..360.
 *   (2) Sidereal Lahiri — Sun diff from tropical >= 10° (not too strict).
 *   (3) Mean vs true node — diff > 0.01°.
 *   (4) Houses len 12 + asc ~ cusp1 (diff < 5°).
 *   (5) Cache — second call meta.cached === true.
 *
 * Optional: one request with debug=true to verify meta.debugSnapshot.
 */

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'aura-2ca80';
const REGION = 'europe-west3';
const CALLABLE_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/getAstroChart`;
const SMOKE_UID = 'smoke-test-getAstroChart';

const baseRequest = {
  utcISO: '1992-03-30T05:30:00.000Z',
  lat: 41.0082,
  lon: 28.9784,
  houseSystem: 'placidus',
  zodiacSystem: 'tropical',
  wantAspects: true,
  debug: false,
};

function normDeg(d) {
  let n = d % 360;
  if (n < 0) n += 360;
  return n;
}

function shortestDegDiff(a, b) {
  const d = normDeg(b) - normDeg(a);
  return ((d + 540) % 360) - 180;
}

async function getIdToken() {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set (path to service account JSON)');
  }
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_WEB_API_KEY not set (Firebase Web API key for signInWithCustomToken)');
  }

  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
  const customToken = await admin.auth().createCustomToken(SMOKE_UID);

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`signInWithCustomToken failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  if (!data.idToken) throw new Error('No idToken in response');
  return data.idToken;
}

async function callGetAstroChart(idToken, payload) {
  const res = await fetch(CALLABLE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`getAstroChart HTTP ${res.status}: ${t}`);
  }
  const body = await res.json();
  if (body.result) return body.result;
  if (body.error) {
    throw new Error(body.error.message || JSON.stringify(body.error));
  }
  return body;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  console.log('🧪 getAstroChart smoke test (self-contained)\n');
  console.log('   Project:', PROJECT_ID);
  console.log('   URL:', CALLABLE_URL);
  console.log('   Base:', baseRequest.utcISO, baseRequest.lat, baseRequest.lon, '\n');

  let idToken;
  try {
    console.log('1. Getting ID token (custom token + signInWithCustomToken)...');
    idToken = await getIdToken();
    console.log('   ✅ Token obtained\n');
  } catch (e) {
    console.error('   ❌ Auth failed:', e.message);
    process.exit(1);
  }

  let passed = 0;
  const failed = [];

  // (1) Tropical
  try {
    console.log('2. Test (1) Tropical...');
    const d = await callGetAstroChart(idToken, { ...baseRequest, zodiacSystem: 'tropical' });
    assert(d?.chart?.bodies?.Sun && typeof d.chart.bodies.Sun.lonDeg === 'number', 'Missing Sun');
    assert(d?.chart?.angles && typeof d.chart.angles.ascDeg === 'number', 'Missing angles');
    assert(Array.isArray(d.chart.houses?.cuspsDeg) && d.chart.houses.cuspsDeg.length === 12, 'Houses length !== 12');
    const sunLon = d.chart.bodies.Sun.lonDeg;
    assert(sunLon >= 0 && sunLon < 360, 'Sun longitude out of range');
    console.log('   ✅ Tropical: Sun', sunLon.toFixed(2), '°');
    passed++;
  } catch (e) {
    console.log('   ❌ FAIL:', e.message);
    failed.push({ test: 1, msg: e.message });
  }

  // (2) Sidereal Lahiri — at least 10° diff from tropical
  try {
    console.log('\n3. Test (2) Sidereal Lahiri (min 10° diff)...');
    const rTrop = await callGetAstroChart(idToken, { ...baseRequest, zodiacSystem: 'tropical' });
    const rSid = await callGetAstroChart(idToken, { ...baseRequest, zodiacSystem: 'sidereal_lahiri' });
    const sunTrop = rTrop.chart.bodies.Sun.lonDeg;
    const sunSid = rSid.chart.bodies.Sun.lonDeg;
    let diff = Math.abs(shortestDegDiff(sunTrop, sunSid));
    assert(diff >= 10, `Sidereal should differ from tropical by at least 10° (got ${diff.toFixed(2)}°)`);
    console.log('   ✅ Sidereal distinct: tropical Sun', sunTrop.toFixed(2), '° vs sidereal', sunSid.toFixed(2), '° (diff', diff.toFixed(2), '°)');
    passed++;
  } catch (e) {
    console.log('   ❌ FAIL:', e.message);
    failed.push({ test: 2, msg: e.message });
  }

  // (3) Mean vs true node — > 0.01°
  try {
    console.log('\n4. Test (3) Mean vs true node...');
    const rMean = await callGetAstroChart(idToken, { ...baseRequest, nodeType: 'mean' });
    const rTrue = await callGetAstroChart(idToken, { ...baseRequest, nodeType: 'true' });
    const nodeMean = rMean.chart.bodies.NorthNode?.lonDeg ?? rMean.chart.bodies.MeanNode?.lonDeg;
    const nodeTrue = rTrue.chart.bodies.NorthNode?.lonDeg ?? rTrue.chart.bodies.TrueNode?.lonDeg;
    assert(nodeMean != null && nodeTrue != null, 'Missing node position');
    let nodeDiff = Math.abs(shortestDegDiff(nodeMean, nodeTrue));
    assert(nodeDiff > 0.01, 'Mean and true node should differ by > 0.01°');
    console.log('   ✅ Mean node', nodeMean.toFixed(2), '° vs true', nodeTrue.toFixed(2), '° (diff', nodeDiff.toFixed(4), '°)');
    passed++;
  } catch (e) {
    console.log('   ❌ FAIL:', e.message);
    failed.push({ test: 3, msg: e.message });
  }

  // (4) Houses len 12 + asc ~ cusp1 (diff < 5°)
  try {
    console.log('\n5. Test (4) Houses len 12 + asc ~ cusp1 (< 5°)...');
    const d = await callGetAstroChart(idToken, { ...baseRequest });
    const cusps = d.chart.houses.cuspsDeg;
    const asc = d.chart.angles.ascDeg;
    assert(cusps && cusps.length === 12, 'Houses length !== 12');
    for (let i = 0; i < 12; i++) {
      const c = cusps[i];
      assert(typeof c === 'number' && c >= 0 && c < 360, `Invalid cusp[${i}]`);
    }
    const cusp1 = cusps[0];
    const ascCuspDiff = Math.abs(shortestDegDiff(asc, cusp1));
    assert(ascCuspDiff < 5, `asc-cusp1 diff should be < 5° (got ${ascCuspDiff.toFixed(2)}°)`);
    console.log('   ✅ Houses len 12, asc', asc.toFixed(2), '° cusp1', cusp1.toFixed(2), '° (diff', ascCuspDiff.toFixed(2), '°)');
    passed++;
  } catch (e) {
    console.log('   ❌ FAIL:', e.message);
    failed.push({ test: 4, msg: e.message });
  }

  // (5) Cache — second call cached
  try {
    console.log('\n6. Test (5) Cache second call...');
    const req = { ...baseRequest, zodiacSystem: 'tropical', debug: false };
    await callGetAstroChart(idToken, req);
    const r2 = await callGetAstroChart(idToken, req);
    assert(r2.meta?.cached === true, 'Second call expected meta.cached === true');
    console.log('   ✅ Second call meta.cached === true');
    passed++;
  } catch (e) {
    console.log('   ❌ FAIL:', e.message);
    failed.push({ test: 5, msg: e.message });
  }

  // Optional: debugSnapshot when debug=true (use distinct utcISO for cache miss)
  try {
    console.log('\n7. Test (6) debugSnapshot (debug=true, cache miss)...');
    const d = await callGetAstroChart(idToken, { ...baseRequest, utcISO: '1990-06-12T12:45:00.000Z', zodiacSystem: 'tropical', debug: true });
    assert(d.meta?.debugSnapshot != null, 'meta.debugSnapshot missing');
    assert(d.meta.debugSnapshot.ephePathSet === true, 'debugSnapshot.ephePathSet !== true');
    assert(Array.isArray(d.meta.debugSnapshot.filesPresent), 'debugSnapshot.filesPresent not array');
    assert(typeof d.meta.debugSnapshot.jdUt === 'number' && typeof d.meta.debugSnapshot.jdTt === 'number', 'debugSnapshot jdUt/jdTt missing');
    console.log('   ✅ debugSnapshot: ephePathSet=true, filesPresent=', d.meta.debugSnapshot.filesPresent.length, ', jdUt=', d.meta.debugSnapshot.jdUt);
    passed++;
  } catch (e) {
    console.log('   ⚠ debugSnapshot (optional):', e.message);
    // do not fail overall for optional debugSnapshot
  }

  console.log('\n' + '─'.repeat(50));
  if (failed.length === 0) {
    console.log('PASS: ' + passed + '/5 tests passed.');
    process.exit(0);
  } else {
    console.log('FAIL: ' + passed + ' passed, ' + failed.length + ' failed.');
    failed.forEach((f) => console.log('   - Test ' + f.test + ': ' + f.msg));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

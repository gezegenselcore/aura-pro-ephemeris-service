/**
 * Smoke test script for deployed getProEphemeris function
 * 
 * Usage:
 *   node scripts/test-deployed.js
 * 
 * Prerequisites:
 *   - Firebase project: aura-2ca80
 *   - Function deployed: getProEphemeris (europe-west3)
 *   - Authenticated user (via Firebase Auth)
 */

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');
const { getAuth, signInAnonymously } = require('firebase/auth');

// Firebase config (replace with your config if needed)
const firebaseConfig = {
  projectId: 'aura-2ca80',
  // Add other config if needed
};

async function testDeployedFunction() {
  console.log('🧪 Testing deployed getProEphemeris function...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const functions = getFunctions(app, 'europe-west3');

    // Sign in anonymously (or use your auth method)
    console.log('1. Authenticating...');
    await signInAnonymously(auth);
    console.log('   ✅ Authenticated\n');

    // Get callable function
    const getProEphemeris = httpsCallable(functions, 'getProEphemeris');

    // Test request (ephemeris dosyaları + cache + path doğrulama için)
    const testRequest = {
      utcISO: '1992-03-30T08:30:00.000Z',
      zodiacSystem: 'tropical',
      bodies: ['Chiron', 'Ceres', 'Pallas'],
      wantSpeed: true,
      debug: true,
    };

    console.log('2. First call (cache miss expected)...');
    console.log('   Request:', JSON.stringify(testRequest, null, 2));
    
    const startTime1 = Date.now();
    const result1 = await getProEphemeris(testRequest);
    const duration1 = Date.now() - startTime1;

    console.log(`   ✅ Response received (${duration1}ms)`);
    console.log('   Response:', JSON.stringify(result1.data, null, 2));
    console.log(`   Cached: ${result1.data.meta.cached}\n`);

    // Second call (cache hit expected)
    console.log('3. Second call (cache hit expected)...');
    
    const startTime2 = Date.now();
    const result2 = await getProEphemeris(testRequest);
    const duration2 = Date.now() - startTime2;

    console.log(`   ✅ Response received (${duration2}ms)`);
    console.log(`   Cached: ${result2.data.meta.cached}`);
    console.log(`   Speed improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%\n`);

    // Validate response
    console.log('4. Validating response...');
    const extras = result2.data.extras;
    const expectedBodies = testRequest.bodies;
    
    for (const body of expectedBodies) {
      if (!extras[body]) {
        console.error(`   ❌ Missing body: ${body}`);
        process.exit(1);
      }
      const data = extras[body];
      if (typeof data.longitudeDeg !== 'number' || data.longitudeDeg < 0 || data.longitudeDeg >= 360) {
        console.error(`   ❌ Invalid longitude for ${body}: ${data.longitudeDeg}`);
        process.exit(1);
      }
      if (data.speedDegPerDay === undefined) {
        console.error(`   ❌ Missing speedDegPerDay for ${body}`);
        process.exit(1);
      }
      console.log(`   ✅ ${body}: ${data.longitudeDeg.toFixed(2)}° (speed: ${data.speedDegPerDay.toFixed(4)}°/day, retrograde: ${data.retrograde || false})`);
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   - First call: ${duration1}ms (cache miss)`);
    console.log(`   - Second call: ${duration2}ms (cache hit)`);
    console.log(`   - Bodies computed: ${Object.keys(extras).length}`);
    console.log(`   - Provider: ${result2.data.meta.provider}`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('   Error:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    process.exit(1);
  }
}

// Run test
testDeployedFunction().catch(console.error);

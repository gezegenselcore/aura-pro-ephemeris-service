/**
 * AURA PRO Ephemeris Service
 * Firebase Callable Function for Chiron + asteroids (Ceres, Pallas, Juno, Vesta)
 * 
 * LICENSE: AGPL-3.0
 * This service uses Swiss Ephemeris (AGPL) and must remain open source.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { ProEphemerisRequestSchema, type ProEphemerisRequest, type ProEphemerisResponse } from './api/types';
import { GetAstroChartRequestSchema } from './api/chartTypes';
import { requireAuth } from './auth/requireAuth';
import { getCached, setCached } from './cache/firestoreCache';
import { getChartCached, setChartCached } from './cache/chartCache';
import { checkRateLimit } from './rateLimit/rateLimit';
import { computeExtras } from './ephemeris/swephProvider';
import { computeFullChart } from './ephemeris/chartSwiss';
import { generateCacheKey, generateChartCacheKey } from './utils/hash';

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  initializeApp();
}

/**
 * getAstroChart - Full chart from Swiss Ephemeris (Sun–Pluto, Chiron+asteroids, ASC/MC, houses).
 * Online modda TÜM hesaplama bu endpoint'ten gelir.
 */
export const getAstroChart = onCall(
  {
    region: process.env.FUNCTION_REGION || 'europe-west3',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (request) => {
    const uid = requireAuth(request);

    let validated: any;
    try {
      validated = GetAstroChartRequestSchema.parse(request.data);
    } catch (err: any) {
      throw new HttpsError('invalid-argument', `Invalid request: ${err?.message || 'validation failed'}`);
    }

    try {
      await checkRateLimit(uid);
    } catch (err: any) {
      if (err instanceof HttpsError && err.code === 'resource-exhausted') throw err;
      console.warn('[getAstroChart] Rate limit check failed:', err?.message);
    }

    const cacheKey = generateChartCacheKey({
      utcISO: validated.utcISO,
      lat: validated.lat,
      lon: validated.lon,
      zodiacSystem: validated.zodiacSystem,
      houseSystem: validated.houseSystem,
      nodeType: validated.nodeType ?? 'mean',
      lilithType: validated.lilithType ?? 'mean',
      wantAspects: validated.wantAspects ?? true,
    });

    const cached = await getChartCached(cacheKey);
    if (cached) {
      if (validated.debug) console.log('[getAstroChart] Cache HIT');
      return cached;
    }

    if (validated.debug) console.log('[getAstroChart] Cache MISS - computing');
    let result;
    try {
      result = await computeFullChart(validated);
    } catch (err: any) {
      throw new HttpsError('unavailable', `Chart computation failed: ${err?.message || 'unknown error'}`);
    }

    setChartCached(cacheKey, result).catch((err) => {
      console.warn('[getAstroChart] Cache write failed:', err?.message);
    });

    if (validated.debug) console.log('[getAstroChart] Swiss Ephemeris chart computed');
    return result;
  }
);

/**
 * getProEphemeris - Callable function for PRO ephemeris calculations
 * 
 * Input: ProEphemerisRequest (validated with Zod)
 * Output: ProEphemerisResponse
 * 
 * Errors:
 * - unauthenticated: Auth required
 * - invalid-argument: Bad input
 * - resource-exhausted: Rate limit exceeded
 * - unavailable: Provider/ephemeris file issue
 */
export const getProEphemeris = onCall(
  {
    // Configure function
    region: process.env.FUNCTION_REGION || 'europe-west3', // Default: Frankfurt (matches GCS bucket)
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB', // Sufficient for ephemeris calculations
  },
  async (request) => {
    // 1. Auth check
    const uid = requireAuth(request);

    // 2. Validate input
    let validatedInput: ProEphemerisRequest;
    try {
      validatedInput = ProEphemerisRequestSchema.parse(request.data);
    } catch (err: any) {
      throw new HttpsError('invalid-argument', `Invalid request: ${err?.message || 'validation failed'}`);
    }

    const { utcISO, zodiacSystem, bodies, wantSpeed, debug } = validatedInput;

    // 3. Rate limit check
    try {
      await checkRateLimit(uid);
    } catch (err: any) {
      if (err instanceof HttpsError && err.code === 'resource-exhausted') {
        throw err; // Re-throw rate limit errors
      }
      // Log other errors but continue (don't block on rate limit failures)
      console.warn('[getProEphemeris] Rate limit check failed:', err?.message);
    }

    // 4. Cache lookup
    const cacheKey = generateCacheKey(utcISO, zodiacSystem, bodies, wantSpeed ?? true);
    const cached = await getCached(cacheKey);

    if (cached) {
      if (debug) {
        console.log(`[getProEphemeris] Cache hit for ${cacheKey}`);
        console.log('[getProEphemeris] Cache durumu: HIT');
      }
      return {
        extras: cached,
        meta: {
          provider: 'swisseph',
          cached: true,
          version: 'v1',
        },
      };
    }

    // 5. Compute (cache miss)
    if (debug) {
      console.log(`[getProEphemeris] Cache miss, computing for ${bodies.length} bodies`);
      console.log('[getProEphemeris] Cache durumu: MISS - ephemeris dosyaları GCS\'den indirilecek');
    }

    let extras: ProEphemerisResponse['extras'];
    try {
      extras = await computeExtras(utcISO, bodies, zodiacSystem, wantSpeed ?? true);
    } catch (err: any) {
      if (err instanceof HttpsError) {
        throw err; // Re-throw HttpsErrors (unavailable, etc.)
      }
      throw new HttpsError('unavailable', `Computation failed: ${err?.message || 'unknown error'}`);
    }

    // 6. Store in cache (non-blocking)
    setCached(cacheKey, extras).catch((err) => {
      console.warn('[getProEphemeris] Cache write failed:', err?.message);
      // Don't throw - cache write failure shouldn't break the response
    });

    // 7. Return result
    if (debug) {
      console.log('[getProEphemeris] Swiss Ephemeris provider aktif - hesaplama tamamlandı');
    }
    return {
      extras,
      meta: {
        provider: 'swisseph',
        cached: false,
        version: 'v1',
      },
    };
  }
);

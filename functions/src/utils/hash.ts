/**
 * Hash utilities for cache keys
 */

import { createHash } from 'crypto';

/**
 * Generate SHA-256 hash for cache key
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate cache document ID from request parameters
 */
export function generateCacheKey(
  utcISO: string,
  zodiacSystem: string,
  bodies: string[],
  wantSpeed: boolean
): string {
  const bodiesSorted = [...bodies].sort().join(',');
  const input = `${utcISO}|${zodiacSystem}|${bodiesSorted}|${wantSpeed}`;
  return sha256(input);
}

/**
 * Generate cache key for getAstroChart
 */
export function generateChartCacheKey(params: {
  utcISO: string;
  lat: number;
  lon: number;
  zodiacSystem: string;
  houseSystem: string;
  nodeType: string;
  lilithType: string;
  wantAspects: boolean;
}): string {
  const input = [
    params.utcISO,
    params.lat.toFixed(6),
    params.lon.toFixed(6),
    params.zodiacSystem,
    params.houseSystem,
    params.nodeType,
    params.lilithType,
    params.wantAspects,
  ].join('|');
  return sha256(input);
}

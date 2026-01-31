/**
 * Firestore cache for getAstroChart
 * TTL: 2 days (balance: accuracy + cost)
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { GetAstroChartResponse } from '../api/chartTypes';

const CACHE_TTL_DAYS = 2;
const COLLECTION_NAME = 'astroChartCache';

interface ChartCacheEntry {
  response: GetAstroChartResponse;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export async function getChartCached(cacheKey: string): Promise<GetAstroChartResponse | null> {
  const db = getFirestore();
  const docRef = db.collection(COLLECTION_NAME).doc(cacheKey);
  const doc = await docRef.get();

  if (!doc.exists) return null;

  const data = doc.data() as ChartCacheEntry;
  const now = Timestamp.now();

  if (data.expiresAt.toMillis() < now.toMillis()) {
    await docRef.delete().catch(() => {});
    return null;
  }

  return data.response;
}

export async function setChartCached(cacheKey: string, response: GetAstroChartResponse): Promise<void> {
  const db = getFirestore();
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const entry: ChartCacheEntry = {
    response: { ...response, meta: { ...response.meta, cached: true } },
    createdAt: now,
    expiresAt,
  };

  await db.collection(COLLECTION_NAME).doc(cacheKey).set(entry);
}

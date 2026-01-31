/**
 * getAstroChart API types
 */

import { z } from 'zod';

export const GetAstroChartRequestSchema = z.object({
  utcISO: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, {
    message: 'utcISO must be ISO 8601 format with Z timezone',
  }),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  zodiacSystem: z.enum(['tropical', 'sidereal_lahiri']),
  houseSystem: z.literal('placidus'),
  nodeType: z.enum(['mean', 'true']).optional().default('mean'),
  lilithType: z.enum(['mean', 'true']).optional().default('mean'),
  wantAspects: z.boolean().optional().default(true),
  debug: z.boolean().optional().default(false),
});

export type GetAstroChartRequest = z.infer<typeof GetAstroChartRequestSchema>;

export interface ChartBodyPosition {
  lonDeg: number;
  latDeg: number;
  distAu?: number;
  speedLonDegPerDay?: number;
  retrograde?: boolean;
}

export interface ChartAngles {
  ascDeg: number;
  mcDeg: number;
  dscDeg: number;
  icDeg: number;
}

export interface ChartAspect {
  a: string;
  b: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orbDeg: number;
  exactDeg: number;
}

export interface GetAstroChartResponse {
  chart: {
    bodies: Record<string, ChartBodyPosition>;
    angles: ChartAngles;
    houses: { cuspsDeg: number[] };
    aspects?: ChartAspect[];
  };
  meta: {
    provider: 'swisseph';
    jdUt: number;
    jdTt: number;
    zodiacSystem: string;
    houseSystem: string;
    nodeType: string;
    lilithType: string;
    cached: boolean;
    version: 'v1';
    /** Present when request.debug === true: ephe path and files for log-free verification */
    debugSnapshot?: {
      ephePathSet: boolean;
      filesPresent: string[];
      jdUt: number;
      jdTt: number;
    };
  };
}

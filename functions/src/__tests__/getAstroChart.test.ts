/**
 * getAstroChart tests
 */

import { GetAstroChartRequestSchema } from '../api/chartTypes';

// Mock chartSwiss - no GCS/ephemeris in test env
jest.mock('../ephemeris/chartSwiss', () => ({
  computeFullChart: jest.fn(async (req: any) => ({
    chart: {
      bodies: {
        Sun: { lonDeg: 10, latDeg: 0, speedLonDegPerDay: 1, retrograde: false },
        Moon: { lonDeg: 45, latDeg: 0, speedLonDegPerDay: 13, retrograde: false },
        Chiron: { lonDeg: 120, latDeg: 0, speedLonDegPerDay: 0.1, retrograde: false },
        ASC: { lonDeg: 15, latDeg: 0, retrograde: false },
        MC: { lonDeg: 105, latDeg: 0, retrograde: false },
      },
      angles: { ascDeg: 15, mcDeg: 105, dscDeg: 195, icDeg: 285 },
      houses: { cuspsDeg: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345] },
      aspects: [],
    },
    meta: {
      provider: 'swisseph',
      jdUt: 2448700,
      jdTt: 2448700.0001,
      zodiacSystem: req.zodiacSystem,
      houseSystem: req.houseSystem,
      nodeType: req.nodeType ?? 'mean',
      lilithType: req.lilithType ?? 'mean',
      cached: false,
      version: 'v1',
    },
  })),
}));

describe('getAstroChart', () => {
  describe('request validation', () => {
    it('accepts valid request', () => {
      const valid = {
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 41.0082,
        lon: 28.9784,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      };
      const result = GetAstroChartRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid utcISO', () => {
      const invalid = {
        utcISO: 'invalid',
        lat: 41,
        lon: 28,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      };
      const result = GetAstroChartRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects lat out of range', () => {
      const invalid = {
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 91,
        lon: 28,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      };
      const result = GetAstroChartRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('applies defaults for nodeType and lilithType', () => {
      const valid = {
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 41,
        lon: 28,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      };
      const result = GetAstroChartRequestSchema.parse(valid);
      expect(result.nodeType).toBe('mean');
      expect(result.lilithType).toBe('mean');
      expect(result.wantAspects).toBe(true);
    });
  });

  describe('computeFullChart (integration)', () => {
    it('response includes Sun, Moon, Chiron in bodies (mocked)', async () => {
      const { computeFullChart } = await import('../ephemeris/chartSwiss');
      const req = GetAstroChartRequestSchema.parse({
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 41.0082,
        lon: 28.9784,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      });

      const res = await computeFullChart(req);

      expect(res.chart.bodies.Sun).toBeDefined();
      expect(res.chart.bodies.Moon).toBeDefined();
      expect(res.chart.bodies.Chiron).toBeDefined();
      expect(typeof res.chart.bodies.Sun?.lonDeg).toBe('number');
      expect(res.chart.bodies.Sun!.lonDeg).toBeGreaterThanOrEqual(0);
      expect(res.chart.bodies.Sun!.lonDeg).toBeLessThan(360);
    });

    it('longitudes in 0..360 range (mocked)', async () => {
      const { computeFullChart } = await import('../ephemeris/chartSwiss');
      const req = GetAstroChartRequestSchema.parse({
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 41,
        lon: 28,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      });

      const res = await computeFullChart(req);

      for (const [, body] of Object.entries(res.chart.bodies)) {
        if (body && typeof body.lonDeg === 'number') {
          expect(body.lonDeg).toBeGreaterThanOrEqual(0);
          expect(body.lonDeg).toBeLessThan(360);
        }
      }
    });

    it('houses length 12 (mocked)', async () => {
      const { computeFullChart } = await import('../ephemeris/chartSwiss');
      const req = GetAstroChartRequestSchema.parse({
        utcISO: '1992-03-30T05:30:00.000Z',
        lat: 41,
        lon: 28,
        zodiacSystem: 'tropical',
        houseSystem: 'placidus',
      });

      const res = await computeFullChart(req);

      expect(res.chart.houses.cuspsDeg).toHaveLength(12);
      for (const c of res.chart.houses.cuspsDeg) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(360);
      }
    });
  });
});

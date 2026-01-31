/**
 * Full chart computation using Swiss Ephemeris
 * Bodies: Sun–Pluto, Chiron, Ceres, Pallas, Juno, Vesta, Node, Lilith; houses; aspects.
 *
 * NOTE: This file uses Swiss Ephemeris (AGPL) and must remain open source.
 */

import * as fs from 'fs';
import { ensureEphemerisFiles } from './swephProvider';
import { dateToJulianDayUT } from '../utils/julian';
import { normalizeAngleDeg, shortestDeltaDeg } from '../utils/angles';
import type { GetAstroChartRequest, GetAstroChartResponse, ChartBodyPosition, ChartAspect } from '../api/chartTypes';

// Swiss Ephemeris body constants (SE_* from swe_const.h)
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;
const SE_MEAN_NODE = 10;
const SE_TRUE_NODE = 11;
const SE_MEAN_APOG = 12; // Mean Lilith
const SE_OSCU_APOG = 13; // True Lilith
const SE_CHIRON = 15;
const SE_CERES = 56;
const SE_PALLAS = 65;
const SE_JUNO = 3; // asteroid Juno (distinct from Venus=3 in some APIs)
const SE_VESTA = 4; // asteroid Vesta (distinct from Mars=4 in some APIs)

const SEFLG_SWIEPH = 256;
const SEFLG_SPEED = 256;
const FLAGS = SEFLG_SWIEPH | SEFLG_SPEED;

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const ORB_SUN_MOON = 8;
const ORB_PLANET = 6;
const ORB_EXTRA = 4;

const BODY_NAMES_MAIN = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;
const EXTRAS_NAMES = ['Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta'] as const;

function norm360(d: number): number {
  let n = d % 360;
  if (n < 0) n += 360;
  return n;
}

export async function computeFullChart(req: GetAstroChartRequest): Promise<GetAstroChartResponse> {
  await ensureEphemerisFiles();

  let sweph: any;
  try {
    sweph = require('sweph');
  } catch (err: any) {
    throw new Error(`Swiss Ephemeris not available: ${err?.message || 'unknown'}`);
  }

  const setEphePath = sweph.setEphePath || sweph.set_ephe_path || sweph.swe_set_ephe_path;
  if (setEphePath) setEphePath('/tmp/se');

  const utcDate = new Date(req.utcISO);
  if (isNaN(utcDate.getTime())) throw new Error('Invalid utcISO');
  const jdUt = dateToJulianDayUT(utcDate);

  let deltaT = 0;
  if (typeof sweph.deltat === 'function') {
    deltaT = sweph.deltat(jdUt) ?? 0;
  } else if (typeof sweph.swe_deltat === 'function') {
    deltaT = sweph.swe_deltat(jdUt) ?? 0;
  }
  const jdTt = jdUt + deltaT / 86400;

  if (req.zodiacSystem === 'sidereal_lahiri') {
    const SIDM_LAHIRI = 1;
    const setSidMode = sweph.setSidMode || sweph.set_sid_mode || sweph.swe_set_sid_mode;
    if (setSidMode) setSidMode(SIDM_LAHIRI, 0, 0);
  }

  if (req.debug) {
    console.log('[chartSwiss] jdUt=', jdUt, 'jdTt=', jdTt, 'deltaT=', deltaT, 'zodiac=', req.zodiacSystem);
  }

  const bodies: Record<string, ChartBodyPosition> = {};
  const bodyIds: { name: string; id: number }[] = [
    { name: 'Sun', id: SE_SUN },
    { name: 'Moon', id: SE_MOON },
    { name: 'Mercury', id: SE_MERCURY },
    { name: 'Venus', id: SE_VENUS },
    { name: 'Mars', id: SE_MARS },
    { name: 'Jupiter', id: SE_JUPITER },
    { name: 'Saturn', id: SE_SATURN },
    { name: 'Uranus', id: SE_URANUS },
    { name: 'Neptune', id: SE_NEPTUNE },
    { name: 'Pluto', id: SE_PLUTO },
    { name: 'NorthNode', id: req.nodeType === 'true' ? SE_TRUE_NODE : SE_MEAN_NODE },
    { name: 'Lilith', id: req.lilithType === 'true' ? SE_OSCU_APOG : SE_MEAN_APOG },
    { name: 'Chiron', id: SE_CHIRON },
    { name: 'Ceres', id: SE_CERES },
    { name: 'Pallas', id: SE_PALLAS },
    { name: 'Juno', id: SE_JUNO },
    { name: 'Vesta', id: SE_VESTA },
  ];

  const calcUt = sweph.calc_ut || sweph.swe_calc_ut;
  if (!calcUt) throw new Error('sweph calc_ut/swe_calc_ut not found');

  for (const { name, id } of bodyIds) {
    try {
      let xx: number[] = [0, 0, 0, 0, 0, 0];
      let ret: number;
      if (calcUt === sweph.calc_ut && typeof sweph.calc_ut === 'function') {
        const res = sweph.calc_ut(jdUt, id, FLAGS);
        if (Array.isArray(res) && res.length >= 4) {
          xx = res;
        } else if (res && typeof res === 'object') {
          xx = [res.longitude ?? res.lon ?? 0, res.latitude ?? res.lat ?? 0, res.distance ?? res.dist ?? 0, res.speedLongitude ?? res.speedLon ?? 0, 0, 0];
        }
      } else {
        ret = sweph.swe_calc_ut(jdUt, id, FLAGS, xx, '');
        if (ret < 0) continue;
      }
      const lon = normalizeAngleDeg(xx[0]);
      const lat = xx[1] ?? 0;
      const dist = xx[2];
      const speedLon = xx[3] ?? 0;
      bodies[name] = {
        lonDeg: Math.round(lon * 10000) / 10000,
        latDeg: Math.round(lat * 10000) / 10000,
        distAu: dist,
        speedLonDegPerDay: Math.round(speedLon * 10000) / 10000,
        retrograde: speedLon < 0,
      };
    } catch (e) {
      if (req.debug) console.warn('[chartSwiss] body', name, e);
    }
  }

  // SouthNode = NorthNode + 180
  if (bodies.NorthNode) {
    bodies.SouthNode = {
      ...bodies.NorthNode,
      lonDeg: norm360(bodies.NorthNode.lonDeg + 180),
    };
  }

  // Houses (Placidus 'P')
  let ascDeg = 0;
  let mcDeg = 0;
  const cuspsDeg: number[] = [];
  const housesEx = sweph.houses_ex || sweph.houses || sweph.swe_houses_ex || sweph.swe_houses;
  if (housesEx) {
    const cusps: number[] = new Array(13).fill(0);
    const ascmc: number[] = new Array(10).fill(0);
    if (typeof sweph.houses_ex === 'function') {
      const ret = sweph.houses_ex(jdUt, req.lat, req.lon, 'P', cusps, ascmc);
      if (ret >= 0) {
        for (let i = 1; i <= 12; i++) cuspsDeg.push(norm360(cusps[i]));
        ascDeg = norm360(ascmc[0]);
        mcDeg = norm360(ascmc[1]);
      }
    } else if (typeof sweph.swe_houses_ex === 'function') {
      const ret = sweph.swe_houses_ex(jdUt, req.lat, req.lon, 'P', cusps, ascmc);
      if (ret >= 0) {
        for (let i = 1; i <= 12; i++) cuspsDeg.push(norm360(cusps[i]));
        ascDeg = norm360(ascmc[0]);
        mcDeg = norm360(ascmc[1]);
      }
    } else if (typeof sweph.houses === 'function') {
      const res = sweph.houses(jdUt, req.lat, req.lon, 'P');
      if (res && res.cusps) {
        for (let i = 1; i <= 12; i++) cuspsDeg.push(norm360(res.cusps[i] ?? 0));
        ascDeg = norm360(res.ascendant ?? res.asc ?? 0);
        mcDeg = norm360(res.mc ?? 0);
      }
    }
  }
  if (cuspsDeg.length !== 12) {
    for (let i = 0; i < 12; i++) cuspsDeg.push((i * 30) % 360);
    ascDeg = cuspsDeg[0] ?? 0;
    mcDeg = (cuspsDeg[9] ?? 270) % 360;
  }
  bodies.ASC = { lonDeg: ascDeg, latDeg: 0, retrograde: false };
  bodies.MC = { lonDeg: mcDeg, latDeg: 0, retrograde: false };
  bodies.DSC = { lonDeg: norm360(ascDeg + 180), latDeg: 0, retrograde: false };
  bodies.IC = { lonDeg: norm360(mcDeg + 180), latDeg: 0, retrograde: false };

  const angles = {
    ascDeg,
    mcDeg,
    dscDeg: norm360(ascDeg + 180),
    icDeg: norm360(mcDeg + 180),
  };

  let aspects: ChartAspect[] = [];
  if (req.wantAspects) {
    const allNames = [...BODY_NAMES_MAIN, ...EXTRAS_NAMES, 'NorthNode', 'SouthNode', 'Lilith'];
    const positions: Record<string, number> = {};
    for (const n of allNames) {
      if (bodies[n] != null) positions[n] = bodies[n].lonDeg;
    }
    const orb = (a: string, b: string): number => {
      if (a === 'Sun' || a === 'Moon' || b === 'Sun' || b === 'Moon') return ORB_SUN_MOON;
      if (EXTRAS_NAMES.includes(a as any) || EXTRAS_NAMES.includes(b as any)) return ORB_EXTRA;
      return ORB_PLANET;
    };
    const keys = Object.keys(positions);
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = keys[i];
        const b = keys[j];
        const angleDiff = Math.abs(shortestDeltaDeg(positions[a], positions[b])); // 0..180
        for (const type of Object.keys(ASPECT_ANGLES)) {
          const exactAngle = ASPECT_ANGLES[type];
          const delta = Math.min(
            Math.abs(angleDiff - exactAngle),
            Math.abs(angleDiff - (360 - exactAngle))
          );
          if (delta <= orb(a, b)) {
            aspects.push({ a, b, type: type as ChartAspect['type'], orbDeg: Math.round(delta * 1000) / 1000, exactDeg: exactAngle });
            break; // one aspect per pair
          }
        }
      }
    }
  }

  const meta: GetAstroChartResponse['meta'] = {
    provider: 'swisseph',
    jdUt,
    jdTt,
    zodiacSystem: req.zodiacSystem,
    houseSystem: req.houseSystem,
    nodeType: req.nodeType ?? 'mean',
    lilithType: req.lilithType ?? 'mean',
    cached: false,
    version: 'v1',
  };
  if (req.debug) {
    const epheDir = '/tmp/se';
    meta.debugSnapshot = {
      ephePathSet: true,
      filesPresent: fs.existsSync(epheDir) ? fs.readdirSync(epheDir) : [],
      jdUt,
      jdTt,
    };
  }

  return {
    chart: {
      bodies,
      angles,
      houses: { cuspsDeg },
      aspects: aspects.length ? aspects : undefined,
    },
    meta,
  };
}

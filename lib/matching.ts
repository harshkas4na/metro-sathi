import { allStations, MetroLine } from "@/lib/metro-data";

/**
 * Build a map: stationName -> { line, index }[]
 * Each station can appear on multiple lines (interchange).
 */
function buildStationIndex() {
  const index: Record<string, { line: MetroLine; seqIndex: number }[]> = {};
  for (const s of allStations) {
    if (!index[s.name]) index[s.name] = [];
    index[s.name].push({ line: s.line, seqIndex: s.sequenceIndex });
  }
  return index;
}

const stationIndex = buildStationIndex();

/**
 * Get the minimum station distance between two stations across all shared lines.
 * Returns Infinity if they share no line.
 */
export function getMinStationDistance(
  station1: string,
  station2: string
): number {
  const entries1 = stationIndex[station1];
  const entries2 = stationIndex[station2];
  if (!entries1 || !entries2) return Infinity;

  let minDist = Infinity;
  for (const e1 of entries1) {
    for (const e2 of entries2) {
      if (e1.line === e2.line) {
        const dist = Math.abs(e1.seqIndex - e2.seqIndex);
        if (dist < minDist) minDist = dist;
      }
    }
  }
  return minDist;
}

/**
 * Check if two stations are within N stations of each other on any shared line.
 */
export function isWithinStations(
  station1: string,
  station2: string,
  maxDistance: number
): boolean {
  return getMinStationDistance(station1, station2) <= maxDistance;
}

/**
 * Get time difference in minutes between two time strings (HH:MM format).
 */
export function getTimeDiffMinutes(time1: string, time2: string): number {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  return Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
}

/**
 * Calculate match quality description.
 */
export function getMatchQuality(
  searchStart: string,
  searchEnd: string,
  tripStart: string,
  tripEnd: string
): { startDist: number; endDist: number; label: string } {
  const startDist = getMinStationDistance(searchStart, tripStart);
  const endDist = getMinStationDistance(searchEnd, tripEnd);

  if (startDist === 0 && endDist === 0) {
    return { startDist, endDist, label: "Exact route match" };
  }

  const maxDist = Math.max(
    startDist === Infinity ? 0 : startDist,
    endDist === Infinity ? 0 : endDist
  );
  return { startDist, endDist, label: `±${maxDist} station${maxDist !== 1 ? "s" : ""}` };
}

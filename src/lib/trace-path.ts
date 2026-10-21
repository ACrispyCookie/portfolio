// Geometry of the copper trace (spec §7.3): from the start point, two 16px bends onto the rail, then down past every pad.
export interface TraceInput { railX: number; start: { x: number; y: number } | null; turnY: number; pads: number[] }
export interface TracePath { d: string; padYs: number[]; vias: { x: number; y: number }[] }

const R = 16;
const VIA_DX = 14;
const VIA_DY = 22;

export function buildTracePath({ railX, start, turnY, pads }: TraceInput): TracePath {
  let d: string;
  if (start && start.x > railX + 30) {
    const { x, y } = start;
    d = `M${x} ${y} V${turnY - R} Q${x} ${turnY} ${x - R} ${turnY} H${railX + R} Q${railX} ${turnY} ${railX} ${turnY + R}`;
  } else {
    d = `M${railX} ${start ? start.y : pads[0] - 40}`;
  }
  d += ` V${pads[pads.length - 1]}`;
  const vias = pads.flatMap((y) => [{ x: railX + VIA_DX, y: y - VIA_DY }, { x: railX + VIA_DX, y: y + VIA_DY }]);
  return { d, padYs: [...pads], vias };
}

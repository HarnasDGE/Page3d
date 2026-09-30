import {
  BASKETBALL_HOOPS,
  buildings,
  facadePoint,
  facingRotation,
  VENDING_MACHINE,
} from '@/scene/world/cityLayout';

/** Where cans lie around when the district loads (world x, z). */
export const INITIAL_CANS: [number, number][] = [
  [6, 5],
  [-7, 3],
  [4, -9],
  [-9.6, 9],
  [-8.8, 11.8],
  [1.5, -30],
  [-3, -48],
  [30, 2],
  [48, -3],
  [-2, 34],
  [-26, -2],
];

/** Cans are culled (oldest first) above this count to keep physics cheap. */
export const MAX_CANS = { high: 22, low: 12 } as const;

/** The broken electrical box hangs on a decorative building in About Street. */
const BOX_BUILDING = buildings.find((building) => building.id === 'about-r0')!;
const BOX_ALONG_FACADE = 5.4;

export const ELECTRICAL_BOX = {
  ...facadePoint(BOX_BUILDING, BOX_ALONG_FACADE, 0.25),
  y: 1.6,
  rotationY: facingRotation(BOX_BUILDING),
  /** Player spot in front of the box. */
  spot: facadePoint(BOX_BUILDING, BOX_ALONG_FACADE, 1.4),
  /** Close-up camera for the wiring puzzle. */
  camera: facadePoint(BOX_BUILDING, BOX_ALONG_FACADE, 2.4),
} as const;

/** Unit vector a plaza prop faces (towards the plaza centre). */
const facing = (rotationY: number) => ({ x: Math.sin(rotationY), z: Math.cos(rotationY) });

/** Horizontal distance from the pole to the backboard and to the rim centre. */
export const HOOP_BOARD_OFFSET = 0.35;
export const HOOP_RIM_OFFSET = 0.85;
export const HOOP_RIM_RADIUS = 0.45;
export const HOOP_RIM_HEIGHT = 3.05;

/** Every hoop with its rim centre in world space. */
export const HOOPS = BASKETBALL_HOOPS.map((hoop) => {
  const direction = facing(hoop.rotationY);
  return {
    ...hoop,
    rim: {
      x: hoop.x + direction.x * HOOP_RIM_OFFSET,
      y: HOOP_RIM_HEIGHT,
      z: hoop.z + direction.z * HOOP_RIM_OFFSET,
    },
  };
});

export type Hoop = (typeof HOOPS)[number];

/** Closest hoop to a point on the ground, with its horizontal distance to the rim. */
export function nearestHoop(x: number, z: number) {
  let best: { hoop: Hoop; distance: number } | null = null;
  for (const hoop of HOOPS) {
    const distance = Math.hypot(x - hoop.rim.x, z - hoop.rim.z);
    if (!best || distance < best.distance) best = { hoop, distance };
  }
  return best!;
}

/** Throws aimed within this radius of a rim are steered into it. */
export const HOOP_ASSIST_RADIUS = 1.6;
/** The Throw button / F key aims at a hoop this close to the android. */
export const HOOP_AUTO_AIM_RANGE = 14;

const vendingFacing = facing(VENDING_MACHINE.rotationY);
export const VENDING = {
  ...VENDING_MACHINE,
  facing: vendingFacing,
  spot: { x: VENDING_MACHINE.x + vendingFacing.x * 1.5, z: VENDING_MACHINE.z + vendingFacing.z * 1.5 },
  tray: { x: VENDING_MACHINE.x + vendingFacing.x * 0.6, y: 0.45, z: VENDING_MACHINE.z + vendingFacing.z * 0.6 },
} as const;

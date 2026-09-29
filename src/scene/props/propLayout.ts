import {
  BASKETBALL_HOOP,
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

const hoopFacing = facing(BASKETBALL_HOOP.rotationY);
/** Horizontal distance from the pole to the backboard and to the rim centre. */
export const HOOP_BOARD_OFFSET = 0.35;
export const HOOP_RIM_OFFSET = 0.85;
export const HOOP_RIM_RADIUS = 0.45;
export const HOOP_RIM = {
  x: BASKETBALL_HOOP.x + hoopFacing.x * HOOP_RIM_OFFSET,
  y: 3.05,
  z: BASKETBALL_HOOP.z + hoopFacing.z * HOOP_RIM_OFFSET,
} as const;
/** Throws aimed within this radius of the rim are steered into it. */
export const HOOP_ASSIST_RADIUS = 1.6;

const vendingFacing = facing(VENDING_MACHINE.rotationY);
export const VENDING = {
  ...VENDING_MACHINE,
  facing: vendingFacing,
  spot: { x: VENDING_MACHINE.x + vendingFacing.x * 1.5, z: VENDING_MACHINE.z + vendingFacing.z * 1.5 },
  tray: { x: VENDING_MACHINE.x + vendingFacing.x * 0.6, y: 0.45, z: VENDING_MACHINE.z + vendingFacing.z * 0.6 },
} as const;

import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier';
import {
  BRAND_BILLBOARD,
  buildings,
  PLAZA_HALF_SIZE,
  STREET_HALF_WIDTH,
  STREET_LENGTH,
  STREET_ROTATION,
  streets,
} from '@/scene/world/cityLayout';
import { LAMP_X, LAMP_Z } from '@/scene/world/StreetDecor';

const WALL_HALF_HEIGHT = 5;
const WALL_HALF_THICKNESS = 0.1;
const STREET_CENTER_Z = -PLAZA_HALF_SIZE - STREET_LENGTH / 2;
/** Plaza edge segments between two street openings (local street space). */
const PLAZA_EDGE_HALF = (PLAZA_HALF_SIZE - STREET_HALF_WIDTH) / 2;
const PLAZA_EDGE_X = STREET_HALF_WIDTH + PLAZA_EDGE_HALF;

/**
 * Static physics world mirroring the city: ground, buildings, invisible walls
 * that keep thrown items inside the streets, lamp posts and the billboard.
 */
export function WorldColliders() {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[200, 0.5, 200]} position={[0, -0.5, 0]} friction={0.9} />
        {buildings.map((building) => (
          <CuboidCollider
            key={building.id}
            args={[building.width / 2, building.height / 2, building.depth / 2]}
            position={[building.x, building.height / 2, building.z]}
          />
        ))}
        {/* Plaza hologram pedestal. */}
        <CylinderCollider args={[0.4, 2]} position={[0, 0.4, 0]} />
      </RigidBody>

      {streets.map((street) => (
        <RigidBody key={street.id} type="fixed" colliders={false} rotation={[0, STREET_ROTATION[street.id], 0]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <CuboidCollider
                args={[WALL_HALF_THICKNESS, WALL_HALF_HEIGHT, STREET_LENGTH / 2]}
                position={[side * (STREET_HALF_WIDTH + WALL_HALF_THICKNESS), WALL_HALF_HEIGHT, STREET_CENTER_Z]}
              />
              <CuboidCollider
                args={[PLAZA_EDGE_HALF, WALL_HALF_HEIGHT, WALL_HALF_THICKNESS]}
                position={[side * PLAZA_EDGE_X, WALL_HALF_HEIGHT, -PLAZA_HALF_SIZE - WALL_HALF_THICKNESS]}
              />
              {LAMP_Z.map((z) => (
                <CylinderCollider key={z} args={[3, 0.1]} position={[side * LAMP_X, 3, z]} />
              ))}
            </group>
          ))}
        </RigidBody>
      ))}

      <RigidBody
        type="fixed"
        colliders={false}
        position={[BRAND_BILLBOARD.x, 0, BRAND_BILLBOARD.z]}
        rotation={[0, BRAND_BILLBOARD.rotationY, 0]}
      >
        <CuboidCollider args={[3.7, 2, 0.15]} position={[0, 5.6, 0]} />
        {[-1, 1].map((side) => (
          <CylinderCollider key={side} args={[1.8, 0.18]} position={[side * BRAND_BILLBOARD.legOffset, 1.8, 0]} />
        ))}
      </RigidBody>
    </>
  );
}

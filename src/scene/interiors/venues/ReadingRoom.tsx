import { Text } from '@react-three/drei';
import { formatDate } from '@/lib/format';
import { FONTS } from '@/scene/fonts';
import { requestInteraction } from '@/scene/interaction/interactables';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { useContentStore } from '@/scene/store/contentStore';
import { useGameStore } from '@/scene/store/gameStore';
import { onTap } from '@/scene/world/events';
import type { BlogPost } from '@/types/blog';
import { FramedImage } from '../components/FramedImage';
import { HoloPanel, PanelText } from '../components/HoloPanel';
import { Pedestal } from '../components/Pedestal';
import { ROOM, TERMINAL_HALF_SIZE, TERMINAL_SLOTS, WALLS } from '../roomLayout';

const SCREEN_WIDTH = 2.1;
const SCREEN_HEIGHT = 1.45;

function Terminal({ post, x, z, accent }: { post: BlogPost; x: number; z: number; accent: string }) {
  const id = `post:${post.slug}`;
  const openPanel = useGameStore((state) => state.openPanel);
  const isNearby = useGameStore((state) => state.nearbyId === id);

  useInteractable({
    id,
    label: `Read “${post.title}”`,
    spot: { x, z: z + TERMINAL_HALF_SIZE.z + 1 },
    radius: 1.2,
    activate: () => openPanel({ kind: 'post', slug: post.slug }),
  });

  return (
    <group
      position={[x, 0, z]}
      onClick={onTap(() => requestInteraction(id, useGameStore.getState().nearbyId))}
    >
      <mesh position-y={0.55}>
        <boxGeometry args={[TERMINAL_HALF_SIZE.x * 2, 1.1, TERMINAL_HALF_SIZE.z * 2]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, TERMINAL_HALF_SIZE.z + 0.01]}>
        <boxGeometry args={[TERMINAL_HALF_SIZE.x * 2, 0.05, 0.02]} />
        <meshBasicMaterial color={neon(accent, isNearby ? 3 : 1.6)} toneMapped={false} />
      </mesh>

      {post.cover && (
        <FramedImage url={post.cover} position={[0, 3.45, -0.2]} width={1.9} height={1.07} accent={accent} />
      )}

      {/* Tilted screen */}
      <group position={[0, 2, 0]} rotation-x={-0.18}>
        <mesh>
          <boxGeometry args={[SCREEN_WIDTH + 0.1, SCREEN_HEIGHT + 0.1, 0.08]} />
          <meshStandardMaterial color="#0d0b1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position-z={0.045}>
          <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          <meshBasicMaterial color={isNearby ? '#1a1406' : '#0b0a14'} />
        </mesh>
        <group position={[-SCREEN_WIDTH / 2 + 0.12, SCREEN_HEIGHT / 2 - 0.12, 0.05]}>
          <PanelText font="display" size={0.11} color={accent} glow={2}>
            {`${formatDate(post.date).toUpperCase()}  /  ${post.readingMinutes} MIN`}
          </PanelText>
          <PanelText y={-0.22} size={0.19} maxWidth={SCREEN_WIDTH - 0.24}>
            {post.title}
          </PanelText>
          <PanelText y={-1.02} font="display" size={0.12} color={accent} glow={isNearby ? 3 : 1.8}>
            {'> READ POST'}
          </PanelText>
        </group>
      </group>
    </group>
  );
}

/** Floating open book above the reading room pedestal. */
function BookHologram({ accent }: { accent: string }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position-x={side * 0.42} rotation-y={side * 0.35}>
          <boxGeometry args={[0.8, 1.05, 0.03, 1, 4, 1]} />
          <meshBasicMaterial color={neon(accent, 2)} wireframe toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function ReadingRoom({ accent }: { accent: string }) {
  const posts = useContentStore((state) => state.posts);
  const tags = [...new Set(posts.flatMap((post) => post.tags))];

  return (
    <group>
      <Pedestal accent={accent}>
        <BookHologram accent={accent} />
      </Pedestal>

      <Text
        font={FONTS.display}
        position={[0, ROOM.height - 1.2, WALLS.back.z + 0.02]}
        fontSize={0.45}
        letterSpacing={0.2}
        anchorX="center"
        anchorY="middle"
      >
        LATEST TRANSMISSIONS
        <meshBasicMaterial color={neon(accent, 2.4)} toneMapped={false} />
      </Text>

      {posts.slice(0, TERMINAL_SLOTS.length).map((post, i) => (
        <Terminal key={post.slug} post={post} x={TERMINAL_SLOTS[i].x} z={TERMINAL_SLOTS[i].z} accent={accent} />
      ))}

      <HoloPanel
        position={[WALLS.left.x, 3, WALLS.left.z]}
        rotationY={WALLS.left.rotationY}
        width={8}
        height={3.2}
        accent={accent}
        title="TOPICS"
      >
        <PanelText size={0.36} maxWidth={7}>
          {tags.map((tag) => `#${tag}`).join('   ')}
        </PanelText>
      </HoloPanel>

      <HoloPanel
        position={[WALLS.right.x, 3, WALLS.right.z]}
        rotationY={WALLS.right.rotationY}
        width={8}
        height={3.2}
        accent={accent}
        title="THE BLOG"
      >
        <PanelText size={0.34} maxWidth={7}>
          Notes on building fast websites, web performance and creative front-end work. Walk up to a terminal to read a post.
        </PanelText>
      </HoloPanel>
    </group>
  );
}

import { useMemo } from 'react';
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
import { POSTS_PER_PAGE, type BlogCategory } from '@/data/blogCategories';
import { floorCount } from '@/scene/interaction/readingRoom';
import { ChannelLetters } from '@/scene/world/signs/ChannelLetters';
import { FramedImage } from '../components/FramedImage';
import { PanelText } from '../components/HoloPanel';
import { Pedestal } from '../components/Pedestal';
import { Stairs } from '../components/Stairs';
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

interface ReadingRoomProps {
  category: BlogCategory;
  /** 0-based floor; each floor shows the next page of articles. */
  floor: number;
}

/** A category's reading room: four articles per floor, stairs to the other pages. */
export function ReadingRoom({ category, floor }: ReadingRoomProps) {
  const { accent } = category;
  const allPosts = useContentStore((state) => state.posts);
  const posts = useMemo(() => allPosts.filter((post) => post.category === category.slug), [allPosts, category.slug]);
  const pages = floorCount(posts.length);
  const pagePosts = posts.slice(floor * POSTS_PER_PAGE, (floor + 1) * POSTS_PER_PAGE);

  return (
    <group>
      <Pedestal accent={accent}>
        <BookHologram accent={accent} />
      </Pedestal>

      {/* Category header on the back wall, extruded like the street signs. */}
      <group position={[0, ROOM.height - 1.15, WALLS.back.z + 0.05]}>
        <ChannelLetters text={category.sign} size={0.5} depth={0.1} accent={accent} />
      </group>
      <Text
        font={FONTS.body}
        position={[0, ROOM.height - 1.95, WALLS.back.z + 0.02]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {`${category.description}   Page ${floor + 1} of ${pages}`}
        <meshBasicMaterial color={neon('#e6e3ff', 1.2)} toneMapped={false} />
      </Text>

      {pagePosts.map((post, i) => (
        <Terminal key={post.slug} post={post} x={TERMINAL_SLOTS[i].x} z={TERMINAL_SLOTS[i].z} accent={accent} />
      ))}

      {floor < pages - 1 && <Stairs direction="up" targetPage={floor + 2} accent={accent} />}
      {floor > 0 && <Stairs direction="down" targetPage={floor} accent={accent} />}
    </group>
  );
}

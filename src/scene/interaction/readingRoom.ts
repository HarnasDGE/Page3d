import { POSTS_PER_PAGE } from '@/data/blogCategories';
import { useContentStore } from '@/scene/store/contentStore';
import type { BlogPost } from '@/types/blog';

/** Posts of one category, in display order. */
export function categoryPosts(category: string | undefined): BlogPost[] {
  return useContentStore.getState().posts.filter((post) => post.category === category);
}

export const floorCount = (postCount: number) => Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE));

/** Which staircases a reading room floor has. */
export function floorStairs(category: string | undefined, floor: number) {
  const floors = floorCount(categoryPosts(category).length);
  return { up: floor < floors - 1, down: floor > 0 };
}

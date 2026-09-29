import { create } from 'zustand';
import type { BlogPost } from '@/types/blog';

interface ContentState {
  posts: BlogPost[];
  setPosts: (posts: BlogPost[]) => void;
}

/** Content rendered by Astro at build time and passed into the island. */
export const useContentStore = create<ContentState>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
}));

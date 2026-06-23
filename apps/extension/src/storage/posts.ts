import { db } from './db';
import type { HiringPost } from '../types';

export async function getPosts(): Promise<HiringPost[]> {
  return db.posts.orderBy('savedAt').reverse().toArray();
}

export async function getPostById(id: string): Promise<HiringPost | undefined> {
  return db.posts.get(id);
}

export async function savePost(post: HiringPost): Promise<{ id: string; status: 'created' | 'updated' }> {
  // Find duplicates matching url
  const existing = await db.posts
    .where('url').equals(post.url.trim())
    .first();

  if (existing) {
    const updatedPost: HiringPost = {
      ...existing,
      ...post,
      id: existing.id,
      tags: Array.from(new Set([...existing.tags, ...post.tags])),
      content: post.content || existing.content,
      savedAt: existing.savedAt
    };
    await db.posts.put(updatedPost);
    return { id: existing.id, status: 'updated' };
  } else {
    if (!post.id) {
      post.id = crypto.randomUUID();
    }
    await db.posts.add(post);
    return { id: post.id, status: 'created' };
  }
}

export async function updatePost(id: string, updates: Partial<HiringPost>): Promise<void> {
  await db.posts.update(id, updates);
}

export async function deletePost(id: string): Promise<void> {
  await db.posts.delete(id);
}

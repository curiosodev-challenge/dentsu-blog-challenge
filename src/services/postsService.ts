import { fetchJson } from './api'
import type { ApiPostResponse, Post } from '../types/blog'

export async function getPosts(): Promise<ApiPostResponse[]> {
  return fetchJson<ApiPostResponse[]>('/posts')
}

export async function getPost(postId: string): Promise<ApiPostResponse> {
  return fetchJson<ApiPostResponse>(`/posts/${postId}`)
}

export function normalizePost(apiPost: ApiPostResponse): Post {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    thumbnailUrl: apiPost.thumbnail_url,
    authorId: apiPost.authorId,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
  }
}

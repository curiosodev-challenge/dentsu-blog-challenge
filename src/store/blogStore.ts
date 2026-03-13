import { create } from 'zustand'
import type { Author, Category, Post } from '../types/blog'

type EntityMap<T> = Record<string, T>
type CategoriesByPostId = Record<string, string[]>

interface BlogStoreState {
  postsById: EntityMap<Post>
  postIds: string[]
  hasLoadedPostsList: boolean
  authorsById: EntityMap<Author>
  categoriesById: EntityMap<Category>
  categoriesByPostId: CategoriesByPostId
  selectedPostId: string | null
  isLoadingPosts: boolean
  isLoadingPost: boolean
  postsError: string | null
  postError: string | null
  setPosts: (posts: Post[]) => void
  upsertPost: (post: Post) => void
  setAuthors: (authors: Author[]) => void
  setCategories: (categories: Category[]) => void
  setCategoriesForPost: (postId: string, categories: Category[]) => void
  setSelectedPostId: (postId: string | null) => void
  setPostsLoading: (loading: boolean) => void
  setPostLoading: (loading: boolean) => void
  setPostsError: (error: string | null) => void
  setPostError: (error: string | null) => void
}

function dedupeIds(values: string[]): string[] {
  return [...new Set(values)]
}

export const useBlogStore = create<BlogStoreState>((set) => ({
  postsById: {},
  postIds: [],
  hasLoadedPostsList: false,
  authorsById: {},
  categoriesById: {},
  categoriesByPostId: {},
  selectedPostId: null,
  isLoadingPosts: false,
  isLoadingPost: false,
  postsError: null,
  postError: null,
  
  setPosts: (posts) =>
    set((state) => {
      const nextPostsById = { ...state.postsById }

      for (const post of posts) {
        nextPostsById[post.id] = {
          ...nextPostsById[post.id],
          ...post,
        }
      }

      return {
        postsById: nextPostsById,
        postIds: dedupeIds(posts.map((post) => post.id)),
        hasLoadedPostsList: true,
      }
    }),

  upsertPost: (post) =>
    set((state) => ({
      postsById: {
        ...state.postsById,
        [post.id]: {
          ...state.postsById[post.id],
          ...post,
        },
      },
      postIds: state.postIds.includes(post.id)
        ? state.postIds
        : [post.id, ...state.postIds],
    })),

  setAuthors: (authors) =>
    set((state) => {
      const nextAuthorsById = { ...state.authorsById }

      for (const author of authors) {
        nextAuthorsById[author.id] = author
      }

      return { authorsById: nextAuthorsById }
    }),

  setCategories: (categories) =>
    set((state) => {
      const nextCategoriesById = { ...state.categoriesById }
      const nextCategoriesByPostId = { ...state.categoriesByPostId }

      for (const category of categories) {
        nextCategoriesById[category.id] = category

        if (!category.postId) {
          continue
        }

        const currentIds = nextCategoriesByPostId[category.postId] ?? []
        nextCategoriesByPostId[category.postId] = dedupeIds([
          ...currentIds,
          category.id,
        ])
      }

      return {
        categoriesById: nextCategoriesById,
        categoriesByPostId: nextCategoriesByPostId,
      }
    }),

  setCategoriesForPost: (postId, categories) =>
    set((state) => {
      const nextCategoriesById = { ...state.categoriesById }

      for (const category of categories) {
        nextCategoriesById[category.id] = category
      }

      return {
        categoriesById: nextCategoriesById,
        categoriesByPostId: {
          ...state.categoriesByPostId,
          [postId]: dedupeIds(categories.map((category) => category.id)),
        },
      }
    }),

  setSelectedPostId: (selectedPostId) => set({ selectedPostId }),

  setPostsLoading: (isLoadingPosts) => set({ isLoadingPosts }),

  setPostLoading: (isLoadingPost) => set({ isLoadingPost }),

  setPostsError: (postsError) => set({ postsError }),

  setPostError: (postError) => set({ postError }),
}))

import type { ApiPostResponse, Author, Category, Post } from '../../types/blog'

export const authorsFixture: Author[] = [
  {
    id: 'author-1',
    name: 'Ada Lovelace',
    profilePicture: 'https://images.example.com/ada.png',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-02T10:00:00.000Z',
  },
  {
    id: 'author-2',
    name: 'Grace Hopper',
    profilePicture: 'https://images.example.com/grace.png',
    createdAt: '2025-01-03T10:00:00.000Z',
    updatedAt: '2025-01-04T10:00:00.000Z',
  },
]

export const categoriesFixture: Category[] = [
  {
    id: 'cat-1',
    name: 'Frontend',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-02T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Testing',
    createdAt: '2025-01-03T10:00:00.000Z',
    updatedAt: '2025-01-04T10:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Culture',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-06T10:00:00.000Z',
  },
]

export const postsFixture: Post[] = [
  {
    id: 'post-1',
    title: 'Unit Testing React Components',
    content: 'Render from the user perspective.',
    thumbnailUrl: 'https://images.example.com/post-1.png',
    authorId: 'author-1',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Store Patterns That Scale',
    content: 'Model state transitions explicitly.',
    thumbnailUrl: 'https://images.example.com/post-2.png',
    authorId: 'author-2',
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
  },
]

export const apiPostsFixture: ApiPostResponse[] = [
  {
    id: 'post-1',
    title: 'Unit Testing React Components',
    content: 'Render from the user perspective.',
    thumbnail_url: 'https://images.example.com/post-1.png',
    authorId: 'author-1',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
    author: authorsFixture[0],
    categories: [
      {
        ...categoriesFixture[0],
      },
      {
        ...categoriesFixture[1],
      },
    ],
  },
  {
    id: 'post-2',
    title: 'Store Patterns That Scale',
    content: 'Model state transitions explicitly.',
    thumbnail_url: 'https://images.example.com/post-2.png',
    authorId: 'author-2',
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T12:00:00.000Z',
    author: authorsFixture[1],
    categories: [
      {
        ...categoriesFixture[1],
      },
      {
        ...categoriesFixture[2],
      },
    ],
  },
]

export const apiPostDetailFixture: ApiPostResponse = {
  id: 'post-3',
  title: 'Designing Better Hook APIs',
  content: 'Expose clear contracts.\nAvoid leaking implementation details.',
  thumbnail_url: 'https://images.example.com/post-3.png',
  authorId: 'author-1',
  createdAt: '2026-03-03T10:00:00.000Z',
  updatedAt: '2026-03-03T12:00:00.000Z',
  author: authorsFixture[0],
  categories: [
    {
      id: 'cat-4',
      name: 'Hooks',
      createdAt: '2025-01-07T10:00:00.000Z',
      updatedAt: '2025-01-08T10:00:00.000Z',
    },
  ],
}

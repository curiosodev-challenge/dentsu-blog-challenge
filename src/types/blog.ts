export interface Author {
  id: string
  name: string
  profilePicture: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  postId?: string
}

export interface Post {
  id: string
  title: string
  content: string
  thumbnailUrl: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface ApiPostResponse {
  id: string
  title: string
  content: string
  thumbnail_url: string
  authorId: string
  createdAt: string
  updatedAt: string
  author?: Author
  categories?: Category[]
}

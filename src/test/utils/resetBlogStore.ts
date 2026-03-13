import { useBlogStore } from '../../store/blogStore'

export function resetBlogStore() {
  useBlogStore.setState({
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
  })
}

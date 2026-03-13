import { useEffect } from 'react'
import { BlogList } from './pages/BlogList/BlogList'
import { BlogPost } from './pages/BlogPost/BlogPost'
import { useThemeMode } from './hooks/useThemeMode'
import { useBlogStore } from './store/blogStore'
import styles from './App.module.css'

function App() {
  const selectedPostId = useBlogStore((state) => state.selectedPostId)
  const setSelectedPostId = useBlogStore((state) => state.setSelectedPostId)
  const { isDarkMode, toggleThemeMode } = useThemeMode()

  useEffect(() => {
    const url = new URL(window.location.href)
    const initialPostId = url.searchParams.get('post')

    if (initialPostId) {
      setSelectedPostId(initialPostId)
    }

    const onPopState = () => {
      const updatedUrl = new URL(window.location.href)
      const postIdFromUrl = updatedUrl.searchParams.get('post')
      setSelectedPostId(postIdFromUrl)
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [setSelectedPostId])

  useEffect(() => {
    const url = new URL(window.location.href)
    const currentPostId = url.searchParams.get('post')

    if (selectedPostId) {
      if (currentPostId === selectedPostId) {
        return
      }

      url.searchParams.set('post', selectedPostId)
    } else if (currentPostId) {
      url.searchParams.delete('post')
    } else {
      return
    }

    const nextSearch = url.searchParams.toString()
    const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}`

    window.history.pushState({}, '', nextUrl)
  }, [selectedPostId])

  return (
    <main className={styles.appShell}>
      <div className={styles.content}>
        {selectedPostId ? (
          <BlogPost
            postId={selectedPostId}
            onBack={() => setSelectedPostId(null)}
            onSelectPost={setSelectedPostId}
          />
        ) : (
          <BlogList onSelectPost={setSelectedPostId} />
        )}
      </div>

      <footer className={styles.footerRow}>
        <button
          type="button"
          className={styles.themeToggle}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleThemeMode}
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
        </button>
      </footer>
    </main>
  )
}

export default App

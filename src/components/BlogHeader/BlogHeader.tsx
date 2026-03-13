import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './BlogHeader.module.css'

interface SearchOption {
  id: string
  label: string
}

interface BlogHeaderProps {
  onLogoClick?: () => void
  searchValue?: string
  onSearchValueChange?: (value: string) => void
  onSearchSubmit?: (value: string) => void
  searchOptions?: SearchOption[]
}

export function BlogHeader({
  onLogoClick,
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
  searchOptions = [],
}: BlogHeaderProps) {
  const [localSearchValue, setLocalSearchValue] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDesktopAutocompleteOpen, setIsDesktopAutocompleteOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const mobileSearchToggleRef = useRef<HTMLButtonElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const currentSearchValue = searchValue ?? localSearchValue
  const updateSearchValue = onSearchValueChange ?? setLocalSearchValue

  const isDesktopViewport = useCallback(
    () => window.matchMedia('(min-width: 40rem)').matches,
    [],
  )

  const closeMobileSearch = useCallback((shouldFocusToggle = false) => {
    setIsMobileSearchOpen(false)

    if (shouldFocusToggle) {
      mobileSearchToggleRef.current?.focus()
    }
  }, [])

  const visibleOptions = useMemo(() => {
    const normalized = currentSearchValue.trim().toLowerCase()

    if (!normalized) {
      return searchOptions.slice(0, 12)
    }

    return searchOptions
      .filter((option) => option.label.toLowerCase().includes(normalized))
      .slice(0, 12)
  }, [currentSearchValue, searchOptions])

  useEffect(() => {
    if (!isMobileSearchOpen && !isDesktopAutocompleteOpen) {
      return
    }

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null

      if (headerRef.current && target && !headerRef.current.contains(target)) {
        if (isMobileSearchOpen) {
          closeMobileSearch()
        }

        if (isDesktopAutocompleteOpen) {
          setIsDesktopAutocompleteOpen(false)
        }
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (isMobileSearchOpen) {
        closeMobileSearch(true)
        return
      }

      if (isDesktopAutocompleteOpen) {
        setIsDesktopAutocompleteOpen(false)
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [closeMobileSearch, isDesktopAutocompleteOpen, isMobileSearchOpen])

  useEffect(() => {
    if (!isMobileSearchOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    if (!isMobileSearchOpen) {
      return
    }

    const desktopQuery = window.matchMedia('(min-width: 40rem)')

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMobileSearch()
      }
    }

    desktopQuery.addEventListener('change', handleViewportChange)

    return () => {
      desktopQuery.removeEventListener('change', handleViewportChange)
    }
  }, [closeMobileSearch, isMobileSearchOpen])

  const submitSearch = (value: string) => {
    if (onSearchSubmit) {
      onSearchSubmit(value)
    }

    setIsDesktopAutocompleteOpen(false)

    if (isMobileSearchOpen) {
      closeMobileSearch()
    }
  }

  const handleSearchInputChange = (value: string) => {
    updateSearchValue(value)

    if (!isMobileSearchOpen && isDesktopViewport()) {
      setIsDesktopAutocompleteOpen(true)
    }
  }

  const handleSearchInputFocus = () => {
    if (!isMobileSearchOpen && isDesktopViewport()) {
      setIsDesktopAutocompleteOpen(true)
    }
  }

  const openMobileSearch = () => {
    setIsDesktopAutocompleteOpen(false)
    setIsMobileSearchOpen(true)
  }

  const postsHref =
    typeof window === 'undefined' ? '/' : window.location.pathname

  return (
    <header
      ref={headerRef}
      className={
        isMobileSearchOpen
          ? `${styles.header} ${styles.headerMobileSearchOpen}`
          : styles.header
      }
    >
      <a
        className={styles.brandBlock}
        href={postsHref}
        aria-label="Go to posts page"
        onClick={(event) => {
          if (!onLogoClick) {
            return
          }

          event.preventDefault()
          onLogoClick()
        }}
      >
        <img
          className={styles.brandLogo}
          src="/dws_dentsu_icon.png"
          alt="Dentsu logo"
        />
        <span className={styles.brandText}>world services</span>
      </a>

      <button
        ref={mobileSearchToggleRef}
        type="button"
        className={styles.mobileSearchToggle}
        aria-label="Open search"
        aria-expanded={isMobileSearchOpen}
        aria-controls="mobile-search-form"
        onClick={openMobileSearch}
      >
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      </button>

      <form
        id="mobile-search-form"
        className={styles.searchForm}
        onSubmit={(event) => {
          event.preventDefault()
          submitSearch(currentSearchValue)
        }}
      >
        <div
          className={
            currentSearchValue.trim()
              ? `${styles.searchField} ${styles.searchFieldActive}`
              : styles.searchField
          }
        >
          {isMobileSearchOpen && (
            <button
              type="button"
              className={styles.mobileBackButton}
              onClick={() => closeMobileSearch(true)}
              aria-label="Close search"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
          )}

          <input
            ref={searchInputRef}
            className={styles.searchInput}
            type="search"
            value={currentSearchValue}
            onChange={(event) => handleSearchInputChange(event.target.value)}
            onFocus={handleSearchInputFocus}
            placeholder="Search"
            aria-label="Search posts"
            autoFocus={isMobileSearchOpen}
          />

          {isMobileSearchOpen ? (
            <button
              type="button"
              className={styles.mobileCloseButton}
              aria-label="Close search"
              onClick={() => closeMobileSearch(true)}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          ) : (
            <button type="submit" className={styles.searchButton} aria-label="Submit search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            </button>
          )}

        </div>

        {isMobileSearchOpen && (
          <div className={styles.mobileDropdown}>
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.mobileSuggestion}
                  onClick={() => {
                    updateSearchValue(option.label)
                    submitSearch(option.label)
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className={styles.mobileEmptyState}>No matches found.</p>
            )}
          </div>
        )}

        {isDesktopAutocompleteOpen && (
          <div className={styles.desktopDropdown}>
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.desktopSuggestion}
                  onClick={() => {
                    updateSearchValue(option.label)
                    submitSearch(option.label)
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className={styles.desktopEmptyState}>No matches found.</p>
            )}
          </div>
        )}
      </form>
    </header>
  )
}

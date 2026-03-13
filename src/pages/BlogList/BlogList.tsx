import { useEffect, useMemo, useRef, useState } from 'react'
import { BlogHeader } from '../../components/BlogHeader/BlogHeader'
import { RequestErrorScreen } from '../../components/RequestErrorScreen/RequestErrorScreen'
import { SortByControl } from '../../components/SortByControl/SortByControl'
import { Button } from '../../components/Button/Button'
import { usePosts } from '../../hooks/usePosts'
import { useBlogStore } from '../../store/blogStore'
import { PostList } from '../../components/PostList/PostList'
import { toUnixTimestamp } from '../../utils/date'
import { getLastName } from '../../utils/people'
import styles from './BlogList.module.css'

interface BlogListProps {
  onSelectPost: (postId: string) => void
}

function matchesSearchLabel(label: string, normalizedSearchValue: string): boolean {
  const normalizedLabel = label.trim().toLowerCase()
  if (!normalizedLabel || !normalizedSearchValue) {
    return false
  }

  if (normalizedLabel.includes(normalizedSearchValue)) {
    return true
  }

  const searchTokens = normalizedSearchValue.split(/\s+/).filter(Boolean)
  return searchTokens.some((token) => normalizedLabel.includes(token))
}

export function BlogList({ onSelectPost }: BlogListProps) {
  const { posts, isLoading, error, reload } = usePosts()
  const authorsById = useBlogStore((state) => state.authorsById)
  const categoriesById = useBlogStore((state) => state.categoriesById)
  const categoriesByPostId = useBlogStore((state) => state.categoriesByPostId)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([])
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[]>([])
  const [draftAuthorIds, setDraftAuthorIds] = useState<string[]>([])
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearchValue, setSubmittedSearchValue] = useState('')
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<'category' | 'author' | null>(
    null,
  )
  const mobileControlsRef = useRef<HTMLDivElement | null>(null)
  const categoryTriggerRef = useRef<HTMLButtonElement | null>(null)
  const authorTriggerRef = useRef<HTMLButtonElement | null>(null)

  const categoryOptions = useMemo(
    () =>
      Object.values(categoriesById)
        .map((category) => ({ id: category.id, label: category.name }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    [categoriesById],
  )

  const authorOptions = useMemo(
    () =>
      Object.values(authorsById)
        .map((author) => ({ id: author.id, label: getLastName(author.name) }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    [authorsById],
  )

  const selectedCategoryLabel = categoryOptions
    .filter((category) => selectedCategoryIds.includes(category.id))
    .map((category) => category.label)
    .join(', ')
  const selectedAuthorLabel = authorOptions
    .filter((author) => selectedAuthorIds.includes(author.id))
    .map((author) => author.label)
    .join(', ')
  const hasSelectedCategories = selectedCategoryIds.length > 0
  const hasSelectedAuthors = selectedAuthorIds.length > 0

  const searchOptions = useMemo(() => {
    const categorySearchOptions = Object.values(categoriesById).map((category) => ({
      id: `category-${category.id}`,
      label: category.name,
    }))
    const authorSearchOptions = Object.values(authorsById).map((author) => ({
      id: `author-${author.id}`,
      label: author.name,
    }))

    const uniqueOptions = new Map<string, { id: string; label: string }>()

    for (const option of [...categorySearchOptions, ...authorSearchOptions]) {
      const key = option.label.trim().toLowerCase()
      if (!uniqueOptions.has(key)) {
        uniqueOptions.set(key, option)
      }
    }

    return [...uniqueOptions.values()].sort((first, second) =>
      first.label.localeCompare(second.label),
    )
  }, [authorsById, categoriesById])

  const handleSearchSubmit = (value: string) => {
    const normalizedValue = value.trim()
    setSearchValue(normalizedValue)
    setSubmittedSearchValue(normalizedValue)

    if (!normalizedValue) {
      setSelectedCategoryIds([])
      setSelectedAuthorIds([])
      setDraftCategoryIds([])
      setDraftAuthorIds([])
      return
    }

    const matchingCategoryIds = categoryOptions
      .filter((category) => matchesSearchLabel(category.label, normalizedValue.toLowerCase()))
      .map((category) => category.id)

    const matchingAuthorIds = Object.values(authorsById)
      .filter((author) => {
        const fullName = author.name.trim()
        const lastName = getLastName(author.name)
        return (
          matchesSearchLabel(fullName, normalizedValue.toLowerCase()) ||
          matchesSearchLabel(lastName, normalizedValue.toLowerCase())
        )
      })
      .map((author) => author.id)

    setSelectedCategoryIds(matchingCategoryIds)
    setSelectedAuthorIds(matchingAuthorIds)
    setDraftCategoryIds(matchingCategoryIds)
    setDraftAuthorIds(matchingAuthorIds)
  }

  useEffect(() => {
    if (!mobileOpenDropdown) {
      return
    }

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (mobileControlsRef.current && target && !mobileControlsRef.current.contains(target)) {
        setMobileOpenDropdown(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setMobileOpenDropdown(null)

      if (mobileOpenDropdown === 'category') {
        categoryTriggerRef.current?.focus()
        return
      }

      if (mobileOpenDropdown === 'author') {
        authorTriggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('touchstart', handlePointerDownOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('touchstart', handlePointerDownOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileOpenDropdown])

  const applyCategoryFilter = (value: string | null) => {
    setSearchValue('')
    setSubmittedSearchValue('')

    if (!value) {
      setSelectedCategoryIds([])
      setDraftCategoryIds([])
      return
    }

    setSelectedCategoryIds((currentIds) => {
      const nextIds = currentIds.includes(value)
        ? currentIds.filter((id) => id !== value)
        : [...currentIds, value]
      setDraftCategoryIds(nextIds)
      return nextIds
    })
  }

  const applyAuthorFilter = (value: string | null) => {
    setSearchValue('')
    setSubmittedSearchValue('')

    if (!value) {
      setSelectedAuthorIds([])
      setDraftAuthorIds([])
      return
    }

    setSelectedAuthorIds((currentIds) => {
      const nextIds = currentIds.includes(value)
        ? currentIds.filter((id) => id !== value)
        : [...currentIds, value]
      setDraftAuthorIds(nextIds)
      return nextIds
    })
  }

  const filteredPosts = useMemo(() => {
    const normalizedSearchValue = submittedSearchValue.trim().toLowerCase()

    const nextPosts = posts.filter((post) => {
      const matchAuthor = selectedAuthorIds.length
        ? selectedAuthorIds.includes(post.authorId)
        : true
      const matchCategory = selectedCategoryIds.length
        ? selectedCategoryIds.some((categoryId) =>
            (categoriesByPostId[post.id] ?? []).includes(categoryId),
          )
        : true
      const authorName = authorsById[post.authorId]?.name ?? ''
      const categoryNames = (categoriesByPostId[post.id] ?? [])
        .map((categoryId) => categoriesById[categoryId]?.name ?? '')
        .join(' ')
      const searchIndex =
        `${post.title} ${post.content} ${authorName} ${categoryNames}`.toLowerCase()
      const matchSearch = normalizedSearchValue
        ? searchIndex.includes(normalizedSearchValue)
        : true

      return matchAuthor && matchCategory && matchSearch
    })

    const direction = sortDirection === 'desc' ? -1 : 1

    return [...nextPosts].sort((first, second) => {
      const firstDate = toUnixTimestamp(first.createdAt)
      const secondDate = toUnixTimestamp(second.createdAt)
      return (firstDate - secondDate) * direction
    })
  }, [
    authorsById,
    categoriesById,
    categoriesByPostId,
    posts,
    selectedAuthorIds,
    selectedCategoryIds,
    sortDirection,
    submittedSearchValue,
  ])

  const isBootstrapping = posts.length === 0 && isLoading
  const showCriticalError = !isBootstrapping && Boolean(error) && posts.length === 0

  if (showCriticalError) {
    return (
      <RequestErrorScreen
        title="Could not load the blog feed"
        message="The posts request failed. Please retry to load the latest articles."
        details={error}
        primaryActionLabel="Retry request"
        onPrimaryAction={() => void reload()}
      />
    )
  }

  return (
    <section className={styles.page}>
      <BlogHeader
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        searchOptions={searchOptions}
      />

      <div ref={mobileControlsRef} className={styles.mobileControls}>
        <div className={styles.mobileFilterGroup}>
          <div className={styles.mobileDropdown}>
            <div className={styles.mobileDropdownControl}>
              <button
                ref={categoryTriggerRef}
                id="mobile-category-trigger"
                type="button"
                className={
                  mobileOpenDropdown === 'category' || hasSelectedCategories
                    ? `${styles.mobileDropdownTrigger} ${styles.mobileDropdownTriggerActive}`
                    : styles.mobileDropdownTrigger
                }
                onClick={() =>
                  setMobileOpenDropdown((current) =>
                    current === 'category' ? null : 'category',
                  )
                }
                aria-haspopup="menu"
                aria-expanded={mobileOpenDropdown === 'category'}
                aria-controls="mobile-category-options"
              >
                <span className={styles.mobileDropdownLabel}>
                  {hasSelectedCategories ? selectedCategoryLabel : 'Category'}
                </span>
                <span className={styles.mobileDropdownIcon} aria-hidden="true">
                  <i className="fa-solid fa-chevron-down" />
                </span>
              </button>

              {hasSelectedCategories && mobileOpenDropdown !== 'category' && (
                <button
                  type="button"
                  className={styles.mobileDropdownClear}
                  aria-label="Clear category filter"
                  onClick={() => applyCategoryFilter(null)}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
            </div>

            {mobileOpenDropdown === 'category' && (
              <div
                id="mobile-category-options"
                className={styles.mobileDropdownMenu}
                role="group"
                aria-labelledby="mobile-category-trigger"
              >
                {categoryOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={
                      selectedCategoryIds.includes(category.id)
                        ? `${styles.mobileDropdownItem} ${styles.mobileDropdownItemSelected}`
                        : styles.mobileDropdownItem
                    }
                    onClick={() => applyCategoryFilter(category.id)}
                    aria-pressed={selectedCategoryIds.includes(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.mobileDropdown}>
            <div className={styles.mobileDropdownControl}>
              <button
                ref={authorTriggerRef}
                id="mobile-author-trigger"
                type="button"
                className={
                  mobileOpenDropdown === 'author' || hasSelectedAuthors
                    ? `${styles.mobileDropdownTrigger} ${styles.mobileDropdownTriggerActive}`
                    : styles.mobileDropdownTrigger
                }
                onClick={() =>
                  setMobileOpenDropdown((current) =>
                    current === 'author' ? null : 'author',
                  )
                }
                aria-haspopup="menu"
                aria-expanded={mobileOpenDropdown === 'author'}
                aria-controls="mobile-author-options"
              >
                <span className={styles.mobileDropdownLabel}>
                  {hasSelectedAuthors ? selectedAuthorLabel : 'Author'}
                </span>
                <span className={styles.mobileDropdownIcon} aria-hidden="true">
                  <i className="fa-solid fa-chevron-down" />
                </span>
              </button>

              {hasSelectedAuthors && mobileOpenDropdown !== 'author' && (
                <button
                  type="button"
                  className={styles.mobileDropdownClear}
                  aria-label="Clear author filter"
                  onClick={() => applyAuthorFilter(null)}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              )}
            </div>

            {mobileOpenDropdown === 'author' && (
              <div
                id="mobile-author-options"
                className={styles.mobileDropdownMenu}
                role="group"
                aria-labelledby="mobile-author-trigger"
              >
                {authorOptions.map((author) => (
                  <button
                    key={author.id}
                    type="button"
                    className={
                      selectedAuthorIds.includes(author.id)
                        ? `${styles.mobileDropdownItem} ${styles.mobileDropdownItemSelected}`
                        : styles.mobileDropdownItem
                    }
                    onClick={() => applyAuthorFilter(author.id)}
                    aria-pressed={selectedAuthorIds.includes(author.id)}
                  >
                    {author.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <SortByControl
          value={sortDirection}
          onChange={setSortDirection}
          showLabel={false}
          className={styles.mobileSortControl}
        />
      </div>

      <div className={styles.titleRow}>
        <h2 className={styles.title}>DWS blog</h2>
        <SortByControl value={sortDirection} onChange={setSortDirection} />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section className={styles.filterPanel}>
            <div className={styles.filterHeader}>
              <i className={`fa-solid fa-sliders ${styles.filterIcon}`} aria-hidden="true" />
              <h2 className={styles.filterHeading}>Filters</h2>
            </div>

            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Category</h3>
              <div className={styles.filterList}>
                {categoryOptions.map((category) => {
                  const isSelected = draftCategoryIds.includes(category.id)

                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={
                        isSelected
                          ? `${styles.filterOption} ${styles.filterOptionSelected}`
                          : styles.filterOption
                      }
                      onClick={() =>
                        setDraftCategoryIds((currentValues) =>
                          currentValues.includes(category.id)
                            ? currentValues.filter((id) => id !== category.id)
                            : [...currentValues, category.id],
                        )
                      }
                    >
                      {category.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h3 className={styles.filterTitle}>Author</h3>
              <div className={styles.filterList}>
                {authorOptions.map((author) => {
                  const isSelected = draftAuthorIds.includes(author.id)

                  return (
                    <button
                      key={author.id}
                      type="button"
                      className={
                        isSelected
                          ? `${styles.filterOption} ${styles.filterOptionSelected}`
                          : styles.filterOption
                      }
                      onClick={() =>
                        setDraftAuthorIds((currentValues) =>
                          currentValues.includes(author.id)
                            ? currentValues.filter((id) => id !== author.id)
                            : [...currentValues, author.id],
                        )
                      }
                    >
                      {author.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              className={styles.applyFiltersButton}
              onClick={() => {
                setSearchValue('')
                setSubmittedSearchValue('')
                setSelectedCategoryIds([...draftCategoryIds])
                setSelectedAuthorIds([...draftAuthorIds])
              }}
            >
              Apply filters
            </Button>
          </section>
        </aside>

        <div className={styles.mainColumn}>
          {isBootstrapping && <p className={styles.status}>Loading posts...</p>}

          {!isBootstrapping && error && posts.length > 0 && (
            <div className={styles.errorBox} role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void reload()}>
                Try again
              </button>
            </div>
          )}

          <PostList
            posts={filteredPosts}
            authorsById={authorsById}
            categoriesById={categoriesById}
            categoriesByPostId={categoriesByPostId}
            onSelectPost={onSelectPost}
            layout="grid"
            emptyText="No posts found with this filter."
          />
        </div>
      </div>
    </section>
  )
}

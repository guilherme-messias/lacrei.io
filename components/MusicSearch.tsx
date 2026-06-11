'use client'

import type { SearchTrack } from '@/lib/tracks'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type DropdownPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

export default function MusicSearch({
  onSelect,
}: {
  onSelect: (track: SearchTrack | null) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selected, setSelected] = useState<SearchTrack | null>(null)
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null)

  const anchorRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDropdownOpen =
    isFocused && !selected && query.length >= 2 && (isLoading || hasSearched)

  const updateDropdownPosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const viewportPadding = 16
    const gap = 8
    const availableHeight =
      window.innerHeight - rect.bottom - gap - viewportPadding

    setDropdownPosition({
      top: rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, availableHeight),
    })
  }, [])

  async function fetchTracks(q: string) {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/auth/tracks/search?q=${encodeURIComponent(q)}`
      )
      if (!response.ok) {
        setResults([])
        return
      }
      const data = await response.json()
      setResults(data.tracks ?? [])
    } catch (error) {
      console.error('Erro ao buscar músicas:', error)
      setResults([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  useEffect(() => {
    if (query.length < 2) {
      return
    }

    const timer = setTimeout(() => {
      fetchTracks(query)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    onSelect(selected)
  }, [selected, onSelect])

  useLayoutEffect(() => {
    if (!isDropdownOpen) {
      setDropdownPosition(null)
      return
    }

    updateDropdownPosition()

    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)

    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [isDropdownOpen, updateDropdownPosition, results, isLoading])

  useEffect(() => {
    if (!isDropdownOpen) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        anchorRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }

      setIsFocused(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isDropdownOpen])

  function renderDropdownContent() {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2 p-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-purple-50/20" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-purple-50/20" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-purple-50/20" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (results.length > 0) {
      return (
        <ul>
          {results.map(track => (
            <li key={track.deezerId ?? track.musicbrainzId}>
              <button
                type="button"
                onClick={() => {
                  setSelected(track)
                  setResults([])
                  setQuery('')
                  setIsFocused(false)
                  setHasSearched(false)
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-200 hover:bg-purple-800/60"
              >
                {track.albumCoverUrl ? (
                  <Image
                    src={track.albumCoverUrl}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-900/60" />
                )}
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium text-gray-50">
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-purple-50/70">
                    {track.artistName}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p className="px-4 py-3 text-sm text-purple-50/70">
        Nenhuma música encontrada
      </p>
    )
  }

  return (
    <>
      <div ref={anchorRef}>
        {selected ? (
          <div className="flex items-center gap-4 rounded-xl border border-purple-400/20 bg-purple-800/40 p-4">
            {selected.albumCoverUrl ? (
              <Image
                src={selected.albumCoverUrl}
                alt={selected.title}
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded-xl bg-purple-900/60" />
            )}

            <div className="min-w-0 flex flex-col gap-1">
              <p className="truncate text-base font-medium text-gray-50">
                {selected.title}
              </p>
              <p className="truncate text-sm text-purple-50/70">
                {selected.artistName}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelected(null)
                  setQuery('')
                  setHasSearched(false)
                }}
                className="text-left text-sm text-purple-400 transition-colors duration-200 hover:text-purple-50"
              >
                Trocar música
              </button>
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              if (e.target.value.length > 2) {
                setResults([])
                setIsLoading(false)
                setHasSearched(false)
              } else {
                setIsLoading(true)
                setHasSearched(false)
              }
            }}
            onFocus={() => setIsFocused(true)}
            placeholder="Buscar música..."
            className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors duration-150 placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />
        )}
      </div>

      {isDropdownOpen && dropdownPosition && (
        <div
          ref={dropdownRef}
          role="listbox"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: dropdownPosition.maxHeight,
          }}
          className="fixed z-50 overflow-y-auto overscroll-contain rounded-xl border border-purple-400/20 bg-purple-800 shadow-sm"
        >
          {renderDropdownContent()}
        </div>
      )}
    </>
  )
}

'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

type TrackResult = {
  id: string
  title: string
  artistName: string
  albumCoverUrl: string | null
  durationSeconds: number | null
}

export default function MusicSearch({
  onSelect,
}: {
  onSelect: (track: TrackResult | null) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TrackResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState<TrackResult | null>(null)

  async function fetchTracks(q: string) {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/tracks/search?q=${encodeURIComponent(q)}`
      )
      const data = await response.json()
      setResults(data.tracks ?? [])
    } catch (error) {
      console.error('Erro ao buscar músicas:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (query.length < 2) return
    const timer = setTimeout(() => {
      fetchTracks(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    onSelect(selected)
  }, [selected, onSelect])

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-4 rounded-xl border border-purple-400/20 bg-purple-800/40 p-4">
          {selected.albumCoverUrl ? (
            <Image
              src={selected.albumCoverUrl}
              alt={selected.title}
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-purple-900/60" />
          )}

          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-gray-50">{selected.title}</p>
            <p className="text-sm text-purple-50/70">{selected.artistName}</p>
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setQuery('')
              }}
              className="text-left text-sm text-purple-400 transition-colors duration-200 hover:text-purple-50"
            >
              Trocar música
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar música..."
            className="w-full rounded-xl border border-gray-400 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors duration-150 placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />

          {isLoading && (
            <div className="absolute z-10 mt-2 flex w-full flex-col gap-2 rounded-xl border border-purple-400/20 bg-purple-800/40 p-3 shadow-sm">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-purple-50/20" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-purple-50/20" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-purple-50/20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-purple-400/20 bg-purple-800/40 shadow-sm">
              {results.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(track)
                      setResults([])
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-200 hover:bg-purple-800/60"
                  >
                    {track.albumCoverUrl ? (
                      <Image
                        src={track.albumCoverUrl}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-purple-900/60" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-50">
                        {track.title}
                      </p>
                      <p className="text-xs text-purple-50/70">
                        {track.artistName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="absolute z-10 mt-2 w-full rounded-xl border border-purple-400/20 bg-purple-800/40 px-4 py-3 text-sm text-purple-50/70 shadow-sm">
              Nenhuma música encontrada
            </div>
          )}
        </>
      )}
    </div>
  )
}

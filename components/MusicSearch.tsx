'use client'

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

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      fetchTracks(query)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  async function fetchTracks(q: string) {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/tracks/search?q=${encodeURIComponent(q)}`
      )
      const data = await response.json()
      setResults(data.tracks ?? [])
    } catch (error) {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    onSelect(selected)
  }, [selected])

  return (
    <div className="relative">
      {selected ? (
        <div className="flex gap-4 items-center p-3 border rounded bg-gray-50">
          {selected.albumCoverUrl ? (
            <img
              src={selected.albumCoverUrl}
              alt={selected.title}
              width={120}
              height={120}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-[120px] h-[120px] bg-gray-200 rounded" />
          )}

          <div className="flex flex-col gap-2">
            <p className="font-semibold">{selected.title}</p>
            <p className="text-sm text-gray-500">{selected.artistName}</p>
            <button
              onClick={() => {
                setSelected(null)
                setQuery('')
              }}
              className="text-sm text-purple-600 underline text-left"
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
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar música..."
            className="w-full border rounded px-3 py-2"
          />

          {isLoading && (
            <div className="absolute w-full border rounded mt-1 bg-white p-2 flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="absolute w-full border rounded mt-1 bg-white z-10">
              {results.map(track => (
                <li
                  key={track.id}
                  onClick={() => {
                    setSelected(track)
                    setResults([])
                  }}
                  className="flex gap-2 items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {track.albumCoverUrl ? (
                    <img
                      src={track.albumCoverUrl}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{track.title}</p>
                    <p className="text-xs text-gray-500">{track.artistName}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="absolute w-full border rounded mt-1 bg-white px-3 py-2 text-sm text-gray-500">
              Nenhuma música encontrada
            </div>
          )}
        </>
      )}
    </div>
  )
}

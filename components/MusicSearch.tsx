'use client'

import { useState, useEffect } from 'react'

type TrackResult = {
  id: string
  title: string
  artistName: string
  albumCoverUrl: string | null
  durationSeconds: number | null
}

export default function MusicSearch() {
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
    // 4.6 vai implementar aqui
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar música..."
      />
    </div>
  )
}
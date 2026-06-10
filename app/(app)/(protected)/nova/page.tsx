'use client'

import MusicSearch from '@/components/MusicSearch'
import OpenAtPicker from '@/components/OpenAtPicker'
import Image from 'next/image'
import { useState } from 'react'
import z from 'zod'

type TrackResult = {
  id: string
  title: string
  artistName: string
  albumCoverUrl: string | null
  durationSeconds: number | null
}

const formSchema = z.object({
  message: z.string().min(1).max(500),
})
const [message, setMessage] = useState('')
const [selectedTrack, setSelectedTrack] = useState<TrackResult | null>(null)
const [openAt, setOpenAt] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
const [errors, setErrors] = useState<Record<string, string>>({})

export default function NovaPage() {
  return (
    <>
      <form>
        <div className="relative">
          <textarea
            placeholder="O que você quer lembrar desse momento?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
          />

          <span
            className={message.length > 450 ? 'text-red-400' : 'text-white/40'}
          >
            {message.length}/500
          </span>
        </div>

        <MusicSearch onSelect={setSelectedTrack} />
        <OpenAtPicker onSelect={setOpenAt} />

        <button disabled={isSubmitting}>
          {isSubmitting ? 'Lacrando...' : 'Lacrar cápsula'}
        </button>
      </form>
    </>
  )
}

'use client'

import { Capsule } from '@/app/generated/prisma/client'
import CapsulePreview from '@/components/CapsulePreview'
import MusicSearch from '@/components/MusicSearch'
import OpenAtPicker from '@/components/OpenAtPicker'
import type { SearchTrack } from '@/lib/tracks'
import { addMonths, format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CapsuleResponse = {
  capsule: Capsule
}

export default function Page() {
  const [message, setMessage] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<SearchTrack | null>(null)
  const [openAt, setOpenAt] = useState(() =>
    format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    setError('')

    if (
      !message.trim() ||
      !openAt ||
      (!selectedTrack?.musicbrainzId && !selectedTrack?.deezerId)
    ) {
      setError('Preencha todos os campos antes de continuar.')
      return
    }

    try {
      setIsSubmitting(true)
      const trackRes = await fetch('/api/auth/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTrack),
      })

      if (!trackRes.ok) {
        throw new Error('Erro ao salvar música')
      }

      const trackId = (await trackRes.json()).track.id

      const capsuleRes = await fetch('/api/capsules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          trackId,
          openAt,
        }),
      })

      if (!capsuleRes.ok) {
        throw new Error('Erro ao criar cápsula')
      }

      const capsuleData = (await capsuleRes.json()) as CapsuleResponse

      router.push(`/nova/confirmacao?id=${capsuleData.capsule.id}`)
    } catch {
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-medium tracking-tight text-gray-50 sm:text-3xl">
          Nova cápsula
        </h1>
        <p className="text-base font-normal leading-relaxed text-purple-50/70">
          Escolha a música, escreva a frase — e deixe o tempo cuidar do resto.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_320px] md:items-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-medium uppercase tracking-wide text-purple-50/80"
            >
              Sua frase
            </label>
            <div className="relative">
              <textarea
                id="message"
                placeholder="O que você quer lembrar desse momento?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={500}
                className="min-h-[120px] w-full resize-none rounded-xl border border-gray-400 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors duration-150 placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
              <span
                className={`absolute bottom-3 right-3 text-sm ${
                  message.length > 450 ? 'text-purple-400' : 'text-gray-400'
                }`}
              >
                {message.length}/500
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-purple-50/80">
              Música
            </span>
            <MusicSearch onSelect={setSelectedTrack} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-purple-50/80">
              Quando abrir
            </span>
            <OpenAtPicker onSelect={setOpenAt} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800 disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? 'Lacrando...' : 'Lacrar cápsula'}
          </button>
        </form>

        <CapsulePreview
          message={message}
          track={selectedTrack}
          openAt={openAt}
        />
      </div>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Capsule, Track } from '@/app/generated/prisma/client'

type CapsuleWithTrack = Capsule & { track: Track }

interface CapsuleCardProps {
  capsule: CapsuleWithTrack
  status: 'sealed' | 'delivered'
}

export function CapsuleCard({ capsule, status }: CapsuleCardProps) {
  const cover = capsule.track.albumCoverUrl

  return (
    <Link href={`/diario/${capsule.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={capsule.track.title}
            width={100}
            height={100}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        )}
        <p className="text-lg font-bold">{capsule.track.title}</p>
        <p className="text-sm text-gray-500">{capsule.track.artistName}</p>
        <p className="text-lg font-bold">&ldquo;{capsule.message}&rdquo;</p>
        <p className="text-sm text-gray-500">
          {status === 'sealed' ? 'Aberto em' : 'Aberto em'}
          {format(capsule.openAt, 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>
    </Link>
  )
}

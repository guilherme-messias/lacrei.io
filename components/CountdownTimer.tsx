import { differenceInDays } from 'date-fns'

interface CountdownTimerProps {
  openAt: Date
}

export function CountdownTimer({ openAt }: CountdownTimerProps) {
  const daysUntilOpen = differenceInDays(openAt, new Date())

  if (daysUntilOpen <= 0) {
    return <span className="text-teal-400 font-medium">Abre hoje</span>
  }

  return (
    <span className="text-sm text-gray-400">
      Abre em <strong className="text-white text-lg">{daysUntilOpen}</strong>{' '}
      {daysUntilOpen === 1 ? 'dia' : 'dias'}
    </span>
  )
}

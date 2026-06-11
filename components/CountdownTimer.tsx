import { differenceInDays } from 'date-fns'

interface CountdownTimerProps {
  openAt: Date
}

export function CountdownTimer({ openAt }: CountdownTimerProps) {
  const daysUntilOpen = differenceInDays(openAt, new Date())

  if (daysUntilOpen <= 0) {
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[2rem] font-medium leading-none text-purple-50">
          0
        </span>
        <span className="text-xs tracking-wide text-purple-400">Abre hoje</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[2rem] font-medium leading-none text-purple-50">
        {daysUntilOpen}
      </span>
      <span className="text-xs tracking-wide text-purple-400">
        {daysUntilOpen === 1 ? 'dia para abrir' : 'dias para abrir'}
      </span>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { addDays, addMonths, addYears, format } from 'date-fns'

type Preset = '3m' | '6m' | '1y' | 'custom'

interface Props {
  onSelect: (date: string) => void
}

const options = [
  { key: '3m' as const, label: '3 meses' },
  { key: '6m' as const, label: '6 meses' },
  { key: '1y' as const, label: '1 ano' },
  { key: 'custom' as const, label: 'Personalizado' },
]

const dates = {
  '3m': format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
  '6m': format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
  '1y': format(addYears(new Date(), 1), 'yyyy-MM-dd'),
} as const

export default function OpenAtPicker({ onSelect }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<Preset>('3m')
  const [customDate, setCustomDate] = useState('')

  return (
    <div className="flex flex-col gap-2">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => {
            setSelectedPreset(key)
            if (key !== 'custom') {
              onSelect(dates[key])
            }
          }}
          className={
            selectedPreset === key
              ? 'border-2 border-purple-400'
              : 'border border-gray-400'
          }
        >
          {label}
        </button>
      ))}

      {selectedPreset === 'custom' && (
        <input
          type="date"
          min={format(addDays(new Date(), 7), 'yyyy-MM-dd')}
          value={customDate}
          onChange={e => {
            setCustomDate(e.target.value)
            if (e.target.value) onSelect(e.target.value)
          }}
          className="border border-gray-400 rounded-md p-2"
        />
      )}
    </div>
  )
}

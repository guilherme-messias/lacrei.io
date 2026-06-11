'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DeleteCapsuleButtonProps = {
  capsuleId: string
}

export function DeleteCapsuleButton({ capsuleId }: DeleteCapsuleButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    const response = await fetch(`/api/capsules/${capsuleId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      setIsLoading(false)
      return
    }

    setIsOpen(false)
    router.push('/diario')
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Fechar"
            onClick={handleCancel}
            className="absolute inset-0 bg-[#26215C]/80"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-capsule-title"
            className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-2xl border border-purple-400/20 bg-purple-800 p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-2">
              <h2
                id="delete-capsule-title"
                className="text-2xl font-medium text-gray-50"
              >
                Excluir cápsula
              </h2>
              <p className="text-base font-normal leading-relaxed text-purple-50/70">
                Essa cápsula será apagada para sempre. Quer mesmo continuar?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full rounded-xl border border-purple-400 px-6 py-3 text-base font-medium text-purple-50 transition-colors duration-200 hover:bg-purple-50/10 disabled:opacity-50 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full rounded-xl border border-red-400 px-6 py-3 text-base font-medium text-red-400 transition-colors duration-200 hover:border-red-800 hover:text-red-800 disabled:opacity-50 sm:w-auto"
              >
                {isLoading ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full cursor-pointer rounded-xl border border-red-400 px-6 py-3 text-base font-medium text-red-400 transition-colors duration-200 hover:border-red-800 hover:text-red-800 sm:w-auto"
      >
        Excluir cápsula
      </button>
    </>
  )
}

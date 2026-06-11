'use client'

type DeleteCapsuleButtonProps = {
  capsuleId: string
}

export function DeleteCapsuleButton({ capsuleId }: DeleteCapsuleButtonProps) {
  void capsuleId

  return (
    <button
      type="button"
      className="w-full rounded-xl border border-red-400 px-6 py-3 text-base font-medium text-red-400 transition-colors duration-200 hover:border-red-800 hover:text-red-800 sm:w-auto cursor-pointer"
    >
      Excluir cápsula
    </button>
  )
}

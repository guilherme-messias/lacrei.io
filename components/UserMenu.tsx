'use client'

import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type UserMenuProps = {
  name?: string | null
  image?: string | null
  email?: string | null
}

export function UserMenu({ name, image, email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = name ?? email ?? 'Usuário'

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="cursor-pointer rounded-full transition-[box-shadow] duration-200 hover:ring-2 hover:ring-purple-500/50"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-800 text-sm font-medium text-purple-50">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] rounded-xl border border-purple-800/40 bg-[#171340] py-1 shadow-lg"
        >
          <p className="px-4 py-2 text-sm text-purple-50/60">{displayName}</p>
          <div className="mx-2 border-t border-purple-800/40" />
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-4 py-2 text-left text-sm text-red-400 transition-colors duration-200 hover:text-red-300"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

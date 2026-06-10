'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import logo from '@/public/logo.svg'
import { use } from 'react'

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function SpotifyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#1DB954"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.13-10.56-1.147-.405.092-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.241 1.026zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
      />
    </svg>
  )
}

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    'Este e-mail já está cadastrado com outro método de login. Tente entrar com Google ou Spotify.',
  OAuthSignin: 'Não foi possível iniciar o login. Tente novamente.',
  OAuthCallbackError:
    'Ocorreu um erro ao retornar do provedor. Tente novamente.',
  SessionRequired: 'Você precisa estar logado para acessar essa página.',
  Default: 'Algo deu errado — tente de novo.',
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = use(searchParams)
  const errorMessage = error
    ? (errorMessages[error] ?? errorMessages.Default)
    : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <Image
          src={logo}
          alt="Lacrei"
          width={96}
          height={96}
          className="h-24 w-24"
          priority
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-3xl font-medium tracking-tight text-gray-50">
            Lacrei
          </h1>
          <p className="text-base font-normal leading-relaxed text-purple-50/70">
            Um ritual pessoal. Lacre memórias em música para o seu eu do futuro.
          </p>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="w-full rounded-xl border border-purple-400 bg-purple-800/40 px-4 py-3 text-center text-sm font-medium text-purple-50"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:min-w-[280px]">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800 sm:w-auto"
            onClick={() => signIn('google', { callbackUrl: '/diario' })}
          >
            <GoogleIcon />
            Entrar com Google
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-purple-400 px-6 py-3 text-base font-medium text-purple-50 transition-colors duration-200 hover:bg-purple-50/10 sm:w-auto"
            onClick={() => signIn('spotify', { callbackUrl: '/diario' })}
          >
            <SpotifyIcon />
            Entrar com Spotify
          </button>
        </div>
      </div>
    </div>
  )
}

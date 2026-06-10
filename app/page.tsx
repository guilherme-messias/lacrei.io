import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/logo.svg'

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-purple-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-purple-800/40 via-purple-900 to-purple-900"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-xl bg-purple-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-xl bg-purple-800/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/3 rounded-xl bg-teal-400/5 blur-3xl"
      />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-10 text-center">
          <Image
            src={logo}
            alt="Lacrei"
            width={72}
            height={72}
            className="h-16 w-16 opacity-90"
            priority
          />

          <div className="flex flex-col gap-6">
            <h1 className="font-display text-4xl font-light tracking-tight text-gray-50 sm:text-5xl">
              Mande uma música para o seu eu do futuro
            </h1>
            <p className="mx-auto max-w-lg text-base font-normal leading-relaxed text-purple-50/70">
              Escolha uma faixa, escreva o que sente hoje — e deixe o tempo
              entregar essa carta para quem você vai ser.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800 sm:w-auto"
          >
            Criar minha cápsula
          </Link>
        </div>
      </main>
    </div>
  )
}

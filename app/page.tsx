import Image from 'next/image'
import Link from 'next/link'
import logo from '@/public/logo.svg'

const steps = [
  {
    number: '01',
    title: 'Escolha uma música e escreva uma frase',
    description:
      'Uma faixa que marca esse momento — e as palavras que você quer lembrar depois.',
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Escolha quando quer receber de volta',
    description:
      'Daqui a um mês, um ano — você decide quando essa carta deve chegar.',
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Receba o momento no futuro por e-mail',
    description:
      'Quando chegar a hora, a música e a frase aparecem na sua caixa de entrada.',
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
] as const

export default function HomePage() {
  return (
    <div className="flex flex-col bg-purple-900 text-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
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

        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6">
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
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl font-medium tracking-tight text-gray-50 sm:text-3xl">
              Como funciona
            </h2>
            <p className="mt-4 text-base font-normal leading-relaxed text-purple-50/70">
              Três passos. Um ritual simples.
            </p>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-6">
            {steps.map((step) => (
              <article
                key={step.number}
                className="flex flex-1 flex-col gap-4 rounded-2xl border border-purple-400/20 bg-purple-800/40 p-6 shadow-sm sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium tracking-wide text-purple-400">
                    {step.number}
                  </span>
                  <span className="text-purple-400">{step.icon}</span>
                </div>
                <h3 className="text-xl font-medium leading-snug text-gray-50">
                  {step.title}
                </h3>
                <p className="text-base font-normal leading-relaxed text-purple-50/70">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Preview do e-mail */}
      <section className="px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          <div className="text-center">
            <h2 className="text-2xl font-medium tracking-tight text-gray-50 sm:text-3xl">
              Quando chegar, é assim
            </h2>
            <p className="mt-4 text-base font-normal leading-relaxed text-purple-50/70">
              A música, a frase e a data — tudo na sua caixa de entrada.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-1 border-b border-purple-50 pb-4">
              <p className="text-sm text-gray-400">
                De:{' '}
                <span className="text-gray-900">Lacrei</span>
              </p>
              <p className="text-sm text-gray-400">
                Assunto:{' '}
                <span className="text-gray-900">
                  Maria, sua cápsula do tempo chegou!
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-center text-sm text-gray-400">
                Você escreveu isso em 10 de junho de 2024
              </p>

              <div
                aria-hidden
                className="mx-auto h-48 w-48 rounded-xl bg-linear-to-br from-purple-400/40 via-purple-800/30 to-purple-900/50"
              />

              <blockquote className="text-center font-display text-2xl font-light leading-loose text-gray-900">
                &ldquo;Esta música me lembra do verão de 2020, quando tudo
                parecia possível.&rdquo;
              </blockquote>

              <p className="text-center text-sm font-medium text-teal-400">
                Like a Virgin — Madonna
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

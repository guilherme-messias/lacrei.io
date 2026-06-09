import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import logo from '@/public/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <>
      <header className="border-b border-purple-800/40 px-4 sm:px-6">
        <nav className="mx-auto flex max-w-4xl items-center justify-between gap-6 py-4">
          <Link
            href="/diario"
            className="transition-opacity duration-200 ease-in-out hover:opacity-80"
          >
            <Image
              src={logo}
              alt="Lacrei"
              width={100}
              height={100}
              className="h-10 w-10"
            />
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              {session.user.name && (
                <span className="hidden text-sm font-medium text-purple-50/80 sm:inline">
                  {session.user.name}
                </span>
              )}
            </div>
            <Link href="/nova">
              <button
                type="button"
                className="rounded-xl bg-teal-400 px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-800"
              >
                Nova Cápsula
              </button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        {children}
      </main>
    </>
  )
}

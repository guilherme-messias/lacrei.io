import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import logo from '@/public/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export default async function AppLayout({
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
      <header>
        <nav className="flex items-center justify-between">
          <Link href="/diario">
            <Image
              src={logo}
              alt="Lacrei"
              width={100}
              height={100}
              className="w-10 h-10"
            />
          </Link>
          <Image
            src={session.user.image ?? ''}
            alt="User"
            width={100}
            height={100}
            className="w-10 h-10 rounded-full"
          />
          <span className="text-sm font-medium">{session.user.name}</span>
          <Link href="/nova">
            <button className="bg-purple-400 text-white px-4 py-2 rounded-md">
              Nova Cápsula
            </button>
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </>
  )
}

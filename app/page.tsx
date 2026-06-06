import { signIn } from '@/auth'
export default function LoginPage() {
  return (
    <form action={async () => { 'use server'; await signIn('google') }}>
      <button type="submit">Entrar com Google</button>
    </form>
  )
}
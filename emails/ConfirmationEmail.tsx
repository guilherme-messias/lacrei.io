import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Preview,
} from '@react-email/components'

interface ConfirmationEmailProps {
  userName: string
  trackTitle: string
  artistName: string
  albumCoverUrl: string | null
  message: string
  openAt: string // data formatada: "15 de janeiro de 2025"
}

export default function ConfirmationEmail({
  userName = 'John Doe',
  trackTitle = 'Like a Virgin',
}: ConfirmationEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua cápsula do tempo foi criada!</Preview>
      <Body>
        <Container>
          <Heading>Olá, {userName}!</Heading>
          <Text>Sua música "{trackTitle}" foi guardada.</Text>
        </Container>
      </Body>
    </Html>
  )
}

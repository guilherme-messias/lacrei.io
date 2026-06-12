import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Preview,
  Img,
  Link,
  Section,
  Hr,
} from '@react-email/components'
import { Tailwind, pixelBasedPreset } from '@react-email/tailwind'

interface ConfirmationEmailProps {
  userName: string
  trackTitle: string
  artistName: string
  albumCoverUrl: string | null
  message: string
  openAt: string // data formatada: "15 de janeiro de 2025"
  dashboardUrl?: string
}

export default function ConfirmationEmail({
  userName = 'Maria',
  trackTitle = 'Like a Virgin',
  artistName = 'Madonna',
  albumCoverUrl = 'https://e-cdns-images.dzcdn.net/images/cover/2e018122cb5698622112a1a27a45a10c/250x250-000000-80-0-0.jpg',
  message = 'Esta música me lembra do verão de 2020, quando tudo parecia possível.',
  openAt = '15 de janeiro de 2025',
  dashboardUrl = 'https://lacrei-io.vercel.app/diario',
}: ConfirmationEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua cápsula do tempo foi criada!</Preview>
      <Tailwind config={pixelBasedPreset}>
        <Body className="m-0 bg-[#f6f6f6] px-4 py-8 font-sans">
          <Container className="mx-auto max-w-[480px] rounded-lg bg-white px-6 py-8">
            <Heading className="m-0 mb-6 text-center text-[28px] font-bold text-[#7F77DD]">
              Lacrei
            </Heading>

            <Text className="m-0 mb-2 text-lg font-semibold text-[#171717]">
              Olá, {userName}!
            </Text>
            <Text className="m-0 mb-6 text-sm text-[#6b7280]">
              Sua cápsula do tempo foi criada com sucesso.
            </Text>

            {albumCoverUrl && (
              <Section className="mb-6 text-center">
                <Img
                  src={albumCoverUrl}
                  alt={`Capa do álbum de ${trackTitle}`}
                  width={200}
                  className="mx-auto block rounded-lg"
                />
              </Section>
            )}

            <Text className="m-0 mb-4 text-center text-xl font-medium italic leading-normal text-[#171717]">
              &ldquo;{message}&rdquo;
            </Text>

            <Text className="m-0 mb-6 text-center text-sm text-[#6b7280]">
              {trackTitle} — {artistName}
            </Text>

            <Text className="m-0 mb-6 rounded-lg bg-[#f3f2fc] p-4 text-center text-base font-semibold text-[#7F77DD]">
              Sua cápsula abre em <strong>{openAt}</strong>
            </Text>

            <Hr className="mb-6 w-full border border-solid border-[#e5e7eb]" />

            <Text className="m-0 text-center">
              <Link
                href={dashboardUrl}
                className="text-sm font-semibold text-[#7F77DD] underline"
              >
                Ver meu diário
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

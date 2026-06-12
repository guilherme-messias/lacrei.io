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

interface DeliveryEmailProps {
  userName: string
  trackTitle: string
  artistName: string
  albumCoverUrl: string | null
  message: string
  createdAt: string // data formatada: "15 de janeiro de 2025"
  appUrl?: string
}

export default function DeliveryEmail({
  userName = 'Maria',
  trackTitle = 'Like a Virgin',
  artistName = 'Madonna',
  albumCoverUrl = 'https://e-cdns-images.dzcdn.net/images/cover/2e018122cb5698622112a1a27a45a10c/250x250-000000-80-0-0.jpg',
  message = 'Esta música me lembra do verão de 2020, quando tudo parecia possível.',
  createdAt = '10 de junho de 2024',
  appUrl = 'https://lacrei-io.vercel.app/nova',
}: DeliveryEmailProps) {
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${trackTitle} ${artistName}`)}`

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{userName}, sua cápsula do tempo chegou!</Preview>
      <Tailwind config={pixelBasedPreset}>
        <Body className="m-0 bg-[#f6f6f6] px-4 py-8 font-sans">
          <Container className="mx-auto max-w-[480px] rounded-lg bg-white px-6 py-8">
            <Heading className="m-0 mb-6 text-center text-[28px] font-bold text-[#1D9E75]">
              Lacrei
            </Heading>

            <Text className="m-0 mb-2 text-center text-xs text-[#6b7280]">
              Você escreveu isso em {createdAt}
            </Text>

            {albumCoverUrl && (
              <Section className="mb-8 text-center">
                <Img
                  src={albumCoverUrl}
                  alt={`Capa do álbum de ${trackTitle}`}
                  width={300}
                  className="mx-auto block rounded-lg"
                />
              </Section>
            )}

            <Text className="m-0 px-2 py-8 text-center text-2xl font-medium italic leading-relaxed text-[#171717]">
              &ldquo;{message}&rdquo;
            </Text>

            <Text className="m-0 mb-8 text-center text-sm">
              <Link
                href={youtubeSearchUrl}
                className="font-semibold text-[#1D9E75] underline"
              >
                {trackTitle} — {artistName}
              </Link>
            </Text>

            <Hr className="mb-6 w-full border border-solid border-[#e5e7eb]" />

            <Text className="m-0 text-center">
              <Link
                href={appUrl}
                className="inline-block rounded-lg bg-[#1D9E75] px-6 py-3 text-sm font-semibold text-white no-underline"
              >
                Criar nova cápsula
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

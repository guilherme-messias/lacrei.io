import { Prisma } from '@/app/generated/prisma/client'
import ConfirmationEmail from '@/emails/ConfirmationEmail'
import DeliveryEmail from '@/emails/DeliveryEmail'
import { Resend } from 'resend'

export type CapsuleWithTrackAndUser = Prisma.CapsuleGetPayload<{
  include: { track: true; user: true }
}>

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail(capsule: CapsuleWithTrackAndUser) {
  await resend.emails.send({
    from: `Lacrei <${process.env.EMAIL_FROM}>`,
    to: capsule.user.email!,
    subject: 'Sua cápsula foi lacrada ✉️',
    react: ConfirmationEmail({
      userName: capsule.user.name!,
      trackTitle: capsule.track.title,
      artistName: capsule.track.artistName,
      albumCoverUrl: capsule.track.albumCoverUrl,
      message: capsule.message,
      openAt: capsule.openAt.toLocaleDateString('pt-BR'),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    }),
  })
}

export async function sendDeliveryEmail(capsule: CapsuleWithTrackAndUser) {
  await resend.emails.send({
    from: `Lacrei <${process.env.EMAIL_FROM}>`,
    to: capsule.user.email!,
    subject: 'Sua cápsula do tempo abriu ✉️',
    react: DeliveryEmail({
      userName: capsule.user.name!,
      trackTitle: capsule.track.title,
      artistName: capsule.track.artistName,
      albumCoverUrl: capsule.track.albumCoverUrl,
      message: capsule.message,
      createdAt: capsule.createdAt.toLocaleDateString('pt-BR'),
      appUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
    }),
  })
}

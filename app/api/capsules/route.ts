import { auth } from "@/auth";
import { addDays, isAfter, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const createCapsuleSchema = z.object({
  message: z.string().min(1).max(500).trim(),
  trackId: z.uuid(),
  openAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
})

export async function POST(request: NextRequest) { 
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
  
  const body = await request.json()

  const parsed = createCapsuleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parâmetro inválido', details: z.flattenError(parsed.error) }, { status: 400 })
  }

  const openAtDate = parseISO(parsed.data.openAt)
  const minDate = addDays(new Date(), 6)
  if (!isAfter(openAtDate, minDate)) {
    return NextResponse.json({ error: 'A data deve ser pelo menos 7 dias no futuro', code: 'DATE_TOO_SOON' }, { status: 400 })
  }
}
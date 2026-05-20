import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const fontsDir = path.join(process.cwd(), 'public', 'fonts')

Font.register({
  family: 'HeyWow',
  fonts: [
    { src: path.join(fontsDir, 'HeyWowRegular.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'HeyWowMedium.ttf'), fontWeight: 500 },
    { src: path.join(fontsDir, 'HeyWowSemiBold.ttf'), fontWeight: 600 },
    { src: path.join(fontsDir, 'HeyWowBold.ttf'), fontWeight: 700 },
    { src: path.join(fontsDir, 'HeyWowExtraBold.ttf'), fontWeight: 800 },
  ],
})

const C = {
  dark: '#1a0f08',
  darkMid: '#2e1c0e',
  cream: '#faf5ef',
  amber: '#e8622a',
  amberGold: '#f5a832',
  textDark: '#1a1512',
  textMid: '#6b5f56',
  textMuted: '#9e9087',
  border: '#e8e2da',
  bodyBg: '#faf7f2',
  white: '#ffffff',
  greenBg: 'rgba(74,138,56,0.08)',
  greenBorder: 'rgba(74,138,56,0.2)',
  greenText: '#3a7527',
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bodyBg,
    fontFamily: 'HeyWow',
    flexDirection: 'column',
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    backgroundColor: C.dark,
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 22,
  },
  eyebrow: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 2.5,
    color: C.amberGold,
    textTransform: 'uppercase',
    marginBottom: 9,
  },
  eventName: {
    fontSize: 27,
    fontWeight: 800,
    color: C.cream,
    lineHeight: 1.05,
    marginBottom: 14,
  },
  headerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerPillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.amberGold,
  },
  headerPillText: {
    fontSize: 9.5,
    fontWeight: 500,
    color: 'rgba(250,245,239,0.8)',
  },

  // ── Tear line ────────────────────────────────────────────────
  tearWrap: {
    backgroundColor: C.dark,
    paddingHorizontal: 0,
  },
  tearLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopStyle: 'dashed',
    marginHorizontal: 30,
  },
  tearSideCutLeft: {
    position: 'absolute',
    left: 15,
    top: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.bodyBg,
  },
  tearSideCutRight: {
    position: 'absolute',
    right: 15,
    top: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.bodyBg,
  },

  // ── Body ─────────────────────────────────────────────────────
  body: {
    flexDirection: 'row',
    flex: 1,
    padding: 26,
    gap: 20,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'column',
  },
  qrCol: {
    width: 152,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    borderLeftStyle: 'solid',
    paddingLeft: 20,
  },

  // ── Info fields ──────────────────────────────────────────────
  field: {
    marginBottom: 15,
  },
  fieldLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.8,
    color: C.textMuted,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: 700,
    color: C.textDark,
    lineHeight: 1.2,
  },
  fieldValueSub: {
    fontSize: 11,
    fontWeight: 400,
    color: C.textMid,
    marginTop: 2,
    lineHeight: 1.3,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232,98,42,0.09)',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(232,98,42,0.22)',
    borderStyle: 'solid',
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: 700,
    color: C.amber,
  },

  // ── QR ───────────────────────────────────────────────────────
  qrImage: {
    width: 118,
    height: 118,
    borderRadius: 8,
  },
  codeBox: {
    marginTop: 10,
    backgroundColor: C.white,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    alignItems: 'center',
    width: '100%',
  },
  codeLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  codeText: {
    fontSize: 10,
    fontWeight: 700,
    color: C.textDark,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  validBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.greenBg,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.greenBorder,
    borderStyle: 'solid',
  },
  validDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.greenText,
  },
  validText: {
    fontSize: 8,
    fontWeight: 700,
    color: C.greenText,
    letterSpacing: 0.5,
  },

  // ── Divider ──────────────────────────────────────────────────
  divider: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
    marginVertical: 14,
  },

  // ── Footer ───────────────────────────────────────────────────
  footer: {
    backgroundColor: C.darkMid,
    paddingHorizontal: 30,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    fontWeight: 400,
    color: 'rgba(250,245,239,0.45)',
    flex: 1,
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: 700,
    color: C.amberGold,
    letterSpacing: 0.5,
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function el(type: React.ElementType, props: Record<string, unknown> | null, ...children: React.ReactNode[]) {
  return React.createElement(type, props, ...children)
}

function Field(label: string, value: React.ReactNode, sub?: string, last = false) {
  return el(View, { style: last ? s.fieldLast : s.field },
    el(Text, { style: s.fieldLabel }, label),
    typeof value === 'string'
      ? el(Text, { style: s.fieldValue }, value)
      : value,
    sub ? el(Text, { style: s.fieldValueSub }, sub) : null
  )
}

// ── Generator ───────────────────────────────────────────────────────────────

export async function generateTicketsPdf(orderId: string): Promise<Buffer> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tickets: {
        include: {
          ticketType: {
            include: { event: true },
          },
        },
      },
    },
  })

  if (!order) throw new Error('Order not found')

  const ticketsWithQr = await Promise.all(
    order.tickets.map(async (ticket) => {
      const qrCode = await generateQrCode(ticket.code)
      return { ...ticket, qrCode }
    })
  )

  const event = order.tickets[0]?.ticketType.event
  if (!event) throw new Error('Event not found')

  const weekdayDate = format(event.date, "EEEE',' dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const eventTime = format(event.date, 'HH:mm', { locale: ptBR })
  const shortDate = format(event.date, "dd/MM/yyyy", { locale: ptBR })

  const doc = el(
    Document,
    { title: `Ingressos — ${event.name}` },
    ...ticketsWithQr.map((ticket) =>
      el(Page, { key: ticket.id, size: 'A5', style: s.page },

        // ── Header ──
        el(View, { style: s.header },
          el(Text, { style: s.eyebrow }, 'Ingresso Oficial · Feitos de Cem'),
          el(Text, { style: s.eventName }, event.name),
          el(View, { style: s.headerPills },
            el(View, { style: s.headerPill },
              el(View, { style: s.headerPillDot }),
              el(Text, { style: s.headerPillText },
                weekdayDate.charAt(0).toUpperCase() + weekdayDate.slice(1) + ' · ' + eventTime
              )
            ),
            el(View, { style: s.headerPill },
              el(View, { style: s.headerPillDot }),
              el(Text, { style: s.headerPillText }, event.location)
            )
          )
        ),

        // ── Tear line ──
        el(View, { style: s.tearWrap },
          el(View, { style: s.tearLine }),
          el(View, { style: s.tearSideCutLeft }),
          el(View, { style: s.tearSideCutRight })
        ),

        // ── Body ──
        el(View, { style: s.body },

          // Left: info
          el(View, { style: s.infoCol },
            Field('Portador', order.user.name),
            Field('Tipo de ingresso',
              el(View, { style: s.typeBadge },
                el(Text, { style: s.typeBadgeText }, ticket.ticketType.name)
              )
            ),
            el(View, { style: s.divider }),
            Field('Data', shortDate, weekdayDate.charAt(0).toUpperCase() + weekdayDate.slice(1)),
            Field('Horário', eventTime + 'h', undefined),
            Field('Local', event.location, undefined, true),
          ),

          // Right: QR
          el(View, { style: s.qrCol },
            el(Image, { style: s.qrImage, src: ticket.qrCode }),
            el(View, { style: s.codeBox },
              el(Text, { style: s.codeLabel }, 'Código'),
              el(Text, { style: s.codeText }, ticket.code)
            ),
            el(View, { style: s.validBadge },
              el(View, { style: s.validDot }),
              el(Text, { style: s.validText }, 'Válido')
            )
          )
        ),

        // ── Footer ──
        el(View, { style: s.footer },
          el(Text, { style: s.footerText },
            'Válido para uma pessoa. Apresente o QR Code na entrada do evento.'
          ),
          el(Text, { style: s.footerBrand }, 'feitosdecem.com.br')
        )
      )
    )
  )

  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}

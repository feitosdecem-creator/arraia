import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { prisma } from '@/lib/prisma'
import { generateQrCode } from '@/lib/qrcode'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fffbeb',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#7c2d12',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    border: '2pt solid #f59e0b',
  },
  ticketType: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    width: 100,
  },
  value: {
    fontSize: 11,
    color: '#4b5563',
    flex: 1,
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 12,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
})

export async function generateTicketsPdf(orderId: string): Promise<Buffer> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tickets: {
        include: {
          ticketType: {
            include: {
              event: true,
            },
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

  const eventDate = format(event.date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  const doc = React.createElement(
    Document,
    { title: `Ingressos - ${event.name}` },
    ...ticketsWithQr.map((ticket) =>
      React.createElement(
        Page,
        { key: ticket.id, size: 'A5', style: styles.page },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.headerTitle }, '🎪 ' + event.name),
          React.createElement(Text, { style: styles.headerSubtitle }, 'INGRESSO OFICIAL')
        ),
        React.createElement(
          View,
          { style: styles.card },
          React.createElement(Text, { style: styles.ticketType }, ticket.ticketType.name),
          React.createElement(View, { style: styles.divider }),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Comprador:'),
            React.createElement(Text, { style: styles.value }, order.user.name)
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Data:'),
            React.createElement(Text, { style: styles.value }, eventDate)
          ),
          React.createElement(
            View,
            { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Local:'),
            React.createElement(Text, { style: styles.value }, event.location)
          ),
          React.createElement(View, { style: styles.divider }),
          React.createElement(
            View,
            { style: styles.qrSection },
            React.createElement(Image, { style: styles.qrImage, src: ticket.qrCode }),
            React.createElement(Text, { style: styles.codeText }, ticket.code)
          )
        ),
        React.createElement(
          Text,
          { style: styles.footer },
          'Apresente este ingresso na entrada. Ingresso válido para uma pessoa.'
        )
      )
    )
  )

  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}

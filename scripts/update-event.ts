/**
 * One-time script: update event date, location and ticket prices.
 * Run with: npx tsx scripts/update-event.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const event = await prisma.event.findFirst({ where: { isActive: true } })
  if (!event) { console.error('No active event found'); process.exit(1) }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      date: new Date('2026-06-19T18:30:00-03:00'),
      location: 'Quintal Escola Feitos de Cem',
    },
  })
  console.log(`✓ Event updated: ${event.name}`)
  console.log(`  date     → sexta-feira, 19 de junho de 2026 às 18:30`)
  console.log(`  location → Quintal Escola Feitos de Cem`)

  // Update ticket prices
  const types = await prisma.ticketType.findMany({ where: { eventId: event.id } })
  for (const tt of types) {
    const nameLower = tt.name.toLowerCase()
    if (nameLower.includes('inteira') || nameLower.includes('adulto')) {
      await prisma.ticketType.update({ where: { id: tt.id }, data: { price: 1800 } })
      console.log(`  ✓ "${tt.name}" → R$ 18,00`)
    } else if (nameLower.includes('meia') || nameLower.includes('estudante') || nameLower.includes('criança')) {
      await prisma.ticketType.update({ where: { id: tt.id }, data: { price: 1000 } })
      console.log(`  ✓ "${tt.name}" → R$ 10,00`)
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

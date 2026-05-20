import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })
config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.ticket.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.ticketType.deleteMany()
  await prisma.event.deleteMany()

  const event = await prisma.event.create({
    data: {
      name: 'Arraiá nu Quintal 2',
      description:
        'O maior arraiá da cidade! Venha curtir forró, quadrilha, comidas típicas e muito mais. Uma noite inesquecível para toda a família.',
      date: new Date('2026-06-19T18:30:00-03:00'),
      location: 'Quintal Escola Feitos de Cem',
      isActive: true,
      ticketTypes: {
        create: [
          {
            name: 'Inteira',
            description: 'Ingresso inteiro com acesso a todas as atrações',
            price: 3000,
            stock: 200,
            sortOrder: 0,
          },
          {
            name: 'Meia-Entrada',
            description:
              'Estudantes, idosos e pessoas com deficiência (apresentar documento)',
            price: 1500,
            stock: 100,
            sortOrder: 1,
          },
          {
            name: 'Criança (até 10 anos)',
            description: 'Para crianças de até 10 anos',
            price: 1000,
            stock: 150,
            sortOrder: 2,
          },
        ],
      },
    },
  })

  console.log(`Created event: ${event.name}`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

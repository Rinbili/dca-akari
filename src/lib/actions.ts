import { auth } from '@/auth'
import { Prisma } from '@prisma/client'
import prisma from './prisma'

const ITEMS_PER_PAGE = 10

export async function getTickets(query: string) {
  const authData = await auth()
  const filter: Prisma.TicketFindManyArgs = !!authData?.user?.isAdmin
    ? {
        where: {
          OR: [
            { id: { contains: query } },
            { content: { contains: query } },
            { contact: { contains: query } },
          ],
        },
      }
    : {
        where: {
          OR: [
            {
              id: query,
            },
            {
              AND: {
                OR: [
                  { id: { contains: query } },
                  { content: { contains: query } },
                  { contact: { contains: query } },
                ],
                requestorId: authData?.user?.id || '',
              },
            },
          ],
        },
      }
  return prisma.ticket.findMany(filter)
}

export async function getTicketPages(query: string) {
  const authData = await auth()
  const filter: Prisma.TicketCountArgs = !!authData?.user?.isAdmin
    ? {
        where: {
          OR: [
            {
              id: {
                contains: query,
              },
            },
            {
              content: {
                contains: query,
              },
            },
            {
              contact: {
                contains: query,
              },
            },
          ],
        },
      }
    : {
        where: {
          OR: [
            {
              id: query,
            },
            {
              requestorId: authData?.user?.id,
            },
          ],
        },
      }
  const count = await prisma.ticket.count(filter)
  const pages = Math.ceil(count / ITEMS_PER_PAGE)
  return pages
}

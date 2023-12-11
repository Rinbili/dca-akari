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

export async function pushMessage({
  content,
  summary,
  uid,
  topic,
}: {
  content: string
  summary?: string
  uid?: string
  topic?: boolean
}) {
  // TODO: Better way to get user
  let pushUid: string[] = []
  if (!!uid) {
    const user = await prisma.user.findUnique({
      where: {
        id: uid,
      },
    })
    if (!!user && !!user.pushUid) {
      pushUid.push(user.pushUid)
    }
  }

  const topicId = topic ? process.env.WXPUSHER_TOPIC_ID : undefined
  const postData = {
    appToken: process.env.WXPUSHER_APP_TOKEN,
    content: content,
    summary: summary,
    contentType: 1,
    topicIds: [topicId],
    uids: pushUid,
    url: process.env.URL,
    verifyPay: false,
  }
  console.log(JSON.stringify(postData))
  await fetch('https://wxpusher.zjiecode.com/api/send/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  })
}

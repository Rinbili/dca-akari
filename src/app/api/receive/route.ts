import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic' // defaults to force-static
export async function POST(request: Request) {
  const { action, data } = await request.json()
  console.log(!!data.extra)
  console.log(!!data.uid)

  switch (action) {
    case 'app_subscribe':
      if (String(data.appId) === process.env.WXPUSHER_APP_ID) {
        if (!!data.uid && !!data.extra) {
          await prisma.user.update({
            where: {
              id: data.extra,
            },
            data: {
              pushUid: data.uid,
            },
          })
          return Response.json({ code: 200, message: 'success' })
        }
      }
      return Response.json({ code: 400, message: 'data error' })
  }
}

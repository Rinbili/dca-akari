'use server';
import { auth } from '@/auth';
import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export type State = {
  message: string | null;
  errors: { [key: string]: string[] };
};

export async function createTicket(prevState: State, formData: FormData) {
  const authData = await auth();
  const schema = z.object({
    deviceType: z.enum(['desktop', 'laptop', 'other'], {
      invalid_type_error: '请选择正确的设备类型',
    }),
    content: z
      .string({ invalid_type_error: '请输入正确的故障描述' })
      .min(5, '请详细描述您的故障'),
    contact: z
      .string({ invalid_type_error: '请输入正确的联系方式' })
      .min(5, '请确定您的联系方式'),
  });
  const validatedFields = schema.safeParse({
    deviceType: formData.get('deviceType'),
    content: formData.get('content'),
    contact: formData.get('contact'),
  });
  if (!validatedFields.success) {
    return {
      message: '缺少必要的字段',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const result = await prisma.ticket.create({
    data: validatedFields.data,
  });

  if (!!authData?.user) {
    await prisma.ticket.update({
      where: { id: result.id },
      data: { requestorId: authData?.user.id },
    });
    await pushMessage({
      content: `收到您的报修，报修ID: ${result.id}`,
      summary: `报修成功`,
      uid: authData?.user.id,
    });
  }

  await pushMessage({
    content: `有新的报修，报修ID: ${result.id}`,
    summary: `新的报修`,
    topic: true,
  });

  redirect(`query/${result.id}`);
}

export async function getTickets(query: string, page: number) {
  const authData = await auth();
  const filter: Prisma.TicketFindManyArgs = !!authData?.user?.isAdmin
    ? {
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
        where: {
          OR: [
            { id: { contains: query } },
            { content: { contains: query } },
            { contact: { contains: query } },
          ],
        },
      }
    : {
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
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
      };
  return prisma.ticket.findMany(filter);
}

export async function getTicketPages(query: string) {
  const authData = await auth();
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
      };
  const count = await prisma.ticket.count(filter);
  return Math.ceil(count / ITEMS_PER_PAGE);
}

export async function pushMessage({
  content,
  summary,
  uid,
  topic,
}: {
  content: string;
  summary?: string;
  uid?: string;
  topic?: boolean;
}) {
  // TODO: Better way to get user
  let pushUid: string[] = [];
  if (!!uid) {
    const user = await prisma.user.findUnique({
      where: {
        id: uid,
      },
    });
    if (!!user && !!user.pushUid) {
      pushUid.push(user.pushUid);
    }
  }

  const topicId = topic ? process.env.WXPUSHER_TOPIC_ID : undefined;
  const postData = {
    appToken: process.env.WXPUSHER_APP_TOKEN,
    content: content,
    summary: summary,
    contentType: 1,
    topicIds: [topicId],
    uids: pushUid,
    url: process.env.URL,
    verifyPay: false,
  };
  console.log(JSON.stringify(postData));
  await fetch('https://wxpusher.zjiecode.com/api/send/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
}

export async function getQRCodeUrl(id: string) {
  const res = await fetch(
    `https://wxpusher.zjiecode.com/api/fun/create/qrcode`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appToken: process.env.WXPUSHER_APP_TOKEN,
        extra: id,
      }),
    },
  );
  const { msg, data, success } = await res.json();
  if (!success) {
    return 'https://http.cat/images/404.jpg';
  }
  return data.url;
}

export async function authByCAS(ticket: string) {
  const resp = await fetch(
    `https://auth.dgut.edu.cn/authserver/serviceValidate?service=${process.env.URL}${process.env.BASE_PATH}/cas&ticket=${ticket}`,
    { cache: 'no-store' },
  );
  return resp.text();
}

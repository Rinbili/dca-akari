import { auth } from '@/auth';
import { pushMessage } from '@/lib/actions';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
export default async function Home({ params }: { params: { slug: string } }) {
  const authData = await auth();

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: params.slug,
    },
    include: {
      Assignee: true,
    },
  });
  if (!ticket) {
    redirect('/query?notFound=true');
  }
  return (
    <div className='p-4 md:mx-24'>
      <ul className='steps w-full'>
        <li className='step step-accent'>提交报修</li>
        <li className={`step ${ticket.Assignee.length !== 0 && 'step-accent'}`}>
          干事接单
        </li>
        <li className={`step ${ticket.finished && 'step-accent'}`}>完成维修</li>
        <li className={`step ${ticket.evaluation && 'step-accent'}`}>
          用户评价
        </li>
      </ul>
      <div className='form-control mt-4 px-[5%] md:px-[10%]'>
        <label className='form-control w-full '>
          <div className='label'>
            <span className='label-text'>报修ID(可通过此ID查询进度)</span>
          </div>
          <input
            type='text'
            className='input input-bordered w-full '
            readOnly
            value={ticket.id}
          />
        </label>
        <label className='form-control w-full '>
          <div className='label'>
            <span className='label-text'>设备类型</span>
          </div>
          <input
            type='text'
            className='input input-bordered w-full '
            readOnly
            disabled
            placeholder={ticket.deviceType}
          />
        </label>
        <label className='form-control w-full '>
          <div className='label'>
            <span className='label-text'>故障内容</span>
          </div>
          <textarea
            className='textarea h-24'
            readOnly
            disabled
            placeholder={ticket.content}
          />
        </label>
        {!!authData?.user?.isAdmin && (
          <label className='form-control w-full '>
            <div className='label'>
              <span className='label-text'>联系方式</span>
            </div>
            <input
              type='text'
              className='input input-bordered w-full'
              readOnly
              value={ticket.contact}
            />
          </label>
        )}
        <label className='form-control w-full '>
          <div className='label'>
            <span className='label-text'>报修时间</span>
          </div>
          <input
            type='text'
            className='input input-bordered w-full'
            readOnly
            disabled
            value={ticket.createdAt.toISOString()}
          />
        </label>

        <label className='form-control w-full '>
          <div className='label'>
            <span className='label-text'>接单干事</span>
          </div>
          {!!authData?.user?.isAdmin && (
            <table className='table w-full'>
              <thead>
                <tr>
                  <th>干事UID</th>
                </tr>
              </thead>
              <tbody>
                {ticket.Assignee.map((assignee) => (
                  <tr key={assignee.id}>
                    <td>{assignee.uid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </label>
        <div className='divider'></div>
        {!!authData?.user?.isAdmin &&
          ticket.Assignee.length !== 0 &&
          !ticket.finished && (
            <>
              <form
                action={async () => {
                  'use server';
                  // TODO: one time only
                  await prisma.ticket.update({
                    where: {
                      id: ticket.id,
                    },
                    data: {
                      Assignee: {
                        connect: {
                          id: authData?.user?.id,
                        },
                      },
                    },
                  });
                  await pushMessage({
                    content: `你接了一单报修，报修ID:${ticket.id}`,
                    summary: '接单成功',
                    uid: authData?.user?.id,
                  });
                  revalidatePath(`/query/${ticket.id}`);
                }}
              >
                <button className='btn btn-accent w-full'>接单</button>
              </form>
              <div className='divider'></div>
            </>
          )}
        {!!authData?.user?.isAdmin && !ticket.finished && (
          <form
            action={async () => {
              'use server';
              await prisma.ticket.update({
                where: {
                  id: ticket.id,
                },
                data: {
                  finished: true,
                },
              });
              await pushMessage({
                content: `你完成了一单报修，报修ID:${ticket.id}`,
                summary: '完成报修',
                uid: authData?.user?.id,
              });
              revalidatePath(`/query/${ticket.id}`);
            }}
          >
            <button className='btn btn-primary w-full'>完成报修</button>
          </form>
        )}
      </div>
    </div>
  );
}

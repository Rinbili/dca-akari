import { auth } from '@/auth'
import { getQRCodeUrl } from '@/lib/actions'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function Page() {
  const authData = await auth()
  const user = await prisma.user.findUnique({
    where: {
      id: authData?.user.id,
    },
  })
  const qrcodeUrl = user && (await getQRCodeUrl(user.id))

  return (
    <div className='p-4 md:mx-24'>
      {!user?.pushUid && (
        <div role='alert' className='alert alert-warning'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='stroke-current shrink-0 h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
          <span>
            您还没有绑定WxPusher的UID，将无法收到报修消息的推送，扫码获取WxPusherUID：
          </span>
          <img src={qrcodeUrl} alt='qrcode' width={200} height={200} />
        </div>
      )}
      <form
        action={async (formData: FormData) => {
          'use server'
          const pushId = formData.get('pushId')
          await prisma.user.update({
            where: {
              id: user?.id,
            },
            data: {
              pushUid: pushId?.toString(),
            },
          })
          redirect('/profile')
        }}
        className='form-control'
      >
        <label className='label'>
          <span className='label-text'>UID</span>
        </label>
        <input
          type='text'
          className='input input-bordered'
          readOnly
          disabled
          value={user?.uid}
        />
        <label className='label'>
          <span className='label-text'>WxPusherUID</span>
        </label>
        <input
          type='text'
          name='pushId'
          className='input input-bordered'
          defaultValue={!!user?.pushUid ? user?.pushUid : ''}
        />
        <div className='divider'></div>
        <button className='btn btn-primary'>保存</button>
      </form>
    </div>
  )
}

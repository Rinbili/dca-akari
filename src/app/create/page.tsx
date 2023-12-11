import prisma from '@/lib/prisma'
import { z } from 'zod'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { pushMessage } from '@/lib/actions'

const schema = z.object({
  deviceType: z.enum(['desktop', 'laptop', 'other']),
  content: z.string(),
  contact: z.string(),
})

export default async function Page() {
  const authData = await auth()

  async function handleSubmit(formData: FormData) {
    'use server'

    const validatedFields = schema.safeParse({
      deviceType: formData.get('deviceType'),
      content: formData.get('content'),
      contact: formData.get('contact'),
    })
    if (!validatedFields.success) {
      return validatedFields.error
    }

    const result = await prisma.ticket.create({
      data: validatedFields.data,
    })

    if (!!authData?.user) {
      await prisma.ticket.update({
        where: { id: result.id },
        data: { requestorId: authData?.user.id },
      })
      await pushMessage({
        content: `收到您的报修，报修ID: ${result.id}`,
        summary: `报修成功`,
        uid: authData?.user.id,
      })
    }

    await pushMessage({
      content: `有新的报修，报修ID: ${result.id}`,
      summary: `新的报修`,
      topic: true,
    })

    redirect(`query/${result.id}`)
  }

  return (
    <div className='p-4 md:mx-24'>
      {!authData?.user && (
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
          <span>当前未登陆，推荐在页面右上角登陆后使用本服务</span>
        </div>
      )}
      <form action={handleSubmit} className='form-control'>
        <label className='label'>
          <span className='label-text'>设备类型</span>
        </label>
        <select name='deviceType' className='select select-bordered' required>
          <option value='laptop'>笔记本</option>
          <option value='desktop'>台式机</option>
          <option value='other'>其他</option>
        </select>
        <label className='label'>
          <span className='label-text'>故障描述</span>
        </label>
        <textarea
          name='content'
          placeholder='请输入故障描述'
          className='textarea textarea-bordered h-36'
          required
        />
        <label className='label'>
          <span className='label-text'>联系方式</span>
        </label>
        <input
          type='text'
          name='contact'
          placeholder='如「微信号:***」，确保能够联系到您'
          className='input input-bordered'
          required
        />
        <div className='divider'></div>
        <button type='submit' className='btn btn-primary'>
          提交
        </button>
      </form>
    </div>
  )
}

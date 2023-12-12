import { signIn, auth } from '@/auth'
import { CallbackRouteError } from '@auth/core/errors'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string }
}) {
  const callbackUrl =
    searchParams['callbackUrl'] || `${process.env.URL}${process.env.BASE_PATH}/profile`
  const authData = await auth()
  !!authData?.user && redirect(callbackUrl)

  const token = searchParams['token']

  if (!token) {
    redirect(
      `${process.env.SSO_URL}?client_id=${process.env.CLIENT_ID}&uri=${process.env.URL}${process.env.BASE_PATH}/cas`
    )
  }

  async function handleSubmit(formData: FormData) {
    'use server'

    try {
      await signIn('credentials', formData)
    } catch (e) {
      if (e instanceof CallbackRouteError) console.log(e)
      else redirect(callbackUrl)
    }
  }

  return (
    <div className='p-4 mx-24'>
      <form action={handleSubmit} className='form-control items-center'>
        <input type='text' hidden readOnly name='token' value={token} />
        <label className='label cursor-pointer'>
          <span className='label-text'>允许我们使用您的信息以完成登录</span>
          <input type='checkbox' className='toggle  toggle-accent' required />
        </label>
        <input type='submit' className='btn btn-accent' value='登陆' />
      </form>
    </div>
  )
}

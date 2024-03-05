import { signIn, auth } from '@/auth';
import { CallbackRouteError } from '@auth/core/errors';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const next =
    searchParams['next'] ||
    `${process.env.URL}${process.env.BASE_PATH}/profile`;
  const authData = await auth();
  !!authData?.user && redirect(next);

  const ticket = searchParams['ticket'];

  if (!ticket) {
    redirect(
      `https://auth.dgut.edu.cn/authserver/login?service=${process.env.URL}${process.env.BASE_PATH}/cas`,
    );
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', formData);
    } catch (e) {
      if (!(e instanceof CallbackRouteError)) redirect(next);
    }
  }

  return (
    <div className='p-4 mx-24'>
      <form action={handleSubmit} className='form-control items-center'>
        <input type='text' hidden readOnly name='ticket' value={ticket} />
        <label className='label cursor-pointer'>
          <span className='label-text'>允许我们使用您的信息以完成登录</span>
          <input type='checkbox' className='toggle  toggle-accent' required />
        </label>
        <input type='submit' className='btn btn-accent' value='登陆' />
      </form>
    </div>
  );
}

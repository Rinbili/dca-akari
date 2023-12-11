import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NotFound() {
  return (
    <main className='flex h-full flex-col items-center justify-center gap-2'>
      <img src='https://http.cat/images/404.jpg' alt='404' />
      <h2 className='text-xl font-semibold'>页面不存在</h2>
      <form
        action={async () => {
          'use server'
          redirect('/')
        }}
        className='form-control'
      >
        <Link href='/' className='btn btn-error'>
          回首页
        </Link>
      </form>
    </main>
  )
}

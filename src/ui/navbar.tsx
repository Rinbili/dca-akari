import Link from 'next/link'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Nav() {
  const authData = await auth()
  return (
    <div className='navbar bg-base-100'>
      <div className='flex-1'>
        <Link href={`/`} className='btn btn-ghost text-xl'>
          akari
        </Link>
      </div>
      {!!authData?.user ? (
        <div className='flex-none dropdown dropdown-end'>
          <button
            tabIndex={0}
            role='button'
            className='btn btn-square btn-ghost'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='inline-block w-5 h-5 stroke-current'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
              ></path>
            </svg>
          </button>
          <ul
            tabIndex={0}
            className='mt-3 z-[100] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52'
          >
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: process.env.BASE_PATH })
              }}
            >
              <li>
                <Link href='/profile'>
                  <button className='min-w'>个人资料</button>
                </Link>
                <button className='min-w'>登出系统</button>
              </li>
            </form>
          </ul>
        </div>
      ) : (
        <ul
          tabIndex={0}
          className='mt-3 z-[100] p-2 shadow menu menu-xs dropdown-content bg-base-100 rounded-box w-52'
        >
          <li>
            <Link href={`/cas`}>中央认证登陆(仅限校园网)</Link>
          </li>
        </ul>
      )}
    </div>
  )
}

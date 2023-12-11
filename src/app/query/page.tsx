import { auth } from '@/auth'
import { getTickets } from '@/lib/actions'
import Search from '@/ui/search'
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string
    page?: string
  }
}) {
  const authData = await auth()
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const invoices = await getTickets(query)

  return (
    <main className='p-4 md:mx-24'>
      <Search />
      <table className='table w-full'>
        <thead>
          <tr>
            <th>报修ID</th>
            <th>设备类型</th>
            <th>故障内容</th>
            {!!authData?.user?.isAdmin && <th>联系方式</th>}
            <th>报修时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.deviceType}</td>
              <td>{invoice.content}</td>
              {!!authData?.user?.isAdmin && <td>{invoice.contact}</td>}
              <td>{invoice.createdAt.toISOString()}</td>
              <td>{invoice.finished ? '已完成' : '未完成'}</td>
              <td>
                <Link
                  href={`/query/${invoice.id}`}
                  className='btn btn-primary btn-sm'
                >
                  查看
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

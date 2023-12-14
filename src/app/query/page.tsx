import { auth } from '@/auth'
import { getTicketPages, getTickets } from '@/lib/actions'
import Pagination from '@/ui/pagination'
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
  const invoices = await getTickets(
    query,
    isNaN(Number(searchParams?.page)) ? 1 : Number(searchParams?.page)
  )
  const totalPages = await getTicketPages(query)

  return (
    <div className='p-4 md:mx-24'>
      <div className='w-full'>
        <Search />
        <table className='table w-full'>
          <thead>
            <tr>
              <th>报修ID</th>
              <th>设备类型</th>
              <th className='hidden md:table-cell'>故障内容</th>
              {!!authData?.user?.isAdmin && (
                <th className='hidden md:table-cell'>联系方式</th>
              )}
              <th className='hidden md:table-cell'>报修时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.deviceType}</td>
                <td className='hidden md:table-cell'>{invoice.content}</td>
                {!!authData?.user?.isAdmin && (
                  <td className='hidden md:table-cell'>{invoice.contact}</td>
                )}
                <td className='hidden md:table-cell'>
                  {invoice.createdAt.toISOString()}
                </td>
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
        <div className='divider text-center'>
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}

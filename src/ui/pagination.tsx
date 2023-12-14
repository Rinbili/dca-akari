'use client'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className='join'>
      {currentPage !== 1 && (
        <Link href={createPageURL(currentPage - 1)} className='join-item btn'>
          «
        </Link>
      )}
      <button className='join-item btn'>
        {totalPages === 0 ? '无结果' : `Page ${currentPage}`}
      </button>
      {currentPage !== totalPages && totalPages !== 0 && (
        <Link href={createPageURL(currentPage + 1)} className='join-item btn'>
          »
        </Link>
      )}
    </div>
  )
}

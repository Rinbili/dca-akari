import Link from 'next/link';

export default async function Home() {
  return (
    <div className='m-4 grid grid-cols-1 md:grid-cols-2 justify-items-center gap-12'>
      <div className='card w-full bg-base-100 shadow-xl image-full'>
        <figure>
          <img src={`${process.env.BASE_PATH}/win-blue.jpeg`} alt='Shoes' />
        </figure>
        <div className='card-body'>
          <p className='card-title'>我要报修</p>
          <div className='card-actions justify-end'>
            <Link href='/create' className='btn btn-circle btn-lg'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 20L12 4M4 12l16 0'
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <div className='card w-full bg-base-100 shadow-xl image-full'>
        <figure>
          <img src={`${process.env.BASE_PATH}/repairing.jpeg`} alt='Shoes' />
        </figure>
        <div className='card-body'>
          <p className='card-title'>我要查询</p>
          <div className='card-actions justify-end'>
            <Link href='/query' className='btn btn-circle  btn-lg'>
              <svg
                className='h-6 w-6 text-base-content'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <input type='checkbox' id='search_modal' className='modal-toggle' />
    </div>
  );
}

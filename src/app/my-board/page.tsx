'use client'

import { MyPoolList } from '@/components/my-board/my-pool-list'

export default function MyBoard() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="mt-6 flex flex-1 flex-col gap-4">
        <MyPoolList />
      </div>
    </div>
  )
}

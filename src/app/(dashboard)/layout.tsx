import { Sidebar } from '@/components/layout/sidebar'
import React from 'react'

export default function DashboardLayout(
    {children}: {children: React.ReactNode}
) {
  return (
    <>
    <div className='flex flex-row'>
    <Sidebar/>
    <main className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
    {children}
    </main>
      
    </div>
    </>
  )
}

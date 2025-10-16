import Header from '@/components/header'
import SideBar from '@/components/sidebar'
import React from 'react'
const CustomLayout:React.FC<{ children: React.ReactNode}> = ({children}) => {
  return (
      <div className="min-h-screen w-full relative overflow-auto">
        <Header/>
        <main className='flex w-full min-h-screen h-screen overflow-hidden'>
          <SideBar/>
          {children}
        </main>
      </div>
  )
}

export default CustomLayout

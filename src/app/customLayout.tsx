import Header from '@/components/header'
import SideBar from '@/components/sidebar'
import React from 'react'
const CustomLayout:React.FC<{ children: React.ReactNode}> = ({children}) => {
  return (
      <div className="min-h-screen w-full relative overflow-hidden">
        <Header/>
        <main className='flex w-full h-screen'>
          <SideBar/>
          {children}
        </main>
      </div>
  )
}

export default CustomLayout

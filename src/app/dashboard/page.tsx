'use client'
import React, { useEffect } from 'react'
import CustomLayout from '../customLayout'
import { useM } from '../context'

const Dashboard:React.FC = () => {
  const { setHeaderTitle } = useM();

  useEffect(() => {
    setHeaderTitle('Dashboard');
  }, []);
  return (
    <CustomLayout>
        <div className='w-full px-6 py-6'>
          dashboard
        </div>
    </CustomLayout>
  )
}

export default Dashboard

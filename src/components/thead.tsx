import { useM } from '@/app/context'
import React from 'react'

const Thead:React.FC<{ children: React.ReactNode}> = ({children}) => {
    const {table, txt} = useM()
  return (
    <thead className={`${table} ${txt} uppercase tracking-wide`}>
        {children}
    </thead>
  )
}

export default Thead

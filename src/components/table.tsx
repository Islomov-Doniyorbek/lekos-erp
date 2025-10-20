import React from 'react'

const Table:React.FC<{ children: React.ReactNode}> = ({children}) => {
  return (
    <table className="border-collapse w-full text-sm shadow-md rounded-xl">
        {children}
    </table>
  )
}

export default Table

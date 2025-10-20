import React from 'react'

const TableWrap:React.FC<{ children: React.ReactNode}> = ({children}) => {
  return (
    <div className="overflow-x-auto  pt-1 pb-15  border-t-0 rounded-2xl">
        {children}
    </div>
  )
}

export default TableWrap

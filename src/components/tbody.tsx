import React from 'react'

const Tbody:React.FC<{ children: React.ReactNode}> = ({children}) => {
  return (
    <tbody className={`divide-y divide-gray-200`}>
        {children}
    </tbody>
  )
}

export default Tbody

import { useM } from '@/app/context'
import React, { useState } from 'react'

const Alert = () => {
    const [isConfirm, setIsConfirm] = useState(false)
    const {isCLosed, toggleAlert} = useM()
  return (
    <div className={`${isCLosed ? "block" : "hidden"} z-50 fixed top-1.5 left-1/2 -translate-x-1/2`}>
      <p>Amalni tasdiqlaysizmi?!</p>
      <p>
        <button onClick={()=>{setIsConfirm(true); toggleAlert()}}>Ha</button>
        <button onClick={()=>{setIsConfirm(false); toggleAlert()}}>Yo`q</button>
      </p>
    </div>
  )
}

export default Alert

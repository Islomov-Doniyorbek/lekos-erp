'use client'
import React, { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { MdClose, MdMenu, MdSettings } from 'react-icons/md'
import { useM } from '@/app/context'

const Header: React.FC = () => {
  
  const clrMode = [
    {
      id:0,
      bg: "bg-blue-800",
      mainBg: "bg-blue-950",
      bg2: "bg-blue-900",
      txt: "text-white",
      borderClr1: "",
      title: "Standart"
    },
    {
      id:2,
      bg: "bg-green-700",
      mainBg: "bg-green-700",
      bg2: "bg-green-700",
      txt: "bg-white",
      borderClr1: "border-green-500",
      title: "Excel"
    },
  ]

  const [isOpenClrList, setIsOpenClrList] = useState(false)

  const {toggleMenu, bg, txt, getTheme} = useM()

  return (
    <header className={`w-full ${bg}`}>
      <div className="flex py-1.5 justify-between">
        <div className="flex items-center gap-4 px-2 w-28 ">
          <MdMenu onClick={()=>toggleMenu()} className={`block lg:hidden text-4xl ${txt}`} />
          <span className={`text-2xl text-center font-semibold font-[monospace] ${txt}`}>Lekos ERP</span>
        </div>
        <div className={`flex relative justify-end items-center gap-4 px-2 w-40 ${txt} `}>
          <MdSettings onClick={()=>setIsOpenClrList(prev=>!prev)} className='text-4xl cursor-pointer font-semibold font-[cursive] hover:text-yellow-400 hover:drop-shadow-[0_0_6px_rgb(255,255,0)]' />
          <FaUserCircle className='text-4xl cursor-pointer font-semibold font-[cursive] hover:text-yellow-400 hover:drop-shadow-[0_0_6px_rgb(255,255,0)]' />
          <ul className={`${isOpenClrList ? "block" : "hidden"} top-1 bg-blue-50 text-blue-950 pt-1.5 w-40 absolute`}>
            <li className='flex gap-2.5 items-center py-1.5 px-2' onClick={()=>setIsOpenClrList(prev=>!prev)}>
              <MdClose className='cursor-pointer'/> Tizim mavzusi
            </li>
             {clrMode.map(clr=>{
              return (
                <li onClick={()=>{
                  getTheme(clr.bg, clr.txt, clr.bg2, clr.mainBg);
                  setIsOpenClrList(prev=>!prev)
                }} className={`text-white ${bg} border-b py-1.5 px-2 cursor-pointer flex items-center gap-2.5`} key={clr.id}>
                  <div className={`w-3 h-3 rounded-full ${clr.bg}`}></div>
                  {clr.title}</li>
              )
             })} 
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header

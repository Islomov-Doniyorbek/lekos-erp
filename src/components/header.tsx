"use client"
import React, { useState, useEffect } from 'react'
import { FaUserCircle } from 'react-icons/fa'
import { MdClose, MdMenu, MdSettings } from 'react-icons/md'
import { useM } from '@/app/context'

const Header: React.FC = () => {
  const clrMode = [
    {
      id:0,
      headerClr: "bg-[#0f3a57]",
      sidebar: "bg-[#185d8b]",
      table: "bg-[#2280bf]",
      innerTable: "bg-[#3498db]",
      activeRow: "bg-[#63b0e3]",
      activeInRow: "bg-[#97caed]",
      othClr: "bg-[#cbe5f6]",
      othClr2: "bg-[#eef6fc]",
      title: "Standart"
    },
    {
      id:1,
      headerClr: "bg-[#007415]",
      sidebar: "bg-[#008719]",
      table: "bg-[#139f2d]",
      innerTable: "bg-[#3498db]",
      activeRow: "bg-[#63b0e3]",
      activeInRow: "bg-[#97caed]",
      othClr: "bg-[#cbe5f6]",
      othClr2: "bg-[#eef6fc]",
      title: "Excel"
    },
  ]

  const [isOpenClrList, setIsOpenClrList] = useState(false)
  const [username, setUsername] = useState('')

  const { toggleMenu, headerClr, txt, getTheme } = useM()

  useEffect(() => {
    // Faqat browserda ishlaydi
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) setUsername(storedUsername)
  }, [])

  return (
    <header className={`w-full ${headerClr}`}>
      <div className="flex py-3 justify-between">
        <div className="flex items-center gap-4 px-2 w-28 ">
          <MdMenu onClick={() => toggleMenu()} className={`block lg:hidden text-4xl ${txt}`} />
          <span className={`text-2xl text-center font-semibold font-[monospace] ${txt}`}>{username}</span>
        </div>
        <div className={`flex relative justify-end items-center gap-4 px-2 w-40`}>
          <MdSettings
            onClick={() => setIsOpenClrList(prev => !prev)}
            className="text-4xl text-yellow-400 cursor-pointer font-semibold font-[cursive] hover:text-yellow-400 hover:drop-shadow-[0_0_6px_rgb(255,255,0)]"
          />
          <FaUserCircle className="text-4xl text-yellow-400 cursor-pointer font-semibold font-[cursive] hover:text-yellow-400 hover:drop-shadow-[0_0_6px_rgb(255,255,0)]" />
          <ul className={`${isOpenClrList ? "block" : "hidden"} rounded-2xl top-1 pt-1.5 w-40 absolute`}>
            <li className={`flex ${headerClr} ${txt} gap-2.5 items-center py-1.5 px-2`} onClick={() => setIsOpenClrList(prev => !prev)}>
              <MdClose className="cursor-pointer" /> Tizim mavzusi
            </li>
            {clrMode.map(clr => (
              <li
                onClick={() => {
                  getTheme(
                    clr.headerClr,
                    clr.sidebar,
                    clr.table,
                    clr.innerTable,
                    clr.activeRow,
                    clr.activeInRow,
                    clr.othClr,
                    clr.othClr2
                  )
                  setIsOpenClrList(prev => !prev)
                }}
                className={`text-white ${headerClr} border-b py-1.5 px-2 cursor-pointer flex items-center gap-2.5`}
                key={clr.id}
              >
                <div className={`w-3 h-3 rounded-full border border-amber-50 ${clr.headerClr}`}></div>
                {clr.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header

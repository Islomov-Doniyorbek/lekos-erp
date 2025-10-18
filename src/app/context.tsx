'use client'
import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

type MenuContextType = {
  isOpen: boolean
  isCLosed: boolean
  toggleMenu: () => void
  toggleAlert: () => void
  setFakturaCountQuant: (c: number) => void
  setHeaderTitle: (title: string) => void
  register: (
    email: string,
    password: string,
    fullname: string,
    username: string,
    stir: string,
    phone: string
  ) => Promise<void>
  login: (password: string, username: string) => Promise<void>
  header: string,
  fakturaCount: number,
  headerClr:string, sidebar:string, table:string, innerTable:string, activeRow: string, activeInRow: string, othClr: string, othClr2: string
  txt: string,
  getTheme: (headerClr:string, sidebar:string, table:string, innerTable:string, activeRow: string, activeInRow: string, othClr: string, othClr2: string) => void
}

export const Mcontext = createContext<MenuContextType | undefined>(undefined)

const MProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCLosed, setIsClosed] = useState(false)
  // const [isSideBar, setIsSidebar] = useState(false)
  const [header, setHeader] = useState('')
  const [fakturaCount, setFakturaCount] = useState(0)
  const toggleMenu = () => setIsOpen((prev) => !prev)
  const toggleAlert = () => setIsClosed((prev) => !prev)
  const setHeaderTitle = (title: string) => setHeader(title)
  const setFakturaCountQuant = (c: number) => setFakturaCount(c)

  // ✅ register
  async function register(
    email: string,
    password: string,
    name: string,
    username: string,
    stir: string | null,
    phone: string | null
  ): Promise<void> {

    const reg = {
      email: email,
      password: password,
      username: username,
      name: name,
      phone: phone ? phone : null,
      tin: stir ? stir : null
    }
    try {
      const res = await axios.post('https://fast-simple-crm.onrender.com/api/v1/auth/register', reg)
      console.log('✅ Ro‘yxatdan o‘tdi:', res.data)
      return res.data
    } catch (error) {
      console.error('❌ Register xatosi:', error)
      throw error
    }
  }









// localStorage.clear()

   const login = async (username: string, password: string) => {
  try {
    const res = await axios.post(
      "https://fast-simple-crm.onrender.com/api/v1/auth/login",
      new URLSearchParams({ username, password }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const data = res.data;
    console.log(data);
    
    // Tokenlarni localStorage ga yozamiz
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);


    return data;
  } catch (err) {
    console.error("❌ Login xatosi:", err);
    throw err;
  }
};











  const [headerClr, setHeaderClr] = useState('bg-[#0f3a57]')
  const [sidebar, setSidebar] = useState('bg-[#185d8b]')
  const [table, setTable] = useState('bg-[#2280bf]')
  const [innerTable, setInnerTable] = useState('bg-[#3498db]')
  const [activeRow, setActiveRow] = useState('bg-[#63b0e3]')
  const [activeInRow, setActiveInRow] = useState('bg-[#97caed]')
  const [othClr, setOthClr] = useState('bg-[#cbe5f6]')
  const [othClr2, setOthClr2] = useState('bg-[#eef6fc]')
  const [txt, setTxt] = useState('text-blue-100')

  const getTheme = (headerClr:string, sidebar:string, table:string, innerTable:string, activeRow: string, activeInRow: string, othClr: string, othClr2: string) => {
    setHeaderClr(headerClr)
    setSidebar(sidebar)
    setTable(table)
    setInnerTable(innerTable)
    setActiveRow(activeRow)
    setActiveInRow(activeInRow)
    setOthClr(othClr)
    setOthClr2(othClr2)


    setTxt(txt)
  }

  return (
    <Mcontext.Provider
      value={{
        setHeaderTitle,
        setFakturaCountQuant,
        toggleMenu,
        toggleAlert,
        isOpen,
        isCLosed,
        header,
        fakturaCount,
        register,
        login,
        headerClr,
        sidebar,
        table,
        innerTable,
        activeRow,
        activeInRow,
        othClr,
        othClr2,
        txt,
        getTheme
      }}
    >
      {children}
    </Mcontext.Provider>
  )
}

export const useM = () => {
  const ctx = useContext(Mcontext)
  if (!ctx) throw new Error('useM faqat MProvider ichida ishlatiladi')
  return ctx
}

export default MProvider

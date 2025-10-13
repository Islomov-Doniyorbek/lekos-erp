'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useM } from '../context'
import { MdDangerous } from 'react-icons/md'
import Image from 'next/image'
import Logo from "../../../public/logo-2-vectr.svg"
const Auth: React.FC = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [stir, setStir] = useState('')
  const [phone, setPhone] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [btnLoader, setBtnLoader] = useState(false)
  const { login, register} = useM()
 

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const userData = await login(username, password);
    console.log("User info:", userData);
    setBtnLoader(false)
    setIsSuccess(true)
    
    setTimeout(() => {
      router.push("/sales");
    }, 1000);
  } catch (err: unknown) {
    if (err instanceof Error) {
      alert(err.message); 
      console.log(err);
    } else {
      alert(String(err));
      console.log(err);
    }
  }
};

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const userData = await register(email, password, fullname, username, stir, phone) // ✅ tartib to‘g‘rilandi
    console.log("User info:", userData)
    alert("Success")
    setIsForm(false)
    router.push("/auth");
    setIsForm(true)
  } catch (err) {
    alert(err || "Xatolik yuz berdi")
    console.log(err)
  }
}




  const [isForm, setIsForm] = useState(false)
  const [isVerify, setIsVerify] = useState(false)

  

  return (
    <div className='w-full min-h-screen'>
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
        <div className="col h-screen hidden md:flex justify-center items-center bg-[#488487]">
          <h1 className='text-7xl text-zinc-200'>
            LekosERP
          </h1>
        </div>
        <div className="col h-screen flex flex-col justify-center items-center">
          <div className="wrapper w-full">
            <form onSubmit={handleLogin} className={`w-full ${isForm ? "hidden" : "flex"} flex-col gap-5 items-center`}>
              <Image width={100} height={100} src={Logo} alt="logo" />
              <h3 className={`${isSuccess ? "block" : "hidden"} text-3xl text-green-600`}>Xush kelibsiz</h3>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Логин
                <input
                  type="text"
                  className='border border-blue-800 py-2 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Пароль
                <input
                  type="password"
                  className='border border-blue-800 py-2 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button
              onClick={()=>{
                password && username ? setBtnLoader(true) : '';
              }}
                type='submit'
                className='flex justify-center items-center bg-[#486c87] text-zinc-200 w-2/5 py-2 px-2.5 rounded cursor-pointer'
              >
                {btnLoader ? <div className='w-6 h-6 rounded-full border-4 border-white'></div> : "Вход"}
              </button>

            <p><span className='text-gray-500'>Нету аккаунтa?</span> <span className='font-medium cursor-pointer hover:underline' onClick={()=>setIsForm(true)}>Регистрация</span></p>
            </form>
            <form onSubmit={handleRegister} className={`w-full ${isForm ? "flex" : "hidden"} flex-col gap-1.5 items-center`}>
               <Image width={50} height={50} src={Logo} alt="logo" />
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                Ф.И.О
                <input
                  type="text" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </label>
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                Электронная почта
                <input
                  type="text" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                Логин
                <input
                  type="text" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                Пароль
                <input
                  type="password" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                Номер телефона
                <input
                  type="text" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className='flex gap-0.5 flex-col w-2/5 text-lg'>
                ИНН
                <input
                  type="text" 
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={stir}
                  onChange={(e) => setStir(e.target.value)}
                />
              </label> 
              <button
                type='submit'
                className='bg-[#486c87] text-zinc-200 w-2/5 py-2 px-2.5 rounded cursor-pointer'
              >
                Зарегистрироваться
              </button>
              <p><span className='text-gray-500'>У вас уже есть аккаунт?</span> <span className='font-medium cursor-pointer hover:underline' onClick={()=>setIsForm(false)}>Логин</span></p>
            </form>
            <form className={`w-full ${isVerify ? "flex" : "hidden"} flex-col gap-5 items-center`}>
              <p>
                <MdDangerous /> Elektron pochtangizga link yuborildi!
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useM } from '../context'
import { MdDangerous } from 'react-icons/md'
const Auth: React.FC = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [stir, setStir] = useState('')
  const [phone, setPhone] = useState('')

  const { login, register} = useM()
 

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const userData = await login(username, password);
    console.log("User info:", userData);
    alert("Success");
    
    router.push("/dashboard");
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
        <div className="col h-screen hidden md:flex justify-center items-center bg-[#514EF3]">
          <h1 className='text-4xl text-zinc-200'>
            Product Management System
          </h1>
        </div>
        <div className="col h-screen flex justify-center items-center">
          <div className="wrapper w-full">
            <form onSubmit={handleLogin} className={`w-full ${isForm ? "hidden" : "flex"} flex-col gap-5 items-center`}>
              <h3>Login</h3>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Username
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-2 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Password
                <input
                  type="password"
                  placeholder='...'
                  className='border border-blue-800 py-2 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button
                type='submit'
                className='bg-[#514EF3] text-zinc-200 w-2/5 py-2 px-2.5 rounded cursor-pointer'
              >
                Kirish
              </button>

            <button type='button' onClick={()=>setIsForm(true)}>Register</button>
            </form>
            <form onSubmit={handleRegister} className={`w-full ${isForm ? "flex" : "hidden"} flex-col gap-2.5 items-center`}>
              <h3>Register</h3>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Fullname
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Username
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Phone
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                STIR
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={stir}
                  onChange={(e) => setStir(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Email
                <input
                  type="text"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className='flex gap-2.5 flex-col w-2/5 text-lg'>
                Password
                <input
                  type="password"
                  placeholder='...'
                  className='border border-blue-800 py-1 px-2.5 outline-0 hover:bg-blue-200 cursor-pointer rounded'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button
                type='submit'
                className='bg-[#514EF3] text-zinc-200 w-2/5 py-2 px-2.5 rounded cursor-pointer'
              >
                Register
              </button>
              <button type='button' onClick={()=>setIsForm(false)}>Login</button>
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

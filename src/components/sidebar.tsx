'use client'

import api from '@/app/auth';
import { useM } from '@/app/context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { FaShippingFast, FaUser } from 'react-icons/fa';
import { FaBoxArchive} from 'react-icons/fa6';
import { GiBuyCard } from 'react-icons/gi';
import { MdDashboard, MdPointOfSale } from 'react-icons/md';

interface sidebarProps {
    id: number;
    ico: React.ReactNode;
    title: string;
    path: string;
    count: number | null
}
const SideBar = () => {
    const {toggleMenu, isOpen, bg2, txt, fakturaCount, setFakturaCountQuant} = useM()

    const sideIcons:sidebarProps[] = [
        {
            id:0,
            ico: <MdDashboard/>,
            title: "Dashboard",
            path: "/dashboard",
            count: null
        },
        {
            id:4,
            ico: <MdPointOfSale/>,
            title: "Sotuvlar",
            path: "/sales",
            count: null
        },
        {
            id:5,
            ico: <GiBuyCard/>,
            title: "Xaridlar",
            path: "/purchases",
            count: null
        },
        {
            id:3,
            ico: <FaBoxArchive/>,
            title: "Ombor",
            path: "/stock",
            count: fakturaCount
        },
        // {
        //     id:1,
        //     ico: <FaUser/>,
        //     title: "Mijoz",
        //     path: "/customer",
        //     count: null
        // },
        // {
        //     id:2,
        //     ico: <FaShippingFast/>,
        //     title: "Yetkazib beruvchi",
        //     path: "/suplier",
        //     count: null
        // },
    ]
    useEffect(()=>{
        const getFaktura = async ()=>{
            try{
                const res = await api.get("https://fast-simple-crm.onrender.com/api/v1/documents/invoices/with-total");

                let i = 0;
                res.data.forEach(fk => {
                if (fk.open_amount != 0) {
                    i++;
                    console.log(fk);
                    
                }
                });
                setFakturaCountQuant(i)
            }catch(error){
                console.log(error);
                
            }
        }
        getFaktura()
    }, [])
    
    console.log(fakturaCount);
    const pathName = usePathname()
// bg-[#013d8c]
  return (
    <div className={`z-40 absolute ${isOpen ? "left-0" : "-left-40"} -left-40 lg:relative lg:left-0 flex flex-col  items-center w-28 h-full py-3.5 ${bg2}`}>
        {/* <p>{fakturaCount}</p> */}
        {
            sideIcons.map(item=>{
                return (
                    <Link onClick={()=>{
                        toggleMenu();
                    }} 
                    className={`${bg2} ${pathName == item.path ? "bg-amber-50 text-[#0053d9] rounded-l-full" : `${txt}`} py-4 w-full 
                      flex  relative
                     flex-col gap-1.5 rounded-l-4xl
                     items-center hover:bg-white transition duration-700 hover:text-[#0053d9] hover:rounded-l-full`} key={item.id} href={item.path}>
                            <span className='text-2xl'>{item.ico}</span>
                            <span className='text-lg text-center'>{item.title}</span>
                            <div className={`${item.count !=null ? (item.count > 0 ? "block" : "hidden") : "hidden"} absolute flex items-center justify-center w-5 h-5 rounded-full bg-red-500 left-6 top-2`}>{item.count!=null ? item.count : null}</div>
                    </Link>
                )
            })
        }
    </div>
  )
}

export default SideBar

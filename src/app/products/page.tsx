'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { FaEdit } from 'react-icons/fa';
import { MdAddToQueue, MdClose } from 'react-icons/md';
import { FaCirclePlus } from 'react-icons/fa6';
import { useM } from '../context';
import api from '../auth';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: string;
  description: string;
}

const Import = () => {
const [form, setForm] = useState<Product>(
        {
            id: 0,
            name: "",
            sku: "",
            quantity: 0,
            unit: "",
            price: "",
            description: ""
        }
    
);

const [product, setProduct] = useState<Product[]>([]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: value
  }));
};


    const addPrd = async () => {
        try {
            const prd = {
            name: form.name,
            sku: form.sku,
            unit: form.unit,
            price: form.price,
            description: form.description
        }

        const resAddPrd = await api.post(
            "https://fast-simple-crm.onrender.com/api/v1/products",
            prd
        );
        console.log(resAddPrd);
        
        
        }catch(error){
            console.log(error);
            
        }


    }
    useEffect(()=>{
        const getPrds = async () =>{
            try {
              
                const resProduct = await api.get("https://fast-simple-crm.onrender.com/api/v1/products/with-quantity")

                
                setProduct(resProduct.data)
            }catch(error){
                console.log(error);
                
            }
        }

        getPrds()
    }, [])

    async function deleteItem(id:number) {
    try{
      
      const res = await api.delete(`https://fast-simple-crm.onrender.com/api/v1/products/${id}`);
      setProduct(prev => prev.filter(item => item.id !== id));
      
      
    } catch(error){
      console.log("O'chirishda xato:", error);
      alert("O'chirishda xatolik yuz berdi");
    }
  }

     const [isOpen, setIsOpen] = useState(false)
    const {bg2,mainBg} = useM()

  return (
    <CustomLayout>
        <div className={`${mainBg} w-full px-6 py-6`}>
          <h1 className={`text-xl font-bold mb-4`}>Товары</h1>
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl overflow-hidden">
                <thead className={`${bg2} text-white uppercase tracking-wide`}>
                    <tr>
                        <th className="px-3 py-3 text-left">
                            Tr
                        </th>
                        <th className="px-3 py-3 text-left">
                            Nomi
                        </th>
                        <th className="px-3 py-3 text-left">
                            SKU
                        </th>
                        <th className="px-3 py-3 text-left">
                            Soni
                        </th>
                        <th className="px-3 py-3 text-left">
                            Birligi
                        </th>
                        <th className="px-3 py-3 text-left">
                            Narxi (1 birlikda)
                        </th>
                        <th className="px-3 py-3 text-left">
                            Ta`rif
                        </th>
                         <th className="px-3 py-3 text-center flex items-center justify-center gap-2">
                            Instr
                            <button
                              className="p-2 bg-emerald-500 hover:bg-emerald-600 transition text-white rounded-full shadow"
                              onClick={() => setIsOpen(prev => !prev)}
                            >
                              <FaCirclePlus />
                            </button>
                        </th>
                    </tr>

                     <tr className={`${isOpen ? "table-row" : "hidden"}`}>
                        <td className="px-3 py-2 text-gray-500">#</td>
                        <td><input className="w-11/12 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none" name="name" type='text' value={form.name} onChange={handleChange} /></td>
                        <td><input className="w-11/12 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none" name="sku" type='text' value={form.sku} onChange={handleChange} /></td>
                        <td></td>
                        <td><input className="w-11/12 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none" name="unit" type='text' value={form.unit} onChange={handleChange} /></td>
                        <td><input className="w-11/12 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none" name="price" type='text' value={form.price} onChange={handleChange} /></td>
                        <td><input className="w-11/12 border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 outline-none" name="description" type='text' value={form.description} onChange={handleChange} /></td>

                        <td className="flex items-center justify-center gap-2">
                        {false ? (
                          <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 transition text-white rounded shadow">Save</button>
                        ) : (
                          <button onClick={addPrd} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 transition text-white rounded shadow">+</button>
                        )}
                        <button className="p-2 bg-red-200 hover:bg-red-400 transition rounded-full text-gray-700">
                          <MdClose onClick={() => setIsOpen(prev => !prev)} />
                        </button>
                        </td>
                    </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${mainBg==="bg-gray-950" ? "text-white" : "text-black"}} `}>
                    
                    {
                        product.map(item=>{
                            return (
                                <tr key={item.id} className="hover:bg-red-50 transition">
                                    <td className="px-3 py-2">{item.id}</td>
                                    <td className="px-3 py-2">{item.name}</td>
                                    <td className="px-3 py-2">{item.sku}</td>
                                    <td className="px-3 py-2">{item.quantity}</td>
                                    <td className="px-3 py-2">{item.unit}</td>
                                    <td className="px-3 py-2">{item.price.toLocaleString().replace(/,/g, " ")}</td>
                                    <td className="px-3 py-2">{item.description}</td>
                                    <td className="flex py-2 justify-center gap-2 items-center">
                                        {/* <button className="cursor-pointer p-2 bg-emerald-400 hover:bg-emerald-600 transition rounded-full"><MdAddToQueue /></button>
                                        <button className="cursor-pointer p-2 bg-yellow-400 hover:bg-yellow-600 transition rounded-full"><FaEdit /></button> */}
                                        <button onClick={()=>deleteItem(item.id)} className="cursor-pointer p-2 bg-red-400 hover:bg-red-600 transition rounded-full"><MdClose /></button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
          </div>
        </div>
    </CustomLayout>
  )
}

export default Import

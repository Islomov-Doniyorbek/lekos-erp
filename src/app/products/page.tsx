'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { FaEdit, FaPlusCircle } from 'react-icons/fa';
import { MdAddToQueue, MdClose, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { FaCirclePlus } from 'react-icons/fa6';
import { useM } from '../context';
import api from '../auth';
import Alert from '@/components/alert';

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
   const [isOpen, setIsOpen] = useState(false)
    const {bg2, txt,mainBg, isCLosed} = useM()
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
const [editingId, setEditingId] = useState<number | null>(null);
const [editForm, setEditForm] = useState<Product>({
    id: 0,
    name: "",
    sku: "",
    quantity: 0,
    unit: "",
    price: "",
    description: ""
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setEditForm(prev => ({
    ...prev,
    [name]: value
  }));
};

// Edit rejimini yoqish
const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({...product});
};

// Edit rejimini bekor qilish
const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
        id: 0,
        name: "",
        sku: "",
        quantity: 0,
        unit: "",
        price: "",
        description: ""
    });
};

// Mahsulotni yangilash
const updateProduct = async () => {
    try {
        const updatedPrd = {
            name: editForm.name,
            sku: editForm.sku,
            unit: editForm.unit,
            price: editForm.price,
            description: editForm.description
        }

        const resUpdatePrd = await api.patch(
            `https://fast-simple-crm.onrender.com/api/v1/products/${editingId}`,
            updatedPrd
        );
        
        // Local stateda yangilash
        setProduct(prev => prev.map(item => 
            item.id === editingId ? {...editForm} : item
        ));
        
        setEditingId(null);
        console.log("Mahsulot yangilandi:", resUpdatePrd);
        
    } catch(error) {
        console.log("Yangilashda xato:", error);
    }
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
        
        // Yangi mahsulotni ro'yxatga qo'shish
        if (resAddPrd.data) {
            setProduct(prev => [...prev, resAddPrd.data]);
            setForm({
                id: 0,
                name: "",
                sku: "",
                quantity: 0,
                unit: "",
                price: "",
                description: ""
            });
            setIsOpen(false);
        }
        
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
            // Alert komponentini ishlatish
            const userConfirmed = window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?");
            if (!userConfirmed) return;
            
            const res = await api.delete(`https://fast-simple-crm.onrender.com/api/v1/products/${id}`);
            setProduct(prev => prev.filter(item => item.id !== id));
            
        } catch(error){
            console.log("O'chirishda xato:", error);
            alert("O'chirishda xatolik yuz berdi");
        }
    }





    // const [showModal, setShowModal] = useState
// Список продуктов
  return (
    <CustomLayout>
        <div className='w-full p-6 max-h-screen overflow-y-auto'>
        <div className="title mb-4 text-2xl font-semibold">Список продуктов</div>
        <div className="overflow-x-auto border-[1px] border-gray-100 border-t-0 rounded-2xl">
          <table className="border-collapse border  w-full text-sm shadow-md rounded-xl ">
            <thead className={`${bg2} ${txt} uppercase tracking-wide`}>
                    <tr>
                        <th className="px-3 py-3 text-left">#</th>
                        <th className="px-3 py-3 text-left">Название</th>
                        <th className="px-3 py-3 text-left">Артикул</th>
                        <th className="px-3 py-3 text-left">Количество</th>
                        <th className="px-3 py-3 text-left">Ед. изм.</th>
                        <th className="px-3 py-3 text-left">Цена</th>
                        <th className="px-3 py-3 text-left">Описание</th>
                        <th className="px-3 py-3 text-center flex items-center justify-center gap-2">
                            Опции
                            <FaPlusCircle className='cursor-pointer text-2xl'  onClick={() => setIsOpen(prev => !prev)}/>
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
                    {product.length > 0 ? (
                        product.map(item => (
                        <tr key={item.id} className="hover:bg-red-50 transition">
                            <td className="px-3 py-2">{item.id}</td>
                            
                            {/* Nomi */}
                            <td className="px-3 py-2">
                                {editingId === item.id ? (
                                    <input 
                                        className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                                        name="name" 
                                        type='text' 
                                        value={editForm.name} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    item.name
                                )}
                            </td>
                            
                            {/* SKU */}
                            <td className="px-3 py-2">
                                {editingId === item.id ? (
                                    <input 
                                        className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                                        name="sku" 
                                        type='text' 
                                        value={editForm.sku} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    item.sku
                                )}
                            </td>
                            
                            <td className="px-3 py-2">{item.quantity}</td>
                            
                            {/* Birligi */}
                            <td className="px-3 py-2">
                                {editingId === item.id ? (
                                    <input 
                                        className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                                        name="unit" 
                                        type='text' 
                                        value={editForm.unit} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    item.unit
                                )}
                            </td>
                            
                            {/* Narxi */}
                            <td className="px-3 py-2">
                                {editingId === item.id ? (
                                    <input 
                                        className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                                        name="price" 
                                        type='text' 
                                        value={editForm.price} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    item.price.toLocaleString().replace(/,/g, " ")
                                )}
                            </td>
                            
                            {/* Ta'rif */}
                            <td className="px-3 py-2">
                                {editingId === item.id ? (
                                    <input 
                                        className="w-full border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                                        name="description" 
                                        type='text' 
                                        value={editForm.description} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    item.description
                                )}
                            </td>
                            
                            <td className="flex py-2 justify-center gap-2 items-center">
                                {editingId === item.id ? (
                                    <>
                                        <button 
                                            onClick={updateProduct}
                                            className="cursor-pointer p-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full"
                                            title="Saqlash"
                                        >
                                            <MdSave />
                                        </button>
                                        <button 
                                            onClick={cancelEditing}
                                            className="cursor-pointer p-2 bg-gray-500 hover:bg-gray-600 transition text-white rounded-full"
                                            title="Bekor qilish"
                                        >
                                            <MdCancel />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => startEditing(item)}
                                            className="cursor-pointer p-2 text-yellow-500 text-lg hover:text-yellow-800 hover:bg-yellow-400 transition rounded-full"
                                            title="Tahrirlash"
                                        >
                                            <MdEdit />
                                        </button>
                                        <button 
                                            onClick={() => deleteItem(item.id)}
                                            className="cursor-pointer p-2 text-red-500 text-lg hover:text-red-800 hover:bg-red-400 transition rounded-full"
                                            title="O'chirish"
                                        >
                                            <MdClose />
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                        <td className='py-3 text-center' colSpan={8}>
                            У вас нет зарегистрированных продуктов.
                        </td>
                    </tr>
                    )}
                    
                </tbody>
            </table>
          </div>
        </div>
    </CustomLayout>
  )
}

export default Import
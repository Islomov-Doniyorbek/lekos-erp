'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { FaArrowAltCircleDown, FaEdit, FaPlusCircle } from 'react-icons/fa';
import { MdAddToQueue, MdClose, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { FaCirclePlus } from 'react-icons/fa6';
import { useM } from '../context';
import api from '../auth';
import Alert from '@/components/alert';
import { Span } from 'next/dist/trace';

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: string;
  description: string;
}
interface ProductOwners {
    movement_type: "in" | "out",
    quantity: string,
    price: string,
    comment: string,
    id: number,
    move_date: string,
    counterparty_name: string,
    counterparty_tin: string
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
const [productOwners, setProductOwners] = useState<ProductOwners[]>([]);
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




    const getStMvs = async (id:number)=>{
        try {
            const data = await api.get(`https://fast-simple-crm.onrender.com/api/v1/stock-moves/with-counterparty-data?product_id=${id}`)
            console.log(data);
            setProductOwners(data.data)
            
            
        }catch(error){
            console.log(error);
            
        }
    }




    // const [showModal, setShowModal] = useState
// Список продуктов

const [inTable, setInTable] = useState(0)
const [isInTable, setIsInTable] = useState(false)

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
                        <th className="px-3 py-3 text-left">Сумма</th>
                        <th className="px-3 py-3 text-center flex items-center justify-center gap-2">
                            Опции
                            <FaPlusCircle className='cursor-pointer text-2xl'  onClick={() => setIsOpen(prev => !prev)}/>
                        </th>
                    </tr>

                    <tr className={`${isOpen ? "table-row" : "hidden"} py-2.5`}>
  <td className="px-3 py-2 text-gray-500">#</td>

  {/* Product name */}
  <td>
    <input
      className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 
                 text-gray-800 placeholder-gray-400 
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 
                 focus:bg-white transition-all duration-200 ease-in-out outline-none shadow-sm"
      placeholder="Product name"
      name="name"
      type="text"
      value={form.name}
      onChange={handleChange}
    />
  </td>

  {/* SKU */}
  <td>
    <input
      className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 
                 text-gray-800 placeholder-gray-400 
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 
                 focus:bg-white transition-all duration-200 ease-in-out outline-none shadow-sm"
      placeholder="SKU"
      name="sku"
      type="text"
      value={form.sku}
      onChange={handleChange}
    />
  </td>

  <td></td>

  {/* Unit */}
  <td>
    <input
      className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 
                 text-gray-800 placeholder-gray-400 
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 
                 focus:bg-white transition-all duration-200 ease-in-out outline-none shadow-sm"
      placeholder="Unit"
      name="unit"
      type="text"
      value={form.unit}
      onChange={handleChange}
    />
  </td>

  {/* Price */}
  <td>
    <input
      className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 
                 text-gray-800 placeholder-gray-400 
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 
                 focus:bg-white transition-all duration-200 ease-in-out outline-none shadow-sm"
      placeholder="Price"
      name="price"
      type="text"
      value={form.price}
      onChange={handleChange}
    />
  </td>

  <td></td>

  {/* Action buttons */}
  <td className="flex items-center justify-center gap-2">
    {false ? (
      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-lg shadow-md">
        Save
      </button>
    ) : (
      <button
        onClick={addPrd}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 transition text-white rounded-lg shadow-md"
      >
        +
      </button>
    )}
    <button className="p-2 bg-red-100 hover:bg-red-400 hover:text-white transition-all duration-200 rounded-full text-gray-700 shadow-sm">
      <MdClose onClick={() => setIsOpen((prev) => !prev)} />
    </button>
  </td>
</tr>

                </thead>
                <tbody className={`divide-y divide-gray-200 ${mainBg==="bg-gray-950" ? "text-white" : "text-black"}} `}>
                    {product.length > 0 ? (
                        product.map(item => (
                        <>
                            <tr onClick={()=>{
                                setInTable(item.id);
                                getStMvs(item.id);
                                setIsInTable(prev=>!prev)
                            }} key={item.id} className="hover:bg-red-50 transition cursor-pointer">
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
                                {
                                    item.quantity * item.price
                                }
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
                                        onClick={()=>getStMvs(item.id)}
                                            className="cursor-pointer p-2 text-green-500 text-lg hover:text-emerald-800 hover:bg-green-400 transition rounded-full"
                                            title="Tahrirlash"
                                        >
                                            <FaArrowAltCircleDown />
                                        </button>
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
                        <tr className={`${isInTable && inTable === item.id ? "table-row" : "hidden"}`}>
                                            <td className='px-2 py-6 ' colSpan={8}>
                                              <table className="border-collapse border  w-full text-sm shadow-md rounded-xl ">
                                                <thead className={`${bg2} ${txt} uppercase tracking-wide`}>
                                                  <tr>
                                                    <th className='text-left px-3 py-3'>#</th>
                                                    <th className='text-left px-3 py-3'>Движ.</th>
                                                    <th className='text-left px-3 py-3'>От кого/кому</th>
                                                    <th className='text-left px-3 py-3'>Дата</th>
                                                    <th className='text-left px-3 py-3'>Количество</th>
                                                    <th className='text-left px-3 py-3'>Цена</th>
                                                    <th className='text-left px-3 py-3'>Сумма</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {
                                                    productOwners.map((prdOwn, i) =>{
                                                        return (
                                                            <tr key={prdOwn.id}>
                                                                <td className='text-left px-3 py-3'>{i+1}</td>
                                                                <td className='text-left px-3 py-3'>
                                                                    {prdOwn.movement_type === "in" ? <span className='text-2xl'> &#8601;</span> : <span className='text-2xl'>&#8599;</span>}
                                                                </td>
                                                                <td className='text-left px-3 py-3'>
                                                                    <b>
                                                                        {prdOwn.counterparty_name}
                                                                    </b> <br />
                                                                    <small>
                                                                        {prdOwn.counterparty_tin}
                                                                    </small>
                                                                </td>
                                                                <td className='text-left px-3 py-3'>
                                                                    {prdOwn.move_date}
                                                                </td>
                                                                <td className='text-left px-3 py-3'>
                                                                    {prdOwn.quantity}
                                                                </td>
                                                                <td className='text-left px-3 py-3'>
                                                                    {prdOwn.price}
                                                                </td>
                                                                <td className='text-left px-3 py-3'>
                                                                    {
                                                                        Number(prdOwn.quantity) * Number(prdOwn.price)
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                  }
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                        </>
                    ))
                    ) : (
                        <tr>
                        <td className='py-3 text-center text-gray-500' colSpan={8}>
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
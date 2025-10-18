'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'

import { formatAmount, formatDate } from '../formatter'
import { FaArrowAltCircleDown, FaEdit, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { MdAddToQueue, MdClose, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { FaCirclePlus } from 'react-icons/fa6';
import { useM } from '../context';
import api from '../auth';
import { format } from 'path';

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
  const {table, innerTable, txt} = useM()
  
  const [form, setForm] = useState<Product>({
    id: 0,
    name: "",
    sku: "",
    quantity: 0,
    unit: "",
    price: "",
    description: ""
  });

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

  const [inTable, setInTable] = useState(0)
  const [isInTable, setIsInTable] = useState(false)

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
      
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getPrds = async () => {
      try {
        const resProduct = await api.get("https://fast-simple-crm.onrender.com/api/v1/products/with-quantity")
        setProduct(resProduct.data)
        console.log(resProduct.data)
      } catch(error) {
        console.log(error);
      }
    }
    getPrds()
  }, [])

  async function deleteItem(id:number) {
    try {
      // Alert komponentini ishlatish
      const userConfirmed = window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?");
      if (!userConfirmed) return;
      
      const res = await api.delete(`https://fast-simple-crm.onrender.com/api/v1/products/${id}`);
      setProduct(prev => prev.filter(item => item.id !== id));
      
    } catch(error) {
      console.log("O'chirishda xato:", error);
      alert("O'chirishda xatolik yuz berdi");
    }
  }

  const getStMvs = async (id:number) => {
    try {
      const data = await api.get(`https://fast-simple-crm.onrender.com/api/v1/stock-moves/with-counterparty-data?product_id=${id}`)
      console.log(data);
      setProductOwners(data.data)
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <CustomLayout>
      <div className='w-full p-6 min-h-screen h-screen overflow-y-auto'>
        <div className="title mb-4 text-2xl font-semibold">Список продуктов</div>
        <div className="overflow-x-auto border-[1px] pb-6 pt-4 border-gray-100 border-t-0 rounded-2xl">
          <table className="border-collapse border w-full text-sm shadow-md rounded-xl">
            <thead className={`${table} ${txt} uppercase tracking-wide`}>
              <tr>
                <th className="px-3 py-1  border text-left ">#</th>
                <th className="px-3 py-1  border text-left">Название</th>
                <th className="px-3 py-1  border text-left">Ед. изм.</th>
                <th className="px-3 py-1  border ">
                  <caption className='w-full flex justify-center'>Prixod</caption>
                  <div className='w-full flex'>
                    <div  className=' w-1/3 text-left'>Коль.</div>
                    <div  className=' w-1/3 text-left'>Цена</div>
                    <div  className=' w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                <th className="px-3 py-1 border ">
                  <caption className='w-full flex justify-center'>Rasxod</caption>
                  <div className='w-full flex '>
                    <div className=' w-1/3 text-left'>Kоль</div>
                    <div  className=' w-1/3 text-left'>Цена</div>
                    <div  className=' w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                <th className="px-3 py-1 border ">
                  <caption className='w-full flex justify-center'>Остатка</caption>
                  <div className='w-full flex '>
                    <div  className=' w-1/3 text-left'>Коль.</div>
                    <div  className=' w-1/3 text-left'>Цена</div>
                    <div  className=' w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                {/* <th className="px-3 py-1 text-left w-[]">Цена</th>
                <th className="px-3 py-1 text-left w-[]">Сумма</th> */}
                <th className="px-3 py-1  border ">
                  <div className='flex items-center justify-end gap-2'>Опции
                  <FaPlusCircle className='cursor-pointer text-2xl' onClick={() => setIsOpen(prev => !prev)}/></div>
                </th>
              </tr>

              {/* Yangi mahsulot qo'shish qatori */}
              <tr className={`${isOpen ? "table-row" : "hidden"} py-1.5`}>
                <td className="px-3 py-1 text-gray-500">#</td>
                <td>
                  <input
                    className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1 
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
                <td>
                  <input
                    className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1 
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
                <td>
                  <input
                    className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1 
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
                <td>
                  <input
                    className="w-11/12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-1 
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
                <td className="flex items-center justify-center gap-2">
                  <button
                    onClick={addPrd}
                    className="px-4 py-1 bg-emerald-500 hover:bg-emerald-600 transition text-white rounded-lg shadow-md"
                  >
                    +
                  </button>
                  <button className="p-2 bg-red-100 hover:bg-red-400 hover:text-white transition-all duration-200 rounded-full text-gray-700 shadow-sm">
                    <MdClose onClick={() => setIsOpen((prev) => !prev)} />
                  </button>
                </td>
              </tr>
            </thead>
            
            <tbody className={`divide-y divide-gray-200`}>
              {product.length > 0 ? (
                product.map(item => (
                  <React.Fragment key={item.id}>
                    {/* Asosiy qator - inline edit rejimi */}
                    <tr 
                      onClick={() => {
                        setInTable(item.id);
                        getStMvs(item.id);
                        setIsInTable(prev => !prev);
                      }} 
                      className={`hover:bg-[#cbe5f6] transition cursor-pointer
                      ${isInTable && inTable === item.id ? `${innerTable} text-amber-50` : ""}`}
                    >
                      {/* ID */}
                      <td className="px-3 py-1 border">{item.id}</td>
                      <td className="px-3 py-1 border">
                        <b>
                            {item.name}
                        </b> <br />
                        <small><i>{item.sku}</i></small>
                      </td>
                      <td className="px-3 py-1 border">{item.unit}</td>
                      <td className="px-3 py-1 border">
                        <div className='flex w-full'>
                            <p  className=' w-1/3 text-left'>{item.total_incomings}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.avg_incoming_price))}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.total_incoming_sum))}</p>
                        </div>
                      </td>
                      <td className="px-3 py-1 border">
                        <div className='flex w-full'>
                            <p  className=' w-1/3 text-left'>{item.total_outgoings}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.avg_outgoing_price))}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.total_outgoing_sum))}</p>
                        </div>
                      </td>
                      <td className="px-3 py-1 border">
                        <div className='w-full flex'>
                            <p  className=' w-1/3 text-left'>{item.quantity}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.price))}</p>
                            <p  className=' w-1/3 text-left'>{formatAmount(Number(item.quantity * item.price))}</p>
                        </div>
                      </td>
                    <td className=" py-1 border">
                            <div className='w-full flex justify-end'>
                                <button 
                              onClick={() => getStMvs(item.id)}
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
                              <FaTrashAlt />
                            </button>
                            </div>
                          </td>
                    </tr>

                    {/* Ichki jadval */}
                    <tr className={`${isInTable && inTable === item.id ? "table-row" : "hidden"}`}>
                      <td className='px-2 py-6' colSpan={8}>
                        <table className="border-collapse border w-full text-sm shadow-md rounded-xl">
                          <thead className={`${innerTable} ${txt} uppercase tracking-wide`}>
                            <tr>
                              <th className='text-left px-3 py-1'>#</th>
                              <th className='text-left px-3 py-1'>Движ.</th>
                              <th className='text-left px-3 py-1'>От кого/кому</th>
                              <th className='text-left px-3 py-1'>Дата</th>
                              <th className='text-left px-3 py-1'>Количество</th>
                              <th className='text-left px-3 py-1'>Цена</th>
                              <th className='text-left px-3 py-1'>Сумма</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productOwners.length > 0 ? (
                              productOwners.map((prdOwn, i) => {
                                return (
                                  <tr key={prdOwn.id} className='border-b-[1px] border-gray-200 hover:bg-[#cbe5f6]'>
                                    <td className='text-left px-3 py-1'>{i+1}</td>
                                    <td className='text-left px-3 py-1'>
                                      {prdOwn.movement_type === "in" ? 
                                        <span className='text-2xl'> &#8601;</span> : 
                                        <span className='text-2xl'>&#8599;</span>}
                                    </td>
                                    <td className='text-left px-3 py-1'>
                                      <b>{prdOwn.counterparty_name}</b> <br />
                                      <small>{prdOwn.counterparty_tin}</small>
                                    </td>
                                    <td className='text-left px-3 py-1'>
                                      {formatDate(prdOwn.move_date)}
                                    </td>
                                    <td className='text-left px-3 py-1'>
                                      {prdOwn.quantity}
                                    </td>
                                    <td className='text-left px-3 py-1'>
                                      {formatAmount(Number(prdOwn.price))}
                                    </td>
                                    <td className='text-left px-3 py-1'>
                                      {formatAmount(Number(prdOwn.quantity) * Number(prdOwn.price))}
                                    </td>
                                  </tr>
                                )
                              })
                            ) : (
                              <tr>
                                <td className='text-center px-3 py-1' colSpan={7}>None</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td className='py-1 text-center text-gray-500' colSpan={8}>
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
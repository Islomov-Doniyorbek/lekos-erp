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
import TableWrap from '@/components/tableWrap';
import Table from '@/components/table';
import Thead from '@/components/thead';
import Tbody from '@/components/tbody';

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
  const {othClr, innerTable, txt} = useM()
  const [qoldiq, setQoldiq] = useState(0)
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
      let s=0;
      data.data.map(item=>{
        s+=Number(item.quantity * item.price)
      })
      setQoldiq(s)
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <CustomLayout>
      <div className='w-full p-3 min-h-2.5 h-screen overflow-y-auto'>
        <div className="title mb-4 text-2xl font-semibold">Список продуктов</div>
        <TableWrap>
          <Table>
            <Thead>
              <tr>
                <th className="px-3 py-1  border text-left w-[3%] ">#</th>
                <th className="px-3 py-1  border text-left w-[13%]">Название</th>
                <th className="px-3 py-1  border text-left w-[5%]">Ед. изм.</th>
                <th className=" py-1  border w-[24%] ">
                  <caption className='w-full flex justify-center py-1 border-b'>Приход</caption>
                  <div className='w-full flex'>
                    <div  className='  px-3 w-1/3 text-left'>Кол.</div>
                    <div  className='   w-1/3 text-left'>Цена</div>
                    <div  className='   w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                <th className=" py-1 border w-[24%] ">
                  <caption className='w-full flex justify-center py-1 border-b'>Расход</caption>
                  <div className='w-full flex '>
                    <div className='  px-3 w-1/3 text-left'>Kол.</div>
                    <div  className='   w-1/3 text-left'>Цена</div>
                    <div  className='   w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                <th className=" py-1 border w-[24%] ">
                  <caption className='w-full flex justify-center py-1 border-b'>Остатка</caption>
                  <div className='w-full flex '>
                    <div  className='  px-3 w-1/3 text-left'>Кол.</div>
                    <div  className='   w-1/3 text-left'>Цена</div>
                    <div  className='   w-1/3 text-left'>Сумма</div>
                  </div>
                </th>
                <th className="px-3 py-1  border w-[7%] ">
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
            </Thead>
            
            <Tbody>
              {product.length > 0 ? (
                product.map((item, i) => (
                  
                  <React.Fragment key={item.id}>
                    {/* Asosiy qator - inline edit rejimi */}
                    <tr 
                      className={`hover:bg-[#cbe5f6] hover:text-blue-800 ${i%2==0 ? othClr : ''} transition cursor-pointer
                      ${isInTable && inTable === item.id ? `${innerTable} ` : ""}`}
                    >
                      {/* ID */}
                      <td className="px-3 py-1 border">{i+1}</td>
                      
                      {/* Nom - inline edit */}
                      <td className="px-3 py-1 border">
                        {editingId === item.id ? (
                          <div>
                            <input
                            className="w-full rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 
                                     text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
                                     focus:bg-white transition-all duration-200 outline-none"
                            name="name"
                            type="text"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                          <input
                            className="w-full rounded-lg border text-[12px] border-blue-300 bg-blue-50 px-2 py-1 
                                     text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
                                     focus:bg-white transition-all duration-200 outline-none"
                                     
                            name="sku"
                            type="text"
                            value={editForm.sku}
                            onChange={handleEditChange}
                          />
                          </div>
                        ) : (
                          <div onClick={() => {
                            setInTable(item.id);
                            getStMvs(item.id);
                            setIsInTable(prev => !prev);
                          }}>
                            <b>{item.name}</b> <br />
                            <small><i>{item.sku}</i></small>
                          </div>
                        )}
                      </td>
                      
                      {/* SKU - inline edit */}
                      <td className="px-3 py-1 border">
                          {editingId === item.id ? (
                            <input
                            className="w-full rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 
                                     text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
                                     focus:bg-white transition-all duration-200 outline-none"
                            name="unit"
                            type="text"
                            value={editForm.unit}
                            onChange={handleEditChange}
                          />
                          ) : (
                            <div onClick={() => {
                            setInTable(item.id);
                            getStMvs(item.id);
                            setIsInTable(prev => !prev);
                          }}>
                            {item.unit}
                          </div>
                          )}
                          
                      </td>
                      
                      {/* Unit - inline edit */}
                      <td className="px-3 py-1 border">
                        
                          <div onClick={() => {
                            setInTable(item.id);
                            getStMvs(item.id);
                            setIsInTable(prev => !prev);
                          }}>
                            <div className='flex w-full'>
                              <p className='w-1/3 text-left'>{item.total_incomings}</p>
                              <p className='w-1/3 text-left'>{formatAmount(Number(item.avg_incoming_price))}</p>
                              <p className='w-1/3 text-left'>{formatAmount(Number(item.total_incoming_sum))}</p>
                            </div>
                          </div>
                      </td>
                      
                      <td className="px-3 py-1 border">
                        <div onClick={() => {
                          setInTable(item.id);
                          getStMvs(item.id);
                          setIsInTable(prev => !prev);
                        }} className='flex w-full'>
                          <p className='w-1/3 text-left'>{item.total_outgoings}</p>
                          <p className='w-1/3 text-left'>{formatAmount(Number(item.avg_outgoing_price))}</p>
                          <p className='w-1/3 text-left'>{formatAmount(Number(item.total_outgoing_sum))}</p>
                        </div>
                      </td>
                      
                      <td className="px-3 py-1 border">
                        <div onClick={() => {
                          setInTable(item.id);
                          getStMvs(item.id);
                          setIsInTable(prev => !prev);
                        }} className='w-full flex'>
                          <p className='w-1/3 text-left'>{item.quantity}</p>
                          {editingId === item.id ? (
                            
                            <input
                            className="rounded-lg border border-blue-300 bg-blue-50 px-0.5 py-1  
                                     text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
                                     focus:bg-white transition-all duration-200 outline-none"
                            name="price"
                            type="text"
                            value={editForm.price}
                            onChange={handleEditChange}
                          />
                          ) : (<p className='w-1/3 text-left'>{formatAmount(Number(item.price))}</p>)}
                          
                          <p className='w-1/3 text-left'>{formatAmount(Number(item.quantity * item.price))}</p>
                        </div>
                      </td>
                      
                      <td className="py-1 border">
                        <div className='w-full flex justify-end'>
                          {editingId === item.id ? (
                            // Edit rejimidagi tugmalar
                            <>
                              <button 
                                onClick={updateProduct}
                                className="cursor-pointer p-2 text-green-500 text-lg hover:text-green-800 hover:bg-green-400 transition rounded-full"
                                title="Saqlash"
                              >
                                <MdSave />
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="cursor-pointer p-2 text-red-500 text-lg hover:text-red-800 hover:bg-red-400 transition rounded-full"
                                title="Bekor qilish"
                              >
                                <MdCancel />
                              </button>
                            </>
                          ) : (
                            // Oddiy rejimdagi tugmalar
                            <>
                              <button 
                                onClick={() => getStMvs(item.id)}
                                className="cursor-pointer p-2 text-green-500 text-lg hover:text-emerald-800 hover:bg-green-400 transition rounded-full"
                                title="Tafsilotlar"
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Ichki jadval */}
                    <tr className={`${isInTable && inTable === item.id ? "table-row" : "hidden"}`}>
                      <td className='px-2 py-6' colSpan={8}>
                        <Table>
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
                                        <span className='text-3xl text-green-600'> &#8601;</span> : 
                                        <span className='text-3xl text-red-600'>&#8599;</span>}
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
                                <td className='text-center px-3 py-2 text-[16px] text-gray-500' colSpan={7}>Пустой</td>
                              </tr>
                            )}
                            {/* {product.length > 0 ? (
                                <tr>
                                    <td className='text-center px-3 py-1' colSpan={6}></td>
                                    <td className='text-center px-3 py-1'>Sum:{qoldiq}</td>
                              </tr>
                            ) : ("")} */}
                          </tbody>
                        </Table>
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
            </Tbody>
          </Table>
        </TableWrap>
      </div> 
    </CustomLayout>
  )
}

export default Import
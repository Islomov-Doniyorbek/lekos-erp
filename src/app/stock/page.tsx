'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { BiEdit } from 'react-icons/bi'
import { FaArrowAltCircleDown, FaPlusCircle } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import api from '../auth'
import { useM } from '../context'

interface Faktura {
  closed_amount: number,
  invoice: {
    type: "invoice",
    move_type: "in" | "out",
    amount: number,
    comment: string,
    doc_num: string,
    date: string,
    id: number
  },
  open_amount: number
}

interface Product {
  id: number,
  name: string,
  sku: string,
  unit: string,
  price: number,
  description: string
}

interface StockMove {
  id: number,
  product_id: number,
  name: string,
  sku: string,
  date: string,
  quantity: number,
  price: number,
  comment: string
}

interface FormData {
  product: string,
  sku: string,
  price: number,
  quantity: number,
  date: string,
  comment: string
}

interface ContractProductRequest {
  user_id: number,
  product_data: {
    name: string,
    sku: string,
    price: number
  },
  stock_move_data: {
    document_id: number,
    movement_type: "in" | "out",
    date: string,
    quantity: number,
    price: number,
    comment: string
  }
}

const Products = () => {
  const {setFakturaCountQuant} = useM()
  const [isOpen, setIsOpen] = useState(false)
  const [rowId, setRowId] = useState(0)
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [faktura, setFaktura] = useState<Faktura[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stockMove, setStockMove] = useState<StockMove[]>([])
  const [form, setForm] = useState<FormData>({
    product: "",
    sku: "",
    price: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    comment: ""
  })
  const [currentDocumentId, setCurrentDocumentId] = useState<number>(0)

  useEffect(() => {
    const getDocs = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          api.get("https://fast-simple-crm.onrender.com/api/v1/documents/invoices/with-total"),
          api.get("https://fast-simple-crm.onrender.com/api/v1/products"),
          api.get("https://fast-simple-crm.onrender.com/api/v1/contract-products")
        ]);
        setFaktura(res1.data)
        setProducts(res2.data)
        console.log(res1);
        console.log(res2);
        console.log(res3);
        // console.log(res3);
        


        const merged = res2.data.flatMap((customer: Mijoz) => {
          const contracts = res3.data.filter((contract: any) => contract.document_id === customer.id);
          if (contracts.length > 0) {
            return contracts.map((contract: any) => ({
              ...customer,
              ...contract,
              has_contract: true // Shartnoma borligini bildiradi
            }));
          }
          return [];
        });
        console.log(merged);
        
        setStockMove(merged)

        
        // Birinchi faktura document_id ni olish
        if (res1.data.length > 0) {
          setCurrentDocumentId(res1.data[0].invoice.id || 0)
        }
      } catch (error) {
        console.log(error);
      }
    }
    getDocs()
  }, [])

  // Mahsulot qidirish va tekshirish
  const handleProductSearch = (productName: string) => {
    setForm(prev => ({ ...prev, product: productName }))
    
    const existingProduct = products.find(
      product => 
        product.name.toLowerCase() === productName.toLowerCase() ||
        product.sku.toLowerCase() === productName.toLowerCase()
    )

    if (existingProduct) {
      // Mahsulot bazada mavjud
      setIsNewProduct(false)
      setForm(prev => ({
        ...prev,
        product: existingProduct.name,
        sku: existingProduct.sku,
        price: existingProduct.price
      }))
    } else {
      // Yangi mahsulot
      setIsNewProduct(true)
      setForm(prev => ({
        ...prev,
        sku: "",
        price: 0
      }))
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value
    }))
  }

  const handleAddProduct = async () => {
    try {
      if (!form.product || !form.quantity || !form.price) {
        alert("Mahsulot nomi, miqdor va narxini kiriting!")
        return
      }

      if (isNewProduct) {
        // Yangi mahsulot - contract-products/with-product endpointiga yuboriladi
        const contractProductRequest: ContractProductRequest = {
          user_id: 1, // User ID ni o'zingizning logikangizga moslashtiring
          product_data: {
            name: form.product,
            sku: form.sku || `SKU-${Date.now()}`, // Agar SKU bo'lmasa avtomatik yaratish
            price: form.price
          },
          stock_move_data: {
            document_id: currentDocumentId,
            movement_type: faktura[rowId]?.invoice.move_type || "in",
            date: form.date || new Date().toISOString().split('T')[0],
            quantity: form.quantity,
            price: form.price,
            comment: form.comment
          }
        }

        const response = await api.post(
          "https://fast-simple-crm.onrender.com/api/v1/contract-products/with-product", 
          contractProductRequest
        )

        // Local state yangilash
        if (response.data.product) {
          setProducts(prev => [...prev, response.data.product])
        }
        
        if (response.data.stock_move) {
          setStockMove(prev => [...prev, {
            id: response.data.stock_move.id,
            product_id: response.data.stock_move.product_id,
            name: form.product,
            sku: form.sku,
            date: form.date,
            quantity: form.quantity,
            price: form.price,
            comment: form.comment
          }])
        }

      } else {
        // Mavjud mahsulot - faqat products endpointiga yuboriladi
        const existingProduct = products.find(
          p => p.name === form.product || p.sku === form.sku
        )

        if (existingProduct) {
          // Stock move yaratish (mavjud mahsulot uchun)
          const stockMoveData = {
            product_id: existingProduct.id,
            document_id: currentDocumentId,
            movement_type: faktura[rowId]?.invoice.move_type || "in",
            date: form.date || new Date().toISOString().split('T')[0],
            quantity: form.quantity,
            price: form.price, // Bu yerda narxni o'zgartirish mumkin
            comment: form.comment
          }

          const stockMoveResponse = await api.post(
            "https://fast-simple-crm.onrender.com/api/v1/contract-products", 
            stockMoveData
          )
          
          // Local state yangilash
          setStockMove(prev => [...prev, {
            id: stockMoveResponse.data.id,
            product_id: existingProduct.id,
            name: existingProduct.name,
            sku: existingProduct.sku,
            date: form.date,
            quantity: form.quantity,
            price: form.price,
            comment: form.comment
          }])

          // Mahsulot narxini yangilash (agar kerak bo'lsa)
          if (form.price !== existingProduct.price) {
            const updatedProduct = await api.patch(
              `https://fast-simple-crm.onrender.com/api/v1/products/${existingProduct.id}`,
              { price: form.price }
            )
            
            // Local state yangilash
            setProducts(prev => prev.map(p => 
              p.id === existingProduct.id 
                ? { ...p, price: form.price }
                : p
            ))
          }
        }
      }

      // Formni tozalash
      setForm({
        product: "",
        sku: "",
        price: 0,
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
        comment: ""
      })
      setIsNewProduct(false)

    } catch (error) {
      console.error("Mahsulot qo'shishda xatolik:", error)
      alert("Mahsulot qo'shishda xatolik yuz berdi!")
    }
  }

  const handleCancel = () => {
    setForm({
      product: "",
      sku: "",
      price: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      comment: ""
    })
    setIsNewProduct(false)
  }

  // Faktura ochilganda document_id ni o'rnatish
  const handleExpandRow = (id: number, fakturaItem: Faktura) => {
    setIsOpen(prev => !prev)
    setRowId(id)
    console.log(fakturaItem);
    
    // Document ID ni o'rnatish
    if (fakturaItem.invoice.id) {
      setCurrentDocumentId(fakturaItem.invoice.id)
    }
  }


  useEffect(()=>{
    let i=0;
    faktura.map(fk=>{
      if(fk.open_amount !== 0){
        i++
      };
    })
    setFakturaCountQuant(i);
  }, [faktura])

  return (
    <CustomLayout>
      <div className="w-full p-6 max-h-screen overflow-y-auto">
        <div className="title mb-4 text-2xl font-semibold">2910</div>
        <div className="overflow-x-auto">
          <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl">
            <thead className={`bg-teal-900 text-white uppercase tracking-wide`}>
              <tr>
                <th className='text-left px-3 py-3'>T/R</th>
                <th className='text-left px-3 py-3'>Тип</th>
                <th className='text-left px-3 py-3'>Faktura</th>
                <th className='text-left px-3 py-3'>Summa</th>
                <th className='text-left px-3 py-3'>Status</th>
                <th className='text-right px-3 py-3'></th>
              </tr>
            </thead>
            <tbody>
              {faktura.length > 0 ? (faktura.map((fk, id) => (
                <React.Fragment key={id}>
                  <tr>
                    <td className='text-left px-3 py-3'>{id + 1}</td>
                    <td className='text-left px-3 py-3'>{fk.invoice.move_type === "in" ? "k" : "ch"}</td>
                    <td className='text-left px-3 py-3'>{fk.invoice.date} dagi {fk.invoice.doc_num} raqamli</td>
                    <td className='text-left px-3 py-3'>{fk.closed_amount} / {fk.invoice.amount} so`m</td>
                    <td className='text-left px-3 py-3'>{Math.trunc(((fk.closed_amount / fk.invoice.amount) * 100) * 100) / 100} % yopilgan</td>
                    <td className='flex justify-end px-3 py-3'>
                      <FaArrowAltCircleDown 
                        onClick={() => handleExpandRow(id, fk)} 
                        className="text-3xl text-green-600 cursor-pointer" 
                      />
                    </td>
                  </tr>
                  <tr className={`${isOpen && rowId === id ? "table-row" : "hidden"}`}>
                    <td colSpan={6} className='p-2'>
                      <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl">
                        <thead className={`bg-teal-700 text-white uppercase tracking-wide`}>
                          <tr>
                            <th className='text-left px-3 py-3'>T/R</th>
                            <th className='text-left px-3 py-3'>Mahsulot(nomi/sku)</th>
                            <th className='text-left px-3 py-3'>Sana</th>
                            <th className='text-left px-3 py-3'>kolichestvo</th>
                            <th className='text-left px-3 py-3'>narxi</th>
                            <th className='text-left px-3 py-3'>summa</th>
                            <th className='text-left px-3 py-3'>izoh</th>
                            <th className='flex justify-end items-center gap-2 px-3 py-3'>
                              Instr <FaPlusCircle className='text-2xl' />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Yangi mahsulot qo'shish formasi */}
                          <tr>
                            <td className='text-left px-3 py-3'>
                              {isNewProduct && (
                                <span className="inline-block text-blue-700 font-semibold text-[10px]">
                                  Yangi
                                </span>
                              )}
                            </td>
                            <td className='text-left px-3 py-3'>
                              <input
                                className="border rounded-sm text-left my-1.5 px-3 py-1.5 bg-amber-50 w-full"
                                list="products"
                                placeholder="Mahsulot nomi yoki SKU"
                                name="product"
                                onChange={(e) => handleProductSearch(e.target.value)}
                                value={form.product}
                              />
                              <datalist id="products">
                                {products.map(item => (
                                  <option key={item.id} value={item.name}>
                                    {item.name} ({item.sku})
                                  </option>
                                ))}
                              </datalist>
                              <br />
                              <input
                                disabled={!isNewProduct}
                                value={form.sku}
                                onChange={handleFormChange}
                                className={`${!isNewProduct ? "bg-gray-200" : "bg-amber-50"} border rounded-sm text-left px-3 py-1.5 w-full`}
                                name="sku"
                                placeholder='SKU'
                                type="text"
                              />
                            </td>
                            <td className='py-1.5'>
                              <input
                                value={form.date}
                                onChange={handleFormChange}
                                className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full'
                                type="date"
                                name='date'
                              />
                            </td>
                            <td className='py-1.5'>
                              <input
                                value={form.quantity}
                                onChange={handleFormChange}
                                className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full'
                                type="number"
                                min={0}
                                name='quantity'
                                placeholder='miqdor'
                              />
                            </td>
                            <td className='py-1.5'>
                              <input
                                value={form.price}
                                onChange={handleFormChange}
                                className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full'
                                type="number"
                                min={0}
                                name='price'
                                placeholder='narxi'
                              />
                              {/* {!isNewProduct && (
                                <small className="text-gray-500">Mavjud mahsulot narxini o'zgartirish mumkin</small>
                              )} */}
                            </td>
                            <td className='text-left px-3 py-3 font-semibold'>
                              {form.price * form.quantity} so'm
                            </td>
                            <td className='py-1.5'>
                              <input
                                value={form.comment}
                                onChange={handleFormChange}
                                className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full'
                                type="text"
                                name='comment'
                                placeholder='izoh'
                              />
                            </td>
                            <td className='cursor-pointer flex items-center justify-end gap-2 text-2xl px-3 py-3'>
                              <button 
                                onClick={handleAddProduct}
                                className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600 hover:text-green-800'
                                title="Qo'shish"
                              >
                                <FaPlusCircle />
                              </button>
                              <button 
                                onClick={handleCancel}
                                className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-600 hover:text-red-800'
                                title="Bekor qilish"
                              >
                                <MdClose />
                              </button>
                            </td>
                          </tr>
                          
                          {/* Mavjud stock move lar ro'yxati */}
                          {stockMove.map((item, index) => (
                            item.document_id === fk.invoice.id ? (<tr key={item.id}>
                              <td className='text-left px-3 py-3'>{index + 1}</td>
                              <td className='text-left px-3 py-3'>
                                <b>{item.name}</b> <br />
                                <small>{item.sku}</small>
                              </td>
                              <td className='text-left px-3 py-3'>{item.date}</td>
                              <td className='text-left px-3 py-3'>{item.quantity}</td>
                              <td className='text-left px-3 py-3'>{item.price}</td>
                              <td className='text-left px-3 py-3'>{item.price * item.quantity}</td>
                              <td className='text-left px-3 py-3'>{item.comment}</td>
                              <td className='flex justify-end items-center gap-3 px-3 py-3'>
                                <button className='text-2xl text-yellow-600 hover:text-yellow-800'>
                                  <BiEdit />
                                </button>
                                <button className='text-2xl text-red-600 hover:text-red-800'>
                                  <MdClose />
                                </button>
                              </td>
                            </tr>) : null
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              ))) : (
                <tr>
                  <td colSpan={6} className='text-center px-3 py-3'>Fakturalar mavjud emas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CustomLayout>
  )
}

export default Products
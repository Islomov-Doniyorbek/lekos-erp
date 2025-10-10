'use client'
import { formatAmount, formatDate } from '../formatter'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { BiEdit } from 'react-icons/bi'
import { FaArrowAltCircleDown, FaPlusCircle } from 'react-icons/fa'
import { MdClose, MdCheck, MdCancel, MdEdit } from 'react-icons/md'
import api from '../auth'
import { useM } from '../context'
import { TbArrowDownLeft, TbArrowUpRight } from 'react-icons/tb'

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
  document_id: number,
  name: string,
  sku: string,
  quantity: number,
  price: number,
  comment: string,
  movement_type?: "in" | "out"
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

// Yangi interface: butun row uchun edit rejimi
interface EditingRow {
  id: number;
  quantity: number;
  price: number;
  comment: string;
}

const Products = () => {
  const {setFakturaCountQuant} = useM()
  const [isOpen, setIsOpen] = useState(false)
  const [rowId, setRowId] = useState(0)
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [faktura, setFaktura] = useState<Faktura[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stockMove, setStockMove] = useState<StockMove[]>([])
  const [loadingStockMoves, setLoadingStockMoves] = useState<boolean>(false)
  const [isLot, setIsLot] = useState(false)
  const [form, setForm] = useState<FormData>({
    product: "",
    sku: "",
    price: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    comment: ""
  })
  const [currentDocumentId, setCurrentDocumentId] = useState<number>(0)
  
  // Yangi state: butun row uchun edit rejimi
  const [editingRows, setEditingRows] = useState<EditingRow[]>([])

  // Dastlabki ma'lumotlarni olish
  useEffect(() => {
    const getDocs = async () => {
      try {
        const [res1, res2] = await Promise.all([
          api.get("https://fast-simple-crm.onrender.com/api/v1/documents/invoices/with-total"),
          api.get("https://fast-simple-crm.onrender.com/api/v1/products"),
        ]);
        
        setFaktura(res1.data)
        setProducts(res2.data)
        
        console.log("Fakturalar:", res1.data);
        console.log("Mahsulotlar:", res2.data);

        if (res1.data.length > 0) {
          setCurrentDocumentId(res1.data[0].invoice.id || 0)
        }
      } catch (error) {
        console.error("Ma'lumotlarni olishda xatolik:", error);
      }
    }
    getDocs()
  }, [])

  // Faktura ma'lumotlarini yangilash
  const refreshFakturaData = async () => {
    try {
      const response = await api.get("https://fast-simple-crm.onrender.com/api/v1/documents/invoices/with-total");
      setFaktura(response.data);
      console.log("Yangilangan fakturalar:", response.data);
    } catch (error) {
      console.error("Faktura ma'lumotlarini yangilashda xatolik:", error);
    }
  }

  // Faktura ochilganda stock movelarni olish
  const fetchStockMovesByDocument = async (documentId: number) => {
    try {
      setLoadingStockMoves(true);
      
      const response = await api.get("https://fast-simple-crm.onrender.com/api/v1/stock-moves");
      console.log("Barcha contract products:", response.data);
      
      const filteredStockMoves = response.data.filter((item: any) => 
        item.document_id === documentId
      );
      
      console.log(`Document ${documentId} uchun stock movelar:`, filteredStockMoves);
      
      const stockMovesWithProductInfo = filteredStockMoves.map((move: any) => {
        const product = products.find(p => p.id === move.product_id);
        return {
          id: move.id,
          product_id: move.product_id,
          document_id: move.document_id,
          name: product?.name || "Noma'lum mahsulot",
          sku: product?.sku || "Noma'lum SKU",
          date: move.date || move.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          quantity: move.quantity,
          price: move.price,
          comment: move.comment || "",
          movement_type: move.movement_type
        };
      });
      
      setStockMove(stockMovesWithProductInfo);
      
    } catch (error) {
      console.error("Stock movelarni olishda xatolik:", error);
      alert("Stock movelarni yuklashda xatolik yuz berdi!");
    } finally {
      setLoadingStockMoves(false);
    }
  }

  // INLINE EDIT FUNCTIONS - YANGI USUL

  // Edit rejimini boshlash
  const startEditingRow = (stockMove: StockMove) => {
    setEditingRows(prev => [...prev.filter(item => item.id !== stockMove.id), {
      id: stockMove.id,
      quantity: stockMove.quantity,
      price: stockMove.price,
      comment: stockMove.comment
    }]);
  };

  // Edit rejimini bekor qilish
  const cancelEditingRow = (id: number) => {
    setEditingRows(prev => prev.filter(item => item.id !== id));
  };

  // Edit qilingan qiymatni yangilash
  const updateEditingRow = (id: number, field: 'quantity' | 'price' | 'comment', value: any) => {
    setEditingRows(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [field]: field === 'quantity' || field === 'price' ? Number(value) : value 
            }
          : item
      )
    );
  };

  // O'zgartirishlarni saqlash
  const saveEditingRow = async (id: number) => {
    const editingRow = editingRows.find(item => item.id === id);
    if (!editingRow) return;

    try {
      // API orqali yangilash
      const updateData = {
        quantity: editingRow.quantity,
        price: editingRow.price,
        comment: editingRow.comment
      };

      await api.patch(
        `https://fast-simple-crm.onrender.com/api/v1/stock-moves/${id}`,
        updateData
      );

      // Local state yangilash
      setStockMove(prev => 
        prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                quantity: editingRow.quantity,
                price: editingRow.price,
                comment: editingRow.comment
              }
            : item
        )
      );

      // Faktura ma'lumotlarini yangilash
      await refreshFakturaData();
      
      // Edit rejimidan chiqish
      cancelEditingRow(id);
      
      alert("Mahsulot ma'lumotlari muvaffaqiyatli yangilandi!");
      
    } catch (error) {
      console.error("Yangilashda xatolik:", error);
      alert("Yangilashda xatolik yuz berdi!");
    }
  };

  // Edit rejimida bo'lgan row ni tekshirish
  const isEditingRow = (id: number) => {
    return editingRows.some(item => item.id === id);
  };

  // Edit rejimidagi qiymatni olish
  const getEditingRowValue = (id: number, field: 'quantity' | 'price' | 'comment') => {
    const editingRow = editingRows.find(item => item.id === id);
    return editingRow ? editingRow[field] : '';
  };

  // Stock moveni o'chirish
  const handleDeleteStockMove = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;

    try {
      await api.delete(`https://fast-simple-crm.onrender.com/api/v1/stock-moves/${id}`);
      
      // Local state yangilash
      setStockMove(prev => prev.filter(item => item.id !== id));
      
      // Faktura ma'lumotlarini yangilash
      await refreshFakturaData();
      
      alert("Mahsulot muvaffaqiyatli o'chirildi!");
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  // Mahsulot qidirish va tekshirish
  const handleProductSearch = (productName: string) => {
    setForm(prev => ({ ...prev, product: productName }))
    
    const existingProduct = products.find(
      product => 
        product.name.toLowerCase() === productName.toLowerCase() ||
        product.sku.toLowerCase() === productName.toLowerCase()
    )

    if (existingProduct) {
      setIsNewProduct(false)
      setForm(prev => ({
        ...prev,
        product: existingProduct.name,
        sku: existingProduct.sku,
        price: existingProduct.price
      }))
    } else {
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

      let success = false;

      if (isNewProduct) {
        // Yangi mahsulot
        const contractProductRequest: ContractProductRequest = {
          user_id: 1,
          product_data: {
            name: form.product,
            sku: form.sku || `SKU-${Date.now()}`,
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
          "https://fast-simple-crm.onrender.com/api/v1/stock-moves/with-product", 
          contractProductRequest
        )

        // Local state yangilash
        if (response.data.product) {
          setProducts(prev => [...prev, response.data.product])
        }
        
        if (response.data.stock_move) {
          const newStockMove: StockMove = {
            id: response.data.stock_move.id,
            product_id: response.data.stock_move.product_id,
            document_id: currentDocumentId,
            name: form.product,
            sku: form.sku,
            quantity: form.quantity,
            price: form.price,
            comment: form.comment,
            movement_type: faktura[rowId]?.invoice.move_type || "in"
          }
          setStockMove(prev => [...prev, newStockMove])
          success = true;
        }

      } else {
        // Mavjud mahsulot
        const existingProduct = products.find(
          p => p.name === form.product || p.sku === form.sku
        )

        if (existingProduct) {
          const stockMoveData = {
            product_id: existingProduct.id,
            document_id: currentDocumentId,
            movement_type: faktura[rowId]?.invoice.move_type || "in",
            quantity: form.quantity,
            price: form.price,
            comment: form.comment
          }

          const stockMoveResponse = await api.post(
            "https://fast-simple-crm.onrender.com/api/v1/stock-moves", 
            stockMoveData
          )
          
          const newStockMove: StockMove = {
            id: stockMoveResponse.data.id,
            product_id: existingProduct.id,
            document_id: currentDocumentId,
            name: existingProduct.name,
            sku: existingProduct.sku,
            quantity: form.quantity,
            price: form.price,
            comment: form.comment,
            movement_type: faktura[rowId]?.invoice.move_type || "in"
          }
          setStockMove(prev => [...prev, newStockMove])
          success = true;
        }
      }

      if (success) {
        // Faktura ma'lumotlarini yangilash
        await refreshFakturaData();
        
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
        
        alert("Mahsulot muvaffaqiyatli qo'shildi!");
      }
      setIsLot(false)

    } catch (error: any) {
      if(error.response?.data?.detail === "The amount received at the warehouse exceeds the amount indicated on the invoice."){
        setIsLot(true)
      }
      console.error("Mahsulot qo'shishda xatolik:", error)
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

  // Faktura ochilganda stock movelarni yuklash
  const handleExpandRow = async (id: number, fakturaItem: Faktura) => {
    const documentId = fakturaItem.invoice.id;
    
    if (isOpen && rowId === id) {
      setIsOpen(false);
      setRowId(0);
      setEditingRows([]); // Edit rejimini tozalash
    } else {
      setIsOpen(true);
      setRowId(id);
      setCurrentDocumentId(documentId);
      setEditingRows([]); // Edit rejimini tozalash
      
      await fetchStockMovesByDocument(documentId);
    }
  }

  // Faktura ochiq qator uchun stock movelarni filter qilish
  const getStockMovesForCurrentFaktura = (fakturaId: number) => {
    return stockMove.filter(item => item.document_id === fakturaId);
  }

  // Faktura uchun jami summani hisoblash
  const calculateTotalForFaktura = (fakturaId: number) => {
    const moves = stockMove.filter(item => item.document_id === fakturaId);
    return moves.reduce((total, move) => total + (move.price * move.quantity), 0);
  }
  
  const {bg,bg2, txt} = useM()
  
  return (
    <CustomLayout>
      <div className="w-full p-6 max-h-screen overflow-y-auto">
        <div className="title mb-4 text-2xl font-semibold">Список счетов-фактур по договорам</div>
        <div className="overflow-x-auto border-[1px] border-gray-100 border-t-0 rounded-2xl">
          <table className="border-collapse border  w-full text-sm shadow-md rounded-xl ">
            <thead className={`${bg2} ${txt} uppercase tracking-wide`}>
              <tr>
                <th className='text-left px-3 py-3'>#</th>
                <th className='text-left px-3 py-3'>Тип</th>
                <th className='text-left px-3 py-3'>Дата и номер</th>
                <th className='text-left px-3 py-3'>Сумма</th>
                <th className='text-left px-3 py-3'>Описание</th>
                <th className='text-left px-3 py-3'>Статус</th>
                <th className='text-right px-3 py-3'></th>
              </tr>
            </thead>
            <tbody>
              {faktura.length > 0 ? (faktura.map((fk, id) => {
                const fakturaTotal = calculateTotalForFaktura(fk.invoice.id);
                const completionPercentage = fk.invoice.amount > 0 ? 
                  Math.trunc(((fk.closed_amount / fk.invoice.amount) * 100) * 100) / 100 : 0;
                
                return (
                  <React.Fragment key={id}>
                    <tr className={`${faktura.length == id+1 ? "border-b-0" : "border-b border-gray-300"}`}>
                      <td className='text-left px-3 py-3'>{id + 1}</td>
                      <td className='text-left px-3 py-3'>{fk.invoice.move_type === "in" ? (
                      <span className="flex items-center gap-1">
                        <TbArrowDownLeft /> Вх.
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <TbArrowUpRight /> Иcх.
                      </span>
                    )}</td>
                      <td className='text-left px-3 py-3'>
                        {fk.invoice.doc_num ? (
                          <>
                            {formatDate(fk.invoice.date)} sanadagi <strong>{fk.invoice.doc_num}</strong> raqamli
                          </>
                        ) : (
                          formatDate(fk.invoice.date)
                        )}
                      </td>
                      <td className='text-left px-3 py-3'>
                        {formatAmount(Number(fk.closed_amount))} / {formatAmount(Number(fk.invoice.amount))} сум
                        <br />
                        <small className="text-green-600 font-semibold">
                          (Открытая сумма: {formatAmount(Number(fk.open_amount))} сум)
                        </small>
                      </td>
                      <td className='text-left px-3 py-3'>
                        {fk.invoice.comment}
                      </td>
                      <td className='text-left px-3 py-3'>
                        <div className="flex items-center gap-2">
                          <span>{completionPercentage}% yopilgan</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={` h-2 rounded-full ${completionPercentage > 100 ? "bg-red-600" : "bg-green-600"}`} 
                              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className='flex justify-end px-3 py-3'>
                        <FaArrowAltCircleDown 
                          onClick={() => handleExpandRow(id, fk)} 
                          className={` text-3xl cursor-pointer transition-transform ${
                            isOpen && rowId === id ? 'text-red-600 rotate-180' : 'text-green-600'
                          }`} 
                        />
                      </td>
                    </tr>
                    <tr className={`${isOpen && rowId === id ? "table-row" : "hidden"}`}>
                      <td colSpan={7} className='p-2'>
                        <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl">
                          <thead className={`${bg} text-white uppercase tracking-wide`}>
                            <tr>
                              <th className='text-left px-3 py-3'>#</th>
                              <th className='text-left px-3 py-3'>Продукт</th>
                              <th className='text-left px-3 py-3'>Количество</th>
                              <th className='text-left px-3 py-3'>Цена</th>
                              {/* <th></th> */}
                              <th className='text-left px-3 py-3'>Сумма</th>
                              <th className='text-left px-3 py-3'>Описание</th>
                              <th className='text-right px-3 py-3'>
                                Опции
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Yangi mahsulot qo'shish formasi */}
                            <tr className={`${fk.open_amount == 0 ? "hidden" : "table-row"}`}>
                              <td className='text-left px-3 py-3'>
                                {isNewProduct && (
                                  <span className="inline-block text-blue-700 font-semibold text-[10px]">
                                    Новый
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
                                  value={form.quantity}
                                  onChange={handleFormChange}
                                  className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full'
                                  type="number"
                                  min={0}
                                  name='quantity'
                                  placeholder='miqdor'
                                />
                              </td>
                              <td className='py-1.5 relative'>
                                <input
                                  value={form.price}
                                  onChange={handleFormChange}
                                  className={`${isLot ? "border-2 border-red-500" : ""} border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full`}
                                  type="number"
                                  min={0}
                                  name='price'
                                  placeholder='narxi'
                                /> 
                                <span className={`${isLot ? "inline-block" : "hidden"} absolute top-1 left-0 text-[10px] text-red-600`}>Hisobdan oshib ketdi!</span>
                              </td>
                              <td className='text-left px-3 py-3 font-semibold'>
                                {form.price * form.quantity} сум
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
                              <td className='cursor-pointer text-right  gap-2 text-2xl px-3 py-3'>
                                  <button 
                                  onClick={handleAddProduct}
                                  className='cursor-pointerw-8 h-8 text-xl text-green-600 hover:text-green-800'
                                  title="Qo'shish"
                                >
                                  <FaPlusCircle />
                                </button>
                              </td>
                            </tr>
                            
                            {/* Loading holati */}
                            {loadingStockMoves && (
                              <tr>
                                <td colSpan={8} className="text-center px-3 py-3">
                                  Yuklanmoqda...
                                </td>
                              </tr>
                            )}
                            
                            {/* Mavjud stock move lar ro'yxati */}
                            {getStockMovesForCurrentFaktura(fk.invoice.id).map((item, index) => {
                              const isEditing = isEditingRow(item.id);
                              
                              return (
                                <tr key={item.id}>
                                  <td className='flex flex-col px-3 py-3'>
                                    <span>{index+1}</span>
                                  </td>
                                  <td className='text-left px-3 py-3'>
                                    <b>{item.name}</b> <br />
                                    <small>{item.sku}</small>
                                  </td>
                                  
                                  {/* Miqdor */}
                                  <td className='text-left px-3 py-3'>
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={getEditingRowValue(item.id, 'quantity')}
                                        onChange={(e) => updateEditingRow(item.id, 'quantity', e.target.value)}
                                        className="border rounded-sm px-2 py-1 w-full"
                                      />
                                    ) : (
                                      <span>{item.quantity}</span>
                                    )}
                                  </td>
                                  
                                  {/* Narx */}
                                  <td className='text-left px-3 py-3'>
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={getEditingRowValue(item.id, 'price')}
                                        onChange={(e) => updateEditingRow(item.id, 'price', e.target.value)}
                                        className="border rounded-sm px-2 py-1 w-full"
                                      />
                                    ) : (
                                      <span>{formatAmount(Number(item.price))}</span>
                                    )}
                                  </td>
                                  
                                  {/* Summa */}
                                  <td className='text-left px-3 py-3'>
                                    {isEditing ? (
                                      <span className="font-semibold">
                                        {getEditingRowValue(item.id, 'quantity') * getEditingRowValue(item.id, 'price')} сум
                                      </span>
                                    ) : (
                                      <span>{formatAmount(item.price * item.quantity)} сум</span>
                                    )}
                                  </td>
                                  
                                  {/* Izoh */}
                                  <td className='relative text-left px-3 py-3'>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={getEditingRowValue(item.id, 'comment')}
                                        onChange={(e) => updateEditingRow(item.id, 'comment', e.target.value)}
                                        className="border rounded-sm px-2 py-1 w-full"
                                      />
                                    ) : (
                                      <span className="truncate max-w-xs">{item.comment}</span>
                                    )}
                                    <span className={`absolute top-0.5 left-0.5 text-red-700 ${fk.open_amount < 0 ? "inline-block" : "hidden"}`}>
                                      Mahsulot narxi yoki soni to`g`ri kelmadi!
                                    </span>
                                  </td>
                                  
                                  {/* Harakatlar */}
                                  <td className='flex justify-end items-center gap-2 px-3 py-3'>
                                    {isEditing ? (
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => saveEditingRow(item.id)}
                                          className="text-green-600 hover:text-green-800 text-xl"
                                          title="Saqlash"
                                        >
                                          <MdCheck />
                                        </button>
                                        <button 
                                          onClick={() => cancelEditingRow(item.id)}
                                          className="text-red-600 hover:text-red-800 text-xl"
                                          title="Bekor qilish"
                                        >
                                          <MdCancel />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => startEditingRow(item)}
                                          className='text-xl text-yellow-600 hover:text-yellow-800'
                                          title="Tahrirlash"
                                        >
                                          <MdEdit />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteStockMove(item.id)}
                                          className='text-xl text-red-600 hover:text-red-800'
                                          title="O'chirish"
                                        >
                                          <MdClose />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            
                            {/* Jami summa qatori */}
                            {getStockMovesForCurrentFaktura(fk.invoice.id).length > 0 && (
                              <tr className="bg-gray-100 font-bold">
                                <td colSpan={4} className='text-right px-3 py-3'>
                                  Общий:
                                </td>
                                <td className='text-left px-3 py-3 text-green-600'>
                                  {formatAmount(calculateTotalForFaktura(fk.invoice.id))} сум
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            )}
                            
                            {/* Agar stock move lar bo'lmasa */}
                            {!loadingStockMoves && getStockMovesForCurrentFaktura(fk.invoice.id).length === 0 && (
                              <tr>
                                <td colSpan={8} className="text-center py-3 text-gray-500">
                                  У вас нет зарегистрированных счетов-фактур.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })) : (
                <tr>
                  <td colSpan={6} className='text-center py-3'>У вас нет зарегистрированных счетов-фактур.</td>
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
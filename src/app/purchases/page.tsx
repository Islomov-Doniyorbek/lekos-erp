'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { MdCheck, MdClose, MdEdit } from 'react-icons/md'
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaCheckCircle, FaCircle, FaPlus, FaPlusCircle, FaTrash, FaTrashAlt } from 'react-icons/fa'
import type { components, paths } from "../../../types";
import api from '../auth'
import { useM } from '../context'
import { formatAmount, formatDate } from '../formatter'
import { TbArrowDownLeft } from 'react-icons/tb'
import { Span } from 'next/dist/trace'
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query'
import { useContracts, useCounterparties, useCounterparties2 } from '../queries/useRequest'
import TableWrap from '@/components/tableWrap'
import Table from '@/components/table'
import Thead from '@/components/thead'
import Tbody from '@/components/tbody'
 
interface Supplier {
  id: number;
  name: string;
  tin: string;
}

interface PurchaseForm {
  id: number;
  supplier: string;
  stir: string;
  sana: string;
  raqam: string;
  izoh: string;
  total: number;
}

interface PurchaseDeal {
  id: number;
  name: string;
  tin: string;
  doc_num: string | null;
  comment: string;
  date: string;
  total?: number;
  agent_id?: number;
  has_contract?: boolean;
}

interface Document {
  id: number;
  contract_id: number;
  type: "invoice" | "payment";
  move_type: "in" | "out";
  date: string;
  doc_num: string | null;
  amount: number;
  comment: string;
}

const Purchase = () => { 
  const [rows, setRows] = useState<PurchaseDeal[]>([])
  const [inRows, setInRows] = useState<Document[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  
  const [isInputRow, setIsInputRow] = useState(false)
  const [isInputInRow, setIsInputInRow] = useState(false)
  const [isEditRow, setIsEditRow] = useState(false)
  const [isEditInRow, setIsEditInRow] = useState(false)
  const [isEditRowStatus, setIsEditRowStatus] = useState(false)
  const [valSupplier, setValSupplier] = useState(false)
  const [checkSupplier, setCheckSupplier] = useState("")
  const [editRowId, setEditRowId] = useState(0)
  const [editInRowId, setEditInRowId] = useState(0)
  const [innerTableId, setInnerTableId] = useState<null | number>(null)
    const [dogDate, setDogDate] = useState("")
  const router = useRouter()
  
  const [form, setForm] = useState<PurchaseForm>({
    id: 0,
    supplier: "",
    stir: "",
    sana: "",
    raqam: "",
    izoh: "",
    total: 0
  })

  // YANGILANDI: Faqat move_type bilan ishlaymiz, type avtomatik hisoblanadi
  const [inForm, setInForm] = useState({
    id: 0,
    move_type: "in" as "in" | "out",
    date: "",
    doc_num: "",
    amount: "",
    comment: ""
  })

  const [editForm, setEditForm] = useState({
    id: 0,
    supplier: "",
    stir: "",
    sana: "",
    raqam: "",
    izoh: ""
  })

  // YANGILANDI: Faqat move_type bilan ishlaymiz
  const [editInForm, setEditInForm] = useState({
    id: 0,
    move_type: "in" as "in" | "out",
    date: "",
    doc_num: "",
    amount: "",
    comment: ""
  })

  // Asosiy ma'lumotlarni olish

  const {data: dataCP, isLoading: isLoadingCP, error: errorCP} = useCounterparties("supplier")
  const {data: dataC, isLoading: isLoadingC, error: errorC} = useContracts("purchase")
  const queryClient = useQueryClient()
useEffect(() => {
  if (isLoadingCP) {
    console.log('Maʼlumot yuklanmoqda...')
    return
  }

  if (errorCP) {
    console.log('Xatolik:', errorCP.message)
    return
  }

  if (!dataCP || !dataC) return

  console.log('Maʼlumot olindi:', dataCP)

  // Mijozlarni set qilish
  setSuppliers(dataCP)

  // Mijozlar va shartnomalarni birlashtirish
  const merged = dataCP.flatMap((supplier: Supplier) => {
    const contracts = dataC.filter(
      (contract: any) => contract.agent_id === supplier.id
    )

    if (contracts.length > 0) {
      return contracts.map((contract: any) => ({
        ...supplier,
        ...contract,
        has_contract: true, // Shartnoma bor
      }))
    }

    return []
  })

  setRows(merged)
}, [dataCP, dataC, isLoadingCP, errorCP, errorC])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addRow = async () => {
    
    
    try {
      if (!form.supplier || !form.sana) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      const supplierName = form.supplier || "";
      const existingSupplier = suppliers.find(
        s => s.name?.toLowerCase() === supplierName.toLowerCase()
      );

      let response;

      if (existingSupplier) {
        response = await api.post(
          "https://fast-simple-crm.onrender.com/api/v1/contracts",
          {
            agent_id: existingSupplier.id,
            type: "purchase",
            date: form.sana,
            doc_num: form.raqam.length > 0 ? form.raqam : null,
            comment: form.izoh
          }
        );
      } else {
        response = await api.post(
          "https://fast-simple-crm.onrender.com/api/v1/contracts/with-counterparty",
          {
            counterparty_data: {
              type: "supplier",
              name: form.supplier,
              tin: form.stir || null
            },
            contract_data: {
              agent_id: 0,
              type: "purchase",
              date: form.sana,
              doc_num: form.raqam.length > 0 ? form.raqam : null,
              comment: form.izoh
            }
          }
        );
        console.log(response.data);
        
        setSuppliers((prev) => [
  ...prev,
  {
    id: response.data.id,
    name: form.supplier,
    tin: form.stir || "",
  },
]);


        // window.location.href = "/purchase"
      }
      
      const newRow: PurchaseDeal = {
        id: response.data.id,
        name: form.supplier,
        tin: form.stir || "J.SH.",
        doc_num: form.raqam.length > 0 ? form.raqam : null,
        comment: form.izoh,
        date: form.sana,
        total: 0,
        has_contract: true
      };
      
      setRows(prev => [...prev, newRow]);
      queryClient.setQueryData(['contractsWithTotal', 'purchase'], (oldData: any) => {
        if (!oldData) return [{
          type: "sales",
              date: form.sana,
              doc_num: form.raqam,
              comment: form.izoh
        }];
        return [...oldData, {
          type: "sales",
              date: form.sana,
              doc_num: form.raqam,
              comment: form.izoh
        }];
      })
      queryClient.setQueryData(['counterparties2', 'supplier'], (oldData: any) => {
        if (!oldData) return [{
              type: "customer",
              name: form.supplier,
              tin: form.stir || null
            }];
        return [...oldData, {
              type: "customer",
              name: form.supplier,
              tin: form.stir || null
            }];
      })
      setForm({
        id: 0,
        supplier: "",
        stir: "",
        sana: "",
        raqam: "",
        izoh: "",
        total: 0
      });
      window.location.reload()
      setIsInputRow(false);
      
    } catch (error) {
      console.log(error);
      // window.location.href = "/purchases"
      
      // setForm({
        //   id: 0,
        //   supplier: "",
        //   stir: "",
        //   sana: "",
      //   raqam: "",
      //   izoh: "",
      //   total: 0
      // });
      setSuppliers((prev) => [
  ...prev,
  {
    id: 1987411,
    name: form.supplier,
    tin: form.stir || "",
  },
]);
      alert("Xatolik yuz berdi! Ma'lumotlarni qayta tekshiring.");
    }
  };

  // EDIT ROW FUNCTIONS
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const editRow = (item: PurchaseDeal) => {
    setEditForm({
      id: item.id,
      supplier: item.name,
      stir: item.tin,
      sana: item.date,
      raqam: item.doc_num || null,
      izoh: item.comment || ""
    });
    setEditRowId(item.id);
    setIsEditRow(true);
    setIsEditRowStatus(false);
  };

  const handleSave = async () => {
    try {
      const {data:updated} = await api.patch(
        `https://fast-simple-crm.onrender.com/api/v1/contracts/${editForm.id}`,
        {
          date: editForm.sana,
          doc_num: editForm.raqam,
          comment: editForm.izoh
        }
      );
      queryClient.setQueryData(['contractsWithTotal', 'purchase'], (old: any) => {
        if (!old) return [updated];

        return old.map(item =>
          item.id === editForm.id
            ? {
                ...item, // eski maydonlarni saqlab qoladi
                date: editForm.sana,
                doc_num: editForm.raqam,
                comment: editForm.izoh
              }
            : item
        );
      });


      setRows(prev =>
        prev.map(row =>
          row.id === editForm.id
            ? { 
                ...row, 
                date: editForm.sana,
                doc_num: editForm.raqam,
                comment: editForm.izoh
              }
            : row
        )
      );
      
      setIsEditRow(false);
      setIsEditRowStatus(true);
      
      setTimeout(() => {
        setIsEditRowStatus(false);
      }, 3000);
      
    } catch (error) {
      console.log(error);
      alert("Yangilashda xatolik!");
    }
  };

  // IN EDIT FUNCTIONS - YANGILANDI
  const handleInEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditInForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const editInRow = (item: Document) => {
    setEditInForm({
      id: item.id,
      move_type: item.move_type,
      date: item.date,
      doc_num: item.doc_num ? item.doc_num : null,
      amount: item.amount.toString(),
      comment: item.comment
    });
    setEditInRowId(item.id);
    setIsEditInRow(true);
  };

  const handleInSave = async () => {
    try {
      if (!editInForm.date || !editInForm.amount) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      // YANGILANDI: move_type asosida type avtomatik hisoblanadi
      const type = editInForm.move_type === "in" ? "invoice" : "payment";

      await api.patch(
        `https://fast-simple-crm.onrender.com/api/v1/documents/${editInForm.id}`,
        {
          type: type,
          move_type: editInForm.move_type,
          date: editInForm.date,
          doc_num: editInForm.doc_num,
          amount: parseFloat(editInForm.amount),
          comment: editInForm.comment || "---"
        }
      );

      setInRows(prev =>
        prev.map(row =>
          row.id === editInForm.id
            ? {
                ...row,
                type: type,
                move_type: editInForm.move_type,
                date: editInForm.date,
                doc_num: editInForm.doc_num,
                amount: parseFloat(editInForm.amount),
                comment: editInForm.comment
              }
            : row
        )
      );

      setIsEditInRow(false);
      alert("Hujjat muvaffaqiyatli yangilandi!");
      
    } catch (error) {
      console.log(error);
      alert("Hujjatni yangilashda xatolik!");
    }
  };

  // YANGILANDI: move_type o'zgarganda type avtomatik yangilanadi
  const handleInChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addInRow = async (id: number) => {
    console.log(form.raqam);
    try {
      if (!inForm.date || !inForm.amount) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      // YANGILANDI: move_type asosida type avtomatik hisoblanadi
      const type = inForm.move_type === "in" ? "invoice" : "payment";

      const res = await api.post("https://fast-simple-crm.onrender.com/api/v1/documents", 
        {
          contract_id: id,
          type: type,
          move_type: inForm.move_type,
          date: inForm.date,
          doc_num: inForm.doc_num.length > 0 ? inForm.doc_num : null,
          amount: parseFloat(inForm.amount),
          comment: inForm.comment || "---"
        }
      );

      // Yangi hujjatni ro'yxatga qo'shish
      const newDocument: Document = {
        id: res.data.id,
        contract_id: id,
        type: type,
        move_type: inForm.move_type,
        date: inForm.date,
        doc_num: inForm.doc_num.length > 0 ? inForm.doc_num : null,
        amount: parseFloat(inForm.amount),
        comment: inForm.comment || "---"
      };
      console.log(newDocument);
      

      setInRows(prev => [...prev, newDocument]);

      // Formani tozalash
      setInForm({
        id: 0,
        move_type: "in",
        date: "",
        doc_num: "",
        amount: "",
        comment: ""
      });

      setIsInputInRow(false);
      // router.refresh()
    } catch (error) {
      console.log(error);
      alert("Hujjat qo'shishda xatolik!");
    }
  };

  const toggleInnerTable = async (id: number) => {
    if (innerTableId === id) {
      setInnerTableId(null);
      setInRows([]);
      return;
    }

    try {
      const res = await api.get(`https://fast-simple-crm.onrender.com/api/v1/documents?contract_id=${id}`);
      setInRows(res.data);
      setInnerTableId(id);
    } catch (error) {
      console.log(error);
      alert("Hujjatlar yuklashda xatolik!");
    }
  };

  const [searchResults, setSearchResults] = useState<Supplier[]>([]);
  
  const validationSupplier = (supplier: string) => {
    const result = suppliers.filter(s =>
      s.name.toLowerCase().includes(supplier.toLowerCase())
    );

    const found = suppliers.find(
      s => s.name.toLowerCase() === supplier.toLowerCase()
    );

    setSearchResults(result);

    if (found) {
      setCheckSupplier(found.tin);
      setValSupplier(false);
      setForm(prev => ({
        ...prev,
        supplier: found.name,
        stir: found.tin
      }));
    } else {
      setCheckSupplier("");
      setValSupplier(true);
      setForm(prev => ({
        ...prev,
        supplier: supplier,
        stir: ""
      }));
    }
  };

  const deletePurchaseDeal = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu shartnomani o'chirmoqchimisiz?")) {
      return;
    }

    try {
      const {data:deleted} = await api.delete(`https://fast-simple-crm.onrender.com/api/v1/contracts/${id}`);
      queryClient.setQueryData(['contractsWithTotal', 'sales'], (old:any) =>
      {
        if(!old) return [deleted];
        return old.filter(item => item.id !== id)
      }
      );
      setRows(prev => prev.filter(row => row.id !== id));
      alert("Shartnoma muvaffaqiyatli o'chirildi!");
    } catch (error) {
      console.log(error);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu hujjatni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      await api.delete(`https://fast-simple-crm.onrender.com/api/v1/documents/${id}`);
      setInRows(prev => prev.filter(doc => doc.id !== id));
      alert("Hujjat muvaffaqiyatli o'chirildi!");
    } catch (error) {
      console.log(error);
      alert("Hujjatni o'chirishda xatolik!");
    }
  };

  // Debit va kredit summalarini hisoblash - XARIDLAR UCHUN
  




  



  // const { totalDebit, totalKredit } = calculateTotals();
  const {table, innerTable, txt} = useM()
  const [isActive, setIsActive] = useState(false)
  return (
    <CustomLayout>
      <div className="w-full p-6 max-h-screen overflow-y-auto">
        <div className="title mb-2 flex justify-between">
          <h1 className='text-2xl font-semibold'>{isActive ? "Список клиентов" : "Список договоров на покупку"}</h1>
          <div className="switch  inline-block">
            <button onClick={()=>setIsActive(false)} className={`${!isActive ? `${table} text-gray-50` : "bg-gray-300 text-blue-600"} w-[50px] h-[30px] rounded-l-full cursor-pointer `}>дог.</button>
            <button onClick={()=>setIsActive(true)} className={`${!isActive ? "bg-gray-300 text-blue-600" : `${table} text-gray-50`} w-[50px] h-[30px] rounded-r-full cursor-pointer `}>пос.</button>
          </div>
        </div>
        <TableWrap>
          <Table>
            <Thead>
              {!isActive ? (<tr>
                <th className='text-left px-3 py-3'>#</th>
                <th className='text-left px-3 py-3'>Поставщик</th>
                <th className='text-left px-3 py-3'>Дата</th>
                <th className='text-left px-3 py-3'>Номер договора</th>
                {/* <th className='text-left px-3 py-3'>Описание</th> */}
                <th className='text-left px-3 py-3'>Дебит</th>
                <th className='text-left px-3 py-3'>Кредит</th>
                <th className='px-3 py-3 flex gap-2 justify-end items-center'>
                  Опции 
                  <FaPlusCircle 
                    className='cursor-pointer text-2xl' 
                    onClick={() => setIsInputRow(prev => !prev)} 
                  />
                </th>
              </tr>) : (
              <tr>
                              <th className="px-3 py-3 text-left">#</th>
                              <th className="px-3 py-3 text-left">Поставщик</th>
                                                            <th className="px-3 py-3 text-left">ИНН</th>
                                                            <th className="px-3 py-3 text-left">Номер</th>
                                                            <th className="px-3 py-3 text-left">Био</th>
                                                            <th className="px-3 py-3 text-left">Дебит</th>
                                                            <th className="px-3 py-3 text-left">Кредит</th>
                                                            <th className="px-3 py-3 flex items-center justify-end gap-1">Опции <FaPlusCircle className='cursor-pointer text-2xl'/></th>
                                            </tr>

              )}
            </Thead>
            <Tbody>
              {!isActive ? (
                <>
                <tr className={`${isInputRow ? "table-row" : "hidden"}`}>
                <td className='text-left px-3 py-3'>
                  <span className={`${valSupplier ? "inline-block" : "hidden"} text-blue-700 font-semibold text-[10px]`}>
                    Новый
                  </span>
                </td>
                <td className='text-left px-3 py-3'>
                  <input 
                    className="border rounded-sm text-left my-1.5 px-3 py-1.5 bg-amber-50 w-full"
                    list="suppliers" 
                    placeholder="Имя поставщикa"
                    name="supplier"
                    onChange={(e) => {
                      validationSupplier(e.target.value);
                      handleChange(e);
                    }}
                    value={form.supplier}
                  />
                  <datalist className='z-20' id="suppliers">
                    {suppliers.map(item => (
                      <option key={item.id} value={item.name}>{item.tin ? `ИНН: ${item.tin}` : "Физ. лицо"}</option>
                    ))}
                  </datalist>
                  <br />
                  <input
                    disabled={!valSupplier}
                    value={form.stir}
                    onChange={handleChange}
                    className={`${!valSupplier ? "bg-gray-400" : "bg-amber-50"} border rounded-sm text-left px-3 py-1.5 w-full`} 
                    name="stir" 
                    placeholder='ИНН'  
                    type="text" 
                  />   
                </td>
                <td className='py-1.5'>
                  <input 
                    value={form.sana} 
                    onChange={handleChange} 
                    className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full' 
                    type="date" 
                    name='sana' 
                  />
                </td>
                <td className='py-1.5'>
                  <input 
                    value={form.raqam} 
                    onChange={handleChange} 
                    className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full' 
                    type="text"  
                    name='raqam' 
                    placeholder='Номер документa' 
                  />
                </td>
                {/* <td className='py-1.5'>
                  <input 
                    value={form.izoh} 
                    onChange={handleChange} 
                    className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full' 
                    type="text" 
                    name='izoh' 
                    placeholder='...' 
                  />
                </td> */}
                <td className='text-left px-3 py-3'></td>
                <td className='text-left px-3 py-3'></td>
                <td className='cursor-pointer flex items-center justify-end gap-2 text-2xl px-3 py-3'>
                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600'>
                    <FaPlusCircle onClick={addRow} />
                  </button>
                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-600'>
                    <MdClose onClick={() => setIsInputRow(false)} />
                  </button>
                </td>
              </tr>

              {/* Asosiy qatorlar */}
              {rows.length > 0 ? (
                rows.map((item, i) => (
                <React.Fragment key={item.id}>
                  {/* Ko'rinadigan qator */}
                  <tr onClick={() => {toggleInnerTable(item.id);  setDogDate(item.date); console.log(item.date);}} className={`${isEditRow && editRowId === item.id ? "hidden" : "table-row"} border-b border-gray-200 border-t hover:bg-[#cbe5f6]`}>
                    <td className='text-left px-3 py-2 relative overflow-hidden'>
                      {i + 1}
                      <div className={`${isEditRowStatus && editRowId === item.id ? "block" : "hidden"} h-10 w-2 bg-yellow-500 absolute -top-2 left-2 rotate-45`}></div>
                    </td>
                    <td className='text-left pl-6 pr-3 py-2'>
                      <b>{item.name}</b> <br />
                      <small>{item.tin ? item.tin : "Физ. лицо"}</small>
                    </td>
                    <td className='text-left px-3 py-2'>{formatDate(item.date)}</td>
                    <td className='text-left px-3 py-2'>{item.doc_num ? item.doc_num : "---"}</td>
                    {/* <td className='text-left px-3 py-2'>{item.comment}</td> */}
                    <td className='text-left px-3 py-2'>
                      {item.total && item.total > 0 ? formatAmount(item.total) : 0}
                    </td>
                    <td className='text-left px-3 py-2'>
                      {item.total && item.total < 0 ? formatAmount(Math.abs(item.total)) : 0}
                    </td>
                    <td className='flex items-center justify-end gap-2 px-3 py-2'>
                      <button className='cursor-pointer flex items-center justify-center text-xl w-8 h-8 font-semibold'>
                                                    {innerTableId === item.id ? (
                                                      <FaArrowAltCircleUp className='text-red-700' onClick={() => {toggleInnerTable(item.id);
                                                      }} />
                                                    ) : (
                                                      <FaArrowAltCircleDown className='text-teal-700' onClick={() => {toggleInnerTable(item.id);  setDogDate(item.date); console.log(item.date);}} />
                                                    )}
                                                  </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-yellow-600'>
                        <MdEdit onClick={() => editRow(item)} />
                      </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                        <FaTrashAlt onClick={() => deletePurchaseDeal(item.id)} />
                      </button>
                    </td>
                  </tr>

                  {/* Tahrirlash qatori */}
                  <tr className={`${isEditRow && editRowId === item.id ? "table-row" : "hidden"}`}>
                    <td className='text-left px-3 py-3'>
                      <span className='text-blue-700 font-semibold text-[16px]'>
                        <MdEdit />
                      </span>
                    </td>
                    <td className='text-left pl-6 pr-3 py-2'>
                      <b>{editForm.supplier}</b> <br />
                      <small>{editForm.stir ? editForm.stir : "J.SH."}</small>
                    </td>
                    <td className='p-1.5'>
                      <input 
                        value={editForm.sana} 
                        onChange={handleEditChange} 
                        className='text-left px-3 py-1.5 bg-[#c1f0f8] w-full' 
                        type="date" 
                        name='sana' 
                      />
                    </td>
                    <td className='p-1.5'>
                      <input 
                        value={editForm.raqam} 
                        onChange={handleEditChange} 
                        className='text-left px-3 py-1.5 bg-[#c1f0f8] w-full' 
                        type="text" 
                        name='raqam' 
                        placeholder='Номер договора' 
                      />
                    </td>
                    {/* <td className='p-1.5'>
                      <input 
                        value={editForm.izoh} 
                        onChange={handleEditChange} 
                        className='text-left px-3 py-1.5 bg-[#c1f0f8] w-full' 
                        type="text" 
                        name='izoh' 
                        placeholder='...' 
                      />
                    </td> */}
                    <td className='text-left px-3 py-3'></td>
                    <td className='text-left px-3 py-3'></td>
                    <td className='text-left cursor-pointer flex justify-center items-center gap-1.5 text-2xl px-3 py-3'>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600'>
                        <MdCheck onClick={handleSave} />
                      </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                        <MdClose onClick={() => setIsEditRow(false)} />
                      </button>
                    </td>
                  </tr>





                  <tr className={`${item.id === innerTableId ? "table-row" : "hidden"}`}>
                    <td className='px-2 py-6 bg-[#f0ffff]' colSpan={7}>
                      <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl overflow-hidden">
                        <thead className={`${innerTable} text-white uppercase tracking-wide`}>
                          <tr>
                              <th className='text-left px-3 py-3'>#</th>
                              <th className='text-left px-3 py-3'>Тип</th>
                              <th colSpan={2} className='text-left px-3 py-3'>Документ</th>
                              <th className='text-left px-3 py-3'>Сумма</th>
                              {/* <th className='text-left px-3 py-3'>Комметарий</th> */}
                              <th className="px-3 py-3 text-left">Дебит</th>
                              <th className="px-3 py-3 text-left">Кредит</th>
                              <th className='px-3 py-3 flex gap-2 justify-end items-center'>
                                Опции 
                                <FaPlusCircle 
                                  className='cursor-pointer text-2xl' 
                                  onClick={() => setIsInputInRow(prev => !prev)} 
                                />
                              </th>
                          </tr>
                        </thead>
                        <tbody>
                          


                          <tr className={`${isInputInRow ? "table-row" : "hidden"}  border-b border-t`}>
                            <td></td>
                            <td>
                              <select 
                                value={inForm.move_type} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                name="move_type" 
                              >
                                <option value="in">&#8601; Счет-фактура  </option>
                                <option value="out">&#8599; Платежное поручение </option>
                              </select>
                            </td>
                            <td>
                              <input 
                                value={inForm.date} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="date" 
                                name='date'  
                                min={dogDate}
                              />
                            </td>
                            <td>
                              <input 
                                value={inForm.doc_num} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="text" 
                                name='doc_num' 
                                placeholder='Номер документa'
                              />
                            </td>
                            <td>
                              <input 
                                value={inForm.amount} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="number" 
                                name='amount' 
                                placeholder='0.00 сум' 
                              />
                            </td>
                            {/* <td>
                              <input 
                                value={inForm.comment} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="text" 
                                name='comment' 
                                placeholder='...' 
                              />
                            </td> */}
                            <td className='text-left px-3 py-3'></td>
                            <td className='text-left px-3 py-3'></td>
                            <td className='cursor-pointer flex items-center justify-end gap-2 text-2xl px-3 py-3'>
                              <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600'>
                                <FaPlusCircle onClick={() => addInRow(item.id)} />
                              </button>
                              <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-600'>
                                <MdClose onClick={() => setIsInputInRow(false)} />
                              </button>
                            </td>
                          </tr>




                          {inRows.map((doc, index) => (
                            
                            <React.Fragment key={doc.id}>
                              {/* Ko'rinadigan hujjat qatori */}
                              <tr className={`${isEditInRow && editInRowId === doc.id ? "hidden" : "table-row"} border-b border-t hover:bg-[#cbe5f6]`}>
                                <td className='text-left px-3 py-3'>{index + 1}</td>
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "in" ? <span>&#8601; Счет-фактура</span> : <span>&#8599; Платежное поручение</span>}
                                </td>
                                <td colSpan={2} className='text-left px-3 py-3'>
                                  {doc.doc_num==null ? formatDate(doc.date) : `№${doc.doc_num} от ${formatDate(doc.date)}`}
                                </td>
                                <td className='text-left px-3 py-3'>{formatAmount(doc.amount)}</td>
                                {/* <td className='text-left px-3 py-3'>{doc.comment}</td> */}
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "out" ? formatAmount(Number(doc.amount)) : 0}
                                </td>
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "in" ? formatAmount(Number(doc.amount)) : 0}
                                </td>
                                <td className='flex items-center justify-end gap-2 px-3 py-3'>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-yellow-600'>
                                    <MdEdit onClick={() => editInRow(doc)} />
                                  </button>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                                    <FaTrashAlt onClick={() => deleteDocument(doc.id)} />
                                  </button>
                                </td>
                              </tr>




                              <tr className={`${isEditInRow && editInRowId === doc.id ? "table-row" : "hidden"}`}>
                                <td className='text-left px-3 py-3'>
                                  <span className='text-blue-700 font-semibold text-[16px]'>
                                    <MdEdit />
                                  </span>
                                </td>
                                <td>
                                  {editInForm.move_type == "in" ? "Счет-фактура" : "Платежное поручение"}
                                </td>
                                <td>
                                  <input 
                                    value={editInForm.date} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="date" 
                                    name='date'  
                                  />
                                </td>
                                <td>
                                  <input 
                                    value={editInForm.doc_num} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="text" 
                                    name='doc_num' 
                                    placeholder='Номер договора'
                                  />
                                </td>
                                <td>
                                  <input 
                                    value={editInForm.amount} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="number" 
                                    name='amount' 
                                    placeholder='0.00 сум' 
                                  />
                                </td>
                                {/* <td>
                                  <input 
                                    value={editInForm.comment} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="text" 
                                    name='comment' 
                                    placeholder='...' 
                                  />
                                </td> */}
                                <td className='text-left px-3 py-3'></td>
                                <td className='text-left px-3 py-3'></td>
                                <td className='text-left cursor-pointer flex items-center gap-1.5 text-2xl px-3 py-3'>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600'>
                                    <FaPlusCircle onClick={handleInSave} />
                                  </button>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                                    <MdClose onClick={() => setIsEditInRow(false)} />
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}



                          <tr className='border-t-2 font-semibold'>
                            <td colSpan={5} className='text-left px-3 py-3'></td>
                            <td className='text-left px-3 py-3'>
                              Общий дебит: <br />
                              {formatAmount(Number(item.total_debit))}
                            </td>
                            <td className='text-left px-3 py-3'>
                              Общий кредит: <br />
                              {formatAmount(Number(item.total_credit))}
                            </td>
                            <td className='text-right px-3 py-3'></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              ))
              ) : (
                <tr>
                  <td colSpan={7} className='text-center py-3 text-gray-500'>{!isLoadingCP ? "У вас нет зарегистрированных договоров" : "Загрузка..."}</td>
                </tr>
              )}
                </>
              ) : (

                <>
                {isLoadingCP ? (
                                <tr>
                                  <td colSpan={8} className=" py-3 text-center text-gray-500">
                                   Загрузка...
                                  </td>
                                </tr>
                              ) : rows.length > 0 ? (
                                rows.map((row, idx) => (
                                  <tr
                                    key={row.id}
                                    className={` hover:bg-[#cbe5f6] transition`}
                                  >
                                    <td className="px-3 py-2">{idx + 1}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        {row.balance > 0 ? <FaCircle className='text-emerald-500 text-[12px]' /> : ""}
                                        {row.balance < 0 ? <FaCircle className='text-red-500 text-[12px]' /> : ""}
                                        {row.balance == 0 ? <FaCheckCircle className='text-blue-500 text-[12px]' /> : ""}
                                        {/* <FaCircle className="text-orange-400" /> */}
                                        {row.name}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2">
                                      {row.tin ? row.tin : "Физ. лицо"}
                                    </td>
                                    <td className="px-3 py-2">
                                      {row.phone ? row.phone : "+998 00 000 00 00"}
                                    </td>
                                    <td className="px-3 py-2">
                                      {row.description ? row.description : "Поставщик"}
                                    </td>
                                    <td className="px-3 py-2 text-green-600">
                                      {row.balance && row.balance > 0
                                        ? formatAmount(Number(row.balance))
                                        : "0"}
                                    </td>
                                    <td className="px-3 py-2 text-red-600">
                                      {row.balance && row.balance < 0
                                        ? formatAmount(Number(Math.abs(row.balance)))
                                        : "0"}
                                    </td>
                                    <td className="px-3 py-2">
                                                                            <div className="flex justify-end gap-1 items-center">
                                                                                      <button 
                                                                                        className="p-2 text-lg text-green-500 hover:bg-green-200 transition rounded-full disabled:opacity-50"
                                                                                        title="Saqlash"
                                                                                      ><MdEdit className="text-yellow-500" />
                                                                                      </button>
                                                                                      <button 
                                                                                        className="p-2 text-lg text-red-500 hover:bg-red-200 transition rounded-full"
                                                                                        title="Bekor qilish"
                                                                                      >
                                                                                        <FaTrashAlt className="text-red-700" />
                                                                                      </button>
                                                                                    </div>
                                                                          </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={8} className="py-3 text-center text-gray-500">
                                    У вас нет зарегистрированных поставщиков.
                                  </td>
                                </tr>
                              )}
                </>
              )}
            </Tbody>
          </Table>
        </TableWrap>
      </div>
    </CustomLayout>
  )
}

export default Purchase
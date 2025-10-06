'use client'
import React, { useEffect, useState } from 'react'
import CustomLayout from '../customLayout'
import { MdCheck, MdClose, MdEdit } from 'react-icons/md'
import { FaPlus, FaPlusCircle, FaTrash } from 'react-icons/fa'
import type { components, paths } from "../../../types";
import api from '../auth'

interface Mijoz {
  id: number;
  name: string;
  tin: string;
}

interface salesForm {
  id: number;
  customer: string;
  stir: string;
  sana: string;
  raqam: string;
  izoh: string;
  total: number;
}

interface deals {
  id: number;
  name: string;
  tin: string;
  doc_num: string;
  comment: string;
  date: string;
  total?: number;
  agent_id?: number;
  has_contract?: boolean; // Yangi field: shartnoma bor-yo'qligini bildiradi
}

interface Document {
  id: number;
  contract_id: number;
  type: "invoice" | "payment";
  move_type: "in" | "out";
  date: string;
  doc_num: string;
  amount: number;
  comment: string;
}

const Sales = () => {
  const [rows, setRows] = useState<deals[]>([])
  const [inRows, setInRows] = useState<Document[]>([])
  const [mijozlar, setMijozlar] = useState<Mijoz[]>([])
  
  const [isInputRow, setIsInputRow] = useState(false)
  const [isInputInRow, setIsInputInRow] = useState(false)
  const [isEditRow, setIsEditRow] = useState(false)
  const [isEditInRow, setIsEditInRow] = useState(false)
  const [isEditRowStatus, setIsEditRowStatus] = useState(false)
  const [valCustomer, setValCustomer] = useState(false)
  const [checkCustomer, setCheckCustomer] = useState("")
  const [editRowId, setEditRowId] = useState(0)
  const [editInRowId, setEditInRowId] = useState(0)
  const [innerTableId, setInnerTableId] = useState<null | number>(null)
  
  const [form, setForm] = useState<salesForm>({
    id: 0,
    customer: "",
    stir: "", 
    sana: "",
    raqam: "",
    izoh: "",
    total: 0
  })

  
  const [inForm, setInForm] = useState({
    id: 0,
    move_type: "out" as "in" | "out",
    date: "",
    doc_num: "",
    amount: "",
    comment: ""
  })

  const [editForm, setEditForm] = useState({
    id: 0,
    customer: "",
    stir: "",
    sana: "",
    raqam: "",
    izoh: ""
  })

  
  const [editInForm, setEditInForm] = useState({
    id: 0,
    move_type: "out" as "in" | "out",
    date: "",
    doc_num: "",
    amount: "",
    comment: ""
  })

  
  useEffect(() => {
    const getData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          api.get("https://fast-simple-crm.onrender.com/api/v1/counterparties?type=customer"),
          api.get("https://fast-simple-crm.onrender.com/api/v1/contracts/with-total?type=sales")
        ]);

        setMijozlar(res1.data);
        
        
        const merged = res1.data.flatMap((customer: Mijoz) => {
          const contracts = res2.data.filter((contract: any) => contract.agent_id === customer.id);
          if (contracts.length > 0) {
            return contracts.map((contract: any) => ({
              ...customer,
              ...contract,
              has_contract: true // Shartnoma borligini bildiradi
            }));
          }
          
          return [];
        });

        setRows(merged);
      } catch (error) {
        console.log("Ma'lumotlarni yuklashda xatolik:", error);
      }
    };

    getData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addRow = async () => {
    try {
      if (!form.customer || !form.sana || !form.raqam) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      const customerName = form.customer || "";
      const existingCustomer = mijozlar.find(
        c => c.name?.toLowerCase() === customerName.toLowerCase()
      );

      let response;

      if (existingCustomer) {
        // Mijoz bazada mavjud
        response = await api.post(
          "https://fast-simple-crm.onrender.com/api/v1/contracts",
          {
            agent_id: existingCustomer.id,
            type: "sales",
            date: form.sana,
            doc_num: form.raqam,
            comment: form.izoh
          }
        );
      } else {
        // Yangi mijoz
        response = await api.post(
          "https://fast-simple-crm.onrender.com/api/v1/contracts/with-counterparty",
          {
            counterparty_data: {
              type: "customer",
              name: form.customer,
              tin: form.stir || null
            },
            contract_data: {
              type: "sales",
              date: form.sana,
              doc_num: form.raqam,
              comment: form.izoh
            }
          }
        );
        setMijozlar((prev) => [
  ...prev,
  {
    id: response.data.id,
    name: form.customer,
    tin: form.stir || "",
  },
]);
      }

      // Yangi qatorni qo'shish
      const newRow: deals = {
        id: response.data.id,
        name: form.customer,
        tin: form.stir || "J.SH.",
        doc_num: form.raqam,
        comment: form.izoh,
        date: form.sana,
        total: 0,
        has_contract: true
      };

      setRows(prev => [...prev, newRow]);
      
      // Formani tozalash
      setForm({
        id: 0,
        customer: "",
        stir: "",
        sana: "",
        raqam: "",
        izoh: "",
        total: 0
      });
      
      setIsInputRow(false);
      
    } catch (error) {
      console.log(error);
      alert("Xatolik yuz berdi! Ma'lumotlarni qayta tekshiring.");
      setMijozlar((prev) => [
  ...prev,
  {
    id: 1987411,
    name: form.customer,
    tin: form.stir || "",
  },
]);
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

  const editRow = (item: deals) => {
    setEditForm({
      id: item.id,
      customer: item.name,
      stir: item.tin,
      sana: item.date,
      raqam: item.doc_num,
      izoh: item.comment || ""
    });
    setEditRowId(item.id);
    setIsEditRow(true);
    setIsEditRowStatus(false);
  };

  const handleSave = async () => {
    try {
      await api.patch(
        `https://fast-simple-crm.onrender.com/api/v1/contracts/${editForm.id}`,
        {
          date: editForm.sana,
          doc_num: editForm.raqam,
          comment: editForm.izoh
        }
      );

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
      doc_num: item.doc_num,
      amount: item.amount.toString(),
      comment: item.comment
    });
    setEditInRowId(item.id);
    setIsEditInRow(true);
  };

  const handleInSave = async () => {
    try {
      if (!editInForm.date || !editInForm.doc_num || !editInForm.amount) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      // YANGILANDI: move_type asosida type avtomatik hisoblanadi
      const type = editInForm.move_type === "out" ? "invoice" : "payment";

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
    try {
      if (!inForm.date || !inForm.amount) {
        alert("Iltimos, majburiy maydonlarni to'ldiring!");
        return;
      }

      // YANGILANDI: move_type asosida type avtomatik hisoblanadi
      const type = inForm.move_type === "out" ? "invoice" : "payment";

      const res = await api.post("https://fast-simple-crm.onrender.com/api/v1/documents", 
        {
          contract_id: id,
          type: type,
          move_type: inForm.move_type,
          date: inForm.date,
          doc_num: inForm.doc_num,
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
        doc_num: inForm.doc_num,
        amount: parseFloat(inForm.amount),
        comment: inForm.comment || "---"
      };

      setInRows(prev => [...prev, newDocument]);

      // Formani tozalash
      setInForm({
        id: 0,
        move_type: "out",
        date: "",
        doc_num: "",
        amount: "",
        comment: ""
      });

      setIsInputInRow(false);

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

  const [searchResults, setSearchResults] = useState<Mijoz[]>([]);
  
  const validationCustomer = (mijoz: string) => {
    const result = mijozlar.filter(c =>
      c.name.toLowerCase().includes(mijoz.toLowerCase())
    );

    const found = mijozlar.find(
      c => c.name.toLowerCase() === mijoz.toLowerCase()
    );

    setSearchResults(result);

    if (found) {
      setCheckCustomer(found.tin);
      setValCustomer(false);
      setForm(prev => ({
        ...prev,
        customer: found.name,
        stir: found.tin
      }));
    } else {
      setCheckCustomer("");
      setValCustomer(true);
      setForm(prev => ({
        ...prev,
        customer: mijoz,
        stir: ""
      }));
    }
  };

  // YANGILANDI: Shartnoma o'chirish funksiyasi
  const deleteCustomerDeal = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu shartnomani o'chirmoqchimisiz?")) {
      return;
    }

    try {
      await api.delete(`https://fast-simple-crm.onrender.com/api/v1/contracts/${id}`);
      
      // YANGI: Faqat shartnoma o'chiriladi, mijoz emas
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

  // Debit va kredit summalarini hisoblash - SOTUvLAR UCHUN
  const calculateTotals = () => {
    const totalDebit = inRows
      .filter(item => item.move_type === "out") // Sotuvlar uchun "out" - debit (mahsulot chiqishi)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalKredit = inRows
      .filter(item => item.move_type === "in") // Sotuvlar uchun "in" - kredit (to'lov)
      .reduce((sum, item) => sum + item.amount, 0);
    
    return { totalDebit, totalKredit };
  };

  const { totalDebit, totalKredit } = calculateTotals();

  return (
    <CustomLayout>
      <div className='w-full p-6 max-h-screen overflow-y-auto'>
        <div className="title mb-4 text-2xl font-semibold">Sotuvlar</div>
        <div className="overflow-x-auto">
          <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl">
            <thead className={`bg-teal-900 text-white uppercase tracking-wide`}>
              <tr>
                <th className='text-left px-3 py-3'>T/R</th>
                <th className='text-left px-3 py-3'>Buyurtmachi</th>
                <th className='text-left px-3 py-3'>Sana</th>
                <th className='text-left px-3 py-3'>Shartnoma raqami</th>
                <th className='text-left px-3 py-3'>Izoh</th>
                <th className='text-left px-3 py-3'>Debit</th>
                <th className='text-left px-3 py-3'>Kredit</th>
                <th className='px-3 py-3 flex gap-2 justify-end items-center'>
                  Instr 
                  <FaPlusCircle 
                    className='cursor-pointer text-2xl' 
                    onClick={() => setIsInputRow(prev => !prev)} 
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Yangi qator qo'shish formasi */}
              <tr className={`${isInputRow ? "table-row" : "hidden"}`}>
                <td className='text-left px-3 py-3'>
                  <span className={`${valCustomer ? "inline-block" : "hidden"} text-blue-700 font-semibold text-[10px]`}>
                    Yangi
                  </span>
                </td>
                <td className='text-left px-3 py-3'>
                  <input 
                    className="border rounded-sm text-left my-1.5 px-3 py-1.5 bg-amber-50 w-full"
                    list="cst" 
                    placeholder="Buyurtmachi"
                    name="customer"
                    onChange={(e) => {
                      validationCustomer(e.target.value);
                      handleChange(e);
                    }}
                    value={form.customer}
                  />
                  <datalist className='z-20' id="cst">
                    {mijozlar.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </datalist>
                  <br />
                  <input
                    disabled={!valCustomer}
                    value={form.stir}
                    onChange={handleChange}
                    className={`${!valCustomer ? "bg-gray-400" : "bg-amber-50"} border rounded-sm text-left px-3 py-1.5 w-full`} 
                    name="stir" 
                    placeholder='STIR'  
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
                    placeholder='hujjat raqami' 
                  />
                </td>
                <td className='py-1.5'>
                  <input 
                    value={form.izoh} 
                    onChange={handleChange} 
                    className='border rounded-sm text-left px-3 py-1.5 bg-amber-50 w-full' 
                    type="text" 
                    name='izoh' 
                    placeholder='izoh' 
                  />
                </td>
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

              {/* Asosiy qatorlar - Faqat shartnomasi bor mijozlar ko'rsatiladi */}
              {rows.length > 0 ? (
                rows.map((item, i) => (
                <React.Fragment key={item.id}>
                  {/* Ko'rinadigan qator */}
                  <tr className={`${isEditRow && editRowId === item.id ? "hidden" : "table-row"} border-b border-t hover:bg-emerald-100`}>
                    <td className='text-left px-3 py-2 relative overflow-hidden'>
                      {i + 1}
                      <div className={`${isEditRowStatus && editRowId === item.id ? "block" : "hidden"} h-10 w-2 bg-yellow-500 absolute -top-2 left-2 rotate-45`}></div>
                    </td>
                    <td className='text-left pl-6 pr-3 py-2'>
                      <b>{item.name}</b> <br />
                      <small>{item.tin ? item.tin : "J.SH."}</small>
                    </td>
                    <td className='text-left px-3 py-2'>{item.date}</td>
                    <td className='text-left px-3 py-2'>{item.doc_num}</td>
                    <td className='text-left px-3 py-2'>{item.comment}</td>
                    <td className='text-left px-3 py-2'>
                      {item.total && item.total > 0 ? item.total : 0}
                    </td>
                    <td className='text-left px-3 py-2'>
                      {item.total && item.total < 0 ? Math.abs(item.total) : 0}
                    </td>
                    <td className='flex items-center justify-end gap-2 px-3 py-2'>
                      <button className='cursor-pointer flex items-center justify-center text-xl w-8 h-8 font-semibold text-teal-700'>
                        {innerTableId === item.id ? (
                          <MdClose onClick={() => toggleInnerTable(item.id)} />
                        ) : (
                          <FaPlus onClick={() => toggleInnerTable(item.id)} />
                        )}
                      </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-yellow-600'>
                        <MdEdit onClick={() => editRow(item)} />
                      </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                        <FaTrash onClick={() => deleteCustomerDeal(item.id)} />
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
                      <b>{editForm.customer}</b> <br />
                      <small>{editForm.stir ? editForm.stir : "J.SH."}</small>
                    </td>
                    <td className='p-1.5'>
                      <input 
                        value={editForm.sana} 
                        onChange={handleEditChange} 
                        className='rounded-sm text-left px-3 py-1.5 w-full bg-[aqua]' 
                        type="date" 
                        name='sana' 
                      />
                    </td>
                    <td className='p-1.5'>
                      <input 
                        value={editForm.raqam} 
                        onChange={handleEditChange} 
                        className='rounded-sm text-left px-3 py-1.5 w-full bg-[aqua]' 
                        type="text" 
                        name='raqam' 
                        placeholder='hujjat raqami' 
                      />
                    </td>
                    <td className='p-1.5'>
                      <input 
                        value={editForm.izoh} 
                        onChange={handleEditChange} 
                        className='rounded-sm text-left px-3 py-1.5 w-full bg-[aqua]' 
                        type="text" 
                        name='izoh' 
                        placeholder='izoh' 
                      />
                    </td>
                    <td className='text-left px-3 py-3'></td>
                    <td className='text-left px-3 py-3'></td>
                    <td className='text-right cursor-pointer flex items-center justify-end gap-1.5 text-2xl px-3 py-3'>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-green-600'>
                        <MdCheck onClick={handleSave} />
                      </button>
                      <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                        <MdClose onClick={() => setIsEditRow(false)} />
                      </button>
                    </td>
                  </tr>

                  {/* Ichki jadval */}
                  <tr className={`${item.id === innerTableId ? "table-row" : "hidden"}`}>
                    <td className='px-2 py-6 bg-[#f0ffff]' colSpan={8}>
                      <table className="border-collapse border border-gray-200 w-full text-sm shadow-md rounded-xl overflow-hidden">
                        <thead className={`bg-[#006700] text-white uppercase tracking-wide`}>
                          <tr>
                            <th className='text-left px-3 py-3'>T/R</th>
                            <th className='text-left px-3 py-3'>Turi</th>
                            <th colSpan={2} className='text-left px-3 py-3'>Hujjat</th>
                            <th className='text-left px-3 py-3'>Summa</th>
                            <th className='text-left px-3 py-3'>Izoh</th>
                            <th className='text-left px-3 py-3'>Debit</th>
                            <th className='text-left px-3 py-3'>Kredit</th>
                            <th className='px-3 py-3 flex gap-2 justify-end items-center'>
                              Instr 
                              <FaPlusCircle 
                                className='cursor-pointer text-2xl' 
                                onClick={() => setIsInputInRow(prev => !prev)} 
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Yangi hujjat qo'shish formasi - YANGILANDI */}
                          <tr className={`${isInputInRow ? "table-row" : "hidden"} border-b border-t`}>
                            <td></td>
                            <td>
                              <select 
                                value={inForm.move_type} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                name="move_type" 
                              >
                                <option value="out">Счет-фактура (чиким) - Mahsulot</option>
                                <option value="in">Платежное поручение (кирим) - To'lov</option>
                              </select>
                            </td>
                            <td>
                              <input 
                                value={inForm.date} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="date" 
                                name='date'  
                              />
                            </td>
                            <td>
                              <input 
                                value={inForm.doc_num} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="text" 
                                name='doc_num' 
                                placeholder='Hujjat raqami'
                              />
                            </td>
                            <td>
                              <input 
                                value={inForm.amount} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="number" 
                                name='amount' 
                                placeholder='0.00 uzs' 
                              />
                            </td>
                            <td>
                              <input 
                                value={inForm.comment} 
                                onChange={handleInChange} 
                                className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                type="text" 
                                name='comment' 
                                placeholder='izoh' 
                              />
                            </td>
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

                          {/* Hujjatlar ro'yxati - YANGILANDI */}
                          {inRows.map((doc, index) => (
                            <React.Fragment key={doc.id}>
                              {/* Ko'rinadigan hujjat qatori */}
                              <tr className={`${isEditInRow && editInRowId === doc.id ? "hidden" : "table-row"} border-b border-t hover:bg-emerald-100`}>
                                <td className='text-left px-3 py-3'>{index + 1}</td>
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "out" ? "Счет-фактура" : "Платежное поручение"}
                                </td>
                                <td colSpan={2} className='text-left px-3 py-3'>
                                  № {doc.doc_num} от {doc.date}
                                </td>
                                <td className='text-left px-3 py-3'>{doc.amount.toLocaleString()}</td>
                                <td className='text-left px-3 py-3'>{doc.comment}</td>
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "out" ? doc.amount.toLocaleString() : 0}
                                </td>
                                <td className='text-left px-3 py-3'>
                                  {doc.move_type === "in" ? doc.amount.toLocaleString() : 0}
                                </td>
                                <td className='flex items-center justify-end gap-2 px-3 py-3'>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-yellow-600'>
                                    <MdEdit onClick={() => editInRow(doc)} />
                                  </button>
                                  <button className='cursor-pointer flex items-center justify-center w-8 h-8 text-xl text-red-500'>
                                    <FaTrash onClick={() => deleteDocument(doc.id)} />
                                  </button>
                                </td>
                              </tr>

                              {/* Hujjatni tahrirlash formasi - YANGILANDI */}
                              <tr className={`${isEditInRow && editInRowId === doc.id ? "table-row" : "hidden"}`}>
                                <td className='text-left px-3 py-3'>
                                  <span className='text-blue-700 font-semibold text-[16px]'>
                                    <MdEdit />
                                  </span>
                                </td>
                                <td>
                                  <select 
                                    value={editInForm.move_type} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    name="move_type" 
                                  >
                                    <option value="out">Счет-фактура (чиким) - Mahsulot</option>
                                    <option value="in">Платежное поручение (кирим) - To'lov</option>
                                  </select>
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
                                    placeholder='Hujjat raqami'
                                  />
                                </td>
                                <td>
                                  <input 
                                    value={editInForm.amount} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="number" 
                                    name='amount' 
                                    placeholder='0.00 uzs' 
                                  />
                                </td>
                                <td>
                                  <input 
                                    value={editInForm.comment} 
                                    onChange={handleInEditChange} 
                                    className="border rounded-sm text-left px-3 py-1.5 w-full" 
                                    type="text" 
                                    name='comment' 
                                    placeholder='izoh' 
                                  />
                                </td>
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

                          {/* Jami qator */}
                          <tr className='border-t-2 font-semibold'>
                            <td colSpan={6} className='text-left px-3 py-3'></td>
                            <td className='text-left px-3 py-3'>
                              Jami D: <br />
                              {item.total_debit?.toLocaleString()}
                            </td>
                            <td className='text-left px-3 py-3'>
                              Jami K: <br />
                              {item.total_credit?.toLocaleString()}
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
                  <td colSpan={8} className='text-center px-3 py-3'>Bitimlar mavjud emas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CustomLayout>
  )
}

export default Sales
'use client';

import React, { useEffect, useState } from 'react';
import CustomLayout from '../customLayout';
import { FaCheckCircle, FaEdit, FaPlusCircle, FaSave, FaTimes } from 'react-icons/fa';
import { MdAddToQueue, MdClose, MdEdit } from 'react-icons/md';
import { FaCircle } from 'react-icons/fa6';
import { useM } from '../context';
import api from '../auth';
import { useCounterparties } from '../api/useRequest';

/** ====== Types ====== */
type AgentType = 'customer' | 'supplier';

interface Counterparty {
  id: number;
  user_id?: number | null;
  agent_type: AgentType;
  name: string;
  tin: string;
  phone: string;
  description: string;
  balance: number;
}

interface EditFormData {
  name: string;
  tin: string;
  phone: string;
  description: string;
}

/** ====== Component ====== */
const Page: React.FC = () => {
  const [rows, setRows] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: '',
    tin: '',
    phone: '',
    description: ''
  });
  const [saveLoading, setSaveLoading] = useState<number | null>(null);
  
  const { bg2, txt, mainBg } = useM();

  const {data, isLoading, error} = useCounterparties("supplier");

  useEffect(() => {
    if(isLoading){
      console.log("Yuklanmoqda...");
    }else if(error){
      console.log(error);
    }else if(data){
      console.log(data);
      setRows(data)
    }
  }, [data, isLoading, error]);

  /** ---- Delete Handler ---- */
  const deleteCounterParty = async (id: number) => {
    if (window.confirm("Haqiqatan ham ushbu mijozni o'chirmoqchimisiz?")) {
      try {
        await api.delete(
          `https://fast-simple-crm.onrender.com/api/v1/counterparties/${id}`
        );
        setRows(prev => prev.filter(r => r.id !== id));
        alert("Mijoz muvaffaqiyatli o'chirildi");
      } catch (error) {
        console.error(error);
        alert("Mijozni o'chirishda xatolik yuz berdi");
      }
    }
  };

  /** ---- Edit Handlers ---- */
  const startEditing = (row: Counterparty) => {
    setEditingId(row.id);
    setEditForm({
      name: row.name,
      tin: row.tin,
      phone: row.phone,
      description: row.description
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      tin: '',
      phone: '',
      description: ''
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id: number) => {
    if (!editForm.name.trim()) {
      alert("Korxona nomi majburiy!");
      return;
    }

    try {
      setSaveLoading(id);
      const res = await api.patch<Counterparty>(
        `https://fast-simple-crm.onrender.com/api/v1/counterparties/${id}`,
        editForm
      );
      
      setRows(prev => prev.map(row => 
        row.id === id ? { ...row, ...res.data } : row
      ));
      
      setEditingId(null);
      alert("Mijoz ma'lumotlari muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error(error);
      alert("Yangilashda xatolik. Ma'lumotlarni tekshiring.");
    } finally {
      setSaveLoading(null);
    }
  };

  /** ---- View Details Handler ---- */
  const handleViewDetails = (row: Counterparty) => {
    const details = `
Korxona nomi: ${row.name}
STIR: ${row.tin || "Mavjud emas"}
Telefon: ${row.phone}
Tavsif: ${row.description || "Mavjud emas"}
Status: ${row.status?.status || 0}
    `;
    alert(details);
  };

  /** ---- Render Functions ---- */
  const renderEditableField = (row: Counterparty, fieldName: keyof EditFormData, label: string) => {
    if (editingId === row.id) {
      return (
        <input
          type="text"
          name={fieldName}
          value={editForm[fieldName]}
          onChange={handleEditChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder={label}
        />
      );
    }
    return <span>{row[fieldName] || "-"}</span>;
  };

  const renderActionButtons = (row: Counterparty) => {
    if (editingId === row.id) {
      return (
        <div className="flex justify-center gap-2 items-center">
          <button 
            onClick={() => saveEdit(row.id)}
            disabled={saveLoading === row.id}
            className="p-2 bg-green-200 hover:bg-green-400 transition rounded-full disabled:opacity-50"
            title="Saqlash"
          >
            {saveLoading === row.id ? "..." : <FaSave className="text-green-700" />}
          </button>
          <button 
            onClick={cancelEditing}
            className="p-2 bg-red-200 hover:bg-red-400 transition rounded-full"
            title="Bekor qilish"
          >
            <FaTimes className="text-red-700" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-center gap-2 items-center">
        {/* <button 
          onClick={() => handleViewDetails(row)}
          className="p-2 bg-stone-200 hover:bg-emerald-400 transition rounded-full" 
          title="Batafsil ma'lumot"
        >
          <MdAddToQueue />
        </button> */}
        <button 
          onClick={() => startEditing(row)}
          className="p-2 text-yellow-500 text-lg hover:bg-yellow-200 transition rounded-full" 
          title="Tahrirlash"
        >
          <MdEdit />
        </button>
        <button
          onClick={() => deleteCounterParty(row.id)}
          className="p-2 text-lg text-red-500 hover:bg-red-200 transition rounded-full"
          title="O'chirish"
        >
          <MdClose />
        </button>
      </div>
    );
  };

  return (
    <CustomLayout>
      <div className="w-full p-6 max-h-screen overflow-y-auto">
        <div className="title mb-4 text-2xl font-semibold">Список поставщиков</div>
        <div className="overflow-x-auto border-[1px] border-gray-100 border-t-0 rounded-2xl">
          <table className="border-collapse border  w-full text-sm shadow-md rounded-xl ">
            <thead className={`${bg2} ${txt} uppercase tracking-wide`}>
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Поставщик</th>
                <th className="px-3 py-3 text-left">ННН</th>
                <th className="px-3 py-3 text-left">Номер</th>
                <th className="px-3 py-3 text-left">Био</th>
                <th className="px-3 py-3 text-left">Дебит</th>
                <th className="px-3 py-3 text-left">Кредит</th>
                <th className="px-3 py-3 flex items-center justify-center gap-1.5">Опции <FaPlusCircle className='cursor-pointer text-2xl'/></th>
              </tr>
            </thead>

            <tbody className={`divide-y divide-gray-200 ${txt}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className=" py-3 text-center text-gray-500">
                   Загрузка...
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`${mainBg === "bg-gray-950" ? "text-white" : "text-black"
                      } hover:text-black hover:bg-emerald-50 transition ${editingId === row.id ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-500" />
                        <FaCircle className="text-orange-400" />
                        {renderEditableField(row, 'name', 'Korxona nomi')}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {renderEditableField(row, 'tin', 'STIR')}
                    </td>
                    <td className="px-3 py-2">
                      {renderEditableField(row, 'phone', 'Telefon raqami')}
                    </td>
                    <td className="px-3 py-2">
                      {renderEditableField(row, 'description', 'Qisqacha bio')}
                    </td>
                    <td className="px-3 py-2 text-green-600">
                      {row.balance && row.balance > 0
                        ? row.balance.toLocaleString("uz-UZ").replace(/,/g, " ")
                        : "0"}
                    </td>
                    <td className="px-3 py-2 text-red-600">
                      {row.balance && row.balance < 0
                        ? Math.abs(row.balance).toLocaleString("uz-UZ").replace(/,/g, " ")
                        : "0"}
                    </td>
                    <td className="px-3 py-2">
                      {renderActionButtons(row)}
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
            </tbody>
          </table>
        </div>

      </div>
    </CustomLayout>
  );
};

export default Page;
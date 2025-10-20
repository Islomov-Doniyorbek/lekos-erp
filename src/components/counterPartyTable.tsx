import React from 'react'






interface CounterParty {
  id: number;
  name: string;
  tin: string;
}

interface Form {
  id: number;
  supplier: string;
  stir: string;
  sana: string;
  raqam: string;
  izoh: string;
  total: number;
}

interface Deal {
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




const CounterPartyTable = () => {
  return (
    <div>
      
    </div>
  )
}

export default CounterPartyTable

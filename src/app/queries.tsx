'use client'
import { useState, useEffect } from "react";
import axios from "axios";

interface Customer {
  id: number;
  user_id: number;
  phone: string;
  name: string;
  about: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface Deal {
  id: number;
  customer_id: number;
  user_id: number;
  total_amount: number;
}

const useApi = () => {
  const [customersAll, setCustomers] = useState<Customer[]>([]);
  const [userAll, setUserAll] = useState<User[]>([]);
  const [dealAll, setDealAll] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     async function fetchData() {
    try {
      // localStorage dan tokenni olamiz
      const token = localStorage.getItem("token");
      // console.log("Token:", token);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const cust = await axios.get<Customer[]>(
        "https://fast-simple-crm.onrender.com/api/v1/customers",
        { headers }
      )
      setCustomers(cust.data)
      console.log("Customers:", cust.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data?.detail ?? err.message);
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log("Noma'lum xato");
      }
    }
  }

    fetchData();
  }, []);

  return { customersAll, userAll, dealAll, loading, error };
};

export default useApi;

import api from "../auth"


const END_POINT = "https://fast-simple-crm.onrender.com/api/v1/"

export const getCounterparties = async (type?: string) => {
  const url = type 
    ? `${END_POINT}counterparties/with-balance?type=${type}` 
    : `${END_POINT}counterparties/with-balance`

  const res = await api.get(url)
  console.log(res)
  const data = res?.data

  return data ?? []
}

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
export const getCounterparties2 = async (type?: string) => {
  const url = type 
    ? `${END_POINT}counterparties?type=${type}` 
    : `${END_POINT}counterparties`

  const res = await api.get(url)
  console.log(res)
  const data = res?.data

  return data ?? []
}
export const getContractWithTotal = async (type?: string) => {
  const url = type 
    ? `${END_POINT}contracts/with-total?type=${type}` 
    : `${END_POINT}contracts/with-total`

  const res = await api.get(url)
  console.log(res)
  const data = res?.data

  return data ?? []
}

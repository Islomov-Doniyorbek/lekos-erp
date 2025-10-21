import { useQuery } from '@tanstack/react-query'
import { getCounterparties, getCounterparties2, getContractWithTotal } from './queryControl'

export const useCounterparties = (type?: string) => {
  return useQuery({
    queryKey: ['counterparties', type], // <--- asosiy kalit
    queryFn: () => getCounterparties(type),
    staleTime: 1000 * 60 * 3, // 3 daqiqa cache
    refetchOnWindowFocus: false,
  })
}
export const useCounterparties2 = (type?: string) => {
  return useQuery({
    queryKey: ['counterparties2', type], // <--- asosiy kalit
    queryFn: () => getCounterparties2(type),
    staleTime: 1000 * 60 * 3, // 3 daqiqa cache
    refetchOnWindowFocus: false,
  })
}
export const useContracts = (type?: string) => {
  return useQuery({
    queryKey: ['contractsWithTotal', type], // <--- asosiy kalit
    queryFn: () => getContractWithTotal(type),
    staleTime: 1000 * 60 * 3, // 3 daqiqa cache
    refetchOnWindowFocus: false,
  })
}

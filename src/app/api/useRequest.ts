import { useQuery } from '@tanstack/react-query'
import { getCounterparties } from './queryControl'

export const useCounterparties = (type?: string) => {
  return useQuery({
    queryKey: ['counterparties', type], // <--- asosiy kalit
    queryFn: () => getCounterparties(type),
    staleTime: 1000 * 60 * 3, // 3 daqiqa cache
    refetchOnWindowFocus: false,
  })
}

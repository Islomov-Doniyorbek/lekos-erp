'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import MProvider from './context'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Har safar qayta yaratilmasligi uchun state ichida saqlaymiz
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <MProvider>
        {children}
      </MProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

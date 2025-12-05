'use client'

import dynamic from 'next/dynamic'

// Dynamically import the SmoothScroll component with SSR disabled
const SmoothScroll = dynamic(() => import('@/components/providers/smooth-scroll').then(mod => mod.SmoothScroll), {
  ssr: false,
})

// This wrapper component is a Client Component
export function DynamicSmoothScroll({ children }: { children: React.ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>
}

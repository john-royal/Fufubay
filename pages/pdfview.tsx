import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const InvoicePDF = dynamic(async () => await import('./pdf'), {
  ssr: false
})

const View = () => {
  const [, setClient] = useState(false)

  useEffect(() => {
    setClient(true)
  }, [])

  return (
    <InvoicePDF />
  )
}

export default View

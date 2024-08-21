'use client'

import { Button } from '@/components/ui/button'
import { Order } from '@prisma/client'
import { useEffect } from 'react'

const ForceDownload = ({
  order,
  downloadUrl,
}: {
  order: Order
  downloadUrl: string
}) => {
  useEffect(() => {
    const forceDownload = async () => {
      try {
        const response = await fetch(downloadUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${order.id}.mp3` // Assuming it's an MP3 file
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading file:', error)
      }
    }

    forceDownload()
  }, [downloadUrl, order.id])

  return (
    <Button
      className="pointer-events-none rounded-full bg-green-100 dark:bg-green-900"
      variant="outline"
    >
      ✅ Download starting
    </Button>
  )
}

export { ForceDownload }

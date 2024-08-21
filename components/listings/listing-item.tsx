'use client'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Listing, Order } from '@prisma/client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BuyListing } from '../buy-listing/buy-listing'
import { ConfirmOrder } from '../buy-listing/confirm-order'

type AudioFile = {
  id: string
  filePath: string
} | null

type MinimalUser = {
  id: string | undefined
}

interface ListingItemProps {
  listing: Listing & { audioFile: AudioFile }
  user: MinimalUser | null | undefined
  order: Order | null
}

export function ListingItem({ listing, user, order }: ListingItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [aacUrl, setAacUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldPlay, setShouldPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const fetchAacUrl = useCallback(async () => {
    if (!listing.audioFile?.filePath) {
      setError('No audio file available')
      return null
    }

    setIsLoading(true)
    setError(null)
    const baseUrl =
      process.env.NEXT_PUBLIC_AUDIO_BASE_URL || 'https://upcdn.io/FW25b56/audio'
    const aacRequestUrl = `${baseUrl}${listing.audioFile.filePath}?f=aac`

    const startTime = Date.now()
    const timeout = 10000 // 10 seconds timeout

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(aacRequestUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.status === 'Succeeded') {
          const url = data.summary.result.artifactUrl
          setAacUrl(url)
          setIsLoading(false)
          return url
        }
        // If not succeeded, wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        // If there's an error, wait for 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // If we've reached here, it means we've timed out
    setIsLoading(false)
    const errorMessage = 'AAC conversion timed out after 10 seconds'
    setError(`Error fetching audio: ${errorMessage}`)
    toast({
      variant: 'destructive',
      title: 'Error',
      description: `Failed to load audio: ${errorMessage}`,
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    })
    return null
  }, [listing.audioFile, toast])

  const toggleAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      setShouldPlay(false)
    } else {
      setShouldPlay(true)
      if (!aacUrl) {
        await fetchAacUrl()
      }
    }
  }

  useEffect(() => {
    if (shouldPlay && aacUrl && audioRef.current) {
      audioRef.current.src = aacUrl
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred'
          setError(`Error playing audio: ${errorMessage}`)
          toast({
            variant: 'destructive',
            title: 'Playback Error',
            description: `Failed to play audio: ${errorMessage}`,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
        })
        .finally(() => setShouldPlay(false))
    }
  }, [shouldPlay, aacUrl, toast])

  useEffect(() => {
    const audio = audioRef.current

    return () => {
      // Cleanup: pause audio when component unmounts
      if (audio) {
        audio.pause()
      }
    }
  }, [])

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div
      className={cn(
        'group my-4 flex items-stretch overflow-hidden rounded-lg border transition-colors duration-300',
        isPlaying ? 'bg-green-200' : 'bg-white',
        error && 'bg-red-100'
      )}
    >
      <div className="flex flex-grow items-center overflow-hidden">
        <Button
          variant="ghost"
          className={cn(
            'h-full w-full items-start justify-start rounded-none p-4 text-left'
          )}
          data-testid="audio-player"
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={isLoading || !listing.audioFile || !listing.isActive}
        >
          <div className="w-full min-w-0">
            <h2 className="truncate text-lg font-semibold">{listing.title}</h2>
            <p className="truncate text-sm text-gray-600">
              {listing.description ||
                'Uploaded file: ' + listing.audioFile?.filePath}
            </p>
            {error && (
              <p className="mt-1 truncate text-xs text-red-500">{error}</p>
            )}
          </div>
        </Button>
      </div>
      {listing.audioFile && (
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          onError={() => setError('Audio playback error')}
          preload="metadata"
        />
      )}
      <div className="flex shrink-0 items-stretch">
        {!listing.isActive ? (
          <Button
            className="pointer-events-none h-full w-40 rounded-none p-4 text-base font-normal"
            variant="ghost"
            disabled
          >
            Not Available
          </Button>
        ) : user?.id && listing.userId === user.id ? (
          <Link href={`/?listing=${listing.id}&edit=true`} passHref>
            <Button
              className="h-full w-40 rounded-none p-4 text-base font-normal"
              variant="ghost"
            >
              Edit
            </Button>
          </Link>
        ) : listing.id === order?.listingId ? (
          <div className="w-40">
            <ConfirmOrder listing={listing} order={order} />
          </div>
        ) : (
          <div className="w-40">
            <BuyListing listing={listing} />
          </div>
        )}
      </div>
    </div>
  )
}

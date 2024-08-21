'use client'

import { Button } from '@/components/ui/button'
import type { UploadWidgetResult } from '@bytescale/upload-widget'
import { UploadDropzone } from '@bytescale/upload-widget-react'
import { useState, useTransition } from 'react'

const ENABLE_MULTIPLE_FILES = false

const BYTESCALE_OPTIONS = {
  multi: ENABLE_MULTIPLE_FILES,
  apiKey: process.env.NEXT_PUBLIC_BYTESCALE_API_KEY as string,
  maxFileCount: 10,
  showFinishButton: true,
  styles: {
    colors: {
      primary: '#377dff',
    },
  },
}

type ActionResult = {
  messages: string[]
  listingIds?: string[]
}

type UploadDropzoneWidgetProps = {
  onCompleteAction: (formData: FormData) => Promise<ActionResult>
}

export function UploadDropzoneWidget({
  onCompleteAction,
}: UploadDropzoneWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (files: UploadWidgetResult[]) => {
    setError(null)
    startTransition(async () => {
      try {
        const formData = new FormData()

        files.forEach((file, index) => {
          const metadata = {
            accountId: file.accountId,
            etag: file.etag,
            fileUrl: file.fileUrl,
            filePath: file.filePath,
            originalFileName: file.originalFile.originalFileName,
            size: file.originalFile.size,
            mime: file.originalFile.mime,
          }
          formData.append(`file-${index}`, JSON.stringify(metadata))
        })

        const actionResult = await onCompleteAction(formData)
        setResult(actionResult)
      } catch (err) {
        setError(
          'An error occurred while processing your upload. Please try again.'
        )
        console.error('Upload error:', err)
      }
    })
  }

  const resetUpload = () => {
    setResult(null)
    setError(null)
  }

  return (
    <div className="absolute right-8 top-8 z-10 rounded-lg border bg-background p-4 shadow-lg">
      {result ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            <div>{result.messages[0]}</div>
          </h3>
          {result.listingIds?.map((id, index) => (
            <pre key={id}>
              {index > 0 && ', '}
              {id}
            </pre>
          ))}
          <br />

          <Button onClick={resetUpload} className="w-full" variant="outline">
            Create Another Listing
          </Button>
        </div>
      ) : (
        <>
          {isPending ? (
            <div className="mt-4 h-[320px] w-[320px] text-center">
              <p>Uploading...</p>
              <div className="mt-2 h-2.5 w-full rounded-full bg-foreground/5">
                <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-blue-600"></div>
              </div>
            </div>
          ) : (
            <UploadDropzone
              options={BYTESCALE_OPTIONS}
              onComplete={handleComplete}
              height="320px"
              width="320px"
              className="rounded-lg border-2 border-dashed border-background/20"
            />
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </>
      )}
    </div>
  )
}

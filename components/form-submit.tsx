'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { Spinner } from './spinner'
import { Button } from './ui/button'

const FormSubmitButton = ({
  label,
  pendingLabel,
  variant,
  children,
  pending,
  className,
}: {
  label?: string | null | undefined | React.ReactNode
  children?: React.ReactNode
  pendingLabel?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
    | undefined
  [key: string]: any
}) => {
  const { pending: formStatusPending } = useFormStatus()

  return (
    <Button
      aria-label={
        pending ? 'Submitting...' : label ? label.toString() : 'Submit'
      }
      className={cn(`disabled:opacity-50 group-hover:opacity-100`, className)}
      disabled={pending}
      type="submit"
      variant={variant}
    >
      {formStatusPending ? (
        pendingLabel ? (
          pendingLabel
        ) : (
          <div className="h-4 w-4">
            <Spinner />
          </div>
        )
      ) : label ? (
        label
      ) : children ? (
        children
      ) : (
        'Submit'
      )}
    </Button>
  )
}

export default FormSubmitButton

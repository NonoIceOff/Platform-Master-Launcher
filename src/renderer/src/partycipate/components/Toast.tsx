import { useCallback, useEffect, useState, type ReactElement } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000
}: ToastProps): ReactElement {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={`pc-toast pc-toast-${type}`}>
      <span>{message}</span>
      <button type="button" onClick={onClose} className="pc-toast-close">
        ×
      </button>
    </div>
  )
}

export function useToast(): {
  showToast: (message: string, type?: ToastType) => void
  ToastComponent: ReactElement | null
} {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info'): void => {
    setToast({ message, type })
  }, [])

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null

  return { showToast, ToastComponent }
}

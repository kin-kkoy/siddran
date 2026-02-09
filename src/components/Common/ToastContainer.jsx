import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { toast } from '../../utils/toast'
import styles from './ToastContainer.module.css'

function ToastContainer() {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const unsubscribe = toast.subscribe((newToast) => {
            setToasts(prev => [...prev, newToast])
        })
        return unsubscribe
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Auto-dismiss after 3 seconds
    useEffect(() => {
        if (toasts.length === 0) return

        const latest = toasts[toasts.length - 1]
        const timer = setTimeout(() => removeToast(latest.id), 3000)
        return () => clearTimeout(timer)
    }, [toasts, removeToast])

    if (toasts.length === 0) return null

    return createPortal(
        <div className={styles.container}>
            {toasts.map(t => (
                <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
                    <span className={styles.message}>{t.message}</span>
                    <button onClick={() => removeToast(t.id)} className={styles.closeBtn}>
                        &times;
                    </button>
                </div>
            ))}
        </div>,
        document.body
    )
}

export default ToastContainer

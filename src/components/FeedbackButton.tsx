import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

type Status = 'idle' | 'sending' | 'success' | 'error'

export function FeedbackButton() {
  const { t } = useTranslation()
  const [open, setOpen]       = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName]       = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 80)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return

    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), name: name.trim() || undefined }),
      })
      if (!res.ok) throw new Error('server error')
      setStatus('success')
      setMessage('')
      setName('')
      setTimeout(() => { setOpen(false); setStatus('idle') }, 2200)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setOpen(true)}
        aria-label={t('feedback.button')}
        title={t('feedback.button')}
      >
        ✉
      </button>

      {open && (
        <div className="feedback-overlay" onClick={() => setOpen(false)}>
          <div className="feedback-panel" onClick={e => e.stopPropagation()}>

            <div className="feedback-header">
              <span className="feedback-title">{t('feedback.title')}</span>
              <button className="feedback-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {status === 'success' ? (
              <p className="feedback-success">{t('feedback.success')}</p>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <textarea
                  ref={textareaRef}
                  className="feedback-textarea"
                  placeholder={t('feedback.message_placeholder')}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  required
                />
                <input
                  className="feedback-input"
                  type="text"
                  placeholder={t('feedback.name_placeholder')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={80}
                />
                {status === 'error' && (
                  <p className="feedback-error">{t('feedback.error')}</p>
                )}
                <button
                  type="submit"
                  className="feedback-submit"
                  disabled={!message.trim() || status === 'sending'}
                >
                  {status === 'sending' ? t('feedback.sending') : t('feedback.submit')}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  )
}

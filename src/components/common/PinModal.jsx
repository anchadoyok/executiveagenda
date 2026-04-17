import { useState } from 'react'
import Modal from './Modal'

export function PinPromptModal({
  open,
  title,
  description,
  confirmLabel = 'Masuk',
  onClose,
  onSubmit,
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!pin.trim()) {
      setError('PIN wajib diisi.')
      return
    }

    if (pin.trim().length < 4) {
      setError('PIN minimal 4 digit/karakter.')
      return
    }

    const result = onSubmit(pin.trim())
    if (result?.ok) {
      setPin('')
      setError('')
      return
    }

    setError(result?.message ?? 'PIN tidak cocok. Coba lagi.')
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="button button--primary" form="pin-form" type="submit">
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted-text">{description}</p>
      <form id="pin-form" className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>PIN</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            minLength={4}
            placeholder="Masukkan PIN"
            type="password"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value)
              if (error) {
                setError('')
              }
            }}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </Modal>
  )
}

export function PinSetupModal({
  open,
  title,
  description,
  onClose,
  onSubmit,
  confirmLabel = 'Simpan PIN',
}) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (pin.length < 4) {
      setError('PIN minimal 4 digit/karakter.')
      return
    }

    if (pin !== confirmPin) {
      setError('PIN konfirmasi belum sama.')
      return
    }

    onSubmit(pin)
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          {onClose ? (
            <button className="button button--ghost" type="button" onClick={onClose}>
              Nanti
            </button>
          ) : null}
          <button
            className="button button--primary"
            form="pin-setup-form"
            type="submit"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted-text">{description}</p>
      <form id="pin-setup-form" className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>PIN baru</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            minLength={4}
            placeholder="Contoh: 1234"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Konfirmasi PIN</span>
          <input
            inputMode="numeric"
            maxLength={6}
            minLength={4}
            placeholder="Ulangi PIN"
            type="password"
            value={confirmPin}
            onChange={(event) => setConfirmPin(event.target.value)}
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </Modal>
  )
}

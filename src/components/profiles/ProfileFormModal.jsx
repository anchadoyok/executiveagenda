import { useState } from 'react'
import { PROFILE_ACCENTS, TIMEZONES } from '../../lib/constants'
import Modal from '../common/Modal'

function createProfileFormState(profile) {
  return {
    name: profile?.name ?? '',
    description: profile?.description ?? '',
    pin: profile?.pin ?? '',
    confirmPin: profile?.pin ?? '',
    accent: profile?.accent ?? PROFILE_ACCENTS[0],
    defaultTimezone: profile?.settings.defaultTimezone ?? 'Asia/Jakarta',
  }
}

export default function ProfileFormModal({ open, profile, onClose, onSave }) {
  const [form, setForm] = useState(createProfileFormState(profile))
  const [error, setError] = useState('')

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Nama jadwal wajib diisi.')
      return
    }

    if (form.pin.length < 4) {
      setError('PIN minimal 4 digit/karakter.')
      return
    }

    if (form.pin !== form.confirmPin) {
      setError('PIN dan konfirmasi belum sama.')
      return
    }

    onSave({
      ...profile,
      name: form.name.trim(),
      description: form.description.trim(),
      pin: form.pin,
      accent: form.accent,
      settings: {
        ...profile?.settings,
        defaultTimezone: form.defaultTimezone,
      },
    })
  }

  return (
    <Modal
      open={open}
      title={profile ? 'Ubah Profil Jadwal' : 'Tambah Profil Jadwal'}
      onClose={onClose}
      footer={
        <>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="button button--primary" form="profile-form" type="submit">
            {profile ? 'Simpan Profil' : 'Buat Profil'}
          </button>
        </>
      }
    >
      <form id="profile-form" className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nama jadwal</span>
          <input
            autoFocus
            placeholder="Contoh: Agenda Kepala Biro PKS"
            type="text"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Keterangan singkat</span>
          <textarea
            placeholder="Contoh: Jadwal Kabiro Perencanaan dan Kerja Sama"
            rows="3"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
          />
        </label>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>PIN profil</span>
            <input
              inputMode="numeric"
              maxLength={6}
              minLength={4}
              placeholder="4-6 digit"
              type="password"
              value={form.pin}
              onChange={(event) => handleChange('pin', event.target.value)}
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
              value={form.confirmPin}
              onChange={(event) => handleChange('confirmPin', event.target.value)}
            />
          </label>
        </div>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>Warna aksen</span>
            <div className="accent-picker">
              {PROFILE_ACCENTS.map((accent) => (
                <button
                  key={accent}
                  aria-label={`Pilih warna ${accent}`}
                  className={`accent-swatch ${
                    form.accent === accent ? 'accent-swatch--active' : ''
                  }`}
                  style={{ '--swatch': accent }}
                  type="button"
                  onClick={() => handleChange('accent', accent)}
                />
              ))}
            </div>
          </label>

          <label className="field">
            <span>Zona waktu default</span>
            <select
              value={form.defaultTimezone}
              onChange={(event) => handleChange('defaultTimezone', event.target.value)}
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </Modal>
  )
}

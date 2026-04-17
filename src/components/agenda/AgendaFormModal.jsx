import { useMemo, useRef, useState } from 'react'
import { FileUp, Loader2, Sparkles } from 'lucide-react'
import {
  MEETING_TYPES,
  TIMEZONES,
} from '../../lib/constants'
import { parseAgendaFromPdf } from '../../lib/gemini'
import { createAgendaTemplate } from '../../lib/storage'
import Modal from '../common/Modal'

const MEETING_TYPE_OPTIONS = [
  { value: 'Luring', label: 'Luring (Offline)' },
  { value: 'Daring', label: 'Daring (Online)' },
  { value: 'Hybrid', label: 'Hybrid' },
]

function openNativePicker(event) {
  event.currentTarget.showPicker?.()
}

function RequiredLabel({ children, required = false }) {
  return (
    <span>
      {children}
      {required ? <span className="required-star"> *</span> : null}
    </span>
  )
}

export default function AgendaFormModal({
  open,
  agenda,
  profile,
  selectedDateKey,
  onClose,
  onSave,
}) {
  const initialAgenda = useMemo(() => {
    const base = createAgendaTemplate(profile)
    return {
      ...base,
      date: selectedDateKey,
      ...agenda,
      officialFor: agenda?.officialFor ?? profile.name,
    }
  }, [agenda, profile, selectedDateKey])

  const [form, setForm] = useState(initialAgenda)
  const [error, setError] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseInfo, setParseInfo] = useState('')
  const fileInputRef = useRef(null)

  const geminiApiKey = profile?.settings?.geminiApiKey ?? ''

  const handlePickPdf = () => {
    if (!geminiApiKey || isParsing) return
    fileInputRef.current?.click()
  }

  const handlePdfChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsParsing(true)
    setParseInfo('')
    setError('')
    try {
      const parsed = await parseAgendaFromPdf({
        file,
        apiKey: geminiApiKey,
        profile,
      })
      setForm((current) => ({
        ...current,
        title: parsed.title || current.title,
        date: parsed.date || current.date,
        startTime: parsed.startTime || current.startTime,
        endTime: parsed.endTime || current.endTime,
        location: parsed.location || current.location,
        accessDetails: parsed.accessDetails || current.accessDetails,
        meetingType: parsed.meetingType || current.meetingType,
        description: parsed.description || current.description,
      }))
      setParseInfo(
        'Isian form diisi dari PDF. Cek ulang sebelum klik "Tambah Agenda".',
      )
    } catch (err) {
      console.error('PDF parse failed', err)
      setError(err.message ?? 'Gagal parsing PDF.')
    } finally {
      setIsParsing(false)
    }
  }

  const officialOptions = useMemo(
    () => [
      profile.name,
      ...profile.settings.officialOptions.filter((option) => option !== profile.name),
    ],
    [profile.name, profile.settings.officialOptions],
  )

  const showLocation = form.meetingType === 'Luring' || form.meetingType === 'Hybrid'
  const showAccessDetails =
    form.meetingType === 'Daring' || form.meetingType === 'Hybrid'

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (error) {
      setError('')
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.date) {
      setError('Tanggal agenda wajib diisi.')
      return
    }

    if (!form.title.trim()) {
      setError('Judul agenda wajib diisi.')
      return
    }

    if (!form.startTime) {
      setError('Jam mulai wajib diisi.')
      return
    }

    if (form.endTime && form.endTime <= form.startTime) {
      setError('Jam selesai harus lebih besar dari jam mulai.')
      return
    }

    if (form.attendeeType && !form.attendeeNames.trim()) {
      setError('Nama peserta wajib diisi kalau tipe peserta dipilih.')
      return
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: showLocation ? form.location.trim() : '',
      accessDetails: showAccessDetails ? form.accessDetails.trim() : '',
      attendeeNames: form.attendeeNames.trim(),
      officialFor: form.officialFor || profile.name,
      endTime: form.endTime || '',
      isOpenEnded: false,
    })
  }

  return (
    <Modal
      open={open}
      size="large"
      title={agenda ? 'Edit Agenda' : 'Tambah Agenda'}
      onClose={onClose}
      footer={
        <>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="button button--primary" form="agenda-form" type="submit">
            {agenda ? 'Simpan Perubahan' : 'Tambah Agenda'}
          </button>
        </>
      }
    >
      <form id="agenda-form" className="stack" onSubmit={handleSubmit}>
        <div className="pdf-import">
          <div className="pdf-import__copy">
            <p className="pdf-import__title">
              <Sparkles size={16} /> Import dari PDF
            </p>
            <p className="pdf-import__hint">
              {geminiApiKey
                ? 'Upload undangan PDF, Gemini akan coba isi form-nya otomatis.'
                : 'Isi Gemini API key di Settings profil untuk aktifkan fitur ini.'}
            </p>
          </div>
          <div className="pdf-import__action">
            <button
              className="button button--ghost"
              disabled={!geminiApiKey || isParsing}
              type="button"
              onClick={handlePickPdf}
            >
              {isParsing ? (
                <>
                  <Loader2 className="spin" size={16} /> Memproses...
                </>
              ) : (
                <>
                  <FileUp size={16} /> Pilih PDF
                </>
              )}
            </button>
            <input
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: 'none' }}
              type="file"
              onChange={handlePdfChange}
            />
          </div>
        </div>
        {parseInfo ? <p className="info-text">{parseInfo}</p> : null}

        <div className="stack stack--tight">
          <div className="inline-grid inline-grid--three agenda-form-row">
            <label className="field">
              <RequiredLabel required>Tanggal</RequiredLabel>
              <input
                type="date"
                value={form.date}
                onClick={openNativePicker}
                onFocus={openNativePicker}
                onChange={(event) => handleChange('date', event.target.value)}
              />
            </label>
            <label className="field">
              <RequiredLabel required>Jam mulai</RequiredLabel>
              <input
                type="time"
                value={form.startTime}
                onClick={openNativePicker}
                onFocus={openNativePicker}
                onChange={(event) => handleChange('startTime', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Jam selesai</span>
              <input
                type="time"
                value={form.endTime}
                onClick={openNativePicker}
                onFocus={openNativePicker}
                onChange={(event) => handleChange('endTime', event.target.value)}
              />
            </label>
          </div>
          <small className="field-hint agenda-form-row__hint">
            Kosongkan bila waktu selesai masih tentatif. Export kalender akan
            memakai durasi default 3 jam.
          </small>
        </div>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <RequiredLabel required>Zona waktu</RequiredLabel>
            <select
              value={form.timezone}
              onChange={(event) => handleChange('timezone', event.target.value)}
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <RequiredLabel required>Agenda Induk</RequiredLabel>
            <select
              value={form.officialFor}
              onChange={(event) => handleChange('officialFor', event.target.value)}
            >
              {officialOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <RequiredLabel required>Judul agenda</RequiredLabel>
          <input
            autoFocus
            type="text"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
          />
        </label>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>Tipe pertemuan</span>
            <select
              value={form.meetingType}
              onChange={(event) => handleChange('meetingType', event.target.value)}
            >
              {MEETING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Tipe peserta</span>
            <select
              value={form.attendeeType}
              onChange={(event) => handleChange('attendeeType', event.target.value)}
            >
              <option value="">Tanpa label</option>
              {profile.settings.attendeeTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {form.attendeeType ? (
          <label className="field">
            <span>Nama peserta</span>
            <input
              placeholder="Contoh: Mas Firman dan tim"
              type="text"
              value={form.attendeeNames}
              onChange={(event) => handleChange('attendeeNames', event.target.value)}
            />
          </label>
        ) : null}

        {showLocation ? (
          <label className="field">
            <span>Lokasi</span>
            <textarea
              rows="2"
              value={form.location}
              onChange={(event) => handleChange('location', event.target.value)}
            />
          </label>
        ) : null}

        {showAccessDetails ? (
          <label className="field">
            <span>Link / Detail Akses</span>
            <textarea
              rows="3"
              value={form.accessDetails}
              onChange={(event) => handleChange('accessDetails', event.target.value)}
            />
          </label>
        ) : null}

        <label className="field">
          <span>Deskripsi</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </Modal>
  )
}

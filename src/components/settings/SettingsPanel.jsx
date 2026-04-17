import { useState } from 'react'
import { TERMS_AND_CONDITIONS, TIMEZONES } from '../../lib/constants'

function listToText(items) {
  return items.join('\n')
}

function textToList(value, fallback) {
  const next = value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

  return next.length ? next : fallback
}

export default function SettingsPanel({
  profile,
  appSettings,
  onSave,
  onChangeMasterPin,
}) {
  const [form, setForm] = useState({
    name: profile.name,
    description: profile.description,
    pin: profile.pin,
    accent: profile.accent,
    defaultTimezone: profile.settings.defaultTimezone,
    defaultView: profile.settings.defaultView,
    firstDayOfWeek: String(profile.settings.firstDayOfWeek),
    showCalendarCounts: profile.settings.showCalendarCounts,
    officialOptions: listToText(profile.settings.officialOptions),
    attendeeTypes: listToText(profile.settings.attendeeTypes),
    geminiApiKey: profile.settings.geminiApiKey ?? '',
    darkMode: appSettings.darkMode,
  })

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    onSave({
      ...profile,
      name: form.name.trim(),
      description: form.description.trim(),
      pin: form.pin,
      accent: form.accent,
      settings: {
        ...profile.settings,
        defaultTimezone: form.defaultTimezone,
        defaultView: form.defaultView,
        firstDayOfWeek: Number(form.firstDayOfWeek),
        showCalendarCounts: form.showCalendarCounts,
        officialOptions: textToList(
          form.officialOptions,
          profile.settings.officialOptions,
        ),
        attendeeTypes: textToList(
          form.attendeeTypes,
          profile.settings.attendeeTypes,
        ),
        geminiApiKey: form.geminiApiKey.trim(),
      },
      appSettings: {
        darkMode: form.darkMode,
      },
    })
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Atur profil dan preferensi tampilan</h2>
        </div>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>Nama jadwal</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
          </label>
          <label className="field">
            <span>PIN profil</span>
            <input
              inputMode="numeric"
              maxLength={6}
              minLength={4}
              type="password"
              value={form.pin}
              onChange={(event) => handleChange('pin', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Deskripsi profil</span>
          <textarea
            rows="3"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
          />
        </label>

        <div className="inline-grid inline-grid--two">
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

          <label className="field">
            <span>Tampilan default</span>
            <select
              value={form.defaultView}
              onChange={(event) => handleChange('defaultView', event.target.value)}
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
            </select>
          </label>
        </div>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>Hari pertama kalender</span>
            <select
              value={form.firstDayOfWeek}
              onChange={(event) => handleChange('firstDayOfWeek', event.target.value)}
            >
              <option value="0">Minggu</option>
              <option value="1">Senin</option>
            </select>
          </label>

          <label className="field">
            <span>Warna aksen</span>
            <input
              type="color"
              value={form.accent}
              onChange={(event) => handleChange('accent', event.target.value)}
            />
          </label>
        </div>

        <div className="inline-grid inline-grid--two">
          <label className="checkbox">
            <input
              checked={form.showCalendarCounts}
              type="checkbox"
              onChange={(event) =>
                handleChange('showCalendarCounts', event.target.checked)
              }
            />
            <span>Tampilkan indikator jumlah agenda</span>
          </label>

          <label className="checkbox">
            <input
              checked={form.darkMode}
              type="checkbox"
              onChange={(event) => handleChange('darkMode', event.target.checked)}
            />
            <span>Gunakan dark mode</span>
          </label>
        </div>

        <div className="inline-grid inline-grid--two">
          <label className="field">
            <span>Opsi Agenda Induk</span>
            <textarea
              rows="5"
              value={form.officialOptions}
              onChange={(event) => handleChange('officialOptions', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Opsi tipe peserta</span>
            <textarea
              rows="5"
              value={form.attendeeTypes}
              onChange={(event) => handleChange('attendeeTypes', event.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Gemini API Key</span>
          <input
            autoComplete="off"
            placeholder="AIza..."
            type="password"
            value={form.geminiApiKey}
            onChange={(event) => handleChange('geminiApiKey', event.target.value)}
          />
          <small className="field-hint">
            Dipakai untuk fitur Import Agenda dari PDF. Buat key di{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              rel="noreferrer"
              target="_blank"
            >
              aistudio.google.com
            </a>
            . Key disimpan per profil.
          </small>
        </label>

        <div className="terms-card">
          <div>
            <p className="eyebrow">Syarat & Ketentuan</p>
            <h3>Syarat & Ketentuan</h3>
          </div>
          <div className="terms-list">
            {TERMS_AND_CONDITIONS.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="settings-actions">
          <button className="button button--primary" type="submit">
            Simpan Settings
          </button>
          <button className="button button--ghost" type="button" onClick={onChangeMasterPin}>
            Ganti Master PIN
          </button>
        </div>
      </form>
    </section>
  )
}

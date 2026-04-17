import { useDeferredValue, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Download,
  MessageCircle,
  Settings2,
} from 'lucide-react'
import { downloadDayAsIcs, openAgendaInGoogleCalendar } from '../../lib/calendarExport'
import {
  buildAgendaCounts,
  createAgendaSummary,
  formatDateKey,
  groupAgendasByDate,
  moveMonth,
  parseDateKey,
  sortAgendasByTime,
} from '../../lib/dateTime'
import AgendaCalendar from './AgendaCalendar'
import DailyAgendaView from './DailyAgendaView'
import WeeklyAgendaView from './WeeklyAgendaView'
import AgendaFormModal from './AgendaFormModal'
import SettingsPanel from '../settings/SettingsPanel'
import Modal from '../common/Modal'

export default function AgendaWorkspace({
  profile,
  appSettings,
  onBack,
  onSaveAgenda,
  onDeleteAgenda,
  onSaveProfile,
  onRequestChangeMasterPin,
  showToast,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState(profile.settings.defaultView)
  const [activeTab, setActiveTab] = useState('agenda')
  const [editingAgenda, setEditingAgenda] = useState(null)
  const [agendaToDelete, setAgendaToDelete] = useState(null)

  const deferredAgendas = useDeferredValue(profile.agendas)
  const selectedDateKey = formatDateKey(selectedDate)

  const agendasByDate = useMemo(() => {
    const grouped = groupAgendasByDate(deferredAgendas)
    return Object.fromEntries(
      Object.entries(grouped).map(([dateKey, agendas]) => [
        dateKey,
        sortAgendasByTime(agendas),
      ]),
    )
  }, [deferredAgendas])

  const counts = useMemo(() => buildAgendaCounts(deferredAgendas), [deferredAgendas])
  const dailyAgendas = agendasByDate[selectedDateKey] ?? []

  const handleCopySummary = async () => {
    if (!dailyAgendas.length) {
      showToast('Belum ada agenda untuk disalin.')
      return
    }

    try {
      const text = createAgendaSummary(profile, dailyAgendas, selectedDateKey)
      await navigator.clipboard.writeText(text)
      showToast('Agenda siap dikirim ke WhatsApp.')
    } catch (error) {
      console.error('Failed to copy agenda summary', error)
      showToast('Clipboard tidak tersedia di browser ini.')
    }
  }

  const handleExportDay = () => {
    const exported = downloadDayAsIcs(profile, dailyAgendas, selectedDateKey)
    showToast(exported ? 'File ICS berhasil dibuat.' : 'Tidak ada agenda untuk diexport.')
  }

  const handleSaveSettings = (next) => {
    onSaveProfile(next)
    setViewMode(next.settings.defaultView)
    showToast('Settings profil diperbarui.')
  }

  return (
    <div className="workspace-shell" style={{ '--accent': profile.accent }}>
      <header className="workspace-header">
        <div className="workspace-header__identity">
          <button className="button button--ghost" type="button" onClick={onBack}>
            <ArrowLeft size={18} />
            Kembali
          </button>
          <div className="workspace-header__copy">
            <h1>{profile.name}</h1>
            {profile.description ? (
              <p className="muted-text workspace-description">{profile.description}</p>
            ) : null}
          </div>
        </div>

        <div className="workspace-header__actions">
          <button
            className={`button ${activeTab === 'agenda' ? 'button--primary' : 'button--ghost'}`}
            type="button"
            onClick={() => setActiveTab('agenda')}
          >
            <CalendarDays size={18} />
            Agenda
          </button>
          <button
            className={`button ${activeTab === 'settings' ? 'button--primary' : 'button--ghost'}`}
            type="button"
            onClick={() => setActiveTab('settings')}
          >
            <Settings2 size={18} />
            Settings
          </button>
        </div>
      </header>

      {activeTab === 'agenda' ? (
        <>
          <section className="toolbar">
            <div className="segmented-control">
              <button
                className={viewMode === 'daily' ? 'is-active' : ''}
                type="button"
                onClick={() => setViewMode('daily')}
              >
                Harian
              </button>
              <button
                className={viewMode === 'weekly' ? 'is-active' : ''}
                type="button"
                onClick={() => setViewMode('weekly')}
              >
                Mingguan
              </button>
            </div>

            <div className="toolbar-actions">
              <button className="button button--whatsapp" type="button" onClick={handleCopySummary}>
                <MessageCircle size={18} />
                Salin Agenda
              </button>
              <button className="button button--ghost" type="button" onClick={handleExportDay}>
                <Download size={18} />
                Export .ics
              </button>
            </div>
          </section>

          <div className="workspace-grid">
            <AgendaCalendar
              counts={counts}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              settings={profile.settings}
              onMonthChange={(delta) => setCurrentMonth((month) => moveMonth(month, delta))}
              onSelectDate={(date) => {
                setSelectedDate(date)
                setCurrentMonth(parseDateKey(formatDateKey(date)))
                setViewMode('daily')
              }}
            />

            {viewMode === 'daily' ? (
              <DailyAgendaView
                agendas={dailyAgendas}
                profile={profile}
                selectedDateKey={selectedDateKey}
                onAddAgenda={() => setEditingAgenda({})}
                onDeleteAgenda={setAgendaToDelete}
                onEditAgenda={setEditingAgenda}
                onExportAgenda={(agenda) => openAgendaInGoogleCalendar(profile, agenda)}
              />
            ) : (
              <WeeklyAgendaView
                agendasByDate={agendasByDate}
                profile={profile}
                selectedDate={selectedDate}
                onDeleteAgenda={setAgendaToDelete}
                onEditAgenda={setEditingAgenda}
                onExportAgenda={(agenda) => openAgendaInGoogleCalendar(profile, agenda)}
                onSelectDate={setSelectedDate}
              />
            )}
          </div>
        </>
      ) : (
        <SettingsPanel
          key={`settings-${profile.id}-${appSettings.darkMode}`}
          appSettings={appSettings}
          profile={profile}
          onChangeMasterPin={onRequestChangeMasterPin}
          onSave={handleSaveSettings}
        />
      )}

      <AgendaFormModal
        key={`agenda-${editingAgenda?.id ?? 'new'}-${selectedDateKey}-${Boolean(editingAgenda)}`}
        agenda={editingAgenda?.id ? editingAgenda : null}
        open={Boolean(editingAgenda)}
        profile={profile}
        selectedDateKey={selectedDateKey}
        onClose={() => setEditingAgenda(null)}
        onSave={(agenda) => {
          const isEditing = Boolean(editingAgenda?.id)
          onSaveAgenda(agenda)
          setEditingAgenda(null)
          showToast(isEditing ? 'Agenda diperbarui.' : 'Agenda ditambahkan.')
        }}
      />

      <Modal
        open={Boolean(agendaToDelete)}
        title="Hapus agenda?"
        onClose={() => setAgendaToDelete(null)}
        footer={
          <>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setAgendaToDelete(null)}
            >
              Batal
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={() => {
                onDeleteAgenda(agendaToDelete)
                setAgendaToDelete(null)
                showToast('Agenda dihapus.')
              }}
            >
              Hapus
            </button>
          </>
        }
      >
        <p className="muted-text">
          Agenda <strong>{agendaToDelete?.title}</strong> akan dihapus permanen dari
          profil ini.
        </p>
      </Modal>
    </div>
  )
}

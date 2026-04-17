import { useEffect, useMemo, useState } from 'react'
import AgendaWorkspace from './components/agenda/AgendaWorkspace'
import Modal from './components/common/Modal'
import { PinPromptModal, PinSetupModal } from './components/common/PinModal'
import ProfileDashboard from './components/profiles/ProfileDashboard'
import ProfileFormModal from './components/profiles/ProfileFormModal'
import {
  DEFAULT_STORE,
  createProfileTemplate,
  loadAppStore,
  saveAppStore,
  updateProfileInStore,
} from './lib/storage'

function useToast() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!message) {
      return undefined
    }

    const timer = window.setTimeout(() => setMessage(''), 2800)
    return () => window.clearTimeout(timer)
  }, [message])

  return [message, setMessage]
}

function App() {
  const [store, setStore] = useState(DEFAULT_STORE)
  const [isStoreReady, setIsStoreReady] = useState(false)
  const [activeProfileId, setActiveProfileId] = useState('')
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [profileModal, setProfileModal] = useState({ open: false, profile: null })
  const [pinPrompt, setPinPrompt] = useState(null)
  const [masterPinModal, setMasterPinModal] = useState({
    open: false,
    mode: 'setup',
  })
  const [profileToDelete, setProfileToDelete] = useState(null)
  const [toastMessage, showToast] = useToast()

  useEffect(() => {
    document.title = 'Executive Agenda'
  }, [])

  useEffect(() => {
    let isMounted = true

    async function hydrateStore() {
      const loadedStore = await loadAppStore()
      if (!isMounted) {
        return
      }

      setStore(loadedStore)
      setIsAdminUnlocked(!loadedStore.masterPin)
      setMasterPinModal({
        open: !loadedStore.masterPin,
        mode: loadedStore.masterPin ? 'change' : 'setup',
      })
      setIsStoreReady(true)
    }

    hydrateStore()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isStoreReady) {
      return
    }

    void saveAppStore(store)
  }, [isStoreReady, store])

  useEffect(() => {
    document.documentElement.dataset.theme = store.appSettings.darkMode
      ? 'dark'
      : 'light'
  }, [store.appSettings.darkMode])

  const activeProfile = useMemo(
    () => store.profiles.find((profile) => profile.id === activeProfileId) ?? null,
    [activeProfileId, store.profiles],
  )

  const upsertProfile = (draft) => {
    const nextAppSettings = draft.appSettings ?? store.appSettings
    const profileDraft = { ...draft }
    delete profileDraft.appSettings

    setStore((current) => {
      const exists = current.profiles.find((profile) => profile.id === profileDraft.id)
      const nextProfile = createProfileTemplate({
        ...(exists ?? {}),
        ...profileDraft,
        settings: {
          ...(exists?.settings ?? {}),
          ...(profileDraft.settings ?? {}),
        },
        agendas: profileDraft.agendas ?? exists?.agendas ?? [],
      })

      const nextProfiles = exists
        ? current.profiles.map((profile) =>
            profile.id === nextProfile.id ? nextProfile : profile,
          )
        : [...current.profiles, nextProfile]

      return {
        ...current,
        appSettings: nextAppSettings,
        profiles: nextProfiles,
      }
    })

    setProfileModal({ open: false, profile: null })
  }

  const removeProfile = (profile) => {
    setStore((current) => ({
      ...current,
      profiles: current.profiles.filter((item) => item.id !== profile.id),
    }))

    if (activeProfileId === profile.id) {
      setActiveProfileId('')
    }

    setProfileToDelete(null)
    showToast('Profil jadwal dihapus.')
  }

  const handleProfilePinSubmit = (pin) => {
    const profile = store.profiles.find((item) => item.id === pinPrompt?.profileId)
    if (!profile) {
      return {
        ok: false,
        message: 'Profil tidak ditemukan. Coba muat ulang halaman.',
      }
    }

    if (profile.pin !== pin) {
      return {
        ok: false,
        message: 'PIN profil belum cocok.',
      }
    }

    setActiveProfileId(profile.id)
    setPinPrompt(null)
    return { ok: true }
  }

  const handleMasterPinSubmit = (pin) => {
    if (store.masterPin !== pin) {
      return {
        ok: false,
        message: 'Master PIN belum cocok.',
      }
    }

    if (pinPrompt?.kind === 'master-for-change') {
      setPinPrompt(null)
      setMasterPinModal({ open: true, mode: 'change' })
    } else {
      setIsAdminUnlocked(true)
      setPinPrompt(null)
      showToast('Mode admin aktif.')
    }

    return { ok: true }
  }

  const saveAgenda = (agenda) => {
    if (!activeProfile) {
      return
    }

    setStore((current) =>
      updateProfileInStore(current, activeProfile.id, (profile) => {
        const exists = profile.agendas.some((item) => item.id === agenda.id)
        return {
          ...profile,
          agendas: exists
            ? profile.agendas.map((item) => (item.id === agenda.id ? agenda : item))
            : [...profile.agendas, agenda],
        }
      }),
    )
  }

  const deleteAgenda = (agenda) => {
    if (!activeProfile) {
      return
    }

    setStore((current) =>
      updateProfileInStore(current, activeProfile.id, (profile) => ({
        ...profile,
        agendas: profile.agendas.filter((item) => item.id !== agenda.id),
      })),
    )
  }

  if (!isStoreReady) {
    return (
      <div className="app-shell">
        <div className="page-frame">
          <section className="panel">
            <div className="empty-inline">
              <p>Menyiapkan Executive Agenda...</p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="page-frame">
        {activeProfile ? (
          <AgendaWorkspace
            key={activeProfile.id}
            appSettings={store.appSettings}
            profile={activeProfile}
            onBack={() => setActiveProfileId('')}
            onDeleteAgenda={deleteAgenda}
            onRequestChangeMasterPin={() =>
              setPinPrompt({
                kind: 'master-for-change',
                title: 'Verifikasi Master PIN',
                description: 'Masukkan master PIN saat ini sebelum menggantinya.',
              })
            }
            onSaveAgenda={saveAgenda}
            onSaveProfile={upsertProfile}
            showToast={showToast}
          />
        ) : (
          <ProfileDashboard
            isAdminUnlocked={isAdminUnlocked}
            profiles={store.profiles}
            onAddProfile={() => setProfileModal({ open: true, profile: null })}
            onDeleteProfile={setProfileToDelete}
            onEditProfile={(profile) => setProfileModal({ open: true, profile })}
            onEnterProfile={(profile) => {
              if (isAdminUnlocked) {
                setActiveProfileId(profile.id)
                return
              }

              setPinPrompt({
                kind: 'profile',
                profileId: profile.id,
                title: `Masuk ke ${profile.name}`,
                description: 'Masukkan PIN profil untuk membuka agenda ini.',
              })
            }}
            onLockAdmin={() => {
              setIsAdminUnlocked(false)
              showToast('Mode admin dikunci lagi.')
            }}
            onUnlockAdmin={() =>
              setPinPrompt({
                kind: 'master',
                title: 'Buka Mode Admin',
                description:
                  'Masukkan master PIN untuk menghapus profil atau bypass PIN profil.',
              })
            }
          />
        )}

        <footer className="page-footer">
          <p className="page-footer__credit">by anchadoyok</p>
        </footer>
      </div>

      <ProfileFormModal
        key={`profile-${profileModal.profile?.id ?? 'new'}-${profileModal.open ? 'open' : 'closed'}`}
        open={profileModal.open}
        profile={profileModal.profile}
        onClose={() => setProfileModal({ open: false, profile: null })}
        onSave={(profile) => {
          upsertProfile(profile)
          showToast(
            profileModal.profile ? 'Profil diperbarui.' : 'Profil baru berhasil dibuat.',
          )
        }}
      />

      <PinPromptModal
        key={`pin-${pinPrompt?.kind ?? 'none'}-${pinPrompt?.profileId ?? 'na'}-${pinPrompt ? 'open' : 'closed'}`}
        open={Boolean(pinPrompt)}
        title={pinPrompt?.title ?? 'Masukkan PIN'}
        description={pinPrompt?.description ?? ''}
        onClose={() => setPinPrompt(null)}
        onSubmit={(pin) =>
          pinPrompt?.kind?.startsWith('master')
            ? handleMasterPinSubmit(pin)
            : handleProfilePinSubmit(pin)
        }
      />

      <PinSetupModal
        key={`master-${masterPinModal.mode}-${masterPinModal.open ? 'open' : 'closed'}`}
        open={masterPinModal.open}
        title={
          masterPinModal.mode === 'change' ? 'Ganti Master PIN' : 'Buat Master PIN'
        }
        description={
          masterPinModal.mode === 'change'
            ? 'Master PIN dipakai untuk membuka mode admin dan mengelola daftar profil.'
            : 'Buat master PIN sekali di awal supaya penambahan profil tetap publik tetapi penghapusan dan bypass akses tetap aman.'
        }
        onClose={
          masterPinModal.mode === 'change'
            ? () => setMasterPinModal({ open: false, mode: 'change' })
            : null
        }
        onSubmit={(pin) => {
          setStore((current) => ({ ...current, masterPin: pin }))
          setMasterPinModal({ open: false, mode: 'change' })
          setIsAdminUnlocked(true)
          showToast(
            masterPinModal.mode === 'change'
              ? 'Master PIN berhasil diganti.'
              : 'Master PIN berhasil disimpan.',
          )
        }}
      />

      <Modal
        open={Boolean(profileToDelete)}
        title="Hapus profil jadwal?"
        onClose={() => setProfileToDelete(null)}
        footer={
          <>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setProfileToDelete(null)}
            >
              Batal
            </button>
            <button
              className="button button--danger"
              type="button"
              onClick={() => removeProfile(profileToDelete)}
            >
              Hapus Profil
            </button>
          </>
        }
      >
        <p className="muted-text">
          Profil <strong>{profileToDelete?.name}</strong> beserta seluruh agenda di
          dalamnya akan dihapus.
        </p>
      </Modal>

      {toastMessage ? <div className="toast">{toastMessage}</div> : null}
    </div>
  )
}

export default App

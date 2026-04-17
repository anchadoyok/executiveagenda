import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  DEFAULT_ATTENDEE_TYPES,
  DEFAULT_OFFICIAL_OPTIONS,
  PROFILE_ACCENTS,
} from './constants'
import {
  STORE_COLLECTION,
  STORE_DOCUMENT,
  firestore,
} from './firebase'

export const STORAGE_KEY = 'agenda-command-center-v1'

const DEFAULT_PROFILE_SETTINGS = {
  defaultTimezone: 'Asia/Jakarta',
  defaultView: 'daily',
  firstDayOfWeek: 1,
  showCalendarCounts: true,
  officialOptions: DEFAULT_OFFICIAL_OPTIONS,
  attendeeTypes: DEFAULT_ATTENDEE_TYPES,
  geminiApiKey: '',
}

const DEFAULT_APP_SETTINGS = {
  darkMode: true,
}

export const DEFAULT_STORE = {
  masterPin: '',
  appSettings: DEFAULT_APP_SETTINGS,
  profiles: [],
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeAgenda(profileName, agenda) {
  return {
    id: agenda.id ?? createId('agenda'),
    date: agenda.date ?? '',
    startTime: agenda.startTime ?? '09:00',
    endTime: agenda.endTime ?? '',
    isOpenEnded: agenda.isOpenEnded ?? false,
    title: agenda.title ?? '',
    description: agenda.description ?? '',
    location: agenda.location ?? '',
    accessDetails: agenda.accessDetails ?? '',
    attendeeType: agenda.attendeeType ?? '',
    attendeeNames: agenda.attendeeNames ?? '',
    officialFor: agenda.officialFor ?? profileName,
    meetingType: agenda.meetingType ?? 'Luring',
    timezone: agenda.timezone ?? 'Asia/Jakarta',
  }
}

export function createProfileTemplate(overrides = {}) {
  const name = overrides.name ?? ''
  const settings = {
    ...DEFAULT_PROFILE_SETTINGS,
    ...overrides.settings,
    officialOptions:
      overrides.settings?.officialOptions ?? DEFAULT_PROFILE_SETTINGS.officialOptions,
    attendeeTypes:
      overrides.settings?.attendeeTypes ?? DEFAULT_PROFILE_SETTINGS.attendeeTypes,
  }

  const profile = {
    id: overrides.id ?? createId('profile'),
    name,
    description: overrides.description ?? '',
    pin: overrides.pin ?? '',
    accent: overrides.accent ?? PROFILE_ACCENTS[0],
    agendas: [],
    settings,
  }

  profile.agendas = (overrides.agendas ?? []).map((agenda) =>
    normalizeAgenda(profile.name, agenda),
  )

  return profile
}

function normalizeProfile(profile, index) {
  return createProfileTemplate({
    ...profile,
    accent: profile.accent ?? PROFILE_ACCENTS[index % PROFILE_ACCENTS.length],
    agendas: Array.isArray(profile.agendas) ? profile.agendas : [],
    settings: {
      ...DEFAULT_PROFILE_SETTINGS,
      ...profile.settings,
      officialOptions:
        profile.settings?.officialOptions?.filter(Boolean) ??
        DEFAULT_PROFILE_SETTINGS.officialOptions,
      attendeeTypes:
        profile.settings?.attendeeTypes?.filter(Boolean) ??
        DEFAULT_PROFILE_SETTINGS.attendeeTypes,
      geminiApiKey: profile.settings?.geminiApiKey ?? '',
    },
  })
}

function normalizeStore(store) {
  return {
    masterPin: store.masterPin ?? '',
    appSettings: {
      ...DEFAULT_APP_SETTINGS,
      ...store.appSettings,
    },
    profiles: Array.isArray(store.profiles)
      ? store.profiles.map(normalizeProfile)
      : [],
  }
}

export function createAgendaTemplate(profile) {
  return {
    id: createId('agenda'),
    date: '',
    startTime: '09:00',
    endTime: '',
    isOpenEnded: false,
    title: '',
    description: '',
    location: '',
    accessDetails: '',
    attendeeType: '',
    attendeeNames: '',
    officialFor: profile?.name ?? '',
    meetingType: 'Luring',
    timezone: profile?.settings.defaultTimezone ?? 'Asia/Jakarta',
  }
}

function storeDocRef() {
  return doc(firestore, STORE_COLLECTION, STORE_DOCUMENT)
}

export async function fetchFromCloud() {
  try {
    const snapshot = await getDoc(storeDocRef())
    if (!snapshot.exists()) {
      return null
    }
    const data = snapshot.data()
    return data?.payload ?? null
  } catch (error) {
    console.warn('Firestore fetch failed', error)
    return null
  }
}

export async function saveToCloud(store) {
  try {
    await setDoc(storeDocRef(), {
      payload: store,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Firestore save failed', error)
  }
}

function loadLocalStore() {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_STORE
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return DEFAULT_STORE
    }

    return normalizeStore(JSON.parse(raw))
  } catch (error) {
    console.error('Failed to load app store from local storage', error)
    return DEFAULT_STORE
  }
}

function saveLocalStore(store) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export async function loadAppStore() {
  try {
    const cloudStore = await fetchFromCloud()
    if (cloudStore) {
      return normalizeStore(cloudStore)
    }
  } catch (error) {
    console.warn('Cloud store fetch skipped, falling back to local store', error)
  }

  return loadLocalStore()
}

export async function saveAppStore(store) {
  const normalized = normalizeStore(store)

  try {
    await saveToCloud(normalized)
  } catch (error) {
    console.warn('Cloud store save skipped, storing locally only', error)
  }

  saveLocalStore(normalized)
}

export function updateProfileInStore(store, profileId, updater) {
  return {
    ...store,
    profiles: store.profiles.map((profile) =>
      profile.id === profileId ? updater(profile) : profile,
    ),
  }
}

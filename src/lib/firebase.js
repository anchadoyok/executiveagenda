import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDxGv9sau5RgBG1ylx9PK4xNk2D6QXWwtY',
  authDomain: 'executive-agenda.firebaseapp.com',
  projectId: 'executive-agenda',
  storageBucket: 'executive-agenda.firebasestorage.app',
  messagingSenderId: '210122255760',
  appId: '1:210122255760:web:4752f071606af9fb321715',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firestore = getFirestore(firebaseApp)

export const STORE_COLLECTION = 'agenda-command-center'
export const STORE_DOCUMENT = 'store'

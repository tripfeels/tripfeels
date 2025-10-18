import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

const hasValidConfig =
  firebaseAdminConfig.projectId &&
  firebaseAdminConfig.clientEmail &&
  firebaseAdminConfig.privateKey &&
  firebaseAdminConfig.privateKey.includes('BEGIN PRIVATE KEY') &&
  firebaseAdminConfig.privateKey !== 'your-private-key-here'

// Validate Firebase Admin configuration
if (!hasValidConfig) {
  console.warn('⚠️ Firebase Admin configuration is incomplete or invalid. Firebase features will be unavailable.')
}

let app: App | null = null
let adminAuth: Auth | null = null
let adminDb: Firestore | null = null

// Initialize Firebase Admin only if config is valid
if (hasValidConfig) {
  try {
    app = getApps().length === 0
      ? initializeApp({
          credential: cert(firebaseAdminConfig),
          projectId: process.env.FIREBASE_PROJECT_ID,
        })
      : getApps()[0]

    adminAuth = getAuth(app)
    adminDb = getFirestore(app)
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
  }
}

export { adminAuth, adminDb, app as default }

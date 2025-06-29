import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, set, get, query, orderByChild, equalTo, limitToLast, onValue, off } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL',
]

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
)

if (missingEnvVars.length > 0) {
  console.warn(
    `Missing Firebase Realtime Database environment variables: ${missingEnvVars.join(', ')}`
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Realtime Database and get a reference to the service
export const database = getDatabase(app)
export const auth = getAuth(app)

// Database helper functions
export const dbHelpers = {
  // Create a reference to a path
  createRef: (path: string) => ref(database, path),
  
  // Push data to a reference
  pushData: async (path: string, data: any) => {
    const dbRef = ref(database, path)
    return await push(dbRef, data)
  },
  
  // Set data at a reference
  setData: async (path: string, data: any) => {
    const dbRef = ref(database, path)
    return await set(dbRef, data)
  },
  
  // Get data from a reference
  getData: async (path: string) => {
    const dbRef = ref(database, path)
    const snapshot = await get(dbRef)
    return snapshot.exists() ? snapshot.val() : null
  },
  
  // Query data with filters
  queryData: async (path: string, orderBy: string, equalToValue?: any, limit?: number) => {
    const dbRef = ref(database, path)
    let dbQuery = query(dbRef, orderByChild(orderBy))
    
    if (equalToValue !== undefined) {
      dbQuery = query(dbQuery, equalTo(equalToValue))
    }
    
    if (limit) {
      dbQuery = query(dbQuery, limitToLast(limit))
    }
    
    const snapshot = await get(dbQuery)
    return snapshot.exists() ? snapshot.val() : null
  },
  
  // Listen to data changes
  listenToData: (path: string, callback: (data: any) => void) => {
    const dbRef = ref(database, path)
    onValue(dbRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null
      callback(data)
    })
    return dbRef
  },
  
  // Stop listening to data changes
  stopListening: (dbRef: any) => {
    off(dbRef)
  }
}

export default app
import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Credentials can arrive three ways, in order of preference:
//   1. FIREBASE_SERVICE_ACCOUNT — the whole service-account JSON in one var
//   2. FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
//   3. config/serviceAccountKey.json on disk (local development only — the file
//      is gitignored, so it is never present on a deployed host)
const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
      console.error('FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON.');
    }
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // Dashboards store the key with literal \n sequences rather than newlines.
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
    };
  }

  try {
    return require('./serviceAccountKey.json');
  } catch {
    return null;
  }
};

const serviceAccount = loadServiceAccount();

export let isFirebaseReady = false;

if (serviceAccount) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    isFirebaseReady = true;
    console.log('Firebase Admin initialized.');
  } catch (error) {
    // A malformed key must not take the whole process down on boot — that turns
    // one bad env var into a crash loop on the host.
    console.error('Firebase Admin failed to initialize:', error.message);
  }
} else {
  console.error(
    'FIREBASE ADMIN NOT INITIALIZED — sign-in will fail. Set FIREBASE_SERVICE_ACCOUNT ' +
    '(full JSON), or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.'
  );
}

export default admin;

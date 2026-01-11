import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// You can load it from a file (serviceAccountKey.json) 
// OR simpler for now: just use environment variables for everything if you prefer not to commit the key.
// But as per plan and standard practice for ease, we try to load the file, 
// if not found, we check env vars.

let serviceAccount;

try {
    // Try to load from "config/serviceAccountKey.json"
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.warn("Service account key file not found, checking environment variables...");
}

if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var");
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized.");
} else {
    // Fallback or warning - user needs to set this up
    console.error("FIREBASE ADMIN NOT INITIALIZED: Missing serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env var.");
}

export default admin;

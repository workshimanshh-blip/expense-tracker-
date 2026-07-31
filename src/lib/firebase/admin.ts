import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export const isFirebaseAdminConfigured =
  !!process.env.FIREBASE_ADMIN_PROJECT_ID &&
  !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let adminApp: App | null = null;
let adminDbInstance: Firestore | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (!isFirebaseAdminConfigured) {
    throw new Error("Firebase Admin env vars are not configured");
  }
  adminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          // Vercel env vars are single-line; \n must be un-escaped.
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n",
          ),
        }),
      });
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (adminDbInstance) return adminDbInstance;
  adminDbInstance = getFirestore(getAdminApp());
  return adminDbInstance;
}

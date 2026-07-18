import { collection, deleteDoc, doc, getDocs, setDoc, type Firestore } from 'firebase/firestore';

/**
 * Read-only viewer access (investors / mentors) to a user's LaunchCode files.
 * A viewer is stored as users/{ownerUid}/viewers/{lowercasedEmail}; the
 * firestore.rules isViewer() helper grants that email READ access. Emails are
 * normalized to lowercase because the rule matches request.auth.token.email.
 */

export type Viewer = { email: string; addedAt?: string };

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string) => emailPattern.test(normalizeEmail(email));

export async function addViewer(firestore: Firestore, ownerUid: string, email: string): Promise<void> {
  const e = normalizeEmail(email);
  await setDoc(doc(firestore, 'users', ownerUid, 'viewers', e), {
    email: e,
    addedAt: new Date().toISOString(),
  });
}

export async function removeViewer(firestore: Firestore, ownerUid: string, email: string): Promise<void> {
  await deleteDoc(doc(firestore, 'users', ownerUid, 'viewers', normalizeEmail(email)));
}

export async function listViewers(firestore: Firestore, ownerUid: string): Promise<Viewer[]> {
  const snap = await getDocs(collection(firestore, 'users', ownerUid, 'viewers'));
  return snap.docs
    .map((d) => d.data() as Viewer)
    .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
}

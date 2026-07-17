
'use client';

import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  getAdditionalUserInfo,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { clearPhaseCache } from '@/lib/phase-cache';
import { clearCrossPromoDismissals } from '@/lib/cross-promotions';

const provider = new GoogleAuthProvider();

// Helper to translate common Firebase Auth errors to user-friendly messages.
// The Firebase error code is appended so failures can be diagnosed precisely.
const getAuthErrorMessage = (error: any) => {
  const code = error?.code as string | undefined;
  const withCode = (msg: string) => (code ? `${msg} (${code})` : msg);
  switch (code) {
    case 'auth/operation-not-allowed':
      return withCode('This sign-in method is not enabled in Firebase (Authentication → Sign-in method). Enable Email/Password and Google.');
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return withCode('Invalid email or password.');
    case 'auth/email-already-in-use':
      return withCode('An account with this email already exists.');
    case 'auth/weak-password':
      return withCode('Password should be at least 6 characters.');
    case 'auth/popup-closed-by-user':
      return withCode('The sign-in popup was closed before completing.');
    case 'auth/popup-blocked':
      return withCode('Your browser blocked the sign-in popup. Allow popups for this site and try again.');
    case 'auth/cancelled-popup-request':
      return withCode('Another sign-in attempt is already in progress.');
    case 'auth/unauthorized-domain':
      return withCode('This domain is not authorized for sign-in. Add it under Firebase Authentication → Settings → Authorized domains.');
    case 'auth/network-request-failed':
      return withCode('Could not reach the sign-in service. Check your connection and try again.');
    case 'auth/too-many-requests':
      return withCode('Too many attempts. Please wait a moment and try again.');
    default:
      return withCode(error?.message || 'An unexpected error occurred.');
  }
};

// Create user document in Firestore
const createUserDocument = (firestore: any, user: any) => {
    const userRef = doc(firestore, 'users', user.uid);
    const newUser = {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        subscription: 'free',
        reportsGenerated: 0,
        reportsRemaining: 3, 
    };
    setDocumentNonBlocking(userRef, newUser, { merge: true });
};


export const useGoogleSignIn = () => {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignIn = async (rememberMe = true) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const result = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
                createUserDocument(firestore, result.user);
            }
            router.push('/dashboard');
        } catch (error: any) {
            // Removed console.error to prevent dev overlay
            toast({
              variant: 'destructive',
              title: 'Sign-in Failed',
              description: getAuthErrorMessage(error)
            })
        }
    };

    return handleSignIn;
}

export const useEmailSignUp = () => {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignUp = async (email: string, password: string, displayName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName });
            await userCredential.user.reload();
            const userWithDisplayName = auth.currentUser;
            if (userWithDisplayName) {
                createUserDocument(firestore, userWithDisplayName);
            }
            router.push('/dashboard');
        } catch (error: any) {
            // Removed console.error to prevent dev overlay
            toast({
                variant: 'destructive',
                title: 'Sign-up Failed',
                description: getAuthErrorMessage(error)
            });
        }
    };

    return handleSignUp;
}

export const useEmailSignIn = () => {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignIn = async (email: string, password: string, rememberMe = true) => {
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (error: any) {
            // Removed console.error to prevent dev overlay
            toast({
                variant: 'destructive',
                title: 'Sign-in Failed',
                description: getAuthErrorMessage(error)
            });
        }
    };

    return handleSignIn;
}

export const useResetPassword = () => {
    const auth = useAuth();
    const { toast } = useToast();

    const handleReset = async (email: string) => {
        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Email Required',
                description: 'Please enter your email address to reset your password.'
            });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: 'Reset Email Sent',
                description: 'A password reset link has been sent to your email address.'
            });
        } catch (error: any) {
            // Removed console.error to prevent dev overlay
            toast({
                variant: 'destructive',
                title: 'Error',
                description: getAuthErrorMessage(error)
            });
        }
    };

    return handleReset;
}

export const useSignOut = () => {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Locally cached venture progress and cross-promo dismissals must not
            // outlive the session, or the next person to sign in on this device
            // inherits them.
            clearPhaseCache();
            clearCrossPromoDismissals();
            router.push('/');
        } catch (error: any) {
            // Removed console.error to prevent dev overlay
            toast({
              variant: 'destructive',
              title: 'Sign-out Failed',
              description: getAuthErrorMessage(error)
            })
        }
    };

    return handleSignOut;
}

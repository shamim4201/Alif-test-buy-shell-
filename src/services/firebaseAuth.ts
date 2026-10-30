import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (prevent duplicate initializeApp calls)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with account selection prompt
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Critical: prompts device account list instead of auto-logging into the last account
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

export interface GoogleProfile {
  email: string;
  name: string;
  avatar?: string;
  uid?: string;
}

/**
 * Triggers the official Google Sign-In Popup with account picker (shows all logged in Gmail accounts on phone/browser).
 */
export async function triggerGoogleSignInPopup(): Promise<GoogleProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user.email) {
      throw new Error('Google account did not return an email address');
    }

    return {
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email)}`,
      uid: user.uid
    };
  } catch (err: any) {
    // Check if error is popup-blocked or user closed
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('সাইন ইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।');
    } else if (err.code === 'auth/popup-blocked') {
      throw new Error('ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে পপআপ এলাউ করুন।');
    } else if (err.code === 'auth/network-request-failed') {
      throw new Error('ইন্টারনেট সংযোগ সমস্যা। আপনার নেটওয়ার্ক চেক করুন।');
    }
    throw err;
  }
}

/**
 * Helper to decode Google JWT token (e.g. from Google One Tap or GIS credential response)
 */
export function parseGoogleJwt(token: string): GoogleProfile | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatar: payload.picture,
      uid: payload.sub
    };
  } catch (e) {
    console.error('Failed to parse Google JWT:', e);
    return null;
  }
}

/**
 * Initialize Google Identity Services (GIS) One Tap if available in browser
 */
export function initGoogleOneTap(
  onSuccess: (profile: GoogleProfile) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return;

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) return;

  const checkGsi = () => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const profile = parseGoogleJwt(response.credential);
              if (profile) {
                onSuccess(profile);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Prompt Google One Tap bottom sheet on mobile/desktop
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap prompt was not shown or dismissed, fallback to button click
          }
        });
      } catch (e) {
        if (onError) onError(e);
      }
    }
  };

  if ((window as any).google?.accounts?.id) {
    checkGsi();
  } else {
    // Wait for script to finish loading
    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(timer);
        checkGsi();
      }
    }, 300);
    setTimeout(() => clearInterval(timer), 5000);
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore signout cleanup errors
  }
}

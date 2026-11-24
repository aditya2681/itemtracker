import { env } from './_generated/server';
import { components, internal } from './_generated/api';
import { setupConvexAuth } from '@convex-dev/auth/server';
import { setupUsernamePassword } from '@convex-dev/auth/methods/username-password/server';
import { setupUsernamePasskey } from '@convex-dev/auth/methods/username-passkey/server';
const auth = setupConvexAuth({ component: components.auth });
export const { signOut, refreshSession, isAuthenticated } = auth;
export const { startSignInWithUsernamePasskey, startAutofillSignInWithUsernamePasskey, finishSignUpWithUsernamePasskey, finishSignInWithUsernamePasskey } = setupUsernamePasskey(auth, {
  component: components.authPasskey,
  usernameComponent: components.authUsername,
  rpId: env.PASSKEY_RP_ID ?? 'localhost',
  origin: env.PASSKEY_ORIGIN ? [env.PASSKEY_ORIGIN] : ['http://localhost:5173', 'http://localhost:5174'],
}).attachUserCallbacks({ createUser: internal.users.createUser });

export const { signUpWithUsernamePassword, signInWithUsernamePassword, changePassword } = setupUsernamePassword(auth, { component: components.authPassword, usernameComponent: components.authUsername }).attachUserCallbacks({ createUser: internal.users.createUser });

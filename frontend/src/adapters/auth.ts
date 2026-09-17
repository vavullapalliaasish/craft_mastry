import { StorageAdapter } from './storage';
import { ApiAdapter } from './api';

/**
 * Mobile Authentication Adapter
 *
 * Expo Go compatible version.
 * Uses Development Mock Authentication.
 *
 * Native Firebase is intentionally removed because
 * and does not work inside standard Expo Go.
 */

export interface AuthUser {
  uid: string;
  phone: string;
  name: string;
  role: 'ARTISAN' | 'CUSTOMER' | 'ADMIN';
  completedOnboarding: boolean;
  token?: string;
}

export interface VerificationSession {
  verificationId: string;
  phoneNumber: string;
  isDevelopmentMock: boolean;
}

/**
 * Development Test Accounts
 *
 * These accounts are only for local development and testing.
 */
export const DEV_TEST_ACCOUNTS: Record<
  string,
  {
    name: string;
    role: 'ARTISAN' | 'CUSTOMER';
  }
> = {
  '9848012345': {
    name: 'రామయ్య ఆచారి (Ramayya Achari)',
    role: 'ARTISAN',
  },

  '9820044556': {
    name: 'విక్రమ్ శర్మ (Vikram Sharma)',
    role: 'CUSTOMER',
  },
};

export interface IAuthProvider {
  sendOtp(phone: string): Promise<VerificationSession>;

  verifyOtp(
    verificationId: string,
    otp: string,
    phone: string,
    name?: string,
    role?: 'ARTISAN' | 'CUSTOMER'
  ): Promise<AuthUser>;

  signOut(): Promise<void>;

  getCurrentUser(): Promise<AuthUser | null>;
}

/**
 * Development Authentication Provider
 *
 * Works inside:
 *
 * Expo Go
 * Android
 * iOS
 * Web
 *
 * No native Firebase dependency required.
 */
class DevAuthProvider implements IAuthProvider {
  /**
   * Create development OTP session
   */
  async sendOtp(phone: string): Promise<VerificationSession> {
    const cleanPhone = phone
      .replace(/\D/g, '')
      .slice(-10);

    return {
      verificationId: `dev-session-${Date.now()}`,
      phoneNumber: cleanPhone,
      isDevelopmentMock: true,
    };
  }

  /**
   * Verify development OTP
   *
   * The OTP is accepted in development mode.
   */
  async verifyOtp(
    verificationId: string,
    otp: string,
    phone: string,
    name?: string,
    role: 'ARTISAN' | 'CUSTOMER' = 'ARTISAN'
  ): Promise<AuthUser> {
    const cleanPhone = phone
      .replace(/\D/g, '')
      .slice(-10);

    if (!verificationId) {
      throw new Error('Verification session not found');
    }

    if (!otp || otp.length < 4) {
      throw new Error('Please enter a valid OTP');
    }

    const existing =
      DEV_TEST_ACCOUNTS[cleanPhone];

    const resolvedName =
      name ||
      existing?.name ||
      (
        role === 'ARTISAN'
          ? 'Artisan Maker'
          : 'Customer Buyer'
      );

    const resolvedRole =
      existing?.role ||
      role;

    const isOnboarded =
      await StorageAdapter.isOnboarded(
        cleanPhone
      );

    const user: AuthUser = {
      uid: `dev-uid-${cleanPhone}`,

      phone: cleanPhone,

      name: resolvedName,

      role: resolvedRole,

      completedOnboarding:
        isOnboarded,

      token: `dev:${cleanPhone}`,
    };

    /**
     * Save local authentication session
     */
    await StorageAdapter.setAuthSession({
      phone: user.phone,

      name: user.name,

      role: user.role,

      completedOnboarding:
        user.completedOnboarding,

      token: user.token,
    });

    /**
     * Sync user with backend.
     *
     * This is best-effort only.
     * Local authentication should continue
     * even if backend is unavailable.
     */
    ApiAdapter.saveUser({
      phone: user.phone,

      name: user.name,

      role: user.role,

      onboardingComplete:
        user.completedOnboarding,
    }).catch((err) => {
      console.warn(
        '[AuthAdapter] Backend sync note:',
        err
      );
    });

    return user;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await StorageAdapter.clearAuthSession();
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const session =
      await StorageAdapter.getAuthSession();

    if (!session) {
      return null;
    }

    return {
      uid: `dev-uid-${session.phone}`,

      phone: session.phone,

      name: session.name,

      role: session.role,

      completedOnboarding:
        session.completedOnboarding,

      token: session.token,
    };
  }
}

/**
 * Development Authentication Mode
 *
 * Keep true while testing using Expo Go.
 */
export const DEV_AUTH_ENABLED = true;

/**
 * Application Authentication Provider
 */
export const AuthAdapter: IAuthProvider =
  new DevAuthProvider();
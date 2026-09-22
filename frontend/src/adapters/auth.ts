import { StorageAdapter } from './storage';
import { ApiAdapter } from './api';

/**
 * Mobile Authentication Adapter
 *
 * Expo Go compatible development authentication.
 *
 * Development mode:
 * - Any valid 10-digit phone number can be used.
 * - Authentication token is generated dynamically:
 *      dev:<phone>
 *
 * Example:
 *   9848012345 -> dev:9848012345
 *   9876543210 -> dev:9876543210
 *   9123456789 -> dev:9123456789
 */

export interface AuthUser {
  uid: string;
  phone: string;
  name: string;

  email?: string;

  location?: string;

  pin?: string;

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
 * Optional predefined demo accounts.
 *
 * These are ONLY used to provide nicer names/roles.
 *
 * Any other valid 10-digit number will also work.
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
  sendOtp(
    phone: string,
  ): Promise<VerificationSession>;

  verifyOtp(
    verificationId: string,
    otp: string,
    phone: string,
    name?: string,
    role?: 'ARTISAN' | 'CUSTOMER',
  ): Promise<AuthUser>;

  signOut(): Promise<void>;

  getCurrentUser(): Promise<AuthUser | null>;
}

class DevAuthProvider
  implements IAuthProvider {

  /**
   * Always normalize the phone number
   * to exactly the last 10 digits.
   */
  private cleanPhone(phone: string): string {
    return String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);
  }

  /**
   * Validate a phone number.
   */
  private validatePhone(phone: string): void {
    if (!/^\d{10}$/.test(phone)) {
      throw new Error(
        'Please enter a valid 10-digit mobile number.',
      );
    }
  }

  /**
   * Create development OTP session.
   *
   * OTP is mocked during development.
   */
  async sendOtp(
    phone: string,
  ): Promise<VerificationSession> {

    const cleanPhone =
      this.cleanPhone(phone);

    this.validatePhone(cleanPhone);

    return {
      verificationId:
        `dev-session-${Date.now()}`,

      phoneNumber:
        cleanPhone,

      isDevelopmentMock:
        true,
    };
  }

  /**
   * Verify development OTP.
   *
   * IMPORTANT:
   * Any valid 10-digit phone number is accepted.
   *
   * The backend token is generated dynamically:
   *
   *      dev:<phone>
   */
  async verifyOtp(
    verificationId: string,
    otp: string,
    phone: string,
    name?: string,
    role: 'ARTISAN' | 'CUSTOMER' = 'ARTISAN',
  ): Promise<AuthUser> {

    const cleanPhone =
      this.cleanPhone(phone);

    this.validatePhone(cleanPhone);

    if (!verificationId) {
      throw new Error(
        'Verification session not found',
      );
    }

    if (!otp || otp.length < 4) {
      throw new Error(
        'Please enter a valid OTP',
      );
    }

    /**
     * Check whether this phone is one of
     * the predefined demo accounts.
     */
    const existing =
      DEV_TEST_ACCOUNTS[cleanPhone];

    /**
     * Default values for ANY new phone.
     *
     * Unknown phone numbers become ARTISAN
     * users so they can use the complete
     * artisan application during development.
     */
    const resolvedName =
      name?.trim() ||
      existing?.name ||
      'Artisan Maker';

    const resolvedRole =
      existing?.role ||
      role ||
      'ARTISAN';

    /**
     * Get currently stored session.
     */
    const previousSession =
      await StorageAdapter.getAuthSession();

    /**
     * IMPORTANT:
     *
     * Only preserve profile information if
     * the previous session belongs to the
     * SAME phone number.
     *
     * This prevents:
     *
     * User A
     *   ↓ logout
     * User B login
     *   ↓
     * User A's profile being reused.
     */
    const isSameUser =
      previousSession?.phone === cleanPhone;

    /**
     * Dynamic development token.
     *
     * THIS is the important part.
     *
     * 9848012345
     *   -> dev:9848012345
     *
     * 9876543210
     *   -> dev:9876543210
     */
    const developmentToken =
      `dev:${cleanPhone}`;

    const user: AuthUser = {
      uid:
        `dev-uid-${cleanPhone}`,

      phone:
        cleanPhone,

      name:
        isSameUser
          ? (
              previousSession?.name ||
              resolvedName
            )
          : resolvedName,

      email:
        isSameUser
          ? (
              previousSession?.email ||
              ''
            )
          : '',

      location:
        isSameUser
          ? (
              previousSession?.location ||
              'Andhra Pradesh, India'
            )
          : 'Andhra Pradesh, India',

      pin:
        isSameUser
          ? (
              previousSession?.pin ||
              ''
            )
          : '',

      role:
        isSameUser
          ? (
              previousSession?.role ||
              resolvedRole
            )
          : resolvedRole,

      /**
       * Development mode:
       *
       * Mark onboarding complete so every
       * application screen/API can be tested
       * with any phone number.
       */
      completedOnboarding:
        true,

      /**
       * Dynamic token.
       */
      token:
        developmentToken,
    };

    /**
     * Save authentication session.
     *
     * The token is stored here so api.ts
     * can attach it to every authenticated
     * API request.
     */
    await StorageAdapter.setAuthSession({
      phone:
        user.phone,

      name:
        user.name,

      email:
        user.email,

      location:
        user.location,

      pin:
        user.pin,

      role:
        user.role,

      completedOnboarding:
        user.completedOnboarding,

      token:
        user.token,
    });

    console.log(
      '[AUTH] User authenticated:',
      {
        phone: user.phone,
        role: user.role,
        token: user.token,
      },
    );

    /**
     * Sync basic user information
     * with backend.
     *
     * This is best-effort.
     */
    ApiAdapter.saveUser({
      phone:
        user.phone,

      name:
        user.name,

      email:
        user.email,

      location:
        user.location,

      role:
        user.role,

      onboardingComplete:
        user.completedOnboarding,
    }).catch((err) => {
      console.warn(
        '[AuthAdapter] Backend sync note:',
        err,
      );
    });

    return user;
  }

  /**
   * Sign out.
   */
  async signOut(): Promise<void> {
    await StorageAdapter.clearAuthSession();
  }

  /**
   * Restore current logged-in user.
   */
  async getCurrentUser(): Promise<AuthUser | null> {

    const session =
      await StorageAdapter.getAuthSession();

    if (!session) {
      return null;
    }

    /**
     * If an old session does not have a token,
     * create the correct dynamic development
     * token from its phone number.
     */
    const cleanPhone =
      this.cleanPhone(session.phone);

    this.validatePhone(cleanPhone);

    const token =
      session.token ||
      `dev:${cleanPhone}`;

    /**
     * If token was missing in an old session,
     * save the repaired session.
     */
    if (!session.token) {
      await StorageAdapter.setAuthSession({
        ...session,
        phone: cleanPhone,
        token,
      });
    }

    return {
      uid:
        `dev-uid-${cleanPhone}`,

      phone:
        cleanPhone,

      name:
        session.name,

      email:
        session.email || '',

      location:
        session.location ||
        'Andhra Pradesh, India',

      pin:
        session.pin || '',

      role:
        session.role,

      completedOnboarding:
        session.completedOnboarding,

      token,
    };
  }
}

/**
 * Development Authentication Mode
 *
 * Keep true while testing with Expo Go.
 */
export const DEV_AUTH_ENABLED =
  true;

/**
 * Application Authentication Provider.
 */
export const AuthAdapter:
  IAuthProvider =
    new DevAuthProvider();
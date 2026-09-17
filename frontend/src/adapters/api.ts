import {
  NativeModules,
  Platform,
} from 'react-native';

import { StorageAdapter } from './storage';
import { fetch as expoFetch } from 'expo/fetch';
import { File } from 'expo-file-system';

/**
 * Mobile API Adapter
 *
 * Expo Go compatible.
 *
 * Authentication uses the local development
 * session stored by StorageAdapter.
 *
 * Voice architecture:
 *
 * Expo Audio Recorder
 *        ↓
 * Backend /speech-to-text
 *        ↓
 * Sarvam AI
 *        ↓
 * Transcript
 *        ↓
 * Gemini Assistant
 *        ↓
 * Expo Speech
 */

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * AI requests may take longer than normal API requests.
 */
const AI_TIMEOUT_MS = 30000;

const GET_CACHE_TTL_MS = 30_000;

/**
 * GET endpoints safe for short cache
 */
const CACHEABLE_GETS = new Set([
  '/products',
  '/inquiries',
]);

interface RequestOptions extends RequestInit {
  /**
   * Request timeout
   */
  timeoutMs?: number;

  /**
   * Ignore cache
   */
  forceRefresh?: boolean;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

const getCache =
  new Map<string, CacheEntry>();

/**
 * Get computer LAN IP from Expo Metro URL.
 *
 * Example:
 *
 * Metro:
 * http://192.168.1.10:8081
 *
 * Backend:
 * http://192.168.1.10:3000
 */
function getDevHostFromScriptUrl(): string | null {
  try {
    const scriptURL =
      (NativeModules as any)
        .SourceCode?.scriptURL;

    if (
      typeof scriptURL !== 'string' ||
      !scriptURL.trim()
    ) {
      return null;
    }

    const match =
      /^(?:https?|exp|exps):\/\/([^/:]+)/i.exec(
        scriptURL.trim()
      );

    return match?.[1] || null;
  } catch {
    return null;
  }
}

/**
 * Normalize an API URL supplied through Expo
 * environment variables.
 *
 * Accepted:
 *
 * http://192.168.1.10:3000
 *
 * http://192.168.1.10:3000/api
 *
 * http://192.168.1.10:3000/api/v1
 *
 * https://api.example.com/api
 */
function normalizeApiBaseUrl(
  value: string
): string {
  const trimmed =
    value.trim().replace(/\/+$/, '');

  if (
    /\/api(?:\/v1)?$/i.test(trimmed)
  ) {
    return trimmed;
  }

  return `${trimmed}/api`;
}

/**
 * API Base URL
 *
 * Priority:
 *
 * 1. EXPO_PUBLIC_API_BASE_URL
 * 2. Expo Go / Metro LAN host
 * 3. Android emulator
 * 4. localhost
 *
 * IMPORTANT:
 *
 * If EXPO_PUBLIC_API_BASE_URL points to
 * localhost while using a physical phone,
 * automatically prefer the Metro LAN host.
 */
function getDefaultApiBaseUrl(): string {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL;

  const devHost =
    getDevHostFromScriptUrl();

  /**
   * Physical device fix:
   *
   * If .env accidentally contains localhost,
   * use the computer's LAN IP from Expo Metro.
   */
  if (
    configured?.trim()
  ) {
    const normalized =
      normalizeApiBaseUrl(configured);

    const isLocalhost =
      /\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(
        normalized
      );

    if (
      isLocalhost &&
      devHost
    ) {
      return `http://${devHost}:3000/api`;
    }

    return normalized;
  }

  /**
   * Expo Go / physical device
   */
  if (devHost) {
    return `http://${devHost}:3000/api`;
  }

  /**
   * Android emulator
   */
  if (
    Platform.OS === 'android'
  ) {
    return 'http://10.0.2.2:3000/api';
  }

  /**
   * iOS simulator / fallback
   */
  return 'http://localhost:3000/api';
}

/**
 * Main API URL
 */
export const API_BASE_URL =
  getDefaultApiBaseUrl();

console.log(
  '[API] Base URL:',
  API_BASE_URL
);

/**
 * Get Authentication Token
 *
 * Uses the local development session.
 */
async function getAuthToken():
  Promise<string | undefined> {
  const session =
    await StorageAdapter
      .getAuthSession();

  return session?.token;
}

/**
 * Clear related GET cache
 * after mutation.
 */
function invalidateGetCache(
  endpoint: string
): void {
  if (
    endpoint.startsWith(
      '/products'
    )
  ) {
    getCache.delete(
      'GET:/products'
    );
  }

  if (
    endpoint.startsWith(
      '/inquiries'
    )
  ) {
    getCache.delete(
      'GET:/inquiries'
    );
  }
}

/**
 * Main API request function
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs =
      DEFAULT_TIMEOUT_MS,

    forceRefresh =
      false,

    ...init
  } = options;

  const url =
    `${API_BASE_URL}${
      endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`
    }`;

  const method =
    init.method ||
    'GET';

  /**
   * Cache GET requests
   */
  const cacheKey =
    `${method}:${endpoint}`;

  if (
    method === 'GET' &&
    !forceRefresh &&
    CACHEABLE_GETS.has(
      endpoint
    )
  ) {
    const cached =
      getCache.get(
        cacheKey
      );

    if (
      cached &&
      cached.expiresAt >
        Date.now()
    ) {
      return cached.value as T;
    }
  }

  /**
   * Detect FormData
   *
   * IMPORTANT:
   * Do not manually set Content-Type for
   * multipart FormData.
   *
   * The runtime adds the correct boundary.
   */
  const isFormData =
    typeof FormData !==
      'undefined' &&
    init.body instanceof
      FormData;

  /**
   * Headers
   */
  const headers:
    Record<string, string> = {
    Accept:
      'application/json',

    ...(
      (
        options.headers ||
        {}
      ) as Record<
        string,
        string
      >
    ),
  };

  /**
   * JSON requests
   */
  if (!isFormData) {
    headers[
      'Content-Type'
    ] =
      'application/json';
  }

  /**
   * Authentication
   */
  const token =
    await getAuthToken();

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  /**
   * Abort controller
   */
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs
    );

  try {
    /**
     * Send request
     */
    const response =
      await fetch(
        url,
        {
          ...init,
          headers,
          signal:
            controller.signal,
        }
      );

    /**
     * API error
     */
    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `API Error ` +
        `[${response.status}] ` +
        `${response.statusText}: ` +
        errorText
      );
    }

    /**
     * Parse response
     */
    const json =
      (await response.json()) as T;

    /**
     * Save GET cache
     */
    if (
      method === 'GET' &&
      CACHEABLE_GETS.has(
        endpoint
      )
    ) {
      getCache.set(
        cacheKey,
        {
          expiresAt:
            Date.now() +
            GET_CACHE_TTL_MS,

          value:
            json,
        }
      );
    }

    /**
     * Invalidate cache
     */
    if (
      method !== 'GET'
    ) {
      invalidateGetCache(
        endpoint
      );
    }

    return json;

  } catch (err) {

    if (
      err instanceof Error &&
      err.name ===
        'AbortError'
    ) {
      throw new Error(
        `Request timed out after ` +
        `${timeoutMs}ms. ` +
        `Could not reach API at ` +
        `${API_BASE_URL}`
      );
    }

    throw err;

  } finally {
    clearTimeout(
      timer
    );
  }
}

/**
 * Craft Mastery API
 */
export const ApiAdapter = {

  // ---------------------------------
  // System Health
  // ---------------------------------

  async checkHealth():
    Promise<{
      status: string;
      service: string;
      hasGeminiKey: boolean;
    }> {

    return request(
      '/health'
    );
  },

  async getServicesStatus():
    Promise<any> {

    return request(
      '/services/status'
    );
  },

  // ---------------------------------
  // Products
  // ---------------------------------

  async getProducts(
    forceRefresh =
      false
  ): Promise<any[]> {

    const data =
      await request<any>(
        '/products',
        {
          forceRefresh,
        }
      );

    return Array.isArray(data)
      ? data
      : data?.products || [];
  },

  async createProduct(
    product: any
  ): Promise<any> {

    return request(
      '/products',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            product
          ),
      }
    );
  },

  // ---------------------------------
  // Inquiries
  // ---------------------------------

  async getInquiries(
    forceRefresh =
      false
  ): Promise<any[]> {

    const data =
      await request<any>(
        '/inquiries',
        {
          forceRefresh,
        }
      );

    return Array.isArray(data)
      ? data
      : data?.inquiries || [];
  },

  async createInquiry(
    inquiry: any
  ): Promise<any> {

    return request(
      '/inquiries',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            inquiry
          ),
      }
    );
  },

  async replyToInquiry(
    inquiryId: string,

    replyData: {
      senderRole: string;
      senderName: string;
      originalText: string;
      originalLang: string;
    }

  ): Promise<any> {

    return request(
      `/inquiries/${inquiryId}/reply`,
      {
        method:
          'POST',

        body:
          JSON.stringify(
            replyData
          ),
      }
    );
  },

  // ---------------------------------
  // Users
  // ---------------------------------

  async getUser(
    phone: string
  ): Promise<any> {

    return request(
      `/users/${phone}`
    );
  },

  async saveUser(
    userData: any
  ): Promise<any> {

    return request(
      '/users',
      {
        method:
          'POST',

        body:
          JSON.stringify(
            userData
          ),
      }
    );
  },

  // ---------------------------------
  // Speech To Text
  // ---------------------------------

  /**
   * Upload recorded audio to backend.
   *
   * Backend:
   *
   * /api/speech-to-text
   *
   * or
   *
   * /api/public/speech-to-text
   *
   * Backend then sends the audio to Sarvam AI.
   */
  async transcribeAudio(
    audioUri: string,
    language: string
  ): Promise<{
    transcript: string;
    language?: string;
    provider?: string;
  }> {

    try {

      if (!audioUri) {
        throw new Error(
          'No audio file was provided.'
        );
      }

      console.log(
        '[Speech] Recording URI:',
        audioUri
      );

      /**
       * Expo SDK 57 FileSystem File API.
       *
       * IMPORTANT:
       * File is imported from expo-file-system.
       *
       * Expo File is already Blob-compatible,
       * so we do NOT use file.blob().
       */
      const file =
        new File(audioUri);

      /**
       * Check that the file exists.
       */
      if (!file.exists) {
        throw new Error(
          'The recorded audio file does not exist.'
        );
      }

      /**
       * Check file size.
       *
       * Expo File is Blob-compatible,
       * so size is available directly.
       */
      if (!file.size) {
        throw new Error(
          'The recorded audio file is empty.'
        );
      }

      console.log(
        '[Speech] Audio size:',
        file.size
      );

      /**
       * Determine MIME type.
       */
      const lowerUri =
        audioUri.toLowerCase();

      const mimeType =
        file.type ||
        (
          lowerUri.endsWith('.m4a')
            ? 'audio/mp4'
            : lowerUri.endsWith('.wav')
              ? 'audio/wav'
              : lowerUri.endsWith('.mp3')
                ? 'audio/mpeg'
                : lowerUri.endsWith('.webm')
                  ? 'audio/webm'
                  : 'audio/mp4'
        );

      console.log(
        '[Speech] Audio MIME type:',
        mimeType
      );

      /**
       * FormData
       */
      const formData =
        new FormData();

      /**
       * Audio field expected by backend.
       *
       * Expo File is already a Blob,
       * therefore it can be appended directly.
       */
      formData.append(
        'audio',
        file,
        file.name || 'voice-note.m4a'
      );

      /**
       * Language selected by user.
       *
       * Examples:
       *
       * te
       * te-IN
       * Telugu
       * hi
       * en
       */
      formData.append(
        'language',
        language || 'en'
      );

      /**
       * Authentication token.
       */
      const token =
        await getAuthToken();

      /**
       * Global voice assistant works
       * before and after login.
       */
      const endpoint =
        `${API_BASE_URL}/${
          token
            ? 'speech-to-text'
            : 'public/speech-to-text'
        }`;

      console.log(
        '[Speech] Sending audio to:',
        endpoint
      );

      /**
       * IMPORTANT:
       *
       * Do NOT manually add
       * Content-Type: multipart/form-data.
       *
       * The runtime must generate the
       * multipart boundary automatically.
       */
      const response =
        await expoFetch(
          endpoint,
          {
            method:
              'POST',

            headers: {
              Accept:
                'application/json',

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body:
              formData,
          }
        );

      const responseText =
        await response.text();

      let data: any;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};

      } catch {
        data = {
          error:
            responseText ||
            'Unknown server response',
        };
      }

      console.log(
        '[Speech] Server status:',
        response.status
      );

      console.log(
        '[Speech] Server response:',
        data
      );

      /**
       * Handle server error.
       */
      if (!response.ok) {

        const errorMessage =
          data?.message ||
          data?.error ||
          data?.details ||
          `Speech-to-text failed with HTTP ${response.status}`;

        throw new Error(
          errorMessage
        );
      }

      /**
       * Extract transcript.
       */
      const transcript =
        typeof data?.transcript ===
          'string'
          ? data.transcript.trim()
          : '';

      if (!transcript) {
        console.warn(
          '[Speech] Server returned an empty transcript.'
        );
      }

      return {
        transcript,

        language:
          data?.language ||
          data?.language_code ||
          language,

        provider:
          data?.provider ||
          'sarvam',
      };

    } catch (error: any) {

      console.error(
        '[Speech] Error:',
        error
      );

      throw error instanceof Error
        ? error
        : new Error(
            String(
              error ||
              'Speech transcription failed'
            )
          );
    }
  },

  // ---------------------------------
  // Global Voice Assistant
  // ---------------------------------

  /**
   * Send transcript to Gemini assistant.
   */
  async askVoiceAssistant(
    message: string,

    language: string,

    role: string =
      'GUEST',

    screen: string =
      'current screen'

  ): Promise<{
    answer: string;
    language: string;
  }> {

    return request(
      '/public/assistant',
      {
        method:
          'POST',

        timeoutMs:
          30_000,

        body:
          JSON.stringify({
            message,
            language,
            role,
            screen,
          }),
      }
    );
  },

  // ---------------------------------
  // AI Craft Photo Enhancement
  // ---------------------------------

  async enhanceCraftImage(
    imageDataUrl: string,

    language: string

  ): Promise<{
    enhancedImageDataUrl: string;
    provider: string;
  }> {

    return request(
      '/ai/enhance-image',
      {
        method:
          'POST',

        timeoutMs:
          60_000,

        body:
          JSON.stringify({
            imageDataUrl,
            language,
          }),
      }
    );
  },

  // ---------------------------------
  // AI Services
  // ---------------------------------

  async extractCraftInfo(
    transcript: string,

    language: string,

    conversationHistory:
      any[] = []

  ): Promise<any> {

    return request(
      '/ai/extract-info',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            transcript,
            language,
            conversationHistory,
          }),
      }
    );
  },

  async generateDescription(
    productData: any,

    artisanLanguage:
      string,

    targetLanguage:
      string

  ): Promise<any> {

    return request(
      '/ai/generate-description',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            productData,
            artisanLanguage,
            targetLanguage,
          }),
      }
    );
  },

  async getPricingRecommendation(
    productData: any,

    language: string

  ): Promise<any> {

    return request(
      '/ai/pricing-recommendation',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            productData,
            language,
          }),
      }
    );
  },

  async translateText(
    text: string,

    fromLang: string,

    toLang: string

  ): Promise<{
    translatedText: string;
    fromLang: string;
    toLang: string;
  }> {

    return request(
      '/ai/translate',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            text,
            fromLang,
            toLang,
          }),
      }
    );
  },

  async customerSearch(
    query: string,

    language: string

  ): Promise<any> {

    return request(
      '/ai/customer-search',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            query,
            language,
          }),
      }
    );
  },

  async getOrderGuidance(
    question: string,

    product: any,

    language: string

  ): Promise<any> {

    return request(
      '/ai/order-guidance',
      {
        method:
          'POST',

        timeoutMs:
          AI_TIMEOUT_MS,

        body:
          JSON.stringify({
            question,
            product,
            language,
          }),
      }
    );
  },
};
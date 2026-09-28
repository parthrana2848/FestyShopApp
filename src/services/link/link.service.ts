import { Linking } from 'react-native';
import { LINK_CONSTANTS } from '../../constants/link.constants';
import type { LinkValidationResult } from '../../types/link.types';

/**
 * Validates URL format and protocol safety.
 * @param url - Raw URL string
 * @returns Validation result
 */
export const validateUrl = (url: string): LinkValidationResult => {
  try {
    const trimmed = url.trim();

    if (!trimmed || trimmed.length < LINK_CONSTANTS.MIN_URL_LENGTH) {
      return {
        isValid: false,
        error: 'URL is too short',
      };
    }

    if (trimmed.length > LINK_CONSTANTS.MAX_URL_LENGTH) {
      return {
        isValid: false,
        error: 'URL is too long',
      };
    }

    // For mailto links, special handling
    if (trimmed.startsWith('mailto:')) {
      const email = trimmed.replace('mailto:', '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          isValid: false,
          error: 'Invalid email format',
        };
      }
      return { isValid: true };
    }

    // Reject javascript: and other unsafe protocols
    if (trimmed.includes('javascript:') || trimmed.includes('data:') || trimmed.includes('vbscript:')) {
      return {
        isValid: false,
        error: 'Unsafe URL protocol',
      };
    }

    // Parse URL to validate protocol
    const normalized = trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(normalized);

    if (!LINK_CONSTANTS.SAFE_PROTOCOLS.includes(parsed.protocol)) {
      return {
        isValid: false,
        error: `Unsupported protocol: ${parsed.protocol}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
};

/**
 * Sanitizes URL by trimming whitespace.
 * @param url - Raw URL string
 * @returns Sanitized URL
 */
export const sanitizeUrl = (url: string): string => {
  return url.trim();
};

/**
 * Formats URL for opening - adds https:// if no protocol specified.
 * @param url - Raw or sanitized URL
 * @returns Formatted URL
 */
export const formatUrlForOpening = (url: string): string => {
  const sanitized = sanitizeUrl(url);

  // Already has protocol
  if (sanitized.match(/^[a-z]+:\/\//i) || sanitized.startsWith('mailto:')) {
    return sanitized;
  }

  // Add https:// for web URLs
  return `https://${sanitized}`;
};

/**
 * Opens URL safely using React Native Linking.
 * @param url - URL to open
 * @throws Error if URL is invalid or cannot be opened
 */
export const openSafeUrl = async (url: string): Promise<void> => {
  // Validate first
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid URL');
  }

  const formatted = formatUrlForOpening(url);

  try {
    // 1. Try checking support cleanly first
    const supported = await Linking.canOpenURL(formatted);
    
    if (supported) {
      await Linking.openURL(formatted);
      return;
    }

    // 2. FALLBACK: canOpenURL often falsely reports false on standard http/https links 
    // in simulators. If it's a web URL, attempt to open it directly anyway.
    if (formatted.startsWith('http://') || formatted.startsWith('https://')) {
      console.warn(`canOpenURL returned false for ${formatted}, attempting direct bypass open.`);
      await Linking.openURL(formatted);
    } else {
      throw new Error(`Device configuration lacks handler application for: ${formatted}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to open URL: ${error.message}`);
  }
};

/**
 * Formats title for display - truncates if too long.
 * @param title - Raw title
 * @returns Formatted title
 */
export const formatLinkTitle = (title: string): string => {
  const trimmed = title.trim();
  if (trimmed.length > LINK_CONSTANTS.MAX_TITLE_LENGTH) {
    return trimmed.substring(0, LINK_CONSTANTS.MAX_TITLE_LENGTH - 3) + '...';
  }
  return trimmed;
};

/**
 * Extracts domain from URL for default title.
 * @param url - URL to extract from
 * @returns Domain name
 */
export const extractDomainFromUrl = (url: string): string => {
  try {
    const formatted = formatUrlForOpening(url);
    if (formatted.startsWith('mailto:')) {
      return formatted.replace('mailto:', '');
    }

    const parsed = new URL(formatted);
    return parsed.hostname || 'Link';
  } catch {
    return 'Link';
  }
};

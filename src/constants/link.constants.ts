/**
 * Constants for Link Sticker feature.
 */

export const LINK_CONSTANTS = {
  MAX_LINKS_PER_STORY: 5,
  DEFAULT_TITLE_LENGTH: 20,
  MAX_TITLE_LENGTH: 30,
  MIN_URL_LENGTH: 10,
  MAX_URL_LENGTH: 2048,
  
  // Default position for new link stickers
  DEFAULT_X_OFFSET: -80,
  DEFAULT_Y_OFFSET: -15,
  
  // Default styling
  DEFAULT_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.6)',
  DEFAULT_TEXT_COLOR: '#FFFFFF',
  DEFAULT_FONT_SIZE: 14,
  
  // Safe protocols for URL validation
  SAFE_PROTOCOLS: ['http:', 'https:', 'myapp:', 'instagram:', 'whatsapp:', 'facebook:', 'twitter:', 'mailto:'],
};

export const LINK_STICKER_ID_PREFIX = 'link_sticker_';

/**
 * Centralized GIF Constants for Story Editor stickers.
 */
export const GIF_CONSTANTS = {
  /** Maximum number of active GIF stickers allowed on a single story card. */
  MAX_GIFS_PER_STORY: 5,
  
  /** GIF file size limit in bytes (e.g. 10MB) for resource budget and performance. */
  GIF_SIZE_LIMIT: 10 * 1024 * 1024,
  
  /** Lightweight GIPHY search API key placeholder or standard demo/development key. */
  GIPHY_API_KEY: 'dc6zaTOxFJmzC', // standard public beta API key for developer testing
  
  /** Number of grid columns for rendering sticker searches and trending lists. */
  GIF_GRID_COLUMNS: 3,

  /** Pagination size for loading page offsets. */
  GIF_PAGE_LIMIT: 24,
};

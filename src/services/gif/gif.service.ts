import axios from 'axios';
import { GIF_CONSTANTS } from '../../constants/gif.constants';
import { NormalizedGif } from '../../types/gif.types';

// Curated collection of high-quality premium transparent stickers for fallback
const CURATED_FALLBACK_STICKERS: NormalizedGif[] = [
  {
    id: 'fallback_stars',
    title: 'Golden Sparkle Stars',
    previewUrl: 'https://media.giphy.com/media/L2K83vK38b1E0L6q2A/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/L2K83vK38b1E0L6q2A/giphy.gif',
  },
  {
    id: 'fallback_crown',
    title: 'Neon Sparkly Crown',
    previewUrl: 'https://media.giphy.com/media/l0ExhcN0Yg3T4K86I/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/l0ExhcN0Yg3T4K86I/giphy.gif',
  },
  {
    id: 'fallback_fire',
    title: 'Aesthetic Fire Sticker',
    previewUrl: 'https://media.giphy.com/media/l0Exvqg6cILFwQZp6/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/l0Exvqg6cILFwQZp6/giphy.gif',
  },
  {
    id: 'fallback_heart',
    title: 'Cute Rotating Heart',
    previewUrl: 'https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3ornk57KwDXf81rjWM/giphy.gif',
  },
  {
    id: 'fallback_yay',
    title: 'Pastel Yay Text',
    previewUrl: 'https://media.giphy.com/media/3ornk58mS6Qx12pLq0/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3ornk58mS6Qx12pLq0/giphy.gif',
  },
  {
    id: 'fallback_dance',
    title: 'Happy Dance Puppy',
    previewUrl: 'https://media.giphy.com/media/3o7TKoWXm3okO1kgdW/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKoWXm3okO1kgdW/giphy.gif',
  },
  {
    id: 'fallback_love',
    title: 'Neon Love Sticker',
    previewUrl: 'https://media.giphy.com/media/l0Ex1P54sEprP2YmY/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/l0Ex1P54sEprP2YmY/giphy.gif',
  },
  {
    id: 'fallback_cool',
    title: 'Pixel Cool Sunglasses',
    previewUrl: 'https://media.giphy.com/media/3o7TKoH44O13e9v6hy/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKoH44O13e9v6hy/giphy.gif',
  },
  {
    id: 'fallback_party',
    title: 'Party Popper Confetti',
    previewUrl: 'https://media.giphy.com/media/3o7TKSjD5mIqqR2Z20/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKSjD5mIqqR2Z20/giphy.gif',
  },
  {
    id: 'fallback_cry',
    title: 'Cute Tears Emoji',
    previewUrl: 'https://media.giphy.com/media/3o7TKoE5STh3Wp07kI/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKoE5STh3Wp07kI/giphy.gif',
  },
  {
    id: 'fallback_cat',
    title: 'Kawaii Neko Cat Wave',
    previewUrl: 'https://media.giphy.com/media/3o7TKum3elGdznRU9a/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKum3elGdznRU9a/giphy.gif',
  },
  {
    id: 'fallback_star_trail',
    title: 'Magical Star Trail',
    previewUrl: 'https://media.giphy.com/media/3o7TKo7MuP9o1vJg7a/giphy.gif',
    stickerUrl: 'https://media.giphy.com/media/3o7TKo7MuP9o1vJg7a/giphy.gif',
  },
];

/**
 * Normalizes a raw GIPHY API response object.
 * Returns only optimized URLs to conserve device memory:
 * - fixed_width_small.url for grid thumbnail previews
 * - downsized_medium.url for actual interactive stickers
 */
const normalizeGiphyResponse = (rawGifs: any[]): NormalizedGif[] => {
  return rawGifs.map((item: any) => {
    const previewUrl = item.images?.fixed_width_small?.url || item.images?.fixed_width?.url || item.embed_url;
    const stickerUrl = item.images?.downsized_medium?.url || item.images?.fixed_width?.url || item.embed_url;
    return {
      id: item.id || Math.random().toString(),
      title: item.title || 'Giphy Sticker',
      // Convert http to https to ensure iOS secure resource compliance
      previewUrl: previewUrl?.replace('http://', 'https://'),
      stickerUrl: stickerUrl?.replace('http://', 'https://'),
    };
  });
};

/**
 * Service to manage REST API requests for GIPHY stickers
 */
export const gifService = {
  /**
   * Fetches trending stickers from GIPHY
   * Falls back to a curated collection in case of failure or offline state
   */
  fetchTrending: async (offset = 0, limit = GIF_CONSTANTS.GIF_PAGE_LIMIT): Promise<NormalizedGif[]> => {
    try {
      const response = await axios.get('https://api.giphy.com/v1/stickers/trending', {
        params: {
          api_key: GIF_CONSTANTS.GIPHY_API_KEY,
          limit,
          offset,
          rating: 'g',
        },
        timeout: 4000, // aggressive timeout to transition to fallback quickly
      });

      if (response.data?.data && response.data.data.length > 0) {
        return normalizeGiphyResponse(response.data.data);
      }
      return CURATED_FALLBACK_STICKERS.slice(offset, offset + limit);
    } catch (error) {
      console.warn('Giphy API Trending failed, using curated fallbacks:', error);
      return CURATED_FALLBACK_STICKERS.slice(offset, offset + limit);
    }
  },

  /**
   * Performs sticker search queries on GIPHY
   * Falls back to filtered local collection if offline
   */
  searchGifs: async (query: string, offset = 0, limit = GIF_CONSTANTS.GIF_PAGE_LIMIT): Promise<NormalizedGif[]> => {
    if (!query || query.trim() === '') {
      return gifService.fetchTrending(offset, limit);
    }

    try {
      const response = await axios.get('https://api.giphy.com/v1/stickers/search', {
        params: {
          api_key: GIF_CONSTANTS.GIPHY_API_KEY,
          q: query,
          limit,
          offset,
          rating: 'g',
          lang: 'en',
        },
        timeout: 4000,
      });

      if (response.data?.data && response.data.data.length > 0) {
        return normalizeGiphyResponse(response.data.data);
      }
      
      // Fallback filter
      const filtered = CURATED_FALLBACK_STICKERS.filter(
        item => item.title?.toLowerCase().includes(query.toLowerCase())
      );
      return filtered.slice(offset, offset + limit);
    } catch (error) {
      console.warn(`Giphy API Search failed for query: "${query}", using fallbacks:`, error);
      const filtered = CURATED_FALLBACK_STICKERS.filter(
        item => item.title?.toLowerCase().includes(query.toLowerCase())
      );
      return filtered.slice(offset, offset + limit);
    }
  },
};

export const FAB_SIZE = 56;
export const FAB_MARGIN = 24;
export const FAB_BORDER_RADIUS = FAB_SIZE / 2;
export const FAB_ELEVATION = 6;
export const FAB_Z_INDEX = 1000;

export const MENU_ITEM_HEIGHT = 48;
export const MENU_ITEM_SPACING = 12;
export const MENU_MAX_WIDTH = 320;

// Reduced default backdrop opacity so underlying UI remains visible while still
// blocking interactions. Tuned for better contrast with white menu items.
// Backdrop opacity: 1 means fully opaque background (background content not visible).
// Set to 1 per design requirement to hide background when menu is open.
export const BACKDROP_OPACITY = 1;

export const ANIMATION_DURATION = 200;
export const ANIMATION_SCALE_OPEN = 1;
export const ANIMATION_SCALE_CLOSED = 0.9;
export const ANIMATION_TRANSLATE_Y = 12; // px to translate per item when opening

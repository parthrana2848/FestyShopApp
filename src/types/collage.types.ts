export interface CollageSlot {
  id: string;
  x: number;      // percentage x coordinate (0 - 100)
  y: number;      // percentage y coordinate (0 - 100)
  width: number;  // percentage width (0 - 100)
  height: number; // percentage height (0 - 100)
}

export interface CollageLayout {
  id: string;
  name: string;
  slots: CollageSlot[];
}

export interface CollageImage {
  id: string;
  uri: string;
}

export type CollageRatio = '9:16' | '1:1';

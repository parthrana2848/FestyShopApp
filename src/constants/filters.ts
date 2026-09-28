export type FilterType = 'Normal' | 'Sepia' | 'Grayscale' | 'Vintage' | 'Cool' | 'Warm' | 'HighContrast';

export interface FilterDefinition {
  id: FilterType;
  label: string;
  matrix: number[];
}

export const FILTERS: FilterDefinition[] = [
  {
    id: 'Normal',
    label: 'Normal',
    matrix: [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'Sepia',
    label: 'Sepia',
    matrix: [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'Grayscale',
    label: 'Grayscale',
    matrix: [
      0.299, 0.299, 0.299, 0, 0,
      0.587, 0.587, 0.587, 0, 0,
      0.114, 0.114, 0.114, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'Vintage',
    label: 'Vintage',
    matrix: [
      0.70, 0.30, 0, 0, 0,
      0, 0.60, 0.10, 0, 0,
      0, 0.10, 0.50, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'Cool',
    label: 'Cool',
    matrix: [
      0.6, 0, 0, 0, 0,
      0, 0.8, 0, 0, 0,
      0, 0, 1.2, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'Warm',
    label: 'Warm',
    matrix: [
      1.2, 0, 0, 0, 0,
      0, 0.8, 0, 0, 0,
      0, 0, 0.6, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'HighContrast',
    label: 'High Contrast',
    matrix: [
      1.5, 0, 0, 0, -0.25,
      0, 1.5, 0, 0, -0.25,
      0, 0, 1.5, 0, -0.25,
      0, 0, 0, 1, 0,
    ],
  },
];

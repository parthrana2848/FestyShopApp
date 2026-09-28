import { CollageLayout } from '../../types/collage.types';

export const COLLAGE_LAYOUTS: Record<number, CollageLayout[]> = {
  1: [
    {
      id: 'layout_1_full',
      name: 'Full Screen',
      slots: [
        { id: 'slot_1_1', x: 0, y: 0, width: 100, height: 100 }
      ]
    }
  ],
  2: [
    {
      id: 'layout_2_v',
      name: '2 Columns',
      slots: [
        { id: 'slot_2_1', x: 0, y: 0, width: 50, height: 100 },
        { id: 'slot_2_2', x: 50, y: 0, width: 50, height: 100 }
      ]
    },
    {
      id: 'layout_2_h',
      name: '2 Rows',
      slots: [
        { id: 'slot_2_3', x: 0, y: 0, width: 100, height: 50 },
        { id: 'slot_2_4', x: 0, y: 50, width: 100, height: 50 }
      ]
    }
  ],
  3: [
    {
      id: 'layout_3_grid',
      name: '3 Grid (T)',
      slots: [
        { id: 'slot_3_1', x: 0, y: 0, width: 100, height: 50 },
        { id: 'slot_3_2', x: 0, y: 50, width: 50, height: 50 },
        { id: 'slot_3_3', x: 50, y: 50, width: 50, height: 50 }
      ]
    },
    {
      id: 'layout_3_v',
      name: '3 Columns',
      slots: [
        { id: 'slot_3_4', x: 0, y: 0, width: 33.33, height: 100 },
        { id: 'slot_3_5', x: 33.33, y: 0, width: 33.34, height: 100 },
        { id: 'slot_3_6', x: 66.67, y: 0, width: 33.33, height: 100 }
      ]
    },
    {
      id: 'layout_3_h',
      name: '3 Rows',
      slots: [
        { id: 'slot_3_7', x: 0, y: 0, width: 100, height: 33.33 },
        { id: 'slot_3_8', x: 0, y: 33.33, width: 100, height: 33.34 },
        { id: 'slot_3_9', x: 0, y: 66.67, width: 100, height: 33.33 }
      ]
    }
  ],
  4: [
    {
      id: 'layout_4_grid',
      name: '2x2 Grid',
      slots: [
        { id: 'slot_4_1', x: 0, y: 0, width: 50, height: 50 },
        { id: 'slot_4_2', x: 50, y: 0, width: 50, height: 50 },
        { id: 'slot_4_3', x: 0, y: 50, width: 50, height: 50 },
        { id: 'slot_4_4', x: 50, y: 50, width: 50, height: 50 }
      ]
    },
    {
      id: 'layout_4_v',
      name: '4 Columns',
      slots: [
        { id: 'slot_4_5', x: 0, y: 0, width: 25, height: 100 },
        { id: 'slot_4_6', x: 25, y: 0, width: 25, height: 100 },
        { id: 'slot_4_7', x: 50, y: 0, width: 25, height: 100 },
        { id: 'slot_4_8', x: 75, y: 0, width: 25, height: 100 }
      ]
    },
    {
      id: 'layout_4_h',
      name: '4 Rows',
      slots: [
        { id: 'slot_4_9', x: 0, y: 0, width: 100, height: 25 },
        { id: 'slot_4_10', x: 0, y: 25, width: 100, height: 25 },
        { id: 'slot_4_11', x: 0, y: 50, width: 100, height: 25 },
        { id: 'slot_4_12', x: 0, y: 75, width: 100, height: 25 }
      ]
    }
  ],
  5: [
    {
      id: 'layout_5_left_large',
      name: 'Left Large',
      slots: [
        { id: 'slot_5_1', x: 0, y: 0, width: 50, height: 100 },
        { id: 'slot_5_2', x: 50, y: 0, width: 50, height: 25 },
        { id: 'slot_5_3', x: 50, y: 25, width: 50, height: 25 },
        { id: 'slot_5_4', x: 50, y: 50, width: 50, height: 25 },
        { id: 'slot_5_5', x: 50, y: 75, width: 50, height: 25 }
      ]
    },
    {
      id: 'layout_5_grid',
      name: 'Grid 2+3',
      slots: [
        { id: 'slot_5_6', x: 0, y: 0, width: 50, height: 50 },
        { id: 'slot_5_7', x: 50, y: 0, width: 50, height: 50 },
        { id: 'slot_5_8', x: 0, y: 50, width: 33.33, height: 50 },
        { id: 'slot_5_9', x: 33.33, y: 50, width: 33.34, height: 50 },
        { id: 'slot_5_10', x: 66.67, y: 50, width: 33.33, height: 50 }
      ]
    },
    {
      id: 'layout_5_h',
      name: '5 Rows',
      slots: [
        { id: 'slot_5_11', x: 0, y: 0, width: 100, height: 20 },
        { id: 'slot_5_12', x: 0, y: 20, width: 100, height: 20 },
        { id: 'slot_5_13', x: 0, y: 40, width: 100, height: 20 },
        { id: 'slot_5_14', x: 0, y: 60, width: 100, height: 20 },
        { id: 'slot_5_15', x: 0, y: 80, width: 100, height: 20 }
      ]
    }
  ]
};

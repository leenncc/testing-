import { Recipe } from './types';

export const MUSHROOM_TYPES = [
  'Oyster Mushrooms',
  'Shiitake',
  'Button Mushrooms',
  'Enoki'
];

export const RECIPES: Record<string, Recipe> = {
  'Spicy Chips': {
    id: 'r1',
    name: 'Spicy Fried Mushroom Chips',
    washFormula: (w) => Math.ceil(w * 0.5), // 0.5 min per kg
    waterFormula: (w) => Math.ceil(w * 2.5), // 2.5 L per kg
    dryTimeFormula: (w) => 30, // Fixed 30 mins for simplicity in prototype
    cookInstructions: [
      'Slice to 2mm thickness.',
      'Fry at 180°C for 5 mins.',
      'Season with Spicy Mix A.',
      'Cool down for 10 mins before QC.'
    ]
  },
  'Dried Shrooms': {
    id: 'r2',
    name: 'Classic Dried Mushrooms',
    washFormula: (w) => Math.ceil(w * 0.3),
    waterFormula: (w) => Math.ceil(w * 1.5),
    dryTimeFormula: (w) => 60,
    cookInstructions: [
      'Slice to 5mm thickness.',
      'Dehydrate at 60°C for 4 hours.',
      'Check moisture content < 10%.'
    ]
  }
};

export const INITIAL_INVENTORY = [
  { id: 'inv1', name: 'Packaging Tins', quantity: 45, unit: 'units', threshold: 50, status: 'Low Stock' },
  { id: 'inv2', name: 'QR Labels', quantity: 120, unit: 'units', threshold: 100, status: 'OK' },
  { id: 'inv3', name: 'Spicy Mix A', quantity: 5000, unit: 'g', threshold: 1000, status: 'OK' },
  { id: 'inv4', name: 'Cooking Oil', quantity: 20, unit: 'L', threshold: 10, status: 'OK' },
];
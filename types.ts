export enum BatchStatus {
  RECEIVED = 'Received',
  WASHING = 'Washing',
  DRYING = 'Drying',
  COOKING = 'Cooking',
  QC_PENDING = 'QC Pending',
  READY_TO_PACK = 'Ready to Pack',
  PACKED = 'Packed',
  COMPLETED = 'Completed'
}

export interface Batch {
  id: string;
  farmerName: string;
  farmId: string;
  receivedAt: Date;
  mushroomType: string;
  totalWeight: number; // kg
  spoiledWeight: number; // kg
  goodWeight: number; // kg
  status: BatchStatus;
  
  // Processing Data
  waterUsage?: number; // Liters
  washTime?: number; // Minutes
  dryingTime?: number; // Minutes
  recipe?: string;
  
  // QC Data
  qcStatus?: 'Pass' | 'Fail';
  qcNotes?: string;
  
  // Packing Data
  packedTins?: number;
  qrCode?: string;
  
  // Financials
  cost?: number;
  estimatedRevenue?: number;
  margin?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  status: 'OK' | 'Low Stock' | 'Critical';
}

export interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  timestamp: Date;
  resolved: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  washFormula: (weight: number) => number; // returns minutes
  waterFormula: (weight: number) => number; // returns liters
  dryTimeFormula: (weight: number) => number; // returns minutes
  cookInstructions: string[];
}
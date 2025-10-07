// DeFi vault storage interface
export interface IStorage {
  // Storage methods for DeFi vaults can be added here
  // Currently using in-memory data from data.ts
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();

import { Contractor, ScheduleEntry, Tag } from '@/types';

const STORAGE_KEYS = {
  CONTRACTORS: 'contractor-scheduler-contractors',
  SCHEDULE_ENTRIES: 'contractor-scheduler-schedule-entries',
  TAGS: 'contractor-scheduler-tags',
} as const;

// Generic storage functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

// Contractor-specific functions
export const saveContractors = (contractors: Contractor[]): void => {
  saveToStorage(STORAGE_KEYS.CONTRACTORS, contractors);
};

export const loadContractors = (defaultContractors: Contractor[]): Contractor[] => {
  const loaded = loadFromStorage(STORAGE_KEYS.CONTRACTORS, defaultContractors);
  
  // Convert date strings back to Date objects
  return loaded.map(contractor => ({
    ...contractor,
    createdAt: new Date(contractor.createdAt),
    updatedAt: new Date(contractor.updatedAt),
  }));
};

// Schedule entry-specific functions
export const saveScheduleEntries = (entries: ScheduleEntry[]): void => {
  saveToStorage(STORAGE_KEYS.SCHEDULE_ENTRIES, entries);
};

export const loadScheduleEntries = (defaultEntries: ScheduleEntry[]): ScheduleEntry[] => {
  const loaded = loadFromStorage(STORAGE_KEYS.SCHEDULE_ENTRIES, defaultEntries);
  
  // Convert date strings back to Date objects
  return loaded.map(entry => ({
    ...entry,
    startTime: new Date(entry.startTime),
    endTime: new Date(entry.endTime),
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
    recurringPattern: entry.recurringPattern ? {
      ...entry.recurringPattern,
      endDate: entry.recurringPattern.endDate ? new Date(entry.recurringPattern.endDate) : undefined,
    } : undefined,
  }));
};

// Tag-specific functions
export const saveTags = (tags: Tag[]): void => {
  saveToStorage(STORAGE_KEYS.TAGS, tags);
};

export const loadTags = (defaultTags: Tag[]): Tag[] => {
  return loadFromStorage(STORAGE_KEYS.TAGS, defaultTags);
};

// Clear all data (useful for testing)
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

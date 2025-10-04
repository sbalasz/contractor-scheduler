export interface Contractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  specialty: string;
  tags: string[];
  hourlyRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  estimatedDuration: number; // in hours
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  tags: string[];
  notes?: string;
  companyId?: string; // Link to Contractor/Company
  frequency?: {
    interval: number; // 1-10
    unit: 'day' | 'week' | 'month' | 'year';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleEntry {
  id: string;
  contractorId: string;
  jobId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  recurringPattern?: RecurringPattern;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: Date;
  occurrences?: number; // max number of occurrences
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface AnalyticsData {
  totalContractors: number;
  totalJobs: number;
  totalScheduledHours: number;
  completedJobs: number;
  pendingJobs: number;
  contractorsBySpecialty: { specialty: string; count: number }[];
  jobsByPriority: { priority: string; count: number }[];
  monthlyScheduleData: { month: string; hours: number }[];
}

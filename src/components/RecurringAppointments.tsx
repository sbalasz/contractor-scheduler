"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar as CalendarIcon, Repeat, Trash2, Edit, Play, Pause } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { ScheduleEntry, Contractor, Job } from '@/types';
import { toast } from 'sonner';

interface RecurringPattern {
  id: string;
  name: string;
  contractorId: string;
  jobId: string;
  startDate: Date;
  endDate?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  daysOfWeek?: number[]; // for weekly: 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number; // for monthly: 1-31
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringAppointmentsProps {
  contractors: Contractor[];
  jobs: Job[];
  scheduleEntries: ScheduleEntry[];
  onScheduleEntriesChange: (entries: ScheduleEntry[]) => void;
}

export default function RecurringAppointments({ 
  contractors, 
  jobs, 
  scheduleEntries, 
  onScheduleEntriesChange 
}: RecurringAppointmentsProps) {
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<RecurringPattern | null>(null);
  const [formData, setFormData] = useState<Partial<RecurringPattern>>({
    name: '',
    contractorId: '',
    jobId: '',
    startDate: new Date(),
    endDate: undefined,
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: 1,
    isActive: true,
  });

  // Load recurring patterns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recurring-patterns');
    if (saved) {
      const patterns = JSON.parse(saved).map((pattern: RecurringPattern & { startDate: string; endDate?: string; createdAt: string; updatedAt: string }) => ({
        ...pattern,
        startDate: new Date(pattern.startDate),
        endDate: pattern.endDate ? new Date(pattern.endDate) : undefined,
        createdAt: new Date(pattern.createdAt),
        updatedAt: new Date(pattern.updatedAt),
      }));
      setRecurringPatterns(patterns);
    }
  }, []);

  // Save recurring patterns to localStorage
  useEffect(() => {
    localStorage.setItem('recurring-patterns', JSON.stringify(recurringPatterns));
  }, [recurringPatterns]);

  // Generate appointments from recurring patterns
  const generateAppointments = (pattern: RecurringPattern, count: number = 10) => {
    const appointments: ScheduleEntry[] = [];
    let currentDate = new Date(pattern.startDate);
    const endDate = pattern.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    while (appointments.length < count && currentDate <= endDate) {
      // Check if this date matches the pattern
      let shouldInclude = false;

      switch (pattern.frequency) {
        case 'daily':
          shouldInclude = true;
          break;
        case 'weekly':
          shouldInclude = pattern.daysOfWeek?.includes(currentDate.getDay()) || false;
          break;
        case 'monthly':
          shouldInclude = currentDate.getDate() === (pattern.dayOfMonth || 1);
          break;
        case 'yearly':
          shouldInclude = currentDate.getMonth() === pattern.startDate.getMonth() && 
                         currentDate.getDate() === pattern.startDate.getDate();
          break;
      }

      if (shouldInclude) {
        const startTime = new Date(currentDate);
        startTime.setHours(9, 0, 0, 0); // Default to 9 AM
        const endTime = new Date(startTime);
        endTime.setHours(17, 0, 0, 0); // Default to 5 PM

        appointments.push({
          id: `${pattern.id}-${currentDate.getTime()}`,
          contractorId: pattern.contractorId,
          jobId: pattern.jobId,
          startTime: startTime,
          endTime: endTime,
          status: 'scheduled',
          notes: `Generated from recurring pattern: ${pattern.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Move to next interval
      switch (pattern.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, pattern.interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, pattern.interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, pattern.interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, pattern.interval);
          break;
      }
    }

    return appointments;
  };

  // Apply recurring patterns to schedule
  const applyRecurringPatterns = () => {
    const activePatterns = recurringPatterns.filter(p => p.isActive);
    const generatedAppointments: ScheduleEntry[] = [];

    activePatterns.forEach(pattern => {
      const appointments = generateAppointments(pattern, 20); // Generate next 20 appointments
      generatedAppointments.push(...appointments);
    });

    // Remove existing generated appointments and add new ones
    const filteredEntries = scheduleEntries.filter(entry => 
      !entry.notes?.includes('Generated from recurring pattern')
    );

    const updatedEntries = [...filteredEntries, ...generatedAppointments];
    onScheduleEntriesChange(updatedEntries);
    toast.success(`Generated ${generatedAppointments.length} recurring appointments`);
  };

  const handleSavePattern = () => {
    if (!formData.name || !formData.contractorId || !formData.jobId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const patternData: RecurringPattern = {
      id: editingPattern?.id || Date.now().toString(),
      name: formData.name!,
      contractorId: formData.contractorId!,
      jobId: formData.jobId!,
      startDate: formData.startDate!,
      endDate: formData.endDate,
      frequency: formData.frequency!,
      interval: formData.interval!,
      daysOfWeek: formData.daysOfWeek,
      dayOfMonth: formData.dayOfMonth,
      isActive: formData.isActive!,
      createdAt: editingPattern?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingPattern) {
      setRecurringPatterns(prev => 
        prev.map(p => p.id === editingPattern.id ? patternData : p)
      );
      toast.success('Recurring pattern updated');
    } else {
      setRecurringPatterns(prev => [...prev, patternData]);
      toast.success('Recurring pattern created');
    }

    setIsDialogOpen(false);
    setFormData({
      name: '',
      contractorId: '',
      jobId: '',
      startDate: new Date(),
      endDate: undefined,
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: 1,
      isActive: true,
    });
  };

  const handleDeletePattern = (patternId: string) => {
    setRecurringPatterns(prev => prev.filter(p => p.id !== patternId));
    toast.success('Recurring pattern deleted');
  };

  const togglePatternActive = (patternId: string) => {
    setRecurringPatterns(prev => 
      prev.map(p => p.id === patternId ? { ...p, isActive: !p.isActive } : p)
    );
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor?.company || 'Unknown Company';
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  const getFrequencyLabel = (pattern: RecurringPattern) => {
    const interval = pattern.interval > 1 ? `every ${pattern.interval} ` : 'every ';
    const frequency = pattern.frequency === 'daily' ? 'days' :
                     pattern.frequency === 'weekly' ? 'weeks' :
                     pattern.frequency === 'monthly' ? 'months' : 'years';
    return `${interval}${frequency}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Recurring Appointments</h2>
          <p className="text-gray-600">Manage recurring appointment patterns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={applyRecurringPatterns} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Generate Appointments
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pattern
          </Button>
        </div>
      </div>

      {/* Patterns List */}
      <div className="grid gap-4">
        {recurringPatterns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Repeat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No recurring patterns created yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first recurring appointment pattern to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          recurringPatterns.map((pattern) => (
            <Card key={pattern.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{pattern.name}</h3>
                      <Badge variant={pattern.isActive ? 'default' : 'secondary'}>
                        {pattern.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Company:</span> {getContractorName(pattern.contractorId)}
                      </div>
                      <div>
                        <span className="font-medium">Service:</span> {getJobTitle(pattern.jobId)}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {getFrequencyLabel(pattern)}
                      </div>
                      <div>
                        <span className="font-medium">Starts:</span> {format(pattern.startDate, 'MMM d, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Ends:</span> {pattern.endDate ? format(pattern.endDate, 'MMM d, yyyy') : 'No end date'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {format(pattern.createdAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePatternActive(pattern.id)}
                    >
                      {pattern.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPattern(pattern);
                        setFormData(pattern);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePattern(pattern.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Pattern Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPattern ? 'Edit Recurring Pattern' : 'Add Recurring Pattern'}
            </DialogTitle>
            <DialogDescription>
              {editingPattern ? 'Update the recurring pattern details' : 'Create a new recurring appointment pattern'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pattern-name">Pattern Name *</Label>
                <Input
                  id="pattern-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weekly Maintenance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor">Company *</Label>
                <Select
                  value={formData.contractorId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors.map(contractor => (
                      <SelectItem key={contractor.id} value={contractor.id}>
                        {contractor.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job">Service *</Label>
              <Select
                value={formData.jobId || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, jobId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Frequency Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={formData.frequency || 'weekly'}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Interval *</Label>
                <Select
                  value={formData.interval?.toString() || '1'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, interval: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        Every {num} {formData.frequency === 'daily' ? 'day(s)' :
                                 formData.frequency === 'weekly' ? 'week(s)' :
                                 formData.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekly Days Selection */}
            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 0, label: 'Sun' },
                    { value: 1, label: 'Mon' },
                    { value: 2, label: 'Tue' },
                    { value: 3, label: 'Wed' },
                    { value: 4, label: 'Thu' },
                    { value: 5, label: 'Fri' },
                    { value: 6, label: 'Sat' },
                  ].map(day => (
                    <Button
                      key={day.value}
                      variant={formData.daysOfWeek?.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const currentDays = formData.daysOfWeek || [];
                        const newDays = currentDays.includes(day.value)
                          ? currentDays.filter(d => d !== day.value)
                          : [...currentDays, day.value];
                        setFormData(prev => ({ ...prev, daysOfWeek: newDays }));
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Day Selection */}
            {formData.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="day-of-month">Day of Month</Label>
                <Select
                  value={formData.dayOfMonth?.toString() || '1'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Active Pattern</Label>
                <p className="text-sm text-gray-500">
                  Generate appointments from this pattern
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePattern}>
              {editingPattern ? 'Update Pattern' : 'Create Pattern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

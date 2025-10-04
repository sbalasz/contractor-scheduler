"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar as CalendarIcon, Clock, User, MapPin, Edit, Trash2 } from 'lucide-react';
import { format, isSameDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ScheduleEntry, Contractor, Job } from '@/types';
import { demoScheduleEntries, demoJobs } from '@/data/demo-data';
import { saveScheduleEntries, loadScheduleEntries } from '@/lib/storage';
import { toast } from 'sonner';

interface ScheduleCalendarProps {
  contractors: Contractor[];
}

export default function ScheduleCalendar({ contractors }: ScheduleCalendarProps) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(() => 
    loadScheduleEntries(demoScheduleEntries)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleEntry>>({
    contractorId: '',
    jobId: '',
    startTime: new Date(),
    endTime: new Date(),
    status: 'scheduled',
    notes: '',
  });

  const getEntriesForDate = (date: Date) => {
    return scheduleEntries.filter(entry => 
      isSameDay(new Date(entry.startTime), date)
    );
  };

  const getEntriesForWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    const weekDays = eachDayOfInterval({ start, end });
    
    return weekDays.map(day => ({
      date: day,
      entries: getEntriesForDate(day)
    }));
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setFormData({
      contractorId: '',
      jobId: '',
      startTime: selectedDate,
      endTime: addDays(selectedDate, 1),
      status: 'scheduled',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setFormData(entry);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = scheduleEntries.filter(e => e.id !== id);
    setScheduleEntries(updatedEntries);
    saveScheduleEntries(updatedEntries);
    toast.success('Schedule entry deleted successfully');
  };

  const handleSaveEntry = () => {
    if (!formData.contractorId || !formData.jobId || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const entryData: ScheduleEntry = {
      ...formData as ScheduleEntry,
      id: editingEntry?.id || Date.now().toString(),
      createdAt: editingEntry?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let updatedEntries: ScheduleEntry[];
    if (editingEntry) {
      updatedEntries = scheduleEntries.map(e => e.id === editingEntry.id ? entryData : e);
      setScheduleEntries(updatedEntries);
      toast.success('Schedule entry updated successfully');
    } else {
      updatedEntries = [...scheduleEntries, entryData];
      setScheduleEntries(updatedEntries);
      toast.success('Schedule entry added successfully');
    }

    // Save to localStorage
    saveScheduleEntries(updatedEntries);

    setIsDialogOpen(false);
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor?.name || 'Unknown';
  };

  const getJobTitle = (jobId: string) => {
    const job = demoJobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  const getJobLocation = (jobId: string) => {
    const job = demoJobs.find(j => j.id === jobId);
    return job?.location || 'Unknown Location';
  };

  const weekData = getEntriesForWeek(selectedDate);
  const todayEntries = getEntriesForDate(selectedDate);

  // Create modifier function for calendar highlighting
  const getDatesWithEntries = () => {
    return scheduleEntries.map(entry => new Date(entry.startTime));
  };

  // Add contractor names to calendar days
  useEffect(() => {
    const addContractorNamesToCalendar = () => {
      const calendarDays = document.querySelectorAll('[data-day]');
      
      calendarDays.forEach((dayElement) => {
        const dayElementTyped = dayElement as HTMLElement;
        const dayValue = dayElementTyped.getAttribute('data-day');
        if (dayValue) {
          const dayDate = new Date(dayValue);
          const dayEntries = getEntriesForDate(dayDate);
          
          if (dayEntries.length > 0) {
            // Remove existing contractor information
            const existingInfo = dayElementTyped.querySelector('.contractor-info-container');
            if (existingInfo) {
              existingInfo.remove();
            }
            
            // Create container for contractor information
            const infoContainer = document.createElement('div');
            infoContainer.className = 'contractor-info-container absolute top-2 left-1 right-1';
            infoContainer.style.fontSize = '9px';
            infoContainer.style.color = '#1e40af';
            infoContainer.style.fontWeight = '600';
            infoContainer.style.lineHeight = '1.3';
            infoContainer.style.maxHeight = '75px';
            infoContainer.style.overflow = 'hidden';
            infoContainer.style.wordWrap = 'break-word';
            infoContainer.style.padding = '2px';
            infoContainer.style.zIndex = '10';
            
            // Add each contractor as separate div
            dayEntries.slice(0, 2).forEach((entry, index) => {
              const contractorName = getContractorName(entry.contractorId);
              const jobTitle = getJobTitle(entry.jobId);
              
              // Contractor name div
              const nameDiv = document.createElement('div');
              nameDiv.className = 'contractor-name';
              nameDiv.style.fontSize = '9px';
              nameDiv.style.fontWeight = '700';
              nameDiv.style.color = '#1e40af';
              nameDiv.style.marginBottom = '2px';
              nameDiv.style.lineHeight = '1.2';
              nameDiv.style.whiteSpace = 'nowrap';
              nameDiv.style.overflow = 'hidden';
              nameDiv.style.textOverflow = 'ellipsis';
              nameDiv.textContent = contractorName;
              
              // Job title div
              const jobDiv = document.createElement('div');
              jobDiv.className = 'job-title';
              jobDiv.style.fontSize = '8px';
              jobDiv.style.fontWeight = '500';
              jobDiv.style.color = '#4f46e5';
              jobDiv.style.marginBottom = '3px';
              jobDiv.style.lineHeight = '1.2';
              jobDiv.style.fontStyle = 'italic';
              jobDiv.style.whiteSpace = 'nowrap';
              jobDiv.style.overflow = 'hidden';
              jobDiv.style.textOverflow = 'ellipsis';
              jobDiv.textContent = jobTitle;
              
              infoContainer.appendChild(nameDiv);
              infoContainer.appendChild(jobDiv);
            });
            
            // Add "more" indicator if needed
            if (dayEntries.length > 2) {
              const moreDiv = document.createElement('div');
              moreDiv.className = 'more-indicator';
              moreDiv.style.fontSize = '8px';
              moreDiv.style.fontWeight = '600';
              moreDiv.style.color = '#6b7280';
              moreDiv.style.marginTop = '2px';
              moreDiv.textContent = `+${dayEntries.length - 2} more`;
              infoContainer.appendChild(moreDiv);
            }
            
            dayElementTyped.style.position = 'relative';
            dayElementTyped.appendChild(infoContainer);
          }
        }
      });
    };

    // Run after calendar renders
    const timer = setTimeout(addContractorNamesToCalendar, 100);
    
    return () => clearTimeout(timer);
  }, [scheduleEntries, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Calendar and Week View Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Week View - Left Side */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Week View</CardTitle>
            <CardDescription>
              {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekData.map(({ date, entries }) => (
                <div key={date.toISOString()} className="space-y-2">
                  <div className={`text-center text-sm font-medium p-2 rounded ${
                    isSameDay(date, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                  }`}>
                    {format(date, 'EEE d')}
                  </div>
                  <div className="space-y-1 min-h-[80px]">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="text-xs p-2 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <div className="font-medium truncate">
                          {getContractorName(entry.contractorId)}
                        </div>
                        <div className="text-gray-600 truncate">
                          {getJobTitle(entry.jobId)}
                        </div>
                        <div className="text-gray-500">
                          {format(new Date(entry.startTime), 'HH:mm')} - {format(new Date(entry.endTime), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar - Right Side */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
            <CardDescription>
              Select a date to view and manage schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                weekStartsOn={1}
                className="rounded-md border w-full [&_.rdp-table]:border-separate [&_.rdp-table]:border-spacing-0 [&_.rdp-table]:border-collapse [&_.rdp-cell]:border [&_.rdp-cell]:border-gray-300 [&_.rdp-cell]:border-solid [&_.rdp-cell]:p-3 [&_.rdp-cell]:text-center [&_.rdp-head_cell]:border [&_.rdp-head_cell]:border-gray-300 [&_.rdp-head_cell]:border-solid [&_.rdp-head_cell]:p-3 [&_.rdp-head_cell]:bg-gray-50 [&_.rdp-head_cell]:font-semibold [&_.rdp-day]:border [&_.rdp-day]:border-gray-300 [&_.rdp-day]:border-solid [&_.rdp-day]:hover:bg-gray-100 [&_.rdp-day]:min-h-[100px] [&_.rdp-day]:flex [&_.rdp-day]:flex-col [&_.rdp-day]:items-center [&_.rdp-day]:justify-end [&_.rdp-day]:pb-2 [&_.rdp-day]:overflow-hidden [&_.rdp-day]:relative"
                modifiers={{
                  hasEntries: getDatesWithEntries()
                }}
                modifiersStyles={{
                  hasEntries: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
                modifiersClassNames={{
                  hasEntries: 'contractor-day'
                }}
              />
              <Button onClick={handleAddEntry} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule Entry
              </Button>
              
              {/* Contractor Names for Selected Date */}
              {todayEntries.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Contractors scheduled for {selectedDate.toLocaleDateString()}
                  </h4>
                  <div className="space-y-2">
                    {todayEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div>
                          <span className="font-medium text-gray-900">
                            {getContractorName(entry.contractorId)}
                          </span>
                          <span className="text-gray-600 ml-2">
                            - {getJobTitle(entry.jobId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <CardDescription>
            {todayEntries.length} scheduled entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scheduled entries for this date
            </div>
          ) : (
            <div className="space-y-4">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{getContractorName(entry.contractorId)}</span>
                        <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {format(new Date(entry.startTime), 'HH:mm')} - {format(new Date(entry.endTime), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{getJobLocation(entry.jobId)}</span>
                      </div>
                      <div className="font-medium">{getJobTitle(entry.jobId)}</div>
                      {entry.notes && (
                        <div className="text-sm text-gray-600">{entry.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Schedule Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Schedule Entry' : 'Add New Schedule Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update schedule entry information' : 'Schedule a new contractor appointment'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractor">Contractor *</Label>
              <Select
                value={formData.contractorId}
                onValueChange={(value) => setFormData({ ...formData, contractorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.name} - {contractor.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job">Job *</Label>
              <Select
                value={formData.jobId}
                onValueChange={(value) => setFormData({ ...formData, jobId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {demoJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startTime ? format(formData.startTime, 'PPP HH:mm') : 'Pick a date and time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={(date) => date && setFormData({ ...formData, startTime: date })}
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={formData.startTime ? format(formData.startTime, 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(formData.startTime || new Date());
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setFormData({ ...formData, startTime: newDate });
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endTime ? format(formData.endTime, 'PPP HH:mm') : 'Pick a date and time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endTime}
                    onSelect={(date) => date && setFormData({ ...formData, endTime: date })}
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={formData.endTime ? format(formData.endTime, 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(formData.endTime || new Date());
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setFormData({ ...formData, endTime: newDate });
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this schedule entry"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>
              {editingEntry ? 'Update' : 'Add'} Schedule Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Trash2, Edit, Download, CheckSquare } from 'lucide-react';
import { Contractor, Job, ScheduleEntry } from '@/types';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/ui/loading';

interface BulkOperationsProps {
  contractors: Contractor[];
  jobs: Job[];
  scheduleEntries: ScheduleEntry[];
  onContractorsChange: (contractors: Contractor[]) => void;
  onJobsChange: (jobs: Job[]) => void;
  onScheduleEntriesChange: (entries: ScheduleEntry[]) => void;
}

interface BulkOperation {
  id: string;
  type: 'contractor' | 'job' | 'schedule';
  action: 'delete' | 'duplicate' | 'update' | 'export';
  selectedIds: string[];
  data?: Record<string, unknown>;
}

export default function BulkOperations({ 
  contractors, 
  jobs, 
  scheduleEntries, 
  onContractorsChange, 
  onJobsChange, 
  onScheduleEntriesChange 
}: BulkOperationsProps) {
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Select all/none functions
  const selectAllContractors = () => {
    if (selectedContractors.length === contractors.length) {
      setSelectedContractors([]);
    } else {
      setSelectedContractors(contractors.map(c => c.id));
    }
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(j => j.id));
    }
  };

  const selectAllSchedules = () => {
    if (selectedSchedules.length === scheduleEntries.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(scheduleEntries.map(s => s.id));
    }
  };

  // Bulk operations
  const handleBulkDelete = (type: 'contractor' | 'job' | 'schedule') => {
    const selectedIds = type === 'contractor' ? selectedContractors : 
                      type === 'job' ? selectedJobs : selectedSchedules;
    
    if (selectedIds.length === 0) {
      toast.error('Please select items to delete');
      return;
    }

    setBulkOperation({
      id: Date.now().toString(),
      type,
      action: 'delete',
      selectedIds
    });
    setIsDialogOpen(true);
  };

  const handleBulkDuplicate = (type: 'contractor' | 'job' | 'schedule') => {
    const selectedIds = type === 'contractor' ? selectedContractors : 
                      type === 'job' ? selectedJobs : selectedSchedules;
    
    if (selectedIds.length === 0) {
      toast.error('Please select items to duplicate');
      return;
    }

    setBulkOperation({
      id: Date.now().toString(),
      type,
      action: 'duplicate',
      selectedIds
    });
    setIsDialogOpen(true);
  };

  const handleBulkUpdate = (type: 'contractor' | 'job' | 'schedule') => {
    const selectedIds = type === 'contractor' ? selectedContractors : 
                      type === 'job' ? selectedJobs : selectedSchedules;
    
    if (selectedIds.length === 0) {
      toast.error('Please select items to update');
      return;
    }

    setBulkOperation({
      id: Date.now().toString(),
      type,
      action: 'update',
      selectedIds
    });
    setIsDialogOpen(true);
  };

  const handleBulkExport = (type: 'contractor' | 'job' | 'schedule') => {
    const selectedIds = type === 'contractor' ? selectedContractors : 
                      type === 'job' ? selectedJobs : selectedSchedules;
    
    if (selectedIds.length === 0) {
      toast.error('Please select items to export');
      return;
    }

    const data = type === 'contractor' ? contractors.filter(c => selectedIds.includes(c.id)) :
                type === 'job' ? jobs.filter(j => selectedIds.includes(j.id)) :
                scheduleEntries.filter(s => selectedIds.includes(s.id));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}s-bulk-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedIds.length} ${type}s`);
  };

  const executeBulkOperation = async () => {
    if (!bulkOperation) return;

    setIsProcessing(true);

    try {
      switch (bulkOperation.action) {
        case 'delete':
          await handleDeleteOperation();
          break;
        case 'duplicate':
          await handleDuplicateOperation();
          break;
        case 'update':
          await handleUpdateOperation();
          break;
      }
    } catch (_error) {
      toast.error('Bulk operation failed');
    } finally {
      setIsProcessing(false);
      setIsDialogOpen(false);
      setBulkOperation(null);
    }
  };

  const handleDeleteOperation = async () => {
    if (!bulkOperation) return;

    const { type, selectedIds } = bulkOperation;

    switch (type) {
      case 'contractor':
        const remainingContractors = contractors.filter(c => !selectedIds.includes(c.id));
        onContractorsChange(remainingContractors);
        setSelectedContractors([]);
        toast.success(`Deleted ${selectedIds.length} contractors`);
        break;
      case 'job':
        const remainingJobs = jobs.filter(j => !selectedIds.includes(j.id));
        onJobsChange(remainingJobs);
        setSelectedJobs([]);
        toast.success(`Deleted ${selectedIds.length} jobs`);
        break;
      case 'schedule':
        const remainingSchedules = scheduleEntries.filter(s => !selectedIds.includes(s.id));
        onScheduleEntriesChange(remainingSchedules);
        setSelectedSchedules([]);
        toast.success(`Deleted ${selectedIds.length} schedule entries`);
        break;
    }
  };

  const handleDuplicateOperation = async () => {
    if (!bulkOperation) return;

    const { type, selectedIds } = bulkOperation;

    switch (type) {
      case 'contractor':
        const contractorsToDuplicate = contractors.filter(c => selectedIds.includes(c.id));
        const duplicatedContractors = contractorsToDuplicate.map(c => ({
          ...c,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: c.name + ' (Copy)',
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        onContractorsChange([...contractors, ...duplicatedContractors]);
        setSelectedContractors([]);
        toast.success(`Duplicated ${selectedIds.length} contractors`);
        break;
      case 'job':
        const jobsToDuplicate = jobs.filter(j => selectedIds.includes(j.id));
        const duplicatedJobs = jobsToDuplicate.map(j => ({
          ...j,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: j.title + ' (Copy)',
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        onJobsChange([...jobs, ...duplicatedJobs]);
        setSelectedJobs([]);
        toast.success(`Duplicated ${selectedIds.length} jobs`);
        break;
      case 'schedule':
        const schedulesToDuplicate = scheduleEntries.filter(s => selectedIds.includes(s.id));
        const duplicatedSchedules = schedulesToDuplicate.map(s => ({
          ...s,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          startTime: new Date(new Date(s.startTime).getTime() + 7 * 24 * 60 * 60 * 1000), // +1 week
          endTime: new Date(new Date(s.endTime).getTime() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        onScheduleEntriesChange([...scheduleEntries, ...duplicatedSchedules]);
        setSelectedSchedules([]);
        toast.success(`Duplicated ${selectedIds.length} schedule entries`);
        break;
    }
  };

  const handleUpdateOperation = async () => {
    if (!bulkOperation) return;

    const { type, selectedIds, data } = bulkOperation;

    switch (type) {
      case 'contractor':
        const updatedContractors = contractors.map(c => 
          selectedIds.includes(c.id) ? { ...c, ...data, updatedAt: new Date() } : c
        );
        onContractorsChange(updatedContractors);
        setSelectedContractors([]);
        toast.success(`Updated ${selectedIds.length} contractors`);
        break;
      case 'job':
        const updatedJobs = jobs.map(j => 
          selectedIds.includes(j.id) ? { ...j, ...data, updatedAt: new Date() } : j
        );
        onJobsChange(updatedJobs);
        setSelectedJobs([]);
        toast.success(`Updated ${selectedIds.length} jobs`);
        break;
      case 'schedule':
        const updatedSchedules = scheduleEntries.map(s => 
          selectedIds.includes(s.id) ? { ...s, ...data, updatedAt: new Date() } : s
        );
        onScheduleEntriesChange(updatedSchedules);
        setSelectedSchedules([]);
        toast.success(`Updated ${selectedIds.length} schedule entries`);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Contractors Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Contractors Bulk Operations
          </CardTitle>
          <CardDescription>
            Select multiple contractors to perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedContractors.length === contractors.length && contractors.length > 0}
                onCheckedChange={selectAllContractors}
              />
              <Label>
                {selectedContractors.length === contractors.length ? 'Deselect All' : 'Select All'} 
                ({selectedContractors.length}/{contractors.length})
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkDuplicate('contractor')}
                disabled={selectedContractors.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate('contractor')}
                disabled={selectedContractors.length === 0}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkExport('contractor')}
                disabled={selectedContractors.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkDelete('contractor')}
                disabled={selectedContractors.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {contractors.map(contractor => (
              <div key={contractor.id} className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={selectedContractors.includes(contractor.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedContractors([...selectedContractors, contractor.id]);
                    } else {
                      setSelectedContractors(selectedContractors.filter(id => id !== contractor.id));
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contractor.name}</p>
                  <p className="text-xs text-gray-500 truncate">{contractor.company}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Services Bulk Operations
          </CardTitle>
          <CardDescription>
            Select multiple services to perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedJobs.length === jobs.length && jobs.length > 0}
                onCheckedChange={selectAllJobs}
              />
              <Label>
                {selectedJobs.length === jobs.length ? 'Deselect All' : 'Select All'} 
                ({selectedJobs.length}/{jobs.length})
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkDuplicate('job')}
                disabled={selectedJobs.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate('job')}
                disabled={selectedJobs.length === 0}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkExport('job')}
                disabled={selectedJobs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkDelete('job')}
                disabled={selectedJobs.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={selectedJobs.includes(job.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedJobs([...selectedJobs, job.id]);
                    } else {
                      setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 truncate">{job.location}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Entries Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Schedule Entries Bulk Operations
          </CardTitle>
          <CardDescription>
            Select multiple schedule entries to perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSchedules.length === scheduleEntries.length && scheduleEntries.length > 0}
                onCheckedChange={selectAllSchedules}
              />
              <Label>
                {selectedSchedules.length === scheduleEntries.length ? 'Deselect All' : 'Select All'} 
                ({selectedSchedules.length}/{scheduleEntries.length})
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkDuplicate('schedule')}
                disabled={selectedSchedules.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate('schedule')}
                disabled={selectedSchedules.length === 0}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkExport('schedule')}
                disabled={selectedSchedules.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkDelete('schedule')}
                disabled={selectedSchedules.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {scheduleEntries.map(entry => {
              const contractor = contractors.find(c => c.id === entry.contractorId);
              const job = jobs.find(j => j.id === entry.jobId);
              return (
                <div key={entry.id} className="flex items-center gap-2 p-2 border rounded">
                  <Checkbox
                    checked={selectedSchedules.includes(entry.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSchedules([...selectedSchedules, entry.id]);
                      } else {
                        setSelectedSchedules(selectedSchedules.filter(id => id !== entry.id));
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {contractor?.company || 'Unknown Company'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {job?.title || 'Unknown Service'} - {new Date(entry.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkOperation?.action === 'delete' && `Delete ${bulkOperation.selectedIds.length} ${bulkOperation.type}s`}
              {bulkOperation?.action === 'duplicate' && `Duplicate ${bulkOperation.selectedIds.length} ${bulkOperation.type}s`}
              {bulkOperation?.action === 'update' && `Update ${bulkOperation.selectedIds.length} ${bulkOperation.type}s`}
            </DialogTitle>
            <DialogDescription>
              {bulkOperation?.action === 'delete' && 'This action cannot be undone. Are you sure you want to delete these items?'}
              {bulkOperation?.action === 'duplicate' && 'This will create copies of the selected items.'}
              {bulkOperation?.action === 'update' && 'Enter the fields you want to update for all selected items.'}
            </DialogDescription>
          </DialogHeader>
          
          {bulkOperation?.action === 'update' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={(value) => setBulkOperation({...bulkOperation, data: {...bulkOperation.data, status: value}})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes for all selected items..."
                  onChange={(e) => setBulkOperation({...bulkOperation, data: {...bulkOperation.data, notes: e.target.value}})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              isLoading={isProcessing}
              onClick={executeBulkOperation}
              variant={bulkOperation?.action === 'delete' ? 'destructive' : 'default'}
            >
              {bulkOperation?.action === 'delete' && 'Delete'}
              {bulkOperation?.action === 'duplicate' && 'Duplicate'}
              {bulkOperation?.action === 'update' && 'Update'}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

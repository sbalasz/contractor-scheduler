"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Job, Tag } from '@/types';
import { saveJobs, loadJobs, loadTags } from '@/lib/storage';
import { demoJobs, demoTags } from '@/data/demo-data';

interface JobTableProps {
  jobs: Job[];
  onJobsChange: (jobs: Job[]) => void;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export default function JobTable({ jobs, onJobsChange, tags, onTagsChange }: JobTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    estimatedDuration: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    tags: [] as string[],
    notes: ''
  });

  // Load jobs and tags from localStorage on component mount
  useEffect(() => {
    const savedJobs = loadJobs(demoJobs);
    if (savedJobs.length > 0) {
      onJobsChange(savedJobs);
    }
    
    const savedTags = loadTags(demoTags);
    if (savedTags.length > 0) {
      onTagsChange(savedTags);
    }
  }, [onJobsChange, onTagsChange]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || job.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddJob = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      estimatedDuration: '',
      priority: 'medium',
      status: 'pending',
      tags: [],
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      estimatedDuration: job.estimatedDuration.toString(),
      priority: job.priority,
      status: job.status,
      tags: job.tags,
      notes: job.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    onJobsChange(updatedJobs);
    saveJobs(updatedJobs);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const jobData = {
      id: editingJob?.id || `job-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      estimatedDuration: parseInt(formData.estimatedDuration) || 0,
      priority: formData.priority,
      status: formData.status,
      tags: formData.tags,
      createdAt: editingJob?.createdAt || new Date(),
      updatedAt: new Date(),
      notes: formData.notes.trim()
    };

    let updatedJobs;
    if (editingJob) {
      updatedJobs = jobs.map(job => job.id === editingJob.id ? jobData : job);
    } else {
      updatedJobs = [...jobs, jobData];
    }

    onJobsChange(updatedJobs);
    saveJobs(updatedJobs);
    setIsDialogOpen(false);
  };

  const handleTagToggle = (tagId: string) => {
    const updatedTags = formData.tags.includes(tagId)
      ? formData.tags.filter(id => id !== tagId)
      : [...formData.tags, tagId];
    setFormData({ ...formData, tags: updatedTags });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Management</CardTitle>
        <CardDescription>Manage your jobs, view their details, and organize them by tags.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddJob} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>

          {/* Jobs Table - Desktop */}
          <div className="hidden md:block border rounded-lg">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Title</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Description</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Duration</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Priority</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Tags</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{job.title}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 max-w-xs truncate">{job.description}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{job.location}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{job.estimatedDuration}h</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge className={getPriorityColor(job.priority)}>
                          {job.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex flex-wrap gap-1">
                          {job.tags.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            return tag ? (
                              <Badge 
                                key={tagId}
                                className="relative overflow-hidden font-medium"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  color: tag.color,
                                  borderColor: tag.color,
                                  borderWidth: '1px',
                                  borderStyle: 'solid'
                                }}
                              >
                                <div 
                                  className="absolute left-0 top-0 bottom-0 w-1"
                                  style={{ backgroundColor: tag.color }}
                                />
                                <span className="ml-2">{tag.name}</span>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jobs Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="text-sm">{job.description}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Duration:</span>
                        <p className="text-sm">{job.estimatedDuration}h</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Priority:</span>
                        <Badge className={`${getPriorityColor(job.priority)} text-xs`}>
                          {job.priority}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <Badge className={`${getStatusColor(job.status)} text-xs`}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge 
                              key={tagId}
                              className="relative overflow-hidden font-medium text-xs"
                              style={{
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                                borderColor: tag.color,
                                borderWidth: '1px',
                                borderStyle: 'solid'
                              }}
                            >
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="ml-2">{tag.name}</span>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
              <DialogDescription>
                {editingJob ? 'Update the job details below.' : 'Fill in the details to create a new job.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-left md:text-right">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="md:col-span-3"
                  placeholder="Job title"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-left md:text-right">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="md:col-span-3"
                  placeholder="Job description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-left md:text-right">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="md:col-span-3"
                  placeholder="Job location"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-left md:text-right">Duration (hrs)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  className="md:col-span-3"
                  placeholder="Estimated duration in hours"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-left md:text-right">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="md:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-left md:text-right">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pending' | 'in-progress' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="md:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label className="text-left md:text-right">Tags</Label>
                <div className="md:col-span-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Button
                        key={tag.id}
                        variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTagToggle(tag.id)}
                        className="relative overflow-hidden"
                        style={formData.tags.includes(tag.id) ? {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: tag.color,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        } : {}}
                      >
                        {formData.tags.includes(tag.id) && (
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        <span className={formData.tags.includes(tag.id) ? "ml-2" : ""}>{tag.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-left md:text-right">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="md:col-span-3"
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
                {editingJob ? 'Update Job' : 'Add Job'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

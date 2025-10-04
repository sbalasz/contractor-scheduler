"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Contractor, Job, Tag } from '@/types';
import { demoTags, demoJobs } from '@/data/demo-data';
import { saveContractors, saveTags, loadTags, loadJobs } from '@/lib/storage';
import { toast } from 'sonner';

interface ContractorTableProps {
  contractors: Contractor[];
  setContractors: (contractors: Contractor[]) => void;
  jobs: Job[];
  onJobsChange: (jobs: Job[]) => void;
}

export default function ContractorTable({ contractors, setContractors, jobs, onJobsChange }: ContractorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [tags, setTags] = useState<Tag[]>(demoTags);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [formData, setFormData] = useState<Partial<Contractor>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    specialty: '',
    tags: [],
    hourlyRate: 0,
    notes: '',
  });

  // Load tags and jobs from localStorage after component mounts
  useEffect(() => {
    const loadedTags = loadTags(demoTags);
    setTags(loadedTags);
    
    const loadedJobs = loadJobs(demoJobs);
    onJobsChange(loadedJobs);
  }, [onJobsChange]);

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || contractor.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleAddContractor = () => {
    setEditingContractor(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      specialty: '',
      tags: [],
      hourlyRate: 0,
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setFormData(contractor);
    setIsDialogOpen(true);
  };

  const handleDeleteContractor = (id: string) => {
    const updatedContractors = contractors.filter(c => c.id !== id);
    setContractors(updatedContractors);
    saveContractors(updatedContractors);
    toast.success('Contractor deleted successfully');
  };

  const handleSaveContractor = () => {
    if (!formData.name || !formData.company || !formData.email || !formData.phone || !formData.specialty) {
      toast.error('Please fill in all required fields');
      return;
    }

    const contractorData: Contractor = {
      ...formData as Contractor,
      id: editingContractor?.id || Date.now().toString(),
      createdAt: editingContractor?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    let updatedContractors: Contractor[];
    if (editingContractor) {
      updatedContractors = contractors.map(c => c.id === editingContractor.id ? contractorData : c);
      setContractors(updatedContractors);
      toast.success('Contractor updated successfully');
    } else {
      updatedContractors = [...contractors, contractorData];
      setContractors(updatedContractors);
      toast.success('Contractor added successfully');
    }

    // Save to localStorage
    saveContractors(updatedContractors);

    setIsDialogOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      toast.error('A tag with this name already exists');
      return;
    }

    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: newTagColor,
      description: `Custom tag: ${newTagName.trim()}`
    };

    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    saveTags(updatedTags);
    
    // Add the new tag to the current contractor
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: [...currentTags, newTag.name] });
    
    setNewTagName('');
    setIsCreatingTag(false);
    toast.success('Tag created successfully');
  };

  const handleCancelTagCreation = () => {
    setNewTagName('');
    setIsCreatingTag(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contractors..."
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
              <SelectItem key={tag.id} value={tag.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddContractor} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Contractors Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContractors.map((contractor) => (
              <TableRow key={contractor.id}>
                <TableCell className="font-medium">{contractor.name}</TableCell>
                <TableCell>{contractor.company}</TableCell>
                <TableCell>{contractor.specialty}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{contractor.email}</div>
                    <div className="text-gray-500">{contractor.phone}</div>
                  </div>
                </TableCell>
                <TableCell>£{contractor.hourlyRate}/hr</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contractor.tags.map((tag) => {
                      const tagData = tags.find(t => t.name === tag);
                      return (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="relative overflow-hidden font-medium"
                          style={{ 
                            backgroundColor: tagData?.color + '20', 
                            color: tagData?.color,
                            borderColor: tagData?.color,
                            borderWidth: '1px',
                            borderStyle: 'solid'
                          }}
                        >
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: tagData?.color }}
                          />
                          <span className="ml-2">{tag}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditContractor(contractor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContractor(contractor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Contractor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContractor ? 'Edit Contractor' : 'Add New Contractor'}
            </DialogTitle>
            <DialogDescription>
              {editingContractor ? 'Update contractor information' : 'Add a new contractor to your system'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contractor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Job Specialty *</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => setFormData({ ...formData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job specialty" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.title}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (£)</Label>
              <Input
                id="rate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                placeholder="85"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={formData.tags?.includes(tag.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag.name)}
                  className="relative overflow-hidden"
                  style={{
                    backgroundColor: formData.tags?.includes(tag.name) 
                      ? tag.color 
                      : `${tag.color}20`,
                    color: formData.tags?.includes(tag.name) 
                      ? 'white' 
                      : tag.color,
                    borderColor: tag.color,
                    borderWidth: '2px',
                  }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="ml-2 font-medium">{tag.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Custom Tag Creation */}
            <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Create Custom Tag</Label>
                  <p className="text-xs text-gray-500 mt-1">Add a new tag to categorize contractors</p>
                </div>
                <Button
                  type="button"
                  variant={isCreatingTag ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setIsCreatingTag(!isCreatingTag)}
                  className="font-medium"
                >
                  {isCreatingTag ? 'Cancel' : '+ Add Tag'}
                </Button>
              </div>
              
              {isCreatingTag && (
                <div className="space-y-4 p-4 bg-white rounded-lg border">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tag Name</Label>
                    <Input
                      placeholder="Enter tag name (e.g., Emergency, Weekend)"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tag Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-12 h-10 border rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">Choose a color for this tag</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="flex-1"
                    >
                      Create Tag
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelTagCreation}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the contractor"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContractor}>
              {editingContractor ? 'Update' : 'Add'} Contractor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Contractor, Tag } from '@/types';
import { demoTags } from '@/data/demo-data';
import { toast } from 'sonner';

interface ContractorTableProps {
  contractors: Contractor[];
  setContractors: (contractors: Contractor[]) => void;
}

export default function ContractorTable({ contractors, setContractors }: ContractorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
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
    setContractors(contractors.filter(c => c.id !== id));
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

    if (editingContractor) {
      setContractors(contractors.map(c => c.id === editingContractor.id ? contractorData : c));
      toast.success('Contractor updated successfully');
    } else {
      setContractors([...contractors, contractorData]);
      toast.success('Contractor added successfully');
    }

    setIsDialogOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFormData({ ...formData, tags: newTags });
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
            {demoTags.map(tag => (
              <SelectItem key={tag.id} value={tag.name}>
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
                <TableCell>${contractor.hourlyRate}/hr</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contractor.tags.map((tag) => {
                      const tagData = demoTags.find(t => t.name === tag);
                      return (
                        <Badge
                          key={tag}
                          variant="secondary"
                          style={{ backgroundColor: tagData?.color + '20', color: tagData?.color }}
                        >
                          {tag}
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
              <Label htmlFor="specialty">Specialty *</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Electrical, Plumbing, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate</Label>
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
              {demoTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={formData.tags?.includes(tag.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle(tag.name)}
                  style={{
                    backgroundColor: formData.tags?.includes(tag.name) ? tag.color : undefined,
                    color: formData.tags?.includes(tag.name) ? 'white' : undefined,
                  }}
                >
                  {tag.name}
                </Button>
              ))}
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

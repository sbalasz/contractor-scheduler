"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, Calendar, Users, Briefcase } from 'lucide-react';
import { demoContractors, demoJobs, demoScheduleEntries } from '@/data/demo-data';
import { toast } from 'sonner';

export default function ExportManager() {
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    contractors: true,
    jobs: true,
    schedules: true,
  });

  const handleDataTypeToggle = (dataType: keyof typeof selectedDataTypes) => {
    setSelectedDataTypes(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  const exportToCSV = () => {
    try {
      let csvContent = '';
      let filename = 'contractor-data';

      if (selectedDataTypes.contractors) {
        csvContent += 'Contractors\n';
        csvContent += 'ID,Name,Company,Email,Phone,Specialty,Tags,Hourly Rate,Notes,Created At,Updated At\n';
        
        demoContractors.forEach(contractor => {
          const row = [
            contractor.id,
            contractor.name,
            contractor.company,
            contractor.email,
            contractor.phone,
            contractor.specialty,
            contractor.tags.join(';'),
            contractor.hourlyRate || '',
            contractor.notes || '',
            contractor.createdAt.toISOString(),
            contractor.updatedAt.toISOString()
          ].map(field => `"${field}"`).join(',');
          csvContent += row + '\n';
        });
        csvContent += '\n';
      }

      if (selectedDataTypes.jobs) {
        csvContent += 'Jobs\n';
        csvContent += 'ID,Title,Description,Location,Estimated Duration,Priority,Status,Tags,Created At,Updated At\n';
        
        demoJobs.forEach(job => {
          const row = [
            job.id,
            job.title,
            job.description,
            job.location,
            job.estimatedDuration,
            job.priority,
            job.status,
            job.tags.join(';'),
            job.createdAt.toISOString(),
            job.updatedAt.toISOString()
          ].map(field => `"${field}"`).join(',');
          csvContent += row + '\n';
        });
        csvContent += '\n';
      }

      if (selectedDataTypes.schedules) {
        csvContent += 'Schedule Entries\n';
        csvContent += 'ID,Contractor ID,Job ID,Start Time,End Time,Status,Notes,Created At,Updated At\n';
        
        demoScheduleEntries.forEach(entry => {
          const row = [
            entry.id,
            entry.contractorId,
            entry.jobId,
            entry.startTime.toISOString(),
            entry.endTime.toISOString(),
            entry.status,
            entry.notes || '',
            entry.createdAt.toISOString(),
            entry.updatedAt.toISOString()
          ].map(field => `"${field}"`).join(',');
          csvContent += row + '\n';
        });
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV file exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV file');
      console.error('CSV export error:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      // Dynamic import for XLSX
      const XLSX = await import('xlsx');
      
      const workbook = XLSX.utils.book_new();
      let filename = 'contractor-data';

      if (selectedDataTypes.contractors) {
        const contractorsData = demoContractors.map(contractor => ({
          ID: contractor.id,
          Name: contractor.name,
          Company: contractor.company,
          Email: contractor.email,
          Phone: contractor.phone,
          Specialty: contractor.specialty,
          Tags: contractor.tags.join(';'),
          'Hourly Rate': contractor.hourlyRate || '',
          Notes: contractor.notes || '',
          'Created At': contractor.createdAt.toISOString(),
          'Updated At': contractor.updatedAt.toISOString()
        }));
        
        const contractorsSheet = XLSX.utils.json_to_sheet(contractorsData);
        XLSX.utils.book_append_sheet(workbook, contractorsSheet, 'Contractors');
      }

      if (selectedDataTypes.jobs) {
        const jobsData = demoJobs.map(job => ({
          ID: job.id,
          Title: job.title,
          Description: job.description,
          Location: job.location,
          'Estimated Duration': job.estimatedDuration,
          Priority: job.priority,
          Status: job.status,
          Tags: job.tags.join(';'),
          'Created At': job.createdAt.toISOString(),
          'Updated At': job.updatedAt.toISOString()
        }));
        
        const jobsSheet = XLSX.utils.json_to_sheet(jobsData);
        XLSX.utils.book_append_sheet(workbook, jobsSheet, 'Jobs');
      }

      if (selectedDataTypes.schedules) {
        const schedulesData = demoScheduleEntries.map(entry => ({
          ID: entry.id,
          'Contractor ID': entry.contractorId,
          'Job ID': entry.jobId,
          'Start Time': entry.startTime.toISOString(),
          'End Time': entry.endTime.toISOString(),
          Status: entry.status,
          Notes: entry.notes || '',
          'Created At': entry.createdAt.toISOString(),
          'Updated At': entry.updatedAt.toISOString()
        }));
        
        const schedulesSheet = XLSX.utils.json_to_sheet(schedulesData);
        XLSX.utils.book_append_sheet(workbook, schedulesSheet, 'Schedules');
      }

      // Generate and download file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel file');
      console.error('Excel export error:', error);
    }
  };

  const getSelectedCount = () => {
    let count = 0;
    if (selectedDataTypes.contractors) count += demoContractors.length;
    if (selectedDataTypes.jobs) count += demoJobs.length;
    if (selectedDataTypes.schedules) count += demoScheduleEntries.length;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>
            Select the data types you want to export and choose your preferred format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Data to Export</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractors"
                  checked={selectedDataTypes.contractors}
                  onCheckedChange={() => handleDataTypeToggle('contractors')}
                />
                <label htmlFor="contractors" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <span>Contractors ({demoContractors.length} records)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobs"
                  checked={selectedDataTypes.jobs}
                  onCheckedChange={() => handleDataTypeToggle('jobs')}
                />
                <label htmlFor="jobs" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className="h-4 w-4" />
                  <span>Jobs ({demoJobs.length} records)</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedules"
                  checked={selectedDataTypes.schedules}
                  onCheckedChange={() => handleDataTypeToggle('schedules')}
                />
                <label htmlFor="schedules" className="flex items-center gap-2 cursor-pointer">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Entries ({demoScheduleEntries.length} records)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Export Format</h3>
            <div className="flex gap-4">
              <Button
                onClick={exportToCSV}
                disabled={getSelectedCount() === 0}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export to CSV
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={getSelectedCount() === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Table className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
            {getSelectedCount() === 0 && (
              <p className="text-sm text-gray-500">
                Please select at least one data type to export
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
          <CardDescription>
            Overview of what will be included in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedDataTypes.contractors ? demoContractors.length : 0}
                </div>
                <div className="text-sm text-gray-600">Contractors</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedDataTypes.jobs ? demoJobs.length : 0}
                </div>
                <div className="text-sm text-gray-600">Jobs</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedDataTypes.schedules ? demoScheduleEntries.length : 0}
                </div>
                <div className="text-sm text-gray-600">Schedule Entries</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium">
                Total Records: {getSelectedCount()}
              </div>
              <div className="text-sm text-gray-600">
                {getSelectedCount() > 0 ? 'Ready to export' : 'No data selected'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Export Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• CSV files are compatible with most spreadsheet applications</p>
            <p>• Excel files (.xlsx) provide better formatting and multiple sheets</p>
            <p>• All timestamps are exported in ISO format for easy parsing</p>
            <p>• Tags are separated by semicolons (;) in the exported data</p>
            <p>• Large exports may take a moment to process</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

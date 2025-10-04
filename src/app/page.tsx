"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, BarChart3, FileText, Settings, CalendarDays } from 'lucide-react';
// Import components (we'll create these next)
import ContractorTable from '@/components/ContractorTable';
import JobTable from '@/components/JobTable';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AnnualOverview from '@/components/AnnualOverview';
import ExportManager from '@/components/ExportManager';
import { Contractor, Job, Tag } from '@/types';
import { demoContractors, demoJobs, demoTags } from '@/data/demo-data';
import { loadContractors, loadJobs, loadTags } from '@/lib/storage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('contractors');
  const [contractors, setContractors] = useState<Contractor[]>(demoContractors);
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [tags, setTags] = useState<Tag[]>(demoTags);

  // Load data from localStorage after component mounts
  useEffect(() => {
    const loadedContractors = loadContractors(demoContractors);
    setContractors(loadedContractors);
    
    const loadedJobs = loadJobs(demoJobs);
    setJobs(loadedJobs);
    
    const loadedTags = loadTags(demoTags);
    setTags(loadedTags);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contractor Scheduler</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage contractors, jobs, and schedules</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto">
            <TabsTrigger value="contractors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contractors</span>
              <span className="sm:hidden">Contractors</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Jobs</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="annual" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Annual</span>
              <span className="sm:hidden">Annual</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contractors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Management</CardTitle>
                <CardDescription>
                  Manage your contractors, view their details, and organize them by tags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractorTable 
                  contractors={contractors} 
                  setContractors={setContractors}
                  jobs={jobs}
                  onJobsChange={setJobs}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobTable 
              jobs={jobs} 
              onJobsChange={setJobs}
              tags={tags}
              onTagsChange={setTags}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>
                  View and manage contractor schedules, add new appointments, and track job progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleCalendar contractors={contractors} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View insights and statistics about your contractors and jobs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard contractors={contractors} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annual" className="space-y-6">
            <AnnualOverview contractors={contractors} jobs={jobs} />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Export your contractor and schedule data to CSV or Excel files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your dashboard preferences and manage tags.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Settings panel coming soon...</p>
        </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
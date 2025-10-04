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
import GlobalSearch from '@/components/GlobalSearch';
import EmailNotifications from '@/components/EmailNotifications';
import ThemeCustomization from '@/components/ThemeCustomization';
import BulkOperations from '@/components/BulkOperations';
import { Contractor, Job, Tag, ScheduleEntry } from '@/types';
import { demoContractors, demoJobs, demoTags, demoScheduleEntries } from '@/data/demo-data';
import { loadContractors, loadJobs, loadTags, loadScheduleEntries } from '@/lib/storage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('contractors');
  const [contractors, setContractors] = useState<Contractor[]>(demoContractors);
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [tags, setTags] = useState<Tag[]>(demoTags);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(demoScheduleEntries);

  // Load data from localStorage after component mounts
  useEffect(() => {
    const loadedContractors = loadContractors(demoContractors);
    setContractors(loadedContractors);
    
    const loadedJobs = loadJobs(demoJobs);
    setJobs(loadedJobs);
    
    const loadedTags = loadTags(demoTags);
    setTags(loadedTags);
    
    const loadedScheduleEntries = loadScheduleEntries(demoScheduleEntries);
    setScheduleEntries(loadedScheduleEntries);
  }, []);

  // Handle search result clicks
  const handleSearchResultClick = (type: 'contractor' | 'job' | 'schedule', _id: string) => {
    switch (type) {
      case 'contractor':
        setActiveTab('contractors');
        break;
      case 'job':
        setActiveTab('jobs');
        break;
      case 'schedule':
        setActiveTab('calendar');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:py-6">
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Scheduler</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage companies, services, and schedules</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </div>
            </div>
            
            {/* Search Section - Full Width on Mobile */}
            <div className="w-full">
              <GlobalSearch
                contractors={contractors}
                jobs={jobs}
                scheduleEntries={scheduleEntries}
                onSearchResultClick={handleSearchResultClick}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto p-1 bg-gray-100 rounded-lg">
            <TabsTrigger value="contractors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all min-h-[60px] sm:min-h-[40px]">
              <Users className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Companies</span>
              <span className="sm:hidden text-xs font-medium">Companies</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all min-h-[60px] sm:min-h-[40px]">
              <FileText className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Services</span>
              <span className="sm:hidden text-xs font-medium">Services</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all min-h-[60px] sm:min-h-[40px]">
              <Calendar className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden text-xs font-medium">Calendar</span>
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
                <CardTitle>Company Management</CardTitle>
                <CardDescription>
                  Manage your companies, view their details, and organize them by tags.
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
              contractors={contractors}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>
                  View and manage company schedules, add new appointments, and track service progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScheduleCalendar 
                  contractors={contractors}
                  jobs={jobs}
                  scheduleEntries={scheduleEntries}
                  onScheduleEntriesChange={setScheduleEntries}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View insights and statistics about your companies and services.
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
                  Export your company and schedule data to CSV or Excel files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <EmailNotifications 
              scheduleEntries={scheduleEntries}
              contractors={contractors}
            />
            <ThemeCustomization />
            <BulkOperations
              contractors={contractors}
              jobs={jobs}
              scheduleEntries={scheduleEntries}
              onContractorsChange={setContractors}
              onJobsChange={setJobs}
              onScheduleEntriesChange={setScheduleEntries}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
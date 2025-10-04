"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, BarChart3, FileText, Settings } from 'lucide-react';
// Import components (we'll create these next)
import ContractorTable from '@/components/ContractorTable';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ExportManager from '@/components/ExportManager';
import { Contractor } from '@/types';
import { demoContractors } from '@/data/demo-data';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('contractors');
  const [contractors, setContractors] = useState<Contractor[]>(demoContractors);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contractor Scheduler</h1>
              <p className="text-gray-600 mt-1">Manage contractors, jobs, and schedules</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contractors
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
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
                <ContractorTable contractors={contractors} setContractors={setContractors} />
              </CardContent>
            </Card>
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
                <AnalyticsDashboard />
              </CardContent>
            </Card>
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
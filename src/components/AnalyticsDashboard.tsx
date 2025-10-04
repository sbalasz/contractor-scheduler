"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Contractor, ScheduleEntry } from '@/types';
import { demoJobs, demoScheduleEntries } from '@/data/demo-data';
import { loadScheduleEntries } from '@/lib/storage';

interface AnalyticsDashboardProps {
  contractors: Contractor[];
}

export default function AnalyticsDashboard({ contractors }: AnalyticsDashboardProps) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(demoScheduleEntries);
  
  // Load schedule entries from localStorage after component mounts
  useEffect(() => {
    const loadedEntries = loadScheduleEntries(demoScheduleEntries);
    setScheduleEntries(loadedEntries);
  }, []);
  
  // Calculate analytics data
  const totalContractors = contractors.length;
  const totalJobs = demoJobs.length;
  const completedJobs = demoJobs.filter(job => job.status === 'completed').length;
  const pendingJobs = demoJobs.filter(job => job.status === 'pending').length;
  const inProgressJobs = demoJobs.filter(job => job.status === 'in-progress').length;

  // Calculate total scheduled hours
  const totalScheduledHours = scheduleEntries.reduce((total, entry) => {
    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0);

  // Contractors by specialty with percentages
  const contractorsBySpecialty = contractors.reduce((acc, contractor) => {
    const existing = acc.find(item => item.specialty === contractor.specialty);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ specialty: contractor.specialty, count: 1 });
    }
    return acc;
  }, [] as { specialty: string; count: number }[]);

  // Calculate percentages
  const contractorsBySpecialtyWithPercentages = contractorsBySpecialty.map(item => ({
    ...item,
    percentage: totalContractors > 0 ? Math.round((item.count / totalContractors) * 100) : 0
  }));

  // Jobs by priority
  const jobsByPriority = demoJobs.reduce((acc, job) => {
    const existing = acc.find(item => item.priority === job.priority);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ priority: job.priority, count: 1 });
    }
    return acc;
  }, [] as { priority: string; count: number }[]);

  // Monthly schedule data (mock data for demonstration)
  const monthlyScheduleData = [
    { month: 'Jan', hours: 45 },
    { month: 'Feb', hours: 52 },
    { month: 'Mar', hours: 38 },
    { month: 'Apr', hours: 67 },
    { month: 'May', hours: 73 },
    { month: 'Jun', hours: 89 },
  ];

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContractors}</div>
            <p className="text-xs text-muted-foreground">
              Active companies in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Services created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalScheduledHours)}</div>
            <p className="text-xs text-muted-foreground">
              Total hours scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Jobs completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Overview</CardTitle>
            <CardDescription>Current status of all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Completed</span>
                </div>
                <Badge variant="secondary">{completedJobs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>In Progress</span>
                </div>
                <Badge variant="secondary">{inProgressJobs}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Pending</span>
                </div>
                <Badge variant="secondary">{pendingJobs}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Services Distribution</CardTitle>
            <CardDescription>Percentage breakdown of different professional service types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Pie Chart */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={contractorsBySpecialtyWithPercentages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {contractorsBySpecialtyWithPercentages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: { payload?: { specialty: string; percentage: number } }) => [
                          `${props.payload?.specialty || 'Unknown'}: ${value} contractors (${props.payload?.percentage || 0}%)`,
                          'Count'
                        ]}
                      />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend with percentages */}
              <div className="flex-1 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Specialty Breakdown</h4>
                {contractorsBySpecialtyWithPercentages.map((item, index) => (
                  <div key={item.specialty} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.specialty}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{item.percentage}%</div>
                      <div className="text-xs text-gray-500">{item.count} contractor{item.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Priority</CardTitle>
            <CardDescription>Distribution of jobs by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobsByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Schedule Hours</CardTitle>
            <CardDescription>Total scheduled hours per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyScheduleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Contractors */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Overview</CardTitle>
          <CardDescription>Details about your contractors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractors.map((contractor) => {
              const contractorJobs = scheduleEntries.filter(entry => entry.contractorId === contractor.id);
              const completedJobsCount = contractorJobs.filter(entry => entry.status === 'completed').length;
              
              return (
                <div key={contractor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{contractor.name}</div>
                    <div className="text-sm text-gray-600">{contractor.company}</div>
                    <div className="flex gap-1">
                      {contractor.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">£{contractor.hourlyRate}/hr</div>
                    <div className="text-xs text-gray-600">
                      {contractorJobs.length} scheduled jobs
                    </div>
                    <div className="text-xs text-gray-600">
                      {completedJobsCount} completed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

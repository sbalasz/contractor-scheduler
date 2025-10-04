"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, DollarSign, Target, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
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

  // Advanced Analytics Calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent activity (last 30 days)
  const recentEntries = scheduleEntries.filter(entry => 
    new Date(entry.startTime) >= thirtyDaysAgo
  );

  // Completion rate trends
  const completionRate = scheduleEntries.length > 0 
    ? (scheduleEntries.filter(entry => entry.status === 'completed').length / scheduleEntries.length) * 100 
    : 0;

  // Average appointment duration
  const avgDuration = scheduleEntries.length > 0
    ? scheduleEntries.reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0) / scheduleEntries.length
    : 0;

  // Revenue calculations (using hourly rates)
  const totalRevenue = scheduleEntries.reduce((total, entry) => {
    const contractor = contractors.find(c => c.id === entry.contractorId);
    if (contractor && contractor.hourlyRate) {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + (contractor.hourlyRate * hours);
    }
    return total;
  }, 0);

  // Monthly trends data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), i, 1);
    const monthEntries = scheduleEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate.getMonth() === i && entryDate.getFullYear() === now.getFullYear();
    });
    
    const monthRevenue = monthEntries.reduce((total, entry) => {
      const contractor = contractors.find(c => c.id === entry.contractorId);
      if (contractor && contractor.hourlyRate) {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + (contractor.hourlyRate * hours);
      }
      return total;
    }, 0);

    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      appointments: monthEntries.length,
      revenue: monthRevenue,
      hours: monthEntries.reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0)
    };
  });

  // Performance metrics
  const performanceMetrics = {
    avgResponseTime: 2.5, // hours (simulated)
    customerSatisfaction: 4.7, // out of 5 (simulated)
    repeatBusinessRate: 78, // percentage (simulated)
    efficiencyScore: 85 // percentage (simulated)
  };

  // Top performing contractors
  const contractorPerformance = contractors.map(contractor => {
    const contractorEntries = scheduleEntries.filter(entry => entry.contractorId === contractor.id);
    const completedEntries = contractorEntries.filter(entry => entry.status === 'completed');
    const totalHours = contractorEntries.reduce((total, entry) => {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    
    const totalRevenue = contractorEntries.reduce((total, entry) => {
      if (contractor.hourlyRate) {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + (contractor.hourlyRate * hours);
      }
      return total;
    }, 0);

    return {
      name: contractor.company,
      completedJobs: completedEntries.length,
      totalJobs: contractorEntries.length,
      completionRate: contractorEntries.length > 0 ? (completedEntries.length / contractorEntries.length) * 100 : 0,
      totalHours,
      totalRevenue,
      avgRating: 4.2 + Math.random() * 0.8 // Simulated rating
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // Service type analysis
  const serviceAnalysis = demoJobs.reduce((acc, job) => {
    const jobEntries = scheduleEntries.filter(entry => entry.jobId === job.id);
    const completedEntries = jobEntries.filter(entry => entry.status === 'completed');
    
    const existing = acc.find(item => item.type === job.title);
    if (existing) {
      existing.count += jobEntries.length;
      existing.completed += completedEntries.length;
      existing.revenue += jobEntries.reduce((total, entry) => {
        const contractor = contractors.find(c => c.id === entry.contractorId);
        if (contractor && contractor.hourlyRate) {
          const start = new Date(entry.startTime);
          const end = new Date(entry.endTime);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return total + (contractor.hourlyRate * hours);
        }
        return total;
      }, 0);
    } else {
      acc.push({
        type: job.title,
        count: jobEntries.length,
        completed: completedEntries.length,
        revenue: jobEntries.reduce((total, entry) => {
          const contractor = contractors.find(c => c.id === entry.contractorId);
          if (contractor && contractor.hourlyRate) {
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + (contractor.hourlyRate * hours);
          }
          return total;
        }, 0)
      });
    }
    return acc;
  }, [] as { type: string; count: number; completed: number; revenue: number }[]);

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

      {/* Advanced Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators and business metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{avgDuration.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{performanceMetrics.customerSatisfaction}/5</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{performanceMetrics.efficiencyScore}%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>
            Revenue trends and financial insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-lg font-bold">£{totalRevenue.toFixed(2)}</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `£${typeof value === 'number' ? value.toFixed(2) : value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Appointments'
                  ]} />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Top Performing Companies
          </CardTitle>
          <CardDescription>
            Companies ranked by completion rate and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractorPerformance.slice(0, 5).map((contractor, index) => (
              <div key={contractor.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{contractor.name}</div>
                    <div className="text-sm text-gray-600">
                      {contractor.completedJobs}/{contractor.totalJobs} jobs completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{contractor.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">£{contractor.totalRevenue.toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Service Performance Analysis
          </CardTitle>
          <CardDescription>
            Performance breakdown by service type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `£${typeof value === 'number' ? value.toFixed(2) : value}` : value,
                  name === 'revenue' ? 'Revenue' : name === 'completed' ? 'Completed' : 'Total'
                ]} />
                <Bar dataKey="count" fill="#8884d8" name="Total Jobs" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Users, Clock, PoundSterling, BarChart3 } from 'lucide-react';
import { Contractor, ScheduleEntry, Job } from '@/types';
import { loadScheduleEntries } from '@/lib/storage';
import { demoScheduleEntries } from '@/data/demo-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnnualOverviewProps {
  contractors: Contractor[];
  jobs: Job[];
}

export default function AnnualOverview({ contractors, jobs }: AnnualOverviewProps) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Load schedule entries from localStorage
  useEffect(() => {
    const loadedEntries = loadScheduleEntries(demoScheduleEntries);
    setScheduleEntries(loadedEntries);
  }, []);

  // Get available years from schedule entries
  const availableYears = Array.from(
    new Set(scheduleEntries.map(entry => new Date(entry.startTime).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter entries for selected year
  const yearlyEntries = scheduleEntries.filter(entry => 
    new Date(entry.startTime).getFullYear() === selectedYear
  );

  // Calculate yearly statistics
  const yearlyStats = {
    totalJobs: yearlyEntries.length,
    totalHours: yearlyEntries.reduce((sum, entry) => {
      const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0),
    totalRevenue: yearlyEntries.reduce((sum, entry) => {
      const contractor = contractors.find(c => c.id === entry.contractorId);
      const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
      return sum + (contractor && contractor.hourlyRate ? contractor.hourlyRate * duration : 0);
    }, 0),
    uniqueContractors: new Set(yearlyEntries.map(entry => entry.contractorId)).size,
    completedJobs: yearlyEntries.filter(entry => entry.status === 'completed').length,
    cancelledJobs: yearlyEntries.filter(entry => entry.status === 'cancelled').length,
  };

  // Monthly breakdown data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = yearlyEntries.filter(entry => 
      new Date(entry.startTime).getMonth() === i
    );
    const monthRevenue = monthEntries.reduce((sum, entry) => {
      const contractor = contractors.find(c => c.id === entry.contractorId);
      const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
      return sum + (contractor && contractor.hourlyRate ? contractor.hourlyRate * duration : 0);
    }, 0);
    
    return {
      month: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
      jobs: monthEntries.length,
      hours: monthEntries.reduce((sum, entry) => {
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0),
      revenue: monthRevenue,
    };
  });

  // Contractor performance data
  const contractorPerformance = contractors.map(contractor => {
    const contractorEntries = yearlyEntries.filter(entry => entry.contractorId === contractor.id);
    const totalHours = contractorEntries.reduce((sum, entry) => {
      const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);
    const totalRevenue = totalHours * (contractor.hourlyRate || 0);
    const completedJobs = contractorEntries.filter(entry => entry.status === 'completed').length;
    
    return {
      name: contractor.name,
      company: contractor.company,
      jobs: contractorEntries.length,
      hours: totalHours,
      revenue: totalRevenue,
      completionRate: contractorEntries.length > 0 ? (completedJobs / contractorEntries.length) * 100 : 0,
    };
  }).filter(contractor => contractor.jobs > 0).sort((a, b) => b.revenue - a.revenue);

  // Job type distribution
  const jobTypeData = jobs.map(job => {
    const jobEntries = yearlyEntries.filter(entry => entry.jobId === job.id);
    return {
      name: job.title,
      value: jobEntries.length,
      revenue: jobEntries.reduce((sum, entry) => {
        const contractor = contractors.find(c => c.id === entry.contractorId);
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        return sum + (contractor && contractor.hourlyRate ? contractor.hourlyRate * duration : 0);
      }, 0),
    };
  }).filter(job => job.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Completed', value: yearlyStats.completedJobs, color: '#10B981' },
    { name: 'Cancelled', value: yearlyStats.cancelledJobs, color: '#EF4444' },
    { name: 'Pending', value: yearlyStats.totalJobs - yearlyStats.completedJobs - yearlyStats.cancelledJobs, color: '#F59E0B' },
  ].filter(status => status.value > 0);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Annual Overview
          </CardTitle>
          <CardDescription>
            Comprehensive yearly analysis of contractor performance and business metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="year-select" className="text-sm font-medium">
              Select Year:
            </label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{yearlyStats.totalJobs}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{yearlyStats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">£{yearlyStats.totalRevenue.toLocaleString()}</p>
              </div>
              <PoundSterling className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold">{yearlyStats.uniqueContractors}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Trends - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `£${value.toLocaleString()}` : value,
                    name === 'jobs' ? 'Services' : name === 'hours' ? 'Hours' : 'Revenue'
                  ]}
                />
                <Line type="monotone" dataKey="jobs" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contractor Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Companies - {selectedYear}</CardTitle>
          <CardDescription>Ranked by total revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractorPerformance.slice(0, 5).map((contractor, index) => (
              <div key={contractor.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{contractor.name}</h3>
                    <p className="text-sm text-gray-600">{contractor.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Services</p>
                    <p className="font-semibold">{contractor.jobs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Hours</p>
                    <p className="font-semibold">{contractor.hours}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-semibold">£{contractor.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completion</p>
                    <Badge variant={contractor.completionRate >= 90 ? "default" : contractor.completionRate >= 70 ? "secondary" : "destructive"}>
                      {contractor.completionRate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Type Analysis */}
      {jobTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Type Analysis - {selectedYear}</CardTitle>
            <CardDescription>Distribution of services by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Service Count</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={jobTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Revenue by Service Type</h3>
                <div className="space-y-3">
                  {jobTypeData.map((job, index) => (
                    <div key={job.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{job.name}</span>
                      </div>
                      <span className="font-semibold">£{job.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

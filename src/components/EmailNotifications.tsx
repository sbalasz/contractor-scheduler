"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Bell, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ScheduleEntry, Contractor } from '@/types';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/ui/loading';

interface EmailNotificationProps {
  scheduleEntries: ScheduleEntry[];
  contractors: Contractor[];
}

interface NotificationSettings {
  enabled: boolean;
  emailAddress: string;
  reminderTime: number; // hours before appointment
  reminderTypes: {
    upcoming: boolean;
    overdue: boolean;
    completed: boolean;
  };
}

interface NotificationLog {
  id: string;
  scheduleEntryId: string;
  type: 'upcoming' | 'overdue' | 'completed';
  sentAt: Date;
  status: 'sent' | 'failed';
  message: string;
}

export default function EmailNotifications({ scheduleEntries, contractors }: EmailNotificationProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    emailAddress: '',
    reminderTime: 24,
    reminderTypes: {
      upcoming: true,
      overdue: false,
      completed: false,
    }
  });

  const [notificationLog, setNotificationLog] = useState<NotificationLog[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('email-notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('email-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Simulate email sending
  const sendEmailNotification = async (entry: ScheduleEntry, type: 'upcoming' | 'overdue' | 'completed') => {
    const contractor = contractors.find(c => c.id === entry.contractorId);
    const startTime = new Date(entry.startTime);
    
    let subject = '';
    let message = '';
    
    switch (type) {
      case 'upcoming':
        subject = `Upcoming Appointment Reminder - ${contractor?.company || 'Unknown Company'}`;
        message = `Reminder: You have an appointment scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}.`;
        break;
      case 'overdue':
        subject = `Overdue Appointment - ${contractor?.company || 'Unknown Company'}`;
        message = `Alert: You have an overdue appointment that was scheduled for ${startTime.toLocaleDateString()}.`;
        break;
      case 'completed':
        subject = `Appointment Completed - ${contractor?.company || 'Unknown Company'}`;
        message = `Confirmation: Your appointment scheduled for ${startTime.toLocaleDateString()} has been marked as completed.`;
        break;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the notification
    const logEntry: NotificationLog = {
      id: Date.now().toString(),
      scheduleEntryId: entry.id,
      type,
      sentAt: new Date(),
      status: 'sent',
      message: `${subject}: ${message}`
    };
    
    setNotificationLog(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50
    return logEntry;
  };

  // Check for upcoming appointments
  const checkUpcomingAppointments = async () => {
    if (!settings.enabled || !settings.emailAddress) {
      toast.error('Please enable notifications and enter an email address');
      return;
    }

    const now = new Date();
    const reminderTime = new Date(now.getTime() + settings.reminderTime * 60 * 60 * 1000);

    const upcomingEntries = scheduleEntries.filter(entry => {
      const startTime = new Date(entry.startTime);
      return startTime > now && startTime <= reminderTime && entry.status === 'scheduled';
    });

    if (upcomingEntries.length === 0) {
      toast.info('No upcoming appointments found within the reminder timeframe');
      return;
    }

    setIsSending(true);
    
    try {
      for (const entry of upcomingEntries) {
        await sendEmailNotification(entry, 'upcoming');
      }
      
      toast.success(`Sent ${upcomingEntries.length} reminder email(s) to ${settings.emailAddress}`);
    } catch (_error) {
      toast.error('Failed to send some notifications');
    } finally {
      setIsSending(false);
    }
  };

  // Check for overdue appointments
  const checkOverdueAppointments = async () => {
    if (!settings.enabled || !settings.emailAddress) {
      toast.error('Please enable notifications and enter an email address');
      return;
    }

    const now = new Date();
    const overdueEntries = scheduleEntries.filter(entry => {
      const startTime = new Date(entry.startTime);
      return startTime < now && entry.status === 'scheduled';
    });

    if (overdueEntries.length === 0) {
      toast.info('No overdue appointments found');
      return;
    }

    setIsSending(true);
    
    try {
      for (const entry of overdueEntries) {
        await sendEmailNotification(entry, 'overdue');
      }
      
      toast.success(`Sent ${overdueEntries.length} overdue notification(s) to ${settings.emailAddress}`);
    } catch (_error) {
      toast.error('Failed to send some notifications');
    } finally {
      setIsSending(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!settings.emailAddress) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate test email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the test email
      const logEntry: NotificationLog = {
        id: Date.now().toString(),
        scheduleEntryId: 'test',
        type: 'upcoming',
        sentAt: new Date(),
        status: 'sent',
        message: `Test email sent to ${settings.emailAddress}`
      };
      
      setNotificationLog(prev => [logEntry, ...prev.slice(0, 49)]);
      toast.success(`Test email sent successfully to ${settings.emailAddress}!`);
    } catch (_error) {
      toast.error('Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notification Settings
          </CardTitle>
          <CardDescription>
            Configure email notifications for appointment reminders and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notifications">Enable Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Send automatic email reminders for appointments
              </p>
            </div>
            <Switch
              id="enable-notifications"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email-address">Email Address</Label>
            <Input
              id="email-address"
              type="email"
              placeholder="your-email@example.com"
              value={settings.emailAddress}
              onChange={(e) => setSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
              disabled={!settings.enabled}
              required
            />
            {settings.emailAddress && !settings.emailAddress.includes('@') && (
              <p className="text-sm text-red-500">Please enter a valid email address</p>
            )}
          </div>

          {/* Reminder Time */}
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Reminder Time</Label>
            <Select
              value={settings.reminderTime.toString()}
              onValueChange={(value) => setSettings(prev => ({ ...prev, reminderTime: parseInt(value) }))}
              disabled={!settings.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour before</SelectItem>
                <SelectItem value="24">24 hours before</SelectItem>
                <SelectItem value="48">48 hours before</SelectItem>
                <SelectItem value="168">1 week before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <Label>Notification Types</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="upcoming-reminders">Upcoming Appointments</Label>
                  <p className="text-sm text-gray-500">Remind about upcoming appointments</p>
                </div>
                <Switch
                  id="upcoming-reminders"
                  checked={settings.reminderTypes.upcoming}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    reminderTypes: { ...prev.reminderTypes, upcoming: checked }
                  }))}
                  disabled={!settings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="overdue-reminders">Overdue Appointments</Label>
                  <p className="text-sm text-gray-500">Alert about overdue appointments</p>
                </div>
                <Switch
                  id="overdue-reminders"
                  checked={settings.reminderTypes.overdue}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    reminderTypes: { ...prev.reminderTypes, overdue: checked }
                  }))}
                  disabled={!settings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="completed-notifications">Completed Appointments</Label>
                  <p className="text-sm text-gray-500">Confirm when appointments are completed</p>
                </div>
                <Switch
                  id="completed-notifications"
                  checked={settings.reminderTypes.completed}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    reminderTypes: { ...prev.reminderTypes, completed: checked }
                  }))}
                  disabled={!settings.enabled}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <LoadingButton
              isLoading={isSending}
              onClick={sendTestEmail}
              disabled={!settings.enabled || !settings.emailAddress || isSending}
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email
            </LoadingButton>
            <LoadingButton
              isLoading={isSending}
              onClick={checkUpcomingAppointments}
              disabled={!settings.enabled || !settings.emailAddress || isSending}
            >
              <Bell className="h-4 w-4 mr-2" />
              Check Upcoming
            </LoadingButton>
            <LoadingButton
              isLoading={isSending}
              onClick={checkOverdueAppointments}
              disabled={!settings.enabled || !settings.emailAddress || isSending}
              variant="destructive"
            >
              <Clock className="h-4 w-4 mr-2" />
              Check Overdue
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Notification Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Log
          </CardTitle>
          <CardDescription>
            Recent email notifications sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationLog.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificationLog.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {log.sentAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

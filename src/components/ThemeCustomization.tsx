"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette, Monitor, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  sidebarCollapsed: boolean;
  animations: boolean;
}

const defaultTheme: ThemeSettings = {
  mode: 'light',
  primaryColor: '#3b82f6', // blue-500
  accentColor: '#10b981', // emerald-500
  fontSize: 'medium',
  compactMode: false,
  sidebarCollapsed: false,
  animations: true,
};

const colorPresets = [
  { name: 'Blue', value: '#3b82f6', description: 'Default blue theme' },
  { name: 'Green', value: '#10b981', description: 'Emerald green theme' },
  { name: 'Purple', value: '#8b5cf6', description: 'Purple theme' },
  { name: 'Red', value: '#ef4444', description: 'Red theme' },
  { name: 'Orange', value: '#f97316', description: 'Orange theme' },
  { name: 'Pink', value: '#ec4899', description: 'Pink theme' },
  { name: 'Indigo', value: '#6366f1', description: 'Indigo theme' },
  { name: 'Teal', value: '#14b8a6', description: 'Teal theme' },
];

const accentPresets = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Cyan', value: '#06b6d4' },
];

export default function ThemeCustomization() {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#3b82f6');
  const [customAccentColor, setCustomAccentColor] = useState('#10b981');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-settings');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      setTheme(parsedTheme);
      setCustomPrimaryColor(parsedTheme.primaryColor);
      setCustomAccentColor(parsedTheme.accentColor);
      applyTheme(parsedTheme);
    }
  }, []);

  // Apply theme to document
  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply color scheme
    if (themeSettings.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (themeSettings.mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System mode - let CSS handle it
      root.classList.remove('light', 'dark');
    }

    // Apply custom colors
    root.style.setProperty('--primary', themeSettings.primaryColor);
    root.style.setProperty('--accent', themeSettings.accentColor);

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[themeSettings.fontSize]);

    // Apply compact mode
    if (themeSettings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Apply animations
    if (!themeSettings.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
  };

  // Save theme to localStorage
  const saveTheme = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    localStorage.setItem('theme-settings', JSON.stringify(newTheme));
    applyTheme(newTheme);
    toast.success('Theme settings saved!');
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    saveTheme({ ...theme, mode });
  };

  const handlePrimaryColorChange = (color: string) => {
    saveTheme({ ...theme, primaryColor: color });
  };

  const handleAccentColorChange = (color: string) => {
    saveTheme({ ...theme, accentColor: color });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    saveTheme({ ...theme, fontSize });
  };

  const handleToggleSetting = (key: keyof ThemeSettings, value: boolean) => {
    saveTheme({ ...theme, [key]: value });
  };

  const resetTheme = () => {
    saveTheme(defaultTheme);
    setCustomPrimaryColor(defaultTheme.primaryColor);
    setCustomAccentColor(defaultTheme.accentColor);
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Theme Mode
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Light Mode</Label>
                <p className="text-sm text-gray-500">Clean and bright interface</p>
              </div>
              <Switch
                checked={theme.mode === 'light'}
                onCheckedChange={() => handleModeChange('light')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-500">Easy on the eyes in low light</p>
              </div>
              <Switch
                checked={theme.mode === 'dark'}
                onCheckedChange={() => handleModeChange('dark')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Mode</Label>
                <p className="text-sm text-gray-500">Follows your system preference</p>
              </div>
              <Switch
                checked={theme.mode === 'system'}
                onCheckedChange={() => handleModeChange('system')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Customization
          </CardTitle>
          <CardDescription>
            Customize the primary and accent colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div className="space-y-3">
            <Label>Primary Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePrimaryColorChange(preset.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme.primaryColor === preset.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={preset.description}
                >
                  <div
                    className="w-full h-8 rounded"
                    style={{ backgroundColor: preset.value }}
                  />
                  <p className="text-xs mt-1 text-center">{preset.name}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={customPrimaryColor}
                onChange={(e) => {
                  setCustomPrimaryColor(e.target.value);
                  handlePrimaryColorChange(e.target.value);
                }}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={customPrimaryColor}
                onChange={(e) => {
                  setCustomPrimaryColor(e.target.value);
                  handlePrimaryColorChange(e.target.value);
                }}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <Label>Accent Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {accentPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleAccentColorChange(preset.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme.accentColor === preset.value
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded"
                    style={{ backgroundColor: preset.value }}
                  />
                  <p className="text-xs mt-1 text-center">{preset.name}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={customAccentColor}
                onChange={(e) => {
                  setCustomAccentColor(e.target.value);
                  handleAccentColorChange(e.target.value);
                }}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={customAccentColor}
                onChange={(e) => {
                  setCustomAccentColor(e.target.value);
                  handleAccentColorChange(e.target.value);
                }}
                placeholder="#10b981"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize the interface appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={theme.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => handleFontSizeChange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (14px)</SelectItem>
                <SelectItem value="medium">Medium (16px)</SelectItem>
                <SelectItem value="large">Large (18px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-500">Reduce spacing for more content</p>
            </div>
            <Switch
              checked={theme.compactMode}
              onCheckedChange={(checked) => handleToggleSetting('compactMode', checked)}
            />
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <p className="text-sm text-gray-500">Enable smooth transitions and effects</p>
            </div>
            <Switch
              checked={theme.animations}
              onCheckedChange={(checked) => handleToggleSetting('animations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reset to Default</h3>
              <p className="text-sm text-gray-500">Restore all theme settings to default values</p>
            </div>
            <Button variant="outline" onClick={resetTheme}>
              Reset Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

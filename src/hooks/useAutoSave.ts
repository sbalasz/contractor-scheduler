"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions<T = Record<string, unknown>> {
  data: T;
  onSave: (data: T) => void;
  delay?: number;
  enabled?: boolean;
  storageKey?: string;
}

export function useAutoSave<T = Record<string, unknown>>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  storageKey
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef<string>('');

  // Save to localStorage if storageKey is provided
  const saveToStorage = useCallback((dataToSave: T) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, [storageKey]);

  // Load from localStorage if storageKey is provided
  const loadFromStorage = useCallback(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
    }
    return null;
  }, [storageKey]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !data) return;

    const dataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataString === lastSavedRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        onSave(data);
        saveToStorage(data);
        lastSavedRef.current = dataString;
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, delay);

    // Cleanup timeout on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, saveToStorage]);

  // Manual save function
  const manualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      onSave(data);
      saveToStorage(data);
      lastSavedRef.current = JSON.stringify(data);
    } catch (error) {
      console.warn('Manual save failed:', error);
    }
  }, [data, onSave, saveToStorage]);

  return {
    manualSave,
    loadFromStorage,
    isDirty: JSON.stringify(data) !== lastSavedRef.current
  };
}

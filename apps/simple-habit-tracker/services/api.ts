/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 * Automatically converts between snake_case (Rails) and camelCase (JS)
 */

import { storage } from './storage';

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Deep convert object keys from snake_case to camelCase
 */
function keysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamelCase(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = keysToCamelCase(obj[key]);
    }
  }
  return result;
}

/**
 * Deep convert object keys from camelCase to snake_case
 */
function keysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnakeCase(item));
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = keysToSnakeCase(obj[key]);
    }
  }
  return result;
}

class ApiService {
  private async request<T>(
    url: string,
    options: RequestInit = {},
    skipJsonConversion: boolean = false
  ): Promise<T> {
    const token = await storage.get('session_token');
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData (browser sets it automatically with boundary)
    if (!skipJsonConversion) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // For 204 No Content or empty responses, return null
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        return null as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
      }

      // Convert snake_case response from Rails to camelCase for JS
      return keysToCamelCase(data);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    // For FormData (file uploads), pass directly without conversion
    if (data instanceof FormData) {
      // Browser will automatically set correct Content-Type with boundary
      const { headers: _ignoredHeaders, ...restOptions } = options || {};
      return this.request<T>(
        url,
        {
          method: 'POST',
          body: data,
          ...restOptions,
        },
        true // Skip Content-Type header for FormData
      );
    }

    // Regular JSON POST
    const snakeCaseData = data ? keysToSnakeCase(data) : undefined;
    return this.request<T>(url, {
      method: 'POST',
      body: snakeCaseData ? JSON.stringify(snakeCaseData) : undefined,
      ...options,
    });
  }

  async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    // For FormData (file uploads), pass directly without conversion
    if (data instanceof FormData) {
      const { headers: _ignoredHeaders, ...restOptions } = options || {};
      return this.request<T>(
        url,
        {
          method: 'PUT',
          body: data,
          ...restOptions,
        },
        true // Skip Content-Type header for FormData
      );
    }

    // Convert camelCase request to snake_case for Rails
    const snakeCaseData = data ? keysToSnakeCase(data) : undefined;
    return this.request<T>(url, {
      method: 'PUT',
      body: snakeCaseData ? JSON.stringify(snakeCaseData) : undefined,
      ...options,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const api = new ApiService();

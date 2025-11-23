/**
 * Error Handler - All-in-one error handling system
 *
 * Features:
 * - Automatic capture: JS errors, promise rejections, network errors
 * - React Error Boundary component included
 * - Simple API: just call errorHandler.init() once
 *
 * Usage:
 * 1. In app/_layout.tsx: errorHandler.init()
 * 2. Wrap app with: <ErrorBoundary><App /></ErrorBoundary>
 * 3. In API calls: errorHandler.reportNetwork(method, url, status, data)
 * 4. Manual report: errorHandler.report(error, context)
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Type declarations for React Native global
declare const __DEV__: boolean;

// ==================== Stack Trace Utilities ====================

/**
 * Parse stack trace line to extract file location
 */
function parseStackLine(line: string): { file: string; line: number; column: number } | null {
  // Match common stack trace formats:
  // at functionName (http://localhost:3000/bundle.js:123:45)
  // at http://localhost:3000/bundle.js:123:45
  const match = line.match(/(?:at\s+)?(?:.*?\s+)?\(?([^)]+):(\d+):(\d+)\)?/);

  if (!match) return null;

  return {
    file: match[1],
    line: parseInt(match[2], 10),
    column: parseInt(match[3], 10)
  };
}

/**
 * Symbolicate stack trace using Expo's symbolication endpoint
 */
async function symbolicateStackTrace(stack: string): Promise<string> {
  try {
    const lines = stack.split('\n');
    const parsedLines = lines.map(parseStackLine).filter(Boolean);

    if (parsedLines.length === 0) return stack;

    // Use Expo's symbolication service in dev mode
    if (__DEV__ && typeof window !== 'undefined') {
      const response = await fetch('http://localhost:8081/symbolicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack: lines })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.stack) {
          return result.stack.join('\n');
        }
      }
    }

    // Fallback: return original stack
    return stack;
  } catch (error) {
    // Symbolication failed, return original stack
    return stack;
  }
}

/**
 * Format stack trace - limit lines and apply source maps if available
 */
async function formatStackTraceAsync(stack: string | undefined, maxLines: number = 5): Promise<string> {
  if (!stack) return '';

  // Try to symbolicate in dev mode
  let processedStack = stack;
  if (__DEV__) {
    try {
      processedStack = await symbolicateStackTrace(stack);
    } catch {
      // Use original stack if symbolication fails
    }
  }

  const lines = processedStack.split('\n');
  const limitedLines = lines.slice(0, maxLines);

  return limitedLines.join('\n');
}

/**
 * Synchronous version - returns original stack immediately
 * Use this for immediate rendering, then update with async version
 */
function formatStackTrace(stack: string | undefined, maxLines: number = 5): string {
  if (!stack) return '';

  const lines = stack.split('\n');
  const limitedLines = lines.slice(0, maxLines);

  return limitedLines.join('\n');
}

// ==================== Core Error Handler ====================

interface ErrorRecord {
  id: string;
  message: string;
  stack?: string;
  context?: any;
  timestamp: number;
  count: number;
}

type ErrorChangeListener = (errors: ErrorRecord[]) => void;

class ErrorHandler {
  private errors: ErrorRecord[] = [];
  private maxErrors = 50;
  private isInitialized = false;
  private isDev = __DEV__;
  private listeners: Set<ErrorChangeListener> = new Set();
  private isNotifying = false; // Prevent recursive notifications

  // Patterns of errors that should be ignored (common development noise)
  private ignoredErrorPatterns = [
    /Requiring unknown module.*undefined/i, // Metro bundler issue
    /Metro.*restart/i, // Metro restart suggestions
    /Try restarting Metro/i, // Metro restart suggestions
  ];

  constructor() {
    // Auto-initialize to suppress RedBox as early as possible
    this.suppressRedBox();
    // Setup promise rejection handler early to override RedBox
    this.setupPromiseRejectionHandler();
  }

  /**
   * Check if an error should be ignored based on patterns
   */
  private shouldIgnoreError(message: string): boolean {
    return this.ignoredErrorPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Suppress RedBox immediately (called in constructor)
   */
  private suppressRedBox() {
    const win = window as any;

    // Only patch once (for hot reload)
    if (!win.__consoleErrorPatched) {
      console.error = (...args: any[]) => {
        console.log('[Error]', ...args);

        const firstArg = args[0];

        if (firstArg instanceof Error) {
          // Error object
          this.handleError({
            message: firstArg.message,
            stack: firstArg.stack,
          });
        } else if (typeof firstArg === 'string' && args[1] instanceof Error) {
          // String + Error pattern: console.error('Failed to...', error)
          this.handleError({
            message: `${firstArg} ${args[1].message}`,
            stack: args[1].stack,
          });
        } else {
          // Any other console.error (strings, objects, etc)
          const message = args.map(arg =>
            typeof arg === 'string' ? arg : JSON.stringify(arg)
          ).join(' ');

          // Parse React warning format which embeds stack trace in message
          // Format: "Warning: message%s\n    at Component (url:line:col)\n    at ..."
          const stackMatch = message.match(/(%s)?\s*\n\s+at\s+/);
          if (stackMatch) {
            // Extract message and stack separately
            const parts = message.split(/\n\s+at\s+/);
            const cleanMessage = parts[0].replace(/%s\s*$/, '').trim();
            const stackLines = parts.slice(1).map(line => `    at ${line}`);

            this.handleError({
              message: cleanMessage,
              stack: stackLines.join('\n'),
            });
          } else {
            this.handleError({ message });
          }
        }
      };
      win.__consoleErrorPatched = true;
    }

    // Handle global JS errors (React Native)
    const ErrorUtils = (globalThis as any).ErrorUtils;
    if (ErrorUtils && !win.__errorUtilsPatched) {
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        this.handleError({
          message: error.message,
          stack: error.stack,
          context: { isFatal },
        });
      });

      // Lock the handler
      ErrorUtils.setGlobalHandler = () => {};
      win.__errorUtilsPatched = true;
    }
  }

  /**
   * Initialize - call once in app root
   */
  init() {
    if (this.isInitialized) return;

    // Intercept fetch for automatic network error handling
    this.interceptFetch();

    this.isInitialized = true;
  }

  private setupPromiseRejectionHandler() {
    if (!window?.addEventListener) return;

    const win = window as any;
    if (win.__promiseRejectionPatched) return;

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation?.();

      const { reason } = event;
      this.handleError({
        message: `Unhandled Promise: ${reason instanceof Error ? reason.message : String(reason)}`,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    }, true);

    win.__promiseRejectionPatched = true;
  }

  private interceptFetch() {
    const win = window as any;
    if (win.__fetchPatched) return;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
      const method = (args[1]?.method || 'GET').toUpperCase();
      const url = args[0].toString();

      try {
        const response = await originalFetch(...args);

        if (response.status >= 400) {
          const data = await response.clone().text();
          this.handleError({
            message: `${method} ${url} - HTTP ${response.status}`,
            context: { method, url, status: response.status, response: data },
          });
        }

        return response;
      } catch (error) {
        this.handleError({
          message: `${method} ${url} - Network failed`,
          context: { method, url },
        });
        throw error;
      }
    };

    win.__fetchPatched = true;
  }

  /**
   * Report error manually (if needed)
   */
  report(error: Error | string, context?: any) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    this.handleError({ message, stack, context });
  }

  /**
   * Get all errors (for debugging)
   */
  getErrors(): ErrorRecord[] {
    return this.errors;
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to error changes (for UI components)
   */
  subscribe(listener: ErrorChangeListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of error changes
   * Deferred to avoid "Cannot update during render" warnings
   */
  private notifyListeners() {
    // Prevent recursive notifications that could cause infinite loops
    if (this.isNotifying) return;

    // Defer to next microtask to avoid updating during render
    queueMicrotask(() => {
      this.isNotifying = true;
      try {
        this.listeners.forEach((listener) => {
          try {
            listener([...this.errors]);
          } catch (err) {
            // Silently catch listener errors to prevent infinite loops
            console.log('[ErrorHandler] Listener error:', err);
          }
        });
      } finally {
        this.isNotifying = false;
      }
    });
  }

  // ==================== Private Methods ====================

  private handleError(info: {
    message: string;
    stack?: string;
    context?: any;
  }) {
    // Ignore errors that match ignoredErrorPatterns
    if (this.shouldIgnoreError(info.message)) {
      // Still log to console in dev for debugging
      if (this.isDev) {
        console.log('[ErrorHandler] Ignored:', info.message);
      }
      return;
    }

    // Check duplicate
    const existing = this.errors.find(
      (e) => e.message === info.message && e.stack === info.stack
    );

    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      this.errors.unshift({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: info.message,
        stack: info.stack,
        context: info.context,
        timestamp: Date.now(),
        count: 1,
      });

      if (this.errors.length > this.maxErrors) {
        this.errors = this.errors.slice(0, this.maxErrors);
      }
    }

    // Log to console (only in dev) - use console.log to avoid triggering RedBox
    if (this.isDev) {
      console.log('[ErrorHandler]', info.message, info.context);
    }

    // Notify UI listeners
    this.notifyListeners();

    // TODO: Send to remote service (Sentry, etc)
    // this.sendToRemote(info);
  }
}

// Singleton instance - preserved across hot reloads
const g = globalThis as any;
if (!g.__errorHandlerInstance) {
  g.__errorHandlerInstance = new ErrorHandler();
}
export const errorHandler: ErrorHandler = g.__errorHandlerInstance;

// ==================== React Error Boundary ====================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  showStack: boolean;
  copied: boolean;
  symbolicatedStack?: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private copyTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      showStack: false,
      copied: false
    };
  }

  componentWillUnmount() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, showStack: false, copied: false, symbolicatedStack: undefined };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorHandler.report(error, {
      componentStack: errorInfo.componentStack,
    });

    // Try to symbolicate stack trace
    if (__DEV__ && error.stack) {
      formatStackTraceAsync(error.stack, 10).then(symbolicated => {
        this.setState({ symbolicatedStack: symbolicated });
      }).catch(() => {
        // Symbolication failed, use original stack
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, showStack: false, copied: false, symbolicatedStack: undefined });
  };

  handleToggleStack = () => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  handleCopyError = async () => {
    const error = this.state.error;
    if (!error) return;

    const report = `Frontend Error Report
─────────────
Message: ${error.message}
Time: ${new Date().toLocaleString()}

${error.stack ? `Stack Trace:\n${error.stack}\n` : ''}
Please help me analyze and fix this issue.`;

    await Clipboard.setStringAsync(report);

    // Show "Copied" feedback for 2 seconds
    this.setState({ copied: true });
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    this.copyTimeout = setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, showStack, copied, symbolicatedStack } = this.state;
      // Use symbolicated stack if available, otherwise use formatted original stack
      const displayStack = symbolicatedStack || formatStackTrace(error?.stack, 5);

      return (
        <View className="flex-1 items-center justify-center p-6 bg-surface">
          <View className="w-full max-w-md">
            <Text className="text-4xl mb-4 text-center">⚠️</Text>

            {/* Error Title */}
            <Text className="text-xl font-bold text-text-primary mb-3 text-center px-4">
              {error?.message || 'An unexpected error occurred'}
            </Text>

            {/* Subtitle */}
            <Text className="text-sm text-text-secondary mb-6 text-center">
              Please copy the error and paste it to your AI chatbot for help
            </Text>

            {/* Copy Error Button */}
            <Pressable
              onPress={this.handleCopyError}
              className="bg-primary py-3 px-6 rounded-lg active:opacity-80 mb-4"
            >
              <Text className="text-text-inverse text-center font-semibold">
                {copied ? 'Copied' : 'Copy Error'}
              </Text>
            </Pressable>

            {/* Stack Trace Toggle */}
            {__DEV__ && displayStack ? <View className="w-full">
              <Pressable
                onPress={this.handleToggleStack}
                className="flex-row items-center justify-center gap-2 py-2 mb-2"
              >
                <Text className="text-sm font-medium text-text-secondary">
                    Stack Trace
                </Text>
                <Text className="text-text-secondary">
                  {showStack ? '▼' : '▶'}
                </Text>
              </Pressable>

              {showStack ? <ScrollView className="max-h-64 p-4 bg-surface-elevated rounded-lg border border-border">
                <Text className="text-xs text-text-muted font-mono leading-4">
                  {displayStack}
                </Text>
              </ScrollView> : null}
            </View> : null}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// ==================== Error Status Bar ====================

interface ErrorStatusBarState {
  errors: ErrorRecord[];
  isExpanded: boolean;
  expandedErrorId: string | null;
  copiedAll: boolean;
  copiedErrorId: string | null;
  showTip: boolean;
}

export class ErrorStatusBar extends Component<{}, ErrorStatusBarState> {
  private unsubscribe?: () => void;

  constructor(props: {}) {
    super(props);
    this.state = {
      errors: errorHandler.getErrors(),
      isExpanded: false,
      expandedErrorId: null,
      copiedAll: false,
      copiedErrorId: null,
      showTip: false,
    };
  }

  componentDidMount() {
    // Subscribe to error changes
    this.unsubscribe = errorHandler.subscribe((errors) => {
      this.setState({ errors });
    });
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  handleToggle = () => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
  };

  handleToggleTip = () => {
    this.setState((prev) => ({ showTip: !prev.showTip }));
  };

  handleClear = () => {
    errorHandler.clear();
    this.setState({ isExpanded: false, expandedErrorId: null });
  };

  handleCopyError = async (error: ErrorRecord) => {
    const report = this.generateErrorReport(error);
    await Clipboard.setStringAsync(report);

    // Show "Copied" feedback
    this.setState({ copiedErrorId: error.id });
    setTimeout(() => {
      this.setState({ copiedErrorId: null });
    }, 2000);
  };

  handleCopyAllErrors = async () => {
    const report = this.generateAllErrorsReport();
    await Clipboard.setStringAsync(report);

    // Show "Copied" feedback
    this.setState({ copiedAll: true });
    setTimeout(() => {
      this.setState({ copiedAll: false });
    }, 2000);
  };

  handleToggleDetails = (errorId: string) => {
    this.setState((prev) => ({
      expandedErrorId: prev.expandedErrorId === errorId ? null : errorId,
    }));
  };

  generateErrorReport(error: ErrorRecord): string {
    let report = `Frontend Error Report
─────────────
Message: ${error.message}
Time: ${new Date(error.timestamp).toLocaleString()}
Count: ${error.count}x
`;

    if (error.stack) {
      report += `\nStack Trace:\n${error.stack}`;
    }

    if (error.context) {
      report += `\nContext:\n${JSON.stringify(error.context, null, 2)}`;
    }

    report += '\n\nPlease help me analyze and fix this issue.';
    return report;
  }

  generateAllErrorsReport(): string {
    const { errors } = this.state;
    const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);

    let report = `Frontend Error Report - All Errors
════════════════════════════════════
Time: ${new Date().toLocaleString()}
Total Errors: ${totalErrors} (${errors.length} unique)

`;

    errors.forEach((error, index) => {
      const countText = error.count > 1 ? ` (${error.count}x)` : '';
      report += `Error ${index + 1}${countText}:
─────────────
${error.message}

`;

      if (error.stack) {
        report += `Stack Trace:\n${error.stack.substring(0, 500)}${error.stack.length > 500 ? '...' : ''}\n\n`;
      }

      if (error.context) {
        report += `Context:\n${JSON.stringify(error.context, null, 2).substring(0, 300)}\n\n`;
      }

      report += `Time: ${new Date(error.timestamp).toLocaleString()}\n\n`;
    });

    report += 'Please help me analyze and fix these issues.';
    return report;
  }

  render() {
    const { errors, isExpanded, expandedErrorId, copiedAll, copiedErrorId, showTip } =
      this.state;
    const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);

    // Hide if no errors
    if (totalErrors === 0) return null;

    return (
      <View className="absolute bottom-0 left-0 right-0 bg-surface-elevated border-t-2 border-danger shadow-lg">
        {/* Status Bar Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={this.handleToggle}
            className="flex-row items-center gap-2"
          >
            <Text className="text-lg">🔴</Text>
            <Text className="text-sm font-medium text-danger">
              Error detected ({totalErrors})
            </Text>

            {/* Tip Icon */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                this.handleToggleTip();
              }}
              onHoverIn={() => this.setState({ showTip: true })}
              onHoverOut={() => this.setState({ showTip: false })}
              className="relative ml-1"
            >
              <Text className="text-base text-text-secondary">ⓘ</Text>
              {showTip ? <View className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg shadow-lg min-w-[200px] z-50">
                <Text className="text-xs text-text-primary mb-1">
                    Copy errors and paste to AI chatbot for help
                </Text>
                <Text className="text-xs text-text-secondary">
                    💡 Tip: Shake device to reload app (iOS/Android)
                </Text>
              </View> : null}
            </Pressable>

            <Text className="text-text-secondary text-base ml-2">
              {isExpanded ? '↓' : '↑'}
            </Text>
          </Pressable>

          <View className="flex-1" />

          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                this.handleCopyAllErrors();
              }}
              className="px-4 py-2 bg-info rounded-lg active:opacity-70 min-w-[90px] items-center"
            >
              <Text className="text-sm font-semibold text-text-inverse">
                {copiedAll ? 'Copied' : 'Copy All'}
              </Text>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                this.handleClear();
              }}
              className="px-4 py-2 bg-danger rounded-lg active:opacity-70"
            >
              <Text className="text-sm font-semibold text-text-inverse">
                Clear
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Error List (when expanded) */}
        {isExpanded ? <ScrollView className="max-h-64 bg-surface">
          <View className="p-4 gap-3">
            {errors.map((error) => (
              <View
                key={error.id}
                className="bg-surface-elevated rounded-lg border border-border p-4"
              >
                {/* Error Summary */}
                <View className="mb-3">
                  <Text
                    className="text-sm text-text-primary font-medium mb-2 leading-5"
                    numberOfLines={3}
                  >
                    {error.message}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {new Date(error.timestamp).toLocaleTimeString()}
                    {error.count > 1 ? ` (${error.count}x)` : ''}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => this.handleCopyError(error)}
                    className="flex-1 px-4 py-3 bg-info rounded-lg active:opacity-70 items-center"
                  >
                    <Text className="text-sm font-semibold text-text-inverse">
                      {copiedErrorId === error.id ? 'Copied' : 'Copy'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => this.handleToggleDetails(error.id)}
                    className="flex-1 px-4 py-3 bg-secondary rounded-lg active:opacity-70 items-center"
                  >
                    <Text className="text-sm font-semibold text-text-inverse">
                      {expandedErrorId === error.id ? 'Hide' : 'Details'}
                    </Text>
                  </Pressable>
                </View>

                {/* Error Details (when expanded) */}
                {expandedErrorId === error.id ? <View className="mt-4 p-3 bg-surface rounded-lg border border-border">
                  {error.stack ? <View className="mb-3">
                    <Text className="text-xs font-semibold text-text-secondary mb-2">
                            Stack Trace (first 5 lines):
                    </Text>
                    <ScrollView horizontal>
                      <Text className="text-xs text-text-muted font-mono leading-4">
                        {formatStackTrace(error.stack, 5)}
                        {error.stack.split('\n').length > 5 ? '\n...' : null}
                      </Text>
                    </ScrollView>
                  </View> : null}
                  {error.context ? <View>
                    <Text className="text-xs font-semibold text-text-secondary mb-2">
                            Context:
                    </Text>
                    <Text className="text-xs text-text-muted font-mono leading-4">
                      {JSON.stringify(error.context, null, 2)}
                    </Text>
                  </View> : null}
                </View> : null}
              </View>
            ))}
          </View>
        </ScrollView> : null}
      </View>
    );
  }
}

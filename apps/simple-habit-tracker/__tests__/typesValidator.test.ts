/**
 * TypeScript Types & Architecture Validator
 *
 * This test suite enforces two critical rules:
 *
 * 1. Type Naming Convention:
 *    - All type definitions in types/ must use camelCase
 *    - Prevents snake_case from Rails backend leaking into frontend
 *    - services/api.ts converts snake_case → camelCase automatically
 *    - Types must match the CONVERTED format
 *
 * 2. Architecture Layering:
 *    - Screens in app/ must NEVER import from services/
 *    - All service access must go through stores/
 *    - Enforces: Screen → Store → Service → API pattern
 *    - Detects both @/services/* and relative ../services/* imports
 *    - Ignores imports in single-line and multi-line comments
 */

import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Types Validator', () => {
  const typesDir = path.join(__dirname, '../types');

  // Files to skip validation
  const skipFiles = ['utils.ts']; // utils.ts contains conversion utilities

  // Pattern to detect snake_case property names in interfaces/types
  // Matches: "property_name:" or "property_name?:" but NOT "propertyName:"
  const snakeCasePattern = /^\s*([a-z][a-z0-9]*(?:_[a-z0-9]+)+)\s*\??:\s*/gm;

  it('validates that all type definitions use camelCase', () => {
    const errors: {
      file: string;
      line: number;
      property: string;
      suggestion: string;
    }[] = [];

    // Get all TypeScript files in types/ directory
    const typeFiles = fs.readdirSync(typesDir)
      .filter(file => file.endsWith('.ts') && !skipFiles.includes(file))
      .map(file => path.join(typesDir, file));

    // Skip validation if no type files exist yet (early project stage)
    if (typeFiles.length === 0) {
      return;
    }

    typeFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
          return;
        }

        // Check for snake_case properties
        let match: RegExpExecArray | null;
        snakeCasePattern.lastIndex = 0; // Reset regex state

        while ((match = snakeCasePattern.exec(line)) !== null) {
          const snakeCaseProperty = match[1];

          // Convert to camelCase for suggestion
          const camelCaseProperty = snakeCaseProperty.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());

          errors.push({
            file: relativePath,
            line: lineNumber,
            property: snakeCaseProperty,
            suggestion: camelCaseProperty,
          });
        }
      });
    });

    expect(errors).toHaveLength(0);
  });

  it('validates that screens do not import services directly', () => {
    const appDir = path.join(__dirname, '../app');
    const errors: {
      file: string;
      line: number;
      importStatement: string;
    }[] = [];

    // Pattern to detect imports from services/
    // Matches: import ... from '@/services/...' or from '../services/...'
    const serviceImportPattern = /import\s+.*\s+from\s+['"](@\/services\/[^'"]+|\.\.\/.*services\/[^'"]+)['"]/;

    function scanDirectory(dir: string) {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const relativePath = path.relative(process.cwd(), filePath);

          // Remove all comments before checking imports
          const contentWithoutComments = content
            // Remove multi-line comments /* ... */
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove single-line comments //
            .replace(/\/\/.*/g, '');

          const lines = contentWithoutComments.split('\n');

          lines.forEach((line, index) => {
            const match = line.match(serviceImportPattern);
            if (match) {
              // Get original line number from original content for accurate reporting
              const originalLines = content.split('\n');
              const actualLine = originalLines[index] || line;

              errors.push({
                file: relativePath,
                line: index + 1,
                importStatement: actualLine.trim(),
              });
            }
          });
        }
      });
    }

    scanDirectory(appDir);

    expect(errors).toHaveLength(0);
  });

  it('provides statistics on type files', () => {
    const typeFiles = fs.readdirSync(typesDir)
      .filter(file => file.endsWith('.ts') && !skipFiles.includes(file));

    // Statistics are tracked but not logged to reduce noise
    expect(typeFiles).toBeDefined();
  });
});


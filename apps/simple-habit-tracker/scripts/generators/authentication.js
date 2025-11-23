const {
  say,
  fileExists,
  template,
  copyFile,
  injectIntoFile,
  appendToFile,
  showSummary,
  resetTracking,
  emptyDirectory,
} = require('./generator-utils');

/**
 * Authentication Generator
 * Generates a complete authentication system for Expo
 *
 * Usage: npm run gen authentication
 */

const GENERATOR_NAME = 'authentication';

/**
 * Check if authentication system already exists
 */
function checkIfAlreadyGenerated() {
  const authContextPath = 'contexts/AuthContext.tsx';
  const authServicePath = 'services/auth.ts';

  if (fileExists(authContextPath) && fileExists(authServicePath)) {
    say('\n' + '='.repeat(70), 'red');
    say('❌ ERROR: Authentication system has already been generated!', 'red');
    say('='.repeat(70), 'red');
    say('\nExisting files found:', 'green');
    say('  ✓ contexts/AuthContext.tsx', 'cyan');
    say('  ✓ services/auth.ts', 'cyan');
    say('  ✓ app/(auth)/ screens', 'cyan');
    say('\nIncluded features:', 'green');
    say('  - Login/Sign-up screens', 'cyan');
    say('  - Forgot password flow', 'cyan');
    say('  - Token-based authentication', 'cyan');
    say('  - Secure storage (SecureStore/localStorage)', 'cyan');
    say('\nTo regenerate, please remove these files first.', 'yellow');
    say('');
    process.exit(1);
  }
}

/**
 * Update root layout to include AuthProvider
 */
function updateRootLayout() {
  const layoutPath = 'app/_layout.tsx';

  if (!fileExists(layoutPath)) {
    say('  ⚠️  Warning: app/_layout.tsx not found, skipping...', 'yellow');
    return;
  }

  const fs = require('fs');
  const path = require('path');
  const fullPath = path.join(process.cwd(), layoutPath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if already configured
  if (content.includes("from '@/contexts/AuthContext'") && content.includes('<AuthProvider>')) {
    say('  skip  AuthProvider already configured', 'yellow');
    return;
  }

  let modified = false;

  // Step 1: Add import if not exists
  if (!content.includes("from '@/contexts/AuthContext'")) {
    injectIntoFile(
      layoutPath,
      "\nimport { AuthProvider } from '@/contexts/AuthContext';",
      { after: "import { Stack } from 'expo-router';" }
    );
    content = fs.readFileSync(fullPath, 'utf8');
    modified = true;
  }

  // Step 2: Wrap with AuthProvider if not exists
  if (!content.includes('<AuthProvider>')) {
    // Pattern: <ErrorBoundary>\n      <View
    content = content.replace(
      /(<ErrorBoundary>\s*\n\s*)(<View className="flex-1">)/,
      '$1<AuthProvider>\n        $2'
    );

    // Close AuthProvider before </ErrorBoundary>
    content = content.replace(
      /([\s]*)<\/ErrorBoundary>/,
      '      </AuthProvider>\n$1</ErrorBoundary>'
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    say('  inject  Wrapped app with AuthProvider', 'green');
    modified = true;
  }

  if (!modified) {
    say('  skip  No changes needed', 'yellow');
  }
}

/**
 * Main generator function
 */
async function generateAuthentication(name, options) {
  say('🚀 Generating authentication system...', 'green');
  say('');

  // Reset tracking
  resetTracking();

  // Check if already generated
  checkIfAlreadyGenerated();

  // 1. Generate types
  say('📝 Creating types...');
  copyFile('types.ts.template', 'types/auth.ts', {}, GENERATOR_NAME);

  // 2. Generate AuthService
  say('\n📝 Creating AuthService...');
  copyFile('auth-service.ts.template', 'services/auth.ts', {}, GENERATOR_NAME);

  // 3. Generate AuthContext
  say('\n📝 Creating AuthContext...');
  copyFile('AuthContext.tsx.template', 'contexts/AuthContext.tsx', {}, GENERATOR_NAME);

  // 4. Generate useAuth hook
  say('\n📝 Creating useAuth hook...');
  emptyDirectory('hooks');
  copyFile('useAuth.ts.template', 'hooks/useAuth.ts', {}, GENERATOR_NAME);

  // 5. Generate auth screens
  say('\n📝 Creating auth screens...');
  emptyDirectory('app/(auth)');
  copyFile('screens/sign-in.tsx.template', 'app/(auth)/sign-in.tsx', {}, GENERATOR_NAME);
  copyFile('screens/sign-up.tsx.template', 'app/(auth)/sign-up.tsx', {}, GENERATOR_NAME);
  copyFile('screens/forgot-password.tsx.template', 'app/(auth)/forgot-password.tsx', {}, GENERATOR_NAME);
  copyFile('screens/_layout.tsx.template', 'app/(auth)/_layout.tsx', {}, GENERATOR_NAME);

  // 6. Update root layout
  say('\n📝 Updating root layout...');
  updateRootLayout();

  // Show summary
  showSummary({
    title: 'Authentication system generated successfully!',
    nextSteps: [
      'Navigate to /sign-in to test login (restart server if 404)',
      'Ensure Rails backend has authentication endpoints:',
      '  POST /api/v1/login',
      '  POST /sign_up',
      '  DELETE /api/v1/logout',
      'Use useAuth() hook: const { user, login, logout } = useAuth();',
      'API URL defaults to http://localhost:3000',
      '  Override with EXPO_PUBLIC_API_URL in .env if needed',
    ],
  });

  say('💡 Features included:', 'green');
  say('  - Login/Sign-up screens');
  say('  - Forgot password flow');
  say('  - Token-based authentication');
  say('  - Secure token storage (SecureStore on mobile, localStorage on web)');
  say('  - TypeScript types');
  say('  - Auto session persistence');
  say('');
}

module.exports = generateAuthentication;

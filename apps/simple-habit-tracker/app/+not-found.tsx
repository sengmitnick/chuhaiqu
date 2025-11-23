import UnderDevelopment from '../components/UnderDevelopment';

/**
 * 404 Not Found Page
 *
 * This page is automatically shown by Expo Router when a route is not found.
 * We use the UnderDevelopment component as the fallback.
 *
 * Route priority in _layout.tsx:
 * 1. Demo page (if components/Demo.tsx exists)
 * 2. Normal app routes (app/index.tsx, etc.)
 * 3. This fallback page (when route not found)
 */
export default function NotFoundScreen() {
  return <UnderDevelopment />;
}


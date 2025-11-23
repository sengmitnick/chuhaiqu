import React from 'react';
import { render } from '@testing-library/react-native';
import * as fs from 'fs';
import * as path from 'path';

import RootLayout from '@/app/_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App Root', () => {
  it('renders successfully', () => {
    const result = render(<RootLayout />);
    expect(result).toBeTruthy();
  });

  it('should not have Demo.tsx when real index.tsx exists', () => {
    const indexPath = path.join(__dirname, '../../app/index.tsx');
    const demoPath = path.join(__dirname, '../../components/Demo.tsx');

    if (fs.existsSync(indexPath)) {
      expect(fs.existsSync(demoPath)).toBe(false);
    }
  });
});

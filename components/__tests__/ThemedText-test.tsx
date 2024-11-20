// components/__tests__/ThemedText-test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { ThemedText } from '../ThemedText';
import { ThemeProvider } from '../../app/themeContext';
import { DefaultTheme } from '@react-navigation/native';

test('renders correctly', () => {
  const tree = renderer
    .create(
      <ThemeProvider>
        <ThemedText>Snapshot test!</ThemedText>
      </ThemeProvider>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});


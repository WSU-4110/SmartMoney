// AccountsPage.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AccountsPage from '../../app/(tabs)/accounts';
import api from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@/api/apiClient', () => ({
  post: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('react-native-plaid-link-sdk', () => ({
  open: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../components/plaid/Link', () => ({
  createTokenPlaidLink: jest.fn(),
  createLinkOpenProps: jest.fn(),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#007AFF',
      secondary: '#8E8E93',
      accent: '#FF3B30',
      icon: '#8E8E93',
      cardBackground: '#F9F9F9',
      cardHeaderBackground: '#EFEFF4',
      border: '#C7C7CC',
      subtext: '#8E8E93',
    },
  },
}));

describe('AccountsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AccountsPage renders Net Worth section', () => {
    const { getByText } = render(<AccountsPage />);
    expect(getByText('Net Worth')).toBeTruthy();
  });

  test('AccountsPage renders Add Account button', () => {
    const { getByText } = render(<AccountsPage />);
    expect(getByText('Add Account')).toBeTruthy();
  });

  test('AccountsPage calls fetchData on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('user123');
    (api.post as jest.Mock).mockResolvedValue({ data: { items: [] } });

    render(<AccountsPage />);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('user/userinfo', { id: 'user123' });
    });
  });

  test('AccountsPage opens modal when Add Account button is pressed', async () => {
    const { getByText } = render(<AccountsPage />);

    const addButton = getByText('Add Account');
    fireEvent.press(addButton);

    // Wait for modal to appear
    await waitFor(() => {
      expect(getByText('Choose Type to Add')).toBeTruthy();
    });
  });

  test('AccountsPage renders institutions when data is fetched', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('user123');
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            institution: { id: 'inst1', name: 'Test Bank' },
            accounts: [
              {
                id: 'acc1',
                name: 'Checking Account',
                balances: [{ current: 1000 }],
                type: 'depository',
                subtype: 'checking',
              },
            ],
          },
        ],
      },
    });

    const { getByText } = render(<AccountsPage />);

    // Wait for the institution to appear
    await waitFor(() => expect(getByText('Test Bank')).toBeTruthy());

    // Simulate pressing the institution header to expand it
    fireEvent.press(getByText('Test Bank'));

    // Wait for the account type to appear
    await waitFor(() => expect(getByText('Depository')).toBeTruthy());

    // Simulate pressing the account type header to expand it
    fireEvent.press(getByText('Depository'));

    // Now, the account should be visible
    await waitFor(() => expect(getByText('Checking Account')).toBeTruthy());
  });
});

describe('AccountsPage Modal Tests', () => {
  it('AccountsPage should open and close the modal correctly', () => {
    const { getByText, queryByText } = render(<AccountsPage />);

    // Trigger the modal to open
    const addAccountButton = getByText('Add Account');
    fireEvent.press(addAccountButton);

    // Assert that the modal is visible
    expect(getByText('Choose Type to Add')).toBeTruthy();

    // Interact with the modal - Select "Add Credit Card"
    const addCreditCardOption = getByText('Add Credit Card');
    fireEvent.press(addCreditCardOption);

    // Assert that the credit card modal is opened
    expect(getByText('Add New Credit Card')).toBeTruthy();

    // Close the modal
    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    // Assert that the modal is no longer visible
    expect(queryByText('Add New Credit Card')).toBeNull();
  });
});

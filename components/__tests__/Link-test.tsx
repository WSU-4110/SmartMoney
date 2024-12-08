import { createTokenPlaidLink, createLinkOpenProps } from '@/components/plaid/Link';
import api from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, dismissLink, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';

jest.mock('@/api/apiClient', () => ({
  post: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('react-native-plaid-link-sdk', () => ({
  create: jest.fn(),
  dismissLink: jest.fn(),
  LinkIOSPresentationStyle: { MODAL: 'MODAL' }, // Mock MODAL constant
  LinkLogLevel: { ERROR: 'ERROR' }, // Mock ERROR constant
}));

describe('Link.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTokenPlaidLink', () => {
    it('createTokenPlaidLink should fetch user ID, call the API, and initialize Plaid Link', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_user_id');
      (api.post as jest.Mock).mockResolvedValue({ data: 'test_link_token' });

      await createTokenPlaidLink();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userId');
      expect(api.post).toHaveBeenCalledWith('/plaid/create_link_token', { user_id: 'test_user_id' });
      expect(create).toHaveBeenCalledWith({ token: 'test_link_token' });
    });

    it('createTokenPlaidLink should log an error if API call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_user_id');
      (api.post as jest.Mock).mockRejectedValue(new Error('API Error'));

      await createTokenPlaidLink();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating link token', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createLinkOpenProps', () => {
    it('createLinkOpenProps should return a valid configuration object', () => {
      const closeModalCallback = jest.fn();
      const config = createLinkOpenProps(closeModalCallback);

      expect(config).toHaveProperty('onSuccess');
      expect(config).toHaveProperty('onExit');
      expect(config).toHaveProperty('iOSPresentationStyle');
      expect(config).toHaveProperty('logLevel');
    });

    it('createLinkOpenProps onSuccess should post metadata and public token', async () => {
      const closeModalCallback = jest.fn();
      const config = createLinkOpenProps(closeModalCallback);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test_user_id');
      (api.post as jest.Mock).mockResolvedValue({});
      const successMock = {
        publicToken: 'test_public_token',
        metadata: {
          linkSessionId: 'test_session_id',
          accounts: [], // Required by LinkSuccessMetadata
        },
      };

      await config.onSuccess(successMock);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userId');
      expect(api.post).toHaveBeenCalledWith('/plaid/store-metadata', { id: 'test_user_id', success: successMock });
      expect(api.post).toHaveBeenCalledWith('/plaid/exchange_public_token', {
        public_token: 'test_public_token',
        id: 'test_user_id',
        linkSessionId: 'test_session_id',
      });
      expect(closeModalCallback).toHaveBeenCalled();
    });

    it('createLinkOpenProps onExit should log exit data and dismiss the link', () => {
      const closeModalCallback = jest.fn();
      const config = createLinkOpenProps(closeModalCallback);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const exitMock = {
        errorCode: 'test_error_code',
        errorMessage: 'test_error_message',
        metadata: {
          linkSessionId: 'test_link_session_id',
          requestId: 'test_request_id',
        },
      };
      config.onExit(exitMock);

      expect(consoleLogSpy).toHaveBeenCalledWith('Exit: ', exitMock);
      expect(dismissLink).toHaveBeenCalled();
      expect(closeModalCallback).toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });
});

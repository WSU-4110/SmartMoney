import 'react-native-gesture-handler/jestSetup';


jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve())
}));


jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(() => Promise.resolve({ type: 'success' }))
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'mock-uri'),
  useAuthRequest: jest.fn(() => [
    null,
    null,
    jest.fn(() => Promise.resolve({ type: 'success', params: { access_token: 'token' } }))
  ])
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));


jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);
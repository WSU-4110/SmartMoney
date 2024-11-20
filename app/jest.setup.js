// jest.setup.js
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('./__mocks__/@react-native-async-storage/async-storage'));
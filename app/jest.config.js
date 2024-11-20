module.exports = {
    preset: 'jest-expo',
    setupFiles: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
    ],
    // Add these lines:
    maxWorkers: 1,  // Run tests serially
    testEnvironment: 'node',
    testTimeout: 30000,  // Increase timeout
  };s
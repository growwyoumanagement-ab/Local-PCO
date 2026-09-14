module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__mocks__/async-storage.ts'
  },
  globals: {
    __DEV__: true
  }
};

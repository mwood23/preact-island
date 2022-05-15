export default {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  preset: 'jest-preset-preact',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
}

import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^uuid$': require.resolve('uuid'),
    '^@prisma/client$': '<rootDir>/__mocks__/@prisma/client.ts'
  },
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/tests/integration/'],
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }]
  },
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/']
};

export default config;

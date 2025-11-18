module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/builders/**',
    '!src/repositories/**',
    '!src/scripts/**',
  ],
  maxWorkers: 1,
  globals: {
    'ts-jest': {
      tsconfig: {
        types: ['jest', 'node'],
        module: 'commonjs',
        target: 'ES2020',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        isolatedModules: false,
      },
      diagnostics: {
        ignoreCodes: [151002, 1343]
      }
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

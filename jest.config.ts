import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  resetMocks: true,
  moduleNameMapper: {
    // run-applescript v7 is ESM-only; redirect to a CJS manual mock so Jest
    // never attempts to parse the ESM source.
    "^run-applescript$": "<rootDir>/__mocks__/run-applescript.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;

import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  verbose: true,
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
  passWithNoTests: false,
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 53,
      functions: 82,
      lines: 77,
      statements: -216,
    },
  },
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "reports", outputName: "report.xml" }],
    ["jest-html-reporters", { publicPath: "reports", filename: "report.html" }],
  ],
};

export default config;

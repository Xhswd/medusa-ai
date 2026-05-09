export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist", "<rootDir>/.medusa"],
  testPathIgnorePatterns: ["<rootDir>/dist", "<rootDir>/.medusa"],
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["@swc/jest", { jsc: { parser: { syntax: "typescript" } } }],
  },
}

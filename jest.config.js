/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

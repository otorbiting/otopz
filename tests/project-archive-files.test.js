const assert = require("node:assert/strict");
const test = require("node:test");
const { shouldSkipProjectArchiveFile } = require("../src/lib/project-archive-files.js");

test("project export excludes environment variants but keeps the shareable template", () => {
  for (const name of [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
    ".env.example.local",
  ]) {
    assert.equal(shouldSkipProjectArchiveFile(name), true, `${name} should be excluded`);
  }

  assert.equal(shouldSkipProjectArchiveFile(".env.example"), false);
  assert.equal(shouldSkipProjectArchiveFile(".envrc"), false);
  assert.equal(shouldSkipProjectArchiveFile(".gitignore"), false);
});

test("project export continues excluding logs and operating-system metadata", () => {
  for (const name of ["server.log", ".DS_Store", "Thumbs.db"]) {
    assert.equal(shouldSkipProjectArchiveFile(name), true, `${name} should be excluded`);
  }

  assert.equal(shouldSkipProjectArchiveFile("server.log.backup"), false);
  assert.equal(shouldSkipProjectArchiveFile("route.ts"), false);
});

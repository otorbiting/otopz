const assert = require("node:assert/strict");
const test = require("node:test");
const { shouldSkipProjectArchiveFile } = require("../src/lib/project-archive-files.js");

test("project export excludes environment files but keeps the shareable template", () => {
  for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
    assert.equal(shouldSkipProjectArchiveFile(name), true, `${name} should be excluded`);
  }

  assert.equal(shouldSkipProjectArchiveFile(".env.example"), false);
  assert.equal(shouldSkipProjectArchiveFile(".gitignore"), false);
});

test("project export continues excluding logs and operating-system metadata", () => {
  assert.equal(shouldSkipProjectArchiveFile("server.log"), true);
  assert.equal(shouldSkipProjectArchiveFile(".DS_Store"), true);
  assert.equal(shouldSkipProjectArchiveFile("route.ts"), false);
});

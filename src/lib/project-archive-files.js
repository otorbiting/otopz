const SKIP_FILES = new Set([".DS_Store", "Thumbs.db"]);

function shouldSkipProjectArchiveFile(name) {
  const isEnvironmentFile = /^\.env(?:$|\.)/.test(name);
  return (
    (isEnvironmentFile && name !== ".env.example") ||
    SKIP_FILES.has(name) ||
    name.endsWith(".log")
  );
}

module.exports = { shouldSkipProjectArchiveFile };

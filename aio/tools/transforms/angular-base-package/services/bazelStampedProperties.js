'use strict';

const fs = require('fs');

/**
 * Provide stamped Bazel variables from the workspace status command.
 * 
 * (see https://bazel.build/docs/user-manual#workspace-status)
 *
 * @returns a map of key-value pairs
 */
module.exports = function bazelStampedProperties() {
  if (!process.env.BAZEL_VERSION_FILE) {
    // Bazel stamping not enabled with --stamp
    return {};
  }
  const volatileStatus = fs.readFileSync(process.env.BAZEL_VERSION_FILE, 'utf8');
  const properties = {};
  for (const match of `\n${volatileStatus}`.matchAll(/^([^\s]+)\s+(.*)/gm)) {
      // Lines which go unmatched define an index value of `0` and should be skipped.
      if (match.index === 0) {
          continue;
      }
      properties[match[1]] = match[2];
  }

  return properties;
};
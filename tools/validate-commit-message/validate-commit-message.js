#!/usr/bin/env node

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * GIT commit message format enforcement
 *
 * Note: this script was originally written by Vojta for AngularJS :-)
 */

'use strict';

const config = require('./commit-message.json');
const FIXUP_SQUASH_PREFIX_RE = /^(?:fixup|squash)! /i;
const REVERT_PREFIX_RE = /^revert:? /i;

module.exports = commitHeader => {
  if (REVERT_PREFIX_RE.test(commitHeader)) {
    return true;
  }

  const {header, type, scope} = parseCommitHeader(commitHeader);

  if (header.length > config.maxLength) {
    error(`The commit message header is longer than ${config.maxLength} characters`, commitHeader);
    return false;
  }

  if (!type) {
    const format = '<type>(<scope>): <subject>';
    error(
        `The commit message header does not match the format of '${format}' or 'Revert: "${format}"'`,
        commitHeader);
    return false;
  }

  if (!config.types.includes(type)) {
    error(`'${type}' is not an allowed type.\n => TYPES: ${config.types.join(', ')}`, commitHeader);
    return false;
  }

  if (scope && !config.scopes.includes(scope)) {
    error(
        `'${scope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`,
        commitHeader);
    return false;
  }

  return true;
};

module.exports.config = config;

// Helpers
function error(errorMessage, commitHeader) {
  console.error(`INVALID COMMIT MSG: ${commitHeader}\n => ERROR: ${errorMessage}`);
}

function parseCommitHeader(header) {
  const isFixupOrSquash = FIXUP_SQUASH_PREFIX_RE.test(header);
  header = header.replace(FIXUP_SQUASH_PREFIX_RE, '');

  const match = /^(\w+)(?:\(([^)]+)\))?\: (.+)$/.exec(header) || [];

  return {
    header,
    type: match[1],
    scope: match[2],
    subject: match[3], isFixupOrSquash,
  };
}

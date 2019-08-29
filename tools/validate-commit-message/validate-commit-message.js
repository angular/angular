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
const FIXUP_PREFIX_RE = /^fixup! /i;
const SQUASH_PREFIX_RE = /^squash! /i;
const REVERT_PREFIX_RE = /^revert:? /i;

module.exports = (commitHeader, disallowSquash, nonFixupCommitHeaders) => {
  if (REVERT_PREFIX_RE.test(commitHeader)) {
    return true;
  }

  const {header, type, scope, isFixup, isSquash} = parseCommitHeader(commitHeader);

  if (isSquash && disallowSquash) {
    error('The commit must be manually squashed into the target commit', commitHeader);
    return false;
  }

  // If it is a fixup commit and `nonFixupCommitHeaders` is not empty, we only care to check whether
  // there is a corresponding non-fixup commit (i.e. a commit whose header is identical to this
  // commit's header after stripping the `fixup! ` prefix).
  if (isFixup && nonFixupCommitHeaders) {
    if (!nonFixupCommitHeaders.includes(header)) {
      error(
          'Unable to find match for fixup commit among prior commits: ' +
              (nonFixupCommitHeaders.map(x => `\n      ${x}`).join('') || '-'),
          commitHeader);
      return false;
    }

    return true;
  }

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

module.exports.FIXUP_PREFIX_RE = FIXUP_PREFIX_RE;
module.exports.config = config;

// Helpers
function error(errorMessage, commitHeader) {
  console.error(`INVALID COMMIT MSG: ${commitHeader}\n => ERROR: ${errorMessage}`);
}

function parseCommitHeader(header) {
  const isFixup = FIXUP_PREFIX_RE.test(header);
  const isSquash = SQUASH_PREFIX_RE.test(header);
  header = header.replace(FIXUP_PREFIX_RE, '').replace(SQUASH_PREFIX_RE, '');

  const match = /^(\w+)(?:\(([^)]+)\))?\: (.+)$/.exec(header) || [];

  return {
    header,
    type: match[1],
    scope: match[2],
    subject: match[3], isFixup, isSquash,
  };
}

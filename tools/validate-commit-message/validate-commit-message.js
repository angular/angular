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

const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, './commit-message.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const PATTERN = /^(\w+)(?:\(([^)]+)\))?\: (.+)$/;
const FIXUP_SQUASH = /^(fixup|squash)\! /i;
const REVERT = /^revert:? /i;

module.exports = function(commitSubject) {
  const subject = commitSubject.replace(FIXUP_SQUASH, '');

  if (subject.match(REVERT)) {
    return true;
  }

  if (subject.length > config['maxLength']) {
    error(`The commit message is longer than ${config['maxLength']} characters`, commitSubject);
    return false;
  }

  const match = PATTERN.exec(subject);
  if (!match) {
    error(
        `The commit message does not match the format of '<type>(<scope>): <subject>' OR 'Revert: "type(<scope>): <subject>"'`,
        commitSubject);
    return false;
  }

  const type = match[1];
  if (config['types'].indexOf(type) === -1) {
    error(
        `${type} is not an allowed type.\n => TYPES: ${config['types'].join(', ')}`, commitSubject);
    return false;
  }

  const scope = match[2];

  if (scope && !config['scopes'].includes(scope)) {
    error(
        `"${scope}" is not an allowed scope.\n => SCOPES: ${config['scopes'].join(', ')}`,
        commitSubject);
    return false;
  }

  return true;
};

function error(errorMessage, commitMessage) {
  console.error(`INVALID COMMIT MSG: "${commitMessage}"\n => ERROR: ${errorMessage}`);
}

module.exports.config = config;

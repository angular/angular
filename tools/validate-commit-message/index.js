#!/usr/bin/env node

/**
 * GIT COMMIT-MSG hook for validating commit message.
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo
 *
 * Installation:
 * >> cd <repo>
 * >> ln -s ../../lib/validate-commit-msg.js .git/hooks/commit-msg
 * >> chmod +x .git/hooks/commit-msg
 */

'use strict';

const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../commit-message.json');
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const PATTERN = /^(\w+)(?:\(([\w\$\.\*/-]*)\))?\: (.+)$/;

module.exports = function(commitMessage) {
  if (commitMessage.length > config['maxLength']) {
    error(`The commit message is longer than ${config['maxLength']} characters`, commitMessage);
    return false;
  }

  const match = PATTERN.exec(commitMessage);
  if (!match) {
    error(`The commit message does not match the format of "<type>(<scope>): <subject>"`, commitMessage);
    return false;
  }

  const type = match[1];
  if (config['types'].indexOf(type) === -1) {
    error(`${type} is not an allowed type.\n => TYPES: ${config['types'].join('|')}`, commitMessage);
    return false;
  }

  const scope = match[2];
  if (scope && scope.length > 0 && config['scopes'].indexOf(scope) === -1) {
    error(`"${scope}" inside of "${type}(...)" is not an allowed scope.\n => SCOPES: ${config['scopes'].join('|')}`, commitMessage);
    return false;
  }

  return true;
};

function error(errorMessage, commitMessage) {
  console.error(`INVALID COMMIT MSG: "${commitMessage}"\n => ERROR: ${errorMessage}`);
}

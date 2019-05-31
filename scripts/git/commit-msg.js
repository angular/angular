#! /usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// git commit-msg hook to check the commit message against Angular conventions
// see `/CONTRIBUTING.md` for mode details.

'use strict';

const fs = require('fs');
const checkMsg = require('../../tools/validate-commit-message');
const msgFile = process.env['GIT_PARAMS'];

let isValid = true;

if (msgFile) {
    const commitMsg = fs.readFileSync(msgFile, {encoding: 'utf-8'});
    const firstLine = commitMsg.split('\n')[0];
    isValid = checkMsg(firstLine);

    if (!isValid) {
        console.error('\nCheck CONTRIBUTING.md at the root of the repo for more information.');
    }
}

process.exit(isValid ? 0 : 1);

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const path = require('path');
const Lint = require('tslint');

// Custom rule that registers all of the custom rules, written in TypeScript, with ts-node.
// This is necessary, because `tslint` and IDEs won't execute any rules that aren't in a .js file.
require('ts-node').register();

// Add a noop rule so tslint doesn't complain.
exports.Rule = class Rule extends Lint.Rules.AbstractRule {
  apply() {}
};

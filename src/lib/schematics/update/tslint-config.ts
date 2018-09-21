/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sync as globSync} from 'glob';
import {TargetVersion} from './target-version';

/** List of rules that need to be enabled when running the TSLint fix task. */
const upgradeRules = [
  // Attribute selector update rules.
  'attribute-selectors-string-literal',
  'attribute-selectors-stylesheet',
  'attribute-selectors-template',

  // Class name update rules
  'class-names-identifier',
  'class-names-identifier-misc',

  // CSS selectors update rules
  'css-selectors-string-literal',
  'css-selectors-stylesheet',
  'css-selectors-template',

  // Element selector update rules
  'element-selectors-string-literal',
  'element-selectors-stylesheet',
  'element-selectors-template',

  // Input name update rules
  'input-names-stylesheet',
  'input-names-template',

  // Output name update rules
  'output-names-template',

  // Property name update rules
  'property-names-access',
  'property-names-misc',

  // Class inheritance
  'class-inheritance-check',
  'class-inheritance-misc',

  // signature checks
  'constructor-signature-check',
  'method-calls-check',

  // Additional misc rules.
  'check-import-misc',
  'check-template-misc',

  // Ripple misc V7
  ['ripple-speed-factor-assignment', TargetVersion.V7],
  ['ripple-speed-factor-template', TargetVersion.V7],
];

/** List of absolute paths that refer to directories that contain the upgrade rules. */
const rulesDirectory = globSync('rules/**/', {cwd: __dirname, absolute: true});

/**
 * Creates a TSLint configuration object that can be passed to the schematic `TSLintFixTask`.
 * Each rule will have the specified target version as option which can be used to swap out
 * the upgrade data based on the given target version.
 *
 * Additionally we pass a list of additional style files to the TSLint rules because the component
 * walker is not able to detect stylesheets which are not referenced by Angular.
 */
export function createTslintConfig(target: TargetVersion, extraStyleFiles: string[]) {
  const rules = upgradeRules.reduce((result, data) => {
    const ruleName = data instanceof Array ? data[0] : data;
    const versionConstraints = data instanceof Array ? data.slice(1) : null;

    if (!versionConstraints || versionConstraints.includes(target)) {
      result[ruleName] = [true, target, extraStyleFiles];
    }

    return result;
  }, {});

  return {rulesDirectory, rules};
}

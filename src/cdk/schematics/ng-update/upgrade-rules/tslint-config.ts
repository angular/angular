/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sync as globSync} from 'glob';
import {TargetVersion} from '../target-version';
import {RuleUpgradeData} from '../upgrade-data';

/** Optional upgrade configuration for TSLint. */
export interface UpgradeTSLintConfig {
  upgradeData: RuleUpgradeData;
  extraRuleDirectories?: string[];
  extraUpgradeRules?: UpgradeRules;
  extraStyleFiles?: string[];
}

/** Type for the configuration list of upgrade rules. */
export type UpgradeRules = (string | (string | TargetVersion)[])[];

/**
 * List of upgrade rules that will be always enabled because the upgrade data for these rules
 * can be swapped out dynamically.
 *
 * Rules which are specific to CDK breaking changes and are not based on the upgrade data,
 * shouldn't be listed here because those cannot be disabled if Angular Material runs its
 * update schematic using these base rules.
 */
const baseUpgradeRules: UpgradeRules = [
  // Attribute selector update rules.
  'attribute-selectors-string-literal',
  'attribute-selectors-stylesheet',
  'attribute-selectors-template',

  // Class inheritance
  'class-inheritance-check',

  // Class name update rules
  'class-names-identifier',

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

  // Signature and method call checks
  'constructor-signature-check',
  'method-calls-check',
];

/** List of absolute paths that refer to directories that contain the upgrade rules. */
const ruleDirectories = globSync('./**/', {cwd: __dirname, absolute: true});

/**
 * Creates a TSLint configuration object that can be passed to the schematic `TSLintFixTask`.
 * Each rule will have the specified target version as option which can be used to swap out
 * the upgrade data based on the given target version.
 *
 * @param target Target version that will be used to reduce the upgrade data to the necessary
 * changes that are affected by the target version.
 * @param config Configuration object that can be specified to add additional rules or
 * specify additional external stylesheets which are not referenced by Angular.
 */
export function createTslintConfig(target: TargetVersion, config: UpgradeTSLintConfig) {
  const configuredRules = baseUpgradeRules.concat(config.extraUpgradeRules || []);
  const configuredRuleDirs = ruleDirectories.concat(config.extraRuleDirectories || []);

  const enabledRules = configuredRules.reduce((result, data) => {
    const ruleName = data instanceof Array ? data[0] : data;
    const versionConstraints = data instanceof Array ? data.slice(1) : null;

    if (!versionConstraints || versionConstraints.includes(target)) {
      result[ruleName] = [true, target, config.upgradeData, config.extraStyleFiles];
    }

    return result;
  }, {});

  return {
    rulesDirectory: configuredRuleDirs,
    rules: enabledRules
  };
}

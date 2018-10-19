/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule} from '@angular-devkit/schematics';
import {TargetVersion, createUpgradeRule, UpgradeTSLintConfig} from '@angular/cdk/schematics';
import {green, yellow} from 'chalk';
import {sync as globSync} from 'glob';
import {materialUpgradeData} from './upgrade-data';

/** List of additional upgrade rules for Angular Material. */
const upgradeRules = [
  // Misc check rules
  'check-class-inheritance-misc',
  'check-class-names-misc',
  'check-imports-misc',
  'check-property-names-misc',
  'check-template-misc',

  // Ripple misc V7
  ['ripple-speed-factor-assignment', TargetVersion.V7],
  ['ripple-speed-factor-template', TargetVersion.V7],
];

/** List of absolute paths that refer to directories that contain the Material upgrade rules. */
const ruleDirectories = globSync('upgrade-rules/**/', {cwd: __dirname, absolute: true});

/** TSLint upgrade configuration that will be passed to the CDK ng-update rule. */
const tslintUpgradeConfig: UpgradeTSLintConfig = {
  upgradeData: materialUpgradeData,
  extraRuleDirectories: ruleDirectories,
  extraUpgradeRules: upgradeRules,
};

/** Entry point for the migration schematics with target of Angular Material v6 */
export function updateToV6(): Rule {
  return createUpgradeRule(TargetVersion.V6, tslintUpgradeConfig);
}

/** Entry point for the migration schematics with target of Angular Material v7 */
export function updateToV7(): Rule {
  return createUpgradeRule(TargetVersion.V7, tslintUpgradeConfig);
}

/** Post-update schematic to be called when update is finished. */
export function postUpdate(): Rule {
  return () => {
    console.log();
    console.log(green('  ✓  Angular Material update complete'));
    console.log();
    console.log(yellow('  ⚠  Please check the output above for any issues that were detected ' +
      'but could not be automatically fixed.'));
  };
}

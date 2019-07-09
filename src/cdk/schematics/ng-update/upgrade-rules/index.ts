/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

import {Constructor, runMigrationRules} from '../../update-tool';
import {MigrationRule} from '../../update-tool/migration-rule';
import {TargetVersion} from '../../update-tool/target-version';
import {getProjectTsConfigPaths} from '../../utils/project-tsconfig-paths';
import {RuleUpgradeData} from '../upgrade-data';

import {AttributeSelectorsRule} from './attribute-selectors-rule';
import {ClassInheritanceRule} from './class-inheritance-rule';
import {ClassNamesRule} from './class-names-rule';
import {ConstructorSignatureRule} from './constructor-signature-rule';
import {CssSelectorsRule} from './css-selectors-rule';
import {ElementSelectorsRule} from './element-selectors-rule';
import {InputNamesRule} from './input-names-rule';
import {MethodCallArgumentsRule} from './method-call-arguments-rule';
import {MiscTemplateRule} from './misc-template-rule';
import {OutputNamesRule} from './output-names-rule';
import {PropertyNamesRule} from './property-names-rule';


/** List of migration rules which run for the CDK update. */
export const cdkMigrationRules: Constructor<MigrationRule<RuleUpgradeData>>[] = [
  AttributeSelectorsRule,
  ClassInheritanceRule,
  ClassNamesRule,
  ConstructorSignatureRule,
  CssSelectorsRule,
  ElementSelectorsRule,
  InputNamesRule,
  MethodCallArgumentsRule,
  MiscTemplateRule,
  OutputNamesRule,
  PropertyNamesRule,
];

type NullableMigrationRule = Constructor<MigrationRule<RuleUpgradeData|null>>;

/**
 * Creates a Angular schematic rule that runs the upgrade for the
 * specified target version.
 */
export function createUpgradeRule(
    targetVersion: TargetVersion, extraRules: NullableMigrationRule[], upgradeData: RuleUpgradeData,
    onMigrationCompleteFn?: (targetVersion: TargetVersion, hasFailures: boolean) => void): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const logger = context.logger;
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);

    if (!buildPaths.length && !testPaths.length) {
      // We don't want to throw here because it would mean that other migrations in the
      // pipeline don't run either. Rather print an error message.
      logger.error('Could not find any TypeScript project in the CLI workspace configuration.');
      return;
    }

    // Keep track of all project source files which have been checked/migrated. This is
    // necessary because multiple TypeScript projects can contain the same source file and
    // we don't want to check these again, as this would result in duplicated failure messages.
    const analyzedFiles = new Set<string>();
    let hasRuleFailures = false;

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      hasRuleFailures = hasRuleFailures || runMigrationRules(
          tree, context.logger, tsconfigPath, targetVersion, [...cdkMigrationRules, ...extraRules],
          upgradeData, analyzedFiles);
    }

    if (onMigrationCompleteFn) {
      onMigrationCompleteFn(targetVersion, hasRuleFailures);
    }
  };
}

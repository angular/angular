/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, red} from 'chalk';
import {IOptions, ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {PropertyNameUpgradeData} from '../../data/property-names';
import {determineBaseTypes} from '../../typescript/base-types';
import {getUpgradeDataFromWalker} from '../../upgrade-data';

/**
 * Rule that identifies class declarations that extend CDK or Material classes and had
 * a public property change.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  /**
   * Map of classes that have been updated. Each class name maps to the according property
   * change data.
   */
  propertyNames = new Map<string, PropertyNameUpgradeData>();

  constructor(sourceFile: ts.SourceFile, options: IOptions, program: ts.Program) {
    super(sourceFile, options, program);

    getUpgradeDataFromWalker(this, 'propertyNames')
      .filter(data => data.whitelist && data.whitelist.classes)
      .forEach(data => data.whitelist.classes.forEach(name => this.propertyNames.set(name, data)));
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = determineBaseTypes(node);
    const className = node.name ? node.name.text : '{unknown-name}';

    if (!baseTypes) {
      return;
    }

    baseTypes.forEach(typeName => {
      const data = this.propertyNames.get(typeName);

      if (data) {
        this.addFailureAtNode(node, `Found class "${bold(className)}" which extends class ` +
            `"${bold(typeName)}". Please note that the base class property ` +
            `"${red(data.replace)}" has changed to "${green(data.replaceWith)}". ` +
            `You may need to update your class as well`);
      }
    });
  }
}

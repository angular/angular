/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, red} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {propertyNames} from '../material/data/property-names';

/**
 * Rule that walks through every property access expression and updates properties that have
 * been changed in favor of the new name.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new CheckInheritanceWalker(sourceFile, this.getOptions(), program));
  }
}

export class CheckInheritanceWalker extends ProgramAwareRuleWalker {
  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    // Check if user is extending an Angular Material class whose properties have changed.
    const type = this.getTypeChecker().getTypeAtLocation(declaration.name);
    const baseTypes = this.getTypeChecker().getBaseTypes(type as ts.InterfaceType);
    baseTypes.forEach(t => {
      const propertyData = propertyNames.find(
          data => data.whitelist && new Set(data.whitelist.classes).has(t.symbol.name));
      if (propertyData) {
        this.addFailureAtNode(
            declaration,
            `Found class "${bold(declaration.name.text)}" which extends class` +
            ` "${bold(t.symbol.name)}". Please note that the base class property` +
            ` "${red(propertyData.replace)}" has changed to "${green(propertyData.replaceWith)}".` +
            ` You may need to update your class as well`);
      }
    });
  }
}

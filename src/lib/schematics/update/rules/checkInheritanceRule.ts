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
import {MaterialPropertyNameData, propertyNames} from '../material/data/property-names';

/**
 * Map of classes that have been updated. Each class name maps to the according property change
 * data.
 */
const changedClassesMap = new Map<string, MaterialPropertyNameData>();

propertyNames.filter(data => data.whitelist && data.whitelist.classes).forEach(data => {
  data.whitelist.classes.forEach(name => changedClassesMap.set(name, data));
});

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

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = this._determineBaseTypes(node);

    if (!baseTypes) {
      return;
    }

    baseTypes.forEach(typeName => {
      const data = changedClassesMap.get(typeName);

      if (data) {
        this.addFailureAtNode(node,
          `Found class "${bold(node.name.text)}" which extends class ` +
          `"${bold(typeName)}". Please note that the base class property ` +
          `"${red(data.replace)}" has changed to "${green(data.replaceWith)}". ` +
          `You may need to update your class as well`);
      }
    });
  }

  private _determineBaseTypes(node: ts.ClassDeclaration): string[] | null {
    if (!node.heritageClauses) {
      return null;
    }

    return node.heritageClauses
      .reduce((types, clause) => types.concat(clause.types), [])
      .map(typeExpression => typeExpression.expression)
      .filter(expression => expression && ts.isIdentifier(expression))
      .map(identifier => identifier.text);
  }
}

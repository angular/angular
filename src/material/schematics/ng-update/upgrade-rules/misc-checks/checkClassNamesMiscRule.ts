/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, red} from 'chalk';
import {RuleFailure, Rules, RuleWalker} from 'tslint';
import * as ts from 'typescript';

/**
 * Rule that looks for class name identifiers that have been removed but cannot be
 * automatically migrated.
 */
export class Rule extends Rules.AbstractRule {

  apply(sourceFile: ts.SourceFile): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}

export class Walker extends RuleWalker {

  visitIdentifier(identifier: ts.Identifier) {
    if (identifier.getText() === 'MatDrawerToggleResult') {
      this.addFailureAtNode(
          identifier,
          `Found "${bold('MatDrawerToggleResult')}" which has changed from a class type to a` +
          ` string literal type. Code may need to be updated`);
    }

    if (identifier.getText() === 'MatListOptionChange') {
      this.addFailureAtNode(
          identifier,
          `Found usage of "${red('MatListOptionChange')}" which has been removed. Please listen` +
          ` for ${bold('selectionChange')} on ${bold('MatSelectionList')} instead`);
    }
  }
}

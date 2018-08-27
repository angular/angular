/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green} from 'chalk';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {determineBaseTypes} from '../../typescript/base-types';

/**
 * Rule that checks for classes that extend Angular Material or CDK classes which have
 * changed their API.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions(), program));
  }
}

export class Walker extends ProgramAwareRuleWalker {

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const baseTypes = determineBaseTypes(node);

    if (!baseTypes) {
      return;
    }

    if (baseTypes.includes('MatFormFieldControl')) {
      const hasFloatLabelMember = node.members
          .find(member => member.name && member.name.getText() === 'shouldFloatLabel');

      if (!hasFloatLabelMember) {
        this.addFailureAtNode(node, `Found class "${bold(node.name.text)}" which extends ` +
            `"${bold('MatFormFieldControl')}". This class must define ` +
            `"${green('shouldLabelFloat')}" which is now a required property.`);
      }
    }
  }
}

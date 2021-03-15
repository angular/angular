/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {findFragmentAccesses, migrateActivatedRouteSnapshotFragment} from '../activated-route-snapshot-fragment/util';

export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    if (sourceFile.isDeclarationFile || program.isSourceFileFromExternalLibrary(sourceFile)) {
      return [];
    }

    const failures: RuleFailure[] = [];
    const typeChecker = program.getTypeChecker();
    const nodesToMigrate = findFragmentAccesses(typeChecker, sourceFile);

    if (nodesToMigrate.size > 0) {
      const printer = ts.createPrinter();
      nodesToMigrate.forEach(node => {
        const sourceFile = node.getSourceFile();
        const migratedNode = migrateActivatedRouteSnapshotFragment(node);
        const replacement = new Replacement(
            node.getStart(), node.getWidth(),
            printer.printNode(ts.EmitHint.Unspecified, migratedNode, sourceFile));
        failures.push(new RuleFailure(
            sourceFile, node.getStart(), node.getEnd(),
            '`ActivatedRouteSnapshot.fragment` is nullable.', this.ruleName, replacement));
      });
    }

    return failures;
  }
}

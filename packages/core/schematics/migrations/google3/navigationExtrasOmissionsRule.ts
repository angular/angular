/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {findLiteralsToMigrate, migrateLiteral} from '../../migrations/navigation-extras-omissions/util';


/** TSLint rule that migrates `navigateByUrl` and `createUrlTree` calls to an updated signature. */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const failures: RuleFailure[] = [];
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();
    const literalsToMigrate = findLiteralsToMigrate(sourceFile, typeChecker);

    literalsToMigrate.forEach((instances, methodName) => instances.forEach(instance => {
      const migratedNode = migrateLiteral(methodName, instance);

      if (migratedNode !== instance) {
        failures.push(new RuleFailure(
            sourceFile, instance.getStart(), instance.getEnd(),
            'Object used in navigateByUrl or createUrlTree call contains unsupported properties.',
            this.ruleName,
            new Replacement(
                instance.getStart(), instance.getWidth(),
                printer.printNode(ts.EmitHint.Unspecified, migratedNode, sourceFile))));
      }
    }));

    return failures;
  }
}

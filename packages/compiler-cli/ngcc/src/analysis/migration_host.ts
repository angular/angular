/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {MetadataReader} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {HandlerFlags, TraitState} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {MigrationHost} from '../migrations/migration';

import {NgccTraitCompiler} from './ngcc_trait_compiler';
import {isWithinPackage} from './util';

/**
 * The standard implementation of `MigrationHost`, which is created by the `DecorationAnalyzer`.
 */
export class DefaultMigrationHost implements MigrationHost {
  constructor(
      readonly reflectionHost: NgccReflectionHost, readonly metadata: MetadataReader,
      readonly evaluator: PartialEvaluator, private compiler: NgccTraitCompiler,
      private entryPointPath: AbsoluteFsPath) {}

  injectSyntheticDecorator(clazz: ClassDeclaration, decorator: Decorator, flags?: HandlerFlags):
      void {
    const migratedTraits = this.compiler.injectSyntheticDecorator(clazz, decorator, flags);

    for (const trait of migratedTraits) {
      if ((trait.state === TraitState.Analyzed || trait.state === TraitState.Resolved) &&
          trait.analysisDiagnostics !== null) {
        trait.analysisDiagnostics = trait.analysisDiagnostics.map(
            diag => createMigrationDiagnostic(diag, clazz, decorator));
      }
      if (trait.state === TraitState.Resolved && trait.resolveDiagnostics !== null) {
        trait.resolveDiagnostics =
            trait.resolveDiagnostics.map(diag => createMigrationDiagnostic(diag, clazz, decorator));
      }
    }
  }

  getAllDecorators(clazz: ClassDeclaration): Decorator[]|null {
    return this.compiler.getAllDecorators(clazz);
  }

  isInScope(clazz: ClassDeclaration): boolean {
    return isWithinPackage(this.entryPointPath, absoluteFromSourceFile(clazz.getSourceFile()));
  }
}

/**
 * Creates a diagnostic from another one, containing additional information about the synthetic
 * decorator.
 */
function createMigrationDiagnostic(
    diagnostic: ts.Diagnostic, source: ts.Node, decorator: Decorator): ts.Diagnostic {
  const clone = {...diagnostic};

  const chain: ts.DiagnosticMessageChain[] = [{
    messageText: `Occurs for @${decorator.name} decorator inserted by an automatic migration`,
    category: ts.DiagnosticCategory.Message,
    code: 0,
  }];

  if (decorator.args !== null) {
    const args = decorator.args.map(arg => arg.getText()).join(', ');
    chain.push({
      messageText: `@${decorator.name}(${args})`,
      category: ts.DiagnosticCategory.Message,
      code: 0,
    });
  }

  if (typeof clone.messageText === 'string') {
    clone.messageText = {
      messageText: clone.messageText,
      category: diagnostic.category,
      code: diagnostic.code,
      next: chain,
    };
  } else {
    if (clone.messageText.next === undefined) {
      clone.messageText.next = chain;
    } else {
      clone.messageText.next.push(...chain);
    }
  }
  return clone;
}

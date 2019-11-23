/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../src/ngtsc/diagnostics';
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {MetadataReader} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler, HandlerFlags} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {MigrationHost} from '../migrations/migration';

import {AnalyzedClass, AnalyzedFile} from './types';
import {analyzeDecorators, isWithinPackage} from './util';

/**
 * The standard implementation of `MigrationHost`, which is created by the
 * `DecorationAnalyzer`.
 */
export class DefaultMigrationHost implements MigrationHost {
  constructor(
      readonly reflectionHost: NgccReflectionHost, readonly metadata: MetadataReader,
      readonly evaluator: PartialEvaluator, private handlers: DecoratorHandler<any, any>[],
      private entryPointPath: AbsoluteFsPath, private analyzedFiles: AnalyzedFile[],
      private diagnosticHandler: (error: ts.Diagnostic) => void) {}

  injectSyntheticDecorator(clazz: ClassDeclaration, decorator: Decorator, flags?: HandlerFlags):
      void {
    const classSymbol = this.reflectionHost.getClassSymbol(clazz) !;
    const newAnalyzedClass = analyzeDecorators(classSymbol, [decorator], this.handlers, flags);
    if (newAnalyzedClass === null) {
      return;
    }

    if (newAnalyzedClass.diagnostics !== undefined) {
      for (const diagnostic of newAnalyzedClass.diagnostics) {
        this.diagnosticHandler(createMigrationDiagnostic(diagnostic, clazz, decorator));
      }
    }

    const analyzedFile = getOrCreateAnalyzedFile(this.analyzedFiles, clazz.getSourceFile());
    const oldAnalyzedClass = analyzedFile.analyzedClasses.find(c => c.declaration === clazz);
    if (oldAnalyzedClass === undefined) {
      analyzedFile.analyzedClasses.push(newAnalyzedClass);
    } else {
      mergeAnalyzedClasses(oldAnalyzedClass, newAnalyzedClass);
    }
  }

  getAllDecorators(clazz: ClassDeclaration): Decorator[]|null {
    const sourceFile = clazz.getSourceFile();
    const analyzedFile = this.analyzedFiles.find(file => file.sourceFile === sourceFile);
    if (analyzedFile === undefined) {
      return null;
    }

    const analyzedClass = analyzedFile.analyzedClasses.find(c => c.declaration === clazz);
    if (analyzedClass === undefined) {
      return null;
    }

    return analyzedClass.decorators;
  }

  isInScope(clazz: ClassDeclaration): boolean {
    return isWithinPackage(this.entryPointPath, clazz.getSourceFile());
  }
}

function getOrCreateAnalyzedFile(
    analyzedFiles: AnalyzedFile[], sourceFile: ts.SourceFile): AnalyzedFile {
  const analyzedFile = analyzedFiles.find(file => file.sourceFile === sourceFile);
  if (analyzedFile !== undefined) {
    return analyzedFile;
  } else {
    const newAnalyzedFile: AnalyzedFile = {sourceFile, analyzedClasses: []};
    analyzedFiles.push(newAnalyzedFile);
    return newAnalyzedFile;
  }
}

function mergeAnalyzedClasses(oldClass: AnalyzedClass, newClass: AnalyzedClass) {
  if (newClass.decorators !== null) {
    if (oldClass.decorators === null) {
      oldClass.decorators = newClass.decorators;
    } else {
      for (const newDecorator of newClass.decorators) {
        if (oldClass.decorators.some(d => d.name === newDecorator.name)) {
          throw new FatalDiagnosticError(
              ErrorCode.NGCC_MIGRATION_DECORATOR_INJECTION_ERROR, newClass.declaration,
              `Attempted to inject "${newDecorator.name}" decorator over a pre-existing decorator with the same name on the "${newClass.name}" class.`);
        }
      }
      oldClass.decorators.push(...newClass.decorators);
    }
  }

  if (newClass.diagnostics !== undefined) {
    if (oldClass.diagnostics === undefined) {
      oldClass.diagnostics = newClass.diagnostics;
    } else {
      oldClass.diagnostics.push(...newClass.diagnostics);
    }
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

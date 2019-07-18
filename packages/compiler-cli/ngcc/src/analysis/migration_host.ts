/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ErrorCode, FatalDiagnosticError} from '../../../src/ngtsc/diagnostics';
import {MetadataReader} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {DecoratorHandler} from '../../../src/ngtsc/transform';
import {NgccReflectionHost} from '../host/ngcc_host';
import {MigrationHost} from '../migrations/migration';
import {AnalyzedClass, AnalyzedFile} from './types';
import {analyzeDecorators} from './util';

/**
 * The standard implementation of `MigrationHost`, which is created by the
 * `DecorationAnalyzer`.
 */
export class DefaultMigrationHost implements MigrationHost {
  constructor(
      readonly reflectionHost: NgccReflectionHost, readonly metadata: MetadataReader,
      readonly evaluator: PartialEvaluator, private handlers: DecoratorHandler<any, any>[],
      private analyzedFiles: AnalyzedFile[]) {}

  injectSyntheticDecorator(clazz: ClassDeclaration, decorator: Decorator): void {
    const classSymbol = this.reflectionHost.getClassSymbol(clazz) !;
    const newAnalyzedClass = analyzeDecorators(classSymbol, [decorator], this.handlers);
    if (newAnalyzedClass === null) {
      return;
    }

    const analyzedFile = getOrCreateAnalyzedFile(this.analyzedFiles, clazz.getSourceFile());
    const oldAnalyzedClass = analyzedFile.analyzedClasses.find(c => c.declaration === clazz);
    if (oldAnalyzedClass === undefined) {
      analyzedFile.analyzedClasses.push(newAnalyzedClass);
    } else {
      mergeAnalyzedClasses(oldAnalyzedClass, newAnalyzedClass);
    }
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

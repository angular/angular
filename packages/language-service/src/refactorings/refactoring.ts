/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import ts from 'typescript';
import {ApplyRefactoringProgressFn} from '@angular/language-service/api';
import {CompilerOptions} from '@angular/compiler-cli';
import {
  ConvertToSignalInputBestEffortRefactoring,
  ConvertToSignalInputRefactoring,
} from './convert_to_signal_input';

/**
 * Interface exposing static metadata for a {@link Refactoring},
 * exposed via static fields.
 *
 * A refactoring may be applicable at a given position inside
 * a file. If it becomes applicable, the language service will suggest
 * it as a code action.
 *
 * Later, the user can request edits for the refactoring lazily, upon
 * e.g. click. The refactoring class is then instantiated and will be
 * re-used for future applications, allowing for efficient re-use of e.g
 * analysis data.
 */
export interface Refactoring {
  new (project: ts.server.Project): ActiveRefactoring;

  /** Unique id of the refactoring. */
  id: string;

  /** Description of the refactoring. Shown in e.g. VSCode as the code action. */
  description: string;

  /** Whether the refactoring is applicable at the given location. */
  isApplicable(
    compiler: NgCompiler,
    fileName: string,
    positionOrRange: number | ts.TextRange,
  ): boolean;
}

/**
 * Interface that describes an active refactoring instance. A
 * refactoring may be lazily instantiated whenever the refactoring
 * is requested to be applied.
 *
 * More information can be found in {@link Refactoring}
 */
export interface ActiveRefactoring {
  /** Computes the edits for the refactoring. */
  computeEditsForFix(
    compiler: NgCompiler,
    compilerOptions: CompilerOptions,
    fileName: string,
    positionOrRange: number | ts.TextRange,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ts.RefactorEditInfo>;
}

export const allRefactorings: Refactoring[] = [
  ConvertToSignalInputRefactoring,
  ConvertToSignalInputBestEffortRefactoring,
];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CompilerOptions, NgCompiler} from '@angular/compiler-cli';
import ts from 'typescript';
import {ApplyRefactoringProgressFn, ApplyRefactoringResult} from '../../api';
import {
  ConvertFullClassToSignalInputsBestEffortRefactoring,
  ConvertFullClassToSignalInputsRefactoring,
} from './convert_to_signal_input/full_class_input_refactoring';
import {
  ConvertFieldToSignalInputBestEffortRefactoring,
  ConvertFieldToSignalInputRefactoring,
} from './convert_to_signal_input/individual_input_refactoring';
import {
  ConvertFullClassToSignalQueriesBestEffortRefactoring,
  ConvertFullClassToSignalQueriesRefactoring,
} from './convert_to_signal_queries/full_class_query_refactoring';
import {
  ConvertFieldToSignalQueryBestEffortRefactoring,
  ConvertFieldToSignalQueryRefactoring,
} from './convert_to_signal_queries/individual_query_refactoring';

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
  ): Promise<ApplyRefactoringResult>;
}

export const allRefactorings: Refactoring[] = [
  // Signal Input migration
  ConvertFieldToSignalInputRefactoring,
  ConvertFieldToSignalInputBestEffortRefactoring,
  ConvertFullClassToSignalInputsRefactoring,
  ConvertFullClassToSignalInputsBestEffortRefactoring,
  // Queries migration
  ConvertFieldToSignalQueryRefactoring,
  ConvertFieldToSignalQueryBestEffortRefactoring,
  ConvertFullClassToSignalQueriesRefactoring,
  ConvertFullClassToSignalQueriesBestEffortRefactoring,
];

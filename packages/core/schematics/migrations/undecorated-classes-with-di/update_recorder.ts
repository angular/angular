
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ImportManagerUpdateRecorder} from '../../utils/import_manager';

/**
 * Update recorder interface that is used to transform source files in a non-colliding
 * way. Also this indirection makes it possible to re-use transformation logic with
 * different replacement tools (e.g. TSLint or CLI devkit).
 */
export interface UpdateRecorder extends ImportManagerUpdateRecorder {
  addClassDecorator(node: ts.ClassDeclaration, text: string): void;
  addClassComment(node: ts.ClassDeclaration, text: string): void;
  commitUpdate(): void;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentCompilationJob } from '../compilation';
/**
 * Collapse the various conditions of conditional ops (if, switch) into a single test expression.
 */
export declare function generateConditionalExpressions(job: ComponentCompilationJob): void;

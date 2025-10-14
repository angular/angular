/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentCompilationJob } from '../compilation';
/**
 * Replaces the `storeLet` ops with variables that can be
 * used to reference the value within the same view.
 */
export declare function generateLocalLetReferences(job: ComponentCompilationJob): void;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentCompilationJob } from '../compilation';
/**
 * Locate projection slots, populate the each component's `ngContentSelectors` literal field,
 * populate `project` arguments, and generate the required `projectionDef` instruction for the job's
 * root view.
 */
export declare function generateProjectionDefs(job: ComponentCompilationJob): void;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentCompilationJob } from '../compilation';
/**
 * Locates all of the elements defined in a creation block and outputs an op
 * that will expose their definition location in the DOM.
 */
export declare function attachSourceLocations(job: ComponentCompilationJob): void;

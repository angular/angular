/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * Removes any `storeLet` calls that aren't referenced outside of the current view.
 */
export declare function optimizeStoreLet(job: CompilationJob): void;

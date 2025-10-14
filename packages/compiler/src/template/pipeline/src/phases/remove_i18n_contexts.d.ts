/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * Remove the i18n context ops after they are no longer needed, and null out references to them to
 * be safe.
 */
export declare function removeI18nContexts(job: CompilationJob): void;

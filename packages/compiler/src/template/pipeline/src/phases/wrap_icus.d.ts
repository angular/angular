/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * Wraps ICUs that do not already belong to an i18n block in a new i18n block.
 */
export declare function wrapI18nIcus(job: CompilationJob): void;

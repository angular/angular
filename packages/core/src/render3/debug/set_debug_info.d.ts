/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../../interface/type';
import { ClassDebugInfo } from '../interfaces/definition';
/**
 * Sets the debug info for an Angular class.
 *
 * This runtime is guarded by ngDevMode flag.
 */
export declare function ɵsetClassDebugInfo(type: Type<any>, debugInfo: ClassDebugInfo): void;

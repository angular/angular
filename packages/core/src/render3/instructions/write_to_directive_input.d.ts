/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DirectiveDef } from '../interfaces/definition';
export declare function writeToDirectiveInput<T>(def: DirectiveDef<T>, instance: T, publicName: string, value: unknown): void;

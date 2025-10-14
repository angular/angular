/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { PropType } from '../../../../protocol';
/**
 * Determines the devtools-PropType of a component's property
 * @param prop component's property
 * @returns PropType
 * @see `devtools/projects/protocol`
 */
export declare const getPropType: (prop: unknown) => PropType;

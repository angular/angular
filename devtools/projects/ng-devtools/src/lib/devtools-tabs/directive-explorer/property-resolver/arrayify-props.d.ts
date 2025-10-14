/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Descriptor } from '../../../../../../protocol';
import { Property } from './element-property-resolver';
export declare const arrayifyProps: (props: {
    [prop: string]: Descriptor;
} | Descriptor[], parent?: Property | null) => Property[];

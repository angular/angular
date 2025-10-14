/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Descriptor, NestedProp } from '../../../../protocol';
export declare function serializeDirectiveState(instance: object): Record<string, Descriptor>;
export declare function serializeValue(value: unknown): Descriptor;
export declare function deeplySerializeSelectedProperties(instance: object, props: NestedProp[]): Record<string, Descriptor>;

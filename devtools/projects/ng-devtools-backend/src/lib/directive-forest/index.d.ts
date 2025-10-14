/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentTreeNode } from '../interfaces';
export { getDirectiveHostElement, getLViewFromDirectiveOrElementInstance, METADATA_PROPERTY_NAME, } from './ltree';
export declare const buildDirectiveForestWithStrategy: (elements: Element[]) => ComponentTreeNode[];

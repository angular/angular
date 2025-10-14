/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TIcu } from '../interfaces/i18n';
import { TIcuContainerNode } from '../interfaces/node';
import { RNode } from '../interfaces/renderer_dom';
import { LView } from '../interfaces/view';
type IcuIterator = () => RNode | null;
export declare function loadIcuContainerVisitor(): (tIcuContainerNode: TIcuContainerNode, lView: LView) => IcuIterator;
export declare function createIcuIterator(tIcu: TIcu, lView: LView): IcuIterator;
export {};

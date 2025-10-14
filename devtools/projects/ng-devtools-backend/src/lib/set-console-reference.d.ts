/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementPosition } from '../../../protocol';
import { ComponentTreeNode } from './interfaces';
interface ConsoleReferenceNode {
    node: ComponentTreeNode | null;
    position: ElementPosition;
}
export declare const setConsoleReference: (referenceNode: ConsoleReferenceNode) => void;
export {};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DevToolsNode, ElementPosition } from '../../../../../../../protocol';
export interface IndexedNode extends DevToolsNode {
    position: ElementPosition;
    children: IndexedNode[];
    nativeElement?: never;
    hasNativeElement: boolean;
}
export declare const indexForest: (forest: (DevToolsNode & {
    hasNativeElement?: boolean;
})[]) => IndexedNode[];

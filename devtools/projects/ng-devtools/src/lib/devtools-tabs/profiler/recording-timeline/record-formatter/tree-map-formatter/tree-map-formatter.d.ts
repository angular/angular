/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementProfile, type ProfilerFrame } from '../../../../../../../../protocol';
import { RecordFormatter } from '../record-formatter';
export interface TreeMapNode {
    id: string;
    value: number;
    size: number;
    children: TreeMapNode[];
    original: ElementProfile | null;
}
export declare class TreeMapFormatter extends RecordFormatter<TreeMapNode> {
    cache: WeakMap<object, any>;
    formatFrame(record: ProfilerFrame): TreeMapNode;
    addFrame(nodes: TreeMapNode[], elements: ElementProfile[], prev?: TreeMapNode | null): void;
}

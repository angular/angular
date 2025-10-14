/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DirectiveProfile, ElementProfile, type ProfilerFrame } from '../../../../../../../../protocol';
import { RecordFormatter } from '../record-formatter';
export interface BargraphNode {
    parents: ElementProfile[];
    value: number;
    label: string;
    original: ElementProfile;
    count: number;
    directives?: DirectiveProfile[];
}
export declare class BarGraphFormatter extends RecordFormatter<BargraphNode[]> {
    cache: WeakMap<object, any>;
    formatFrame(frame: ProfilerFrame): BargraphNode[];
    addFrame(nodes: BargraphNode[], elements: ElementProfile[], parents?: ElementProfile[]): number;
}

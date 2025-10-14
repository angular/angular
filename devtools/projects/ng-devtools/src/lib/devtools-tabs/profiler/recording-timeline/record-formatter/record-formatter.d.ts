/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DirectiveProfile, ElementProfile, type ProfilerFrame } from '../../../../../../../protocol';
export interface TimelineView<T> {
    timeline: AppEntry<T>[];
}
export interface AppEntry<T> {
    app: T[];
    timeSpent: number;
    source: string;
}
export interface GraphNode {
    toolTip: string;
    style: Record<string, unknown>;
    frame: ProfilerFrame;
}
export declare abstract class RecordFormatter<T> {
    abstract formatFrame(frame: ProfilerFrame): T;
    abstract addFrame(nodes: T | T[], elements: ElementProfile[]): number | void;
    getLabel(element: ElementProfile): string;
    getValue(element: ElementProfile): number;
    getDirectiveValue(directive: DirectiveProfile): number;
}

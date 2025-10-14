/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementProfile, ProfilerFrame } from '../../../../../../../../protocol';
import { ThemeUi } from '../../../../../application-services/theme_types';
import { RecordFormatter } from '../record-formatter';
export interface FlamegraphNode {
    value: number;
    color?: string;
    children: FlamegraphNode[];
    label: string;
    instances: number;
    original: ElementProfile;
    changeDetected: boolean;
}
export declare const ROOT_LEVEL_ELEMENT_LABEL = "Entire application";
export declare class FlamegraphFormatter extends RecordFormatter<FlamegraphNode> {
    formatFrame(frame: ProfilerFrame, showChangeDetection?: boolean, theme?: ThemeUi): FlamegraphNode;
    addFrame(nodes: FlamegraphNode[], elements: ElementProfile[], showChangeDetection?: boolean, theme?: ThemeUi): number;
}

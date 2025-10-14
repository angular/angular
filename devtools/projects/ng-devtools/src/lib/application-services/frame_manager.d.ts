/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Frame } from '../application-environment';
export declare class FrameManager {
    private _selectedFrameId;
    private _frames;
    private _inspectedWindowTabId;
    private _frameUrlToFrameIds;
    private _messageBus;
    readonly frames: import("@angular/core").Signal<Frame[]>;
    readonly selectedFrame: import("@angular/core").Signal<Frame | null>;
    readonly topLevelFrameIsActive: import("@angular/core").Signal<boolean>;
    readonly activeFrameHasUniqueUrl: import("@angular/core").Signal<boolean>;
    static initialize(inspectedWindowTabIdTestOnly?: number | null): FrameManager;
    private initialize;
    isSelectedFrame(frame: Frame): boolean;
    inspectFrame(frame: Frame): void;
    private frameHasUniqueUrl;
    private addFrame;
    private removeFrame;
}

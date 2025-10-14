/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementPosition } from '../../../../protocol';
export interface ComponentInspectorOptions {
    onComponentEnter: (id: number) => void;
    onComponentSelect: (id: number) => void;
    onComponentLeave: () => void;
}
export declare class ComponentInspector {
    private _selectedComponent;
    private readonly _onComponentEnter;
    private readonly _onComponentSelect;
    private readonly _onComponentLeave;
    constructor(componentOptions?: ComponentInspectorOptions);
    startInspecting(): void;
    stopInspecting(): void;
    elementClick(e: MouseEvent): void;
    elementMouseOver(e: MouseEvent): void;
    cancelEvent(e: MouseEvent): void;
    bindMethods(): void;
    highlightByPosition(position: ElementPosition): void;
    highlightHydrationNodes(): void;
    removeHydrationHighlights(): void;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Signal } from '@angular/core';
import { DebugSignalGraph, ElementPosition } from '../../../../../../protocol';
/**
 * Keeps the signal graph of a provided element/component.
 */
export declare class SignalGraphManager {
    private readonly injector;
    private readonly messageBus;
    private readonly signalGraph;
    private unlistenFn?;
    private lastesSignalGraphMessageUnlistenFn?;
    /** Target element. */
    element: Signal<ElementPosition | undefined>;
    readonly graph: Signal<DebugSignalGraph | null>;
    constructor();
    /**
     * Listen for element/component change by a provided signal
     * and update the signal graph according to it.
     * @param element
     */
    listen(element: Signal<ElementPosition | undefined>): void;
    /**
     * Unlisten the currently listened element.
     */
    unlisten(): void;
    destroy(): void;
}

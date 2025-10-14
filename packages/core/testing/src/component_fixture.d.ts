/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, ChangeDetectorRef, ComponentRef, DebugElement, ElementRef, NgZone } from '../../src/core';
import { DeferBlockFixture } from './defer';
/**
 * Fixture for debugging and testing a component.
 *
 * @publicApi
 */
export declare class ComponentFixture<T> {
    componentRef: ComponentRef<T>;
    /**
     * The DebugElement associated with the root element of this component.
     */
    debugElement: DebugElement;
    /**
     * The instance of the root component class.
     */
    componentInstance: T;
    /**
     * The native element at the root of the component.
     */
    nativeElement: any;
    /**
     * The ElementRef for the element at the root of the component.
     */
    elementRef: ElementRef;
    /**
     * The ChangeDetectorRef for the component
     */
    changeDetectorRef: ChangeDetectorRef;
    private _renderer;
    private _isDestroyed;
    /** @internal */
    protected readonly _noZoneOptionIsSet: boolean | null;
    /** @internal */
    protected _ngZone: NgZone;
    /** @internal */
    protected readonly _appRef: ApplicationRef;
    private readonly _testAppRef;
    private readonly pendingTasks;
    private readonly appErrorHandler;
    private readonly zonelessEnabled;
    private readonly scheduler;
    private readonly rootEffectScheduler;
    private readonly autoDetectDefault;
    private autoDetect;
    private subscriptions;
    ngZone: NgZone | null;
    /** @docs-private */
    constructor(componentRef: ComponentRef<T>);
    /**
     * Trigger a change detection cycle for the component.
     */
    detectChanges(checkNoChanges?: boolean): void;
    /**
     * Do a change detection run to make sure there were no changes.
     */
    checkNoChanges(): void;
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     *
     * @param autoDetect Whether to autodetect changes. By default, `true`.
     * @deprecated For `autoDetect: true`, use `autoDetectChanges()`.
     * We have not seen a use-case for `autoDetect: false` but `changeDetectorRef.detach()` is a close equivalent.
     */
    autoDetectChanges(autoDetect: boolean): void;
    /**
     * Enables automatically synchronizing the view, as it would in an application.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    autoDetectChanges(): void;
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    isStable(): boolean;
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    whenStable(): Promise<any>;
    /**
     * Retrieves all defer block fixtures in the component fixture.
     */
    getDeferBlocks(): Promise<DeferBlockFixture[]>;
    private _getRenderer;
    /**
     * Get a promise that resolves when the ui state is stable following animations.
     */
    whenRenderingDone(): Promise<any>;
    /**
     * Trigger component destruction.
     */
    destroy(): void;
}

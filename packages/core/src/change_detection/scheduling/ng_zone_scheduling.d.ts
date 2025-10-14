/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, InjectionToken, StaticProvider } from '../../di';
import { NgZone } from '../../zone';
import { InternalNgZoneOptions } from '../../zone/ng_zone';
export declare class NgZoneChangeDetectionScheduler {
    private readonly zone;
    private readonly changeDetectionScheduler;
    private readonly applicationRef;
    private readonly applicationErrorHandler;
    private _onMicrotaskEmptySubscription?;
    initialize(): void;
    ngOnDestroy(): void;
}
/**
 * Internal token used to verify that `provideZoneChangeDetection` is not used
 * with the bootstrapModule API.
 */
export declare const PROVIDED_NG_ZONE: InjectionToken<boolean>;
export declare function internalProvideZoneChangeDetection({ ngZoneFactory, scheduleInRootZone, }: {
    ngZoneFactory?: () => NgZone;
    scheduleInRootZone?: boolean;
}): StaticProvider[];
/**
 * Provides `NgZone`-based change detection for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * `NgZone` is already provided in applications by default. This provider allows you to configure
 * options like `eventCoalescing` in the `NgZone`.
 * This provider is not available for `platformBrowser().bootstrapModule`, which uses
 * `BootstrapOptions` instead.
 *
 * @usageNotes
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZoneChangeDetection({eventCoalescing: true}),
 * ]});
 * ```
 *
 * @publicApi
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 * @see {@link NgZoneOptions}
 */
export declare function provideZoneChangeDetection(options?: NgZoneOptions): EnvironmentProviders;
/**
 * Used to configure event and run coalescing with `provideZoneChangeDetection`.
 *
 * @publicApi
 *
 * @see {@link provideZoneChangeDetection}
 */
export interface NgZoneOptions {
    /**
     * Optionally specify coalescing event change detections or not.
     * Consider the following case.
     *
     * ```html
     * <div (click)="doSomething()">
     *   <button (click)="doSomethingElse()"></button>
     * </div>
     * ```
     *
     * When button is clicked, because of the event bubbling, both
     * event handlers will be called and 2 change detections will be
     * triggered. We can coalesce such kind of events to trigger
     * change detection only once.
     *
     * By default, this option is set to false, meaning events will
     * not be coalesced, and change detection will be triggered multiple times.
     * If this option is set to true, change detection will be triggered
     * once in the scenario described above.
     */
    eventCoalescing?: boolean;
    /**
     * Optionally specify if `NgZone#run()` method invocations should be coalesced
     * into a single change detection.
     *
     * Consider the following case.
     * ```ts
     * for (let i = 0; i < 10; i ++) {
     *   ngZone.run(() => {
     *     // do something
     *   });
     * }
     * ```
     *
     * This case triggers the change detection multiple times.
     * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
     * In addition, the change detection executes in requestAnimation.
     *
     */
    runCoalescing?: boolean;
}
export declare function getNgZoneOptions(options?: NgZoneOptions): InternalNgZoneOptions;
export declare class ZoneStablePendingTask {
    private readonly subscription;
    private initialized;
    private readonly zone;
    private readonly pendingTasks;
    initialize(): void;
    ngOnDestroy(): void;
}

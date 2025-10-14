/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, Provider } from '../../di/interface/provider';
import { ChangeDetectionScheduler, NotificationSource } from './zoneless_scheduling';
export declare class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
    private readonly applicationErrorHandler;
    private readonly appRef;
    private readonly taskService;
    private readonly ngZone;
    private readonly zonelessEnabled;
    private readonly tracing;
    private readonly zoneIsDefined;
    private readonly schedulerTickApplyArgs;
    private readonly subscriptions;
    private readonly angularZoneId;
    private readonly scheduleInRootZone;
    private cancelScheduledCallback;
    private useMicrotaskScheduler;
    runningTick: boolean;
    pendingRenderTaskId: number | null;
    constructor();
    notify(source: NotificationSource): void;
    private shouldScheduleTick;
    /**
     * Calls ApplicationRef._tick inside the `NgZone`.
     *
     * Calling `tick` directly runs change detection and cancels any change detection that had been
     * scheduled previously.
     *
     * @param shouldRefreshViews Passed directly to `ApplicationRef._tick` and skips straight to
     *     render hooks when `false`.
     */
    private tick;
    ngOnDestroy(): void;
    private cleanup;
}
/**
 * Provides change detection without ZoneJS for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * This function allows you to configure the application to not use the state/state changes of
 * ZoneJS to schedule change detection in the application. This will work when ZoneJS is not present
 * on the page at all or if it exists because something else is using it (either another Angular
 * application which uses ZoneJS for scheduling or some other library that relies on ZoneJS).
 *
 * This can also be added to the `TestBed` providers to configure the test environment to more
 * closely match production behavior. This will help give higher confidence that components are
 * compatible with zoneless change detection.
 *
 * ZoneJS uses browser events to trigger change detection. When using this provider, Angular will
 * instead use Angular APIs to schedule change detection. These APIs include:
 *
 * - `ChangeDetectorRef.markForCheck`
 * - `ComponentRef.setInput`
 * - updating a signal that is read in a template
 * - when bound host or template listeners are triggered
 * - attaching a view that was marked dirty by one of the above
 * - removing a view
 * - registering a render hook (templates are only refreshed if render hooks do one of the above)
 *
 * @usageNotes
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZonelessChangeDetection(),
 * ]});
 * ```
 *
 * @publicApi 20.2
 *
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 */
export declare function provideZonelessChangeDetection(): EnvironmentProviders;
export declare function provideZonelessChangeDetectionInternal(): Provider[];

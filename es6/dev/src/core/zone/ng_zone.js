import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { normalizeBlank, isPresent, global } from 'angular2/src/facade/lang';
import { ObservableWrapper, EventEmitter } from 'angular2/src/facade/async';
import { wtfLeave, wtfCreateScope } from '../profile/profile';
/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export class NgZoneError {
    constructor(error, stackTrace) {
        this.error = error;
        this.stackTrace = stackTrace;
    }
}
/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 * ```
 * import {Component, View, NgZone} from 'angular2/core';
 * import {NgIf} from 'angular2/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo'.
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 *   directives: [NgIf]
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *       // reenter the Angular zone and display done
 *       this._ngZone.run(() => {console.log('Outside Done!') });
 *     }}));
 *   }
 *
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 */
export class NgZone {
    /**
     * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
     *               enabled in development mode as they significantly impact perf.
     */
    constructor({ enableLongStackTrace }) {
        /** @internal */
        this._runScope = wtfCreateScope(`NgZone#run()`);
        /** @internal */
        this._microtaskScope = wtfCreateScope(`NgZone#microtask()`);
        // Number of microtasks pending from _innerZone (& descendants)
        /** @internal */
        this._pendingMicrotasks = 0;
        // Whether some code has been executed in the _innerZone (& descendants) in the current turn
        /** @internal */
        this._hasExecutedCodeInInnerZone = false;
        // run() call depth in _mountZone. 0 at the end of a macrotask
        // zone.run(() => {         // top-level call
        //   zone.run(() => {});    // nested call -> in-turn
        // });
        /** @internal */
        this._nestedRun = 0;
        /** @internal */
        this._inVmTurnDone = false;
        /** @internal */
        this._pendingTimeouts = [];
        if (global.zone) {
            this._disabled = false;
            this._mountZone = global.zone;
            this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace);
        }
        else {
            this._disabled = true;
            this._mountZone = null;
        }
        this._onTurnStartEvents = new EventEmitter(false);
        this._onTurnDoneEvents = new EventEmitter(false);
        this._onEventDoneEvents = new EventEmitter(false);
        this._onErrorEvents = new EventEmitter(false);
    }
    /**
     * Sets the zone hook that is called just before a browser task that is handled by Angular
     * executes.
     *
     * The hook is called once per browser task that is handled by Angular.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onTurnStart` instead.
     */
    overrideOnTurnStart(onTurnStartHook) {
        this._onTurnStart = normalizeBlank(onTurnStartHook);
    }
    /**
     * Notifies subscribers just before Angular event turn starts.
     *
     * Emits an event once per browser task that is handled by Angular.
     */
    get onTurnStart() { return this._onTurnStartEvents; }
    /** @internal */
    _notifyOnTurnStart(parentRun) {
        parentRun.call(this._innerZone, () => { this._onTurnStartEvents.emit(null); });
    }
    /**
     * Sets the zone hook that is called immediately after Angular zone is done processing the current
     * task and any microtasks scheduled from that task.
     *
     * This is where we typically do change-detection.
     *
     * The hook is called once per browser task that is handled by Angular.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onTurnDone` instead.
     */
    overrideOnTurnDone(onTurnDoneHook) {
        this._onTurnDone = normalizeBlank(onTurnDoneHook);
    }
    /**
     * Notifies subscribers immediately after Angular zone is done processing
     * the current turn and any microtasks scheduled from that turn.
     *
     * Used by Angular as a signal to kick off change-detection.
     */
    get onTurnDone() { return this._onTurnDoneEvents; }
    /** @internal */
    _notifyOnTurnDone(parentRun) {
        parentRun.call(this._innerZone, () => { this._onTurnDoneEvents.emit(null); });
    }
    /**
     * Sets the zone hook that is called immediately after the `onTurnDone` callback is called and any
     * microstasks scheduled from within that callback are drained.
     *
     * `onEventDoneFn` is executed outside Angular zone, which means that we will no longer attempt to
     * sync the UI with any model changes that occur within this callback.
     *
     * This hook is useful for validating application state (e.g. in a test).
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onEventDone` instead.
     */
    overrideOnEventDone(onEventDoneFn, opt_waitForAsync = false) {
        var normalizedOnEventDone = normalizeBlank(onEventDoneFn);
        if (opt_waitForAsync) {
            this._onEventDone = () => {
                if (!this._pendingTimeouts.length) {
                    normalizedOnEventDone();
                }
            };
        }
        else {
            this._onEventDone = normalizedOnEventDone;
        }
    }
    /**
     * Notifies subscribers immediately after the final `onTurnDone` callback
     * before ending VM event.
     *
     * This event is useful for validating application state (e.g. in a test).
     */
    get onEventDone() { return this._onEventDoneEvents; }
    /** @internal */
    _notifyOnEventDone() {
        this.runOutsideAngular(() => { this._onEventDoneEvents.emit(null); });
    }
    /**
     * Whether there are any outstanding microtasks.
     */
    get hasPendingMicrotasks() { return this._pendingMicrotasks > 0; }
    /**
     * Whether there are any outstanding timers.
     */
    get hasPendingTimers() { return this._pendingTimeouts.length > 0; }
    /**
     * Whether there are any outstanding asychnronous tasks of any kind that are
     * scheduled to run within Angular zone.
     *
     * Useful as a signal of UI stability. For example, when a test reaches a
     * point when [hasPendingAsyncTasks] is `false` it might be a good time to run
     * test expectations.
     */
    get hasPendingAsyncTasks() { return this.hasPendingMicrotasks || this.hasPendingTimers; }
    /**
     * Sets the zone hook that is called when an error is thrown in the Angular zone.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onError` instead.
     */
    overrideOnErrorHandler(errorHandler) {
        this._onErrorHandler = normalizeBlank(errorHandler);
    }
    get onError() { return this._onErrorEvents; }
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     */
    run(fn) {
        if (this._disabled) {
            return fn();
        }
        else {
            var s = this._runScope();
            try {
                return this._innerZone.run(fn);
            }
            finally {
                wtfLeave(s);
            }
        }
    }
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    runOutsideAngular(fn) {
        if (this._disabled) {
            return fn();
        }
        else {
            return this._mountZone.run(fn);
        }
    }
    /** @internal */
    _createInnerZone(zone, enableLongStackTrace) {
        var microtaskScope = this._microtaskScope;
        var ngZone = this;
        var errorHandling;
        if (enableLongStackTrace) {
            errorHandling = StringMapWrapper.merge(Zone.longStackTraceZone, { onError: function (e) { ngZone._notifyOnError(this, e); } });
        }
        else {
            errorHandling = { onError: function (e) { ngZone._notifyOnError(this, e); } };
        }
        return zone.fork(errorHandling)
            .fork({
            '$run': function (parentRun) {
                return function () {
                    try {
                        ngZone._nestedRun++;
                        if (!ngZone._hasExecutedCodeInInnerZone) {
                            ngZone._hasExecutedCodeInInnerZone = true;
                            ngZone._notifyOnTurnStart(parentRun);
                            if (ngZone._onTurnStart) {
                                parentRun.call(ngZone._innerZone, ngZone._onTurnStart);
                            }
                        }
                        return parentRun.apply(this, arguments);
                    }
                    finally {
                        ngZone._nestedRun--;
                        // If there are no more pending microtasks, we are at the end of a VM turn (or in
                        // onTurnStart)
                        // _nestedRun will be 0 at the end of a macrotasks (it could be > 0 when there are
                        // nested calls
                        // to run()).
                        if (ngZone._pendingMicrotasks == 0 && ngZone._nestedRun == 0 &&
                            !this._inVmTurnDone) {
                            if (ngZone._hasExecutedCodeInInnerZone) {
                                try {
                                    this._inVmTurnDone = true;
                                    ngZone._notifyOnTurnDone(parentRun);
                                    if (ngZone._onTurnDone) {
                                        parentRun.call(ngZone._innerZone, ngZone._onTurnDone);
                                    }
                                }
                                finally {
                                    this._inVmTurnDone = false;
                                    ngZone._hasExecutedCodeInInnerZone = false;
                                }
                            }
                            if (ngZone._pendingMicrotasks === 0) {
                                ngZone._notifyOnEventDone();
                                if (isPresent(ngZone._onEventDone)) {
                                    ngZone.runOutsideAngular(ngZone._onEventDone);
                                }
                            }
                        }
                    }
                };
            },
            '$scheduleMicrotask': function (parentScheduleMicrotask) {
                return function (fn) {
                    ngZone._pendingMicrotasks++;
                    var microtask = function () {
                        var s = microtaskScope();
                        try {
                            fn();
                        }
                        finally {
                            ngZone._pendingMicrotasks--;
                            wtfLeave(s);
                        }
                    };
                    parentScheduleMicrotask.call(this, microtask);
                };
            },
            '$setTimeout': function (parentSetTimeout) {
                return function (fn, delay, ...args) {
                    var id;
                    var cb = function () {
                        fn();
                        ListWrapper.remove(ngZone._pendingTimeouts, id);
                    };
                    id = parentSetTimeout(cb, delay, args);
                    ngZone._pendingTimeouts.push(id);
                    return id;
                };
            },
            '$clearTimeout': function (parentClearTimeout) {
                return function (id) {
                    parentClearTimeout(id);
                    ListWrapper.remove(ngZone._pendingTimeouts, id);
                };
            },
            _innerZone: true
        });
    }
    /** @internal */
    _notifyOnError(zone, e) {
        if (isPresent(this._onErrorHandler) || ObservableWrapper.hasSubscribers(this._onErrorEvents)) {
            var trace = [normalizeBlank(e.stack)];
            while (zone && zone.constructedAtException) {
                trace.push(zone.constructedAtException.get());
                zone = zone.parent;
            }
            if (ObservableWrapper.hasSubscribers(this._onErrorEvents)) {
                ObservableWrapper.callEmit(this._onErrorEvents, new NgZoneError(e, trace));
            }
            if (isPresent(this._onErrorHandler)) {
                this._onErrorHandler(e, trace);
            }
        }
        else {
            console.log('## _notifyOnError ##');
            console.log(e.stack);
            throw e;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZS50cyJdLCJuYW1lcyI6WyJOZ1pvbmVFcnJvciIsIk5nWm9uZUVycm9yLmNvbnN0cnVjdG9yIiwiTmdab25lIiwiTmdab25lLmNvbnN0cnVjdG9yIiwiTmdab25lLm92ZXJyaWRlT25UdXJuU3RhcnQiLCJOZ1pvbmUub25UdXJuU3RhcnQiLCJOZ1pvbmUuX25vdGlmeU9uVHVyblN0YXJ0IiwiTmdab25lLm92ZXJyaWRlT25UdXJuRG9uZSIsIk5nWm9uZS5vblR1cm5Eb25lIiwiTmdab25lLl9ub3RpZnlPblR1cm5Eb25lIiwiTmdab25lLm92ZXJyaWRlT25FdmVudERvbmUiLCJOZ1pvbmUub25FdmVudERvbmUiLCJOZ1pvbmUuX25vdGlmeU9uRXZlbnREb25lIiwiTmdab25lLmhhc1BlbmRpbmdNaWNyb3Rhc2tzIiwiTmdab25lLmhhc1BlbmRpbmdUaW1lcnMiLCJOZ1pvbmUuaGFzUGVuZGluZ0FzeW5jVGFza3MiLCJOZ1pvbmUub3ZlcnJpZGVPbkVycm9ySGFuZGxlciIsIk5nWm9uZS5vbkVycm9yIiwiTmdab25lLnJ1biIsIk5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk5nWm9uZS5fY3JlYXRlSW5uZXJab25lIiwiTmdab25lLl9ub3RpZnlPbkVycm9yIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNyRSxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sMEJBQTBCO09BQ25FLEVBQUMsaUJBQWlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBYSxNQUFNLG9CQUFvQjtBQVd2RTs7R0FFRztBQUNIO0lBQ0VBLFlBQW1CQSxLQUFVQSxFQUFTQSxVQUFlQTtRQUFsQ0MsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBS0E7UUFBU0EsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBS0E7SUFBR0EsQ0FBQ0E7QUFDM0RELENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzRUc7QUFDSDtJQXdERUU7OztPQUdHQTtJQUNIQSxZQUFZQSxFQUFDQSxvQkFBb0JBLEVBQUNBO1FBM0RsQ0MsZ0JBQWdCQTtRQUNoQkEsY0FBU0EsR0FBZUEsY0FBY0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLGdCQUFnQkE7UUFDaEJBLG9CQUFlQSxHQUFlQSxjQUFjQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBNEJuRUEsK0RBQStEQTtRQUMvREEsZ0JBQWdCQTtRQUNoQkEsdUJBQWtCQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUMvQkEsNEZBQTRGQTtRQUM1RkEsZ0JBQWdCQTtRQUNoQkEsZ0NBQTJCQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUM3Q0EsOERBQThEQTtRQUM5REEsNkNBQTZDQTtRQUM3Q0EscURBQXFEQTtRQUNyREEsTUFBTUE7UUFDTkEsZ0JBQWdCQTtRQUNoQkEsZUFBVUEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFPdkJBLGdCQUFnQkE7UUFDaEJBLGtCQUFhQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUUvQkEsZ0JBQWdCQTtRQUNoQkEscUJBQWdCQSxHQUFhQSxFQUFFQSxDQUFDQTtRQU85QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ3ZCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUM5QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBQ2pGQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUN0QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBR0EsSUFBSUEsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbERBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLFlBQVlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVERDs7Ozs7Ozs7O09BU0dBO0lBQ0hBLG1CQUFtQkEsQ0FBQ0EsZUFBZ0NBO1FBQ2xERSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxjQUFjQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFFREY7Ozs7T0FJR0E7SUFDSEEsSUFBSUEsV0FBV0EsS0FBd0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFeEVILGdCQUFnQkE7SUFDaEJBLGtCQUFrQkEsQ0FBQ0EsU0FBU0E7UUFDMUJJLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLFFBQVFBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakZBLENBQUNBO0lBRURKOzs7Ozs7Ozs7OztPQVdHQTtJQUNIQSxrQkFBa0JBLENBQUNBLGNBQStCQTtRQUNoREssSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsY0FBY0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDcERBLENBQUNBO0lBRURMOzs7OztPQUtHQTtJQUNIQSxJQUFJQSxVQUFVQSxLQUFLTSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO0lBRW5ETixnQkFBZ0JBO0lBQ2hCQSxpQkFBaUJBLENBQUNBLFNBQVNBO1FBQ3pCTyxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxRQUFRQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hGQSxDQUFDQTtJQUVEUDs7Ozs7Ozs7Ozs7O09BWUdBO0lBQ0hBLG1CQUFtQkEsQ0FBQ0EsYUFBOEJBLEVBQUVBLGdCQUFnQkEsR0FBWUEsS0FBS0E7UUFDbkZRLElBQUlBLHFCQUFxQkEsR0FBR0EsY0FBY0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDMURBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBO2dCQUNsQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDbENBLHFCQUFxQkEsRUFBRUEsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtZQUNIQSxDQUFDQSxDQUFDQTtRQUNKQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxxQkFBcUJBLENBQUNBO1FBQzVDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEUjs7Ozs7T0FLR0E7SUFDSEEsSUFBSUEsV0FBV0EsS0FBS1MsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyRFQsZ0JBQWdCQTtJQUNoQkEsa0JBQWtCQTtRQUNoQlUsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxRQUFRQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3hFQSxDQUFDQTtJQUVEVjs7T0FFR0E7SUFDSEEsSUFBSUEsb0JBQW9CQSxLQUFjVyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTNFWDs7T0FFR0E7SUFDSEEsSUFBSUEsZ0JBQWdCQSxLQUFjWSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTVFWjs7Ozs7OztPQU9HQTtJQUNIQSxJQUFJQSxvQkFBb0JBLEtBQWNhLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsR2I7Ozs7OztPQU1HQTtJQUNIQSxzQkFBc0JBLENBQUNBLFlBQTZCQTtRQUNsRGMsSUFBSUEsQ0FBQ0EsZUFBZUEsR0FBR0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDdERBLENBQUNBO0lBRURkLElBQUlBLE9BQU9BLEtBQUtlLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO0lBRTdDZjs7Ozs7Ozs7O09BU0dBO0lBQ0hBLEdBQUdBLENBQUNBLEVBQWFBO1FBQ2ZnQixFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7WUFDekJBLElBQUlBLENBQUNBO2dCQUNIQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUNqQ0EsQ0FBQ0E7b0JBQVNBLENBQUNBO2dCQUNUQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNkQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEaEI7Ozs7Ozs7Ozs7O09BV0dBO0lBQ0hBLGlCQUFpQkEsQ0FBQ0EsRUFBYUE7UUFDN0JpQixFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURqQixnQkFBZ0JBO0lBQ2hCQSxnQkFBZ0JBLENBQUNBLElBQUlBLEVBQUVBLG9CQUFvQkE7UUFDekNrQixJQUFJQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQTtRQUMxQ0EsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbEJBLElBQUlBLGFBQWFBLENBQUNBO1FBRWxCQSxFQUFFQSxDQUFDQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxhQUFhQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQ2xDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEVBQUVBLEVBQUNBLE9BQU9BLEVBQUVBLFVBQVNBLENBQUNBLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUNBLENBQUNBLENBQUNBO1FBQzNGQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxhQUFhQSxHQUFHQSxFQUFDQSxPQUFPQSxFQUFFQSxVQUFTQSxDQUFDQSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDQSxDQUFDQTtRQUM3RUEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7YUFDMUJBLElBQUlBLENBQUNBO1lBQ0pBLE1BQU1BLEVBQUVBLFVBQVNBLFNBQVNBO2dCQUN4QixNQUFNLENBQUM7b0JBQ0wsSUFBSSxDQUFDO3dCQUNILE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDOzRCQUN4QyxNQUFNLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDOzRCQUMxQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ3JDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dDQUN4QixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUN6RCxDQUFDO3dCQUNILENBQUM7d0JBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMxQyxDQUFDOzRCQUFTLENBQUM7d0JBQ1QsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUNwQixpRkFBaUY7d0JBQ2pGLGVBQWU7d0JBQ2Ysa0ZBQWtGO3dCQUNsRixlQUFlO3dCQUNmLGFBQWE7d0JBQ2IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQixJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUM7NEJBQ3hELENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7NEJBQ3hCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7Z0NBQ3ZDLElBQUksQ0FBQztvQ0FDSCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztvQ0FDMUIsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO29DQUNwQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3Q0FDdkIsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztvQ0FDeEQsQ0FBQztnQ0FDSCxDQUFDO3dDQUFTLENBQUM7b0NBQ1QsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7b0NBQzNCLE1BQU0sQ0FBQywyQkFBMkIsR0FBRyxLQUFLLENBQUM7Z0NBQzdDLENBQUM7NEJBQ0gsQ0FBQzs0QkFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDcEMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0NBQzVCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNuQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dDQUNoRCxDQUFDOzRCQUNILENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDO2dCQUNILENBQUMsQ0FBQztZQUNKLENBQUM7WUFDREEsb0JBQW9CQSxFQUFFQSxVQUFTQSx1QkFBdUJBO2dCQUNwRCxNQUFNLENBQUMsVUFBUyxFQUFFO29CQUNoQixNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztvQkFDNUIsSUFBSSxTQUFTLEdBQUc7d0JBQ2QsSUFBSSxDQUFDLEdBQUcsY0FBYyxFQUFFLENBQUM7d0JBQ3pCLElBQUksQ0FBQzs0QkFDSCxFQUFFLEVBQUUsQ0FBQzt3QkFDUCxDQUFDO2dDQUFTLENBQUM7NEJBQ1QsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7NEJBQzVCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDZCxDQUFDO29CQUNILENBQUMsQ0FBQztvQkFDRix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0RBLGFBQWFBLEVBQUVBLFVBQVNBLGdCQUFnQkE7Z0JBQ3RDLE1BQU0sQ0FBQyxVQUFTLEVBQVksRUFBRSxLQUFhLEVBQUUsR0FBRyxJQUFJO29CQUNsRCxJQUFJLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsR0FBRzt3QkFDUCxFQUFFLEVBQUUsQ0FBQzt3QkFDTCxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDO29CQUNGLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN2QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNaLENBQUMsQ0FBQztZQUNKLENBQUM7WUFDREEsZUFBZUEsRUFBRUEsVUFBU0Esa0JBQWtCQTtnQkFDMUMsTUFBTSxDQUFDLFVBQVMsRUFBVTtvQkFDeEIsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3ZCLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0RBLFVBQVVBLEVBQUVBLElBQUlBO1NBQ2pCQSxDQUFDQSxDQUFDQTtJQUNUQSxDQUFDQTtJQUVEbEIsZ0JBQWdCQTtJQUNoQkEsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDcEJtQixFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdGQSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUV0Q0EsT0FBT0EsSUFBSUEsSUFBSUEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtnQkFDM0NBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzlDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUNyQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMURBLGlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsV0FBV0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0VBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLENBQUNBO1FBQ0hBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JCQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIbkIsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge25vcm1hbGl6ZUJsYW5rLCBpc1ByZXNlbnQsIGdsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXIsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi4vcHJvZmlsZS9wcm9maWxlJztcblxuZXhwb3J0IGludGVyZmFjZSBOZ1pvbmVab25lIGV4dGVuZHMgWm9uZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lubmVyWm9uZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBaZXJvQXJnRnVuY3Rpb24geyAoKTogdm9pZDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIEVycm9ySGFuZGxpbmdGbiB7IChlcnJvcjogYW55LCBzdGFja1RyYWNlOiBhbnkpOiB2b2lkOyB9XG5cbi8qKlxuICogU3RvcmVzIGVycm9yIGluZm9ybWF0aW9uOyBkZWxpdmVyZWQgdmlhIFtOZ1pvbmUub25FcnJvcl0gc3RyZWFtLlxuICovXG5leHBvcnQgY2xhc3MgTmdab25lRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXJyb3I6IGFueSwgcHVibGljIHN0YWNrVHJhY2U6IGFueSkge31cbn1cblxuLyoqXG4gKiBBbiBpbmplY3RhYmxlIHNlcnZpY2UgZm9yIGV4ZWN1dGluZyB3b3JrIGluc2lkZSBvciBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUuXG4gKlxuICogVGhlIG1vc3QgY29tbW9uIHVzZSBvZiB0aGlzIHNlcnZpY2UgaXMgdG8gb3B0aW1pemUgcGVyZm9ybWFuY2Ugd2hlbiBzdGFydGluZyBhIHdvcmsgY29uc2lzdGluZyBvZlxuICogb25lIG9yIG1vcmUgYXN5bmNocm9ub3VzIHRhc2tzIHRoYXQgZG9uJ3QgcmVxdWlyZSBVSSB1cGRhdGVzIG9yIGVycm9yIGhhbmRsaW5nIHRvIGJlIGhhbmRsZWQgYnlcbiAqIEFuZ3VsYXIuIFN1Y2ggdGFza3MgY2FuIGJlIGtpY2tlZCBvZmYgdmlhIHtAbGluayAjcnVuT3V0c2lkZUFuZ3VsYXJ9IGFuZCBpZiBuZWVkZWQsIHRoZXNlIHRhc2tzXG4gKiBjYW4gcmVlbnRlciB0aGUgQW5ndWxhciB6b25lIHZpYSB7QGxpbmsgI3J1bn0uXG4gKlxuICogPCEtLSBUT0RPOiBhZGQvZml4IGxpbmtzIHRvOlxuICogICAtIGRvY3MgZXhwbGFpbmluZyB6b25lcyBhbmQgdGhlIHVzZSBvZiB6b25lcyBpbiBBbmd1bGFyIGFuZCBjaGFuZ2UtZGV0ZWN0aW9uXG4gKiAgIC0gbGluayB0byBydW5PdXRzaWRlQW5ndWxhci9ydW4gKHRocm91Z2hvdXQgdGhpcyBmaWxlISlcbiAqICAgLS0+XG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBWaWV3LCBOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtOZ0lmfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ25nLXpvbmUtZGVtbycuXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGgyPkRlbW86IE5nWm9uZTwvaDI+XG4gKlxuICogICAgIDxwPlByb2dyZXNzOiB7e3Byb2dyZXNzfX0lPC9wPlxuICogICAgIDxwICpuZ0lmPVwicHJvZ3Jlc3MgPj0gMTAwXCI+RG9uZSBwcm9jZXNzaW5nIHt7bGFiZWx9fSBvZiBBbmd1bGFyIHpvbmUhPC9wPlxuICpcbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJwcm9jZXNzV2l0aGluQW5ndWxhclpvbmUoKVwiPlByb2Nlc3Mgd2l0aGluIEFuZ3VsYXIgem9uZTwvYnV0dG9uPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByb2Nlc3NPdXRzaWRlT2ZBbmd1bGFyWm9uZSgpXCI+UHJvY2VzcyBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZTwvYnV0dG9uPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdJZl1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTmdab25lRGVtbyB7XG4gKiAgIHByb2dyZXNzOiBudW1iZXIgPSAwO1xuICogICBsYWJlbDogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUpIHt9XG4gKlxuICogICAvLyBMb29wIGluc2lkZSB0aGUgQW5ndWxhciB6b25lXG4gKiAgIC8vIHNvIHRoZSBVSSBET0VTIHJlZnJlc2ggYWZ0ZXIgZWFjaCBzZXRUaW1lb3V0IGN5Y2xlXG4gKiAgIHByb2Nlc3NXaXRoaW5Bbmd1bGFyWm9uZSgpIHtcbiAqICAgICB0aGlzLmxhYmVsID0gJ2luc2lkZSc7XG4gKiAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gKiAgICAgdGhpcy5faW5jcmVhc2VQcm9ncmVzcygoKSA9PiBjb25zb2xlLmxvZygnSW5zaWRlIERvbmUhJykpO1xuICogICB9XG4gKlxuICogICAvLyBMb29wIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZVxuICogICAvLyBzbyB0aGUgVUkgRE9FUyBOT1QgcmVmcmVzaCBhZnRlciBlYWNoIHNldFRpbWVvdXQgY3ljbGVcbiAqICAgcHJvY2Vzc091dHNpZGVPZkFuZ3VsYXJab25lKCkge1xuICogICAgIHRoaXMubGFiZWwgPSAnb3V0c2lkZSc7XG4gKiAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gKiAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAqICAgICAgIHRoaXMuX2luY3JlYXNlUHJvZ3Jlc3MoKCkgPT4ge1xuICogICAgICAgLy8gcmVlbnRlciB0aGUgQW5ndWxhciB6b25lIGFuZCBkaXNwbGF5IGRvbmVcbiAqICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge2NvbnNvbGUubG9nKCdPdXRzaWRlIERvbmUhJykgfSk7XG4gKiAgICAgfX0pKTtcbiAqICAgfVxuICpcbiAqXG4gKiAgIF9pbmNyZWFzZVByb2dyZXNzKGRvbmVDYWxsYmFjazogKCkgPT4gdm9pZCkge1xuICogICAgIHRoaXMucHJvZ3Jlc3MgKz0gMTtcbiAqICAgICBjb25zb2xlLmxvZyhgQ3VycmVudCBwcm9ncmVzczogJHt0aGlzLnByb2dyZXNzfSVgKTtcbiAqXG4gKiAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPCAxMDApIHtcbiAqICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHRoaXMuX2luY3JlYXNlUHJvZ3Jlc3MoZG9uZUNhbGxiYWNrKSksIDEwKVxuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICBkb25lQ2FsbGJhY2soKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgTmdab25lIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcnVuU2NvcGU6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZShgTmdab25lI3J1bigpYCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21pY3JvdGFza1Njb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoYE5nWm9uZSNtaWNyb3Rhc2soKWApO1xuXG4gIC8vIENvZGUgZXhlY3V0ZWQgaW4gX21vdW50Wm9uZSBkb2VzIG5vdCB0cmlnZ2VyIHRoZSBvblR1cm5Eb25lLlxuICAvKiogQGludGVybmFsICovXG4gIF9tb3VudFpvbmU7XG4gIC8vIF9pbm5lclpvbmUgaXMgdGhlIGNoaWxkIG9mIF9tb3VudFpvbmUuIEFueSBjb2RlIGV4ZWN1dGVkIGluIHRoaXMgem9uZSB3aWxsIHRyaWdnZXIgdGhlXG4gIC8vIG9uVHVybkRvbmUgaG9vayBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IFZNIHR1cm4uXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lubmVyWm9uZTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9vblR1cm5TdGFydDogWmVyb0FyZ0Z1bmN0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF9vblR1cm5Eb25lOiBaZXJvQXJnRnVuY3Rpb247XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uRXZlbnREb25lOiBaZXJvQXJnRnVuY3Rpb247XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uRXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsaW5nRm47XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25UdXJuU3RhcnRFdmVudHM6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICAvKiogQGludGVybmFsICovXG4gIF9vblR1cm5Eb25lRXZlbnRzOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25FdmVudERvbmVFdmVudHM6IEV2ZW50RW1pdHRlcjxhbnk+O1xuICAvKiogQGludGVybmFsICovXG4gIF9vbkVycm9yRXZlbnRzOiBFdmVudEVtaXR0ZXI8YW55PjtcblxuICAvLyBOdW1iZXIgb2YgbWljcm90YXNrcyBwZW5kaW5nIGZyb20gX2lubmVyWm9uZSAoJiBkZXNjZW5kYW50cylcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGVuZGluZ01pY3JvdGFza3M6IG51bWJlciA9IDA7XG4gIC8vIFdoZXRoZXIgc29tZSBjb2RlIGhhcyBiZWVuIGV4ZWN1dGVkIGluIHRoZSBfaW5uZXJab25lICgmIGRlc2NlbmRhbnRzKSBpbiB0aGUgY3VycmVudCB0dXJuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hhc0V4ZWN1dGVkQ29kZUluSW5uZXJab25lOiBib29sZWFuID0gZmFsc2U7XG4gIC8vIHJ1bigpIGNhbGwgZGVwdGggaW4gX21vdW50Wm9uZS4gMCBhdCB0aGUgZW5kIG9mIGEgbWFjcm90YXNrXG4gIC8vIHpvbmUucnVuKCgpID0+IHsgICAgICAgICAvLyB0b3AtbGV2ZWwgY2FsbFxuICAvLyAgIHpvbmUucnVuKCgpID0+IHt9KTsgICAgLy8gbmVzdGVkIGNhbGwgLT4gaW4tdHVyblxuICAvLyB9KTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmVzdGVkUnVuOiBudW1iZXIgPSAwO1xuXG4gIC8vIFRPRE8odmljYik6IGltcGxlbWVudCB0aGlzIGNsYXNzIHByb3Blcmx5IGZvciBub2RlLmpzIGVudmlyb25tZW50XG4gIC8vIFRoaXMgZGlzYWJsZWQgZmxhZyBpcyBvbmx5IGhlcmUgdG8gcGxlYXNlIGNqcyB0ZXN0c1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKiogQGludGVybmFsICovXG4gIF9pblZtVHVybkRvbmU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9wZW5kaW5nVGltZW91dHM6IG51bWJlcltdID0gW107XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbH0gZW5hYmxlTG9uZ1N0YWNrVHJhY2Ugd2hldGhlciB0byBlbmFibGUgbG9uZyBzdGFjayB0cmFjZS4gVGhleSBzaG91bGQgb25seSBiZVxuICAgKiAgICAgICAgICAgICAgIGVuYWJsZWQgaW4gZGV2ZWxvcG1lbnQgbW9kZSBhcyB0aGV5IHNpZ25pZmljYW50bHkgaW1wYWN0IHBlcmYuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7ZW5hYmxlTG9uZ1N0YWNrVHJhY2V9KSB7XG4gICAgaWYgKGdsb2JhbC56b25lKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5fbW91bnRab25lID0gZ2xvYmFsLnpvbmU7XG4gICAgICB0aGlzLl9pbm5lclpvbmUgPSB0aGlzLl9jcmVhdGVJbm5lclpvbmUodGhpcy5fbW91bnRab25lLCBlbmFibGVMb25nU3RhY2tUcmFjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX21vdW50Wm9uZSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX29uVHVyblN0YXJ0RXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG4gICAgdGhpcy5fb25UdXJuRG9uZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuICAgIHRoaXMuX29uRXZlbnREb25lRXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG4gICAgdGhpcy5fb25FcnJvckV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHpvbmUgaG9vayB0aGF0IGlzIGNhbGxlZCBqdXN0IGJlZm9yZSBhIGJyb3dzZXIgdGFzayB0aGF0IGlzIGhhbmRsZWQgYnkgQW5ndWxhclxuICAgKiBleGVjdXRlcy5cbiAgICpcbiAgICogVGhlIGhvb2sgaXMgY2FsbGVkIG9uY2UgcGVyIGJyb3dzZXIgdGFzayB0aGF0IGlzIGhhbmRsZWQgYnkgQW5ndWxhci5cbiAgICpcbiAgICogU2V0dGluZyB0aGUgaG9vayBvdmVycmlkZXMgYW55IHByZXZpb3VzbHkgc2V0IGhvb2suXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHRoaXMgQVBJIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBVc2UgYG9uVHVyblN0YXJ0YCBpbnN0ZWFkLlxuICAgKi9cbiAgb3ZlcnJpZGVPblR1cm5TdGFydChvblR1cm5TdGFydEhvb2s6IFplcm9BcmdGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX29uVHVyblN0YXJ0ID0gbm9ybWFsaXplQmxhbmsob25UdXJuU3RhcnRIb29rKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RpZmllcyBzdWJzY3JpYmVycyBqdXN0IGJlZm9yZSBBbmd1bGFyIGV2ZW50IHR1cm4gc3RhcnRzLlxuICAgKlxuICAgKiBFbWl0cyBhbiBldmVudCBvbmNlIHBlciBicm93c2VyIHRhc2sgdGhhdCBpcyBoYW5kbGVkIGJ5IEFuZ3VsYXIuXG4gICAqL1xuICBnZXQgb25UdXJuU3RhcnQoKTogLyogU3ViamVjdCAqLyBhbnkgeyByZXR1cm4gdGhpcy5fb25UdXJuU3RhcnRFdmVudHM7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlPblR1cm5TdGFydChwYXJlbnRSdW4pOiB2b2lkIHtcbiAgICBwYXJlbnRSdW4uY2FsbCh0aGlzLl9pbm5lclpvbmUsICgpID0+IHsgdGhpcy5fb25UdXJuU3RhcnRFdmVudHMuZW1pdChudWxsKTsgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgem9uZSBob29rIHRoYXQgaXMgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIEFuZ3VsYXIgem9uZSBpcyBkb25lIHByb2Nlc3NpbmcgdGhlIGN1cnJlbnRcbiAgICogdGFzayBhbmQgYW55IG1pY3JvdGFza3Mgc2NoZWR1bGVkIGZyb20gdGhhdCB0YXNrLlxuICAgKlxuICAgKiBUaGlzIGlzIHdoZXJlIHdlIHR5cGljYWxseSBkbyBjaGFuZ2UtZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBUaGUgaG9vayBpcyBjYWxsZWQgb25jZSBwZXIgYnJvd3NlciB0YXNrIHRoYXQgaXMgaGFuZGxlZCBieSBBbmd1bGFyLlxuICAgKlxuICAgKiBTZXR0aW5nIHRoZSBob29rIG92ZXJyaWRlcyBhbnkgcHJldmlvdXNseSBzZXQgaG9vay5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgdGhpcyBBUEkgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuIFVzZSBgb25UdXJuRG9uZWAgaW5zdGVhZC5cbiAgICovXG4gIG92ZXJyaWRlT25UdXJuRG9uZShvblR1cm5Eb25lSG9vazogWmVyb0FyZ0Z1bmN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5fb25UdXJuRG9uZSA9IG5vcm1hbGl6ZUJsYW5rKG9uVHVybkRvbmVIb29rKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RpZmllcyBzdWJzY3JpYmVycyBpbW1lZGlhdGVseSBhZnRlciBBbmd1bGFyIHpvbmUgaXMgZG9uZSBwcm9jZXNzaW5nXG4gICAqIHRoZSBjdXJyZW50IHR1cm4gYW5kIGFueSBtaWNyb3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHRoYXQgdHVybi5cbiAgICpcbiAgICogVXNlZCBieSBBbmd1bGFyIGFzIGEgc2lnbmFsIHRvIGtpY2sgb2ZmIGNoYW5nZS1kZXRlY3Rpb24uXG4gICAqL1xuICBnZXQgb25UdXJuRG9uZSgpIHsgcmV0dXJuIHRoaXMuX29uVHVybkRvbmVFdmVudHM7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlPblR1cm5Eb25lKHBhcmVudFJ1bik6IHZvaWQge1xuICAgIHBhcmVudFJ1bi5jYWxsKHRoaXMuX2lubmVyWm9uZSwgKCkgPT4geyB0aGlzLl9vblR1cm5Eb25lRXZlbnRzLmVtaXQobnVsbCk7IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHpvbmUgaG9vayB0aGF0IGlzIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgYG9uVHVybkRvbmVgIGNhbGxiYWNrIGlzIGNhbGxlZCBhbmQgYW55XG4gICAqIG1pY3Jvc3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHdpdGhpbiB0aGF0IGNhbGxiYWNrIGFyZSBkcmFpbmVkLlxuICAgKlxuICAgKiBgb25FdmVudERvbmVGbmAgaXMgZXhlY3V0ZWQgb3V0c2lkZSBBbmd1bGFyIHpvbmUsIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd2lsbCBubyBsb25nZXIgYXR0ZW1wdCB0b1xuICAgKiBzeW5jIHRoZSBVSSB3aXRoIGFueSBtb2RlbCBjaGFuZ2VzIHRoYXQgb2NjdXIgd2l0aGluIHRoaXMgY2FsbGJhY2suXG4gICAqXG4gICAqIFRoaXMgaG9vayBpcyB1c2VmdWwgZm9yIHZhbGlkYXRpbmcgYXBwbGljYXRpb24gc3RhdGUgKGUuZy4gaW4gYSB0ZXN0KS5cbiAgICpcbiAgICogU2V0dGluZyB0aGUgaG9vayBvdmVycmlkZXMgYW55IHByZXZpb3VzbHkgc2V0IGhvb2suXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHRoaXMgQVBJIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBVc2UgYG9uRXZlbnREb25lYCBpbnN0ZWFkLlxuICAgKi9cbiAgb3ZlcnJpZGVPbkV2ZW50RG9uZShvbkV2ZW50RG9uZUZuOiBaZXJvQXJnRnVuY3Rpb24sIG9wdF93YWl0Rm9yQXN5bmM6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIHZhciBub3JtYWxpemVkT25FdmVudERvbmUgPSBub3JtYWxpemVCbGFuayhvbkV2ZW50RG9uZUZuKTtcbiAgICBpZiAob3B0X3dhaXRGb3JBc3luYykge1xuICAgICAgdGhpcy5fb25FdmVudERvbmUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fcGVuZGluZ1RpbWVvdXRzLmxlbmd0aCkge1xuICAgICAgICAgIG5vcm1hbGl6ZWRPbkV2ZW50RG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vbkV2ZW50RG9uZSA9IG5vcm1hbGl6ZWRPbkV2ZW50RG9uZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgc3Vic2NyaWJlcnMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGZpbmFsIGBvblR1cm5Eb25lYCBjYWxsYmFja1xuICAgKiBiZWZvcmUgZW5kaW5nIFZNIGV2ZW50LlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IGlzIHVzZWZ1bCBmb3IgdmFsaWRhdGluZyBhcHBsaWNhdGlvbiBzdGF0ZSAoZS5nLiBpbiBhIHRlc3QpLlxuICAgKi9cbiAgZ2V0IG9uRXZlbnREb25lKCkgeyByZXR1cm4gdGhpcy5fb25FdmVudERvbmVFdmVudHM7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlPbkV2ZW50RG9uZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHsgdGhpcy5fb25FdmVudERvbmVFdmVudHMuZW1pdChudWxsKTsgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGVyZSBhcmUgYW55IG91dHN0YW5kaW5nIG1pY3JvdGFza3MuXG4gICAqL1xuICBnZXQgaGFzUGVuZGluZ01pY3JvdGFza3MoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9wZW5kaW5nTWljcm90YXNrcyA+IDA7IH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGVyZSBhcmUgYW55IG91dHN0YW5kaW5nIHRpbWVycy5cbiAgICovXG4gIGdldCBoYXNQZW5kaW5nVGltZXJzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcGVuZGluZ1RpbWVvdXRzLmxlbmd0aCA+IDA7IH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGVyZSBhcmUgYW55IG91dHN0YW5kaW5nIGFzeWNobnJvbm91cyB0YXNrcyBvZiBhbnkga2luZCB0aGF0IGFyZVxuICAgKiBzY2hlZHVsZWQgdG8gcnVuIHdpdGhpbiBBbmd1bGFyIHpvbmUuXG4gICAqXG4gICAqIFVzZWZ1bCBhcyBhIHNpZ25hbCBvZiBVSSBzdGFiaWxpdHkuIEZvciBleGFtcGxlLCB3aGVuIGEgdGVzdCByZWFjaGVzIGFcbiAgICogcG9pbnQgd2hlbiBbaGFzUGVuZGluZ0FzeW5jVGFza3NdIGlzIGBmYWxzZWAgaXQgbWlnaHQgYmUgYSBnb29kIHRpbWUgdG8gcnVuXG4gICAqIHRlc3QgZXhwZWN0YXRpb25zLlxuICAgKi9cbiAgZ2V0IGhhc1BlbmRpbmdBc3luY1Rhc2tzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oYXNQZW5kaW5nTWljcm90YXNrcyB8fCB0aGlzLmhhc1BlbmRpbmdUaW1lcnM7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgem9uZSBob29rIHRoYXQgaXMgY2FsbGVkIHdoZW4gYW4gZXJyb3IgaXMgdGhyb3duIGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqXG4gICAqIFNldHRpbmcgdGhlIGhvb2sgb3ZlcnJpZGVzIGFueSBwcmV2aW91c2x5IHNldCBob29rLlxuICAgKlxuICAgKiBAZGVwcmVjYXRlZCB0aGlzIEFQSSB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS4gVXNlIGBvbkVycm9yYCBpbnN0ZWFkLlxuICAgKi9cbiAgb3ZlcnJpZGVPbkVycm9ySGFuZGxlcihlcnJvckhhbmRsZXI6IEVycm9ySGFuZGxpbmdGbikge1xuICAgIHRoaXMuX29uRXJyb3JIYW5kbGVyID0gbm9ybWFsaXplQmxhbmsoZXJyb3JIYW5kbGVyKTtcbiAgfVxuXG4gIGdldCBvbkVycm9yKCkgeyByZXR1cm4gdGhpcy5fb25FcnJvckV2ZW50czsgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgYGZuYCBmdW5jdGlvbiBzeW5jaHJvbm91c2x5IHdpdGhpbiB0aGUgQW5ndWxhciB6b25lIGFuZCByZXR1cm5zIHZhbHVlIHJldHVybmVkIGJ5XG4gICAqIHRoZSBmdW5jdGlvbi5cbiAgICpcbiAgICogUnVubmluZyBmdW5jdGlvbnMgdmlhIGBydW5gIGFsbG93cyB5b3UgdG8gcmVlbnRlciBBbmd1bGFyIHpvbmUgZnJvbSBhIHRhc2sgdGhhdCB3YXMgZXhlY3V0ZWRcbiAgICogb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lICh0eXBpY2FsbHkgc3RhcnRlZCB2aWEge0BsaW5rICNydW5PdXRzaWRlQW5ndWxhcn0pLlxuICAgKlxuICAgKiBBbnkgZnV0dXJlIHRhc2tzIG9yIG1pY3JvdGFza3Mgc2NoZWR1bGVkIGZyb20gd2l0aGluIHRoaXMgZnVuY3Rpb24gd2lsbCBjb250aW51ZSBleGVjdXRpbmcgZnJvbVxuICAgKiB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZS5cbiAgICovXG4gIHJ1bihmbjogKCkgPT4gYW55KTogYW55IHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcyA9IHRoaXMuX3J1blNjb3BlKCk7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW5uZXJab25lLnJ1bihmbik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3dGZMZWF2ZShzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGBmbmAgZnVuY3Rpb24gc3luY2hyb25vdXNseSBpbiBBbmd1bGFyJ3MgcGFyZW50IHpvbmUgYW5kIHJldHVybnMgdmFsdWUgcmV0dXJuZWQgYnlcbiAgICogdGhlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBSdW5uaW5nIGZ1bmN0aW9ucyB2aWEgYHJ1bk91dHNpZGVBbmd1bGFyYCBhbGxvd3MgeW91IHRvIGVzY2FwZSBBbmd1bGFyJ3Mgem9uZSBhbmQgZG8gd29yayB0aGF0XG4gICAqIGRvZXNuJ3QgdHJpZ2dlciBBbmd1bGFyIGNoYW5nZS1kZXRlY3Rpb24gb3IgaXMgc3ViamVjdCB0byBBbmd1bGFyJ3MgZXJyb3IgaGFuZGxpbmcuXG4gICAqXG4gICAqIEFueSBmdXR1cmUgdGFza3Mgb3IgbWljcm90YXNrcyBzY2hlZHVsZWQgZnJvbSB3aXRoaW4gdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIGV4ZWN1dGluZyBmcm9tXG4gICAqIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICpcbiAgICogVXNlIHtAbGluayAjcnVufSB0byByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgYW5kIGRvIHdvcmsgdGhhdCB1cGRhdGVzIHRoZSBhcHBsaWNhdGlvbiBtb2RlbC5cbiAgICovXG4gIHJ1bk91dHNpZGVBbmd1bGFyKGZuOiAoKSA9PiBhbnkpOiBhbnkge1xuICAgIGlmICh0aGlzLl9kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9tb3VudFpvbmUucnVuKGZuKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVJbm5lclpvbmUoem9uZSwgZW5hYmxlTG9uZ1N0YWNrVHJhY2UpIHtcbiAgICB2YXIgbWljcm90YXNrU2NvcGUgPSB0aGlzLl9taWNyb3Rhc2tTY29wZTtcbiAgICB2YXIgbmdab25lID0gdGhpcztcbiAgICB2YXIgZXJyb3JIYW5kbGluZztcblxuICAgIGlmIChlbmFibGVMb25nU3RhY2tUcmFjZSkge1xuICAgICAgZXJyb3JIYW5kbGluZyA9IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UoXG4gICAgICAgICAgWm9uZS5sb25nU3RhY2tUcmFjZVpvbmUsIHtvbkVycm9yOiBmdW5jdGlvbihlKSB7IG5nWm9uZS5fbm90aWZ5T25FcnJvcih0aGlzLCBlKTsgfX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvckhhbmRsaW5nID0ge29uRXJyb3I6IGZ1bmN0aW9uKGUpIHsgbmdab25lLl9ub3RpZnlPbkVycm9yKHRoaXMsIGUpOyB9fTtcbiAgICB9XG5cbiAgICByZXR1cm4gem9uZS5mb3JrKGVycm9ySGFuZGxpbmcpXG4gICAgICAgIC5mb3JrKHtcbiAgICAgICAgICAnJHJ1bic6IGZ1bmN0aW9uKHBhcmVudFJ1bikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG5nWm9uZS5fbmVzdGVkUnVuKys7XG4gICAgICAgICAgICAgICAgaWYgKCFuZ1pvbmUuX2hhc0V4ZWN1dGVkQ29kZUluSW5uZXJab25lKSB7XG4gICAgICAgICAgICAgICAgICBuZ1pvbmUuX2hhc0V4ZWN1dGVkQ29kZUluSW5uZXJab25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIG5nWm9uZS5fbm90aWZ5T25UdXJuU3RhcnQocGFyZW50UnVuKTtcbiAgICAgICAgICAgICAgICAgIGlmIChuZ1pvbmUuX29uVHVyblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudFJ1bi5jYWxsKG5nWm9uZS5faW5uZXJab25lLCBuZ1pvbmUuX29uVHVyblN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFJ1bi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIG5nWm9uZS5fbmVzdGVkUnVuLS07XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIG1vcmUgcGVuZGluZyBtaWNyb3Rhc2tzLCB3ZSBhcmUgYXQgdGhlIGVuZCBvZiBhIFZNIHR1cm4gKG9yIGluXG4gICAgICAgICAgICAgICAgLy8gb25UdXJuU3RhcnQpXG4gICAgICAgICAgICAgICAgLy8gX25lc3RlZFJ1biB3aWxsIGJlIDAgYXQgdGhlIGVuZCBvZiBhIG1hY3JvdGFza3MgKGl0IGNvdWxkIGJlID4gMCB3aGVuIHRoZXJlIGFyZVxuICAgICAgICAgICAgICAgIC8vIG5lc3RlZCBjYWxsc1xuICAgICAgICAgICAgICAgIC8vIHRvIHJ1bigpKS5cbiAgICAgICAgICAgICAgICBpZiAobmdab25lLl9wZW5kaW5nTWljcm90YXNrcyA9PSAwICYmIG5nWm9uZS5fbmVzdGVkUnVuID09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMuX2luVm1UdXJuRG9uZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKG5nWm9uZS5faGFzRXhlY3V0ZWRDb2RlSW5Jbm5lclpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pblZtVHVybkRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgIG5nWm9uZS5fbm90aWZ5T25UdXJuRG9uZShwYXJlbnRSdW4pO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChuZ1pvbmUuX29uVHVybkRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFJ1bi5jYWxsKG5nWm9uZS5faW5uZXJab25lLCBuZ1pvbmUuX29uVHVybkRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pblZtVHVybkRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICBuZ1pvbmUuX2hhc0V4ZWN1dGVkQ29kZUluSW5uZXJab25lID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKG5nWm9uZS5fcGVuZGluZ01pY3JvdGFza3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmdab25lLl9ub3RpZnlPbkV2ZW50RG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KG5nWm9uZS5fb25FdmVudERvbmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKG5nWm9uZS5fb25FdmVudERvbmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJyRzY2hlZHVsZU1pY3JvdGFzayc6IGZ1bmN0aW9uKHBhcmVudFNjaGVkdWxlTWljcm90YXNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgICAgICAgbmdab25lLl9wZW5kaW5nTWljcm90YXNrcysrO1xuICAgICAgICAgICAgICB2YXIgbWljcm90YXNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBtaWNyb3Rhc2tTY29wZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICBuZ1pvbmUuX3BlbmRpbmdNaWNyb3Rhc2tzLS07XG4gICAgICAgICAgICAgICAgICB3dGZMZWF2ZShzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHBhcmVudFNjaGVkdWxlTWljcm90YXNrLmNhbGwodGhpcywgbWljcm90YXNrKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcbiAgICAgICAgICAnJHNldFRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRTZXRUaW1lb3V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICAgIHZhciBpZDtcbiAgICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUobmdab25lLl9wZW5kaW5nVGltZW91dHMsIGlkKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaWQgPSBwYXJlbnRTZXRUaW1lb3V0KGNiLCBkZWxheSwgYXJncyk7XG4gICAgICAgICAgICAgIG5nWm9uZS5fcGVuZGluZ1RpbWVvdXRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgJyRjbGVhclRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRDbGVhclRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihpZDogbnVtYmVyKSB7XG4gICAgICAgICAgICAgIHBhcmVudENsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShuZ1pvbmUuX3BlbmRpbmdUaW1lb3V0cywgaWQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIF9pbm5lclpvbmU6IHRydWVcbiAgICAgICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlPbkVycm9yKHpvbmUsIGUpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX29uRXJyb3JIYW5kbGVyKSB8fCBPYnNlcnZhYmxlV3JhcHBlci5oYXNTdWJzY3JpYmVycyh0aGlzLl9vbkVycm9yRXZlbnRzKSkge1xuICAgICAgdmFyIHRyYWNlID0gW25vcm1hbGl6ZUJsYW5rKGUuc3RhY2spXTtcblxuICAgICAgd2hpbGUgKHpvbmUgJiYgem9uZS5jb25zdHJ1Y3RlZEF0RXhjZXB0aW9uKSB7XG4gICAgICAgIHRyYWNlLnB1c2goem9uZS5jb25zdHJ1Y3RlZEF0RXhjZXB0aW9uLmdldCgpKTtcbiAgICAgICAgem9uZSA9IHpvbmUucGFyZW50O1xuICAgICAgfVxuICAgICAgaWYgKE9ic2VydmFibGVXcmFwcGVyLmhhc1N1YnNjcmliZXJzKHRoaXMuX29uRXJyb3JFdmVudHMpKSB7XG4gICAgICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX29uRXJyb3JFdmVudHMsIG5ldyBOZ1pvbmVFcnJvcihlLCB0cmFjZSkpO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vbkVycm9ySGFuZGxlcikpIHtcbiAgICAgICAgdGhpcy5fb25FcnJvckhhbmRsZXIoZSwgdHJhY2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnIyMgX25vdGlmeU9uRXJyb3IgIyMnKTtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
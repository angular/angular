import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {normalizeBlank, isPresent, global, ZoneLike} from 'angular2/src/facade/lang';
import {ObservableWrapper, EventEmitter} from 'angular2/src/facade/async';
import {wtfLeave, wtfCreateScope, WtfScopeFn} from '../profile/profile';

export interface NgZoneZone extends ZoneLike {
  /** @internal */
  _innerZone: boolean;
}

/**
 * Interface for a function with zero arguments.
 */
export interface ZeroArgFunction { (): void; }

/**
 * Function type for an error handler, which takes an error and a stack trace.
 */
export interface ErrorHandlingFn { (error: any, stackTrace: any): void; }

/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export class NgZoneError {
  constructor(public error: any, public stackTrace: any) {}
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
  /** @internal */
  _runScope: WtfScopeFn = wtfCreateScope(`NgZone#run()`);
  /** @internal */
  _microtaskScope: WtfScopeFn = wtfCreateScope(`NgZone#microtask()`);

  // Code executed in _mountZone does not trigger the onTurnDone.
  /** @internal */
  _mountZone;
  // _innerZone is the child of _mountZone. Any code executed in this zone will trigger the
  // onTurnDone hook at the end of the current VM turn.
  /** @internal */
  _innerZone;

  /** @internal */
  _onTurnStart: ZeroArgFunction;
  /** @internal */
  _onTurnDone: ZeroArgFunction;
  /** @internal */
  _onEventDone: ZeroArgFunction;
  /** @internal */
  _onErrorHandler: ErrorHandlingFn;

  /** @internal */
  _onTurnStartEvents: EventEmitter<any>;
  /** @internal */
  _onTurnDoneEvents: EventEmitter<any>;
  /** @internal */
  _onEventDoneEvents: EventEmitter<any>;
  /** @internal */
  _onErrorEvents: EventEmitter<any>;

  // Number of microtasks pending from _innerZone (& descendants)
  /** @internal */
  _pendingMicrotasks: number = 0;
  // Whether some code has been executed in the _innerZone (& descendants) in the current turn
  /** @internal */
  _hasExecutedCodeInInnerZone: boolean = false;
  // run() call depth in _mountZone. 0 at the end of a macrotask
  // zone.run(() => {         // top-level call
  //   zone.run(() => {});    // nested call -> in-turn
  // });
  /** @internal */
  _nestedRun: number = 0;

  // TODO(vicb): implement this class properly for node.js environment
  // This disabled flag is only here to please cjs tests
  /** @internal */
  _disabled: boolean;

  /** @internal */
  _inVmTurnDone: boolean = false;

  /** @internal */
  _pendingTimeouts: number[] = [];

  /**
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  constructor({enableLongStackTrace}) {
    if (global.zone) {
      this._disabled = false;
      this._mountZone = global.zone;
      this._innerZone = this._createInnerZone(this._mountZone, enableLongStackTrace);
    } else {
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
  overrideOnTurnStart(onTurnStartHook: ZeroArgFunction): void {
    this._onTurnStart = normalizeBlank(onTurnStartHook);
  }

  /**
   * Notifies subscribers just before Angular event turn starts.
   *
   * Emits an event once per browser task that is handled by Angular.
   */
  get onTurnStart(): /* Subject */ any { return this._onTurnStartEvents; }

  /** @internal */
  _notifyOnTurnStart(parentRun): void {
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
  overrideOnTurnDone(onTurnDoneHook: ZeroArgFunction): void {
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
  _notifyOnTurnDone(parentRun): void {
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
  overrideOnEventDone(onEventDoneFn: ZeroArgFunction, opt_waitForAsync: boolean = false): void {
    var normalizedOnEventDone = normalizeBlank(onEventDoneFn);
    if (opt_waitForAsync) {
      this._onEventDone = () => {
        if (!this._pendingTimeouts.length) {
          normalizedOnEventDone();
        }
      };
    } else {
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
  _notifyOnEventDone(): void {
    this.runOutsideAngular(() => { this._onEventDoneEvents.emit(null); });
  }

  /**
   * Whether there are any outstanding microtasks.
   */
  get hasPendingMicrotasks(): boolean { return this._pendingMicrotasks > 0; }

  /**
   * Whether there are any outstanding timers.
   */
  get hasPendingTimers(): boolean { return this._pendingTimeouts.length > 0; }

  /**
   * Whether there are any outstanding asynchronous tasks of any kind that are
   * scheduled to run within Angular zone.
   *
   * Useful as a signal of UI stability. For example, when a test reaches a
   * point when [hasPendingAsyncTasks] is `false` it might be a good time to run
   * test expectations.
   */
  get hasPendingAsyncTasks(): boolean { return this.hasPendingMicrotasks || this.hasPendingTimers; }

  /**
   * Sets the zone hook that is called when an error is thrown in the Angular zone.
   *
   * Setting the hook overrides any previously set hook.
   *
   * @deprecated this API will be removed in the future. Use `onError` instead.
   */
  overrideOnErrorHandler(errorHandler: ErrorHandlingFn) {
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
  run(fn: () => any): any {
    if (this._disabled) {
      return fn();
    } else {
      var s = this._runScope();
      try {
        return this._innerZone.run(fn);
      } finally {
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
  runOutsideAngular(fn: () => any): any {
    if (this._disabled) {
      return fn();
    } else {
      return this._mountZone.run(fn);
    }
  }

  /** @internal */
  _createInnerZone(zone, enableLongStackTrace) {
    var microtaskScope = this._microtaskScope;
    var ngZone = this;
    var errorHandling;

    if (enableLongStackTrace) {
      errorHandling =
          StringMapWrapper.merge(global.Zone.longStackTraceZone,
                                 {onError: function(e) { ngZone._notifyOnError(this, e); }});
    } else {
      errorHandling = {onError: function(e) { ngZone._notifyOnError(this, e); }};
    }

    return zone.fork(errorHandling)
        .fork({
          '$run': function(parentRun) {
            return function() {
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
              } finally {
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
                    } finally {
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
          '$scheduleMicrotask': function(parentScheduleMicrotask) {
            return function(fn) {
              ngZone._pendingMicrotasks++;
              var microtask = function() {
                var s = microtaskScope();
                try {
                  fn();
                } finally {
                  ngZone._pendingMicrotasks--;
                  wtfLeave(s);
                }
              };
              parentScheduleMicrotask.call(this, microtask);
            };
          },
          '$setTimeout': function(parentSetTimeout) {
            return function(fn: Function, delay: number, ...args) {
              var id;
              var cb = function() {
                fn();
                ListWrapper.remove(ngZone._pendingTimeouts, id);
              };
              id = parentSetTimeout.call(this, cb, delay, args);
              ngZone._pendingTimeouts.push(id);
              return id;
            };
          },
          '$clearTimeout': function(parentClearTimeout) {
            return function(id: number) {
              parentClearTimeout.call(this, id);
              ListWrapper.remove(ngZone._pendingTimeouts, id);
            };
          },
          _innerZone: true
        });
  }

  /** @internal */
  _notifyOnError(zone, e): void {
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
    } else {
      console.log('## _notifyOnError ##');
      console.log(e.stack);
      throw e;
    }
  }
}

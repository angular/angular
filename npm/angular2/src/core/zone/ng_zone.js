'use strict';"use strict";
var async_1 = require('angular2/src/facade/async');
var ng_zone_impl_1 = require('./ng_zone_impl');
var exceptions_1 = require('../../facade/exceptions');
var ng_zone_impl_2 = require('./ng_zone_impl');
exports.NgZoneError = ng_zone_impl_2.NgZoneError;
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
var NgZone = (function () {
    /**
     * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
     *               enabled in development mode as they significantly impact perf.
     */
    function NgZone(_a) {
        var _this = this;
        var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
        this._hasPendingMicrotasks = false;
        this._hasPendingMacrotasks = false;
        /** @internal */
        this._isStable = true;
        /** @internal */
        this._nesting = 0;
        /** @internal */
        this._onUnstable = new async_1.EventEmitter(false);
        /** @internal */
        this._onMicrotaskEmpty = new async_1.EventEmitter(false);
        /** @internal */
        this._onStable = new async_1.EventEmitter(false);
        /** @internal */
        this._onErrorEvents = new async_1.EventEmitter(false);
        this._zoneImpl = new ng_zone_impl_1.NgZoneImpl({
            trace: enableLongStackTrace,
            onEnter: function () {
                // console.log('ZONE.enter', this._nesting, this._isStable);
                _this._nesting++;
                if (_this._isStable) {
                    _this._isStable = false;
                    _this._onUnstable.emit(null);
                }
            },
            onLeave: function () {
                _this._nesting--;
                // console.log('ZONE.leave', this._nesting, this._isStable);
                _this._checkStable();
            },
            setMicrotask: function (hasMicrotasks) {
                _this._hasPendingMicrotasks = hasMicrotasks;
                _this._checkStable();
            },
            setMacrotask: function (hasMacrotasks) { _this._hasPendingMacrotasks = hasMacrotasks; },
            onError: function (error) { return _this._onErrorEvents.emit(error); }
        });
    }
    NgZone.isInAngularZone = function () { return ng_zone_impl_1.NgZoneImpl.isInAngularZone(); };
    NgZone.assertInAngularZone = function () {
        if (!ng_zone_impl_1.NgZoneImpl.isInAngularZone()) {
            throw new exceptions_1.BaseException('Expected to be in Angular Zone, but it is not!');
        }
    };
    NgZone.assertNotInAngularZone = function () {
        if (ng_zone_impl_1.NgZoneImpl.isInAngularZone()) {
            throw new exceptions_1.BaseException('Expected to not be in Angular Zone, but it is!');
        }
    };
    NgZone.prototype._checkStable = function () {
        var _this = this;
        if (this._nesting == 0) {
            if (!this._hasPendingMicrotasks && !this._isStable) {
                try {
                    // console.log('ZONE.microtaskEmpty');
                    this._nesting++;
                    this._onMicrotaskEmpty.emit(null);
                }
                finally {
                    this._nesting--;
                    if (!this._hasPendingMicrotasks) {
                        try {
                            // console.log('ZONE.stable', this._nesting, this._isStable);
                            this.runOutsideAngular(function () { return _this._onStable.emit(null); });
                        }
                        finally {
                            this._isStable = true;
                        }
                    }
                }
            }
        }
    };
    ;
    Object.defineProperty(NgZone.prototype, "onUnstable", {
        /**
         * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
         */
        get: function () { return this._onUnstable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onMicrotaskEmpty", {
        /**
         * Notifies when there is no more microtasks enqueue in the current VM Turn.
         * This is a hint for Angular to do change detection, which may enqueue more microtasks.
         * For this reason this event can fire multiple times per VM Turn.
         */
        get: function () { return this._onMicrotaskEmpty; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onStable", {
        /**
         * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
         * implies we are about to relinquish VM turn.
         * This event gets called just once.
         */
        get: function () { return this._onStable; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "onError", {
        /**
         * Notify that an error has been delivered.
         */
        get: function () { return this._onErrorEvents; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "hasPendingMicrotasks", {
        /**
         * Whether there are any outstanding microtasks.
         */
        get: function () { return this._hasPendingMicrotasks; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgZone.prototype, "hasPendingMacrotasks", {
        /**
         * Whether there are any outstanding microtasks.
         */
        get: function () { return this._hasPendingMacrotasks; },
        enumerable: true,
        configurable: true
    });
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    NgZone.prototype.run = function (fn) { return this._zoneImpl.runInner(fn); };
    /**
     * Same as #run, except that synchronous errors are caught and forwarded
     * via `onError` and not rethrown.
     */
    NgZone.prototype.runGuarded = function (fn) { return this._zoneImpl.runInnerGuarded(fn); };
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
    NgZone.prototype.runOutsideAngular = function (fn) { return this._zoneImpl.runOuter(fn); };
    return NgZone;
}());
exports.NgZone = NgZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsc0JBQTJCLDJCQUEyQixDQUFDLENBQUE7QUFDdkQsNkJBQXNDLGdCQUFnQixDQUFDLENBQUE7QUFDdkQsMkJBQTRCLHlCQUF5QixDQUFDLENBQUE7QUFDdEQsNkJBQTBCLGdCQUFnQixDQUFDO0FBQW5DLGlEQUFtQztBQUczQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNFRztBQUNIO0lBK0JFOzs7T0FHRztJQUNILGdCQUFZLEVBQThCO1FBbkM1QyxpQkFxSkM7WUFsSGMsNEJBQTRCLEVBQTVCLGlEQUE0QjtRQXBCakMsMEJBQXFCLEdBQVksS0FBSyxDQUFDO1FBQ3ZDLDBCQUFxQixHQUFZLEtBQUssQ0FBQztRQUUvQyxnQkFBZ0I7UUFDUixjQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLGdCQUFnQjtRQUNSLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsZ0JBQWdCO1FBQ1IsZ0JBQVcsR0FBc0IsSUFBSSxvQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pFLGdCQUFnQjtRQUNSLHNCQUFpQixHQUFzQixJQUFJLG9CQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkUsZ0JBQWdCO1FBQ1IsY0FBUyxHQUFzQixJQUFJLG9CQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0QsZ0JBQWdCO1FBQ1IsbUJBQWMsR0FBc0IsSUFBSSxvQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBT2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx5QkFBVSxDQUFDO1lBQzlCLEtBQUssRUFBRSxvQkFBb0I7WUFDM0Is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Ozs7T0FBQTtJQU81RSxzQkFBSSw0QkFBUTtRQUxaOzs7O1dBSUc7YUFDSCxjQUFvQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBSzVELHNCQUFJLDJCQUFPO1FBSFg7O1dBRUc7YUFDSCxjQUFtQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBS2hFLHNCQUFJLHdDQUFvQjtRQUh4Qjs7V0FFRzthQUNILGNBQXNDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUsxRSxzQkFBSSx3Q0FBb0I7UUFIeEI7O1dBRUc7YUFDSCxjQUFzQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFMUU7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxvQkFBRyxHQUFILFVBQUksRUFBYSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFL0Q7OztPQUdHO0lBQ0gsMkJBQVUsR0FBVixVQUFXLEVBQWEsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTdFOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsa0NBQWlCLEdBQWpCLFVBQWtCLEVBQWEsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9FLGFBQUM7QUFBRCxDQUFDLEFBckpELElBcUpDO0FBckpZLGNBQU0sU0FxSmxCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge05nWm9uZUltcGwsIE5nWm9uZUVycm9yfSBmcm9tICcuL25nX3pvbmVfaW1wbCc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJy4uLy4uL2ZhY2FkZS9leGNlcHRpb25zJztcbmV4cG9ydCB7Tmdab25lRXJyb3J9IGZyb20gJy4vbmdfem9uZV9pbXBsJztcblxuXG4vKipcbiAqIEFuIGluamVjdGFibGUgc2VydmljZSBmb3IgZXhlY3V0aW5nIHdvcmsgaW5zaWRlIG9yIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAqXG4gKiBUaGUgbW9zdCBjb21tb24gdXNlIG9mIHRoaXMgc2VydmljZSBpcyB0byBvcHRpbWl6ZSBwZXJmb3JtYW5jZSB3aGVuIHN0YXJ0aW5nIGEgd29yayBjb25zaXN0aW5nIG9mXG4gKiBvbmUgb3IgbW9yZSBhc3luY2hyb25vdXMgdGFza3MgdGhhdCBkb24ndCByZXF1aXJlIFVJIHVwZGF0ZXMgb3IgZXJyb3IgaGFuZGxpbmcgdG8gYmUgaGFuZGxlZCBieVxuICogQW5ndWxhci4gU3VjaCB0YXNrcyBjYW4gYmUga2lja2VkIG9mZiB2aWEge0BsaW5rICNydW5PdXRzaWRlQW5ndWxhcn0gYW5kIGlmIG5lZWRlZCwgdGhlc2UgdGFza3NcbiAqIGNhbiByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgdmlhIHtAbGluayAjcnVufS5cbiAqXG4gKiA8IS0tIFRPRE86IGFkZC9maXggbGlua3MgdG86XG4gKiAgIC0gZG9jcyBleHBsYWluaW5nIHpvbmVzIGFuZCB0aGUgdXNlIG9mIHpvbmVzIGluIEFuZ3VsYXIgYW5kIGNoYW5nZS1kZXRlY3Rpb25cbiAqICAgLSBsaW5rIHRvIHJ1bk91dHNpZGVBbmd1bGFyL3J1biAodGhyb3VnaG91dCB0aGlzIGZpbGUhKVxuICogICAtLT5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbFk5bThITHk3ejA2dkRvVWFTTjI/cD1wcmV2aWV3KSlcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIFZpZXcsIE5nWm9uZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge05nSWZ9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmctem9uZS1kZW1vJy5cbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aDI+RGVtbzogTmdab25lPC9oMj5cbiAqXG4gKiAgICAgPHA+UHJvZ3Jlc3M6IHt7cHJvZ3Jlc3N9fSU8L3A+XG4gKiAgICAgPHAgKm5nSWY9XCJwcm9ncmVzcyA+PSAxMDBcIj5Eb25lIHByb2Nlc3Npbmcge3tsYWJlbH19IG9mIEFuZ3VsYXIgem9uZSE8L3A+XG4gKlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByb2Nlc3NXaXRoaW5Bbmd1bGFyWm9uZSgpXCI+UHJvY2VzcyB3aXRoaW4gQW5ndWxhciB6b25lPC9idXR0b24+XG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwicHJvY2Vzc091dHNpZGVPZkFuZ3VsYXJab25lKClcIj5Qcm9jZXNzIG91dHNpZGUgb2YgQW5ndWxhciB6b25lPC9idXR0b24+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ0lmXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBOZ1pvbmVEZW1vIHtcbiAqICAgcHJvZ3Jlc3M6IG51bWJlciA9IDA7XG4gKiAgIGxhYmVsOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge31cbiAqXG4gKiAgIC8vIExvb3AgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmVcbiAqICAgLy8gc28gdGhlIFVJIERPRVMgcmVmcmVzaCBhZnRlciBlYWNoIHNldFRpbWVvdXQgY3ljbGVcbiAqICAgcHJvY2Vzc1dpdGhpbkFuZ3VsYXJab25lKCkge1xuICogICAgIHRoaXMubGFiZWwgPSAnaW5zaWRlJztcbiAqICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAqICAgICB0aGlzLl9pbmNyZWFzZVByb2dyZXNzKCgpID0+IGNvbnNvbGUubG9nKCdJbnNpZGUgRG9uZSEnKSk7XG4gKiAgIH1cbiAqXG4gKiAgIC8vIExvb3Agb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lXG4gKiAgIC8vIHNvIHRoZSBVSSBET0VTIE5PVCByZWZyZXNoIGFmdGVyIGVhY2ggc2V0VGltZW91dCBjeWNsZVxuICogICBwcm9jZXNzT3V0c2lkZU9mQW5ndWxhclpvbmUoKSB7XG4gKiAgICAgdGhpcy5sYWJlbCA9ICdvdXRzaWRlJztcbiAqICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAqICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICogICAgICAgdGhpcy5faW5jcmVhc2VQcm9ncmVzcygoKSA9PiB7XG4gKiAgICAgICAvLyByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgYW5kIGRpc3BsYXkgZG9uZVxuICogICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7Y29uc29sZS5sb2coJ091dHNpZGUgRG9uZSEnKSB9KTtcbiAqICAgICB9fSkpO1xuICogICB9XG4gKlxuICpcbiAqICAgX2luY3JlYXNlUHJvZ3Jlc3MoZG9uZUNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XG4gKiAgICAgdGhpcy5wcm9ncmVzcyArPSAxO1xuICogICAgIGNvbnNvbGUubG9nKGBDdXJyZW50IHByb2dyZXNzOiAke3RoaXMucHJvZ3Jlc3N9JWApO1xuICpcbiAqICAgICBpZiAodGhpcy5wcm9ncmVzcyA8IDEwMCkge1xuICogICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdGhpcy5faW5jcmVhc2VQcm9ncmVzcyhkb25lQ2FsbGJhY2spKSwgMTApXG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIGRvbmVDYWxsYmFjaygpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1pvbmUge1xuICBzdGF0aWMgaXNJbkFuZ3VsYXJab25lKCk6IGJvb2xlYW4geyByZXR1cm4gTmdab25lSW1wbC5pc0luQW5ndWxhclpvbmUoKTsgfVxuICBzdGF0aWMgYXNzZXJ0SW5Bbmd1bGFyWm9uZSgpOiB2b2lkIHtcbiAgICBpZiAoIU5nWm9uZUltcGwuaXNJbkFuZ3VsYXJab25lKCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdFeHBlY3RlZCB0byBiZSBpbiBBbmd1bGFyIFpvbmUsIGJ1dCBpdCBpcyBub3QhJyk7XG4gICAgfVxuICB9XG4gIHN0YXRpYyBhc3NlcnROb3RJbkFuZ3VsYXJab25lKCk6IHZvaWQge1xuICAgIGlmIChOZ1pvbmVJbXBsLmlzSW5Bbmd1bGFyWm9uZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignRXhwZWN0ZWQgdG8gbm90IGJlIGluIEFuZ3VsYXIgWm9uZSwgYnV0IGl0IGlzIScpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3pvbmVJbXBsOiBOZ1pvbmVJbXBsO1xuXG4gIHByaXZhdGUgX2hhc1BlbmRpbmdNaWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2hhc1BlbmRpbmdNYWNyb3Rhc2tzOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9pc1N0YWJsZSA9IHRydWU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfbmVzdGluZyA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfb25VbnN0YWJsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKGZhbHNlKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9vbk1pY3JvdGFza0VtcHR5OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX29uU3RhYmxlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoZmFsc2UpO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX29uRXJyb3JFdmVudHM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbH0gZW5hYmxlTG9uZ1N0YWNrVHJhY2Ugd2hldGhlciB0byBlbmFibGUgbG9uZyBzdGFjayB0cmFjZS4gVGhleSBzaG91bGQgb25seSBiZVxuICAgKiAgICAgICAgICAgICAgIGVuYWJsZWQgaW4gZGV2ZWxvcG1lbnQgbW9kZSBhcyB0aGV5IHNpZ25pZmljYW50bHkgaW1wYWN0IHBlcmYuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7ZW5hYmxlTG9uZ1N0YWNrVHJhY2UgPSBmYWxzZX0pIHtcbiAgICB0aGlzLl96b25lSW1wbCA9IG5ldyBOZ1pvbmVJbXBsKHtcbiAgICAgIHRyYWNlOiBlbmFibGVMb25nU3RhY2tUcmFjZSxcbiAgICAgIG9uRW50ZXI6ICgpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1pPTkUuZW50ZXInLCB0aGlzLl9uZXN0aW5nLCB0aGlzLl9pc1N0YWJsZSk7XG4gICAgICAgIHRoaXMuX25lc3RpbmcrKztcbiAgICAgICAgaWYgKHRoaXMuX2lzU3RhYmxlKSB7XG4gICAgICAgICAgdGhpcy5faXNTdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLl9vblVuc3RhYmxlLmVtaXQobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbkxlYXZlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX25lc3RpbmctLTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1pPTkUubGVhdmUnLCB0aGlzLl9uZXN0aW5nLCB0aGlzLl9pc1N0YWJsZSk7XG4gICAgICAgIHRoaXMuX2NoZWNrU3RhYmxlKCk7XG4gICAgICB9LFxuICAgICAgc2V0TWljcm90YXNrOiAoaGFzTWljcm90YXNrczogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLl9oYXNQZW5kaW5nTWljcm90YXNrcyA9IGhhc01pY3JvdGFza3M7XG4gICAgICAgIHRoaXMuX2NoZWNrU3RhYmxlKCk7XG4gICAgICB9LFxuICAgICAgc2V0TWFjcm90YXNrOiAoaGFzTWFjcm90YXNrczogYm9vbGVhbikgPT4geyB0aGlzLl9oYXNQZW5kaW5nTWFjcm90YXNrcyA9IGhhc01hY3JvdGFza3M7IH0sXG4gICAgICBvbkVycm9yOiAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB0aGlzLl9vbkVycm9yRXZlbnRzLmVtaXQoZXJyb3IpXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jaGVja1N0YWJsZSgpIHtcbiAgICBpZiAodGhpcy5fbmVzdGluZyA9PSAwKSB7XG4gICAgICBpZiAoIXRoaXMuX2hhc1BlbmRpbmdNaWNyb3Rhc2tzICYmICF0aGlzLl9pc1N0YWJsZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdaT05FLm1pY3JvdGFza0VtcHR5Jyk7XG4gICAgICAgICAgdGhpcy5fbmVzdGluZysrO1xuICAgICAgICAgIHRoaXMuX29uTWljcm90YXNrRW1wdHkuZW1pdChudWxsKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLl9uZXN0aW5nLS07XG4gICAgICAgICAgaWYgKCF0aGlzLl9oYXNQZW5kaW5nTWljcm90YXNrcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ1pPTkUuc3RhYmxlJywgdGhpcy5fbmVzdGluZywgdGhpcy5faXNTdGFibGUpO1xuICAgICAgICAgICAgICB0aGlzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHRoaXMuX29uU3RhYmxlLmVtaXQobnVsbCkpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgdGhpcy5faXNTdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogTm90aWZpZXMgd2hlbiBjb2RlIGVudGVycyBBbmd1bGFyIFpvbmUuIFRoaXMgZ2V0cyBmaXJlZCBmaXJzdCBvbiBWTSBUdXJuLlxuICAgKi9cbiAgZ2V0IG9uVW5zdGFibGUoKTogRXZlbnRFbWl0dGVyPGFueT4geyByZXR1cm4gdGhpcy5fb25VbnN0YWJsZTsgfVxuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB3aGVuIHRoZXJlIGlzIG5vIG1vcmUgbWljcm90YXNrcyBlbnF1ZXVlIGluIHRoZSBjdXJyZW50IFZNIFR1cm4uXG4gICAqIFRoaXMgaXMgYSBoaW50IGZvciBBbmd1bGFyIHRvIGRvIGNoYW5nZSBkZXRlY3Rpb24sIHdoaWNoIG1heSBlbnF1ZXVlIG1vcmUgbWljcm90YXNrcy5cbiAgICogRm9yIHRoaXMgcmVhc29uIHRoaXMgZXZlbnQgY2FuIGZpcmUgbXVsdGlwbGUgdGltZXMgcGVyIFZNIFR1cm4uXG4gICAqL1xuICBnZXQgb25NaWNyb3Rhc2tFbXB0eSgpOiBFdmVudEVtaXR0ZXI8YW55PiB7IHJldHVybiB0aGlzLl9vbk1pY3JvdGFza0VtcHR5OyB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHdoZW4gdGhlIGxhc3QgYG9uTWljcm90YXNrRW1wdHlgIGhhcyBydW4gYW5kIHRoZXJlIGFyZSBubyBtb3JlIG1pY3JvdGFza3MsIHdoaWNoXG4gICAqIGltcGxpZXMgd2UgYXJlIGFib3V0IHRvIHJlbGlucXVpc2ggVk0gdHVybi5cbiAgICogVGhpcyBldmVudCBnZXRzIGNhbGxlZCBqdXN0IG9uY2UuXG4gICAqL1xuICBnZXQgb25TdGFibGUoKTogRXZlbnRFbWl0dGVyPGFueT4geyByZXR1cm4gdGhpcy5fb25TdGFibGU7IH1cblxuICAvKipcbiAgICogTm90aWZ5IHRoYXQgYW4gZXJyb3IgaGFzIGJlZW4gZGVsaXZlcmVkLlxuICAgKi9cbiAgZ2V0IG9uRXJyb3IoKTogRXZlbnRFbWl0dGVyPGFueT4geyByZXR1cm4gdGhpcy5fb25FcnJvckV2ZW50czsgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZXJlIGFyZSBhbnkgb3V0c3RhbmRpbmcgbWljcm90YXNrcy5cbiAgICovXG4gIGdldCBoYXNQZW5kaW5nTWljcm90YXNrcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2hhc1BlbmRpbmdNaWNyb3Rhc2tzOyB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlcmUgYXJlIGFueSBvdXRzdGFuZGluZyBtaWNyb3Rhc2tzLlxuICAgKi9cbiAgZ2V0IGhhc1BlbmRpbmdNYWNyb3Rhc2tzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGFzUGVuZGluZ01hY3JvdGFza3M7IH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGBmbmAgZnVuY3Rpb24gc3luY2hyb25vdXNseSB3aXRoaW4gdGhlIEFuZ3VsYXIgem9uZSBhbmQgcmV0dXJucyB2YWx1ZSByZXR1cm5lZCBieVxuICAgKiB0aGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIFJ1bm5pbmcgZnVuY3Rpb25zIHZpYSBgcnVuYCBhbGxvd3MgeW91IHRvIHJlZW50ZXIgQW5ndWxhciB6b25lIGZyb20gYSB0YXNrIHRoYXQgd2FzIGV4ZWN1dGVkXG4gICAqIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZSAodHlwaWNhbGx5IHN0YXJ0ZWQgdmlhIHtAbGluayAjcnVuT3V0c2lkZUFuZ3VsYXJ9KS5cbiAgICpcbiAgICogQW55IGZ1dHVyZSB0YXNrcyBvciBtaWNyb3Rhc2tzIHNjaGVkdWxlZCBmcm9tIHdpdGhpbiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udGludWUgZXhlY3V0aW5nIGZyb21cbiAgICogd2l0aGluIHRoZSBBbmd1bGFyIHpvbmUuXG4gICAqXG4gICAqIElmIGEgc3luY2hyb25vdXMgZXJyb3IgaGFwcGVucyBpdCB3aWxsIGJlIHJldGhyb3duIGFuZCBub3QgcmVwb3J0ZWQgdmlhIGBvbkVycm9yYC5cbiAgICovXG4gIHJ1bihmbjogKCkgPT4gYW55KTogYW55IHsgcmV0dXJuIHRoaXMuX3pvbmVJbXBsLnJ1bklubmVyKGZuKTsgfVxuXG4gIC8qKlxuICAgKiBTYW1lIGFzICNydW4sIGV4Y2VwdCB0aGF0IHN5bmNocm9ub3VzIGVycm9ycyBhcmUgY2F1Z2h0IGFuZCBmb3J3YXJkZWRcbiAgICogdmlhIGBvbkVycm9yYCBhbmQgbm90IHJldGhyb3duLlxuICAgKi9cbiAgcnVuR3VhcmRlZChmbjogKCkgPT4gYW55KTogYW55IHsgcmV0dXJuIHRoaXMuX3pvbmVJbXBsLnJ1bklubmVyR3VhcmRlZChmbik7IH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGBmbmAgZnVuY3Rpb24gc3luY2hyb25vdXNseSBpbiBBbmd1bGFyJ3MgcGFyZW50IHpvbmUgYW5kIHJldHVybnMgdmFsdWUgcmV0dXJuZWQgYnlcbiAgICogdGhlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBSdW5uaW5nIGZ1bmN0aW9ucyB2aWEgYHJ1bk91dHNpZGVBbmd1bGFyYCBhbGxvd3MgeW91IHRvIGVzY2FwZSBBbmd1bGFyJ3Mgem9uZSBhbmQgZG8gd29yayB0aGF0XG4gICAqIGRvZXNuJ3QgdHJpZ2dlciBBbmd1bGFyIGNoYW5nZS1kZXRlY3Rpb24gb3IgaXMgc3ViamVjdCB0byBBbmd1bGFyJ3MgZXJyb3IgaGFuZGxpbmcuXG4gICAqXG4gICAqIEFueSBmdXR1cmUgdGFza3Mgb3IgbWljcm90YXNrcyBzY2hlZHVsZWQgZnJvbSB3aXRoaW4gdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnRpbnVlIGV4ZWN1dGluZyBmcm9tXG4gICAqIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS5cbiAgICpcbiAgICogVXNlIHtAbGluayAjcnVufSB0byByZWVudGVyIHRoZSBBbmd1bGFyIHpvbmUgYW5kIGRvIHdvcmsgdGhhdCB1cGRhdGVzIHRoZSBhcHBsaWNhdGlvbiBtb2RlbC5cbiAgICovXG4gIHJ1bk91dHNpZGVBbmd1bGFyKGZuOiAoKSA9PiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5fem9uZUltcGwucnVuT3V0ZXIoZm4pOyB9XG59XG4iXX0=
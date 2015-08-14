import {BaseException} from 'angular2/src/facade/lang';

// TODO(vicb): change to an interface when the DI can bind to them
export class NgZone {
  /**
   * Sets the zone hook that is called just before Angular event turn starts.
   * It is called once per browser event.
   */
  overrideOnTurnStart(onTurnStartFn: Function): void { throw new BaseException('Abstract!'); }

  /**
   * Sets the zone hook that is called immediately after Angular processes
   * all pending microtasks.
   */
  overrideOnTurnDone(onTurnDoneFn: Function): void { throw new BaseException('Abstract!'); }

  /**
   * Sets the zone hook that is called immediately after the last turn in
   * an event completes. At this point Angular will no longer attempt to
   * sync the UI. Any changes to the data model will not be reflected in the
   * DOM. `onEventDoneFn` is executed outside Angular zone.
   *
   * This hook is useful for validating application state (e.g. in a test).
   */
  overrideOnEventDone(onEventDoneFn: Function, opt_waitForAsync: boolean): void {
    throw new BaseException('Abstract!');
  }

  /**
   * Sets the zone hook that is called when an error is uncaught in the
   * Angular zone. The first argument is the error. The second argument is
   * the stack trace.
   */
  overrideOnErrorHandler(errorHandlingFn: Function): void { throw new BaseException('Abstract!'); }

  /**
   * Runs `fn` in the inner zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to make use of the
   * Angular's auto digest mechanism.
   *
   * ```
   * var zone: NgZone = [ref to the application zone];
   *
   * zone.run(() => {
   *   // the change detection will run after this function and the microtasks it enqueues have
   * executed.
   * });
   * ```
   */
  run(fn: () => any): any { throw new BaseException('Abstract!'); }

  /**
   * Runs `fn` in the outer zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * var zone: NgZone = [ref to the application zone];
   *
   * zone.runOutsideAngular(() => {
   *   element.onClick(() => {
   *     // Clicking on the element would not trigger the change detection
   *   });
   * });
   * ```
   */
  runOutsideAngular(fn: () => any): any { throw new BaseException('Abstract!'); }
}

import {Injectable} from 'angular2/src/core/di';
import {ChangeDetector} from 'angular2/src/core/change_detection/change_detection';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {isPresent} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {wtfLeave, wtfCreateScope, WtfScopeFn} from '../profile/profile';

/**
 * Provides access to explicitly trigger change detection in an application.
 *
 * By default, `Zone` triggers change detection in Angular on each virtual machine (VM) turn. When
 * testing, or in some
 * limited application use cases, a developer can also trigger change detection with the
 * `lifecycle.tick()` method.
 *
 * Each Angular application has a single `LifeCycle` instance.
 *
 * # Example
 *
 * This is a contrived example, since the bootstrap automatically runs inside of the `Zone`, which
 * invokes
 * `lifecycle.tick()` on your behalf.
 *
 * ```javascript
 * bootstrap(MyApp).then((ref:ComponentRef) => {
 *   var lifeCycle = ref.injector.get(LifeCycle);
 *   var myApp = ref.instance;
 *
 *   ref.doSomething();
 *   lifecycle.tick();
 * });
 * ```
 */
export abstract class LifeCycle {
  /**
   *  Invoke this method to explicitly process change detection and its side-effects.
   *
   *  In development mode, `tick()` also performs a second change detection cycle to ensure that no
   * further
   *  changes are detected. If additional changes are picked up during this second cycle, bindings
   * in
   * the app have
   *  side-effects that cannot be resolved in a single change detection pass. In this case, Angular
   * throws an error,
   *  since an Angular application can only have one change detection pass during which all change
   * detection must
   *  complete.
   *
   */
  abstract tick();
}

@Injectable()
export class LifeCycle_ extends LifeCycle {
  static _tickScope: WtfScopeFn = wtfCreateScope('LifeCycle#tick()');

  /** @internal */
  _changeDetectors: ChangeDetector[];
  /** @internal */
  _enforceNoNewChanges: boolean;
  /** @internal */
  _runningTick: boolean = false;

  constructor(changeDetector: ChangeDetector = null, enforceNoNewChanges: boolean = false) {
    super();
    this._changeDetectors = [];
    if (isPresent(changeDetector)) {
      this._changeDetectors.push(changeDetector);
    }
    this._enforceNoNewChanges = enforceNoNewChanges;
  }

  registerWith(zone: NgZone, changeDetector: ChangeDetector = null) {
    if (isPresent(changeDetector)) {
      this._changeDetectors.push(changeDetector);
    }
    zone.overrideOnTurnDone(() => this.tick());
  }

  tick() {
    if (this._runningTick) {
      throw new BaseException("LifeCycle.tick is called recursively");
    }

    var s = LifeCycle_._tickScope();
    try {
      this._runningTick = true;
      this._changeDetectors.forEach((detector) => detector.detectChanges());
      if (this._enforceNoNewChanges) {
        this._changeDetectors.forEach((detector) => detector.checkNoChanges());
      }
    } finally {
      this._runningTick = false;
      wtfLeave(s);
    }
  }
}

import {Injectable} from 'angular2/di';
import {ChangeDetector} from 'angular2/change_detection';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {isPresent} from 'angular2/src/facade/lang';

/**
 * Provides access to explicitly trigger change detection in an application.
 *
 * By default, [Zone] triggers change detection in Angular on each virtual machine (VM) turn. When testing, or in some
 * limited application use cases, a developer can also trigger change detection with the `lifecycle.tick()` method.
 *
 * Each Angular application has a single `LifeCycle` instance.
 *
 * # Example
 *
 * This is a contrived example, since the bootstrap automatically runs inside of the [Zone], which invokes
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
 * @exportedAs angular2/change_detection
 */
@Injectable()
export class LifeCycle {
  _errorHandler;
  _changeDetector:ChangeDetector;
  _enforceNoNewChanges:boolean;

  constructor(exceptionHandler:ExceptionHandler, changeDetector:ChangeDetector = null, enforceNoNewChanges:boolean = false) {
    this._errorHandler = (exception, stackTrace) => {
      exceptionHandler.call(exception, stackTrace);
      throw exception;
    };
    this._changeDetector = changeDetector; // may be null when instantiated from application bootstrap
    this._enforceNoNewChanges = enforceNoNewChanges;
  }

  registerWith(zone:VmTurnZone, changeDetector:ChangeDetector = null) {
    if (isPresent(changeDetector)) {
      this._changeDetector=changeDetector;
    }

    zone.initCallbacks({
      onErrorHandler: this._errorHandler,
      onTurnDone: () => this.tick()
    });
  }

  /**
   *  Invoke this method to explicitly process change detection and its side-effects.
   *
   *  In development mode, `tick()` also performs a second change detection cycle to ensure that no further
   *  changes are detected. If additional changes are picked up during this second cycle, bindings in the app have
   *  side-effects that cannot be resolved in a single change detection pass. In this case, Angular throws an error,
   *  since an Angular application can only have one change detection pass during which all change detection must
   *  complete.
   *
   */
  tick() {
    this._changeDetector.detectChanges();
    if (this._enforceNoNewChanges) {
      this._changeDetector.checkNoChanges();
    }
  }
}

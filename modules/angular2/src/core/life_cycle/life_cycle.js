import {ChangeDetector} from 'angular2/change_detection';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {DomOpQueue} from 'angular2/src/core/dom/op_queue';
import {isPresent} from 'angular2/src/facade/lang';

export class LifeCycle {
  _errorHandler;
  _changeDetector:ChangeDetector;
  _enforceNoNewChanges:boolean;
  _domQueue: DomOpQueue;

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
      this._changeDetector = changeDetector;
    }

    zone.initCallbacks({
      onErrorHandler: this._errorHandler,
      onTurnDone: () => this.tick()
    });
  }

  setDomQueue(domQueue: DomOpQueue) {
    this._domQueue = domQueue;
  }

  tick() {
    this._changeDetector.detectChanges();
    if (this._enforceNoNewChanges) {
      this._changeDetector.checkNoChanges();
    }
    if (isPresent(this._domQueue)) {
      this._domQueue.run();
    }
  }
}

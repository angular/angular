import {FIELD, print} from 'facade/src/lang';
import {ChangeDetector} from 'change_detection/change_detection';
import {VmTurnZone} from 'core/src/zone/vm_turn_zone';
import {ListWrapper} from 'facade/src/collection';
import {isPresent} from 'facade/src/lang';

export class LifeCycle {
  _changeDetector:ChangeDetector;
  _enforceNoNewChanges:boolean;

  constructor(changeDetector:ChangeDetector = null, enforceNoNewChanges:boolean = false) {
    this._changeDetector = changeDetector; // may be null when instantiated from application bootstrap
    this._enforceNoNewChanges = enforceNoNewChanges;
  }

  registerWith(zone:VmTurnZone, changeDetector:ChangeDetector = null) {
    // temporary error handler, we should inject one
    var errorHandler = (exception, stackTrace) => {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      print(`${exception}\n\n${longStackTrace}`);
      throw exception;
    };

    if (isPresent(changeDetector)) {
      this._changeDetector=changeDetector;
    }

    zone.initCallbacks({
      onErrorHandler: errorHandler,
      onTurnDone: () => this.tick()
    });
  }

  tick() {
    this._changeDetector.detectChanges();
    if (this._enforceNoNewChanges) {
      this._changeDetector.checkNoChanges();
    }
  }
}
import {FIELD, print} from 'facade/lang';
import {ChangeDetector} from 'change_detection/change_detection';
import {VmTurnZone} from 'core/zone/vm_turn_zone';
import {ListWrapper} from 'facade/collection';

export class LifeCycle {
  _changeDetector:ChangeDetector;

  constructor(changeDetector:ChangeDetector) {
    this._changeDetector = changeDetector;
  }

  registerWith(zone:VmTurnZone) {
    // temporary error handler, we should inject one
    var errorHandler = (exception, stackTrace) => {
      var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
      print(`${exception}\n\n${longStackTrace}`);
      throw exception;
    };

    zone.initCallbacks({
      onErrorHandler: errorHandler,
      onTurnDone: () => this.tick()
    });
  }

  tick() {
    this._changeDetector.detectChanges();
  }
}
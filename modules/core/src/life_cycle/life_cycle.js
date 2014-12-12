import {FIELD} from 'facade/lang';
import {ChangeDetector} from 'change_detection/change_detector';
import {VmTurnZone} from 'core/zone/vm_turn_zone';

export class LifeCycle {
  _changeDetector:ChangeDetector;

  constructor(changeDetector:ChangeDetector) {
    this._changeDetector = changeDetector;
  }

  registerWith(zone:VmTurnZone) {
    zone.initCallbacks({
      onTurnDone: () => this.tick()
    });
  }

  tick() {
    this._changeDetector.detectChanges();
  }
}
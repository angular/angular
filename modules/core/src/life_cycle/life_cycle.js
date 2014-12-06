import {FIELD} from 'facade/lang';
import {ChangeDetector} from 'change_detection/change_detector';

export class LifeCycle {
  _changeDetector:ChangeDetector;
  constructor() {
    this._changeDetector = null;
  }

  digest() {
    _changeDetector.detectChanges();
  }
}
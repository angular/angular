import {FIELD} from 'facade/lang';
import {OnChangeDispatcher} from '../compiler/view';
import {ChangeDetector} from 'change_detection/change_detector';

export class LifeCycle {

  _changeDetector:ChangeDetector;
  _onChangeDispatcher:OnChangeDispatcher;
  constructor() {
    this._changeDetector = null;
    this._onChangeDispatcher = null;
  }

  digest() {
    _changeDetector.detectChanges();
    _onChangeDispatcher.done();
  }
}
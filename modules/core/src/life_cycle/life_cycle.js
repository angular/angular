import {FIELD} from 'facade/lang';

export class LifeCycle {

  @FIELD('final _changeDetection:ChangeDetection')
  @FIELD('final _onChangeDispatcher:OnChangeDispatcher')
  constructor() {
    this._changeDetection = null;
    this._onChangeDispatcher = null;
  }

  digest() {
    _changeDetection.detectChanges();
    _onChangeDispatcher.done();
  }
}
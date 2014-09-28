import {FIELD} from 'facade/lang';

export class LifeCycle {

  @FIELD('final _changeDetection:ChangeDetection')
  @FIELD('final _onChangeDispatcher:OnChangeDispatcher')
  constructor() {}

  digest() {
    _changeDetection.detectChanges();
    _onChangeDispatcher.done();
  }
}
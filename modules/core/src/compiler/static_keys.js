import {View} from 'core/compiler/view';
import {Key} from 'di/di';
import {isBlank} from 'facade/lang';

var _staticKeys;

export class StaticKeys {
  constructor() {
    //TODO: vsavkin Key.annotate(Key.get(View), 'static')
    this.viewId = Key.get(View).id;
  }

  static instance() {
    if (isBlank(_staticKeys)) _staticKeys = new StaticKeys();
    return _staticKeys;
  }
}
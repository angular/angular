import {isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Injector, UNDEFINED} from 'angular2/src/core/di/injector';
import {AppView} from './view';

export class ElementInjector extends Injector {
  constructor(private _view: AppView<any>, private _nodeIndex: number) {
    super();
  }

  get(token: any): any {
    var result = this._view.injectorGet(token, this._nodeIndex, UNDEFINED);
    if (result === UNDEFINED) {
      result = this._view.parentInjector.get(token);
    }
    return result;
  }

  getOptional(token: any): any {
    var result = this._view.injectorGet(token, this._nodeIndex, UNDEFINED);
    if (result === UNDEFINED) {
      result = this._view.parentInjector.getOptional(token);
    }
    return result;
  }
}

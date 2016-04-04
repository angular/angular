import {isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Injector, UNDEFINED} from 'angular2/src/core/di/injector';
import {AppView} from './view';

export class ElementInjector extends Injector {
  constructor(private _view: AppView<any>, private _nodeIndex: number,
              private _readPrivate: boolean) {
    super();
  }
  private _getFromView(token: any): any {
    var result = UNDEFINED;
    if (this._readPrivate) {
      result = this._view.injectorPrivateGet(token, this._nodeIndex, UNDEFINED);
    }
    if (result === UNDEFINED) {
      result = this._view.injectorGet(token, this._nodeIndex, UNDEFINED);
    }
    return result;
  }

  get(token: any): any {
    var result = this._getFromView(token);
    if (result === UNDEFINED) {
      result = this._view.parentInjector.get(token);
    }
    return result;
  }

  getOptional(token: any): any {
    var result = this._getFromView(token);
    if (result === UNDEFINED) {
      result = this._view.parentInjector.getOptional(token);
    }
    return result;
  }
}

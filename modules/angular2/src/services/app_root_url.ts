import {Injectable} from 'angular2/di';
import {isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

@Injectable()
export class AppRootUrl {
  private _value: string;

  get value() {
    if (isBlank(this._value)) {
      var a = DOM.createElement('a');
      DOM.resolveAndSetHref(a, './', null);
      this._value = DOM.getHref(a);
    }

    return this._value;
  }
}

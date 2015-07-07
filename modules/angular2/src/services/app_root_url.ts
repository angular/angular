import {Injectable} from 'angular2/di';
import {isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

/**
 * Specifies app root url for the application.
 *
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class AppRootUrl {
  private _value: string;

  /**
   * Returns the base URL of the currently running application.
   */
  get value() {
    if (isBlank(this._value)) {
      var a = DOM.createElement('a');
      DOM.resolveAndSetHref(a, './', null);
      this._value = DOM.getHref(a);
    }

    return this._value;
  }
}

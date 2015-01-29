import {JS} from 'facade/js_interop';
import {isBlank, isPresent} from 'facade/lang';

export class WebComponentPolyfill {
  _shadowCss;

  constructor(context) {
    this._shadowCss = null;
    if (isBlank(context)) return;
    this._initPolyfill(context);
  }

  isEnabled() {
    return isPresent(this._shadowCss);
  }

  _initPolyfill(context) {
    var polyfill = context['WebComponents'];
    if (isBlank(polyfill)) return;
    var css = polyfill['ShadowCSS'];
    if (isBlank(css)) return;
    css['strictStyling'] = true;
    this._shadowCss = css;
  }
}

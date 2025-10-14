/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  forwardRef,
  Injectable,
  SecurityContext,
  ɵ_sanitizeHtml as _sanitizeHtml,
  ɵ_sanitizeUrl as _sanitizeUrl,
  ɵallowSanitizationBypassAndThrow as allowSanitizationBypassOrThrow,
  ɵbypassSanitizationTrustHtml as bypassSanitizationTrustHtml,
  ɵbypassSanitizationTrustResourceUrl as bypassSanitizationTrustResourceUrl,
  ɵbypassSanitizationTrustScript as bypassSanitizationTrustScript,
  ɵbypassSanitizationTrustStyle as bypassSanitizationTrustStyle,
  ɵbypassSanitizationTrustUrl as bypassSanitizationTrustUrl,
  ɵRuntimeError as RuntimeError,
  ɵunwrapSafeValue as unwrapSafeValue,
  ɵXSS_SECURITY_URL as XSS_SECURITY_URL,
} from '@angular/core';
export {SecurityContext};
/**
 * DomSanitizer helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
 * values to be safe to use in the different DOM contexts.
 *
 * For example, when binding a URL in an `<a [href]="someValue">` hyperlink, `someValue` will be
 * sanitized so that an attacker cannot inject e.g. a `javascript:` URL that would execute code on
 * the website.
 *
 * In specific situations, it might be necessary to disable sanitization, for example if the
 * application genuinely needs to produce a `javascript:` style link with a dynamic value in it.
 * Users can bypass security by constructing a value with one of the `bypassSecurityTrust...`
 * methods, and then binding to that value from the template.
 *
 * These situations should be very rare, and extraordinary care must be taken to avoid creating a
 * Cross Site Scripting (XSS) security bug!
 *
 * When using `bypassSecurityTrust...`, make sure to call the method as early as possible and as
 * close as possible to the source of the value, to make it easy to verify no security bug is
 * created by its use.
 *
 * It is not required (and not recommended) to bypass security if the value is safe, e.g. a URL that
 * does not start with a suspicious protocol, or an HTML snippet that does not contain dangerous
 * code. The sanitizer leaves safe values intact.
 *
 * @security Calling any of the `bypassSecurityTrust...` APIs disables Angular's built-in
 * sanitization for the value passed in. Carefully check and audit all values and code paths going
 * into this call. Make sure any user data is appropriately escaped for this security context.
 * For more detail, see the [Security Guide](https://g.co/ng/security).
 *
 * @publicApi
 */
let DomSanitizer = (() => {
  let _classDecorators = [
    Injectable({providedIn: 'root', useExisting: forwardRef(() => DomSanitizerImpl)}),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DomSanitizer = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      DomSanitizer = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (DomSanitizer = _classThis);
})();
export {DomSanitizer};
let DomSanitizerImpl = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = DomSanitizer;
  var DomSanitizerImpl = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      DomSanitizerImpl = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _doc;
    constructor(_doc) {
      super();
      this._doc = _doc;
    }
    sanitize(ctx, value) {
      if (value == null) return null;
      switch (ctx) {
        case SecurityContext.NONE:
          return value;
        case SecurityContext.HTML:
          if (allowSanitizationBypassOrThrow(value, 'HTML' /* BypassType.Html */)) {
            return unwrapSafeValue(value);
          }
          return _sanitizeHtml(this._doc, String(value)).toString();
        case SecurityContext.STYLE:
          if (allowSanitizationBypassOrThrow(value, 'Style' /* BypassType.Style */)) {
            return unwrapSafeValue(value);
          }
          return value;
        case SecurityContext.SCRIPT:
          if (allowSanitizationBypassOrThrow(value, 'Script' /* BypassType.Script */)) {
            return unwrapSafeValue(value);
          }
          throw new RuntimeError(
            5200 /* RuntimeErrorCode.SANITIZATION_UNSAFE_SCRIPT */,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              'unsafe value used in a script context',
          );
        case SecurityContext.URL:
          if (allowSanitizationBypassOrThrow(value, 'URL' /* BypassType.Url */)) {
            return unwrapSafeValue(value);
          }
          return _sanitizeUrl(String(value));
        case SecurityContext.RESOURCE_URL:
          if (allowSanitizationBypassOrThrow(value, 'ResourceURL' /* BypassType.ResourceUrl */)) {
            return unwrapSafeValue(value);
          }
          throw new RuntimeError(
            5201 /* RuntimeErrorCode.SANITIZATION_UNSAFE_RESOURCE_URL */,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              `unsafe value used in a resource URL context (see ${XSS_SECURITY_URL})`,
          );
        default:
          throw new RuntimeError(
            5202 /* RuntimeErrorCode.SANITIZATION_UNEXPECTED_CTX */,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              `Unexpected SecurityContext ${ctx} (see ${XSS_SECURITY_URL})`,
          );
      }
    }
    bypassSecurityTrustHtml(value) {
      return bypassSanitizationTrustHtml(value);
    }
    bypassSecurityTrustStyle(value) {
      return bypassSanitizationTrustStyle(value);
    }
    bypassSecurityTrustScript(value) {
      return bypassSanitizationTrustScript(value);
    }
    bypassSecurityTrustUrl(value) {
      return bypassSanitizationTrustUrl(value);
    }
    bypassSecurityTrustResourceUrl(value) {
      return bypassSanitizationTrustResourceUrl(value);
    }
  };
  return (DomSanitizerImpl = _classThis);
})();
export {DomSanitizerImpl};
//# sourceMappingURL=dom_sanitization_service.js.map

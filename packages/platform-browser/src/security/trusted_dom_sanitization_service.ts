/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {forwardRef, Inject, Injectable, Injector, Sanitizer, SecurityContext, TrustedSanitizer, ɵ_sanitizeHtml as _sanitizeHtml, ɵ_sanitizeUrl as _sanitizeUrl, ɵallowSanitizationBypassAndThrow as allowSanitizationBypassOrThrow, ɵbypassSanitizationTrustHtml as bypassSanitizationTrustHtml, ɵbypassSanitizationTrustResourceUrl as bypassSanitizationTrustResourceUrl, ɵbypassSanitizationTrustScript as bypassSanitizationTrustScript, ɵbypassSanitizationTrustStyle as bypassSanitizationTrustStyle, ɵbypassSanitizationTrustUrl as bypassSanitizationTrustUrl, ɵBypassType as BypassType, ɵgetSanitizationBypassType as getSanitizationBypassType, ɵglobal as global, ɵunwrapSafeValue as unwrapSafeValue} from '@angular/core';

/**
 * TrustedDomSanitizer helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
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
 * For more detail, see the [Security Guide](http://g.co/ng/security).
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useExisting: forwardRef(() => TrustedDomSanitizerImpl)})
export abstract class TrustedDomSanitizer implements TrustedSanitizer {
  /**
   * Sanitizes a value for use in the given SecurityContext.
   *
   * If value is trusted for the context, this method will unwrap the contained safe value and use
   * it directly. Otherwise, value will be sanitized to be safe in the given context, for example
   * by replacing URLs that have an unsafe protocol part (such as `javascript:`). The implementation
   * is responsible to make sure that the value can definitely be safely used in the given context.
   */
  abstract sanitize(context: SecurityContext.HTML, value: {}|string|null): string|TrustedHTML|null;
  abstract sanitize(context: SecurityContext.SCRIPT, value: {}|string|null): string|TrustedScript
      |null;
  abstract sanitize(context: SecurityContext.RESOURCE_URL, value: {}|string|null): string
      |TrustedScriptURL|null;
  abstract sanitize(context: SecurityContext, value: {}|string|null): string|null;
  abstract sanitize(context: SecurityContext, value: {}|string|null): string|TrustedHTML
      |TrustedScript|TrustedScriptURL|null;
}

export function trustedDomSanitizerImplFactory(injector: Injector) {
  return new TrustedDomSanitizerImpl(injector.get(DOCUMENT));
}

@Injectable({providedIn: 'root', useFactory: trustedDomSanitizerImplFactory, deps: [Injector]})
export class TrustedDomSanitizerImpl extends TrustedDomSanitizer {
  constructor(@Inject(DOCUMENT) private _doc: any) {
    super();
  }

  sanitize(ctx: SecurityContext.HTML, value: {}|string|null): string|TrustedHTML|null;
  sanitize(ctx: SecurityContext.SCRIPT, value: {}|string|null): string|TrustedScript|null;
  sanitize(ctx: SecurityContext.RESOURCE_URL, value: {}|string|null): string|TrustedScriptURL|null;
  sanitize(ctx: SecurityContext, value: {}|string|null): string|null;
  sanitize(ctx: SecurityContext, value: {}|string|null): string|TrustedHTML|TrustedScript
      |TrustedScriptURL|null {
    if (value == null) return null;
    switch (ctx) {
      case SecurityContext.NONE:
        return value as string;
      case SecurityContext.HTML:
        if (allowSanitizationBypassOrThrow(value, BypassType.Html)) {
          return unwrapSafeValue<TrustedHTML>(value);
        }
        return _sanitizeHtml(this._doc, String(value));
      case SecurityContext.STYLE:
        if (allowSanitizationBypassOrThrow(value, BypassType.Style)) {
          return unwrapSafeValue<string>(value);
        }
        return value as string;
      case SecurityContext.SCRIPT:
        if (allowSanitizationBypassOrThrow(value, BypassType.Script)) {
          return unwrapSafeValue<TrustedScript>(value);
        }
        throw new Error('unsafe value used in a script context');
      case SecurityContext.URL:
        const type = getSanitizationBypassType(value);
        if (allowSanitizationBypassOrThrow(value, BypassType.Url)) {
          return unwrapSafeValue<string>(value);
        }
        return _sanitizeUrl(String(value));
      case SecurityContext.RESOURCE_URL:
        if (allowSanitizationBypassOrThrow(value, BypassType.ResourceUrl)) {
          return unwrapSafeValue<TrustedScriptURL>(value);
        }
        throw new Error(
            'unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
      default:
        throw new Error(`Unexpected SecurityContext ${ctx} (see http://g.co/ng/security#xss)`);
    }
  }
}

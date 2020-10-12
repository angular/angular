/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {forwardRef, Inject, Injectable, Injector, SecurityContext, TrustedSanitizer, ɵ_sanitizeHtml as _sanitizeHtml, ɵ_sanitizeUrl as _sanitizeUrl, ɵallowSanitizationBypassAndThrow as allowSanitizationBypassOrThrow, ɵBypassType as BypassType, ɵgetSanitizationBypassType as getSanitizationBypassType, ɵunwrapSafeValue as unwrapSafeValue} from '@angular/core';

/**
 * TrustedDomSanitizer helps preventing Cross Site Scripting Security bugs (XSS) by sanitizing
 * values to be safe to use in the different DOM contexts, producing Trusted Types as a proof.
 *
 * For example, when binding a URL in an `<a [href]="someValue">` hyperlink, `someValue` will be
 * sanitized so that an attacker cannot inject e.g. a `javascript:` URL that would execute code on
 * the website.
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

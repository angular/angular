import {sanitizeUrl} from './url_sanitizer';
import {sanitizeStyle} from './style_sanitizer';
import {SecurityContext} from '../../core_private';
import {Injectable} from '@angular/core';
import {isNumber, isString, isBlank, assertionsEnabled} from '../facade/lang';
import {StringMapWrapper} from '../facade/collection';

export interface SafeHtml {}
export interface SafeStyle {}
export interface SafeScript {}
export interface SafeUrl {}
export interface SafeResourceUrl {}

@Injectable()
export class DomSanitizationService {
  constructor() {
    // empty.
  }

  sanitize(ctx: SecurityContext, value: any): any {
    switch (ctx) {
      case SecurityContext.NONE:
        return value;
      case SecurityContext.HTML:
        return this.getSafeHtml(value);
      case SecurityContext.STYLE:
        return this.getSafeStyle(value);
      case SecurityContext.SCRIPT:
        return this.getSafeScript(value);
      case SecurityContext.URL:
        return this.getSafeUrl(value);
      case SecurityContext.RESOURCE_URL:
        return this.getSafeResourceUrl(value);
      default:
        throw new Error(`Unexpected SecurityContext ${ctx}`);
    }
  }

  // FIXME(martinprobst): Better names. coerceSafeHtml? sanitizeOrUnwrapHtml(...)?
  getSafeHtml(value: SafeHtml | string): string {
    if (value == null) return null;
    if (value instanceof SafeHtmlImpl) return value.value;
    return this.sanitizeHtmlInternal(value.toString());
  }

  getSafeStyle(value: SafeStyle | any): any {
    if (value == null) return null;
    if (value instanceof SafeStyleImpl) return value.value;
    return this.sanitizeStyleMap(value);
  }

  getSafeUrl(value: SafeUrl | string): string {
    if (value == null) return null;
    if (value instanceof SafeUrlImpl) return value.value;
    return sanitizeUrl(String(value));
  }

  getSafeScript(value: SafeScript | string): string {
    if (value == null) return null;
    if (value instanceof SafeScriptImpl) return value.value;
    throw new Error('unsafe value used in a script context');
  }

  getSafeResourceUrl(value: SafeResourceUrl | string): string {
    if (value == null) return null;
    if (value instanceof SafeResourceUrlImpl) return value.value;
    throw new Error('unsafe value used in a resource URL context');
  }

  sanitizeHtml(value: string): SafeHtml {
    let s = this.sanitizeHtmlInternal(value);
    return new SafeHtmlImpl(s);
  }

  sanitizeStyle(value: any): SafeStyle {
    let s = this.sanitizeStyleMap(value);
    return new SafeStyleImpl(s);
  }

  sanitizeUrl(value: string): SafeUrl {
    let s = sanitizeUrl(value);
    return new SafeUrlImpl(s);
  }

  private sanitizeHtmlInternal(value: string): string {
    // FIXME(martinprobst): sanitize HTML.
    return value;
  }

  private sanitizeStyleMap(value: any): any {
    if (isString(value)) return sanitizeStyle(<string>value);
    if (isNumber(value)) return value;
    let input = <{[k: string]: string}>value;
    let res: {[k: string]: string} = {};
    for (let k of StringMapWrapper.keys(input)) {
      res[k] = sanitizeStyle(input[k]);
    }
    return res;
  }

  bypassSecurityTrustHtml(value: string): SafeHtml { return new SafeHtmlImpl(value); }
  bypassSecurityTrustStyle(value: string): SafeStyle { return new SafeStyleImpl(value); }
  bypassSecurityTrustScript(value: string): SafeScript { return new SafeScriptImpl(value); }
  bypassSecurityTrustUrl(value: string): SafeUrl { return new SafeUrlImpl(value); }
  bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl {
    return new SafeResourceUrlImpl(value);
  }
}

class SafeHtmlImpl implements SafeHtml {
  constructor(public value: string) {
    // empty
  }
}

class SafeStyleImpl implements SafeStyle {
  constructor(public value: string | {[k: string]: string}) {
    // empty
  }
}

class SafeScriptImpl implements SafeScript {
  constructor(public value: string) {
    // empty
  }
}

class SafeUrlImpl implements SafeUrl {
  constructor(public value: string) {
    // empty
  }
}

class SafeResourceUrlImpl implements SafeResourceUrl {
  constructor(public value: string) {
    // empty
  }
}

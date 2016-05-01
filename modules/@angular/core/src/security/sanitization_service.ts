import {Injectable} from '../di/decorators';
import {sanitizeUrl} from './url_sanitizer';

export enum SecurityContext {
  NONE,
  HTML,
  STYLE,
  SCRIPT,
  URL,
  RESOURCE_URL,
}

export interface SafeHtml {}
export interface SafeStyle {}
export interface SafeScript {}
export interface SafeUrl {}
export interface SafeResourceUrl {}

@Injectable()
export class SanitizationService {

  constructor() {
    // empty.
  }

  // FIXME(martinprobst): Better names. coerceSafeHtml? sanitizeOrUnwrapHtml(...)?
  getSafeHtml(value: SafeHtml | string): string {
    if (value == null) return null;
    if (value instanceof SafeHtmlImpl) return value.value;
    return this.sanitizeHtmlInternal(value.toString());
  }

  getSafeStyle(value: SafeStyle | string): string {
    if (value == null) return null;
    if (value instanceof SafeStyleImpl) return value.value;
    return this.sanitizeStyleValueInternal(value.toString());
  }

  getSafeUrl(value: SafeUrl | string): string {
    if (value == null) return null;
    if (value instanceof SafeUrlImpl) return value.value;
    return this.sanitizeUrlInternal(value.toString());
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
  sanitizeStyleValue(value: string): SafeStyle {
    let s = this.sanitizeStyleValueInternal(value);
    return new SafeStyleImpl(s);
  }
  sanitizeUrl(value: string): SafeUrl {
    let s = this.sanitizeUrlInternal(value);
    return new SafeUrlImpl(s);
  }

  private sanitizeHtmlInternal(value: string): string {
    // FIXME(martinprobst): sanitize HTML.
    return value;
  }
  private sanitizeStyleValueInternal(value: string): string {
    // FIXME(martinprobst): sanitize Style values.
    return value;
  }

  private sanitizeUrlInternal(value: string): string {
    return sanitizeUrl(value);
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
  constructor(public value: string) {
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

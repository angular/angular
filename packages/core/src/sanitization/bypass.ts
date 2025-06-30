/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XSS_SECURITY_URL} from '../error_details_base_url';

export const enum BypassType {
  Url = 'URL',
  Html = 'HTML',
  ResourceUrl = 'ResourceURL',
  Script = 'Script',
  Style = 'Style',
}

/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 * @publicApi
 */
export interface SafeValue {}

/**
 * Marker interface for a value that's safe to use as HTML.
 *
 * @publicApi
 */
export interface SafeHtml extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 * @publicApi
 */
export interface SafeStyle extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 * @publicApi
 */
export interface SafeScript extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 * @publicApi
 */
export interface SafeUrl extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 * @publicApi
 */
export interface SafeResourceUrl extends SafeValue {}

abstract class SafeValueImpl implements SafeValue {
  constructor(public changingThisBreaksApplicationSecurity: string) {}

  abstract getTypeName(): string;

  toString() {
    return (
      `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity}` +
      ` (see ${XSS_SECURITY_URL})`
    );
  }
}

class SafeHtmlImpl extends SafeValueImpl implements SafeHtml {
  override getTypeName() {
    return BypassType.Html;
  }
}
class SafeStyleImpl extends SafeValueImpl implements SafeStyle {
  override getTypeName() {
    return BypassType.Style;
  }
}
class SafeScriptImpl extends SafeValueImpl implements SafeScript {
  override getTypeName() {
    return BypassType.Script;
  }
}
class SafeUrlImpl extends SafeValueImpl implements SafeUrl {
  override getTypeName() {
    return BypassType.Url;
  }
}
class SafeResourceUrlImpl extends SafeValueImpl implements SafeResourceUrl {
  override getTypeName() {
    return BypassType.ResourceUrl;
  }
}

export function unwrapSafeValue(value: SafeValue): string;
export function unwrapSafeValue<T>(value: T): T;
export function unwrapSafeValue<T>(value: T | SafeValue): T {
  return value instanceof SafeValueImpl
    ? (value.changingThisBreaksApplicationSecurity as any as T)
    : (value as any as T);
}

export function allowSanitizationBypassAndThrow(
  value: any,
  type: BypassType.Html,
): value is SafeHtml;
export function allowSanitizationBypassAndThrow(
  value: any,
  type: BypassType.ResourceUrl,
): value is SafeResourceUrl;
export function allowSanitizationBypassAndThrow(
  value: any,
  type: BypassType.Script,
): value is SafeScript;
export function allowSanitizationBypassAndThrow(
  value: any,
  type: BypassType.Style,
): value is SafeStyle;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType.Url): value is SafeUrl;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean {
  const actualType = getSanitizationBypassType(value);
  if (actualType != null && actualType !== type) {
    // Allow ResourceURLs in URL contexts, they are strictly more trusted.
    if (actualType === BypassType.ResourceUrl && type === BypassType.Url) return true;
    throw new Error(`Required a safe ${type}, got a ${actualType} (see ${XSS_SECURITY_URL})`);
  }
  return actualType === type;
}

export function getSanitizationBypassType(value: any): BypassType | null {
  return (value instanceof SafeValueImpl && (value.getTypeName() as BypassType)) || null;
}

/**
 * Validates if a string is a valid URL
 * @param url The URL string to validate
 * @returns true if valid, false otherwise
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string contains potentially malicious script content
 * @param script The script string to validate
 * @returns true if safe, false if potentially malicious
 */
function isValidScript(script: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\.write/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(script));
}

/**
 * Mark `html` string as trusted.
 * 
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 * 
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustHtml(trustedHtml: string): SafeHtml {
  if (!trustedHtml || typeof trustedHtml !== 'string') {
    throw new Error('Invalid HTML content: must be a non-empty string');
  }
  
  return new SafeHtmlImpl(trustedHtml);
}

/**
 * Mark `style` string as trusted.
 * 
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 * 
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustStyle(trustedStyle: string): SafeStyle {
  if (!trustedStyle || typeof trustedStyle !== 'string') {
    throw new Error('Invalid style content: must be a non-empty string');
  }
  
  const dangerousPatterns = [
    /javascript:/i,
    /expression\s*\(/i,
    /@import/i,
    /behavior\s*:/i
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(trustedStyle))) {
    throw new Error('Style content contains potentially dangerous patterns');
  }
  
  return new SafeStyleImpl(trustedStyle);
}

/**
 * Mark `script` string as trusted.
 * 
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 * 
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustScript(trustedScript: string): SafeScript {
  if (!trustedScript || typeof trustedScript !== 'string') {
    throw new Error('Invalid script content: must be a non-empty string');
  }
  
  if (!isValidScript(trustedScript)) {
    throw new Error('Script content contains potentially dangerous patterns');
  }
  
  return new SafeScriptImpl(trustedScript);
}

/**
 * Mark `url` string as trusted.
 * 
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 * 
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustUrl(trustedUrl: string): SafeUrl {
  if (!trustedUrl || typeof trustedUrl !== 'string') {
    throw new Error('Invalid URL: must be a non-empty string');
  }
  
  if (!isValidUrl(trustedUrl)) {
    throw new Error(`Invalid URL format: ${trustedUrl}`);
  }
  
  const url = new URL(trustedUrl);
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  
  if (dangerousProtocols.includes(url.protocol)) {
    throw new Error(`Dangerous protocol not allowed: ${url.protocol}`);
  }
  
  return new SafeUrlImpl(trustedUrl);
}

/**
 * Mark `url` string as trusted for resources.
 * 
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 * 
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string): SafeResourceUrl {
  if (!trustedResourceUrl || typeof trustedResourceUrl !== 'string') {
    throw new Error('Invalid resource URL: must be a non-empty string');
  }
  
  if (!isValidUrl(trustedResourceUrl)) {
    throw new Error(`Invalid resource URL format: ${trustedResourceUrl}`);
  }
  
  const url = new URL(trustedResourceUrl);
  const allowedProtocols = ['https:', 'http:', 'ftp:', 'ftps:'];
  
  if (!allowedProtocols.includes(url.protocol)) {
    throw new Error(`Protocol not allowed for resource URLs: ${url.protocol}`);
  }
  
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    console.warn('Warning: Using localhost URL in resource URL may pose security risks');
  }
  
  return new SafeResourceUrlImpl(trustedResourceUrl);
}

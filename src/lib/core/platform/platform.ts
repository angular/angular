import {Injectable} from '@angular/core';

declare const window: any;

// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
const hasV8BreakIterator = typeof(window) !== 'undefined' ?
    (window.Intl && (window.Intl as any).v8BreakIterator) :
    (typeof(Intl) !== 'undefined' && (Intl as any).v8BreakIterator);

/**
 * Service to detect the current platform by comparing the userAgent strings and
 * checking browser-specific global properties.
 * @docs-private
 */
@Injectable()
export class Platform {
  /** Layout Engines */
  EDGE = /(edge)/i.test(navigator.userAgent);
  TRIDENT = /(msie|trident)/i.test(navigator.userAgent);

  // EdgeHTML and Trident mock Blink specific things and need to excluded from this check.
  BLINK = !!(window.chrome || hasV8BreakIterator) && !!CSS && !this.EDGE && !this.TRIDENT;

  // Webkit is part of the userAgent in EdgeHTML Blink and Trident, so we need to
  // ensure that Webkit runs standalone and is not use as another engines base.
  WEBKIT = /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;

  /** Browsers and Platform Types */
  IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // It's difficult to detect the plain Gecko engine, because most of the browsers identify
  // them self as Gecko-like browsers and modify the userAgent's according to that.
  // Since we only cover one explicit Firefox case, we can simply check for Firefox
  // instead of having an unstable check for Gecko.
  FIREFOX = /(firefox|minefield)/i.test(navigator.userAgent);

  // Trident on mobile adds the android platform to the userAgent to trick detections.
  ANDROID = /android/i.test(navigator.userAgent) && !this.TRIDENT;
}

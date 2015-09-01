import {LocationStrategy} from './location_strategy';
import {StringWrapper, isPresent, CONST_EXPR} from 'angular2/src/core/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {BaseException, isBlank} from 'angular2/src/core/facade/lang';
import {OpaqueToken, Injectable, Optional, Inject} from 'angular2/di';

export const APP_BASE_HREF: OpaqueToken = CONST_EXPR(new OpaqueToken('appBaseHref'));

/**
 * This is the service that an application developer will directly interact with.
 *
 * Responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 */
@Injectable()
export class Location {
  _subject: EventEmitter = new EventEmitter();
  _baseHref: string;

  constructor(public platformStrategy: LocationStrategy,
              @Optional() @Inject(APP_BASE_HREF) href?: string) {
    var browserBaseHref = isPresent(href) ? href : this.platformStrategy.getBaseHref();

    if (isBlank(browserBaseHref)) {
      throw new BaseException(
          `No base href set. Either provide a binding to "appBaseHrefToken" or add a base element.`);
    }

    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this.platformStrategy.onPopState(
        (_) => { ObservableWrapper.callNext(this._subject, {'url': this.path(), 'pop': true}); });
  }

  path(): string { return this.normalize(this.platformStrategy.path()); }

  normalize(url: string): string {
    return stripTrailingSlash(_stripBaseHref(this._baseHref, stripIndexHtml(url)));
  }

  normalizeAbsolutely(url: string): string {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    return stripTrailingSlash(_addBaseHref(this._baseHref, url));
  }

  go(url: string): void {
    var finalUrl = this.normalizeAbsolutely(url);
    this.platformStrategy.pushState(null, '', finalUrl);
  }

  forward(): void { this.platformStrategy.forward(); }

  back(): void { this.platformStrategy.back(); }

  subscribe(onNext: (value: any) => void, onThrow: (exception: any) => void = null,
            onReturn: () => void = null): void {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }
}

function _stripBaseHref(baseHref: string, url: string): string {
  if (baseHref.length > 0 && url.startsWith(baseHref)) {
    return url.substring(baseHref.length);
  }
  return url;
}

function _addBaseHref(baseHref: string, url: string): string {
  if (!url.startsWith(baseHref)) {
    return baseHref + url;
  }
  return url;
}

function stripIndexHtml(url: string): string {
  if (/\/index.html$/g.test(url)) {
    // '/index.html'.length == 11
    return url.substring(0, url.length - 11);
  }
  return url;
}

function stripTrailingSlash(url: string): string {
  if (/\/$/g.test(url)) {
    url = url.substring(0, url.length - 1);
  }
  return url;
}

import {LocationStrategy} from './location_strategy';
import {StringWrapper, isPresent, CONST_EXPR} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {BaseException, isBlank} from 'angular2/src/facade/lang';
import {OpaqueToken, Injectable, Optional, Inject} from 'angular2/di';

export const appBaseHrefToken: OpaqueToken = CONST_EXPR(new OpaqueToken('locationHrefToken'));

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
  private _subject: EventEmitter = new EventEmitter();
  private _baseHref: string;

  constructor(public _platformStrategy: LocationStrategy,
              @Optional() @Inject(appBaseHrefToken) href?: string) {
    var browserBaseHref = isPresent(href) ? href : this._platformStrategy.getBaseHref();

    if (isBlank(browserBaseHref)) {
      throw new BaseException(
          `No base href set. Either provide a binding to "appBaseHrefToken" or add a base element.`);
    }

    this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
    this._platformStrategy.onPopState((_) => this._onPopState(_));
  }

  _onPopState(_): void { ObservableWrapper.callNext(this._subject, {'url': this.path()}); }

  path(): string { return this.normalize(this._platformStrategy.path()); }

  normalize(url: string): string {
    return stripTrailingSlash(this._stripBaseHref(stripIndexHtml(url)));
  }

  normalizeAbsolutely(url: string): string {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    return stripTrailingSlash(this._addBaseHref(url));
  }

  _stripBaseHref(url: string): string {
    if (this._baseHref.length > 0 && url.startsWith(this._baseHref)) {
      return url.substring(this._baseHref.length);
    }
    return url;
  }

  _addBaseHref(url: string): string {
    if (!url.startsWith(this._baseHref)) {
      return this._baseHref + url;
    }
    return url;
  }

  go(url: string): void {
    var finalUrl = this.normalizeAbsolutely(url);
    this._platformStrategy.pushState(null, '', finalUrl);
  }

  forward(): void { this._platformStrategy.forward(); }

  back(): void { this._platformStrategy.back(); }

  subscribe(onNext: (value: any) => void, onThrow: (exception: any) => void = null,
            onReturn: () => void = null): void {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }
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

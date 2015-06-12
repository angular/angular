import {BrowserLocation} from './browser_location';
import {StringWrapper} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {Injectable} from 'angular2/di';

@Injectable()
export class Location {
  private _subject: EventEmitter;
  private _baseHref: string;

  constructor(public _browserLocation: BrowserLocation) {
    this._subject = new EventEmitter();
    this._baseHref = stripIndexHtml(this._browserLocation.getBaseHref());
    this._browserLocation.onPopState((_) => this._onPopState(_));
  }

  _onPopState(_): void { ObservableWrapper.callNext(this._subject, {'url': this.path()}); }

  path(): string { return this.normalize(this._browserLocation.path()); }

  normalize(url: string): string { return this._stripBaseHref(stripIndexHtml(url)); }

  normalizeAbsolutely(url: string): string {
    if (url.length > 0 && url[0] != '/') {
      url = '/' + url;
    }
    return this._addBaseHref(url);
  }

  _stripBaseHref(url: string): string {
    if (this._baseHref.length > 0 && StringWrapper.startsWith(url, this._baseHref)) {
      return StringWrapper.substring(url, this._baseHref.length);
    }
    return url;
  }

  _addBaseHref(url: string): string {
    if (!StringWrapper.startsWith(url, this._baseHref)) {
      return this._baseHref + url;
    }
    return url;
  }

  go(url: string): void {
    var finalUrl = this.normalizeAbsolutely(url);
    this._browserLocation.pushState(null, '', finalUrl);
  }

  forward(): void { this._browserLocation.forward(); }

  back(): void { this._browserLocation.back(); }

  subscribe(onNext, onThrow = null, onReturn = null): void {
    ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
  }
}



function stripIndexHtml(url: string): string {
  // '/index.html'.length == 11
  if (url.length > 10 && StringWrapper.substring(url, url.length - 11) == '/index.html') {
    return StringWrapper.substring(url, 0, url.length - 11);
  }
  if (url.length > 1 && url[url.length - 1] == '/') {
    url = StringWrapper.substring(url, 0, url.length - 1);
  }
  return url;
}

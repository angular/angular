import {proxy, SpyObject} from 'angular2/test_lib';
import {IMPLEMENTS, BaseException} from 'angular2/src/facade/lang';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {BrowserLocation} from 'angular2/src/router/browser_location';

@proxy
@IMPLEMENTS(BrowserLocation)
export class DummyBrowserLocation extends SpyObject {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: List<string> = [];
  _subject: EventEmitter = new EventEmitter();
  constructor() { super(); }

  simulatePopState(url): void {
    this.internalPath = url;
    ObservableWrapper.callNext(this._subject, null);
  }

  path(): string { return this.internalPath; }

  simulateUrlPop(pathname: string): void {
    ObservableWrapper.callNext(this._subject, {'url': pathname});
  }

  pushState(ctx: any, title: string, url: string): void {
    this.internalTitle = title;
    this.internalPath = url;
    this.urlChanges.push(url);
  }

  forward(): void { throw new BaseException('Not implemented yet!'); }

  back(): void { throw new BaseException('Not implemented yet!'); }

  onPopState(fn): void { ObservableWrapper.subscribe(this._subject, fn); }

  getBaseHref(): string { return this.internalBaseHref; }

  noSuchMethod(m) { return super.noSuchMethod(m); }
}

import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {List} from 'angular2/src/facade/collection';
import {LocationStrategy} from 'angular2/src/router/location_strategy';


export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: List<string> = [];
  _subject: EventEmitter = new EventEmitter();
  constructor() { super(); }

  simulatePopState(url: string): void {
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

  onPopState(fn: (value: any) => void): void { ObservableWrapper.subscribe(this._subject, fn); }

  getBaseHref(): string { return this.internalBaseHref; }
}

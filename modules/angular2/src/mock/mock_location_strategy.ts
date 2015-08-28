import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {LocationStrategy} from 'angular2/src/router/location_strategy';


export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: string[] = [];
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

  back(): void {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  }
}

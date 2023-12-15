import {LocationChangeListener, PlatformLocation} from '@angular/common/public_api';
import {FakeNavigation} from './fake_navigation';
// @ng_package: ignore-cross-repo-import
import {PlatformNavigation} from '../../../src/navigation/platform_navigation';
import {Injectable, inject} from '@angular/core';

@Injectable()
export class FakePlatformLocation implements PlatformLocation {
  private _platformNavigation = inject(PlatformNavigation) as FakeNavigation;

  constructor() {
    if (!(this._platformNavigation instanceof FakeNavigation)) {
      throw new Error(
        'FakePlatformNavigation cannot be used without FakeNavigation. Use ' +
          '`provideFakeNavigation` to have all these services provided together.',
      );
    }
  }

  getBaseHrefFromDOM(): string {
    return this._platformNavigation.getBaseURIForTesting();
  }

  onPopState(fn: LocationChangeListener): VoidFunction {
    this._platformNavigation.getWindowForTesting().addEventListener('popstate', fn);
    return () => this._platformNavigation.getWindowForTesting().removeEventListener('popstate', fn);
  }

  onHashChange(fn: LocationChangeListener): VoidFunction {
    this._platformNavigation.getWindowForTesting().addEventListener('hashchange', fn as any);
    return () =>
      this._platformNavigation.getWindowForTesting().removeEventListener('hashchange', fn as any);
  }

  get href(): string {
    return this._platformNavigation.currentEntry.url!;
  }
  get protocol(): string {
    return new URL(this._platformNavigation.currentEntry.url!).protocol;
  }
  get hostname(): string {
    return new URL(this._platformNavigation.currentEntry.url!).hostname;
  }
  get port(): string {
    return new URL(this._platformNavigation.currentEntry.url!).port;
  }
  get pathname(): string {
    return new URL(this._platformNavigation.currentEntry.url!).pathname;
  }
  get search(): string {
    return new URL(this._platformNavigation.currentEntry.url!).search;
  }
  get hash(): string {
    return new URL(this._platformNavigation.currentEntry.url!).hash;
  }

  pushState(state: any, title: string, url: string): void {
    this._platformNavigation.pushState(state, title, url);
  }

  replaceState(state: any, title: string, url: string): void {
    this._platformNavigation.replaceState(state, title, url);
  }

  forward(): void {
    this._platformNavigation.forward();
  }

  back(): void {
    this._platformNavigation.back();
  }

  historyGo(relativePosition: number = 0): void {
    this._platformNavigation.go(relativePosition);
  }

  getState(): unknown {
    return this._platformNavigation.currentEntry.getHistoryState();
  }
}

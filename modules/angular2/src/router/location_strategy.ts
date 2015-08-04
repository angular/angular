import {BaseException} from 'angular2/src/facade/lang';
import {EventListener} from 'angular2/src/facade/browser';

function _abstract() {
  return new BaseException('This method is abstract');
}

export class LocationStrategy {
  path(): string { throw _abstract(); }
  pushState(ctx: any, title: string, url: string): void { throw _abstract(); }
  forward(): void { throw _abstract(); }
  back(): void { throw _abstract(); }
  onPopState(fn: EventListener): void { throw _abstract(); }
  getBaseHref(): string { throw _abstract(); }
}

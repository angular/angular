import {BaseException} from 'angular2/src/core/facade/lang';

function _abstract() {
  return new BaseException('This method is abstract');
}

export class LocationStrategy {
  path(): string { throw _abstract(); }
  pushState(ctx: any, title: string, url: string): void { throw _abstract(); }
  forward(): void { throw _abstract(); }
  back(): void { throw _abstract(); }
  onPopState(fn: (_: any) => any): void { throw _abstract(); }
  getBaseHref(): string { throw _abstract(); }
}

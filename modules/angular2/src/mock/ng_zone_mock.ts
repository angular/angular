import {NgZoneImpl} from 'angular2/src/core/zone/ng_zone_impl';

export class MockNgZone extends NgZoneImpl {
  constructor() { super({enableLongStackTrace: false}); }

  run(fn: () => any): any { return fn(); }

  runOutsideAngular(fn: () => any): any { return fn(); }
}

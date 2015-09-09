import {SpyObject} from 'angular2/test_lib';
import {ApplicationRef, LifeCycle, Injector, bind} from 'angular2/angular2';
import {global} from 'angular2/src/core/facade/lang';

export class SpyApplicationRef extends SpyObject {
  injector;
  constructor() {
    super();
    this.injector = Injector.resolveAndCreate([bind(LifeCycle).toValue({tick: () => {}})]);
  }
}

export function callNgProfilerTimeChangeDetection(config?): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}

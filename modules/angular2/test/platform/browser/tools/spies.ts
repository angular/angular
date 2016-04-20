import {SpyObject} from 'angular2/testing_internal';
import {ReflectiveInjector, provide} from 'angular2/core';
import {global} from 'angular2/src/facade/lang';
import {ApplicationRef, ApplicationRef_} from 'angular2/src/core/application_ref';

export class SpyApplicationRef extends SpyObject {
  constructor() { super(ApplicationRef_); }
}

export class SpyComponentRef extends SpyObject {
  injector;
  constructor() {
    super();
    this.injector = ReflectiveInjector.resolveAndCreate(
        [provide(ApplicationRef, {useClass: SpyApplicationRef})]);
  }
}

export function callNgProfilerTimeChangeDetection(config?): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}

import {SpyObject} from '@angular/core/testing/testing_internal';
import {ReflectiveInjector, provide} from '@angular/core';
import {global} from '../../../src/facade/lang';
import {ApplicationRef, ApplicationRef_} from '@angular/core/src/application_ref';

export class SpyApplicationRef extends SpyObject {
  constructor() { super(ApplicationRef_); }
}

export class SpyComponentRef extends SpyObject {
  injector;
  constructor() {
    super();
    this.injector = ReflectiveInjector.resolveAndCreate(
        [{provide: ApplicationRef, useClass: SpyApplicationRef}]);
  }
}

export function callNgProfilerTimeChangeDetection(config?): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}

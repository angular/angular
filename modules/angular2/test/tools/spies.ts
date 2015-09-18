import {SpyObject} from 'angular2/testing_internal';
import {Injector, provide} from 'angular2/angular2';
import {ComponentRef} from 'angular2/src/core/linker/dynamic_component_loader';
import {global} from 'angular2/src/core/facade/lang';
import {ApplicationRef, ApplicationRef_} from 'angular2/src/core/application_ref';

export class SpyApplicationRef extends SpyObject {
  constructor() { super(ApplicationRef_); }
}

export class SpyComponentRef extends SpyObject {
  injector;
  constructor() {
    super();
    this.injector =
        Injector.resolveAndCreate([provide(ApplicationRef, {useClass: SpyApplicationRef})]);
  }
}

export function callNgProfilerTimeChangeDetection(config?): void {
  (<any>global).ng.profiler.timeChangeDetection(config);
}

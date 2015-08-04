import {
  ChangeDetector,
  ChangeDetectorRef,
  ProtoChangeDetector,
  DynamicChangeDetector
} from 'angular2/src/change_detection/change_detection';

import {DependencyProvider} from 'angular2/di';

import {BasePipe} from 'angular2/src/change_detection/pipes/pipe';
import {SpyObject, proxy} from './test_lib';

export class SpyChangeDetector extends SpyObject {
  constructor() { super(DynamicChangeDetector); }
}

export class SpyProtoChangeDetector extends SpyObject {
  constructor() { super(DynamicChangeDetector); }
}

export class SpyPipe extends SpyObject {
  constructor() { super(BasePipe); }
}

export class SpyPipeFactory extends SpyObject {}

export class SpyDependencyProvider extends SpyObject {}

export class SpyIterableDifferFactory extends SpyObject {}

export class SpyChangeDetectorRef extends SpyObject {
  constructor() { super(ChangeDetectorRef); }
}

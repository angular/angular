import {
  ChangeDetector,
  ProtoChangeDetector,
  DynamicChangeDetector
} from 'angular2/change_detection';

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
import {ChangeDetectorRef_} from 'angular2/src/core/change_detection/change_detector_ref';
import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyChangeDetectorRef extends SpyObject {
  constructor() { super(ChangeDetectorRef_); }
}

export class SpyNgControl extends SpyObject {}

export class SpyValueAccessor extends SpyObject {}

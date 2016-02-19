import {ChangeDetectorRef} from 'angular2/src/core/change_detection/change_detector_ref';
import {SpyObject, proxy} from 'angular2/testing_internal';

export class SpyChangeDetectorRef extends SpyObject {
  constructor() {
    super(ChangeDetectorRef);
    this.spy('markForCheck');
  }
}

export class SpyNgControl extends SpyObject {}

export class SpyValueAccessor extends SpyObject {}

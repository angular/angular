import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  tick,
  fakeAsync
} from 'angular2/testing_internal';

import {
  ChangeDetectorRef,
  BufferingChangeDetectorRef
} from 'angular2/src/core/change_detection/change_detector_ref';

import {SpyChangeDetectorRef} from '../spies';


export function main() {
  describe('BufferingChangeDetectorRef', () => {
    it('should buffer and replay on init', () => {
      var delegate = new SpyChangeDetectorRef();
      delegate.spy('detectChanges');
      var changeDetectorRef = new BufferingChangeDetectorRef();
      changeDetectorRef.detectChanges();

      changeDetectorRef.init(<any>delegate);
      expect(delegate.spy('detectChanges')).toHaveBeenCalled();
    });

    it('should delegate after init', () => {
      var delegate = new SpyChangeDetectorRef();
      delegate.spy('detectChanges');
      var changeDetectorRef = new BufferingChangeDetectorRef();
      changeDetectorRef.init(<any>delegate);
      changeDetectorRef.detectChanges();

      expect(delegate.spy('detectChanges')).toHaveBeenCalled();
    });
  });
}
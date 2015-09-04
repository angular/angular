import {
  afterEach,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';

import {enableDebugTools, disableDebugTools} from 'angular2/tools';
import {SpyApplicationRef, callNgProfilerTimeChangeDetection} from './spies';

export function main() {
  describe('profiler', () => {
    beforeEach(() => { enableDebugTools((<any>new SpyApplicationRef())); });

    afterEach(() => { disableDebugTools(); });

    it('should time change detection', () => { callNgProfilerTimeChangeDetection(); });

    it('should time change detection with recording',
       () => { callNgProfilerTimeChangeDetection({'record': true}); });
  });
}

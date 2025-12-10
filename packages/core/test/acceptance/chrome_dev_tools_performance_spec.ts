/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, HostAttributeToken, inject, Inject, OnInit} from '../../src/core';
import {enableProfiling} from '../../src/render3/debug/chrome_dev_tools_performance';
import {profiler} from '../../src/render3/profiler';
import {ProfilerEvent} from '../../primitives/devtools';
import {TestBed} from '../../testing';

describe('Chrome DevTools Performance integration', () => {
  let markSpy: jasmine.Spy;
  let measureSpy: jasmine.Spy;

  beforeEach(() => {
    markSpy = spyOn(performance, 'mark');
    measureSpy = spyOn(performance, 'measure');
  });

  describe('DI perf events', () => {
    it('should not crash when a HostAttributeToken is injected', () => {
      @Component({
        template: ``,
      })
      class MyCmp {
        attr = inject(new HostAttributeToken('someAttr'), {optional: true});
      }

      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        expect(measureSpy).toHaveBeenCalled();
      } finally {
        stopProfiling();
      }
    });

    it('should not crash when a string provider is injected', () => {
      @Component({
        template: ``,
        providers: [
          {
            provide: 'foo',
            useValue: 'bar',
          },
        ],
      })
      class MyCmp {
        constructor(@Inject('foo') foo: string) {}
      }

      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        expect(measureSpy).toHaveBeenCalled();
      } finally {
        stopProfiling();
      }
    });

    it('should not crash when asymmetric events are processed', () => {
      const stopProfiling = enableProfiling();

      try {
        profiler(ProfilerEvent.ChangeDetectionSyncStart);
        profiler(ProfilerEvent.ChangeDetectionStart);
        profiler(ProfilerEvent.ChangeDetectionSyncEnd);

        expect(markSpy).toHaveBeenCalledTimes(2);
        expect(measureSpy).toHaveBeenCalledTimes(1);
        expect(measureSpy.calls.first().args[0]).toMatch(/^Synchronization /);
      } finally {
        stopProfiling();
      }
    });
  });

  describe('lifecycle hooks', () => {
    it('should include documentation URL for lifecycle hooks', () => {
      @Component({
        template: ``,
      })
      class MyCmp implements OnInit {
        ngOnInit() {}
      }

      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        const lifecycleCall = measureSpy.calls
          .all()
          .find((call) => call.args[0].includes(':ngOnInit'));

        expect(lifecycleCall).toBeDefined();
        const options = lifecycleCall!.args[1] as PerformanceMeasureOptions;
        const detail = options?.detail;
        expect(detail?.devtools?.properties).toContain([
          'Documentation',
          jasmine.stringMatching(/guide\/components\/lifecycle#ngoninit/),
        ]);
      } finally {
        stopProfiling();
      }
    });
  });
});

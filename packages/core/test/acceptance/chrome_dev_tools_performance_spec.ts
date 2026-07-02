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
  describe('DI perf events', () => {
    it('should not crash when a HostAttributeToken is injected', () => {
      @Component({
        template: ``,
      })
      class MyCmp {
        attr = inject(new HostAttributeToken('someAttr'), {optional: true});
      }

      spyOn(console, 'timeStamp');
      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        expect((console.timeStamp as any).calls.all().length).not.toBe(0);
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

      spyOn(console, 'timeStamp');
      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        expect((console.timeStamp as any).calls.all().length).not.toBe(0);
      } finally {
        stopProfiling();
      }
    });

    it('should not crash when asymmetric events are processed', () => {
      const timeStampSpy = spyOn(console, 'timeStamp');
      const stopProfiling = enableProfiling();

      try {
        profiler(ProfilerEvent.ChangeDetectionSyncStart);
        profiler(ProfilerEvent.ChangeDetectionStart);
        profiler(ProfilerEvent.ChangeDetectionSyncEnd);

        const calls = timeStampSpy.calls.all();
        expect(calls.length).toBe(3);

        const [syncStart, cdStart, syncEnd] = calls;
        expect(syncStart.args[0]).toMatch(/^Event_/);
        expect(cdStart.args[0]).toMatch(/^Event_/);
        expect(syncEnd.args[0]).toMatch(/^Synchronization /);
      } finally {
        stopProfiling();
      }
    });
  });

  describe('documentation URLs', () => {
    it('should include documentation URL for lifecycle hooks', () => {
      @Component({
        template: ``,
      })
      class MyCmp implements OnInit {
        ngOnInit() {}
      }

      const timeStampSpy = spyOn(console, 'timeStamp');
      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        const lifecycleCall = timeStampSpy.calls
          .all()
          .find((call) => (call.args[0] as string)?.includes(':ngOnInit'));

        expect(lifecycleCall).toBeDefined();
        // The 7th argument (index 6) is the detail object
        const detail = (lifecycleCall!.args as any[])[6] as {url: string; description: string};
        expect(detail).toBeDefined();
        expect(detail.url).toMatch(/guide\/components\/lifecycle#ngoninit/);
        expect(detail.description).toBe('Documentation');
      } finally {
        stopProfiling();
      }
    });

    it('should include documentation URL for change detection', () => {
      @Component({
        template: ``,
      })
      class MyCmp {}

      const timeStampSpy = spyOn(console, 'timeStamp');
      const stopProfiling = enableProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        fixture.detectChanges();

        const cdCall = timeStampSpy.calls
          .all()
          .find((call) => call.args[0]?.startsWith?.('Change detection'));

        expect(cdCall).toBeDefined();
        const detail = (cdCall!.args as any[])[6] as {url: string; description: string};
        expect(detail).toBeDefined();
        expect(detail.url).toMatch(/best-practices\/runtime-performance/);
        expect(detail.description).toBe('Documentation');
      } finally {
        stopProfiling();
      }
    });
  });
});

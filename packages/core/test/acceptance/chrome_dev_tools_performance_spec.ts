/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProfiling} from '../../src/render3/debug/chrome_dev_tools_performance';
import {Component, HostAttributeToken, inject, Inject} from '../../src/core';
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
  });
});

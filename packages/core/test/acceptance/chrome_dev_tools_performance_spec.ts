/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, HostAttributeToken, inject, Inject, OnInit} from '../../src/core';
import {
  enableProfiling,
  getComponentInstanceId,
} from '../../src/render3/debug/chrome_dev_tools_performance';
import {profiler} from '../../src/render3/profiler';
import {ProfilerEvent} from '../../primitives/devtools';
import {TestBed} from '../../testing';

/**
 * Sets up a `console.timeStamp` spy and starts Angular profiling in one step.
 * Call `stop()` in a `finally` block to tear down profiling.
 */
function setupProfiling(): {spy: jasmine.Spy; stop: () => void} {
  const spy = spyOn(console, 'timeStamp');
  const stop = enableProfiling();
  return {spy, stop};
}

/**
 * Finds the first ComponentEnd `console.timeStamp` call for the given component class
 * name and returns its raw `args` array. ComponentEnd calls carry a detail object as
 * the 7th argument (`args[6]`).
 */
function findComponentEndCall(spy: jasmine.Spy, componentName: string): any[] | undefined {
  return (spy.calls.all() as any[]).find(
    (c) => c.args[0] === componentName && c.args[6] !== undefined,
  )?.args;
}

/**
 * Returns the `args` arrays of all `console.timeStamp` calls that carry an
 * `angular-devtools://` deep-link URL, optionally restricted to calls whose
 * label exactly matches `componentName`.
 */
function findDeepLinkCalls(spy: jasmine.Spy, componentName?: string): any[][] {
  return (spy.calls.all() as any[])
    .filter(
      (c) =>
        (componentName === undefined || c.args[0] === componentName) &&
        (c.args[6] as {url?: string} | undefined)?.url?.startsWith('angular-devtools://'),
    )
    .map((c) => c.args);
}

describe('Chrome DevTools Performance integration', () => {
  describe('DI perf events', () => {
    it('should not crash when a HostAttributeToken is injected', async () => {
      @Component({
        template: ``,
      })
      class MyCmp {
        attr = inject(new HostAttributeToken('someAttr'), {optional: true});
      }

      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        await fixture.whenStable();

        expect(spy.calls.all().length).not.toBe(0);
      } finally {
        stop();
      }
    });

    it('should not crash when a string provider is injected', async () => {
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

      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        await fixture.whenStable();

        expect(spy.calls.all().length).not.toBe(0);
      } finally {
        stop();
      }
    });

    it('should not crash when asymmetric events are processed', () => {
      const {spy, stop} = setupProfiling();

      try {
        profiler(ProfilerEvent.ChangeDetectionSyncStart);
        profiler(ProfilerEvent.ChangeDetectionStart);
        profiler(ProfilerEvent.ChangeDetectionSyncEnd);

        const calls = spy.calls.all();
        expect(calls.length).toBe(3);

        const [syncStart, cdStart, syncEnd] = calls;
        expect(syncStart.args[0]).toMatch(/^Event_/);
        expect(cdStart.args[0]).toMatch(/^Event_/);
        expect(syncEnd.args[0]).toMatch(/^Synchronization /);
      } finally {
        stop();
      }
    });
  });

  describe('deep link properties', () => {
    afterEach(() => {
      (globalThis as any).__NG_DEVTOOLS_CONNECTED__ = undefined;
    });

    it('should not include deep link URL when DevTools is not connected', async () => {
      @Component({
        template: `<span>hello</span>`,
      })
      class NoDeepLinkCmp {}

      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(NoDeepLinkCmp);
        await fixture.whenStable();

        // Profiling always emits events (change detection, component tracking, etc.),
        // so there will be timeStamp calls.  What must NOT appear is any call whose
        // detail contains an `angular-devtools://` deep link — those are only added
        // when the Angular DevTools extension sets `__NG_DEVTOOLS_CONNECTED__`.
        expect(findDeepLinkCalls(spy))
          .withContext(
            'no angular-devtools:// deep link should appear when DevTools is not connected',
          )
          .toEqual([]);
      } finally {
        stop();
      }
    });

    it('should include deep link URL in ComponentEnd timeStamp call', async () => {
      @Component({
        template: `<span>hello</span>`,
      })
      class DeepLinkCmp {}

      (globalThis as any).__NG_DEVTOOLS_CONNECTED__ = true;
      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(DeepLinkCmp);
        await fixture.whenStable();

        // Find the ComponentEnd call — it has the component name as label and properties as 7th arg
        const componentEndArgs = findComponentEndCall(spy, 'DeepLinkCmp');
        expect(componentEndArgs)
          .withContext('expected a ComponentEnd timeStamp call for DeepLinkCmp')
          .toBeDefined();

        const properties = componentEndArgs![6];
        expect(properties.description).toBe('Component');
        expect(properties.url).toMatch(/^angular-devtools:\/\/component\/\d+$/);
      } finally {
        stop();
      }
    });

    it('should assign the same instance ID to the same component instance', async () => {
      @Component({
        template: ``,
      })
      class StableIdCmp {
        ngOnInit() {}
      }

      (globalThis as any).__NG_DEVTOOLS_CONNECTED__ = true;
      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(StableIdCmp);
        await fixture.whenStable();

        // Only ComponentEnd calls carry a deep link; LifecycleHookEnd calls carry a
        // documentation URL instead, so `findDeepLinkCalls` naturally excludes them.
        const deepLinkCalls = findDeepLinkCalls(spy, 'StableIdCmp');
        expect(deepLinkCalls.length).toBeGreaterThanOrEqual(1);

        // All ComponentEnd calls for the same instance should have the same instance ID
        const uniqueUrls = new Set(deepLinkCalls.map((args) => args[6].url));
        expect(uniqueUrls.size).toBe(1);
      } finally {
        stop();
      }
    });

    it('should assign different instance IDs to different component instances', async () => {
      @Component({
        selector: 'child-cmp',
        template: ``,
      })
      class ChildCmp {}

      @Component({
        template: `<child-cmp /><child-cmp />`,
        imports: [ChildCmp],
      })
      class ParentCmp {}

      (globalThis as any).__NG_DEVTOOLS_CONNECTED__ = true;
      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(ParentCmp);
        await fixture.whenStable();

        // Extract unique deep link URLs — should be exactly 2 (one per child instance)
        const childDeepLinkCalls = findDeepLinkCalls(spy, 'ChildCmp');
        expect(childDeepLinkCalls.length).toBeGreaterThanOrEqual(2);
        const uniqueUrls = new Set(childDeepLinkCalls.map((args) => args[6].url));
        expect(uniqueUrls.size).toBe(2);
      } finally {
        stop();
      }
    });

    it('should track component instance IDs', async () => {
      @Component({
        template: ``,
      })
      class InstanceIdCmp {}

      (globalThis as any).__NG_DEVTOOLS_CONNECTED__ = true;
      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(InstanceIdCmp);
        await fixture.whenStable();

        const instance = fixture.componentInstance;
        const id = getComponentInstanceId(instance);

        // The instance ID must be assigned after the component is created.
        expect(id).toBeDefined();
        expect(typeof id).toBe('number');

        // Locate the ComponentEnd timeStamp call — it uses the component class name
        // as the label and carries the deep-link detail as the 7th argument.
        const componentEndArgs = findComponentEndCall(spy, 'InstanceIdCmp');
        expect(componentEndArgs)
          .withContext('expected a ComponentEnd timeStamp call with a deep link')
          .toBeDefined();

        const url = (componentEndArgs![6] as {url: string}).url;
        expect(url).toBe(`angular-devtools://component/${id}`);
      } finally {
        stop();
      }
    });
  });

  describe('documentation URLs', () => {
    it('should include documentation URL for lifecycle hooks', async () => {
      @Component({
        template: ``,
      })
      class MyCmp implements OnInit {
        ngOnInit() {}
      }

      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        await fixture.whenStable();

        const lifecycleCall = spy.calls
          .all()
          .find((call) => (call.args[0] as string)?.includes(':ngOnInit'));

        expect(lifecycleCall).toBeDefined();
        // The 7th argument (index 6) is the detail object
        const detail = (lifecycleCall!.args as any[])[6] as {url: string; description: string};
        expect(detail).toBeDefined();
        expect(detail.url).toMatch(/guide\/components\/lifecycle#ngoninit/);
        expect(detail.description).toBe('Documentation');
      } finally {
        stop();
      }
    });

    it('should include documentation URL for change detection', async () => {
      @Component({
        template: ``,
      })
      class MyCmp {}

      const {spy, stop} = setupProfiling();

      try {
        const fixture = TestBed.createComponent(MyCmp);
        await fixture.whenStable();

        const cdCall = spy.calls
          .all()
          .find((call) => call.args[0]?.startsWith?.('Change detection'));

        expect(cdCall).toBeDefined();
        const detail = (cdCall!.args as any[])[6] as {url: string; description: string};
        expect(detail).toBeDefined();
        expect(detail.url).toMatch(/best-practices\/runtime-performance/);
        expect(detail.description).toBe('Documentation');
      } finally {
        stop();
      }
    });
  });
});

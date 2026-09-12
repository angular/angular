/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdAnalyzerImpl, CdData, getCdAnalyzer} from './analyzer';
import {Profiler, Hooks} from '../profiler';
import type {ElementPosition} from '../../../../../protocol';
import {IdentityTracker} from '../../directive-forest/identity-tracker/identity-tracker';

class MockProfiler extends Profiler {
  override destroy(): void {}
  override onIndexForest(): void {}
}

class CmpFoo {}
class CmpBar {}

describe('CD analyzer', () => {
  describe('CdAnalyzerImpl', () => {
    let profiler: MockProfiler;
    let analyzer: CdAnalyzerImpl;
    let hooks: Hooks;
    let nextCmpId: number;

    // Mocks the ID that `IdentityTracker` would normally assign
    // while indexing the real directive forest.
    function registerCmp<T extends object>(component: T): T {
      (IdentityTracker.getInstance() as any).currentDirectiveId.set(component, nextCmpId++);
      return component;
    }

    function startCdEvent(component: unknown, position: ElementPosition) {
      hooks.onChangeDetectionStart(component, document.createElement('div'), 0, position);
    }

    function endCdEvent(component: unknown, position: ElementPosition) {
      hooks.onChangeDetectionEnd(component, document.createElement('div'), 0, position);
    }

    beforeEach(() => {
      (IdentityTracker as any).instance = undefined;
      nextCmpId = 0;

      profiler = new MockProfiler();
      spyOn(profiler, 'subscribe').and.callThrough();
      spyOn(profiler, 'unsubscribe').and.callThrough();

      analyzer = new CdAnalyzerImpl(profiler);
      hooks = (profiler.subscribe as jasmine.Spy).calls.argsFor(0)[0] as Hooks;
    });

    it('should subscribe to the profiler on init and unsubscribe the same hooks on destroy', () => {
      expect(profiler.subscribe).toHaveBeenCalledTimes(1);

      analyzer.destroy();

      expect((profiler.unsubscribe as jasmine.Spy).calls.argsFor(0)[0]).toBe(hooks);
    });

    it('should stop notifying a listener after it unsubscribes without affecting other listeners', async () => {
      const listenerFoo = jasmine.createSpy('listenerFoo');
      const listenerBar = jasmine.createSpy('listenerBar');

      const unsubscribeFoo = analyzer.onCycle(listenerFoo);
      analyzer.onCycle(listenerBar);

      const foo = registerCmp(new CmpFoo());

      startCdEvent(foo, [0]);
      endCdEvent(foo, [0]);
      await Promise.resolve();

      expect(listenerFoo).toHaveBeenCalledTimes(1);
      expect(listenerBar).toHaveBeenCalledTimes(1);

      unsubscribeFoo();

      startCdEvent(foo, [0]);
      endCdEvent(foo, [0]);
      await Promise.resolve();

      expect(listenerFoo).toHaveBeenCalledTimes(1);
      expect(listenerBar).toHaveBeenCalledTimes(2);
    });

    it('should emit current and all collected change detection data', async () => {
      spyOn(performance, 'now').and.returnValues(100, 125);
      const listener = jasmine.createSpy('listener');
      analyzer.onCycle(listener);

      const cmp = registerCmp(new CmpFoo());
      const pos = [0, 1];
      startCdEvent(cmp, pos);
      endCdEvent(cmp, pos);
      await Promise.resolve();

      expect(listener).toHaveBeenCalledTimes(1);
      const [current, all] = listener.calls.mostRecent().args as [CdData[], CdData[]];

      expect(current.length).toBe(1);
      expect(current[0].elementPosition).toEqual(pos);
      expect(current[0].component.deref()).toBe(cmp);
      expect(current[0].cdPassDurations).toEqual([25]);
      expect(all).toEqual([current[0]]);
    });

    it('should accumulate CD data into a single duration', async () => {
      spyOn(performance, 'now').and.returnValues(100, 110, 120, 135);
      const listener = jasmine.createSpy('listener');
      analyzer.onCycle(listener);

      const cmp = registerCmp(new CmpFoo());
      const pos = [0];
      startCdEvent(cmp, pos);
      endCdEvent(cmp, pos);
      startCdEvent(cmp, pos);
      endCdEvent(cmp, pos);
      await Promise.resolve();

      const [current] = listener.calls.mostRecent().args as [CdData[], CdData[]];
      expect(current[0].cdPassDurations).toEqual([25]); // (110 - 100) + (135 - 120)
    });

    it('should track multiple components within the same cycle', async () => {
      spyOn(performance, 'now').and.returnValues(0, 10, 20, 30);
      const listener = jasmine.createSpy('listener');
      analyzer.onCycle(listener);

      const foo = registerCmp(new CmpFoo());
      const bar = registerCmp(new CmpBar());
      startCdEvent(foo, [0]);
      endCdEvent(foo, [0]);
      startCdEvent(bar, [1]);
      endCdEvent(bar, [1]);
      await Promise.resolve();

      const [current, all] = listener.calls.mostRecent().args as [CdData[], CdData[]];
      expect(current.length).toBe(2);
      expect(all.length).toBe(2);
      expect(current.map((d) => d.elementPosition)).toEqual([[0], [1]]);
    });

    it('should track multiple components with some not being part in the latest CD', async () => {
      spyOn(performance, 'now').and.returnValues(0, 10, 20, 50, 60, 75);
      const listener = jasmine.createSpy('listener');
      analyzer.onCycle(listener);

      const foo = registerCmp(new CmpFoo());
      const bar = registerCmp(new CmpBar());

      // Cycle 1: Both components run
      startCdEvent(foo, [0]);
      endCdEvent(foo, [0]);
      startCdEvent(bar, [1]);
      endCdEvent(bar, [1]);
      await Promise.resolve();

      // Cycle 2: Only `Foo` runs
      startCdEvent(foo, [0]);
      endCdEvent(foo, [0]);
      await Promise.resolve();

      expect(listener).toHaveBeenCalledTimes(2);
      const [current, all] = listener.calls.mostRecent().args as [CdData[], CdData[]];

      expect(current.length).toBe(1);
      expect(current[0].elementPosition).toEqual([0]);
      expect(current[0].cdPassDurations).toEqual([10, 15]); // (10 - 0), (75 - 60)

      expect(all.length).toBe(2);

      const fooData = all.find((d) => d.elementPosition[0] === 0)!;
      expect(fooData.cdPassDurations).toEqual([10, 15]); // (10 - 0), (75 - 60)

      const barData = all.find((d) => d.elementPosition[0] === 1)!;
      expect(barData.cdPassDurations).toEqual([30]); // 50 - 20
    });
  });

  describe('getCdAnalyzer', () => {
    const globalWithDebugApi = window as unknown as {ng?: unknown};
    let origDebugApi: unknown;
    let disposeFns: Array<() => void>;

    beforeEach(() => {
      origDebugApi = globalWithDebugApi.ng;
      globalWithDebugApi.ng = {};
      disposeFns = [];
    });

    afterEach(() => {
      // Ensure no analyzer/consumer state leaks into the next test,
      // regardless of whether the test itself disposed everything it created.
      for (const dispose of disposeFns) {
        dispose();
      }

      if (!origDebugApi) {
        delete globalWithDebugApi.ng;
      } else {
        globalWithDebugApi.ng = origDebugApi;
      }
    });

    // Track the returned `disposeFn` so the analyzer gets cleaned up in `afterEach`.
    function trackedGetCdAnalyzer() {
      const result = getCdAnalyzer();
      disposeFns.push(result.disposeFn);
      return result;
    }

    it('should reuse the same analyzer instance for multiple consumers', () => {
      const foo = trackedGetCdAnalyzer();
      const bar = trackedGetCdAnalyzer();

      expect(foo.analyzer).not.toBeNull();
      expect(foo.analyzer).toBe(bar.analyzer);
    });

    it('should dispose the analyzer, if there is a single consumer', () => {
      const foo = trackedGetCdAnalyzer();

      foo.disposeFn();

      const bar = trackedGetCdAnalyzer();
      expect(bar.analyzer).not.toBe(foo.analyzer);
    });

    it('should keep the analyzer after a disposal attempt when there are multiple consumers', () => {
      const foo = trackedGetCdAnalyzer();
      const bar = trackedGetCdAnalyzer();

      foo.disposeFn();

      const baz = trackedGetCdAnalyzer();
      expect(baz.analyzer).toBe(foo.analyzer);
    });
  });
});

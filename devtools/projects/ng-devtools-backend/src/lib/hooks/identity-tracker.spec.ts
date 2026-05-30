/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IdentityTracker} from './identity-tracker';

describe('IdentityTracker', () => {
  let tracker: IdentityTracker;

  beforeEach(() => {
    (IdentityTracker as any)._instance = undefined;
    tracker = IdentityTracker.getInstance();
  });

  afterEach(() => {
    (IdentityTracker as any)._instance = undefined;
    document.querySelectorAll('[ng-version]').forEach((el) => el.remove());
  });

  function seedDirective(opts: {dir: object; id: number; isComponent?: boolean}): void {
    const internal = tracker as any;
    internal._currentDirectiveId.set(opts.dir, opts.id);
    internal._currentDirectivePosition.set(opts.dir, [opts.id]);
    internal.isComponent.set(opts.dir, opts.isComponent ?? false);
  }

  describe('setProfilingActive', () => {
    it('removes pending directives from all maps when profiling stops', () => {
      const dir = {};
      seedDirective({dir, id: 0, isComponent: true});
      (tracker as any)._pendingRemovals.add(dir);

      tracker.setProfilingActive(false);

      expect(tracker.hasDirective(dir)).toBeFalse();
      expect(tracker.getDirectiveId(dir)).toBeUndefined();
      expect(tracker.getDirectivePosition(dir)).toBeUndefined();
    });

    it('does not flush pending removals when profiling starts', () => {
      const dir = {};
      seedDirective({dir, id: 0, isComponent: true});
      (tracker as any)._pendingRemovals.add(dir);

      tracker.setProfilingActive(true);

      expect(tracker.hasDirective(dir)).toBeTrue();
      expect(tracker.getDirectiveId(dir)).toBe(0);
      expect(tracker.getDirectivePosition(dir)).toEqual([0]);
    });

    it('clears the pending set after flushing', () => {
      const dir = {};
      (tracker as any)._pendingRemovals.add(dir);

      tracker.setProfilingActive(false);

      expect((tracker as any)._pendingRemovals.size).toBe(0);
    });

    it('handles an empty pending set gracefully', () => {
      expect(() => tracker.setProfilingActive(false)).not.toThrow();
    });

    it('flushes multiple pending directives at once', () => {
      const dirs = [{}, {}, {}];
      dirs.forEach((dir, i) => {
        seedDirective({dir, id: i});
        (tracker as any)._pendingRemovals.add(dir);
      });

      tracker.setProfilingActive(false);

      dirs.forEach((dir) => {
        expect(tracker.hasDirective(dir)).toBeFalse();
      });
      expect((tracker as any)._pendingRemovals.size).toBe(0);
    });
  });

  describe('index() cleanup behavior', () => {
    it('immediately removes a stale directive from all maps when not profiling', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.index();

      expect(tracker.hasDirective(dir)).toBeFalse();
      expect(tracker.getDirectiveId(dir)).toBeUndefined();
      expect(tracker.getDirectivePosition(dir)).toBeUndefined();
    });

    it('keeps a stale directive in maps during profiling, staging it for deferred cleanup', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.setProfilingActive(true);
      tracker.index();

      expect(tracker.hasDirective(dir)).toBeTrue();
      expect(tracker.getDirectiveId(dir)).toBe(0);
      expect(tracker.getDirectivePosition(dir)).toEqual([0]);
      expect((tracker as any)._pendingRemovals.has(dir)).toBeTrue();
    });

    it('removes deferred directives from maps once profiling stops', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.setProfilingActive(true);
      tracker.index();

      expect(tracker.hasDirective(dir)).toBeTrue();

      tracker.setProfilingActive(false);

      expect(tracker.hasDirective(dir)).toBeFalse();
    });

    it('includes removed directives in the returned removedNodes regardless of profiling state', () => {
      const dir = {};
      seedDirective({dir, id: 0, isComponent: true});

      const {removedNodes} = tracker.index();

      expect(removedNodes.length).toBe(1);
      expect(removedNodes[0].directive).toBe(dir);
      expect(removedNodes[0].isComponent).toBeTrue();
    });

    it('does not add an already-pending directive to removedNodes twice on the next index call', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.setProfilingActive(true);
      tracker.index();

      const {removedNodes} = tracker.index();

      expect(removedNodes.some((n) => n.directive === dir)).toBeTrue();
    });

    it('grows maps monotonically during profiling and fully clears on stop', () => {
      const dirs = [{}, {}, {}];
      dirs.forEach((dir, i) => seedDirective({dir, id: i}));

      tracker.setProfilingActive(true);
      tracker.index();

      dirs.forEach((dir) => expect(tracker.hasDirective(dir)).toBeTrue());

      tracker.setProfilingActive(false);

      dirs.forEach((dir) => expect(tracker.hasDirective(dir)).toBeFalse());
    });
  });
});

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
    (IdentityTracker as any).instance = undefined;
    tracker = IdentityTracker.getInstance();
  });

  afterEach(() => {
    (IdentityTracker as any).instance = undefined;
    document.querySelectorAll('[ng-version]').forEach((el) => el.remove());
  });

  function seedDirective(opts: {dir: object; id: number; isComponent?: boolean}): void {
    const internal = tracker as any;
    internal.currentDirectiveId.set(opts.dir, opts.id);
    internal.currentDirectivePosition.set(opts.dir, [opts.id]);
    internal.isComponent.set(opts.dir, opts.isComponent ?? false);
  }

  describe('selectMode', () => {
    it('removes pending directives from all maps when the mode is changed back to `normal`', () => {
      const dir = {};
      seedDirective({dir, id: 0, isComponent: true});
      (tracker as any).pendingRemovals.add(dir);

      tracker.selectMode('normal');

      expect(tracker.hasDirective(dir)).toBeFalse();
      expect(tracker.getDirectiveId(dir)).toBeUndefined();
      expect(tracker.getDirectivePosition(dir)).toBeUndefined();
    });

    it('does not flush pending removals when the `preservation` mode is selected', () => {
      const dir = {};
      seedDirective({dir, id: 0, isComponent: true});
      (tracker as any).pendingRemovals.add(dir);

      tracker.selectMode('preservation');

      expect(tracker.hasDirective(dir)).toBeTrue();
      expect(tracker.getDirectiveId(dir)).toBe(0);
      expect(tracker.getDirectivePosition(dir)).toEqual([0]);
    });

    it('clears the pending set after flushing', () => {
      const dir = {};
      (tracker as any).pendingRemovals.add(dir);

      tracker.selectMode('normal');

      expect((tracker as any).pendingRemovals.size).toBe(0);
    });

    it('handles an empty pending set gracefully', () => {
      expect(() => tracker.selectMode('normal')).not.toThrow();
    });

    it('flushes multiple pending directives at once', () => {
      const dirs = [{}, {}, {}];
      dirs.forEach((dir, i) => {
        seedDirective({dir, id: i});
        (tracker as any).pendingRemovals.add(dir);
      });

      tracker.selectMode('normal');

      dirs.forEach((dir) => {
        expect(tracker.hasDirective(dir)).toBeFalse();
      });
      expect((tracker as any).pendingRemovals.size).toBe(0);
    });
  });

  describe('index() cleanup behavior', () => {
    it('immediately removes a stale directive from all maps when the mode is set to `normal`', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.index();

      expect(tracker.hasDirective(dir)).toBeFalse();
      expect(tracker.getDirectiveId(dir)).toBeUndefined();
      expect(tracker.getDirectivePosition(dir)).toBeUndefined();
    });

    it('keeps a stale directive in maps during `preservation` mode, staging it for deferred cleanup', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.selectMode('preservation');
      tracker.index();

      expect(tracker.hasDirective(dir)).toBeTrue();
      expect(tracker.getDirectiveId(dir)).toBe(0);
      expect(tracker.getDirectivePosition(dir)).toEqual([0]);
      expect((tracker as any).pendingRemovals.has(dir)).toBeTrue();
    });

    it('removes deferred directives from maps once the mode is reverted back to `normal`', () => {
      const dir = {};
      seedDirective({dir, id: 0});

      tracker.selectMode('preservation');
      tracker.index();

      expect(tracker.hasDirective(dir)).toBeTrue();

      tracker.selectMode('normal');

      expect(tracker.hasDirective(dir)).toBeFalse();
    });

    it('includes removed directives in the returned removedNodes regardless of selected mode', () => {
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

      tracker.selectMode('preservation');
      tracker.index();

      const {removedNodes} = tracker.index();

      expect(removedNodes.some((n) => n.directive === dir)).toBeTrue();
    });

    it('grows maps monotonically during `preservation` mode and fully clears on stop', () => {
      const dirs = [{}, {}, {}];
      dirs.forEach((dir, i) => seedDirective({dir, id: i}));

      tracker.selectMode('preservation');
      tracker.index();

      dirs.forEach((dir) => expect(tracker.hasDirective(dir)).toBeTrue());

      tracker.selectMode('normal');

      dirs.forEach((dir) => expect(tracker.hasDirective(dir)).toBeFalse());
    });
  });
});

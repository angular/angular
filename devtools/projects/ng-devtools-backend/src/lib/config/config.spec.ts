/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getConfig} from './config';

describe('config', () => {
  const config = getConfig();
  let unsubscribers: (() => void)[] = [];

  function listenOnChange(...args: Parameters<typeof config.onChange>) {
    const unsubscribe = config.onChange(...args);
    unsubscribers.push(unsubscribe);
    return unsubscribe;
  }

  beforeEach(() => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }

    unsubscribers = [];
    config.set({
      performanceTrack: false,
      hydrationOverlays: false,
      cdHighlighting: false,
      cdDataStream: false,
    });
  });

  it('should return the same instance', () => {
    expect(getConfig()).toBe(config);
  });

  it('should have all properties disabled by default', () => {
    expect(config.performanceTrack).toBeFalse();
    expect(config.hydrationOverlays).toBeFalse();
    expect(config.cdHighlighting).toBeFalse();
    expect(config.cdDataStream).toBeFalse();
  });

  describe('set', () => {
    it('should update a single property without affecting the rest', () => {
      config.set({cdHighlighting: true});

      expect(config.cdHighlighting).toBeTrue();
      expect(config.performanceTrack).toBeFalse();
      expect(config.hydrationOverlays).toBeFalse();
      expect(config.cdDataStream).toBeFalse();
    });

    it('should update multiple properties at once', () => {
      config.set({performanceTrack: true, cdDataStream: true});

      expect(config.performanceTrack).toBeTrue();
      expect(config.cdDataStream).toBeTrue();
      expect(config.hydrationOverlays).toBeFalse();
      expect(config.cdHighlighting).toBeFalse();
    });

    it('should be a no-op for an empty config', () => {
      const spy = jasmine.createSpy('listener');
      listenOnChange('performanceTrack', spy);

      config.set({});

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onChange', () => {
    it('should notify the listener with the new value', () => {
      const spy = jasmine.createSpy('listener');
      listenOnChange('performanceTrack', spy);

      config.set({performanceTrack: true});

      expect(spy).toHaveBeenCalledOnceWith(true);
    });

    it('should notify the listener on every change', () => {
      const spy = jasmine.createSpy('listener');
      listenOnChange('cdHighlighting', spy);

      config.set({cdHighlighting: true});
      config.set({cdHighlighting: false});

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.calls.argsFor(0)).toEqual([true]);
      expect(spy.calls.argsFor(1)).toEqual([false]);
    });

    it('should NOT notify the listener when the value is unchanged', () => {
      const spy = jasmine.createSpy('listener');
      listenOnChange('performanceTrack', spy);

      // Assuming the default is `false`.
      config.set({performanceTrack: false});

      expect(spy).not.toHaveBeenCalled();
    });

    it('should only notify the listeners of the changed property', () => {
      const performanceTrackSpy = jasmine.createSpy('performanceTrack');
      const cdDataStreamSpy = jasmine.createSpy('cdDataStream');
      listenOnChange('performanceTrack', performanceTrackSpy);
      listenOnChange('cdDataStream', cdDataStreamSpy);

      config.set({cdDataStream: true});

      expect(cdDataStreamSpy).toHaveBeenCalledOnceWith(true);
      expect(performanceTrackSpy).not.toHaveBeenCalled();
    });

    it('should stop notifying a listener after unsubscribing', () => {
      const spy = jasmine.createSpy('listener');
      const unsubscribe = listenOnChange('performanceTrack', spy);

      config.set({performanceTrack: true});
      unsubscribe();
      config.set({performanceTrack: false});

      expect(spy).toHaveBeenCalledOnceWith(true);
    });
  });
});

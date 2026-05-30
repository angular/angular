/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {determineLongestAnimation} from '../../src/animation/longest_animation';
import {LongestAnimation} from '../../src/animation/interfaces';
import {isNode} from '@angular/private/testing';

describe('determineLongestAnimation', () => {
  if (isNode) {
    it('should pass', () => expect(true).toBe(true));
    return;
  }

  it('should immediately return if animations are not supported', () => {
    const el = document.createElement('div');
    const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();
    spyOn(el, 'getAnimations').and.returnValue([{}] as unknown as Animation[]);

    determineLongestAnimation(el, animationsMap, false);

    expect(animationsMap.has(el)).toBeFalse();
    expect(el.getAnimations).not.toHaveBeenCalled();
  });

  describe('with getAnimations() support', () => {
    it('should find the longest animation among multiple animations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'anim-1',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 500, delay: 100, iterations: 1}),
          },
        } as unknown as Animation,
        {
          animationName: 'anim-2',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 1000, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
        {
          animationName: 'anim-3',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 200, delay: 200, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      const longest = animationsMap.get(el);
      expect(longest).toEqual({animationName: 'anim-2', propertyName: undefined, duration: 1000});
    });

    it('should correctly identify CSSTransitions vs CSSAnimations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          transitionProperty: 'opacity',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 800, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      const longest = animationsMap.get(el);
      expect(longest).toEqual({animationName: undefined, propertyName: 'opacity', duration: 800});
    });

    it('should handle "auto" or undefined duration gracefully', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'bad-duration',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 'auto', delay: 200, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        animationName: 'bad-duration',
        propertyName: undefined,
        duration: 200,
      });
    });

    it('should skip animations with infinite iterations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'infinite-anim',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 1000, delay: 0, iterations: Infinity}),
          },
        } as unknown as Animation,
        {
          animationName: 'finite-anim',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 500, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        animationName: 'finite-anim',
        propertyName: undefined,
        duration: 500,
      });
    });

    it('should ignore animations if their duration is 0', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'no-duration',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 0, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      expect(animationsMap.has(el)).toBeFalse();
    });

    it('should not overwrite an existing longer animation in the map', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();
      animationsMap.set(el, {
        animationName: 'existing-long-anim',
        propertyName: undefined,
        duration: 2000,
      });

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'new-shorter-anim',
          playbackRate: 1,
          effect: {
            getTiming: () => ({duration: 1000, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);
      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        animationName: 'existing-long-anim',
        propertyName: undefined,
        duration: 2000,
      });
    });

    it('should account for playback rate when determining animation duration', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      // Mock an animation with a playbackRate of 2
      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'mock-anim',
          playbackRate: 2,
          effect: {
            getTiming: () => ({duration: 1000, delay: 0, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({animationName: 'mock-anim', propertyName: undefined, duration: 500});
    });

    it('should handle negative playback rates by taking the absolute value', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([
        {
          animationName: 'mock-anim',
          playbackRate: -0.5,
          effect: {
            getTiming: () => ({duration: 500, delay: 100, iterations: 1}),
          },
        } as unknown as Animation,
      ]);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        animationName: 'mock-anim',
        propertyName: undefined,
        duration: 1200,
      });
    });
  });

  describe('with getComputedStyle() fallback', () => {
    it('should calculate longest transition when there are no Element Animations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'opacity, transform';
          if (prop === 'transition-duration') return '0.5s, 800ms';
          if (prop === 'transition-delay') return '0s, 0.2s';
          if (prop === 'animation-name') return 'none';
          if (prop === 'animation-duration') return '0s';
          if (prop === 'animation-delay') return '0s';
          if (prop === 'animation-iteration-count') return '1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        propertyName: 'transform',
        animationName: undefined,
        duration: 1000,
      });
    });

    it('should calculate longest animation when there are no Element Animations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'all';
          if (prop === 'transition-duration') return '0s';
          if (prop === 'transition-delay') return '0s';
          if (prop === 'animation-name') return 'fade, slide';
          if (prop === 'animation-duration') return '500ms, 1s';
          if (prop === 'animation-delay') return '100ms, 0s';
          if (prop === 'animation-iteration-count') return '1, 1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({propertyName: undefined, animationName: 'slide', duration: 1000});
    });

    it('should pick longest animation between transition and keyframe animation', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'opacity';
          if (prop === 'transition-duration') return '1s';
          if (prop === 'transition-delay') return '0s';
          if (prop === 'animation-name') return 'fade';
          if (prop === 'animation-duration') return '500ms';
          if (prop === 'animation-delay') return '0s';
          if (prop === 'animation-iteration-count') return '1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({propertyName: 'opacity', animationName: undefined, duration: 1000});
    });

    it('should ignore computed infinite animations', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'all';
          if (prop === 'transition-duration') return '0s';
          if (prop === 'transition-delay') return '0s';
          if (prop === 'animation-name') return 'infinite-spin, slide';
          if (prop === 'animation-duration') return '10s, 1s';
          if (prop === 'animation-delay') return '0s, 0s';
          if (prop === 'animation-iteration-count') return 'infinite, 1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      // It should ignore the infinite one and pick slide (1s)
      expect(longest).toEqual({propertyName: undefined, animationName: 'slide', duration: 1000});
    });

    it('should not overwrite an existing longer animation with a computed style animation', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();
      animationsMap.set(el, {
        animationName: 'existing-long-anim',
        propertyName: undefined,
        duration: 2000,
      });

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'opacity';
          if (prop === 'transition-duration') return '1s';
          if (prop === 'transition-delay') return '0s';
          if (prop === 'animation-name') return 'none';
          if (prop === 'animation-duration') return '0s';
          if (prop === 'animation-delay') return '0s';
          if (prop === 'animation-iteration-count') return '1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({
        animationName: 'existing-long-anim',
        propertyName: undefined,
        duration: 2000,
      });
    });

    it('should ignore missing or 0 durations in computed styles', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'none';
          if (prop === 'transition-duration') return '0s';
          if (prop === 'transition-delay') return '0s';
          if (prop === 'animation-name') return 'none';
          if (prop === 'animation-duration') return '0s';
          if (prop === 'animation-delay') return '0s';
          if (prop === 'animation-iteration-count') return '1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      expect(animationsMap.has(el)).toBeFalse();
    });

    it('should parse ms and missing time units correctly', () => {
      const el = document.createElement('div');
      const animationsMap = new WeakMap<HTMLElement, LongestAnimation>();

      spyOn(el, 'getAnimations').and.returnValue([]);

      const computedStyle = {
        getPropertyValue: (prop: string) => {
          if (prop === 'transition-property') return 'all';
          if (prop === 'transition-duration') return '';
          if (prop === 'transition-delay') return '';
          if (prop === 'animation-name') return 'anim';
          if (prop === 'animation-duration') return '200ms';
          if (prop === 'animation-delay') return '0s';
          if (prop === 'animation-iteration-count') return '1';
          return '';
        },
      } as CSSStyleDeclaration;

      spyOn(window, 'getComputedStyle').and.returnValue(computedStyle);

      determineLongestAnimation(el, animationsMap, true);

      const longest = animationsMap.get(el);
      expect(longest).toEqual({propertyName: undefined, animationName: 'anim', duration: 200});
    });
  });
});

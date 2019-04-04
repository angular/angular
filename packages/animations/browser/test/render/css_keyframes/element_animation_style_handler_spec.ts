/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementAnimationStyleHandler, getAnimationStyle} from '../../../src/render/css_keyframes/element_animation_style_handler';
import {computeStyle} from '../../../src/util';
import {assertStyle, createElement, makeAnimationEvent, supportsAnimationEventCreation} from './shared';

const EMPTY_FN = () => {};
{
  describe('ElementAnimationStyleHandler', () => {
    if (isNode || typeof (window as any)['AnimationEvent'] == 'undefined') return;

    it('should add and remove an animation on to an element\'s styling', () => {
      const element = createElement();
      document.body.appendChild(element);

      const handler = new ElementAnimationStyleHandler(
          element, 'someAnimation', 1234, 999, 'ease-in', 'forwards', EMPTY_FN);

      assertStyle(element, 'animation-name', '');
      assertStyle(element, 'animation-duration', '');
      assertStyle(element, 'animation-delay', '');
      assertStyle(element, 'animation-timing-function', '');
      assertStyle(element, 'animation-fill-mode', '');

      handler.apply();

      assertStyle(element, 'animation-name', 'someAnimation');
      assertStyle(element, 'animation-duration', '1234ms');
      assertStyle(element, 'animation-delay', '999ms');
      assertStyle(element, 'animation-timing-function', 'ease-in');
      assertStyle(element, 'animation-fill-mode', 'forwards');

      handler.finish();

      assertStyle(element, 'animation-name', 'someAnimation');
      assertStyle(element, 'animation-duration', '1234ms');
      assertStyle(element, 'animation-delay', '999ms');
      assertStyle(element, 'animation-timing-function', 'ease-in');
      assertStyle(element, 'animation-fill-mode', 'forwards');

      handler.destroy();

      assertStyle(element, 'animation-name', '');
      assertStyle(element, 'animation-duration', '');
      assertStyle(element, 'animation-delay', '');
      assertStyle(element, 'animation-timing-function', '');
      assertStyle(element, 'animation-fill-mode', '');
    });

    it('should respect existing animation styling on an element', () => {
      const element = createElement();
      document.body.appendChild(element);

      element.style.setProperty('animation', 'fooAnimation 1s ease-out forwards');
      assertStyle(element, 'animation-name', 'fooAnimation');

      const handler = new ElementAnimationStyleHandler(
          element, 'barAnimation', 1234, 555, 'ease-out', 'both', EMPTY_FN);

      assertStyle(element, 'animation-name', 'fooAnimation');
      handler.apply();
      assertStyle(element, 'animation-name', 'fooAnimation, barAnimation');
      handler.destroy();
      assertStyle(element, 'animation-name', 'fooAnimation');
    });

    it('should respect animation styling that is prefixed after a handler is applied on an element',
       () => {
         const element = createElement();
         document.body.appendChild(element);

         const handler = new ElementAnimationStyleHandler(
             element, 'barAnimation', 1234, 555, 'ease-out', 'both', EMPTY_FN);

         assertStyle(element, 'animation-name', '');
         handler.apply();
         assertStyle(element, 'animation-name', 'barAnimation');

         const anim = element.style.animation;
         element.style.setProperty('animation', `${anim}, fooAnimation 1s ease-out forwards`);
         assertStyle(element, 'animation-name', 'barAnimation, fooAnimation');

         handler.destroy();
         assertStyle(element, 'animation-name', 'fooAnimation');
       });

    it('should respect animation styling that is suffixed after a handler is applied on an element',
       () => {
         const element = createElement();
         document.body.appendChild(element);

         const handler = new ElementAnimationStyleHandler(
             element, 'barAnimation', 1234, 555, 'ease-out', 'both', EMPTY_FN);

         assertStyle(element, 'animation-name', '');
         handler.apply();
         assertStyle(element, 'animation-name', 'barAnimation');

         const anim = element.style.animation;
         element.style.setProperty('animation', `fooAnimation 1s ease-out forwards, ${anim}`);
         assertStyle(element, 'animation-name', 'fooAnimation, barAnimation');

         handler.destroy();
         assertStyle(element, 'animation-name', 'fooAnimation');
       });

    it('should respect existing animation handlers on an element', () => {
      const element = createElement();
      document.body.appendChild(element);

      assertStyle(element, 'animation-name', '');

      const h1 = new ElementAnimationStyleHandler(
          element, 'fooAnimation', 1234, 333, 'ease-out', 'both', EMPTY_FN);
      h1.apply();

      assertStyle(element, 'animation-name', 'fooAnimation');
      assertStyle(element, 'animation-duration', '1234ms');
      assertStyle(element, 'animation-delay', '333ms');

      const h2 = new ElementAnimationStyleHandler(
          element, 'barAnimation', 5678, 666, 'ease-out', 'both', EMPTY_FN);
      h2.apply();

      assertStyle(element, 'animation-name', 'fooAnimation, barAnimation');
      assertStyle(element, 'animation-duration', '1234ms, 5678ms');
      assertStyle(element, 'animation-delay', '333ms, 666ms');

      const h3 = new ElementAnimationStyleHandler(
          element, 'bazAnimation', 90, 999, 'ease-out', 'both', EMPTY_FN);
      h3.apply();

      assertStyle(element, 'animation-name', 'fooAnimation, barAnimation, bazAnimation');
      assertStyle(element, 'animation-duration', '1234ms, 5678ms, 90ms');
      assertStyle(element, 'animation-delay', '333ms, 666ms, 999ms');

      h2.destroy();

      assertStyle(element, 'animation-name', 'fooAnimation, bazAnimation');
      assertStyle(element, 'animation-duration', '1234ms, 90ms');
      assertStyle(element, 'animation-delay', '333ms, 999ms');

      h1.destroy();

      assertStyle(element, 'animation-name', 'bazAnimation');
      assertStyle(element, 'animation-duration', '90ms');
      assertStyle(element, 'animation-delay', '999ms');
    });

    it('should fire the onDone method when .finish() is called on the handler', () => {
      const element = createElement();
      document.body.appendChild(element);

      let done = false;
      const handler = new ElementAnimationStyleHandler(
          element, 'fooAnimation', 1234, 333, 'ease-out', 'both', () => done = true);

      expect(done).toBeFalsy();
      handler.finish();
      expect(done).toBeTruthy();
    });

    it('should fire the onDone method only once when .finish() is called on the handler', () => {
      const element = createElement();
      document.body.appendChild(element);

      let doneCount = 0;
      const handler = new ElementAnimationStyleHandler(
          element, 'fooAnimation', 1234, 333, 'ease-out', 'both', () => doneCount++);

      expect(doneCount).toEqual(0);
      handler.finish();
      expect(doneCount).toEqual(1);
      handler.finish();
      expect(doneCount).toEqual(1);
    });

    it('should fire the onDone method when .destroy() is called on the handler', () => {
      const element = createElement();
      document.body.appendChild(element);

      let done = false;
      const handler = new ElementAnimationStyleHandler(
          element, 'fooAnimation', 1234, 333, 'ease-out', 'both', () => done = true);

      expect(done).toBeFalsy();
      handler.destroy();
      expect(done).toBeTruthy();
    });

    it('should fire the onDone method when the matching animationend event is emitted', () => {
      // IE11 cannot create an instanceof AnimationEvent
      if (!supportsAnimationEventCreation()) return;

      const element = createElement();
      document.body.appendChild(element);

      let done = false;
      const handler = new ElementAnimationStyleHandler(
          element, 'fooAnimation', 1234, 333, 'ease-out', 'both', () => done = true);

      expect(done).toBeFalsy();
      handler.apply();
      expect(done).toBeFalsy();

      let event = makeAnimationEvent('end', 'fooAnimation', 100);
      element.dispatchEvent(event);
      expect(done).toBeFalsy();

      event = makeAnimationEvent('end', 'fooAnimation', 1234);
      element.dispatchEvent(event);
      expect(done).toBeFalsy();

      const timestampAfterDelay = Date.now() + 500;

      event = makeAnimationEvent('end', 'fakeAnimation', 1234, timestampAfterDelay);
      element.dispatchEvent(event);
      expect(done).toBeFalsy();

      event = makeAnimationEvent('end', 'fooAnimation', 1234, timestampAfterDelay);
      element.dispatchEvent(event);
      expect(done).toBeTruthy();
    });

    // Issue: https://github.com/angular/angular/issues/24094
    it('should not break getAnimationStyle in old browsers', () => {
      // Old browsers like Chrome Android 34 returns null if element.style
      // is not found, modern browsers returns empty string.
      const fakeElement = {
        style: {
          'animationstyle1': 'value',
          'animationstyle2': null,
          'animationstyle3': '',
          'animation': null
        }
      };
      expect(getAnimationStyle(fakeElement, 'style1')).toBe('value');
      expect(getAnimationStyle(fakeElement, 'style2')).toBe('');
      expect(getAnimationStyle(fakeElement, 'style3')).toBe('');
      expect(getAnimationStyle(fakeElement, '')).toBe('');
    });
  });
}

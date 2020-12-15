/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {fakeAsync, flushMicrotasks} from '@angular/core/testing';

import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {CssKeyframesDriver} from '../../../src/render/css_keyframes/css_keyframes_driver';
import {CssKeyframesPlayer} from '../../../src/render/css_keyframes/css_keyframes_player';
import {DirectStylePlayer} from '../../../src/render/css_keyframes/direct_style_player';

import {assertElementExistsInDom, createElement, findKeyframeDefinition, forceReflow, makeAnimationEvent, supportsAnimationEventCreation} from './shared';

const CSS_KEYFRAME_RULE_TYPE = 7;

describe('CssKeyframesDriver tests', () => {
  if (isNode || typeof (window as any)['AnimationEvent'] == 'undefined') return;

  describe('building keyframes', () => {
    it('should build CSS keyframe style object containing the keyframe styles', () => {
      const elm = createElement();
      const animator = new CssKeyframesDriver();
      const kfElm = animator.buildKeyframeElement(elm, 'myKfAnim', [
        {opacity: 0, width: '0px', offset: 0},
        {opacity: 0.5, width: '100px', offset: 0.5},
        {opacity: 1, width: '200px', offset: 1},
      ]);

      const head = document.querySelector('head')!;
      head.appendChild(kfElm);
      forceReflow();

      const sheet = kfElm.sheet;
      const kfRule = findKeyframeDefinition(sheet);
      expect(kfRule.name).toEqual('myKfAnim');
      expect(kfRule.type).toEqual(CSS_KEYFRAME_RULE_TYPE);

      const keyframeCssRules = kfRule.cssRules;
      expect(keyframeCssRules.length).toEqual(3);

      const [from, mid, to] = keyframeCssRules;
      expect(from.keyText).toEqual('0%');
      expect(mid.keyText).toEqual('50%');
      expect(to.keyText).toEqual('100%');

      const fromStyles = from.style;
      expect(fromStyles.opacity).toEqual('0');
      expect(fromStyles.width).toEqual('0px');

      const midStyles = mid.style;
      expect(midStyles.opacity).toEqual('0.5');
      expect(midStyles.width).toEqual('100px');

      const toStyles = to.style;
      expect(toStyles.opacity).toEqual('1');
      expect(toStyles.width).toEqual('200px');
    });

    it('should convert numeric values into px-suffixed data', () => {
      const elm = createElement();
      const animator = new CssKeyframesDriver();
      const kfElm = animator.buildKeyframeElement(elm, 'myKfAnim', [
        {width: '0px', offset: 0},
        {width: '100px', offset: 0.5},
        {width: '200px', offset: 1},
      ]);

      const head = document.querySelector('head')!;
      head.appendChild(kfElm);
      forceReflow();

      const sheet = kfElm.sheet;
      const kfRule = findKeyframeDefinition(sheet);
      const keyframeCssRules = kfRule.cssRules;
      const [from, mid, to] = keyframeCssRules;

      expect(from.style.width).toEqual('0px');
      expect(mid.style.width).toEqual('100px');
      expect(to.style.width).toEqual('200px');
    });
  });

  describe('when animating', () => {
    it('should set an animation on the element that matches the generated animation', () => {
      const elm = createElement();
      const animator = new CssKeyframesDriver();
      const player = animator.animate(
          elm,
          [
            {width: '0px', offset: 0},
            {width: '200px', offset: 1},
          ],
          1234, 0, 'ease-out');

      const sheet: any = document.styleSheets[document.styleSheets.length - 1];
      const kfRule = findKeyframeDefinition(sheet);

      player.init();
      const {animationName, duration, easing} = parseElementAnimationStyle(elm);
      expect(animationName).toEqual(kfRule.name);
      expect(duration).toEqual(1234);
      expect(easing).toEqual('ease-out');
    });

    it('should animate until the `animationend` method is emitted, but still retain the <style> method and the element animation details',
       fakeAsync(() => {
         // IE11 cannot create an instanceof AnimationEvent
         if (!supportsAnimationEventCreation()) return;

         const elm = createElement();
         const animator = new CssKeyframesDriver();

         assertExistingAnimationDuration(elm, 0);
         const player = <CssKeyframesPlayer>animator.animate(
             elm,
             [
               {width: '0px', offset: 0},
               {width: '200px', offset: 1},
             ],
             1234, 0, 'ease-out');

         const matchingStyleElm = findStyleObjectWithKeyframes();

         player.play();
         assertExistingAnimationDuration(elm, 1234);
         assertElementExistsInDom(matchingStyleElm, true);

         let completed = false;
         player.onDone(() => completed = true);
         expect(completed).toBeFalsy();

         flushMicrotasks();
         expect(completed).toBeFalsy();

         const event = makeAnimationEvent('end', player.animationName, 1234);
         elm.dispatchEvent(event);

         flushMicrotasks();
         expect(completed).toBeTruthy();

         assertExistingAnimationDuration(elm, 1234);
         assertElementExistsInDom(matchingStyleElm, true);
       }));

    it('should animate until finish() is called, but still retain the <style> method and the element animation details',
       fakeAsync(() => {
         const elm = createElement();
         const animator = new CssKeyframesDriver();

         assertExistingAnimationDuration(elm, 0);
         const player = animator.animate(
             elm,
             [
               {width: '0px', offset: 0},
               {width: '200px', offset: 1},
             ],
             1234, 0, 'ease-out');

         const matchingStyleElm = findStyleObjectWithKeyframes();

         player.play();
         assertExistingAnimationDuration(elm, 1234);
         assertElementExistsInDom(matchingStyleElm, true);

         let completed = false;
         player.onDone(() => completed = true);
         expect(completed).toBeFalsy();

         flushMicrotasks();
         expect(completed).toBeFalsy();

         player.finish();

         flushMicrotasks();
         expect(completed).toBeTruthy();

         assertExistingAnimationDuration(elm, 1234);
         assertElementExistsInDom(matchingStyleElm, true);
       }));

    it('should animate until the destroy method is called and cleanup the element animation details',
       fakeAsync(() => {
         const elm = createElement();
         const animator = new CssKeyframesDriver();

         assertExistingAnimationDuration(elm, 0);
         const player = animator.animate(
             elm,
             [
               {width: '0px', offset: 0},
               {width: '200px', offset: 1},
             ],
             1234, 0, 'ease-out');

         player.play();
         assertExistingAnimationDuration(elm, 1234);

         let completed = false;
         player.onDone(() => completed = true);

         flushMicrotasks();
         expect(completed).toBeFalsy();

         player.destroy();
         flushMicrotasks();
         expect(completed).toBeTruthy();

         assertExistingAnimationDuration(elm, 0);
       }));

    it('should return an instance of a direct style player if an animation has a duration of 0',
       () => {
         const elm = createElement();
         const animator = new CssKeyframesDriver();

         assertExistingAnimationDuration(elm, 0);
         const player = animator.animate(
             elm,
             [
               {width: '0px', offset: 0},
               {width: '200px', offset: 1},
             ],
             0, 0, 'ease-out');
         expect(player instanceof DirectStylePlayer).toBeTruthy();
       });

    it('should cleanup the associated <style> object when the animation is destroyed',
       fakeAsync(() => {
         const elm = createElement();
         const animator = new CssKeyframesDriver();

         const player = animator.animate(
             elm,
             [
               {width: '0px', offset: 0},
               {width: '200px', offset: 1},
             ],
             1234, 0, 'ease-out');

         player.play();
         const matchingStyleElm = findStyleObjectWithKeyframes();
         assertElementExistsInDom(matchingStyleElm, true);

         player.destroy();
         flushMicrotasks();
         assertElementExistsInDom(matchingStyleElm, false);
       }));

    it('should return the final styles when capture() is called', () => {
      const elm = createElement();
      const animator = new CssKeyframesDriver();
      const player = <CssKeyframesPlayer>animator.animate(
          elm,
          [
            {color: 'red', width: '111px', height: '111px', offset: 0},
            {color: 'blue', height: '999px', width: '999px', offset: 1},
          ],
          2000, 0, 'ease-out');

      player.play();
      player.finish();
      player.beforeDestroy!();
      expect(player.currentSnapshot).toEqual({
        width: '999px',
        height: '999px',
        color: 'blue',
      });
    });

    it('should return the intermediate styles when capture() is called in the middle of the animation',
       () => {
         const elm = createElement();
         document.body.appendChild(elm);  // this is required so GCS works

         const animator = new CssKeyframesDriver();
         const player = <CssKeyframesPlayer>animator.animate(
             elm,
             [
               {width: '0px', height: '0px', offset: 0},
               {height: '100px', width: '100px', offset: 1},
             ],
             2000, 0, 'ease-out');

         player.play();
         player.setPosition(0.5);
         player.beforeDestroy();
         const result = player.currentSnapshot;
         expect(parseFloat(result['width'])).toBeGreaterThan(0);
         expect(parseFloat(result['height'])).toBeGreaterThan(0);
       });

    it('should capture existing keyframe player styles in and merge in the styles into the follow up player\'s keyframes',
       () => {
         // IE cannot modify the position of an animation...
         // note that this feature is only for testing purposes
         if (browserDetection.isIE) return;

         const elm = createElement();
         elm.style.border = '1px solid black';
         document.body.appendChild(elm);  // this is required so GCS works

         const animator = new CssKeyframesDriver();
         const p1 = <CssKeyframesPlayer>animator.animate(
             elm,
             [
               {width: '0px', lineHeight: '20px', offset: 0},
               {width: '100px', lineHeight: '50px', offset: 1},
             ],
             2000, 0, 'ease-out');

         const p2 = <CssKeyframesPlayer>animator.animate(
             elm,
             [
               {height: '100px', offset: 0},
               {height: '300px', offset: 1},
             ],
             2000, 0, 'ease-out');

         p1.play();
         p1.setPosition(0.5);
         p1.beforeDestroy();
         p2.play();
         p2.setPosition(0.5);
         p2.beforeDestroy();

         const p3 = <CssKeyframesPlayer>animator.animate(
             elm,
             [
               {height: '0px', width: '0px', offset: 0},
               {height: '400px', width: '400px', offset: 0.5},
               {height: '500px', width: '500px', offset: 1},
             ],
             2000, 0, 'ease-out', [p1, p2]);

         p3.init();
         const [k1, k2, k3] = p3.keyframes;

         const offset = k1.offset;
         expect(offset).toEqual(0);

         const width = parseInt(k1['width'] as string);
         expect(width).toBeGreaterThan(0);
         expect(width).toBeLessThan(100);

         const bWidth = parseInt(k1['lineHeight'] as string);
         expect(bWidth).toBeGreaterThan(20);
         expect(bWidth).toBeLessThan(50);

         const height = parseFloat(k1['height'] as string);
         expect(height).toBeGreaterThan(100);
         expect(height).toBeLessThan(300);

         // since the lineHeight wasn't apart of the follow-up animation,
         // it's values were copied over into all the keyframes
         const b1 = bWidth;
         const b2 = parseInt(k2['lineHeight'] as string);
         const b3 = parseInt(k3['lineHeight'] as string);
         expect(b1).toEqual(b2);
         expect(b2).toEqual(b3);

         // we delete the lineHeight values because they are float-based
         // and each browser has a different value based on precision...
         // therefore we can't assert it directly below (asserting it above
         // on the first keyframe was all that was needed since they are the same)
         delete k2['lineHeight'];
         delete k3['lineHeight'];
         expect(k2).toEqual({width: '400px', height: '400px', offset: 0.5});
         expect(k3).toEqual({width: '500px', height: '500px', offset: 1});
       });

    if (browserDetection.supportsShadowDom) {
      it('should append <style> in shadow DOM root element', fakeAsync(() => {
           const hostElement = createElement();
           const shadowRoot = hostElement.attachShadow({mode: 'open'});
           const elementToAnimate = createElement();
           shadowRoot.appendChild(elementToAnimate);
           const animator = new CssKeyframesDriver();

           assertExistingAnimationDuration(elementToAnimate, 0);
           expect(shadowRoot.querySelector('style')).toBeFalsy();

           const player = animator.animate(
               elementToAnimate,
               [
                 {width: '0px', offset: 0},
                 {width: '200px', offset: 1},
               ],
               1234, 0, 'ease-out');

           player.play();

           assertExistingAnimationDuration(elementToAnimate, 1234);
           assertElementExistsInDom(shadowRoot.querySelector('style'), true);
         }));
    }
  });
});

function assertExistingAnimationDuration(element: any, duration: number) {
  expect(parseElementAnimationStyle(element).duration).toEqual(duration);
}

function findStyleObjectWithKeyframes(): any|null {
  const sheetWithKeyframes = document.styleSheets[document.styleSheets.length - 1];
  const styleElms = Array.from(document.querySelectorAll('head style') as any as any[]);
  return styleElms.find(elm => elm.sheet == sheetWithKeyframes) || null;
}

function parseElementAnimationStyle(element: any):
    {duration: number, delay: number, easing: string, animationName: string} {
  const style = element.style;
  const duration = parseInt(style.animationDuration || 0);
  const delay = style.animationDelay;
  const easing = style.animationTimingFunction;
  const animationName = style.animationName;
  return {duration, delay, easing, animationName};
}

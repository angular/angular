/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {state, style, trigger} from '@angular/animations';
import {ɵNoopAnimationEngine as NoopAnimationEngine} from '@angular/animations/browser';
import {el} from '@angular/platform-browser/testing/src/browser_util';

export function main() {
  describe('NoopAnimationEngine', () => {
    let captures: string[] = [];
    function capture(value?: string) { return (v: any = null) => captures.push(value || v); }

    beforeEach(() => { captures = []; });

    it('should immediately issue DOM removals during remove animations and then fire the animation callbacks after flush',
       () => {
         const engine = new NoopAnimationEngine();

         const elm1 = {nodeType: 1};
         const elm2 = {nodeType: 1};
         engine.onRemove(elm1, capture('1'));
         engine.onRemove(elm2, capture('2'));

         engine.listen(elm1, 'trig', 'start', capture('1-start'));
         engine.listen(elm2, 'trig', 'start', capture('2-start'));
         engine.listen(elm1, 'trig', 'done', capture('1-done'));
         engine.listen(elm2, 'trig', 'done', capture('2-done'));

         expect(captures).toEqual(['1', '2']);
         engine.flush();

         expect(captures).toEqual(['1', '2', '1-start', '2-start', '1-done', '2-done']);
       });

    it('should only fire the `start` listener for a trigger that has had a property change', () => {
      const engine = new NoopAnimationEngine();

      const elm1 = {};
      const elm2 = {};
      const elm3 = {};

      engine.listen(elm1, 'trig1', 'start', capture());
      engine.setProperty(elm1, 'trig1', 'cool');
      engine.setProperty(elm2, 'trig2', 'sweet');
      engine.listen(elm2, 'trig2', 'start', capture());
      engine.listen(elm3, 'trig3', 'start', capture());

      expect(captures).toEqual([]);
      engine.flush();

      expect(captures.length).toEqual(2);
      const trig1Data = captures.shift();
      const trig2Data = captures.shift();
      expect(trig1Data).toEqual({
        element: elm1,
        triggerName: 'trig1',
        fromState: 'void',
        toState: 'cool',
        phaseName: 'start',
        totalTime: 0
      });

      expect(trig2Data).toEqual({
        element: elm2,
        triggerName: 'trig2',
        fromState: 'void',
        toState: 'sweet',
        phaseName: 'start',
        totalTime: 0
      });

      captures = [];
      engine.flush();
      expect(captures).toEqual([]);
    });

    it('should only fire the `done` listener for a trigger that has had a property change', () => {
      const engine = new NoopAnimationEngine();

      const elm1 = {};
      const elm2 = {};
      const elm3 = {};

      engine.listen(elm1, 'trig1', 'done', capture());
      engine.setProperty(elm1, 'trig1', 'awesome');
      engine.setProperty(elm2, 'trig2', 'amazing');
      engine.listen(elm2, 'trig2', 'done', capture());
      engine.listen(elm3, 'trig3', 'done', capture());

      expect(captures).toEqual([]);
      engine.flush();

      expect(captures.length).toEqual(2);
      const trig1Data = captures.shift();
      const trig2Data = captures.shift();
      expect(trig1Data).toEqual({
        element: elm1,
        triggerName: 'trig1',
        fromState: 'void',
        toState: 'awesome',
        phaseName: 'done',
        totalTime: 0
      });

      expect(trig2Data).toEqual({
        element: elm2,
        triggerName: 'trig2',
        fromState: 'void',
        toState: 'amazing',
        phaseName: 'done',
        totalTime: 0
      });

      captures = [];
      engine.flush();
      expect(captures).toEqual([]);
    });

    it('should deregister a listener when the return function is called, but only after flush',
       () => {
         const engine = new NoopAnimationEngine();
         const elm = {};

         const fn1 = engine.listen(elm, 'trig1', 'start', capture('trig1-start'));
         const fn2 = engine.listen(elm, 'trig2', 'done', capture('trig2-done'));

         engine.setProperty(elm, 'trig1', 'value1');
         engine.setProperty(elm, 'trig2', 'value2');
         engine.flush();
         expect(captures).toEqual(['trig1-start', 'trig2-done']);

         captures = [];
         engine.setProperty(elm, 'trig1', 'value3');
         engine.setProperty(elm, 'trig2', 'value4');

         fn1();
         engine.flush();
         expect(captures).toEqual(['trig1-start', 'trig2-done']);

         captures = [];
         engine.setProperty(elm, 'trig1', 'value5');
         engine.setProperty(elm, 'trig2', 'value6');

         fn2();
         engine.flush();
         expect(captures).toEqual(['trig2-done']);

         captures = [];
         engine.setProperty(elm, 'trig1', 'value7');
         engine.setProperty(elm, 'trig2', 'value8');
         engine.flush();
         expect(captures).toEqual([]);
       });

    it('should fire a removal listener even if the listener is deregistered prior to flush', () => {
      const engine = new NoopAnimationEngine();
      const elm = {nodeType: 1};

      const fn = engine.listen(elm, 'trig', 'start', capture('removal listener'));
      fn();

      engine.onRemove(elm, capture('dom removal'));
      engine.flush();

      expect(captures).toEqual(['dom removal', 'removal listener']);
    });

    describe('styling', () => {
      // these tests are only mean't to be run within the DOM
      if (typeof Element == 'undefined') return;

      it('should persist the styles on the element when the animation is complete', () => {
        const engine = new NoopAnimationEngine();
        engine.registerTrigger(trigger('matias', [
          state('a', style({width: '100px'})),
        ]));

        const element = el('<div></div>');
        expect(element.style.width).not.toEqual('100px');

        engine.setProperty(element, 'matias', 'a');
        expect(element.style.width).not.toEqual('100px');

        engine.flush();
        expect(element.style.width).toEqual('100px');
      });

      it('should remove previously persist styles off of the element when a follow-up animation starts',
         () => {
           const engine = new NoopAnimationEngine();
           engine.registerTrigger(trigger('matias', [
             state('a', style({width: '100px'})),
             state('b', style({height: '100px'})),
           ]));

           const element = el('<div></div>');

           engine.setProperty(element, 'matias', 'a');
           engine.flush();
           expect(element.style.width).toEqual('100px');

           engine.setProperty(element, 'matias', 'b');
           expect(element.style.width).not.toEqual('100px');
           expect(element.style.height).not.toEqual('100px');

           engine.flush();
           expect(element.style.height).toEqual('100px');
         });

      it('should fall back to `*` styles incase the target state styles are not found', () => {
        const engine = new NoopAnimationEngine();
        engine.registerTrigger(trigger('matias', [
          state('*', style({opacity: '0.5'})),
        ]));

        const element = el('<div></div>');

        engine.setProperty(element, 'matias', 'xyz');
        engine.flush();
        expect(element.style.opacity).toEqual('0.5');
      });
    });
  });
}

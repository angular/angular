/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationTriggerMetadata, state, style, trigger} from '@angular/animations';
import {ɵNoopAnimationEngine as NoopAnimationEngine} from '@angular/animations/browser';
import {NoopAnimationStyleNormalizer} from '@angular/animations/browser/src/dsl/style_normalization/animation_style_normalizer';
import {MockAnimationDriver} from '@angular/animations/browser/testing';
import {el} from '@angular/platform-browser/testing/src/browser_util';

import {TriggerAst} from '../../../animations/browser/src/dsl/animation_ast';
import {buildAnimationAst} from '../../../animations/browser/src/dsl/animation_ast_builder';
import {buildTrigger} from '../../../animations/browser/src/dsl/animation_trigger';

const DEFAULT_NAMESPACE_ID = 'id';
const DEFAULT_COMPONENT_ID = '1';

export function main() {
  describe('NoopAnimationEngine', () => {
    let captures: string[] = [];
    function capture(value?: string) { return (v: any = null) => captures.push(value || v); }

    beforeEach(() => { captures = []; });

    function makeEngine() {
      const driver = new MockAnimationDriver();
      const normalizer = new NoopAnimationStyleNormalizer();
      return new NoopAnimationEngine(driver, normalizer);
    }

    it('should immediately issue DOM removals during remove animations and then fire the animation callbacks after flush',
       () => {
         const engine = makeEngine();
         const capture1 = capture('1');
         const capture2 = capture('2');
         engine.onRemovalComplete = (element: any, context: any) => {
           switch (context as string) {
             case '1':
               capture1();
               break;
             case '2':
               capture2();
               break;
           }
         };

         const elm1 = {nodeType: 1};
         const elm2 = {nodeType: 1};
         engine.onRemove(DEFAULT_NAMESPACE_ID, elm1, '1');
         engine.onRemove(DEFAULT_NAMESPACE_ID, elm2, '2');

         listen(elm1, engine, 'trig', 'start', capture('1-start'));
         listen(elm2, engine, 'trig', 'start', capture('2-start'));
         listen(elm1, engine, 'trig', 'done', capture('1-done'));
         listen(elm2, engine, 'trig', 'done', capture('2-done'));

         expect(captures).toEqual(['1', '2']);
         engine.flush();

         expect(captures).toEqual(['1', '2', '1-start', '2-start', '1-done', '2-done']);
       });

    it('should only fire the `start` listener for a trigger that has had a property change', () => {
      const engine = makeEngine();

      const elm1 = {};
      const elm2 = {};
      const elm3 = {};

      listen(elm1, engine, 'trig1', 'start', capture());
      setProperty(elm1, engine, 'trig1', 'cool');
      setProperty(elm2, engine, 'trig2', 'sweet');
      listen(elm2, engine, 'trig2', 'start', capture());
      listen(elm3, engine, 'trig3', 'start', capture());

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
      const engine = makeEngine();

      const elm1 = {};
      const elm2 = {};
      const elm3 = {};

      listen(elm1, engine, 'trig1', 'done', capture());
      setProperty(elm1, engine, 'trig1', 'awesome');
      setProperty(elm2, engine, 'trig2', 'amazing');
      listen(elm2, engine, 'trig2', 'done', capture());
      listen(elm3, engine, 'trig3', 'done', capture());

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
         const engine = makeEngine();
         const elm = {};

         const fn1 = listen(elm, engine, 'trig1', 'start', capture('trig1-start'));
         const fn2 = listen(elm, engine, 'trig2', 'done', capture('trig2-done'));

         setProperty(elm, engine, 'trig1', 'value1');
         setProperty(elm, engine, 'trig2', 'value2');
         engine.flush();
         expect(captures).toEqual(['trig1-start', 'trig2-done']);

         captures = [];
         setProperty(elm, engine, 'trig1', 'value3');
         setProperty(elm, engine, 'trig2', 'value4');

         fn1();
         engine.flush();
         expect(captures).toEqual(['trig1-start', 'trig2-done']);

         captures = [];
         setProperty(elm, engine, 'trig1', 'value5');
         setProperty(elm, engine, 'trig2', 'value6');

         fn2();
         engine.flush();
         expect(captures).toEqual(['trig2-done']);

         captures = [];
         setProperty(elm, engine, 'trig1', 'value7');
         setProperty(elm, engine, 'trig2', 'value8');
         engine.flush();
         expect(captures).toEqual([]);
       });

    it('should fire a removal listener even if the listener is deregistered prior to flush', () => {
      const engine = makeEngine();
      const elm = {nodeType: 1};
      engine.onRemovalComplete = (element: any, context: string) => { capture(context)(); };

      const fn = listen(elm, engine, 'trig', 'start', capture('removal listener'));
      fn();

      engine.onRemove(DEFAULT_NAMESPACE_ID, elm, 'dom removal');
      engine.flush();

      expect(captures).toEqual(['dom removal', 'removal listener']);
    });

    describe('styling', () => {
      // these tests are only mean't to be run within the DOM
      if (typeof Element == 'undefined') return;

      it('should persist the styles on the element when the animation is complete', () => {
        const engine = makeEngine();
        const element = el('<div></div>');
        registerTrigger(element, engine, trigger('matias', [
                          state('a', style({width: '100px'})),
                        ]));

        expect(element.style.width).not.toEqual('100px');

        setProperty(element, engine, 'matias', 'a');
        expect(element.style.width).not.toEqual('100px');

        engine.flush();
        expect(element.style.width).toEqual('100px');
      });

      it('should remove previously persist styles off of the element when a follow-up animation starts',
         () => {
           const engine = makeEngine();
           const element = el('<div></div>');

           registerTrigger(element, engine, trigger('matias', [
                             state('a', style({width: '100px'})),
                             state('b', style({height: '100px'})),
                           ]));

           setProperty(element, engine, 'matias', 'a');
           engine.flush();
           expect(element.style.width).toEqual('100px');

           setProperty(element, engine, 'matias', 'b');
           expect(element.style.width).not.toEqual('100px');
           expect(element.style.height).not.toEqual('100px');

           engine.flush();
           expect(element.style.height).toEqual('100px');
         });

      it('should fall back to `*` styles incase the target state styles are not found', () => {
        const engine = makeEngine();
        const element = el('<div></div>');

        registerTrigger(element, engine, trigger('matias', [
                          state('*', style({opacity: '0.5'})),
                        ]));

        setProperty(element, engine, 'matias', 'xyz');
        engine.flush();
        expect(element.style.opacity).toEqual('0.5');
      });
    });
  });
}

function registerTrigger(
    element: any, engine: NoopAnimationEngine, metadata: AnimationTriggerMetadata,
    namespaceId: string = DEFAULT_NAMESPACE_ID, componentId: string = DEFAULT_COMPONENT_ID) {
  engine.registerTrigger(componentId, namespaceId, element, name, metadata)
}

function setProperty(
    element: any, engine: NoopAnimationEngine, property: string, value: any,
    id: string = DEFAULT_NAMESPACE_ID) {
  engine.setProperty(id, element, property, value);
}

function listen(
    element: any, engine: NoopAnimationEngine, eventName: string, phaseName: string,
    callback: (event: any) => any, id: string = DEFAULT_NAMESPACE_ID) {
  return engine.listen(id, element, eventName, phaseName, callback);
}

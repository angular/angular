/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵNoOpAnimationPlayer} from '@angular/core';
import {el} from '@angular/platform-browser/testing/browser_util';

import {animate, keyframes, state, style, transition} from '../../src/dsl/animation_metadata';
import {buildAnimationKeyframes} from '../../src/dsl/animation_timeline_visitor';
import {trigger} from '../../src/dsl/animation_trigger';
import {AnimationStyleNormalizer, NoOpAnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {AnimationEngineInstruction} from '../../src/engine/animation_engine_instruction';
import {DomAnimationTransitionEngine} from '../../src/engine/dom_animation_transition_engine';
import {MockAnimationDriver, MockAnimationPlayer} from '../../testing/mock_animation_driver';

export function main() {
  const driver = new MockAnimationDriver();

  // these tests are only mean't to be run within the DOM
  if (typeof Element == 'undefined') return;

  describe('AnimationEngine', () => {
    let element: any;

    beforeEach(() => {
      MockAnimationDriver.log = [];
      element = el('<div></div>');
    });

    function makeEngine(normalizer: AnimationStyleNormalizer = null) {
      return new DomAnimationTransitionEngine(
          driver, normalizer || new NoOpAnimationStyleNormalizer());
    }

    describe('instructions', () => {
      it('should animate a transition instruction', () => {
        const engine = makeEngine();

        const trig = trigger('something', [
          state('on', style({height: 100})), state('off', style({height: 0})),
          transition('on => off', animate(9876))
        ]);

        const instruction = trig.matchTransition('on', 'off');

        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.process(element, [instruction]);
        expect(MockAnimationDriver.log.length).toEqual(1);
      });

      it('should animate a timeline instruction', () => {
        const engine = makeEngine();

        const timelines =
            buildAnimationKeyframes([style({height: 100}), animate(1000, style({height: 0}))]);

        const instruction = timelines[0];
        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.process(element, [instruction]);
        expect(MockAnimationDriver.log.length).toEqual(1);
      });

      it('should animate an array of animation instructions', () => {
        const engine = makeEngine();

        const instructions = buildAnimationKeyframes([
          style({height: 100}), animate(1000, style({height: 0})),
          animate(1000, keyframes([style({width: 0}), style({width: 1000})]))
        ]);

        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.process(element, instructions);
        expect(MockAnimationDriver.log.length).toBeGreaterThan(0);
      });

      it('should return a noOp player when an unsupported instruction is provided', () => {
        const engine = makeEngine();
        const instruction = <AnimationEngineInstruction>{type: -1};
        expect(MockAnimationDriver.log.length).toEqual(0);
        const player = engine.process(element, [instruction]);
        expect(MockAnimationDriver.log.length).toEqual(0);
        expect(player instanceof ɵNoOpAnimationPlayer).toBeTruthy();
      });
    });

    describe('transition operations', () => {
      it('should persist the styles on the element as actual styles once the animation is complete',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('on', style({height: '100px'})), state('off', style({height: '0px'})),
             transition('on => off', animate(9876))
           ]);

           const instruction = trig.matchTransition('on', 'off');
           const player = engine.process(element, [instruction]);

           expect(element.style.height).not.toEqual('0px');
           player.finish();
           expect(element.style.height).toEqual('0px');
         });

      it('should remove all existing state styling from an element when a follow-up transition occurs on the same trigger',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('a', style({height: '100px'})), state('b', style({height: '500px'})),
             state('c', style({width: '200px'})), transition('* => *', animate(9876))
           ]);

           const instruction1 = trig.matchTransition('a', 'b');
           const player1 = engine.process(element, [instruction1]);

           player1.finish();
           expect(element.style.height).toEqual('500px');

           const instruction2 = trig.matchTransition('b', 'c');
           const player2 = engine.process(element, [instruction2]);

           expect(element.style.height).not.toEqual('500px');
           player2.finish();
           expect(element.style.width).toEqual('200px');
           expect(element.style.height).not.toEqual('500px');
         });

      it('should allow two animation transitions with different triggers to animate in parallel',
         () => {
           const engine = makeEngine();
           const trig1 = trigger('something1', [
             state('a', style({width: '100px'})), state('b', style({width: '200px'})),
             transition('* => *', animate(1000))
           ]);

           const trig2 = trigger('something2', [
             state('x', style({height: '500px'})), state('y', style({height: '1000px'})),
             transition('* => *', animate(2000))
           ]);

           let doneCount = 0;
           function doneCallback() { doneCount++; }

           const instruction1 = trig1.matchTransition('a', 'b');
           const instruction2 = trig2.matchTransition('x', 'y');
           const player1 = engine.process(element, [instruction1]);
           player1.onDone(doneCallback);
           expect(doneCount).toEqual(0);

           const player2 = engine.process(element, [instruction2]);
           player2.onDone(doneCallback);
           expect(doneCount).toEqual(0);

           player1.finish();
           expect(doneCount).toEqual(1);

           player2.finish();
           expect(doneCount).toEqual(2);

           expect(element.style.width).toEqual('200px');
           expect(element.style.height).toEqual('1000px');
         });

      it('should cancel a previously running animation when a follow-up transition kicks off on the same trigger',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('x', style({opacity: 0})), state('y', style({opacity: .5})),
             state('z', style({opacity: 1})), transition('* => *', animate(1000))
           ]);

           const instruction1 = trig.matchTransition('x', 'y');
           const instruction2 = trig.matchTransition('y', 'z');

           expect(parseFloat(element.style.opacity)).not.toEqual(.5);

           const player1 = engine.process(element, [instruction1]);
           const player2 = engine.process(element, [instruction2]);

           expect(parseFloat(element.style.opacity)).toEqual(.5);

           player2.finish();
           expect(parseFloat(element.style.opacity)).toEqual(1);

           player1.finish();
           expect(parseFloat(element.style.opacity)).toEqual(1);
         });

      it('should pass in the previously running players into the follow-up transition player when cancelled',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('x', style({opacity: 0})), state('y', style({opacity: .5})),
             state('z', style({opacity: 1})), transition('* => *', animate(1000))
           ]);

           const instruction1 = trig.matchTransition('x', 'y');
           const instruction2 = trig.matchTransition('y', 'z');
           const instruction3 = trig.matchTransition('z', 'x');

           const player1 = engine.process(element, [instruction1]);
           engine.triggerAnimations();
           player1.setPosition(0.5);

           const player2 = <MockAnimationPlayer>engine.process(element, [instruction2]);
           expect(player2.previousPlayers).toEqual([player1]);
           player2.finish();

           const player3 = <MockAnimationPlayer>engine.process(element, [instruction3]);
           expect(player3.previousPlayers).toEqual([]);
         });

      it('should cancel all existing players if a removal animation is set to occur', () => {
        const engine = makeEngine();
        const trig = trigger('something', [
          state('m', style({opacity: 0})), state('n', style({opacity: 1})),
          transition('* => *', animate(1000))
        ]);

        let doneCount = 0;
        function doneCallback() { doneCount++; }

        const instruction1 = trig.matchTransition('m', 'n');
        const instructions2 =
            buildAnimationKeyframes([style({height: 0}), animate(1000, style({height: 100}))]);
        const instruction3 = trig.matchTransition('n', 'void');

        const player1 = engine.process(element, [instruction1]);
        player1.onDone(doneCallback);

        const player2 = engine.process(element, instructions2);
        player2.onDone(doneCallback);

        expect(doneCount).toEqual(0);

        const player3 = engine.process(element, [instruction3]);
        expect(doneCount).toEqual(2);
      });

      it('should only persist styles that exist in the final state styles and not the last keyframe',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('0', style({width: '0px'})), state('1', style({width: '100px'})),
             transition('* => *', [animate(1000, style({height: '200px'}))])
           ]);

           const instruction = trig.matchTransition('0', '1');
           const player = engine.process(element, [instruction]);
           expect(element.style.width).not.toEqual('100px');

           player.finish();
           expect(element.style.height).not.toEqual('200px');
           expect(element.style.width).toEqual('100px');
         });

      it('should default to using styling from the `*` state if a matching state is not found',
         () => {
           const engine = makeEngine();
           const trig = trigger('something', [
             state('a', style({opacity: 0})), state('*', style({opacity: .5})),
             transition('* => *', animate(1000))
           ]);

           const instruction = trig.matchTransition('a', 'z');
           engine.process(element, [instruction]).finish();

           expect(parseFloat(element.style.opacity)).toEqual(.5);
         });

      it('should treat `void` as `void`', () => {
        const engine = makeEngine();
        const trig = trigger('something', [
          state('a', style({opacity: 0})), state('void', style({opacity: .8})),
          transition('* => *', animate(1000))
        ]);

        const instruction = trig.matchTransition('a', 'void');
        engine.process(element, [instruction]).finish();

        expect(parseFloat(element.style.opacity)).toEqual(.8);
      });
    });

    describe('timeline operations', () => {
      it('should not destroy timeline-based animations after they have finished', () => {
        const engine = makeEngine();

        const log: string[] = [];
        function capture(value: string) {
          return () => { log.push(value); };
        }

        const instructions =
            buildAnimationKeyframes([style({height: 0}), animate(1000, style({height: 500}))]);

        const player = engine.process(element, instructions);
        player.onDone(capture('done'));
        player.onDestroy(capture('destroy'));
        expect(log).toEqual([]);

        player.finish();
        expect(log).toEqual(['done']);

        player.destroy();
        expect(log).toEqual(['done', 'destroy']);
      });
    });

    describe('style normalizer', () => {
      it('should normalize the style values that are processed within an a transition animation',
         () => {
           const engine = makeEngine(new SuffixNormalizer('-normalized'));

           const trig = trigger('something', [
             state('on', style({height: 100})), state('off', style({height: 0})),
             transition('on => off', animate(9876))
           ]);

           const instruction = trig.matchTransition('on', 'off');
           const player = <MockAnimationPlayer>engine.process(element, [instruction]);

           expect(player.keyframes).toEqual([
             {'height-normalized': '100-normalized', offset: 0},
             {'height-normalized': '0-normalized', offset: 1}
           ]);
         });

      it('should normalize the style values that are processed within an a timeline animation',
         () => {
           const engine = makeEngine(new SuffixNormalizer('-normalized'));

           const instructions = buildAnimationKeyframes([
             style({width: '333px'}),
             animate(1000, style({width: '999px'})),
           ]);

           const player = <MockAnimationPlayer>engine.process(element, instructions);
           expect(player.keyframes).toEqual([
             {'width-normalized': '333px-normalized', offset: 0},
             {'width-normalized': '999px-normalized', offset: 1}
           ]);
         });

      it('should throw an error when normalization fails within a transition animation', () => {
        const engine = makeEngine(new ExactCssValueNormalizer({left: '100px'}));

        const trig = trigger('something', [
          state('a', style({left: '0px', width: '200px'})),
          state('b', style({left: '100px', width: '100px'})), transition('a => b', animate(9876))
        ]);

        const instruction = trig.matchTransition('a', 'b');

        let errorMessage = '';
        try {
          engine.process(element, [instruction]);
        } catch (e) {
          errorMessage = e.toString();
        }

        expect(errorMessage).toMatch(/Unable to animate due to the following errors:/);
        expect(errorMessage).toMatch(/- The CSS property `left` is not allowed to be `0px`/);
        expect(errorMessage).toMatch(/- The CSS property `width` is not allowed/);
      });
    });

    describe('view operations', () => {
      it('should perform insert operations immediately ', () => {
        const engine = makeEngine();

        let container = el('<div></div>');
        let child1 = el('<div></div>');
        let child2 = el('<div></div>');

        engine.insertNode(container, child1);
        engine.insertNode(container, child2);

        expect(container.contains(child1)).toBe(true);
        expect(container.contains(child2)).toBe(true);
      });

      it('should queue up all `remove` DOM operations until all animations are complete', () => {
        let container = el('<div></div>');
        let targetContainer = el('<div></div>');
        let otherContainer = el('<div></div>');
        let child1 = el('<div></div>');
        let child2 = el('<div></div>');
        container.appendChild(targetContainer);
        container.appendChild(otherContainer);
        targetContainer.appendChild(child1);
        targetContainer.appendChild(child2);

        /*----------------*
         container
         /    \
         target   other
         / \
         c1 c2
         *----------------*/

        expect(container.contains(otherContainer)).toBe(true);

        const engine = makeEngine();
        engine.removeNode(child1);
        engine.removeNode(child2);
        engine.removeNode(otherContainer);

        expect(container.contains(child1)).toBe(true);
        expect(container.contains(child2)).toBe(true);
        expect(container.contains(otherContainer)).toBe(true);

        const instructions =
            buildAnimationKeyframes([style({height: 0}), animate(1000, style({height: 100}))]);

        const player = engine.process(targetContainer, instructions);

        expect(container.contains(child1)).toBe(true);
        expect(container.contains(child2)).toBe(true);
        expect(container.contains(otherContainer)).toBe(true);

        engine.triggerAnimations();
        expect(container.contains(child1)).toBe(true);
        expect(container.contains(child2)).toBe(true);
        expect(container.contains(otherContainer)).toBe(false);

        player.finish();
        expect(container.contains(child1)).toBe(false);
        expect(container.contains(child2)).toBe(false);
        expect(container.contains(otherContainer)).toBe(false);
      });
    });
  });
}

class SuffixNormalizer extends AnimationStyleNormalizer {
  constructor(private _suffix: string) { super(); }

  normalizePropertyName(propertyName: string, errors: string[]): string {
    return propertyName + this._suffix;
  }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string {
    return value + this._suffix;
  }
}

class ExactCssValueNormalizer extends AnimationStyleNormalizer {
  constructor(private _allowedValues: {[propName: string]: any}) { super(); }

  normalizePropertyName(propertyName: string, errors: string[]): string {
    if (!this._allowedValues[propertyName]) {
      errors.push(`The CSS property \`${propertyName}\` is not allowed`);
    }
    return propertyName;
  }

  normalizeStyleValue(
      userProvidedProperty: string, normalizedProperty: string, value: string|number,
      errors: string[]): string {
    const expectedValue = this._allowedValues[userProvidedProperty];
    if (expectedValue != value) {
      errors.push(`The CSS property \`${userProvidedProperty}\` is not allowed to be \`${value}\``);
    }
    return expectedValue;
  }
}

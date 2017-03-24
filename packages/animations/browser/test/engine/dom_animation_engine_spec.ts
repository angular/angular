/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, NoopAnimationPlayer, animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {el} from '@angular/platform-browser/testing/src/browser_util';

import {buildAnimationKeyframes} from '../../src/dsl/animation_timeline_visitor';
import {buildTrigger} from '../../src/dsl/animation_trigger';
import {AnimationStyleNormalizer, NoopAnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {DomAnimationEngine} from '../../src/render/dom_animation_engine';
import {MockAnimationDriver, MockAnimationPlayer} from '../../testing/src/mock_animation_driver';

function makeTrigger(name: string, steps: any) {
  const triggerData = trigger(name, steps);
  const triggerInstance = buildTrigger(triggerData.name, triggerData.definitions);
  return triggerInstance;
}

export function main() {
  const driver = new MockAnimationDriver();

  // these tests are only mean't to be run within the DOM
  if (typeof Element == 'undefined') return;

  describe('DomAnimationEngine', () => {
    let element: any;

    beforeEach(() => {
      MockAnimationDriver.log = [];
      element = el('<div></div>');
    });

    function makeEngine(normalizer?: AnimationStyleNormalizer) {
      return new DomAnimationEngine(driver, normalizer || new NoopAnimationStyleNormalizer());
    }

    describe('trigger registration', () => {
      it('should ignore and not throw an error if the same trigger is registered twice', () => {
        const engine = makeEngine();
        engine.registerTrigger(trigger('trig', []));
        expect(() => { engine.registerTrigger(trigger('trig', [])); }).not.toThrow();
      });
    });

    describe('property setting', () => {
      it('should invoke a transition based on a property change', () => {
        const engine = makeEngine();

        const trig = trigger('myTrigger', [
          transition('* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))])
        ]);

        engine.registerTrigger(trig);

        expect(engine.queuedPlayers.length).toEqual(0);
        engine.setProperty(element, 'myTrigger', 'value');
        expect(engine.queuedPlayers.length).toEqual(1);

        const player = MockAnimationDriver.log.pop() as MockAnimationPlayer;
        expect(player.keyframes).toEqual([
          {height: '0px', offset: 0}, {height: '100px', offset: 1}
        ]);
      });

      it('should always invoke an animation even if the property change is not matched', () => {
        const engine = makeEngine();

        const trig = trigger(
            'myTrigger',
            [transition(
                'yes => no', [style({height: '0px'}), animate(1000, style({height: '100px'}))])]);

        engine.registerTrigger(trig);
        expect(engine.queuedPlayers.length).toEqual(0);

        engine.setProperty(element, 'myTrigger', 'no');
        expect(engine.queuedPlayers.length).toEqual(1);
        expect(engine.queuedPlayers.pop() instanceof NoopAnimationPlayer).toBe(true);
        engine.flush();

        engine.setProperty(element, 'myTrigger', 'yes');
        expect(engine.queuedPlayers.length).toEqual(1);
        expect(engine.queuedPlayers.pop() instanceof NoopAnimationPlayer).toBe(true);
      });

      it('should not initialize the animation until the engine has been flushed', () => {
        const engine = makeEngine();
        engine.registerTrigger(trigger(
            'trig', [transition('* => something', [animate(1000, style({color: 'gold'}))])]));

        engine.setProperty(element, 'trig', 'something');
        const player = engine.queuedPlayers.pop() as MockAnimationPlayer;

        let initialized = false;
        player.onInit(() => initialized = true);

        expect(initialized).toBe(false);
        engine.flush();
        expect(initialized).toBe(true);
      });

      it('should not queue an animation if the property value has not changed at all', () => {
        const engine = makeEngine();

        const trig = trigger('myTrigger', [
          transition('* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))])
        ]);

        engine.registerTrigger(trig);
        expect(engine.queuedPlayers.length).toEqual(0);

        engine.setProperty(element, 'myTrigger', 'abc');
        expect(engine.queuedPlayers.length).toEqual(1);

        engine.setProperty(element, 'myTrigger', 'abc');
        expect(engine.queuedPlayers.length).toEqual(1);
      });

      it('should throw an error if an animation property without a matching trigger is changed',
         () => {
           const engine = makeEngine();
           expect(() => {
             engine.setProperty(element, 'myTrigger', 'no');
           }).toThrowError(/The provided animation trigger "myTrigger" has not been registered!/);
         });
    });

    describe('event listeners', () => {
      it('should listen to the onStart operation for the animation', () => {
        const engine = makeEngine();

        const trig = trigger('myTrigger', [
          transition('* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))])
        ]);

        let count = 0;
        engine.registerTrigger(trig);
        engine.listen(element, 'myTrigger', 'start', () => count++);
        engine.setProperty(element, 'myTrigger', 'value');
        expect(count).toEqual(0);

        engine.flush();
        expect(count).toEqual(1);
      });

      it('should listen to the onDone operation for the animation', () => {
        const engine = makeEngine();

        const trig = trigger('myTrigger', [
          transition('* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))])
        ]);

        let count = 0;
        engine.registerTrigger(trig);
        engine.listen(element, 'myTrigger', 'done', () => count++);
        engine.setProperty(element, 'myTrigger', 'value');
        expect(count).toEqual(0);

        engine.flush();
        expect(count).toEqual(0);

        const player = engine.activePlayers.pop() !;
        player.finish();

        expect(count).toEqual(1);
      });

      it('should throw an error when an event is listened to that isn\'t supported', () => {
        const engine = makeEngine();
        const trig = trigger('myTrigger', []);
        engine.registerTrigger(trig);

        expect(() => { engine.listen(element, 'myTrigger', 'explode', () => {}); })
            .toThrowError(
                /The provided animation trigger event "explode" for the animation trigger "myTrigger" is not supported!/);
      });

      it('should throw an error when an event is listened for a trigger that doesn\'t exist', () => {
        const engine = makeEngine();
        expect(() => { engine.listen(element, 'myTrigger', 'explode', () => {}); })
            .toThrowError(
                /Unable to listen on the animation trigger event "explode" because the animation trigger "myTrigger" doesn\'t exist!/);
      });

      it('should throw an error when an undefined event is listened for', () => {
        const engine = makeEngine();
        const trig = trigger('myTrigger', []);
        engine.registerTrigger(trig);
        expect(() => { engine.listen(element, 'myTrigger', '', () => {}); })
            .toThrowError(
                /Unable to listen on the animation trigger "myTrigger" because the provided event is undefined!/);
      });

      it('should retain event listeners and call them for sucessive animation state changes',
         () => {
           const engine = makeEngine();
           const trig = trigger(
               'myTrigger',
               [transition(
                   '* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))])]);

           engine.registerTrigger(trig);

           let count = 0;
           engine.listen(element, 'myTrigger', 'start', () => count++);

           engine.setProperty(element, 'myTrigger', '123');
           engine.flush();
           expect(count).toEqual(1);

           engine.setProperty(element, 'myTrigger', '456');
           engine.flush();
           expect(count).toEqual(2);
         });

      it('should only fire event listener changes for when the corresponding trigger changes state',
         () => {
           const engine = makeEngine();
           const trig1 = trigger(
               'myTrigger1',
               [transition(
                   '* => 123', [style({height: '0px'}), animate(1000, style({height: '100px'}))])]);
           engine.registerTrigger(trig1);

           const trig2 = trigger(
               'myTrigger2',
               [transition(
                   '* => 123', [style({width: '0px'}), animate(1000, style({width: '100px'}))])]);
           engine.registerTrigger(trig2);

           let count = 0;
           engine.listen(element, 'myTrigger1', 'start', () => count++);

           engine.setProperty(element, 'myTrigger1', '123');
           engine.flush();
           expect(count).toEqual(1);

           engine.setProperty(element, 'myTrigger2', '123');
           engine.flush();
           expect(count).toEqual(1);
         });

      it('should allow a listener to be deregistered', () => {
        const engine = makeEngine();
        const trig = trigger(
            'myTrigger',
            [transition(
                '* => 123', [style({height: '0px'}), animate(1000, style({height: '100px'}))])]);
        engine.registerTrigger(trig);

        let count = 0;
        const deregisterFn = engine.listen(element, 'myTrigger', 'start', () => count++);
        engine.setProperty(element, 'myTrigger', '123');
        engine.flush();
        expect(count).toEqual(1);

        deregisterFn();
        engine.setProperty(element, 'myTrigger', '456');
        engine.flush();
        expect(count).toEqual(1);
      });

      it('should trigger a listener callback with an AnimationEvent argument', () => {
        const engine = makeEngine();
        engine.registerTrigger(trigger(
            'myTrigger',
            [transition(
                '* => *', [style({height: '0px'}), animate(1234, style({height: '100px'}))])]));

        // we do this so that the next transition has a starting value that isnt null
        engine.setProperty(element, 'myTrigger', '123');
        engine.flush();

        let capture: AnimationEvent = null !;
        engine.listen(element, 'myTrigger', 'start', (e) => capture = e);
        engine.listen(element, 'myTrigger', 'done', (e) => capture = e);
        engine.setProperty(element, 'myTrigger', '456');
        engine.flush();

        expect(capture).toEqual({
          element,
          triggerName: 'myTrigger',
          phaseName: 'start',
          fromState: '123',
          toState: '456',
          totalTime: 1234
        });

        capture = null !;
        const player = engine.activePlayers.pop() !;
        player.finish();

        expect(capture).toEqual({
          element,
          triggerName: 'myTrigger',
          phaseName: 'done',
          fromState: '123',
          toState: '456',
          totalTime: 1234
        });
      });
    });

    describe('instructions', () => {
      it('should animate a transition instruction', () => {
        const engine = makeEngine();

        const trig = makeTrigger('something', [
          state('on', style({height: 100})), state('off', style({height: 0})),
          transition('on => off', animate(9876))
        ]);

        const instruction = trig.matchTransition('on', 'off') !;

        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.animateTransition(element, instruction);
        expect(MockAnimationDriver.log.length).toEqual(1);
      });

      it('should animate a timeline instruction', () => {
        const engine = makeEngine();
        const timelines =
            buildAnimationKeyframes([style({height: 100}), animate(1000, style({height: 0}))]);
        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.animateTimeline(element, timelines);
        expect(MockAnimationDriver.log.length).toEqual(1);
      });

      it('should animate an array of animation instructions', () => {
        const engine = makeEngine();

        const instructions = buildAnimationKeyframes([
          style({height: 100}), animate(1000, style({height: 0})),
          animate(1000, keyframes([style({width: 0}), style({width: 1000})]))
        ]);

        expect(MockAnimationDriver.log.length).toEqual(0);
        engine.animateTimeline(element, instructions);
        expect(MockAnimationDriver.log.length).toBeGreaterThan(0);
      });
    });

    describe('removals / insertions', () => {
      it('should allow text nodes to be removed through the engine', () => {
        const engine = makeEngine();
        const node = document.createTextNode('hello');
        element.appendChild(node);

        let called = false;
        engine.onRemove(node, () => called = true);

        expect(called).toBeTruthy();
      });

      it('should allow text nodes to be inserted through the engine', () => {
        const engine = makeEngine();
        const node = document.createTextNode('hello');

        let called = false;
        engine.onInsert(node, () => called = true);

        expect(called).toBeTruthy();
      });
    });

    describe('transition operations', () => {
      it('should persist the styles on the element as actual styles once the animation is complete',
         () => {
           const engine = makeEngine();
           const trig = makeTrigger('something', [
             state('on', style({height: '100px'})), state('off', style({height: '0px'})),
             transition('on => off', animate(9876))
           ]);

           const instruction = trig.matchTransition('on', 'off') !;
           const player = engine.animateTransition(element, instruction);

           expect(element.style.height).not.toEqual('0px');
           player.finish();
           expect(element.style.height).toEqual('0px');
         });

      it('should remove all existing state styling from an element when a follow-up transition occurs on the same trigger',
         () => {
           const engine = makeEngine();
           const trig = makeTrigger('something', [
             state('a', style({height: '100px'})), state('b', style({height: '500px'})),
             state('c', style({width: '200px'})), transition('* => *', animate(9876))
           ]);

           const instruction1 = trig.matchTransition('a', 'b') !;
           const player1 = engine.animateTransition(element, instruction1);

           player1.finish();
           expect(element.style.height).toEqual('500px');

           const instruction2 = trig.matchTransition('b', 'c') !;
           const player2 = engine.animateTransition(element, instruction2);

           expect(element.style.height).not.toEqual('500px');
           player2.finish();
           expect(element.style.width).toEqual('200px');
           expect(element.style.height).not.toEqual('500px');
         });

      it('should allow two animation transitions with different triggers to animate in parallel',
         () => {
           const engine = makeEngine();
           const trig1 = makeTrigger('something1', [
             state('a', style({width: '100px'})), state('b', style({width: '200px'})),
             transition('* => *', animate(1000))
           ]);

           const trig2 = makeTrigger('something2', [
             state('x', style({height: '500px'})), state('y', style({height: '1000px'})),
             transition('* => *', animate(2000))
           ]);

           let doneCount = 0;
           function doneCallback() { doneCount++; }

           const instruction1 = trig1.matchTransition('a', 'b') !;
           const instruction2 = trig2.matchTransition('x', 'y') !;
           const player1 = engine.animateTransition(element, instruction1);
           player1.onDone(doneCallback);
           expect(doneCount).toEqual(0);

           const player2 = engine.animateTransition(element, instruction2);
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
           const trig = makeTrigger('something', [
             state('x', style({opacity: 0})), state('y', style({opacity: .5})),
             state('z', style({opacity: 1})), transition('* => *', animate(1000))
           ]);

           const instruction1 = trig.matchTransition('x', 'y') !;
           const instruction2 = trig.matchTransition('y', 'z') !;

           expect(parseFloat(element.style.opacity)).not.toEqual(.5);

           const player1 = engine.animateTransition(element, instruction1);
           const player2 = engine.animateTransition(element, instruction2);

           expect(parseFloat(element.style.opacity)).toEqual(.5);

           player2.finish();
           expect(parseFloat(element.style.opacity)).toEqual(1);

           player1.finish();
           expect(parseFloat(element.style.opacity)).toEqual(1);
         });

      it('should pass in the previously running players into the follow-up transition player when cancelled',
         () => {
           const engine = makeEngine();
           const trig = makeTrigger('something', [
             state('x', style({opacity: 0})), state('y', style({opacity: .5})),
             state('z', style({opacity: 1})), transition('* => *', animate(1000))
           ]);

           const instruction1 = trig.matchTransition('x', 'y') !;
           const instruction2 = trig.matchTransition('y', 'z') !;
           const instruction3 = trig.matchTransition('z', 'x') !;

           const player1 = engine.animateTransition(element, instruction1);
           engine.flush();
           player1.setPosition(0.5);

           const player2 = <MockAnimationPlayer>engine.animateTransition(element, instruction2);
           expect(player2.previousPlayers).toEqual([player1]);
           player2.finish();

           const player3 = <MockAnimationPlayer>engine.animateTransition(element, instruction3);
           expect(player3.previousPlayers).toEqual([]);
         });

      it('should cancel all existing players if a removal animation is set to occur', () => {
        const engine = makeEngine();
        const trig = makeTrigger('something', [
          state('m', style({opacity: 0})), state('n', style({opacity: 1})),
          transition('* => *', animate(1000))
        ]);

        let doneCount = 0;
        function doneCallback() { doneCount++; }

        const instruction1 = trig.matchTransition('m', 'n') !;
        const instructions2 =
            buildAnimationKeyframes([style({height: 0}), animate(1000, style({height: 100}))]) !;
        const instruction3 = trig.matchTransition('n', 'void') !;

        const player1 = engine.animateTransition(element, instruction1);
        player1.onDone(doneCallback);

        const player2 = engine.animateTimeline(element, instructions2);
        player2.onDone(doneCallback);

        engine.flush();
        expect(doneCount).toEqual(0);

        const player3 = engine.animateTransition(element, instruction3);
        expect(doneCount).toEqual(2);
      });

      it('should only persist styles that exist in the final state styles and not the last keyframe',
         () => {
           const engine = makeEngine();
           const trig = makeTrigger('something', [
             state('0', style({width: '0px'})), state('1', style({width: '100px'})),
             transition('* => *', [animate(1000, style({height: '200px'}))])
           ]);

           const instruction = trig.matchTransition('0', '1') !;
           const player = engine.animateTransition(element, instruction);
           expect(element.style.width).not.toEqual('100px');

           player.finish();
           expect(element.style.height).not.toEqual('200px');
           expect(element.style.width).toEqual('100px');
         });

      it('should default to using styling from the `*` state if a matching state is not found',
         () => {
           const engine = makeEngine();
           const trig = makeTrigger('something', [
             state('a', style({opacity: 0})), state('*', style({opacity: .5})),
             transition('* => *', animate(1000))
           ]);

           const instruction = trig.matchTransition('a', 'z') !;
           engine.animateTransition(element, instruction).finish();

           expect(parseFloat(element.style.opacity)).toEqual(.5);
         });

      it('should treat `void` as `void`', () => {
        const engine = makeEngine();
        const trig = makeTrigger('something', [
          state('a', style({opacity: 0})), state('void', style({opacity: .8})),
          transition('* => *', animate(1000))
        ]);

        const instruction = trig.matchTransition('a', 'void') !;
        engine.animateTransition(element, instruction).finish();

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

        const player = engine.animateTimeline(element, instructions);
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
      it('should normalize the style values that are animateTransitioned within an a transition animation',
         () => {
           const engine = makeEngine(new SuffixNormalizer('-normalized'));

           const trig = makeTrigger('something', [
             state('on', style({height: 100})), state('off', style({height: 0})),
             transition('on => off', animate(9876))
           ]);

           const instruction = trig.matchTransition('on', 'off') !;
           const player = <MockAnimationPlayer>engine.animateTransition(element, instruction);

           expect(player.keyframes).toEqual([
             {'height-normalized': '100-normalized', offset: 0},
             {'height-normalized': '0-normalized', offset: 1}
           ]);
         });

      it('should normalize the style values that are animateTransitioned within an a timeline animation',
         () => {
           const engine = makeEngine(new SuffixNormalizer('-normalized'));

           const instructions = buildAnimationKeyframes([
             style({width: '333px'}),
             animate(1000, style({width: '999px'})),
           ]);

           const player = <MockAnimationPlayer>engine.animateTimeline(element, instructions);
           expect(player.keyframes).toEqual([
             {'width-normalized': '333px-normalized', offset: 0},
             {'width-normalized': '999px-normalized', offset: 1}
           ]);
         });

      it('should throw an error when normalization fails within a transition animation', () => {
        const engine = makeEngine(new ExactCssValueNormalizer({left: '100px'}));

        const trig = makeTrigger('something', [
          state('a', style({left: '0px', width: '200px'})),
          state('b', style({left: '100px', width: '100px'})), transition('a => b', animate(9876))
        ]);

        const instruction = trig.matchTransition('a', 'b') !;

        let errorMessage = '';
        try {
          engine.animateTransition(element, instruction);
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

        let container = <any>el('<div></div>');
        let child1 = <any>el('<div></div>');
        let child2 = <any>el('<div></div>');

        engine.onInsert(container, () => container.appendChild(child1));
        engine.onInsert(container, () => container.appendChild(child2));

        expect(container.contains(child1)).toBe(true);
        expect(container.contains(child2)).toBe(true);
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

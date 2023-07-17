/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, AnimationOptions, state, style, transition} from '@angular/animations';
import {AnimationTransitionInstruction} from '@angular/animations/browser/src/dsl/animation_transition_instruction';
import {AnimationTrigger} from '@angular/animations/browser/src/dsl/animation_trigger';

import {ENTER_CLASSNAME, LEAVE_CLASSNAME} from '../../src/util';
import {MockAnimationDriver} from '../../testing';
import {makeTrigger} from '../shared';

{
  describe('AnimationTrigger', () => {
    // these tests are only meant to be run within the DOM (for now)
    if (isNode) {
      // Jasmine will throw if there are no tests.
      it('should pass', () => {});
      return;
    }

    let element: any;
    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    describe('trigger validation', () => {
      it('should group errors together for an animation trigger', () => {
        expect(() => {
          makeTrigger('myTrigger', [transition('12345', animate(3333))]);
        }).toThrowError(/NG03403: Animation parsing for the myTrigger trigger have failed/);
      });

      it('should throw an error when a transition within a trigger contains an invalid expression',
         () => {
           expect(() => {
             makeTrigger('name', [transition('somethingThatIsWrong', animate(3333))]);
           })
               .toThrowError(
                   /- NG03015: The provided transition expression "somethingThatIsWrong" is not supported/);
         });

      it('should throw an error if an animation alias is used that is not yet supported', () => {
        expect(() => {
          makeTrigger('name', [transition(':angular', animate(3333))]);
        }).toThrowError(/- NG03016: The transition alias value ":angular" is not supported/);
      });
    });

    describe('trigger usage', () => {
      it('should construct a trigger based on the states and transition data', () => {
        const result = makeTrigger('name', [
          state('on', style({width: 0})),
          state('off', style({width: 100})),
          transition('on => off', animate(1000)),
          transition('off => on', animate(1000)),
        ]);

        expect(result.states.get('on')!.buildStyles({}, []))
            .toEqual(new Map<string, string|number>([['width', 0]]));
        expect(result.states.get('off')!.buildStyles({}, []))
            .toEqual(new Map<string, string|number>([['width', 100]]));
        expect(result.transitionFactories.length).toEqual(2);
      });

      it('should allow multiple state values to use the same styles', () => {
        const result = makeTrigger('name', [
          state('on, off', style({width: 50})), transition('on => off', animate(1000)),
          transition('off => on', animate(1000))
        ]);

        expect(result.states.get('on')!.buildStyles({}, []))
            .toEqual(new Map<string, string|number>([['width', 50]]));
        expect(result.states.get('off')!.buildStyles({}, []))
            .toEqual(new Map<string, string|number>([['width', 50]]));
      });

      it('should find the first transition that matches', () => {
        const result = makeTrigger(
            'name', [transition('a => b', animate(1234)), transition('b => c', animate(5678))]);

        const trans = buildTransition(result, element, 'b', 'c')!;
        expect(trans.timelines.length).toEqual(1);
        const timeline = trans.timelines[0];
        expect(timeline.duration).toEqual(5678);
      });

      it('should find a transition with a `*` value', () => {
        const result = makeTrigger('name', [
          transition('* => b', animate(1234)), transition('b => *', animate(5678)),
          transition('* => *', animate(9999))
        ]);

        let trans = buildTransition(result, element, 'b', 'c')!;
        expect(trans.timelines[0].duration).toEqual(5678);

        trans = buildTransition(result, element, 'a', 'b')!;
        expect(trans.timelines[0].duration).toEqual(1234);

        trans = buildTransition(result, element, 'c', 'c')!;
        expect(trans.timelines[0].duration).toEqual(9999);
      });

      it('should null when no results are found', () => {
        const result = makeTrigger('name', [transition('a => b', animate(1111))]);

        const trigger = result.matchTransition('b', 'a', {}, {});
        expect(trigger).toBeFalsy();
      });

      it('should support bi-directional transition expressions', () => {
        const result = makeTrigger('name', [transition('a <=> b', animate(2222))]);

        const t1 = buildTransition(result, element, 'a', 'b')!;
        expect(t1.timelines[0].duration).toEqual(2222);

        const t2 = buildTransition(result, element, 'b', 'a')!;
        expect(t2.timelines[0].duration).toEqual(2222);
      });

      it('should support multiple transition statements in one string', () => {
        const result = makeTrigger('name', [transition('a => b, b => a, c => *', animate(1234))]);

        const t1 = buildTransition(result, element, 'a', 'b')!;
        expect(t1.timelines[0].duration).toEqual(1234);

        const t2 = buildTransition(result, element, 'b', 'a')!;
        expect(t2.timelines[0].duration).toEqual(1234);

        const t3 = buildTransition(result, element, 'c', 'a')!;
        expect(t3.timelines[0].duration).toEqual(1234);
      });

      describe('params', () => {
        it('should support transition-level animation variable params', () => {
          const result = makeTrigger(
              'name',
              [transition(
                  'a => b', [style({height: '{{ a }}'}), animate(1000, style({height: '{{ b }}'}))],
                  buildParams({a: '100px', b: '200px'}))]);

          const trans = buildTransition(result, element, 'a', 'b')!;
          const keyframes = trans.timelines[0].keyframes;
          expect(keyframes).toEqual([
            new Map<string, string|number>([['height', '100px'], ['offset', 0]]),
            new Map<string, string|number>([['height', '200px'], ['offset', 1]])
          ]);
        });

        it('should substitute variable params provided directly within the transition match',
           () => {
             const result = makeTrigger(
                 'name',
                 [transition(
                     'a => b',
                     [style({height: '{{ a }}'}), animate(1000, style({height: '{{ b }}'}))],
                     buildParams({a: '100px', b: '200px'}))]);

             const trans =
                 buildTransition(result, element, 'a', 'b', {}, buildParams({a: '300px'}))!;

             const keyframes = trans.timelines[0].keyframes;
             expect(keyframes).toEqual([
               new Map<string, string|number>([['height', '300px'], ['offset', 0]]),
               new Map<string, string|number>([['height', '200px'], ['offset', 1]])
             ]);
           });
      });

      it('should match `true` and `false` given boolean values', () => {
        const result = makeTrigger('name', [
          state('false', style({color: 'red'})), state('true', style({color: 'green'})),
          transition('true <=> false', animate(1234))
        ]);

        const trans = buildTransition(result, element, false, true)!;
        expect(trans.timelines[0].duration).toEqual(1234);
      });

      it('should match `1` and `0` given boolean values', () => {
        const result = makeTrigger('name', [
          state('0', style({color: 'red'})), state('1', style({color: 'green'})),
          transition('1 <=> 0', animate(4567))
        ]);

        const trans = buildTransition(result, element, false, true)!;
        expect(trans.timelines[0].duration).toEqual(4567);
      });

      it('should match `true` and `false` state styles on a `1 <=> 0` boolean transition given boolean values',
         () => {
           const result = makeTrigger('name', [
             state('false', style({color: 'red'})), state('true', style({color: 'green'})),
             transition('1 <=> 0', animate(4567))
           ]);

           const trans = buildTransition(result, element, false, true)!;
           expect(trans.timelines[0].keyframes).toEqual([
             new Map<string, string|number>([['offset', 0], ['color', 'red']]),
             new Map<string, string|number>([['offset', 1], ['color', 'green']])
           ]);
         });

      it('should match `1` and `0` state styles on a `true <=> false` boolean transition given boolean values',
         () => {
           const result = makeTrigger('name', [
             state('0', style({color: 'orange'})), state('1', style({color: 'blue'})),
             transition('true <=> false', animate(4567))
           ]);

           const trans = buildTransition(result, element, false, true)!;
           expect(trans.timelines[0].keyframes).toEqual([
             new Map<string, string|number>([['offset', 0], ['color', 'orange']]),
             new Map<string, string|number>([['offset', 1], ['color', 'blue']])
           ]);
         });

      it('should treat numeric values (disguised as strings) as proper state values', () => {
        const result = makeTrigger('name', [
          state(1 as any as string, style({opacity: 0})),
          state(0 as any as string, style({opacity: 0})), transition('* => *', animate(1000))
        ]);

        expect(() => {
          const trans = buildTransition(result, element, false, true)!;
        }).not.toThrow();
      });

      describe('aliases', () => {
        it('should alias the :enter transition as void => *', () => {
          const result = makeTrigger('name', [transition(':enter', animate(3333))]);

          const trans = buildTransition(result, element, 'void', 'something')!;
          expect(trans.timelines[0].duration).toEqual(3333);
        });

        it('should alias the :leave transition as * => void', () => {
          const result = makeTrigger('name', [transition(':leave', animate(3333))]);

          const trans = buildTransition(result, element, 'something', 'void')!;
          expect(trans.timelines[0].duration).toEqual(3333);
        });
      });
    });
  });
}

function buildTransition(
    trigger: AnimationTrigger, element: any, fromState: any, toState: any,
    fromOptions?: AnimationOptions, toOptions?: AnimationOptions): AnimationTransitionInstruction|
    null {
  const params = toOptions && toOptions.params || {};
  const trans = trigger.matchTransition(fromState, toState, element, params)!;
  if (trans) {
    const driver = new MockAnimationDriver();
    return trans.build(
        driver, element, fromState, toState, ENTER_CLASSNAME, LEAVE_CLASSNAME, fromOptions,
        toOptions)!;
  }
  return null;
}

function buildParams(params: {[name: string]: any}): AnimationOptions {
  return <AnimationOptions>{params};
}

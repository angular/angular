/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, state, style, transition, trigger} from '@angular/animations';
import {buildTrigger} from '../../src/dsl/animation_trigger';

function makeTrigger(name: string, steps: any) {
  const triggerData = trigger(name, steps);
  const triggerInstance = buildTrigger(triggerData.name, triggerData.definitions);
  return triggerInstance;
}

export function main() {
  describe('AnimationTrigger', () => {
    describe('trigger validation', () => {
      it('should group errors together for an animation trigger', () => {
        expect(() => {
          makeTrigger('myTrigger', [transition('12345', animate(3333))]);
        }).toThrowError(/Animation parsing for the myTrigger trigger have failed/);
      });

      it('should throw an error when a transition within a trigger contains an invalid expression',
         () => {
           expect(
               () => { makeTrigger('name', [transition('somethingThatIsWrong', animate(3333))]); })
               .toThrowError(
                   /- The provided transition expression "somethingThatIsWrong" is not supported/);
         });

      it('should throw an error if an animation alias is used that is not yet supported', () => {
        expect(() => {
          makeTrigger('name', [transition(':angular', animate(3333))]);
        }).toThrowError(/- The transition alias value ":angular" is not supported/);
      });
    });

    describe('trigger usage', () => {
      it('should construct a trigger based on the states and transition data', () => {
        const result = makeTrigger('name', [
          state('on', style({width: 0})), state('off', style({width: 100})),
          transition('on => off', animate(1000)), transition('off => on', animate(1000))
        ]);

        expect(result.states).toEqual({'on': {width: 0}, 'off': {width: 100}});

        expect(result.transitionFactories.length).toEqual(2);
      });

      it('should allow multiple state values to use the same styles', () => {
        const result = makeTrigger('name', [
          state('on, off', style({width: 50})), transition('on => off', animate(1000)),
          transition('off => on', animate(1000))
        ]);

        expect(result.states).toEqual({'on': {width: 50}, 'off': {width: 50}});
      });

      it('should find the first transition that matches', () => {
        const result = makeTrigger(
            'name', [transition('a => b', animate(1234)), transition('b => c', animate(5678))]);

        const trans = result.matchTransition('b', 'c') !;
        expect(trans.timelines.length).toEqual(1);
        const timeline = trans.timelines[0];
        expect(timeline.duration).toEqual(5678);
      });

      it('should find a transition with a `*` value', () => {
        const result = makeTrigger('name', [
          transition('* => b', animate(1234)), transition('b => *', animate(5678)),
          transition('* => *', animate(9999))
        ]);

        let trans = result.matchTransition('b', 'c') !;
        expect(trans.timelines[0].duration).toEqual(5678);

        trans = result.matchTransition('a', 'b') !;
        expect(trans.timelines[0].duration).toEqual(1234);

        trans = result.matchTransition('c', 'c') !;
        expect(trans.timelines[0].duration).toEqual(9999);
      });

      it('should null when no results are found', () => {
        const result = makeTrigger('name', [transition('a => b', animate(1111))]);

        const trans = result.matchTransition('b', 'a');
        expect(trans).toBeFalsy();
      });

      it('should allow a function to be used as a predicate for the transition', () => {
        let returnValue = false;

        const result = makeTrigger('name', [transition((from, to) => returnValue, animate(1111))]);

        expect(result.matchTransition('a', 'b')).toBeFalsy();
        expect(result.matchTransition('1', 2)).toBeFalsy();
        expect(result.matchTransition(false, true)).toBeFalsy();

        returnValue = true;

        expect(result.matchTransition('a', 'b')).toBeTruthy();
      });

      it('should call each transition predicate function until the first one that returns true',
         () => {
           let count = 0;

           function countAndReturn(value: boolean) {
             return (fromState: any, toState: any) => {
               count++;
               return value;
             };
           }

           const result = makeTrigger('name', [
             transition(countAndReturn(false), animate(1111)),
             transition(countAndReturn(false), animate(2222)),
             transition(countAndReturn(true), animate(3333)),
             transition(countAndReturn(true), animate(3333))
           ]);

           const trans = result.matchTransition('a', 'b') !;
           expect(trans.timelines[0].duration).toEqual(3333);

           expect(count).toEqual(3);
         });

      it('should support bi-directional transition expressions', () => {
        const result = makeTrigger('name', [transition('a <=> b', animate(2222))]);

        const t1 = result.matchTransition('a', 'b') !;
        expect(t1.timelines[0].duration).toEqual(2222);

        const t2 = result.matchTransition('b', 'a') !;
        expect(t2.timelines[0].duration).toEqual(2222);
      });

      it('should support multiple transition statements in one string', () => {
        const result = makeTrigger('name', [transition('a => b, b => a, c => *', animate(1234))]);

        const t1 = result.matchTransition('a', 'b') !;
        expect(t1.timelines[0].duration).toEqual(1234);

        const t2 = result.matchTransition('b', 'a') !;
        expect(t2.timelines[0].duration).toEqual(1234);

        const t3 = result.matchTransition('c', 'a') !;
        expect(t3.timelines[0].duration).toEqual(1234);
      });

      describe('aliases', () => {
        it('should alias the :enter transition as void => *', () => {
          const result = makeTrigger('name', [transition(':enter', animate(3333))]);

          const trans = result.matchTransition('void', 'something') !;
          expect(trans.timelines[0].duration).toEqual(3333);
        });

        it('should alias the :leave transition as * => void', () => {
          const result = makeTrigger('name', [transition(':leave', animate(3333))]);

          const trans = result.matchTransition('something', 'void') !;
          expect(trans.timelines[0].duration).toEqual(3333);
        });
      });
    });
  });
}

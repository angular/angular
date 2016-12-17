/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {DomElementSchemaRegistry, ElementSchemaRegistry} from '@angular/compiler';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AnimationDriver} from '@angular/platform-browser/src/dom/animation_driver';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {WebAnimationsDriver} from '@angular/platform-browser/src/dom/web_animations_driver';
import {WebAnimationsPlayer} from '@angular/platform-browser/src/dom/web_animations_player';
import {expect} from '@angular/platform-browser/testing/matchers';
import {MockAnimationDriver} from '@angular/platform-browser/testing/mock_animation_driver';
import {ApplicationRef, Component, HostBinding, HostListener, NgModule, NgZone, destroyPlatform} from '../../index';
import {DEFAULT_STATE} from '../../src/animation/animation_constants';
import {AnimationGroupPlayer} from '../../src/animation/animation_group_player';
import {AnimationKeyframe} from '../../src/animation/animation_keyframe';
import {AnimationPlayer, NoOpAnimationPlayer} from '../../src/animation/animation_player';
import {AnimationStyles} from '../../src/animation/animation_styles';
import {AnimationTransitionEvent} from '../../src/animation/animation_transition_event';
import {AUTO_STYLE, animate, group, keyframes, sequence, state, style, transition, trigger} from '../../src/animation/metadata';
import {Input} from '../../src/core';
import {isPresent} from '../../src/facade/lang';
import {ElementRef} from '../../src/linker/element_ref';
import {TestBed, fakeAsync, flushMicrotasks} from '../../testing';
import {MockAnimationPlayer} from '../../testing/mock_animation_player';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });
  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('animation tests', function() {
    beforeEach(() => {
      InnerContentTrackingAnimationPlayer.initLog = [];

      TestBed.configureCompiler({useJit: useJit});
      TestBed.configureTestingModule({
        declarations: [DummyLoadingCmp, DummyIfCmp],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
        imports: [CommonModule]
      });
    });

    describe('animation triggers', () => {
      it('should trigger a state change animation from void => state', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
               animations: [trigger(
                   'myAnimation',
                   [transition(
                       'void => *',
                       [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;

           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(1);

           const keyframes2 = driver.log[0]['keyframeLookup'];
           expect(keyframes2.length).toEqual(2);
           expect(keyframes2[0]).toEqual([0, {'opacity': '0'}]);
           expect(keyframes2[1]).toEqual([1, {'opacity': '1'}]);
         }));

      it('should trigger a state change animation from state => void', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
               animations: [trigger(
                   'myAnimation',
                   [transition(
                       '* => void',
                       [style({'opacity': '1'}), animate(500, style({'opacity': '0'}))])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           cmp.exp = false;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(1);

           const keyframes2 = driver.log[0]['keyframeLookup'];
           expect(keyframes2.length).toEqual(2);
           expect(keyframes2[0]).toEqual([0, {'opacity': '1'}]);
           expect(keyframes2[1]).toEqual([1, {'opacity': '0'}]);
         }));

      it('should animate the element when the expression changes between states',
         fakeAsync(
             () => {
               TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
            animations: [
              trigger('myAnimation', [
                transition('* => state1', [
                  style({'backgroundColor': 'red'}),
                  animate('0.5s 1s ease-out', style({'backgroundColor': 'blue'}))
                ])
              ])
            ]
          }
        });

               const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
               const fixture = TestBed.createComponent(DummyIfCmp);
               const cmp = fixture.componentInstance;
               cmp.exp = 'state1';
               fixture.detectChanges();

               flushMicrotasks();

               expect(driver.log.length).toEqual(1);

               const animation1 = driver.log[0];
               expect(animation1['duration']).toEqual(500);
               expect(animation1['delay']).toEqual(1000);
               expect(animation1['easing']).toEqual('ease-out');

               const startingStyles = animation1['startingStyles'];
               expect(startingStyles).toEqual({'backgroundColor': 'red'});

               const kf = animation1['keyframeLookup'];
               expect(kf[0]).toEqual([0, {'backgroundColor': 'red'}]);
               expect(kf[1]).toEqual([1, {'backgroundColor': 'blue'}]);
             }));

      it('should allow a transition to be a user-defined function', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
               animations: [trigger(
                   'myAnimation',
                   [
                     transition(figureItOut, [animate(1000, style({'backgroundColor': 'blue'}))]),
                     transition(
                         '* => *', [animate(1000, style({'backgroundColor': 'black'}))])
                   ])]
             }
           });

           const log: string[] = [];
           function figureItOut(stateA: string, stateB: string): boolean {
             log.push(`${stateA} => ${stateB}`);
             return ['one', 'three', 'five'].indexOf(stateB) >= 0;
           }

           function assertAnimatedToFirstTransition(animation: any, firstState: boolean) {
             const expectedColor = firstState ? 'blue' : 'black';
             expect(animation['keyframeLookup'][1]).toEqual([
               1, {'backgroundColor': expectedColor}
             ]);
           }

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'one';
           fixture.detectChanges();
           flushMicrotasks();
           assertAnimatedToFirstTransition(driver.log.pop(), true);
           expect(log.pop()).toEqual('void => one');

           cmp.exp = 'two';
           fixture.detectChanges();
           flushMicrotasks();
           assertAnimatedToFirstTransition(driver.log.pop(), false);
           expect(log.pop()).toEqual('one => two');

           cmp.exp = 'three';
           fixture.detectChanges();
           flushMicrotasks();
           assertAnimatedToFirstTransition(driver.log.pop(), true);
           expect(log.pop()).toEqual('two => three');

           cmp.exp = 'four';
           fixture.detectChanges();
           flushMicrotasks();
           assertAnimatedToFirstTransition(driver.log.pop(), false);
           expect(log.pop()).toEqual('three => four');

           cmp.exp = 'five';
           fixture.detectChanges();
           flushMicrotasks();
           assertAnimatedToFirstTransition(driver.log.pop(), true);
           expect(log.pop()).toEqual('four => five');
         }));

      it('should throw an error when a provided offset for an animation step if an offset value is greater than 1',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                  <div *ngIf="exp" [@tooBig]="exp"></div>
                `,
               animations: [trigger(
                   'tooBig',
                   [transition(
                       '* => *', [animate('444ms', style({'opacity': '1', offset: 1.1}))])])]
             }
           });

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyIfCmp);
           } catch (e) {
             message = e.message;
           }

           const lines = message.split(/\n+/);
           expect(lines[1]).toMatch(
               /Unable to parse the animation sequence for "tooBig" on the DummyIfCmp component due to the following errors:/);
           expect(lines[2]).toMatch(/Offset values for animations must be between 0 and 1/);
         }));

      it('should throw an error when a provided offset for an animation step if an offset value is less than 0',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                  <div *ngIf="exp" [@tooSmall]="exp"></div>
                `,
               animations: [trigger(
                   'tooSmall',
                   [transition(
                       '* => *', [animate('444ms', style({'opacity': '0', offset: -1}))])])]
             }
           });

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyIfCmp);
           } catch (e) {
             message = e.message;
           }

           const lines = message.split(/\n+/);
           expect(lines[1]).toMatch(
               /Unable to parse the animation sequence for "tooSmall" on the DummyIfCmp component due to the following errors:/);
           expect(lines[2]).toMatch(/Offset values for animations must be between 0 and 1/);
         }));

      describe('animation aliases', () => {
        it('should animate the ":enter" animation alias as "void => *"', fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `
                  <div *ngIf="exp" [@myAnimation]="exp"></div>
                `,
                 animations: [trigger(
                     'myAnimation', [transition(
                                        ':enter',
                                        [
                                          style({'opacity': '0'}),
                                          animate('500ms', style({'opacity': '1'}))
                                        ])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             cmp.exp = true;
             fixture.detectChanges();

             expect(driver.log.length).toEqual(1);

             const animation = driver.log[0];
             expect(animation['duration']).toEqual(500);
           }));

        it('should animate the ":leave" animation alias as "* => void"', fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `
                  <div *ngIf="exp" [@myAnimation]="exp"></div>
                `,
                 animations: [trigger(
                     'myAnimation',
                     [transition(':leave', [animate('999ms', style({'opacity': '0'}))])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             cmp.exp = true;
             fixture.detectChanges();

             expect(driver.log.length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();

             expect(driver.log.length).toEqual(1);

             const animation = driver.log[0];
             expect(animation['duration']).toEqual(999);
           }));

        it('should throw an error when an unsupported alias is detected which is prefixed a colon value',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `
                  <div *ngIf="exp" [@myAnimation]="exp"></div>
                `,
                 animations: [trigger(
                     'myAnimation',
                     [transition(
                         ':dont_leave_me', [animate('444ms', style({'opacity': '0'}))])])]
               }
             });

             let message = '';
             try {
               const fixture = TestBed.createComponent(DummyIfCmp);
             } catch (e) {
               message = e.message;
             }

             expect(message).toMatch(
                 /the transition alias value ":dont_leave_me" is not supported/);
           }));
      });

      it('should animate between * and void and back even when no expression is assigned',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div [@myAnimation] *ngIf="exp"></div>
              `,
               animations: [trigger(
                   'myAnimation',
                   [
                     state('*', style({'opacity': '1'})), state('void', style({'opacity': '0'})),
                     transition('* => *', [animate('500ms')])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           let result = driver.log.pop();
           expect(result['duration']).toEqual(500);
           expect(result['startingStyles']).toEqual({'opacity': '0'});
           expect(result['keyframeLookup']).toEqual([[0, {'opacity': '0'}], [1, {'opacity': '1'}]]);

           cmp.exp = false;
           fixture.detectChanges();
           flushMicrotasks();

           result = driver.log.pop();
           expect(result['duration']).toEqual(500);
           expect(result['startingStyles']).toEqual({'opacity': '1'});
           expect(result['keyframeLookup']).toEqual([[0, {'opacity': '1'}], [1, {'opacity': '0'}]]);
         }));

      describe('schema normalization', () => {
        beforeEach(() => {
          TestBed.overrideComponent(DummyIfCmp, {
            set: {
              template: `<div [@myAnimation] *ngIf="exp"></div>`,
              animations: [trigger(
                'myAnimation',
                [
                  state('*', style({'border-width': '10px', 'height': 111})),
                  state('void', style({'z-index': '20'})),
                  transition('* => *', [
                    style({ height: '200px ', '-webkit-border-radius': '10px' }),
                    animate('500ms')
                  ])
                ])]
            }
          });
        });

        describe('via DomElementSchemaRegistry', () => {
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [{provide: ElementSchemaRegistry, useClass: DomElementSchemaRegistry}]
            });
          });

          it('should normalize all CSS style properties to camelCase during compile time if a DOM schema is used',
             fakeAsync(() => {
               const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
               const fixture = TestBed.createComponent(DummyIfCmp);
               const cmp = fixture.componentInstance;
               cmp.exp = true;
               fixture.detectChanges();
               flushMicrotasks();

               const result = driver.log.pop();
               const styleProps1 = Object.keys(result['keyframeLookup'][0][1]).sort();
               const styleProps2 = Object.keys(result['keyframeLookup'][1][1]).sort();

               const expectedProps = ['WebkitBorderRadius', 'borderWidth', 'height', 'zIndex'];
               expect(styleProps1)
                   .toEqual(expectedProps);  // the start/end styles are always balanced
               expect(styleProps2).toEqual(expectedProps);
             }));

          it('should normalize all dimensional CSS style values to `px` values if the value is a number',
             fakeAsync(() => {
               const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
               const fixture = TestBed.createComponent(DummyIfCmp);
               const cmp = fixture.componentInstance;
               cmp.exp = true;
               fixture.detectChanges();
               flushMicrotasks();

               const result = driver.log.pop();

               const styleVals1 = result['keyframeLookup'][0][1];
               expect(styleVals1['zIndex']).toEqual('20');
               expect(styleVals1['height']).toEqual('200px');

               const styleVals2 = result['keyframeLookup'][1][1];
               expect(styleVals2['borderWidth']).toEqual('10px');
               expect(styleVals2['height']).toEqual('111px');
             }));

          it('should throw an error when a string-based dimensional style value is used that does not contain a unit value is detected',
             fakeAsync(() => {
               TestBed.overrideComponent(DummyIfCmp, {
                 set: {
                   template: `<div [@myAnimation] *ngIf="exp"></div>`,
                   animations: [trigger(
                       'myAnimation',
                       [state('*', style({width: '123'})), transition('* => *', animate(500))])]
                 }
               });

               expect(() => {
                 TestBed.createComponent(DummyIfCmp);
               }).toThrowError(/Please provide a CSS unit value for width:123/);
             }));
        });

        describe('not using DomElementSchemaRegistry', () => {
          beforeEach(() => {
            TestBed.configureTestingModule(
                {providers: [{provide: ElementSchemaRegistry, useClass: _NaiveElementSchema}]});

            it('should not normalize any CSS style properties to camelCase during compile time if a DOM schema is used',
               fakeAsync(() => {
                 const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
                 const fixture = TestBed.createComponent(DummyIfCmp);
                 const cmp = fixture.componentInstance;
                 cmp.exp = true;
                 fixture.detectChanges();
                 flushMicrotasks();

                 const result = driver.log.pop();
                 const styleProps1 = Object.keys(result['keyframeLookup'][0][1]).sort();
                 const styleProps2 = Object.keys(result['keyframeLookup'][1][1]).sort();

                 const expectedProps =
                     ['-webkit-border-radius', 'border-width', 'height', 'z-index'];
                 expect(styleProps1)
                     .toEqual(expectedProps);  // the start/end styles are always balanced
                 expect(styleProps2).toEqual(expectedProps);
               }));

            it('should not normalize nay dimensional CSS style values to `px` values if the value is a number',
               fakeAsync(() => {
                 const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
                 const fixture = TestBed.createComponent(DummyIfCmp);
                 const cmp = fixture.componentInstance;
                 cmp.exp = true;
                 fixture.detectChanges();
                 flushMicrotasks();

                 const result = driver.log.pop();

                 const styleVals1 = result['keyframeLookup'][0][1];
                 expect(styleVals1['z-index']).toEqual('20');
                 expect(styleVals1['height']).toEqual('200px');

                 const styleVals2 = result['keyframeLookup'][1][1];
                 expect(styleVals2['border-width']).toEqual('10px');
                 expect(styleVals2['height']).toEqual(111);
               }));
          });
        });
      });

      it('should combine repeated style steps into a single step', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
            animations: [
              trigger('myAnimation', [
                transition('void => *', [
                  style({'background': 'red'}),
                  style({'width': '100px'}),
                  style({'background': 'gold'}),
                  style({'height': '111px'}),
                  animate('999ms', style({'width': '200px', 'background': 'blue'})),
                  style({'opacity': '1'}),
                  style({'borderWidth': '100px'}),
                  animate('999ms', style({'opacity': '0', 'height': '200px', 'borderWidth': '10px'}))
                ])
              ])
            ]
          }
        });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           fixture.detectChanges();

           flushMicrotasks();

           expect(driver.log.length).toEqual(2);

           const animation1 = driver.log[0];
           expect(animation1['duration']).toEqual(999);
           expect(animation1['delay']).toEqual(0);
           expect(animation1['easing']).toEqual(null);
           expect(animation1['startingStyles'])
               .toEqual({'background': 'gold', 'width': '100px', 'height': '111px'});

           const keyframes1 = animation1['keyframeLookup'];
           expect(keyframes1[0]).toEqual([0, {'background': 'gold', 'width': '100px'}]);
           expect(keyframes1[1]).toEqual([1, {'background': 'blue', 'width': '200px'}]);

           const animation2 = driver.log[1];
           expect(animation2['duration']).toEqual(999);
           expect(animation2['delay']).toEqual(0);
           expect(animation2['easing']).toEqual(null);
           expect(animation2['startingStyles']).toEqual({'opacity': '1', 'borderWidth': '100px'});

           const keyframes2 = animation2['keyframeLookup'];
           expect(keyframes2[0]).toEqual([
             0, {'opacity': '1', 'height': '111px', 'borderWidth': '100px'}
           ]);
           expect(keyframes2[1]).toEqual([
             1, {'opacity': '0', 'height': '200px', 'borderWidth': '10px'}
           ]);
         }));

      describe('groups/sequences', () => {
        const assertPlaying = (player: MockAnimationDriver, isPlaying: any /** TODO #9100 */) => {
          const method = 'play';
          const lastEntry = player.log.length > 0 ? player.log[player.log.length - 1] : null;
          if (isPresent(lastEntry)) {
            if (isPlaying) {
              expect(lastEntry).toEqual(method);
            } else {
              expect(lastEntry).not.toEqual(method);
            }
          }
        };

        it('should run animations in sequence one by one if a top-level array is used',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
            set: {
              template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
              animations: [
                trigger('myAnimation', [transition(
                  'void => *',
                  [
                    style({'opacity': '0'}),
                    animate(1000, style({'opacity': '0.5'})),
                    animate('1000ms', style({'opacity': '0.8'})),
                    animate('1s', style({'opacity': '1'})),
                  ])])
              ]
            }
          });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;

             cmp.exp = true;
             fixture.detectChanges();

             flushMicrotasks();

             expect(driver.log.length).toEqual(3);

             const player1 = driver.log[0]['player'];
             const player2 = driver.log[1]['player'];
             const player3 = driver.log[2]['player'];

             assertPlaying(player1, true);
             assertPlaying(player2, false);
             assertPlaying(player3, false);

             player1.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, true);
             assertPlaying(player3, false);

             player2.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, false);
             assertPlaying(player3, true);

             player3.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, false);
             assertPlaying(player3, false);
           }));

        it('should run animations in parallel if a group is used', fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
            set: {
              template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
              animations: [
                trigger('myAnimation', [
                  transition('void => *', [
                    style({'width': 0, 'height': 0}),
                    group([animate(1000, style({'width': 100})), animate(5000, style({'height': 500}))]),
                    group([animate(1000, style({'width': 0})), animate(5000, style({'height': 0}))])
                  ])
                ])
              ]
            }
          });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;

             cmp.exp = true;
             fixture.detectChanges();

             flushMicrotasks();

             expect(driver.log.length).toEqual(5);

             const player1 = driver.log[0]['player'];
             const player2 = driver.log[1]['player'];
             const player3 = driver.log[2]['player'];
             const player4 = driver.log[3]['player'];
             const player5 = driver.log[4]['player'];

             assertPlaying(player1, true);
             assertPlaying(player2, false);
             assertPlaying(player3, false);
             assertPlaying(player4, false);
             assertPlaying(player5, false);

             player1.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, true);
             assertPlaying(player3, true);
             assertPlaying(player4, false);
             assertPlaying(player5, false);

             player2.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, false);
             assertPlaying(player3, true);
             assertPlaying(player4, false);
             assertPlaying(player5, false);

             player3.finish();

             assertPlaying(player1, false);
             assertPlaying(player2, false);
             assertPlaying(player3, false);
             assertPlaying(player4, true);
             assertPlaying(player5, true);
           }));

        it('should allow a group animation to be set as the entry point for an animation trigger',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `<div *ngIf="exp" [@myAnimation]="exp"></div>`,
                 animations: [trigger(
                     'myAnimation', [transition('void => *', group([
                                                  animate(1000, style({color: 'red'})),
                                                  animate('1s 0.5s', style({fontSize: 10})),
                                                ]))])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;

             cmp.exp = true;
             fixture.detectChanges();

             const player = driver.log[0]['player'];
             expect(player.parentPlayer instanceof AnimationGroupPlayer).toBe(true);
           }));
      });


      describe('keyframes', () => {
        it('should create an animation step with multiple keyframes', fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
                 animations: [trigger(
                     'myAnimation',
                     [transition('void => *', [animate(
                                                  1000, keyframes([
                                                    style([{'width': 0, offset: 0}]),
                                                    style([{'width': 100, offset: 0.25}]),
                                                    style([{'width': 200, offset: 0.75}]),
                                                    style([{'width': 300, offset: 1}])
                                                  ]))])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             cmp.exp = true;
             fixture.detectChanges();
             flushMicrotasks();

             const kf = driver.log[0]['keyframeLookup'];
             expect(kf.length).toEqual(4);
             expect(kf[0]).toEqual([0, {'width': '0'}]);
             expect(kf[1]).toEqual([0.25, {'width': '100px'}]);
             expect(kf[2]).toEqual([0.75, {'width': '200px'}]);
             expect(kf[3]).toEqual([1, {'width': '300px'}]);
           }));

        it('should fetch any keyframe styles that are not defined in the first keyframe from the previous entries or getCompuedStyle',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
            set: {
              template: `
                <div *ngIf="exp" [@myAnimation]="exp"></div>
              `,
              animations: [
                trigger('myAnimation', [
                  transition('void => *', [
                    style({'color': 'white'}),
                    animate(1000, style({'color': 'silver'})),
                    animate(1000, keyframes([
                      style([{'color': 'gold', offset: 0.25}]),
                      style([{'color': 'bronze', 'backgroundColor': 'teal', offset: 0.50}]),
                      style([{'color': 'platinum', offset: 0.75}]),
                      style([{'color': 'diamond', offset: 1}])
                    ]))
                  ])
                ])
              ]
            }
          });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             cmp.exp = true;
             fixture.detectChanges();
             flushMicrotasks();

             const kf = driver.log[1]['keyframeLookup'];
             expect(kf.length).toEqual(5);
             expect(kf[0]).toEqual([0, {'color': 'silver', 'backgroundColor': AUTO_STYLE}]);
             expect(kf[1]).toEqual([0.25, {'color': 'gold'}]);
             expect(kf[2]).toEqual([0.50, {'color': 'bronze', 'backgroundColor': 'teal'}]);
             expect(kf[3]).toEqual([0.75, {'color': 'platinum'}]);
             expect(kf[4]).toEqual([1, {'color': 'diamond', 'backgroundColor': 'teal'}]);
           }));
      });

      it('should cancel the previously running animation active with the same element/animationName pair',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div *ngIf="exp" [@myAnimation]="exp"></div>
            `,
               animations: [trigger(
                   'myAnimation',
                   [transition(
                       '* => *',
                       [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'state1';
           fixture.detectChanges();
           flushMicrotasks();

           let enterCompleted = false;
           const enterPlayer = driver.log[0]['player'];
           enterPlayer.onDone(() => enterCompleted = true);

           expect(enterCompleted).toEqual(false);

           cmp.exp = 'state2';
           fixture.detectChanges();
           flushMicrotasks();

           expect(enterCompleted).toEqual(true);
         }));

      it('should destroy all animation players once the animation is complete', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
              <div *ngIf="exp" [@myAnimation]="exp"></div>
            `,
            animations: [
              trigger('myAnimation', [
                transition('void => *', [
                  style({'background': 'red', 'opacity': '0.5'}),
                  animate(500, style({'background': 'black'})),
                  group([
                    animate(500, style({'background': 'black'})),
                    animate(1000, style({'opacity': '0.2'})),
                  ]),
                  sequence([
                    animate(500, style({'opacity': '1'})),
                    animate(1000, style({'background': 'white'}))
                  ])
                ])
              ])
            ]
          }
        });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           cmp.exp = true;
           fixture.detectChanges();

           flushMicrotasks();

           expect(driver.log.length).toEqual(5);

           driver.log.forEach(entry => entry['player'].finish());
           driver.log.forEach(entry => {
             const player = <MockAnimationDriver>entry['player'];
             expect(player.log[player.log.length - 2]).toEqual('finish');
             expect(player.log[player.log.length - 1]).toEqual('destroy');
           });
         }));

      it('should use first matched animation when multiple animations are registered',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
              <div [@rotate]="exp"></div>
              <div [@rotate]="exp2"></div>
            `,
            animations: [
              trigger(
                'rotate',
                [
                  transition(
                    'start => *',
                    [
                      style({'color': 'white'}),
                      animate(500, style({'color': 'red'}))
                    ]),
                  transition(
                    'start => end',
                    [
                      style({'color': 'white'}),
                      animate(500, style({'color': 'pink'}))
                    ])
                ])
            ]
          }
        });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'start';
           cmp.exp2 = 'start';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(0);

           cmp.exp = 'something';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(1);

           const animation1 = driver.log[0];
           const keyframes1 = animation1['keyframeLookup'];
           const toStyles1 = keyframes1[1][1];
           expect(toStyles1['color']).toEqual('red');

           cmp.exp2 = 'end';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(2);

           const animation2 = driver.log[1];
           const keyframes2 = animation2['keyframeLookup'];
           const toStyles2 = keyframes2[1][1];
           expect(toStyles2['color']).toEqual('red');
         }));

      it('should not remove the element until the void transition animation is complete',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="my-if" *ngIf="exp" [@myAnimation]></div>
            `,
               animations: [trigger(
                   'myAnimation',
                   [transition('* => void', [animate(1000, style({'opacity': '0'}))])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           cmp.exp = false;
           fixture.detectChanges();
           flushMicrotasks();

           const player = driver.log[0]['player'];
           const container = fixture.nativeElement;
           let ifElm = getDOM().querySelector(container, '.my-if');
           expect(ifElm).toBeTruthy();

           player.finish();
           ifElm = getDOM().querySelector(container, '.my-if');
           expect(ifElm).toBeFalsy();
         }));

      it('should fill an animation with the missing style values if not defined within an earlier style step',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@myAnimation]="exp"></div>
            `,
               animations:
                   [trigger('myAnimation', [transition(
                                               '* => *',
                                               [
                                                 animate(1000, style({'opacity': '0'})),
                                                 animate(1000, style({'opacity': '1'}))
                                               ])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'state1';
           fixture.detectChanges();
           flushMicrotasks();

           const animation1 = driver.log[0];
           const keyframes1 = animation1['keyframeLookup'];
           expect(keyframes1[0]).toEqual([0, {'opacity': AUTO_STYLE}]);
           expect(keyframes1[1]).toEqual([1, {'opacity': '0'}]);

           const animation2 = driver.log[1];
           const keyframes2 = animation2['keyframeLookup'];
           expect(keyframes2[0]).toEqual([0, {'opacity': '0'}]);
           expect(keyframes2[1]).toEqual([1, {'opacity': '1'}]);
         }));

      it('should perform two transitions in parallel if defined in different state triggers',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@one]="exp" [@two]="exp2"></div>
            `,
               animations: [
                 trigger(
                     'one',
                     [transition(
                         'state1 => state2',
                         [style({'opacity': '0'}), animate(1000, style({'opacity': '1'}))])]),
                 trigger(
                     'two',
                     [transition(
                         'state1 => state2',
                         [style({'width': 100}), animate(1000, style({'width': 1000}))])])
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'state1';
           cmp.exp2 = 'state1';
           fixture.detectChanges();
           flushMicrotasks();

           cmp.exp = 'state2';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(1);

           let count = 0;
           const animation1 = driver.log[0];
           const player1 = animation1['player'];
           player1.onDone(() => count++);

           expect(count).toEqual(0);

           cmp.exp2 = 'state2';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(2);
           expect(count).toEqual(0);

           const animation2 = driver.log[1];
           const player2 = animation2['player'];
           player2.onDone(() => count++);

           expect(count).toEqual(0);
           player1.finish();
           expect(count).toEqual(1);
           player2.finish();
           expect(count).toEqual(2);
         }));
    });

    describe('ng directives', () => {
      describe('*ngFor', () => {
        const tpl = '<div *ngFor="let item of items" @trigger>{{ item }}</div>';

        const getText = (node: any) => node.innerHTML ? node.innerHTML : node.children[0].data;

        const assertParentChildContents = (parent: any, content: string) => {
          const values: string[] = [];
          for (let i = 0; i < parent.childNodes.length; i++) {
            const child = parent.childNodes[i];
            if (child['nodeType'] == 1) {
              values.push(getText(child).trim());
            }
          }
          const value = values.join(' -> ');
          expect(value).toEqual(content);
        };

        it('should animate when items are inserted into the list at different points',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: tpl,
                 animations: [trigger('trigger', [transition('void => *', [animate(1000)])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             const parent = fixture.nativeElement;
             cmp.items = [0, 2, 4, 6, 8];
             fixture.detectChanges();
             flushMicrotasks();

             expect(driver.log.length).toEqual(5);
             assertParentChildContents(parent, '0 -> 2 -> 4 -> 6 -> 8');

             driver.log = [];
             cmp.items = [0, 1, 2, 3, 4, 5, 6, 7, 8];
             fixture.detectChanges();
             flushMicrotasks();

             expect(driver.log.length).toEqual(4);
             assertParentChildContents(parent, '0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8');
           }));

        it('should animate when items are removed + moved into the list at different points and retain DOM ordering during the animation',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: tpl,
                 animations: [trigger('trigger', [transition('* => *', [animate(1000)])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             const parent = fixture.nativeElement;

             cmp.items = [0, 1, 2, 3, 4];
             fixture.detectChanges();
             flushMicrotasks();

             expect(driver.log.length).toEqual(5);
             driver.log = [];

             cmp.items = [3, 4, 0, 9];
             fixture.detectChanges();
             flushMicrotasks();

             // TODO (matsko): update comment below once move animations are a thing
             // there are only three animations since we do
             // not yet support move-based animations
             expect(driver.log.length).toEqual(3);

             // move(~), add(+), remove(-)
             // -1, -2, ~3, ~4, ~0, +9
             const rm0 = driver.log.shift();
             const rm1 = driver.log.shift();
             const in0 = driver.log.shift();

             // we want to assert that the DOM chain is still preserved
             // until the animations are closed
             assertParentChildContents(parent, '3 -> 4 -> 0 -> 9 -> 1 -> 2');

             rm0['player'].finish();
             assertParentChildContents(parent, '3 -> 4 -> 0 -> 9 -> 2');

             rm1['player'].finish();
             assertParentChildContents(parent, '3 -> 4 -> 0 -> 9');
           }));
      });
    });

    describe('DOM order tracking', () => {
      if (!getDOM().supportsDOMEvents()) return;

      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: AnimationDriver, useClass: InnerContentTrackingAnimationDriver}]
        });
      });

      it('should evaluate all inner children and their bindings before running the animation on a parent',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp">
                <div *ngIf="exp2" class="inner">inner child guy</div>
              </div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('final', style({'height': '*'})), transition('* => *', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');
           cmp.exp = true;
           cmp.exp2 = true;
           fixture.detectChanges();
           flushMicrotasks();

           const animation = driver.log.pop();
           const player = <InnerContentTrackingAnimationPlayer>animation['player'];
           expect(player.capturedInnerText).toEqual('inner child guy');
         }));

      it('should run the initialization stage after all children have been evaluated',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp">
                <div style="height:20px"></div>
                <div *ngIf="exp2" style="height:40px;" class="inner">inner child guy</div>
              </div>
            `,
               animations:
                   [trigger('status', [transition('* => *', sequence([
                                                    animate(1000, style({height: 0})),
                                                    animate(1000, style({height: '*'}))
                                                  ]))])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           cmp.exp2 = true;
           fixture.detectChanges();
           flushMicrotasks();
           fixture.detectChanges();

           const animation = driver.log.pop();
           const player = <InnerContentTrackingAnimationPlayer>animation['player'];

           // this is just to confirm that the player is using the parent element
           expect(player.element.className).toEqual('target');
           expect(player.computedHeight).toEqual('60px');
         }));

      it('should not trigger animations more than once within a view that contains multiple animation triggers',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div *ngIf="exp" @one><div class="inner"></div></div>
              <div *ngIf="exp2" @two><div class="inner"></div></div>
            `,
               animations: [
                 trigger('one', [transition('* => *', [animate(1000)])]),
                 trigger('two', [transition('* => *', [animate(2000)])])
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           cmp.exp2 = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(2);
           const animation1 = driver.log.pop();
           const animation2 = driver.log.pop();
           const player1 = <InnerContentTrackingAnimationPlayer>animation1['player'];
           const player2 = <InnerContentTrackingAnimationPlayer>animation2['player'];
           expect(player1.playAttempts).toEqual(1);
           expect(player2.playAttempts).toEqual(1);
         }));

      it('should trigger animations when animations are detached from the page', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div *ngIf="exp" @trigger><div class="inner"></div></div>
            `,
               animations: [
                 trigger('trigger', [transition('* => void', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(0);

           cmp.exp = false;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(1);
           const animation = driver.log.pop();
           const player = <InnerContentTrackingAnimationPlayer>animation['player'];
           expect(player.playAttempts).toEqual(1);
         }));

      it('should always trigger animations on the parent first before starting the child',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div *ngIf="exp" [@outer]="exp">
                outer
                <div *ngIf="exp2" [@inner]="exp">
                  inner
<               </div>
<             </div>
            `,
               animations: [
                 trigger('outer', [transition('* => *', [animate(1000)])]),
                 trigger('inner', [transition('* => *', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           cmp.exp2 = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(2);
           const inner: any = driver.log.pop();
           const innerPlayer: any = <InnerContentTrackingAnimationPlayer>inner['player'];
           const outer: any = driver.log.pop();
           const outerPlayer: any = <InnerContentTrackingAnimationPlayer>outer['player'];

           expect(InnerContentTrackingAnimationPlayer.initLog).toEqual([
             outerPlayer.element, innerPlayer.element
           ]);
         }));

      it('should trigger animations that exist in nested views even if a parent embedded view does not contain an animation',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div *ngIf="exp" [@outer]="exp">
                outer
                <div *ngIf="exp">
                  middle
                  <div *ngIf="exp2" [@inner]="exp">
                    inner
                  </div>
<               </div>
<             </div>
            `,
               animations: [
                 trigger('outer', [transition('* => *', [animate(1000)])]),
                 trigger('inner', [transition('* => *', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;
           cmp.exp2 = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(2);
           const inner: any = driver.log.pop();
           const innerPlayer: any = <InnerContentTrackingAnimationPlayer>inner['player'];
           const outer: any = driver.log.pop();
           const outerPlayer: any = <InnerContentTrackingAnimationPlayer>outer['player'];

           expect(InnerContentTrackingAnimationPlayer.initLog).toEqual([
             outerPlayer.element, innerPlayer.element
           ]);
         }));
    });

    describe('animation output events', () => {
      it('should fire the associated animation output expression when the animation starts even if no animation is fired',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@trigger]="exp" (@trigger.start)="callback($event)"></div>
            `,
               animations: [
                 trigger('trigger', [transition('one => two', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           let isAnimationRunning = false;
           let calls = 0;
           const cmp = fixture.componentInstance;
           cmp.callback = (e: AnimationTransitionEvent) => {
             isAnimationRunning = e.totalTime > 0;
             calls++;
           };

           cmp.exp = 'one';
           fixture.detectChanges();
           flushMicrotasks();

           expect(calls).toEqual(1);
           expect(isAnimationRunning).toEqual(false);

           cmp.exp = 'two';
           fixture.detectChanges();
           flushMicrotasks();

           expect(calls).toEqual(2);
           expect(isAnimationRunning).toEqual(true);
         }));

      it('should fire the associated animation output expression when the animation ends even if no animation is fired',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@trigger]="exp" (@trigger.done)="callback($event)"></div>
            `,
               animations: [
                 trigger('trigger', [transition('one => two', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           let isAnimationRunning = false;
           let calls = 0;
           const cmp = fixture.componentInstance;
           cmp.callback = (e: AnimationTransitionEvent) => {
             isAnimationRunning = e.totalTime > 0;
             calls++;
           };
           cmp.exp = 'one';
           fixture.detectChanges();

           expect(calls).toEqual(0);
           flushMicrotasks();

           expect(calls).toEqual(1);
           expect(isAnimationRunning).toEqual(false);

           cmp.exp = 'two';
           fixture.detectChanges();

           expect(calls).toEqual(1);

           const player = driver.log.shift()['player'];
           player.finish();

           expect(calls).toEqual(2);
           expect(isAnimationRunning).toEqual(true);
         }));

      it('should emit the `fromState` and `toState` within the event data when a callback is fired',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@trigger]="exp" (@trigger.start)="callback($event)"></div>
            `,
               animations: [
                 trigger('trigger', [transition('one => two', [animate(1000)])]),
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           let eventData: AnimationTransitionEvent = null;
           const cmp = fixture.componentInstance;
           cmp.callback = (e: AnimationTransitionEvent) => { eventData = e; };
           cmp.exp = 'one';
           fixture.detectChanges();
           flushMicrotasks();
           expect(eventData.fromState).toEqual('void');
           expect(eventData.toState).toEqual('one');

           cmp.exp = 'two';
           fixture.detectChanges();
           flushMicrotasks();
           expect(eventData.fromState).toEqual('one');
           expect(eventData.toState).toEqual('two');
         }));

      it('should emit the `totalTime` values for an animation callback', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@trigger]="exp" (@trigger.start)="callback1($event)"></div>
              <div [@noTrigger]="exp2" (@noTrigger.start)="callback2($event)"></div>
            `,
               animations: [
                 trigger(
                     'trigger',
                     [transition(
                         '* => *',
                         [animate('1s 750ms', style({})), animate('2000ms 0ms', style({}))])]),
                 trigger('noTrigger', [])
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           let eventData1: AnimationTransitionEvent = null;
           let eventData2: AnimationTransitionEvent = null;
           const cmp = fixture.componentInstance;
           cmp.callback1 = (e: AnimationTransitionEvent) => { eventData1 = e; };
           cmp.callback2 = (e: AnimationTransitionEvent) => { eventData2 = e; };
           cmp.exp = 'one';
           fixture.detectChanges();
           flushMicrotasks();
           expect(eventData1.totalTime).toEqual(3750);

           cmp.exp2 = 'two';
           fixture.detectChanges();
           flushMicrotasks();
           expect(eventData2.totalTime).toEqual(0);
         }));

      it('should successfully update the component view when an animation start callback is fired',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@trigger]="exp" (@trigger.start)="exp2='look at me'">{{ exp2 }}</div>
            `,
               animations: [
                 trigger(
                     'trigger',
                     [transition(
                         '* => *',
                         [animate('1s 750ms', style({})), animate('2000ms 0ms', style({}))])]),
               ]
             }
           });

           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           cmp.exp2 = 'ignore me';
           cmp.exp = 'one';

           fixture.detectChanges();
           flushMicrotasks();
           fixture.detectChanges();

           const container = fixture.nativeElement;
           expect(getDOM().getInnerHTML(container)).toContain('look at me');
         }));

      it('should throw an error if an animation output is referenced is not defined within the component',
         () => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div [@something]="exp" (@something.done)="callback($event)"></div>
            `
             }
           });

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyIfCmp);
             fixture.detectChanges();
           } catch (e) {
             message = e.message;
           }

           expect(message).toMatch(/Couldn't find an animation entry for "something"/);
         });

      it('should throw an error if an animation output is referenced that is not bound to as a property on the same element',
         () => {
           TestBed.overrideComponent(DummyLoadingCmp, {
             set: {
               template: `
                  <if-cmp (@trigger.done)="callback($event)"></if-cmp>
               `
             }
           });
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div [@trigger]="exp"></div>
            `,
               animations: [trigger('trigger', [transition('one => two', [animate(1000)])])]
             }
           });

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyIfCmp);
             fixture.detectChanges();
           } catch (e) {
             message = e.message;
           }

           expect(message).toMatch(
               /Unable to listen on \(@trigger.done\) because the animation trigger \[@trigger\] isn't being used on the same element/);
         });

      it('should throw an error if an animation output is referenced that is not bound to as a property on the same element',
         () => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div (@trigger.done)="callback($event)"></div>
            `,
               animations: [trigger('trigger', [transition('one => two', [animate(1000)])])]
             }
           });

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyIfCmp);
             fixture.detectChanges();
           } catch (e) {
             message = e.message;
           }

           expect(message).toMatch(
               /Unable to listen on \(@trigger.done\) because the animation trigger \[@trigger\] isn't being used on the same element/);
         });

      it('should throw an error if an unsupported animation output phase name is used', () => {
        TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
              <div (@trigger.jump)="callback($event)"></div>
            `,
            animations: [trigger('trigger', [transition('one => two', [animate(1000)])])]
          }
        });

        let message = '';
        try {
          const fixture = TestBed.createComponent(DummyIfCmp);
          fixture.detectChanges();
        } catch (e) {
          message = e.message;
        }

        expect(message).toMatch(
            /The provided animation output phase value "jump" for "@trigger" is not supported \(use start or done\)/);
      });

      it('should throw an error if the animation output event phase value is missing', () => {
        TestBed.overrideComponent(DummyIfCmp, {
          set: {
            template: `
              <div [@trigger]="exp" (@trigger)="callback($event)"></div>
            `,
            animations: [trigger('trigger', [transition('one => two', [animate(1000)])])]
          }
        });

        let message = '';
        try {
          const fixture = TestBed.createComponent(DummyIfCmp);
          fixture.detectChanges();
        } catch (e) {
          message = e.message;
        }

        expect(message).toMatch(
            /The animation trigger output event \(@trigger\) is missing its phase value name \(start or done are currently supported\)/);
      });

      it('should throw an error when an animation output is referenced but the host-level animation binding is missing',
         () => {
           TestBed.overrideComponent(
               DummyLoadingCmp, {set: {host: {'(@trigger.done)': 'callback($event)'}}});

           let message = '';
           try {
             const fixture = TestBed.createComponent(DummyLoadingCmp);
             fixture.detectChanges();
           } catch (e) {
             message = e.message;
           }

           expect(message).toMatch(
               /Unable to listen on \(@trigger.done\) because the animation trigger \[@trigger\] isn't being used on the same element/);
         });

      it('should allow host and element-level animation bindings to be defined on the same tag/component',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyLoadingCmp, {
             set: {
               host: {
                 '[attr.title]': 'exp',
                 '[@loading]': 'exp',
                 '(@loading.start)': 'callback($event)'
               },
               animations: [trigger('loading', [transition('* => *', [animate(1000)])])]
             }
           });
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <dummy-loading-cmp [@trigger]="exp" (@trigger.start)="callback($event)"></dummy-loading-cmp>
            `,
               animations: [trigger('trigger', [transition('* => *', [animate(1000)])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           let ifCalls = 0;
           let loadingCalls = 0;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const ifCmp = fixture.componentInstance;
           const loadingCmp = fixture.debugElement.childNodes[1].componentInstance;

           ifCmp.callback = (e: any) => ifCalls++;
           loadingCmp.callback = (e: any) => loadingCalls++;

           expect(ifCalls).toEqual(0);
           expect(loadingCalls).toEqual(0);

           ifCmp.exp = 'one';
           loadingCmp.exp = 'one';
           fixture.detectChanges();
           flushMicrotasks();

           expect(ifCalls).toEqual(1);
           expect(loadingCalls).toEqual(1);

           ifCmp.exp = 'two';
           loadingCmp.exp = 'two';
           fixture.detectChanges();
           flushMicrotasks();

           expect(ifCalls).toEqual(2);
           expect(loadingCalls).toEqual(2);
         }));


      it('should allow animation triggers to trigger on the component when bound to embedded views via ngFor',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngFor="let item of items"
                  (@trigger.start)="callback($event, item, 'start')"
                  (@trigger.done)="callback($event, item, 'done')"
                  @trigger>{{ item }}</div>
              `,
               animations: [trigger('trigger', [transition('* => *', [animate(1000)])])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           const startCalls = [0, 0, 0, 0, 0];
           const doneCalls = [0, 0, 0, 0, 0];
           cmp.callback = (e: any, index: number, phase: string) => {
             (phase == 'start' ? startCalls : doneCalls)[index] = 1;
           };

           cmp.items = [0, 1, 2, 3, 4];
           fixture.detectChanges();
           flushMicrotasks();

           for (let i = 0; i < cmp.items.length; i++) {
             expect(startCalls[i]).toEqual(1);
           }

           driver.log[0]['player'].finish();
           driver.log[2]['player'].finish();
           driver.log[4]['player'].finish();

           expect(doneCalls[0]).toEqual(1);
           expect(doneCalls[1]).toEqual(0);
           expect(doneCalls[2]).toEqual(1);
           expect(doneCalls[3]).toEqual(0);
           expect(doneCalls[4]).toEqual(1);

           driver.log[1]['player'].finish();
           driver.log[3]['player'].finish();

           expect(doneCalls[0]).toEqual(1);
           expect(doneCalls[1]).toEqual(1);
           expect(doneCalls[2]).toEqual(1);
           expect(doneCalls[3]).toEqual(1);
           expect(doneCalls[4]).toEqual(1);
         }));

      it('should expose the element associated with the animation within the callback event',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngFor="let item of items"
                  (@trigger.start)="callback($event)"
                  @trigger class="target">{{ item }}</div>
              `,
               animations: [trigger('trigger', [transition('* => *', [animate(1000)])])]
             }
           });

           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           const elements: ElementRef[] = [];
           cmp.callback = (e: AnimationTransitionEvent) => elements.push(e.element);

           cmp.items = [0, 1, 2, 3, 4];
           fixture.detectChanges();
           flushMicrotasks();

           const targetElements =
               <any[]>getDOM().querySelectorAll(fixture.nativeElement, '.target');
           for (let i = 0; i < elements.length; i++) {
             expect(elements[i].nativeElement).toBe(targetElements[i]);
           }
         }));

      it('should expose the trigger associated with the animation within the callback event',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
                <div *ngIf="exp"
                  @t1
                  (@t1.start)="callback($event)"
                  (@t1.done)="callback($event)"></div>
                <div *ngIf="exp"
                  @t2
                  (@t2.start)="callback($event)"
                  (@t2.done)="callback($event)"></div>
              `,
               animations: [
                 trigger('t1', [transition('* => *', [animate(1000)])]),
                 trigger('t2', [transition('* => *', [animate(1000)])])
               ]
             }
           });

           const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           let triggers: string[] = [];
           cmp.callback = (e: AnimationTransitionEvent) =>
               triggers.push(`${e.triggerName}-${e.phaseName}`);

           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();

           expect(triggers).toEqual(['t1-start', 't2-start']);
           triggers = [];

           driver.log.shift()['player'].finish();
           driver.log.shift()['player'].finish();

           expect(triggers).toEqual(['t1-done', 't2-done']);
         }));
    });

    describe('ng directives', () => {
      describe('[ngClass]', () => {
        it('should persist ngClass class values when a remove element animation is active',
           fakeAsync(() => {
             TestBed.overrideComponent(DummyIfCmp, {
               set: {
                 template: `
                <div [ngClass]="exp2" *ngIf="exp" @trigger></div>
              `,
                 animations: [trigger('trigger', [transition('* => void', [animate(1000)])])]
               }
             });

             const driver = TestBed.get(AnimationDriver) as InnerContentTrackingAnimationDriver;
             const fixture = TestBed.createComponent(DummyIfCmp);
             const cmp = fixture.componentInstance;
             cmp.exp = true;
             cmp.exp2 = 'blue';
             fixture.detectChanges();
             flushMicrotasks();

             expect(driver.log.length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();
             flushMicrotasks();

             const animation = driver.log.pop();
             const element = animation['element'];
             (<any>expect(element)).toHaveCssClass('blue');
           }));
      });
    });

    describe('animation states', () => {
      it('should throw an error when an animation is referenced that isn\'t defined within the component annotation',
         () => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: []
             }
           });

           let failureMessage = '';
           try {
             const fixture = TestBed.createComponent(DummyLoadingCmp);
           } catch (e) {
             failureMessage = e.message;
           }

           expect(failureMessage).toMatch(/Template parse errors:/);
           expect(failureMessage).toMatch(/Couldn't find an animation entry for "status"/);
         });

      it('should throw an error if an animation trigger is registered but is already in use', () => {
        TestBed.overrideComponent(
            DummyIfCmp, {set: {animations: [trigger('matias', []), trigger('matias', [])]}});

        let failureMessage = '';
        try {
          const fixture = TestBed.createComponent(DummyLoadingCmp);
        } catch (e) {
          failureMessage = e.message;
        }

        expect(failureMessage).toMatch(/Animation parse errors:/);
        expect(failureMessage)
            .toMatch(
                /The animation trigger "matias" has already been registered for the DummyIfCmp component/);
      });

      it('should be permitted to be registered on the host element', fakeAsync(() => {
           TestBed.overrideComponent(DummyLoadingCmp, {
             set: {
               host: {'[@loading]': 'exp'},
               animations: [trigger(
                   'loading',
                   [
                     state('final', style({'background': 'grey'})),
                     transition('* => final', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyLoadingCmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'final';
           fixture.detectChanges();
           flushMicrotasks();

           const animation = driver.log.pop();
           const kf = animation['keyframeLookup'];
           expect(kf[1]).toEqual([1, {'background': 'grey'}]);
         }));

      it('should throw an error if a host-level referenced animation is not defined within the component',
         () => {
           TestBed.overrideComponent(DummyLoadingCmp, {set: {animations: []}});

           let failureMessage = '';
           try {
             const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           } catch (e) {
             failureMessage = e.message;
           }

           expect(failureMessage).toMatch(/Couldn't find an animation entry for "loading"/);
         });

      it('should retain the destination animation state styles once the animation is complete',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('final', style({'top': 100})), transition('* => final', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');
           cmp.exp = 'final';
           fixture.detectChanges();
           flushMicrotasks();

           const animation = driver.log[0];
           const player = animation['player'];
           player.finish();

           expect(getDOM().getStyle(node, 'top')).toEqual('100px');
         }));

      it('should animate to and retain the default animation state styles once the animation is complete if defined',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state(DEFAULT_STATE, style({'background': 'grey'})),
                     state('green', style({'background': 'green'})),
                     state('red', style({'background': 'red'})),
                     transition('* => *', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');
           cmp.exp = 'green';
           fixture.detectChanges();
           flushMicrotasks();

           let animation = driver.log.pop();
           let kf = animation['keyframeLookup'];
           expect(kf[1]).toEqual([1, {'background': 'green'}]);
           let player = animation['player'];
           player.finish();

           cmp.exp = 'blue';
           fixture.detectChanges();
           flushMicrotasks();

           animation = driver.log.pop();
           kf = animation['keyframeLookup'];
           expect(kf[0]).toEqual([0, {'background': 'green'}]);
           expect(kf[1]).toEqual([1, {'background': 'grey'}]);
           player = animation['player'];
           player.finish();

           cmp.exp = 'red';
           fixture.detectChanges();
           flushMicrotasks();

           animation = driver.log.pop();
           kf = animation['keyframeLookup'];
           expect(kf[0]).toEqual([0, {'background': 'grey'}]);
           expect(kf[1]).toEqual([1, {'background': 'red'}]);
           player = animation['player'];
           player.finish();

           cmp.exp = 'orange';
           fixture.detectChanges();
           flushMicrotasks();

           animation = driver.log.pop();
           kf = animation['keyframeLookup'];
           expect(kf[0]).toEqual([0, {'background': 'red'}]);
           expect(kf[1]).toEqual([1, {'background': 'grey'}]);
           player = animation['player'];
           player.finish();
         }));

      it('should seed in the origin animation state styles into the first animation step',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('void', style({'height': '100px'})),
                     transition('* => *', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');
           cmp.exp = 'final';
           fixture.detectChanges();
           flushMicrotasks();

           const animation = driver.log[0];
           expect(animation['startingStyles']).toEqual({'height': '100px'});
         }));

      it('should seed in the previous animation styles into the transition if the previous transition was interupted midway',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
            set: {
              template: `
              <div class="target" [@status]="exp"></div>
            `,
              animations: [trigger(
                'status',
                [
                  state('*', style({ opacity: 0 })),
                  state('a', style({height: '100px', width: '200px'})),
                  state('b', style({height: '1000px' })),
                  transition('* => *', [
                    animate(1000, style({ fontSize: '20px' })),
                    animate(1000)
                  ])
                ])]
            }
          });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'a';
           fixture.detectChanges();
           flushMicrotasks();
           driver.log = [];

           cmp.exp = 'b';
           fixture.detectChanges();
           flushMicrotasks();

           const animation = driver.log[0];
           expect(animation['previousStyles']).toEqual({opacity: '0', fontSize: '*'});
         }));

      it('should perform a state change even if there is no transition that is found',
         fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('void', style({'width': 0})),
                     state('final', style({'width': 100})),
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');
           cmp.exp = 'final';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.length).toEqual(0);
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'width')).toEqual('100px');
         }));

      it('should allow multiple states to be defined with the same styles', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('a, c', style({'height': '100px'})),
                     state('b, d', style({'width': '100px'}))
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');

           cmp.exp = 'a';
           fixture.detectChanges();
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'height')).toEqual('100px');
           expect(getDOM().getStyle(node, 'width')).not.toEqual('100px');

           cmp.exp = 'b';
           fixture.detectChanges();
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'height')).not.toEqual('100px');
           expect(getDOM().getStyle(node, 'width')).toEqual('100px');

           cmp.exp = 'c';
           fixture.detectChanges();
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'height')).toEqual('100px');
           expect(getDOM().getStyle(node, 'width')).not.toEqual('100px');

           cmp.exp = 'd';
           fixture.detectChanges();
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'height')).not.toEqual('100px');
           expect(getDOM().getStyle(node, 'width')).toEqual('100px');

           cmp.exp = 'e';
           fixture.detectChanges();
           flushMicrotasks();

           expect(getDOM().getStyle(node, 'height')).not.toEqual('100px');
           expect(getDOM().getStyle(node, 'width')).not.toEqual('100px');
         }));

      it('should allow multiple transitions to be defined with the same sequence', fakeAsync(() => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     transition('a => b, b => c', [animate(1000)]),
                     transition('* => *', [animate(300)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           const node = getDOM().querySelector(fixture.nativeElement, '.target');

           cmp.exp = 'a';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.pop()['duration']).toEqual(300);

           cmp.exp = 'b';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.pop()['duration']).toEqual(1000);

           cmp.exp = 'c';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.pop()['duration']).toEqual(1000);

           cmp.exp = 'd';
           fixture.detectChanges();
           flushMicrotasks();

           expect(driver.log.pop()['duration']).toEqual(300);
         }));

      it('should balance the animation with the origin/destination styles as keyframe animation properties',
         () => {
           TestBed.overrideComponent(DummyIfCmp, {
             set: {
               template: `
              <div class="target" [@status]="exp"></div>
            `,
               animations: [trigger(
                   'status',
                   [
                     state('void', style({'height': '100px', 'opacity': '0'})),
                     state('final', style({'height': '333px', 'width': '200px'})),
                     transition('void => final', [animate(1000)])
                   ])]
             }
           });

           const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
           const fixture = TestBed.createComponent(DummyIfCmp);
           const cmp = fixture.componentInstance;
           getDOM().querySelector(fixture.nativeElement, '.target');

           cmp.exp = 'final';
           fixture.detectChanges();

           const animation = driver.log.pop();
           const kf = animation['keyframeLookup'];

           expect(kf[0]).toEqual([0, {'height': '100px', 'opacity': '0', 'width': AUTO_STYLE}]);

           expect(kf[1]).toEqual([1, {'height': '333px', 'opacity': AUTO_STYLE, 'width': '200px'}]);
         });
    });

    it('should not use the previous animation\'s styling if the previous animation has already finished',
       fakeAsync(() => {
         TestBed.overrideComponent(DummyIfCmp, {
           set: {
             template: `
            <div [@myAnimation]="exp"></div>
          `,
             animations: [trigger(
                 'myAnimation',
                 [
                   state('a', style({color: 'red'})), state('b', style({color: 'red'})),
                   transition('* => *', animate(1000))
                 ])]
           }
         });

         const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
         const fixture = TestBed.createComponent(DummyIfCmp);
         const cmp = fixture.componentInstance;

         cmp.exp = 'a';
         fixture.detectChanges();
         flushMicrotasks();

         const animation1 = driver.log.shift();
         expect(animation1['previousStyles']).toEqual({});

         animation1['player'].finish();

         cmp.exp = 'b';
         fixture.detectChanges();
         flushMicrotasks();

         const animation2 = driver.log.shift();
         expect(animation2['previousStyles']).toEqual({});
       }));
  });

  describe('error handling', () => {
    if (!getDOM().supportsWebAnimation()) return;

    it('should not throw an error when an animation exists within projected content that is not bound to the DOM',
       fakeAsync(() => {
         TestBed.configureTestingModule({
           declarations: [DummyIfCmp, DummyLoadingCmp],
           providers: [{provide: AnimationDriver, useClass: WebAnimationsDriver}],
           imports: [CommonModule]
         });
         TestBed.overrideComponent(DummyIfCmp, {
           set: {
             template: `
               <dummy-loading-cmp [exp2]="exp">
                 <div [@myAnimation]="exp ? 'true' : 'false'" (@myAnimation.done)="callback()">world</div>
               </dummy-loading-cmp>
          `,
             animations: [trigger('myAnimation', [transition(
                                                     '* => *',
                                                     [
                                                       style({opacity: 0}),
                                                       animate(1000, style({opacity: 1})),
                                                     ])])]
           }
         });
         TestBed.overrideComponent(
             DummyLoadingCmp, {set: {template: `hello <ng-content *ngIf="exp2"></ng-content>`}});

         const fixture = TestBed.createComponent(DummyIfCmp);
         const cmp = fixture.componentInstance;
         const container = fixture.nativeElement;
         let animationCalls = 0;
         cmp.callback = () => animationCalls++;

         cmp.exp = false;
         fixture.detectChanges();
         flushMicrotasks();

         expect(animationCalls).toBe(1);
         expect(getDOM().getText(container).trim()).toEqual('hello');

         cmp.exp = true;
         fixture.detectChanges();
         flushMicrotasks();

         expect(animationCalls).toBe(2);
         expect(getDOM().getText(container).trim()).toMatch(/hello[\s\r\n]+world/m);
       }));
  });

  describe('full animation integration tests', () => {
    if (!getDOM().supportsWebAnimation()) return;

    let el: any, testProviders: any[];

    beforeEach(() => {
      destroyPlatform();

      const fakeDoc = getDOM().createHtmlDocument();
      el = getDOM().createElement('animation-app', fakeDoc);
      getDOM().appendChild(fakeDoc.body, el);
      testProviders = [
        {provide: DOCUMENT, useValue: fakeDoc},
        {provide: AnimationDriver, useClass: ExtendedWebAnimationsDriver}
      ];
    });

    function assertStatus(value: string) {
      const text = getDOM().getText(el);
      const regexp = new RegExp(`Animation Status: ${value}`);
      expect(text).toMatch(regexp);
    }

    function assertTime(value: number) {
      const text = getDOM().getText(el);
      const regexp = new RegExp(`Animation Time: ${value}`);
      expect(text).toMatch(regexp);
    }

    function finishAnimation(player: WebAnimationsPlayer, cb: () => any) {
      getDOM().dispatchEvent(player.domPlayer, getDOM().createEvent('finish'));
      Promise.resolve(null).then(cb);
    }

    afterEach(() => { destroyPlatform(); });

    it('should automatically run change detection when the animation done callback code updates any bindings',
       (asyncDone: Function) => {
         bootstrap(AnimationAppCmp, testProviders).then(ref => {
           const appRef = <ApplicationRef>ref.injector.get(ApplicationRef);
           const appCmp: AnimationAppCmp =
               appRef.components.find(cmp => cmp.componentType === AnimationAppCmp).instance;
           const driver: ExtendedWebAnimationsDriver = ref.injector.get(AnimationDriver);
           const zone: NgZone = ref.injector.get(NgZone);
           zone.run(() => {
             assertStatus('pending');
             assertTime(0);
             appCmp.animationStatus = 'on';
             zone.runOutsideAngular(() => {
               setTimeout(() => {
                 assertStatus('started');
                 assertTime(555);
                 const player = driver.players.pop();
                 finishAnimation(player, () => {
                   assertStatus('done');
                   assertTime(555);
                   asyncDone();
                 });
               }, 0);
             });
           });
         });
       });

    it('should not run change detection for an animation that contains multiple steps until a callback is fired',
       (asyncDone: Function) => {
         bootstrap(AnimationAppCmp, testProviders).then(ref => {
           const appRef = <ApplicationRef>ref.injector.get(ApplicationRef);
           const appCmpDetails: any =
               appRef.components.find(cmp => cmp.componentType === AnimationAppCmp);
           const appCD = appCmpDetails.changeDetectorRef;
           const appCmp: AnimationAppCmp = appCmpDetails.instance;
           const driver: ExtendedWebAnimationsDriver = ref.injector.get(AnimationDriver);
           const zone: NgZone = ref.injector.get(NgZone);

           let player: WebAnimationsPlayer;
           let onDoneCalls: string[] = [];
           function onDoneFn(value: string) {
             return () => {
               NgZone.assertNotInAngularZone();
               onDoneCalls.push(value);
               appCmp.status = value;
             };
           };

           zone.run(() => {
             assertStatus('pending');
             appCmp.animationWithSteps = 'on';

             setTimeout(() => {
               expect(driver.players.length).toEqual(3);
               assertStatus('started');

               zone.runOutsideAngular(() => {
                 setTimeout(() => {
                   assertStatus('started');
                   player = driver.players.shift();
                   player.onDone(onDoneFn('1'));

                   // step 1 => 2
                   finishAnimation(player, () => {
                     assertStatus('started');
                     player = driver.players.shift();
                     player.onDone(onDoneFn('2'));

                     // step 2 => 3
                     finishAnimation(player, () => {
                       assertStatus('started');
                       player = driver.players.shift();
                       player.onDone(onDoneFn('3'));

                       // step 3 => done
                       finishAnimation(player, () => {
                         assertStatus('done');
                         asyncDone();
                       });
                     });
                   });
                 }, 0);
               });
             }, 0);
           });
         });
       });
  });
}

class InnerContentTrackingAnimationDriver extends MockAnimationDriver {
  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): AnimationPlayer {
    super.animate(element, startingStyles, keyframes, duration, delay, easing);
    const player = new InnerContentTrackingAnimationPlayer(element);
    this.log[this.log.length - 1]['player'] = player;
    return player;
  }
}

class InnerContentTrackingAnimationPlayer extends MockAnimationPlayer {
  static initLog: any[] = [];

  constructor(public element: any) { super(); }

  public computedHeight: number;
  public capturedInnerText: string;
  public playAttempts = 0;

  init() {
    InnerContentTrackingAnimationPlayer.initLog.push(this.element);
    this.computedHeight = getDOM().getComputedStyle(this.element)['height'];
  }

  play() {
    this.playAttempts++;
    const innerElm = this.element.querySelector('.inner');
    this.capturedInnerText = innerElm ? innerElm.innerText : '';
  }
}

@Component({
  selector: 'if-cmp',
  animations: [trigger('myAnimation', [])],
  template: `<div *ngIf="exp" [@myAnimation]="exp"></div>`
})
class DummyIfCmp {
  exp: any = false;
  exp2: any = false;
  items = [0, 1, 2, 3, 4];
  callback: Function = () => {};
  callback1: Function = () => {};
  callback2: Function = () => {};
}

@Component({
  selector: 'dummy-loading-cmp',
  host: {'[@loading]': 'exp'},
  animations: [trigger('loading', [])],
  template: `<div>loading...</div>`
})
class DummyLoadingCmp {
  exp: any = false;
  callback = () => {};

  @Input('exp2')
  exp2: any = false;
}

@Component({
  selector: 'if-cmp',
  host: {
    '(@loading.start)': 'callback($event,"start")',
    '(@loading.done)': 'callback($event,"done")'
  },
  template: `
    <div>loading...</div>
  `
})
class BrokenDummyLoadingCmp {
  exp = false;
  callback = () => {};
}

class _NaiveElementSchema extends DomElementSchemaRegistry {
  normalizeAnimationStyleProperty(propName: string): string { return propName; }

  normalizeAnimationStyleValue(camelCaseProp: string, userProvidedProp: string, val: string|number):
      {error: string, value: string} {
    return {error: null, value: <string>val};
  }
}

@Component({
  selector: 'animation-app',
  animations: [
    trigger('animationStatus', [transition('off => on', animate(555))]),
    trigger(
        'animationWithSteps',
        [transition(
            '* => on',
            [
              style({height: '0px'}), animate(100, style({height: '100px'})),
              animate(100, style({height: '200px'})), animate(100, style({height: '300px'}))
            ])])
  ],
  template: `
    Animation Time: {{ time }}
    Animation Status: {{ status }}
  `
})
class AnimationAppCmp {
  time: number = 0;
  status: string = 'pending';

  @HostBinding('@animationStatus')
  animationStatus = 'off';

  @HostListener('@animationStatus.start', ['$event'])
  onAnimationStartDone(event: AnimationTransitionEvent) {
    if (event.toState == 'on') {
      this.time = event.totalTime;
      this.status = 'started';
    }
  }

  @HostListener('@animationStatus.done', ['$event'])
  onAnimationStatusDone(event: AnimationTransitionEvent) {
    if (event.toState == 'on') {
      this.time = event.totalTime;
      this.status = 'done';
    }
  }

  @HostBinding('@animationWithSteps')
  animationWithSteps = 'off';

  @HostListener('@animationWithSteps.start', ['$event'])
  onAnimationWithStepsStart(event: AnimationTransitionEvent) {
    if (event.toState == 'on') {
      this.time = event.totalTime;
      this.status = 'started';
    }
  }

  @HostListener('@animationWithSteps.done', ['$event'])
  onAnimationWithStepsDone(event: AnimationTransitionEvent) {
    if (event.toState == 'on') {
      this.time = event.totalTime;
      this.status = 'done';
    }
  }
}

class AnimationTestModule {}
function bootstrap(cmpType: any, providers: any[]): Promise<any> {
  @NgModule({
    imports: [BrowserModule],
    providers: providers,
    declarations: [cmpType],
    bootstrap: [cmpType]
  })
  class AnimationTestModule {
  }
  return platformBrowserDynamic().bootstrapModule(AnimationTestModule);
}

class ExtendedWebAnimationsDriver extends WebAnimationsDriver {
  players: WebAnimationsPlayer[] = [];

  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): WebAnimationsPlayer {
    const player = super.animate(element, startingStyles, keyframes, duration, delay, easing);
    this.players.push(player);
    return player;
  }
}

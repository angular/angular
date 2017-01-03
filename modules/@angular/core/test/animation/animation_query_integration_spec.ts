/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {AnimationDriver} from '@angular/platform-browser/src/dom/animation_driver';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';
import {MockAnimationDriver} from '@angular/platform-browser/testing/mock_animation_driver';
import {Component} from '../../index';
import {AnimationGroupPlayer} from '../../src/animation/animation_group_player';
import {AnimationSequencePlayer} from '../../src/animation/animation_sequence_player';
import {AUTO_STYLE, animate, group, keyframes, sequence, state, style, transition, trigger, query, animateChild} from '../../src/animation/animation_metadata';
import {AnimationTransitionEvent} from '../../src/animation/animation_transition_event';
import {TestBed, fakeAsync, flushMicrotasks} from '../../testing';
import {MockAnimationPlayer} from '../../testing/mock_animation_player';

export function main() {
  describe('jit', () => declareTests({useJit: true}));
  describe('no jit', () => declareTests({useJit: false}));
}

function declareTests({useJit}: {useJit: boolean}) {
  function getHTML(element: any): string {
    return getDOM().getInnerHTML(element);
  }

  describe('animation query tests', function () {
    beforeEach(() => {
      TestBed.configureCompiler({useJit: useJit});
      TestBed.configureTestingModule({
        declarations: [CmpWithAnimations],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
        imports: [CommonModule]
      });
    });

    it('should select inner elements by reference when queried by a container animation binding', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
            <div [@animation]="state">
              <div #ref>CHILD</div>
            </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                query('ref', [
                  animate(1234, style({ color: 'red' }))
                ])
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;

      expect(driver.log.length).toEqual(0);

      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;
      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(1);

      const animation = driver.log.pop();
      expect(animation['duration']).toEqual(1234);
      expect(getHTML(animation['element'])).toEqual('CHILD');
    }));

    fit('should invoke the steps within a query as an animation sequence', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
            <div [@animation]="state">
              <div #ref>CHILD</div>
            </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                query('ref', [
                  animate(100, style({ color: 'red' })),
                  animate(100, style({ color: 'blue' }))
                ])
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;
      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(2);

      var s1 = driver.log.shift()['player'].parentPlayer;
      expect(s1 instanceof AnimationSequencePlayer).toBe(true);
      var s2 = driver.log.shift()['player'].parentPlayer;
      expect(s2 instanceof AnimationSequencePlayer).toBe(true);
    }));

    it('should select inner elements by reference when queried by a host animation binding', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          host: {
            '@animation': 'state'
          },
          template: `
             <div #ref>KID</div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                query('ref', [
                  animate(5678, style({ color: 'blue' }))
                ])
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;

      expect(driver.log.length).toEqual(0);

      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;
      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(1);

      const animation = driver.log.pop();
      expect(animation['duration']).toEqual(5678);
      expect(getHTML(animation['element'])).toEqual('KID');
    }));

    it('should animate inner elements to their destinations', fakeAsync(() => {

    }));

    it('should report the valid totalTime when a parent queries children', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state" (@animation.start)="onStart($event)">
               <div #ref>KID</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                animate(1000, style({ color: 'green' })),
                query('ref', [
                  animate(2000, style({ color: 'blue' }))
                ]),
                animate(500, style({ color: 'orange' })),
                query('ref', [
                  animate(100, style({ color: 'blue' }))
                ]),
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      let totalTime = -1;
      cmp.onStart = (event: AnimationTransitionEvent) => {
        totalTime = event.totalTime;
      };
      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(totalTime).toEqual(3600);
    }));

    it('should animate a sub animation when requested with animateChild() is used', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state" (@animation.start)="onStart($event)">
               <div [@innerAnimation]="state" #ref>KID</div>
             </div>
          `,
          animations: [
            trigger('innerAnimation', [
              transition('* => on', [
                style({opacity: 0 }),
                animate(9966, style({ opacity: 1 }))
              ])
            ]),
            trigger('animation', [
              transition('* => on', [
                animate(1000, style({ color: 'green' })),
                query('ref', [
                  animateChild()
                ]),
                animate(1000, style({ color: 'red' })),
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      expect(driver.log.length).toEqual(3);

      const innerAnimation = driver.log.shift();
      const innerPlayer1 = innerAnimation['player'];
      const outerPlayer1 = driver.log.shift()['player'];
      const outerPlayer2 = driver.log.shift()['player'];

      expect(innerAnimation['duration']).toEqual(9966);

      let currentStep = '0';
      outerPlayer1.onStart(() => currentStep = '1');
      outerPlayer2.onStart(() => currentStep = '2');

      flushMicrotasks();

      expect(currentStep).toEqual('1');
      outerPlayer1.finish();

      expect(currentStep).toEqual('1');
      innerPlayer1.finish();

      expect(currentStep).toEqual('2');
    }));

   it('should allow a sub animation to run in parallel if it is queried without a call to animateChild', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div [@innerAnimation]="state" #ref>KID</div>
             </div>
          `,
          animations: [
            trigger('innerAnimation', [
              transition('* => on', [
                style({ width: 0 }),
                animate(1000, style({ width: '100px' }))
              ])
            ]),
            trigger('animation', [
              transition('* => on', query('ref', [
                style({ height: 0 }),
                animate(1000, style({ height: '100px' }))
              ]))
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      expect(driver.log.length).toEqual(2);

      debugger;
      const innerAnimation = driver.log.shift();
      const innerPlayer = <MockAnimationPlayer>innerAnimation['player'];
      const outerAnimation = driver.log.shift();
      const outerPlayer = <MockAnimationPlayer>outerAnimation['player'];

      expect(innerPlayer.hasStarted()).toBe(true);
      expect(innerPlayer.isPaused).toBe(false);
      expect(outerPlayer.hasStarted()).toBe(true);
      expect(innerPlayer.isPaused).toBe(false);
    }));

    it('should pause on the first frame of a queried sub animation when the parent animation starts', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div [@innerAnimation]="state" #ref>KID</div>
             </div>
          `,
          animations: [
            trigger('innerAnimation', [
              transition('* => on', [
                style({height: '100px' }),
                animate(1000, style({ height: '50px' }))
              ])
            ]),
            trigger('animation', [
              transition('* => on', [
                animate(1000, style({ color: 'green' })),
                query('ref', [
                  animateChild()
                ]),
                animate(1000, style({ color: 'red' })),
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(3);

      const innerAnimation = driver.log.shift();
      const kf = innerAnimation['keyframeLookup'];
      expect(kf[0]).toEqual([0, {'height': '100px'}]);
      expect(kf[1]).toEqual([1, {'height': '50px'}]);

      const innerPlayer = <MockAnimationPlayer>innerAnimation['player'];
      expect(innerPlayer.hasStarted()).toEqual(true);
      expect(innerPlayer.isPaused).toEqual(true);
    }));

    it('should allow a parent to render animations on the child in parallel with animateChild()', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div [@innerAnimation]="state" #ref>KID</div>
             </div>
          `,
          animations: [
            trigger('innerAnimation', [
              transition('* => on', [
                style({height: '100px' }),
                animate(500, style({ height: '50px' }))
              ])
            ]),
            trigger('animation', [
              transition('* => on', [
                query('ref', [
                  style({ width: '50px' }),
                  group([
                    animate(500, style({ width: '100px' })),
                    animateChild()
                  ])
                ]),
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(3);

      const innerAnimation = driver.log.shift();
      const beforeGroupAnimation = driver.log.shift();
      const outerAnimation = driver.log.shift();

      // this will allow the group() animation to kick off
      beforeGroupAnimation['player'].finish();

      expect(outerAnimation['element']).toEqual(innerAnimation['element']);

      const kfOuter = outerAnimation['keyframeLookup'];
      expect(kfOuter[0]).toEqual([0, {'width': '50px'}]);
      expect(kfOuter[1]).toEqual([1, {'width': '100px'}]);

      const kfInner = innerAnimation['keyframeLookup'];
      expect(kfInner[0]).toEqual([0, {'height': '100px'}]);
      expect(kfInner[1]).toEqual([1, {'height': '50px'}]);

      const innerPlayer = innerAnimation['player'];
      expect(innerPlayer.hasStarted()).toBe(true);
      const outerPlayer = outerAnimation['player'];
      expect(outerPlayer.hasStarted()).toBe(true);
    }));

    it('should skip the animation step entirely when animateChild() finds no animation', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div #ref>KID WITH NO ANIMATION</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                animate(1000, style({ opacity: 0 })),
                query('ref', animateChild()),
                animate(1000, style({ opacity: 1 }))
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(2);
    }));

    it('should report the valid totalTime when a parent queries and runs sub animations', fakeAsync(() => {
    }));

    it('should merge subsequent animations that have a duration of 0 into one grouped animation', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div #one>One</div>
               <div #two>Two</div>
               <div #three>Three</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                style({ opacity: 0 }),
                query('one', style({ opacity: 0 })),
                query('two', style({ opacity: 0 })),
                query('three', style({ opacity: 0 })),
                animate(1000, style({ opacity: 0 }))
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(5);

      const step1 = driver.log.shift();
      const step2 = driver.log.shift();
      const step3 = driver.log.shift();
      const step4 = driver.log.shift();
      const step5 = driver.log.shift();
      const step1Player = step1['player'];
      const step2Player = step2['player'];
      const step3Player = step3['player'];
      const step4Player = step4['player'];
      const step5Player = step5['player'];

      // we are trying to validate the following structure:
      // sequence([            [sequencePlayer]
      //   group([             [groupPlayer]
      //     animate(),        [step1]
      //     query(step())     [step2]
      //     query(step())     [step3]
      //     query(step())     [step4]
      //   ])
      //   step()              [step5]
      // ])
      const groupPlayer = step1Player.parentPlayer;
      expect(groupPlayer instanceof AnimationGroupPlayer).toBe(true);
      const sequencePlayer = groupPlayer.parentPlayer;
      expect(sequencePlayer instanceof AnimationSequencePlayer).toBe(true);

      // groupPlayer [ queryPlayer [ animatePlayer ] ] ]
      expect(step2Player.parentPlayer.parentPlayer).toBe(groupPlayer);
      expect(step3Player.parentPlayer.parentPlayer).toBe(groupPlayer);
      expect(step4Player.parentPlayer.parentPlayer).toBe(groupPlayer);

      expect(step5Player.parentPlayer).toBe(sequencePlayer);
    }));

    it('should allow multiple entries to be queried and animations with the same reference', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div #ref>K1</div>
               <div #ref>K2</div>
               <div #ref>K3</div>
               <div #ref>K4</div>
               <div #ref>K5</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                query('ref', [
                  style({ transform: 'translateY(-100px)'}),
                  animate(1000, style({ transform: 'translateY(0px)'}))
                ])
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(5);
    }));

    it('should allow queried elements to calculate auto styles properly at the start of the sequence', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div #one>1</div>
               <div #two>2</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', group([
                query('one', animate(100, style({ opacity: 1 }))),
                query('two', animate(200, style({ opacity: 1 })))
              ]))
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(2);

      const step1 = driver.log.shift();
      const step2 = driver.log.shift();
      const expectedStyles = [
        [0, { opacity: AUTO_STYLE }],
        [1, { opacity: 1 }]
      ];

      expect(step1['keyframeLookup']).toEqual(expectedStyles);
      expect(step2['keyframeLookup']).toEqual(expectedStyles);
    }));

    it('should allow queried elements to reuse collected styles throughout the sequence if queried again', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state">
               <div #ref>ANIMATE ME</div>
             </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => on', [
                query('ref', animate(100, style({ opacity: 0.5 }))),
                animate(1000, style({ color:'red' })),
                query('ref', animate(200, style({ opacity: 1 })))
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'on';
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(3);

      const step1 = driver.log.shift(); // ref query opacity animation
      const step2 = driver.log.shift(); // color animation
      const step3 = driver.log.shift(); // ref query opacity animation

      expect(step1['keyframeLookup']).toEqual([
        [0, { opacity: AUTO_STYLE }],
        [1, { opacity: 0.5 }],
      ]);

      expect(step3['keyframeLookup']).toEqual([
        [0, { opacity: 0.5 }],
        [1, { opacity: 1 }],
      ]);
    }));

    it('should allow sub animations to calculate auto styles properly at the start of the animation', fakeAsync(() => {

    }));

    it('should fire animation callbacks for sub animations when they finish', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
             <div [@animation]="state" (@animation.done)="onDone($event)">
               <div #one [@one]="state" (@one.done)="onDone($event)">ONE</div>
               <div #two [@two]="state" (@two.done)="onDone($event)">TWO</div>
             </div>
          `,
          animations: [
            trigger('one', [
              transition('* => on', animate(1000))
            ]),
            trigger('two', [
              transition('* => on', animate(1000))
            ]),
            trigger('animation', [
              transition('* => on', [
                query('one', animateChild()),
                query('two', animateChild())
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;
      cmp.state = 'on';

      const lookup: {[triggerName: string]: boolean} = {};
      cmp.onDone = (event: AnimationTransitionEvent) => {
        lookup[event.triggerName] = true;
      };

      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(2);

      const playerTwo = driver.log.shift()['player'];
      const playerOne = driver.log.shift()['player'];

      expect(lookup['one']).toBeFalsy();
      expect(lookup['two']).toBeFalsy();
      expect(lookup['animation']).toBeFalsy();

      playerOne.finish();

      expect(lookup['one']).toBeTruthy();
      expect(lookup['two']).toBeFalsy();
      expect(lookup['animation']).toBeFalsy();

      playerTwo.finish();

      expect(lookup['one']).toBeTruthy();
      expect(lookup['two']).toBeTruthy();
      expect(lookup['animation']).toBeTruthy();
    }));

    it('should fire animation callbacks for sub animations when they start', fakeAsync(() => {

    }));

    it('should hijack multiple inner running animations when a parent issues animateChild()', fakeAsync(() => {

    }));

    it('should only take over the previous queried animation on a queried item if the followup animation exists within the first 0 seconds', fakeAsync(() => {

    }));

    it('should query a union of items persisted, inserted and removed items for an animation', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
            <div [@animation]="state">
              <div *ngFor="let item of items" #ref class="item">
                {{ item }}    
              </div>
            </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => *', query('ref', [
                animate(1000)
              ]))
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;
      const container = fixture.nativeElement;

      function readElementContents(container: any[]): string {
        const items: any[] = [];
        getDOM().querySelectorAll(container, '.item').forEach(elm => {
          return items.push(getHTML(elm).trim());
        });
        return items.join('-');
      }

      cmp.items = [1,2,3,4,5];
      cmp.state = 'one';

      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(5);
      expect(readElementContents(container)).toEqual('1-2-3-4-5');
      driver.log.forEach(entry => entry['player'].finish());
      expect(readElementContents(container)).toEqual('1-2-3-4-5');

      cmp.items = [4,5,6,7,8,9];
      cmp.state = 'two';
      driver.log = [];
      fixture.detectChanges();
      flushMicrotasks();

      expect(driver.log.length).toEqual(9);
      expect(readElementContents(container)).toEqual('1-2-3-4-5-6-7-8-9');
      driver.log.forEach(entry => entry['player'].finish());
      expect(readElementContents(container)).toEqual('4-5-6-7-8-9');
    }));

    it('should properly cancel multi-leveled query animations and normalize their directions to their new animation arcs', fakeAsync(() => {

    }));

    it('should cancel the previous animation on a queried element even if that element is not used in the follow-up animation', fakeAsync(() => {
      TestBed.overrideComponent(CmpWithAnimations, {
        set: {
          template: `
            <div [@animation]="state">
              <div #ref>REF</div>
            </div>
          `,
          animations: [
            trigger('animation', [
              transition('* => one', group([
                animate(1000, style({ color: 'red' })),
                query('ref', [
                  animate(1000, style({ color: 'blue' })),
                ])
              ])),
              transition('* => two', [
                animate(1000, style({ color: 'orange' }))
              ])
            ])
          ]
        }
      });

      const driver = TestBed.get(AnimationDriver) as MockAnimationDriver;
      const fixture = TestBed.createComponent(CmpWithAnimations);
      const cmp = fixture.componentInstance;

      cmp.state = 'one';
      fixture.detectChanges();
      flushMicrotasks();

      const ani1 = driver.log.shift();
      const ani2 = driver.log.shift();
      const player1 = ani1['player'];
      const player2 = ani2['player'];

      player1.finish();

      let currentStep = '2-start';
      let currentElement: any = null;
      player2.onDone(() => {
        currentStep = '2-done';
        currentElement = ani2['element'];
      });

      expect(currentStep).toEqual('2-start');

      cmp.state = 'two';
      fixture.detectChanges();
      flushMicrotasks();

      expect(currentStep).toEqual('2-done');
      expect(getHTML(currentElement)).toEqual('REF');
    }));

    it('should clean up any styled values on queried elements once the animation is complete', fakeAsync(() => {

    }));
  });
}

@Component({
  selector: 'cmp-with-animations'
})
class CmpWithAnimations {
  public state: any;
  public state2: any;
  public items: any[] = [];
  onStart = (event: any = null): any => {};
  onDone = (event: any = null): any => {};
}

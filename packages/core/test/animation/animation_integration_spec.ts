/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationEvent, animate, group, keyframes, state, style, transition, trigger} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine, ɵNoopAnimationDriver} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {Component, HostBinding, HostListener, RendererFactory2, ViewChild} from '@angular/core';
import {ɵDomRendererFactory2} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {TestBed, fakeAsync, flushMicrotasks} from '../../testing';

export function main() {
  // these tests are only mean't to be run within the DOM (for now)
  if (typeof Element == 'undefined') return;

  describe('animation tests', function() {
    function getLog(): MockAnimationPlayer[] {
      return MockAnimationDriver.log as MockAnimationPlayer[];
    }

    function resetLog() { MockAnimationDriver.log = []; }

    beforeEach(() => {
      resetLog();
      TestBed.configureTestingModule({
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
        imports: [BrowserAnimationsModule]
      });
    });

    describe('animation triggers', () => {
      it('should trigger a state change animation from void => state', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp" [@myAnimation]="exp"></div>
        `,
          animations: [trigger(
              'myAnimation',
              [transition(
                  'void => *', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().length).toEqual(1);
        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, opacity: '0'}, {offset: 1, opacity: '1'}
        ]);
      });

      it('should only turn a view removal as into `void` state transition', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp1" [@myAnimation]="exp2"></div>
        `,
          animations: [trigger(
              'myAnimation',
              [
                transition(
                    'void <=> *', [style({width: '0px'}), animate(1000, style({width: '100px'}))]),
                transition(
                    '* => *', [style({height: '0px'}), animate(1000, style({height: '100px'}))]),
              ])]
        })
        class Cmp {
          exp1: any = false;
          exp2: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp1 = true;
        cmp.exp2 = null;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, width: '0px'}, {offset: 1, width: '100px'}
        ]);

        cmp.exp2 = false;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, height: '0px'}, {offset: 1, height: '100px'}
        ]);

        cmp.exp2 = 0;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, height: '0px'}, {offset: 1, height: '100px'}
        ]);

        cmp.exp2 = '';

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, height: '0px'}, {offset: 1, height: '100px'}
        ]);

        cmp.exp2 = undefined;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, height: '0px'}, {offset: 1, height: '100px'}
        ]);

        cmp.exp1 = false;
        cmp.exp2 = 'abc';

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, width: '0px'}, {offset: 1, width: '100px'}
        ]);
      });

      it('should stringify boolean triggers to `1` and `0`', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [trigger(
              'myAnimation',
              [
                transition('void => 1', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                transition('1 => 0', [style({opacity: 1}), animate(1000, style({opacity: 0}))])
              ])]
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, opacity: '0'}, {offset: 1, opacity: '1'}
        ]);

        cmp.exp = false;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop() !.keyframes).toEqual([
          {offset: 0, opacity: '1'}, {offset: 1, opacity: '0'}
        ]);
      });

      it('should not throw an error if a trigger with the same name exists in separate components',
         () => {
           @Component({selector: 'cmp1', template: '...', animations: [trigger('trig', [])]})
           class Cmp1 {
           }

           @Component({selector: 'cmp2', template: '...', animations: [trigger('trig', [])]})
           class Cmp2 {
           }

           TestBed.configureTestingModule({declarations: [Cmp1, Cmp2]});
           const cmp1 = TestBed.createComponent(Cmp1);
           const cmp2 = TestBed.createComponent(Cmp2);
         });

      describe('host bindings', () => {
        it('should trigger a state change animation from state => state on the component host element',
           fakeAsync(() => {
             @Component({
               selector: 'my-cmp',
               template: '...',
               animations: [trigger(
                   'myAnimation',
                   [transition(
                       'a => b',
                       [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
             })
             class Cmp {
               @HostBinding('@myAnimation')
               exp = 'a';
             }

             TestBed.configureTestingModule({declarations: [Cmp]});

             const engine = TestBed.get(ɵAnimationEngine);
             const fixture = TestBed.createComponent(Cmp);
             const cmp = fixture.componentInstance;
             fixture.detectChanges();
             engine.flush();
             expect(getLog().length).toEqual(0);

             cmp.exp = 'b';
             fixture.detectChanges();
             engine.flush();
             expect(getLog().length).toEqual(1);

             const data = getLog().pop() !;
             expect(data.element).toEqual(fixture.elementRef.nativeElement);
             expect(data.keyframes).toEqual([{offset: 0, opacity: '0'}, {offset: 1, opacity: '1'}]);
           }));

        // nonAnimationRenderer => animationRenderer
        it('should trigger a leave animation when the inner components host binding updates',
           fakeAsync(() => {
             @Component({
               selector: 'parent-cmp',
               template: `
                <child-cmp *ngIf="exp"></child-cmp>
              `
             })
             class ParentCmp {
               public exp = true;
             }

             @Component({
               selector: 'child-cmp',
               template: '...',
               animations: [trigger(
                   'host',
                   [transition(
                       ':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))])])]
             })
             class ChildCmp {
               @HostBinding('@host') public hostAnimation = true;
             }

             TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

             const engine = TestBed.get(ɵAnimationEngine);
             const fixture = TestBed.createComponent(ParentCmp);
             const cmp = fixture.componentInstance;
             fixture.detectChanges();
             engine.flush();
             expect(getLog().length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement.children.length).toBe(1);

             engine.flush();
             expect(getLog().length).toEqual(1);

             const [player] = getLog();
             expect(player.keyframes).toEqual([
               {opacity: '1', offset: 0},
               {opacity: '0', offset: 1},
             ]);

             flushMicrotasks();
             expect(fixture.debugElement.nativeElement.children.length).toBe(0);
           }));

        // animationRenderer => nonAnimationRenderer
        it('should trigger a leave animation when the outer components element binding updates on the host component element',
           fakeAsync(() => {
             @Component({
               selector: 'parent-cmp',
               animations: [trigger(
                   'host',
                   [transition(
                       ':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))])])],
               template: `
                <child-cmp *ngIf="exp" @host></child-cmp>
              `
             })
             class ParentCmp {
               public exp = true;
             }

             @Component({
               selector: 'child-cmp',
               template: '...',
             })
             class ChildCmp {
             }

             TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

             const engine = TestBed.get(ɵAnimationEngine);
             const fixture = TestBed.createComponent(ParentCmp);
             const cmp = fixture.componentInstance;
             fixture.detectChanges();
             engine.flush();
             expect(getLog().length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement.children.length).toBe(1);

             engine.flush();
             expect(getLog().length).toEqual(1);

             const [player] = getLog();
             expect(player.keyframes).toEqual([
               {opacity: '1', offset: 0},
               {opacity: '0', offset: 1},
             ]);

             flushMicrotasks();
             expect(fixture.debugElement.nativeElement.children.length).toBe(0);
           }));

        // animationRenderer => animationRenderer
        it('should trigger a leave animation when both the inner and outer components trigger on the same element',
           fakeAsync(() => {
             @Component({
               selector: 'parent-cmp',
               animations: [trigger(
                   'host',
                   [transition(
                       ':leave',
                       [style({height: '100px'}), animate(1000, style({height: '0px'}))])])],
               template: `
                <child-cmp *ngIf="exp" @host></child-cmp>
              `
             })
             class ParentCmp {
               public exp = true;
             }

             @Component({
               selector: 'child-cmp',
               template: '...',
               animations: [trigger(
                   'host', [transition(
                               ':leave',
                               [style({width: '100px'}), animate(1000, style({width: '0px'}))])])]
             })
             class ChildCmp {
               @HostBinding('@host') public hostAnimation = true;
             }

             TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

             const engine = TestBed.get(ɵAnimationEngine);
             const fixture = TestBed.createComponent(ParentCmp);
             const cmp = fixture.componentInstance;
             fixture.detectChanges();
             engine.flush();
             expect(getLog().length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement.children.length).toBe(1);

             engine.flush();
             expect(getLog().length).toEqual(2);

             const [p1, p2] = getLog();
             expect(p1.keyframes).toEqual([
               {height: '100px', offset: 0},
               {height: '0px', offset: 1},
             ]);

             expect(p2.keyframes).toEqual([
               {width: '100px', offset: 0},
               {width: '0px', offset: 1},
             ]);

             flushMicrotasks();
             expect(fixture.debugElement.nativeElement.children.length).toBe(0);
           }));

        it('should not throw when the host element is removed and no animation triggers',
           fakeAsync(() => {
             @Component({
               selector: 'parent-cmp',
               template: `
                <child-cmp *ngIf="exp"></child-cmp>
              `
             })
             class ParentCmp {
               public exp = true;
             }

             @Component({
               selector: 'child-cmp',
               template: '...',
               animations: [trigger('host', [transition('a => b', [style({height: '100px'})])])],
             })
             class ChildCmp {
               @HostBinding('@host') public hostAnimation = 'a';
             }

             TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

             const engine = TestBed.get(ɵAnimationEngine);
             const fixture = TestBed.createComponent(ParentCmp);
             const cmp = fixture.componentInstance;
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement.children.length).toBe(1);

             engine.flush();
             expect(getLog().length).toEqual(0);

             cmp.exp = false;
             fixture.detectChanges();
             engine.flush();
             flushMicrotasks();
             expect(getLog().length).toEqual(0);
             expect(fixture.debugElement.nativeElement.children.length).toBe(0);

             flushMicrotasks();
             expect(fixture.debugElement.nativeElement.children.length).toBe(0);
           }));
      });

      it('should cancel and merge in mid-animation styles into the follow-up animation, but only for animation keyframes that start right away',
         () => {
           @Component({
          selector: 'ani-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [trigger(
              'myAnimation',
              [
                transition(
                    'a => b',
                    [
                      style({'opacity': '0'}),
                      animate(500, style({'opacity': '1'})),
                    ]),
                transition(
                    'b => c',
                    [
                      group([
                        animate(500, style({'width': '100px'})),
                        animate(500, style({'height': '100px'})),
                      ]),
                      animate(500, keyframes([
                        style({'opacity': '0'}),
                        style({'opacity': '1'})
                      ]))
                    ]),
              ])],
        })
        class Cmp {
             exp: any = false;
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'a';
           fixture.detectChanges();
           engine.flush();
           expect(getLog().length).toEqual(0);
           resetLog();

           cmp.exp = 'b';
           fixture.detectChanges();
           engine.flush();
           expect(getLog().length).toEqual(1);
           resetLog();

           cmp.exp = 'c';
           fixture.detectChanges();
           engine.flush();

           const players = getLog();
           expect(players.length).toEqual(3);
           const [p1, p2, p3] = players;
           expect(p1.previousStyles).toEqual({opacity: AUTO_STYLE});
           expect(p2.previousStyles).toEqual({});
           expect(p3.previousStyles).toEqual({});
         });

      it('should properly balance styles between states even if there are no destination state styles',
         () => {
           @Component({
             selector: 'ani-cmp',
             template: `
            <div @myAnimation *ngIf="exp"></div>
          `,
             animations: [trigger(
                 'myAnimation',
                 [
                   state('void', style({opacity: 0, width: '0px', height: '0px'})),
                   transition(':enter', animate(1000))
                 ])]
           })
           class Cmp {
             exp: boolean = false;
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;

           fixture.detectChanges();
           engine.flush();

           const [p1] = getLog();
           expect(p1.keyframes).toEqual([
             {opacity: '0', width: '0px', height: '0px', offset: 0},
             {opacity: AUTO_STYLE, width: AUTO_STYLE, height: AUTO_STYLE, offset: 1}
           ]);
         });

      it('should not apply the destination styles if the final animate step already contains styles',
         () => {
           @Component({
             selector: 'ani-cmp',
             template: `
            <div @myAnimation *ngIf="exp"></div>
          `,
             animations: [trigger(
                 'myAnimation',
                 [
                   state('void', style({color: 'red'})), state('*', style({color: 'blue'})),
                   transition(
                       ':enter',
                       [style({fontSize: '0px '}), animate(1000, style({fontSize: '100px'}))])
                 ])]
           })
           class Cmp {
             exp: boolean = false;
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.exp = true;

           fixture.detectChanges();
           engine.flush();

           const players = getLog();
           expect(players.length).toEqual(1);

           // notice how the final color is NOT blue
           expect(players[0].keyframes).toEqual([
             {fontSize: '0px', color: 'red', offset: 0},
             {fontSize: '100px', color: 'red', offset: 1}
           ]);
         });

      it('should invoke an animation trigger that is state-less', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngFor="let item of items" @myAnimation></div>
          `,
          animations: [trigger(
              'myAnimation',
              [transition(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))])])]
        })
        class Cmp {
          items: number[] = [];
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.items = [1, 2, 3, 4, 5];
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(5);

        for (let i = 0; i < 5; i++) {
          const item = getLog()[i];
          expect(item.duration).toEqual(1000);
          expect(item.keyframes).toEqual([{opacity: '0', offset: 0}, {opacity: '1', offset: 1}]);
        }
      });

      it('should retain styles on the element once the animation is complete', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div #green @green></div>
          `,
          animations: [trigger('green', [state('*', style({backgroundColor: 'green'}))])]
        })
        class Cmp {
          @ViewChild('green') public element: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();
        engine.flush();

        const player = engine.activePlayers.pop();
        player.finish();

        expect(getDOM().hasStyle(cmp.element.nativeElement, 'background-color', 'green'))
            .toBeTruthy();
      });

      it('should animate removals of nodes to the `void` state for each animation trigger', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngIf="exp" class="ng-if" [@trig1]="exp2" @trig2></div>
          `,
          animations: [
            trigger('trig1', [transition('state => void', [animate(1000, style({opacity: 0}))])]),
            trigger('trig2', [transition(':leave', [animate(1000, style({width: '0px'}))])])
          ]
        })
        class Cmp {
          public exp = true;
          public exp2 = 'state';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();
        resetLog();

        const element = getDOM().querySelector(fixture.nativeElement, '.ng-if');
        assertHasParent(element, true);

        cmp.exp = false;
        fixture.detectChanges();
        engine.flush();

        assertHasParent(element, true);

        expect(getLog().length).toEqual(2);

        const player2 = getLog().pop() !;
        const player1 = getLog().pop() !;

        expect(player2.keyframes).toEqual([
          {width: AUTO_STYLE, offset: 0},
          {width: '0px', offset: 1},
        ]);

        expect(player1.keyframes).toEqual([
          {opacity: AUTO_STYLE, offset: 0}, {opacity: '0', offset: 1}
        ]);

        player2.finish();
        player1.finish();
        assertHasParent(element, false);
      });

      it('should properly cancel all existing animations when a removal occurs', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngIf="exp" [@myAnimation]="exp"></div>
          `,
          animations: [
            trigger(
                'myAnimation',
                [
                  transition(
                      '* => go', [style({width: '0px'}), animate(1000, style({width: '100px'}))]),
                ]),
          ]
        })
        class Cmp {
          public exp: string|null;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(1);
        const [player1] = getLog();
        resetLog();

        let finished = false;
        player1.onDone(() => finished = true);

        let destroyed = false;
        player1.onDestroy(() => destroyed = true);

        cmp.exp = null;
        fixture.detectChanges();
        engine.flush();

        expect(finished).toBeTruthy();
        expect(destroyed).toBeTruthy();
      });

      it('should not run inner child animations when a parent is set to be removed', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngIf="exp" class="parent" >
              <div [@myAnimation]="exp2"></div>
            </div>
          `,
          animations: [trigger(
              'myAnimation', [transition('a => b', [animate(1000, style({width: '0px'}))])])]
        })
        class Cmp {
          public exp = true;
          public exp2 = '0';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = true;
        cmp.exp2 = 'a';
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp = false;
        cmp.exp2 = 'b';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(0);
        resetLog();
      });
    });

    describe('animation listeners', () => {
      it('should trigger a `start` state change listener for when the animation changes state from void => state',
         () => {
           @Component({
             selector: 'if-cmp',
             template: `
          <div *ngIf="exp" [@myAnimation]="exp" (@myAnimation.start)="callback($event)"></div>
        `,
             animations: [trigger(
                 'myAnimation',
                 [transition(
                     'void => *',
                     [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
           })
           class Cmp {
             exp: any = false;
             event: AnimationEvent;

             callback = (event: any) => { this.event = event; };
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'true';
           fixture.detectChanges();
           engine.flush();

           expect(cmp.event.triggerName).toEqual('myAnimation');
           expect(cmp.event.phaseName).toEqual('start');
           expect(cmp.event.totalTime).toEqual(500);
           expect(cmp.event.fromState).toEqual('void');
           expect(cmp.event.toState).toEqual('true');
         });

      it('should trigger a `done` state change listener for when the animation changes state from a => b',
         () => {
           @Component({
             selector: 'if-cmp',
             template: `
          <div *ngIf="exp" [@myAnimation123]="exp" (@myAnimation123.done)="callback($event)"></div>
        `,
             animations: [trigger(
                 'myAnimation123',
                 [transition(
                     '* => b', [style({'opacity': '0'}), animate(999, style({'opacity': '1'}))])])],
           })
           class Cmp {
             exp: any = false;
             event: AnimationEvent;

             callback = (event: any) => { this.event = event; };
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'b';
           fixture.detectChanges();
           engine.flush();

           expect(cmp.event).toBeFalsy();

           const player = engine.activePlayers.pop();
           player.finish();

           expect(cmp.event.triggerName).toEqual('myAnimation123');
           expect(cmp.event.phaseName).toEqual('done');
           expect(cmp.event.totalTime).toEqual(999);
           expect(cmp.event.fromState).toEqual('void');
           expect(cmp.event.toState).toEqual('b');
         });

      it('should handle callbacks for multiple triggers running simultaneously', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@ani1]="exp1" (@ani1.done)="callback1($event)"></div>
          <div [@ani2]="exp2" (@ani2.done)="callback2($event)"></div>
        `,
          animations: [
            trigger(
                'ani1',
                [
                  transition(
                      '* => a', [style({'opacity': '0'}), animate(999, style({'opacity': '1'}))]),
                ]),
            trigger(
                'ani2',
                [
                  transition(
                      '* => b', [style({'width': '0px'}), animate(999, style({'width': '100px'}))]),
                ])
          ],
        })
        class Cmp {
          exp1: any = false;
          exp2: any = false;
          event1: AnimationEvent;
          event2: AnimationEvent;
          callback1 = (event: any) => { this.event1 = event; };
          callback2 = (event: any) => { this.event2 = event; };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.get(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp1 = 'a';
        cmp.exp2 = 'b';
        fixture.detectChanges();
        engine.flush();

        expect(cmp.event1).toBeFalsy();
        expect(cmp.event2).toBeFalsy();

        const player1 = engine.activePlayers[0];
        const player2 = engine.activePlayers[1];

        player1.finish();
        expect(cmp.event1.triggerName).toBeTruthy('ani1');
        expect(cmp.event2).toBeFalsy();

        player2.finish();
        expect(cmp.event1.triggerName).toBeTruthy('ani1');
        expect(cmp.event2.triggerName).toBeTruthy('ani2');
      });

      it('should handle callbacks for multiple triggers running simultaneously on the same element',
         () => {
           @Component({
             selector: 'if-cmp',
             template: `
          <div [@ani1]="exp1" (@ani1.done)="callback1($event)" [@ani2]="exp2" (@ani2.done)="callback2($event)"></div>
        `,
             animations: [
               trigger(
                   'ani1',
                   [
                     transition(
                         '* => a',
                         [style({'opacity': '0'}), animate(999, style({'opacity': '1'}))]),
                   ]),
               trigger(
                   'ani2',
                   [
                     transition(
                         '* => b',
                         [style({'width': '0px'}), animate(999, style({'width': '100px'}))]),
                   ])
             ],
           })
           class Cmp {
             exp1: any = false;
             exp2: any = false;
             event1: AnimationEvent;
             event2: AnimationEvent;
             callback1 = (event: any) => { this.event1 = event; };
             callback2 = (event: any) => { this.event2 = event; };
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;

           cmp.exp1 = 'a';
           cmp.exp2 = 'b';
           fixture.detectChanges();
           engine.flush();

           expect(cmp.event1).toBeFalsy();
           expect(cmp.event2).toBeFalsy();

           const player1 = engine.activePlayers[0];
           const player2 = engine.activePlayers[1];

           player1.finish();
           expect(cmp.event1.triggerName).toBeTruthy('ani1');
           expect(cmp.event2).toBeFalsy();

           player2.finish();
           expect(cmp.event1.triggerName).toBeTruthy('ani1');
           expect(cmp.event2.triggerName).toBeTruthy('ani2');
         });

      it('should trigger a state change listener for when the animation changes state from void => state on the host element',
         () => {
           @Component({
             selector: 'my-cmp',
             template: `...`,
             animations: [trigger(
                 'myAnimation2',
                 [transition(
                     'void => *',
                     [style({'opacity': '0'}), animate(1000, style({'opacity': '1'}))])])],
           })
           class Cmp {
             event: AnimationEvent;

             @HostBinding('@myAnimation2')
             exp: any = false;

             @HostListener('@myAnimation2.start', ['$event'])
             callback = (event: any) => { this.event = event; };
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const engine = TestBed.get(ɵAnimationEngine);
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.exp = 'TRUE';
           fixture.detectChanges();
           engine.flush();

           expect(cmp.event.triggerName).toEqual('myAnimation2');
           expect(cmp.event.phaseName).toEqual('start');
           expect(cmp.event.totalTime).toEqual(1000);
           expect(cmp.event.fromState).toEqual('void');
           expect(cmp.event.toState).toEqual('TRUE');
         });

      it('should always fire callbacks even when a transition is not detected', fakeAsync(() => {
           @Component({
             selector: 'my-cmp',
             template: `
              <div [@myAnimation]="exp" (@myAnimation.start)="callback($event)" (@myAnimation.done)="callback($event)"></div>
            `,
             animations: [trigger('myAnimation', [])]
           })
           class Cmp {
             exp: string;
             log: any[] = [];
             callback = (event: any) => { this.log.push(`${event.phaseName} => ${event.toState}`); }
           }

           TestBed.configureTestingModule({
             providers: [{provide: AnimationDriver, useClass: ɵNoopAnimationDriver}],
             declarations: [Cmp]
           });

           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;

           cmp.exp = 'a';
           fixture.detectChanges();
           flushMicrotasks();
           expect(cmp.log).toEqual(['start => a', 'done => a']);

           cmp.log = [];
           cmp.exp = 'b';
           fixture.detectChanges();
           flushMicrotasks();

           expect(cmp.log).toEqual(['start => b', 'done => b']);
         }));

      it('should fire callback events for leave animations', fakeAsync(() => {
           @Component({
             selector: 'my-cmp',
             template: `
              <div *ngIf="exp" @myAnimation (@myAnimation.start)="callback($event)" (@myAnimation.done)="callback($event)"></div>
            `,
             animations: [trigger('myAnimation', [])]
           })
           class Cmp {
             exp: boolean = false;
             log: any[] = [];
             callback = (event: any) => {
               const state = event.toState || '_default_';
               this.log.push(`${event.phaseName} => ${state}`);
             }
           }

           TestBed.configureTestingModule({
             providers: [{provide: AnimationDriver, useClass: ɵNoopAnimationDriver}],
             declarations: [Cmp]
           });

           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;

           cmp.exp = true;
           fixture.detectChanges();
           flushMicrotasks();
           expect(cmp.log).toEqual(['start => _default_', 'done => _default_']);

           cmp.log = [];

           cmp.exp = false;
           fixture.detectChanges();
           flushMicrotasks();

           expect(cmp.log).toEqual(['start => void', 'done => void']);
         }));
    });

    describe('errors for not using the animation module', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: RendererFactory2, useExisting: ɵDomRendererFactory2}],
        });
      });

      it('should throw when using an @prop binding without the animation module', () => {
        @Component({template: `<div [@myAnimation]="true"></div>`})
        class Cmp {
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const comp = TestBed.createComponent(Cmp);
        expect(() => comp.detectChanges())
            .toThrowError(
                'Found the synthetic property @myAnimation. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.');
      });

      it('should throw when using an @prop listener without the animation module', () => {
        @Component({template: `<div (@myAnimation.start)="a = true"></div>`})
        class Cmp {
          a: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        expect(() => TestBed.createComponent(Cmp))
            .toThrowError(
                'Found the synthetic listener @myAnimation.start. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.');

      });
    });
  });
}

function assertHasParent(element: any, yes: boolean) {
  const parent = getDOM().parentElement(element);
  if (yes) {
    expect(parent).toBeTruthy();
  } else {
    expect(parent).toBeFalsy();
  }
}

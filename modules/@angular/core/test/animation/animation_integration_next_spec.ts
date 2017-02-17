/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationEvent, animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {USE_VIEW_ENGINE} from '@angular/compiler/src/config';
import {Component, HostBinding, HostListener, ViewChild} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AnimationDriver, BrowserAnimationModule, ɵAnimationEngine} from '@angular/platform-browser/animations';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/platform-browser/animations/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

import {TestBed} from '../../testing';

export function main() {
  describe('view engine', () => {
    beforeEach(() => {
      TestBed.configureCompiler({
        useJit: true,
        providers: [{
          provide: USE_VIEW_ENGINE,
          useValue: true,
        }],
      });
    });

    declareTests({useJit: true});
  });
}

function declareTests({useJit}: {useJit: boolean}) {
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
        imports: [BrowserModule, BrowserAnimationModule]
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
        expect(getLog().pop().keyframes).toEqual([
          {offset: 0, opacity: '0'}, {offset: 1, opacity: '1'}
        ]);
      });

      xit('should trigger a state change animation from void => state on the component host element',
          () => {
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
              get binding() { return this.exp ? 'b' : 'a'; }
              exp: any = false;
            }

            TestBed.configureTestingModule({declarations: [Cmp]});

            const engine = TestBed.get(ɵAnimationEngine);
            const fixture = TestBed.createComponent(Cmp);
            const cmp = fixture.componentInstance;
            cmp.exp = false;
            fixture.detectChanges();
            engine.flush();
            expect(getLog().length).toEqual(0);

            cmp.exp = true;
            fixture.detectChanges();
            engine.flush();
            expect(getLog().length).toEqual(1);

            const data = getLog().pop();
            expect(data.element).toEqual(fixture.elementRef.nativeElement);
            expect(data.keyframes).toEqual([{offset: 0, opacity: '0'}, {offset: 1, opacity: '1'}]);
          });

      it('should cancel and merge in mid-animation styles into the follow-up animation', () => {
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
                      style({'width': '0'}),
                      animate(500, style({'width': '100px'})),
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
        expect(getLog().length).toEqual(1);

        const data = getLog().pop();
        expect(data.previousStyles).toEqual({opacity: AUTO_STYLE});
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

        const player2 = getLog().pop();
        const player1 = getLog().pop();

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

      xit('should trigger a state change listener for when the animation changes state from void => state on the host element',
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

              @HostListener('@myAnimation2.start')
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

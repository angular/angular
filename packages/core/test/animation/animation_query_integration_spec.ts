/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, animateChild, AnimationPlayer, AUTO_STYLE, group, query, sequence, stagger, state, style, transition, trigger, ɵAnimationGroupPlayer as AnimationGroupPlayer} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine} from '@angular/animations/browser';
import {matchesElement} from '@angular/animations/browser/src/render/shared';
import {TransitionAnimationPlayer} from '@angular/animations/browser/src/render/transition_animation_engine';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME} from '@angular/animations/browser/src/util';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {CommonModule} from '@angular/common';
import {Component, HostBinding, ViewChild} from '@angular/core';
import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HostListener} from '../../src/metadata/directives';

(function() {
// these tests are only mean't to be run within the DOM (for now)
if (isNode) return;

describe('animation query tests', function() {
  function getLog(): MockAnimationPlayer[] {
    return MockAnimationDriver.log as MockAnimationPlayer[];
  }

  function resetLog() {
    MockAnimationDriver.log = [];
  }

  beforeEach(() => {
    resetLog();
    TestBed.configureTestingModule({
      providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
      imports: [BrowserAnimationsModule, CommonModule]
    });
  });

  describe('query()', () => {
    it('should be able to query all elements that contain animation triggers via @*', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@parent]="exp0">
              <div class="a" [@a]="exp1"></div>
              <div class="b" [@b]="exp2"></div>
              <section>
                <div class="c" @c></div>
              </section>
            </div>
          `,
        animations: [
          trigger(
              'parent',
              [
                transition(
                    '* => go',
                    [
                      query(
                          '@*',
                          [
                            style({backgroundColor: 'blue'}),
                            animate(1000, style({backgroundColor: 'red'})),
                          ]),
                    ]),
              ]),
          trigger(
              'a',
              [
                transition('* => 1', [animate(1000, style({opacity: 0}))]),
              ]),
          trigger(
              'b',
              [
                transition(
                    '* => 1',
                    [
                      animate(1000, style({opacity: 0})),
                      query('.b-inner', [animate(1000, style({opacity: 0}))]),
                    ]),
              ]),
          trigger(
              'c',
              [
                transition('* => 1', [animate(1000, style({opacity: 0}))]),
              ]),
        ]
      })
      class Cmp {
        public exp0: any;
        public exp1: any;
        public exp2: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp0 = 'go';
      fixture.detectChanges();

      let players = getLog();
      expect(players.length).toEqual(3);  // a,b,c
      resetLog();

      const [p1, p2, p3] = players;
      expect(p1.element.classList.contains('a')).toBeTruthy();
      expect(p2.element.classList.contains('b')).toBeTruthy();
      expect(p3.element.classList.contains('c')).toBeTruthy();
    });

    it('should be able to query currently animating elements via :animating', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@parent]="exp0">
              <div class="a" [@a]="exp1"></div>
              <div class="b" [@b]="exp2">
                <div class="b-inner"></div>
              </div>
              <div class="c" [@c]="exp3"></div>
            </div>
          `,
        animations: [
          trigger(
              'parent',
              [
                transition(
                    '* => go',
                    [
                      query(
                          ':animating',
                          [
                            style({backgroundColor: 'blue'}),
                            animate(1000, style({backgroundColor: 'red'})),
                          ]),
                    ]),
              ]),
          trigger(
              'a',
              [
                transition('* => 1', [animate(1000, style({opacity: 0}))]),
              ]),
          trigger(
              'b',
              [
                transition(
                    '* => 1',
                    [
                      animate(1000, style({opacity: 0})),
                      query('.b-inner', [animate(1000, style({opacity: 0}))]),
                    ]),
              ]),
          trigger(
              'c',
              [
                transition('* => 1', [animate(1000, style({opacity: 0}))]),
              ]),
        ]
      })
      class Cmp {
        public exp0: any;
        public exp1: any;
        public exp2: any;
        public exp3: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp0 = '';
      cmp.exp1 = 1;
      cmp.exp2 = 1;
      // note that exp3 is skipped here
      fixture.detectChanges();

      let players = getLog();
      expect(players.length).toEqual(3);  // a,b,b-inner and not c
      resetLog();

      cmp.exp0 = 'go';
      fixture.detectChanges();

      const expectedKeyframes = [
        {backgroundColor: 'blue', offset: 0},
        {backgroundColor: 'red', offset: 1},
      ];

      players = getLog();
      expect(players.length).toEqual(3);
      const [p1, p2, p3] = players;

      expect(p1.element.classList.contains('a')).toBeTruthy();
      expect(p1.keyframes).toEqual(expectedKeyframes);

      expect(p2.element.classList.contains('b')).toBeTruthy();
      expect(p2.keyframes).toEqual(expectedKeyframes);

      expect(p3.element.classList.contains('b-inner')).toBeTruthy();
      expect(p3.keyframes).toEqual(expectedKeyframes);
    });

    it('should be able to query triggers directly by name', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp0">
              <div class="f1" @foo></div>
              <div class="f2" [@foo]></div>
              <div class="f3" [@foo]="exp1"></div>
              <div class="b1" @bar></div>
              <div class="b2" [@bar]></div>
              <div class="b3" [@bar]="exp2"></div>
            </div>
          `,
        animations: [
          trigger('foo', []),
          trigger('bar', []),
          trigger(
              'myAnimation',
              [
                transition(
                    '* => foo',
                    [
                      query(
                          '@foo',
                          [
                            animate(1000, style({color: 'red'})),
                          ]),
                    ]),
                transition(
                    '* => bar',
                    [
                      query(
                          '@bar',
                          [
                            animate(1000, style({color: 'blue'})),
                          ]),
                    ])
              ]),
        ]
      })
      class Cmp {
        public exp0: any;
        public exp1: any;
        public exp2: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      fixture.detectChanges();
      engine.flush();
      resetLog();

      cmp.exp0 = 'foo';
      fixture.detectChanges();
      engine.flush();

      let players = getLog();
      expect(players.length).toEqual(3);
      const [p1, p2, p3] = players;
      resetLog();

      expect(p1.element.classList.contains('f1')).toBeTruthy();
      expect(p2.element.classList.contains('f2')).toBeTruthy();
      expect(p3.element.classList.contains('f3')).toBeTruthy();

      cmp.exp0 = 'bar';
      fixture.detectChanges();
      engine.flush();

      players = getLog();
      expect(players.length).toEqual(3);
      const [p4, p5, p6] = players;
      resetLog();

      expect(p4.element.classList.contains('b1')).toBeTruthy();
      expect(p5.element.classList.contains('b2')).toBeTruthy();
      expect(p6.element.classList.contains('b3')).toBeTruthy();
    });

    it('should be able to query all active animations using :animating in a query', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" #parent>
              <div *ngFor="let item of items" class="item e-{{ item }}">
              </div>
            </div>
          `,
        animations: [
          trigger(
              'myAnimation',
              [
                transition(
                    '* => a',
                    [
                      query(
                          '.item:nth-child(odd)',
                          [
                            style({opacity: 0}),
                            animate(1000, style({opacity: 1})),
                          ]),
                    ]),
                transition(
                    '* => b',
                    [
                      query(
                          '.item:animating',
                          [
                            style({opacity: 1}),
                            animate(1000, style({opacity: 0})),
                          ]),
                    ]),
              ]),
        ]
      })
      class Cmp {
        public exp: any;
        public items: number[] = [0, 1, 2, 3, 4];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'a';
      fixture.detectChanges();
      engine.flush();

      let players = getLog();
      expect(players.length).toEqual(3);
      resetLog();

      cmp.exp = 'b';
      fixture.detectChanges();
      engine.flush();

      players = getLog();
      expect(players.length).toEqual(3);
      expect(players[0].element.classList.contains('e-0')).toBeTruthy();
      expect(players[1].element.classList.contains('e-2')).toBeTruthy();
      expect(players[2].element.classList.contains('e-4')).toBeTruthy();
    });

    it('should be able to query all actively queued animation triggers via `@*:animating`', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@parent]="exp0">
              <div class="c1" [@child]="exp1"></div>
              <div class="c2" [@child]="exp2"></div>
              <div class="c3" [@child]="exp3"></div>
              <div class="c4" [@child]="exp4"></div>
              <div class="c5" [@child]="exp5"></div>
            </div>
          `,
        animations: [
          trigger(
              'parent',
              [
                transition(
                    '* => *',
                    [
                      query(
                          '@*:animating', [animate(1000, style({background: 'red'}))],
                          {optional: true}),
                    ]),
              ]),
          trigger(
              'child',
              [
                transition('* => *', []),
              ])
        ]
      })
      class Cmp {
        public exp0: any;
        public exp1: any;
        public exp2: any;
        public exp3: any;
        public exp4: any;
        public exp5: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 0;
      cmp.exp2 = 0;
      cmp.exp3 = 0;
      cmp.exp4 = 0;
      cmp.exp5 = 0;
      fixture.detectChanges();

      cmp.exp0 = 0;
      fixture.detectChanges();

      let players = engine.players;
      cancelAllPlayers(players);

      cmp.exp2 = 1;
      cmp.exp4 = 1;
      fixture.detectChanges();

      cmp.exp0 = 1;
      fixture.detectChanges();

      players = engine.players;
      cancelAllPlayers(players);
      expect(players.length).toEqual(3);

      cmp.exp1 = 2;
      cmp.exp2 = 2;
      cmp.exp3 = 2;
      cmp.exp4 = 2;
      cmp.exp5 = 2;
      fixture.detectChanges();

      cmp.exp0 = 2;
      fixture.detectChanges();

      players = engine.players;
      cancelAllPlayers(players);
      expect(players.length).toEqual(6);

      cmp.exp0 = 3;
      fixture.detectChanges();

      players = engine.players;
      cancelAllPlayers(players);
      expect(players.length).toEqual(1);
    });

    it(
        'should collect styles for the same elements between queries', () => {
          @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="exp">
              <header></header>
              <footer></footer>
            </div>
          `,
          animations: [
            trigger('myAnimation', [
              transition('* => go', [
                query(':self, header, footer', style({opacity: '0.01'})),
                animate(1000, style({opacity: '1'})),
                query('header, footer', [
                  stagger(500, [
                    animate(1000, style({opacity: '1'}))
                  ])
                ])
              ])
            ])
          ]
        })
        class Cmp {
            public exp: any;
            public items: any[] = [0, 1, 2];
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;

          cmp.exp = 'go';
          fixture.detectChanges();
          engine.flush();

          const players = getLog();
          expect(players.length).toEqual(6);

          const [p1, p2, p3, p4, p5, p6] = players;

          expect(p1.delay).toEqual(0);
          expect(p1.duration).toEqual(0);
          expect(p1.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '0.01', offset: 1},
          ]);

          expect(p2.delay).toEqual(0);
          expect(p2.duration).toEqual(0);
          expect(p2.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '0.01', offset: 1},
          ]);

          expect(p3.delay).toEqual(0);
          expect(p3.duration).toEqual(0);
          expect(p3.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '0.01', offset: 1},
          ]);

          expect(p4.delay).toEqual(0);
          expect(p4.duration).toEqual(1000);
          expect(p4.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '1', offset: 1},
          ]);

          expect(p5.delay).toEqual(1000);
          expect(p5.duration).toEqual(1000);
          expect(p5.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '1', offset: 1},
          ]);

          expect(p6.delay).toEqual(1500);
          expect(p6.duration).toEqual(1000);
          expect(p6.keyframes).toEqual([
            {opacity: '0.01', offset: 0},
            {opacity: '1', offset: 1},
          ]);
        });

    it('should retain style values when :self is used inside of a query', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp"></div>
          `,
        animations: [trigger(
            'myAnimation',
            [transition(
                '* => go',
                [query(':self', style({opacity: '0.5'})), animate(1000, style({opacity: '1'}))])])]
      })
      class Cmp {
        public exp: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(2);

      const [p1, p2] = players;
      expect(p1.delay).toEqual(0);
      expect(p1.duration).toEqual(0);
      expect(p1.keyframes).toEqual([{opacity: '0.5', offset: 0}, {opacity: '0.5', offset: 1}]);

      expect(p2.delay).toEqual(0);
      expect(p2.duration).toEqual(1000);
      expect(p2.keyframes).toEqual([{opacity: '0.5', offset: 0}, {opacity: '1', offset: 1}]);
    });

    it('should properly apply stagger after various other steps within a query', () => {
      @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="exp">
              <header></header>
              <footer></footer>
            </div>
          `,
          animations: [
            trigger('myAnimation', [
              transition('* => go', [
                query(':self, header, footer', [
                  style({opacity: '0'}),
                  animate(1000, style({opacity: '0.3'})),
                  animate(1000, style({opacity: '0.6'})),
                  stagger(500, [
                    animate(1000, style({opacity: '1'}))
                  ])
                ])
              ])
            ])
          ]
        })
        class Cmp {
        public exp: any;
        public items: any[] = [0, 1, 2];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(3);

      const [p1, p2, p3] = players;

      expect(p1.delay).toEqual(0);
      expect(p1.duration).toEqual(3000);
      expect(p2.delay).toEqual(0);
      expect(p2.duration).toEqual(3500);
      expect(p3.delay).toEqual(0);
      expect(p3.duration).toEqual(4000);
    });

    it('should properly apply pre styling before a stagger is issued', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
          <div [@myAnimation]="exp">
            <div *ngFor="let item of items" class="item">
              {{ item }}
            </div>
          </div>
        `,
        animations: [
          trigger(
              'myAnimation',
              [
                transition(
                    '* => go',
                    [
                      query(
                          ':enter',
                          [
                            style({opacity: 0}),
                            stagger(
                                100,
                                [
                                  animate(1000, style({opacity: 1})),
                                ]),
                          ]),
                    ]),
              ]),
        ]
      })
      class Cmp {
        public exp: any;
        public items: any[] = [0, 1, 2, 3, 4];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(5);

      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const kf = player.keyframes;
        const limit = kf.length - 1;
        const staggerDelay = 100 * i;
        const duration = 1000 + staggerDelay;

        expect(kf[0]).toEqual({opacity: '0', offset: 0});
        if (limit > 1) {
          const offsetAtStaggerDelay = staggerDelay / duration;
          expect(kf[1]).toEqual({opacity: '0', offset: offsetAtStaggerDelay});
        }
        expect(kf[limit]).toEqual({opacity: '1', offset: 1});
        expect(player.duration).toEqual(duration);
      }
    });

    it('should apply a full stagger step delay if the timing data is left undefined', () => {
      @Component({
          selector: 'ani-cmp',
          template: `
          <div [@myAnimation]="exp">
            <div *ngFor="let item of items" class="item">
              {{ item }}
            </div>
          </div>
        `,
          animations: [trigger(
              'myAnimation',
              [transition(
                  '* => go', [query('.item', [stagger('full',[
                                         style({opacity: 0}), animate(1000, style({opacity: .5})),
                                         animate(500, style({opacity: 1}))
                                       ])])])])]
        })
        class Cmp {
        public exp: any;
        public items: any[] = [0, 1, 2, 3, 4];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(5);

      const [p1, p2, p3, p4, p5] = players;
      expect(p1.delay).toEqual(0);
      expect(p2.delay).toEqual(1500);
      expect(p3.delay).toEqual(3000);
      expect(p4.delay).toEqual(4500);
      expect(p5.delay).toEqual(6000);
    });

    it('should persist inner sub trigger styles once their animation is complete', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div @parent *ngIf="exp1">
              <div class="child" [@child]="exp2"></div>
            </div>
          `,
        animations: [
          trigger(
              'parent',
              [
                transition(
                    ':enter',
                    [
                      query(
                          '.child',
                          [
                            animateChild(),
                          ]),
                    ]),
              ]),
          trigger(
              'child',
              [
                state('*, void', style({height: '0px'})),
                state('b', style({height: '444px'})),
                transition('* => *', animate(500)),
              ]),
        ]
      })
      class Cmp {
        public exp1: any;
        public exp2: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = true;
      cmp.exp2 = 'b';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(1);
      const player = players[0];

      expect(player.keyframes).toEqual([{height: '0px', offset: 0}, {height: '444px', offset: 1}]);
      player.finish();

      expect(player.element.style.height).toEqual('444px');
    });

    it('should find newly inserted items in the component via :enter', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div @myAnimation>
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [
              transition(
                  ':enter',
                  [
                    query(
                        ':enter',
                        [
                          style({opacity: 0}),
                          animate(1000, style({opacity: .5})),
                        ]),
                  ]),
            ])]
      })
      class Cmp {
        public items: any[] = [0, 1, 2];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(3);

      const [p1, p2, p3] = players;
      expect(p1.element.innerText.trim()).toEqual('0');
      expect(p2.element.innerText.trim()).toEqual('1');
      expect(p3.element.innerText.trim()).toEqual('2');

      players.forEach(p => {
        expect(p.keyframes).toEqual([{opacity: '0', offset: 0}, {opacity: '0.5', offset: 1}]);
      });
    });

    it('should cleanup :enter and :leave artifacts from nodes when any animation sequences fail to be built',
       () => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div [@myAnimation]="items.length" class="parent" #container>
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
              <div *ngIf="items.length == 0" class="child">Leave!</div>
            </div>
          `,
           animations: [
             trigger(
                 'myAnimation',
                 [
                   transition('* => 0', []),
                   transition(
                       '* => *',
                       [
                         query(
                             '.child:enter',
                             [
                               style({opacity: 0}),
                               animate(1000, style({opacity: 1})),
                             ]),
                         query(
                             '.incorrect-child:leave',
                             [
                               animate(1000, style({opacity: 0})),
                             ]),
                       ]),
                 ]),
           ]
         })
         class Cmp {
           @ViewChild('container') public container: any;
           public items: any[] = [];
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.items = [];
         fixture.detectChanges();

         cmp.items = [0, 1, 2, 3, 4];

         expect(() => {
           fixture.detectChanges();
         }).toThrow();

         const children = cmp.container.nativeElement.querySelectorAll('.child');
         expect(children.length).toEqual(5);

         for (let i = 0; i < children.length; i++) {
           let child = children[i];
           expect(child.classList.contains(ENTER_CLASSNAME)).toBe(false);
           expect(child.classList.contains(LEAVE_CLASSNAME)).toBe(false);
         }
       });

    it('should find elements that have been removed via :leave', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [
              transition(
                  'a => b',
                  [query(':leave', [style({opacity: 1}), animate(1000, style({opacity: .5}))])]),
            ])]
      })
      class Cmp {
        public exp: any;
        public items: any[] = [4, 2, 0];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'a';
      fixture.detectChanges();
      engine.flush();
      resetLog();

      cmp.exp = 'b';
      cmp.items = [];
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(3);

      const [p1, p2, p3] = players;
      expect(p1.element.innerText.trim()).toEqual('4');
      expect(p2.element.innerText.trim()).toEqual('2');
      expect(p3.element.innerText.trim()).toEqual('0');

      players.forEach(p => {
        expect(p.keyframes).toEqual([{opacity: '1', offset: 0}, {opacity: '0.5', offset: 1}]);
      });
    });

    it('should find :enter nodes that have been inserted around non enter nodes', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [
              transition(
                  '* => go',
                  [query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))])]),
            ])]
      })
      class Cmp {
        public exp: any;
        public items: any[] = [];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'no';
      cmp.items = [2];
      fixture.detectChanges();
      engine.flush();
      resetLog();

      cmp.exp = 'go';
      cmp.items = [0, 1, 2, 3, 4];
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(4);

      const [p1, p2, p3, p4] = players;
      expect(p1.element.innerText.trim()).toEqual('0');
      expect(p2.element.innerText.trim()).toEqual('1');
      expect(p3.element.innerText.trim()).toEqual('3');
      expect(p4.element.innerText.trim()).toEqual('4');
    });

    it('should find :enter/:leave nodes that are nested inside of ng-container elements', () => {
      @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="items.length" class="parent">
              <ng-container *ngFor="let item of items">
                <section>
                  <div *ngIf="item % 2 == 0">even {{ item }}</div>
                  <div *ngIf="item % 2 == 1">odd {{ item }}</div>
                </section>
              </ng-container>
            </div>
          `,
          animations: [trigger(
            'myAnimation',
            [
              transition('0 => 5', [
                query(':enter', [
                  style({ opacity: '0' }),
                  animate(1000, style({ opacity: '1' }))
                ])
              ]),
              transition('5 => 0', [
                query(':leave', [
                  style({ opacity: '1' }),
                  animate(1000, style({ opacity: '0' }))
                ])
              ]),
            ])]
        })
        class Cmp {
        // TODO(issue/24571): remove '!'.
        public items!: any[];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.items = [];
      fixture.detectChanges();
      engine.flush();
      resetLog();

      cmp.items = [0, 1, 2, 3, 4];
      fixture.detectChanges();
      engine.flush();

      let players = getLog();
      expect(players.length).toEqual(5);

      for (let i = 0; i < 5; i++) {
        let player = players[i]!;
        expect(player.keyframes).toEqual([
          {opacity: '0', offset: 0},
          {opacity: '1', offset: 1},
        ]);

        let elm = player.element;
        let text = i % 2 == 0 ? `even ${i}` : `odd ${i}`;
        expect(elm.innerText.trim()).toEqual(text);
      }

      resetLog();
      cmp.items = [];
      fixture.detectChanges();
      engine.flush();

      players = getLog();
      expect(players.length).toEqual(5);

      for (let i = 0; i < 5; i++) {
        let player = players[i]!;
        expect(player.keyframes).toEqual([
          {opacity: '1', offset: 0},
          {opacity: '0', offset: 1},
        ]);

        let elm = player.element;
        let text = i % 2 == 0 ? `even ${i}` : `odd ${i}`;
        expect(elm.innerText.trim()).toEqual(text);
      }
    });

    it('should properly cancel items that were queried into a former animation and pass in the associated styles into the follow-up players per element',
       () => {
         @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
          animations: [trigger(
            'myAnimation',
            [
              transition('* => on', [
                query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                query(':enter', [style({width: 0}), animate(1000, style({height: 200}))])
              ]),
              transition('* => off', [
                query(':leave', [animate(1000, style({width: 0}))]),
                query(':leave', [animate(1000, style({opacity: 0}))])
              ]),
            ])]
        })
        class Cmp {
           public exp: any;
           // TODO(issue/24571): remove '!'.
           public items!: any[];
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = 'on';
         cmp.items = [0, 1, 2, 3, 4];
         fixture.detectChanges();
         engine.flush();

         const previousPlayers = getLog();
         expect(previousPlayers.length).toEqual(10);
         resetLog();

         cmp.exp = 'off';
         cmp.items = [0, 1, 2];
         fixture.detectChanges();
         engine.flush();

         const players = getLog();
         expect(players.length).toEqual(4);

         const [p1, p2, p3, p4] = players;

         // p1 && p2 are the starting players for item3 and item4
         expect(p1.previousStyles)
             .toEqual({opacity: AUTO_STYLE, width: AUTO_STYLE, height: AUTO_STYLE});
         expect(p2.previousStyles)
             .toEqual({opacity: AUTO_STYLE, width: AUTO_STYLE, height: AUTO_STYLE});

         // p3 && p4 are the following players for item3 and item4
         expect(p3.previousStyles).toEqual({});
         expect(p4.previousStyles).toEqual({});
       });

    it('should not remove a parent container if its contents are queried into by an ancestor element',
       () => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div [@myAnimation]="exp1" class="ancestor" #ancestor>
              <div class="parent" *ngIf="exp2" #parent>
                <div class="child"></div>
                <div class="child"></div>
              </div>
            </div>
          `,
           animations: [
             trigger(
                 'myAnimation',
                 [
                   transition(
                       '* => go',
                       [
                         query(
                             '.child',
                             [
                               style({opacity: 0}),
                               animate(1000, style({opacity: 1})),
                             ]),
                       ]),
                 ]),
           ]
         })
         class Cmp {
           public exp1: any = '';
           public exp2: any = true;

           @ViewChild('ancestor') public ancestorElm: any;

           @ViewChild('parent') public parentElm: any;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;
         fixture.detectChanges();
         engine.flush();
         resetLog();

         const ancestorElm = cmp.ancestorElm.nativeElement;
         const parentElm = cmp.parentElm.nativeElement;

         cmp.exp1 = 'go';
         cmp.exp2 = false;
         fixture.detectChanges();
         engine.flush();

         expect(ancestorElm.contains(parentElm)).toBe(true);

         const players = getLog();
         expect(players.length).toEqual(2);
         const [p1, p2] = players;
         expect(parentElm.contains(p1.element)).toBe(true);
         expect(parentElm.contains(p2.element)).toBe(true);

         cancelAllPlayers(players);

         expect(ancestorElm.contains(parentElm)).toBe(false);
       });

    it('should only retain a to-be-removed node if the inner queried items are apart of an animation issued by an ancestor',
       fakeAsync(() => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div [@one]="exp1" [@two]="exp2" class="ancestor" #ancestor>
              <header>hello</header>
              <div class="parent" *ngIf="parentExp" #parent>
                <div class="child">child</div>
              </div>
            </div>
          `,
           animations: [
             trigger(
                 'one',
                 [
                   transition(
                       '* => go',
                       [
                         query(
                             '.child',
                             [
                               style({height: '100px'}),
                               animate(1000, style({height: '0px'})),
                             ]),
                       ]),
                 ]),
             trigger(
                 'two',
                 [
                   transition('* => go', [query(
                                             'header',
                                             [
                                               style({width: '100px'}),
                                               animate(1000, style({width: '0px'})),
                                             ])]),
                 ]),
           ]
         })
         class Cmp {
           public exp1: any = '';
           public exp2: any = '';
           public parentExp: any = true;

           @ViewChild('ancestor') public ancestorElm: any;

           @ViewChild('parent') public parentElm: any;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;
         fixture.detectChanges();
         engine.flush();
         resetLog();

         const ancestorElm = cmp.ancestorElm.nativeElement;
         const parentElm = cmp.parentElm.nativeElement;
         expect(ancestorElm.contains(parentElm)).toBe(true);

         cmp.exp1 = 'go';
         fixture.detectChanges();
         engine.flush();

         expect(ancestorElm.contains(parentElm)).toBe(true);

         const onePlayers = getLog();
         expect(onePlayers.length).toEqual(1);  // element.child
         const [childPlayer] = onePlayers;

         let childPlayerComplete = false;
         childPlayer.onDone(() => childPlayerComplete = true);
         resetLog();
         flushMicrotasks();

         expect(childPlayerComplete).toBe(false);

         cmp.exp2 = 'go';
         cmp.parentExp = false;
         fixture.detectChanges();
         engine.flush();

         const twoPlayers = getLog();
         expect(twoPlayers.length).toEqual(1);  // the header element
         expect(ancestorElm.contains(parentElm)).toBe(false);
         expect(childPlayerComplete).toBe(true);
       }));

    it('should finish queried players in an animation when the next animation takes over', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [
              transition(
                  '* => on',
                  [
                    query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                  ]),
              transition('* => off', [])
            ])]
      })
      class Cmp {
        public exp: any;
        // TODO(issue/24571): remove '!'.
        public items!: any[];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'on';
      cmp.items = [0, 1, 2, 3, 4];
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(5);

      let count = 0;
      players.forEach(p => {
        p.onDone(() => count++);
      });

      expect(count).toEqual(0);

      cmp.exp = 'off';
      fixture.detectChanges();
      engine.flush();

      expect(count).toEqual(5);
    });

    it('should finish queried players when the previous player is finished', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [
              transition(
                  '* => on',
                  [
                    query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                  ]),
              transition('* => off', [])
            ])]
      })
      class Cmp {
        public exp: any;
        // TODO(issue/24571): remove '!'.
        public items!: any[];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'on';
      cmp.items = [0, 1, 2, 3, 4];
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(5);

      let count = 0;
      players.forEach(p => {
        p.onDone(() => count++);
      });

      expect(count).toEqual(0);

      expect(engine.players.length).toEqual(1);
      engine.players[0].finish();

      expect(count).toEqual(5);
    });

    it('should allow multiple triggers to animate on queried elements at the same time', () => {
      @Component({
          selector: 'ani-cmp',
          template: `
            <div [@one]="exp1" [@two]="exp2" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
          animations: [
            trigger('one', [
              transition('* => on', [
                query('.child', [
                  style({width: '0px'}),
                  animate(1000, style({width: '100px'}))
                ])
              ]),
              transition('* => off', [])
            ]),
            trigger('two', [
              transition('* => on', [
                query('.child:nth-child(odd)', [
                  style({height: '0px'}),
                  animate(1000, style({height: '100px'}))
                ])
              ]),
              transition('* => off', [])
            ])
          ]
        })
        class Cmp {
        public exp1: any;
        public exp2: any;
        // TODO(issue/24571): remove '!'.
        public items!: any[];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 'on';
      cmp.items = [0, 1, 2, 3, 4];
      fixture.detectChanges();
      engine.flush();

      let players = getLog();
      expect(players.length).toEqual(5);

      let count = 0;
      players.forEach(p => {
        p.onDone(() => count++);
      });

      resetLog();

      expect(count).toEqual(0);

      cmp.exp2 = 'on';
      fixture.detectChanges();
      engine.flush();

      expect(count).toEqual(0);

      players = getLog();
      expect(players.length).toEqual(3);

      players.forEach(p => {
        p.onDone(() => count++);
      });

      cmp.exp1 = 'off';
      fixture.detectChanges();
      engine.flush();

      expect(count).toEqual(5);

      cmp.exp2 = 'off';
      fixture.detectChanges();
      engine.flush();

      expect(count).toEqual(8);
    });

    it('should cancel inner queried animations if a trigger state value changes, but isn\'t detected as a valid transition',
       () => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
           animations: [trigger(
               'myAnimation',
               [transition(
                   '* => on',
                   [
                     query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                   ])])]
         })
         class Cmp {
           public exp: any;
           // TODO(issue/24571): remove '!'.
           public items!: any[];
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = 'on';
         cmp.items = [0, 1, 2, 3, 4];
         fixture.detectChanges();
         engine.flush();

         const players = getLog();
         expect(players.length).toEqual(5);

         let count = 0;
         players.forEach(p => {
           p.onDone(() => count++);
         });

         expect(count).toEqual(0);

         cmp.exp = 'off';
         fixture.detectChanges();
         engine.flush();

         expect(count).toEqual(5);
       });

    it('should allow for queried items to restore their styling back to the original state via animate(time, "*")',
       () => {
         @Component({
            selector: 'ani-cmp',
            template: `
            <div [@myAnimation]="exp" class="parent">
              <div *ngFor="let item of items" class="child">
                {{ item }}
              </div>
            </div>
          `,
            animations: [
              trigger('myAnimation', [
                transition('* => on', [
                  query(':enter', [
                    style({opacity: '0', width: '0px', height: '0px'}),
                    animate(1000, style({opacity: '1'})),
                    animate(1000, style(['*', {height: '200px'}]))
                  ])
                ])
              ])
            ]
          })
          class Cmp {
           public exp: any;
           // TODO(issue/24571): remove '!'.
           public items!: any[];
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = 'on';
         cmp.items = [0, 1, 2];
         fixture.detectChanges();
         engine.flush();

         const players = getLog();
         expect(players.length).toEqual(3);

         players.forEach(p => {
           expect(p.keyframes).toEqual([
             {opacity: '0', width: '0px', height: '0px', offset: 0},
             {opacity: '1', width: '0px', height: '0px', offset: .5},
             {opacity: AUTO_STYLE, width: AUTO_STYLE, height: '200px', offset: 1}
           ]);
         });
       });

    it('should query elements in sub components that do not contain animations using the :enter selector',
       () => {
         @Component({
           selector: 'parent-cmp',
           template: `
            <div [@myAnimation]="exp">
              <child-cmp #child></child-cmp>
            </div>
          `,
           animations: [trigger(
               'myAnimation',
               [transition(
                   '* => on',
                   [query(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))])])])]
         })
         class ParentCmp {
           public exp: any;

           @ViewChild('child') public child: any;
         }

         @Component({
           selector: 'child-cmp',
           template: `
            <div *ngFor="let item of items">
              {{ item }}
            </div>
          `
         })
         class ChildCmp {
           public items: any[] = [];
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});
         const fixture = TestBed.createComponent(ParentCmp);
         const cmp = fixture.componentInstance;
         fixture.detectChanges();

         cmp.exp = 'on';
         cmp.child.items = [1, 2, 3];
         fixture.detectChanges();

         const players = getLog() as any[];
         expect(players.length).toEqual(3);

         expect(players[0].element.innerText.trim()).toEqual('1');
         expect(players[1].element.innerText.trim()).toEqual('2');
         expect(players[2].element.innerText.trim()).toEqual('3');
       });

    it('should query elements in sub components that do not contain animations using the :leave selector',
       () => {
         @Component({
           selector: 'parent-cmp',
           template: `
            <div [@myAnimation]="exp">
              <child-cmp #child></child-cmp>
            </div>
          `,
           animations: [trigger(
               'myAnimation',
               [transition('* => on', [query(':leave', [animate(1000, style({opacity: 0}))])])])]
         })
         class ParentCmp {
           public exp: any;

           @ViewChild('child', {static: true}) public child: any;
         }

         @Component({
           selector: 'child-cmp',
           template: `
            <div *ngFor="let item of items">
              {{ item }}
            </div>
          `
         })
         class ChildCmp {
           public items: any[] = [];
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});
         const fixture = TestBed.createComponent(ParentCmp);
         const cmp = fixture.componentInstance;

         cmp.child.items = [4, 5, 6];
         fixture.detectChanges();

         cmp.exp = 'on';
         cmp.child.items = [];
         fixture.detectChanges();

         const players = getLog() as any[];
         expect(players.length).toEqual(3);

         expect(players[0].element.innerText.trim()).toEqual('4');
         expect(players[1].element.innerText.trim()).toEqual('5');
         expect(players[2].element.innerText.trim()).toEqual('6');
       });

    describe('options.limit', () => {
      it('should limit results when a limit value is passed into the query options', () => {
        @Component({
          selector: 'cmp',
          template: `
             <div [@myAnimation]="exp">
              <div *ngFor="let item of items" class="item">
                {{ item }}
              </div>
             </div>
          `,
          animations: [
            trigger(
                'myAnimation',
                [
                  transition(
                      '* => go',
                      [
                        query(
                            '.item',
                            [
                              style({opacity: 0}),
                              animate('1s', style({opacity: 1})),
                            ],
                            {limit: 2}),
                      ]),
                ]),
          ]
        })
        class Cmp {
          public exp: any;
          public items: any[] = [];
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.items = ['a', 'b', 'c', 'd', 'e'];
        fixture.detectChanges();

        cmp.exp = 'go';
        fixture.detectChanges();

        const players = getLog() as any[];
        expect(players.length).toEqual(2);
        expect(players[0].element.innerText.trim()).toEqual('a');
        expect(players[1].element.innerText.trim()).toEqual('b');
      });

      it('should support negative limit values by pulling in elements from the end of the query',
         () => {
           @Component({
             selector: 'cmp',
             template: `
             <div [@myAnimation]="exp">
              <div *ngFor="let item of items" class="item">
                {{ item }}
              </div>
             </div>
          `,
             animations: [
               trigger(
                   'myAnimation',
                   [
                     transition(
                         '* => go',
                         [
                           query(
                               '.item',
                               [
                                 style({opacity: 0}),
                                 animate('1s', style({opacity: 1})),
                               ],
                               {limit: -3}),
                         ]),
                   ]),
             ]
           })
           class Cmp {
             public exp: any;
             public items: any[] = [];
           }

           TestBed.configureTestingModule({declarations: [Cmp]});
           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.items = ['a', 'b', 'c', 'd', 'e'];
           fixture.detectChanges();

           cmp.exp = 'go';
           fixture.detectChanges();

           const players = getLog() as any[];
           expect(players.length).toEqual(3);
           expect(players[0].element.innerText.trim()).toEqual('c');
           expect(players[1].element.innerText.trim()).toEqual('d');
           expect(players[2].element.innerText.trim()).toEqual('e');
         });
    });
  });

  describe('sub triggers', () => {
    it('should animate a sub trigger that exists in an inner element in the template', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div #parent class="parent" [@parent]="exp1">
              <div #child class="child" [@child]="exp2"></div>
            </div>
          `,
        animations: [
          trigger('parent', [transition(
                                '* => go1',
                                [
                                  style({width: '0px'}), animate(1000, style({width: '100px'})),
                                  query('.child', [animateChild()])
                                ])]),
          trigger('child', [transition(
                               '* => go2',
                               [
                                 style({height: '0px'}),
                                 animate(1000, style({height: '100px'})),
                               ])])
        ]
      })
      class Cmp {
        public exp1: any;
        public exp2: any;

        @ViewChild('parent') public elm1: any;

        @ViewChild('child') public elm2: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 'go1';
      cmp.exp2 = 'go2';
      fixture.detectChanges();
      engine.flush();

      const elm1 = cmp.elm1;
      const elm2 = cmp.elm2;

      const [p1, p2] = getLog();
      expect(p1.delay).toEqual(0);
      expect(p1.element).toEqual(elm1.nativeElement);
      expect(p1.duration).toEqual(1000);
      expect(p1.keyframes).toEqual([{width: '0px', offset: 0}, {width: '100px', offset: 1}]);

      expect(p2.delay).toEqual(0);
      expect(p2.element).toEqual(elm2.nativeElement);
      expect(p2.duration).toEqual(2000);
      expect(p2.keyframes).toEqual([
        {height: '0px', offset: 0}, {height: '0px', offset: .5}, {height: '100px', offset: 1}
      ]);
    });

    it('should run and operate a series of triggers on a list of elements with overridden timing data',
       () => {
         @Component({
             selector: 'ani-cmp',
             template: `
            <div #parent class="parent" [@parent]="exp">
              <div class="item" *ngFor="let item of items" @child></div>
            </div>
          `,
             animations: [
               trigger('parent', [transition(
                                     '* => go',
                                     [
                                       style({opacity: '0'}), animate(1000, style({opacity: '1'})),
                                       query('.item', [animateChild({ duration: '2.5s', delay: '500ms' })]),
                                       animate(1000, style({opacity: '0'}))
                                     ])]),
               trigger('child', [transition(
                                    ':enter',
                                    [
                                      style({height: '0px'}),
                                      animate(1000, style({height: '100px'})),
                                    ])])
             ]
           })
           class Cmp {
           public exp: any;
           public items: any[] = [0, 1, 2, 3, 4];

           @ViewChild('parent') public elm: any;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = 'go';
         fixture.detectChanges();
         engine.flush();

         const parent = cmp.elm.nativeElement;
         const elements = parent.querySelectorAll('.item');

         const players = getLog();
         expect(players.length).toEqual(7);
         const [pA, pc1, pc2, pc3, pc4, pc5, pZ] = players;

         expect(pA.element).toEqual(parent);
         expect(pA.delay).toEqual(0);
         expect(pA.duration).toEqual(1000);

         expect(pc1.element).toEqual(elements[0]);
         expect(pc1.delay).toEqual(0);
         expect(pc1.duration).toEqual(4000);

         expect(pc2.element).toEqual(elements[1]);
         expect(pc2.delay).toEqual(0);
         expect(pc2.duration).toEqual(4000);

         expect(pc3.element).toEqual(elements[2]);
         expect(pc3.delay).toEqual(0);
         expect(pc3.duration).toEqual(4000);

         expect(pc4.element).toEqual(elements[3]);
         expect(pc4.delay).toEqual(0);
         expect(pc4.duration).toEqual(4000);

         expect(pc5.element).toEqual(elements[4]);
         expect(pc5.delay).toEqual(0);
         expect(pc5.duration).toEqual(4000);

         expect(pZ.element).toEqual(parent);
         expect(pZ.delay).toEqual(4000);
         expect(pZ.duration).toEqual(1000);
       });

    it('should silently continue if a sub trigger is animated that doesn\'t exist', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div #parent class="parent" [@parent]="exp">
              <div class="child"></div>
            </div>
          `,
        animations:
            [trigger('parent', [transition(
                                   '* => go',
                                   [
                                     style({opacity: 0}), animate(1000, style({opacity: 1})),
                                     query('.child', [animateChild({duration: '1s'})]),
                                     animate(1000, style({opacity: 0}))
                                   ])])]
      })
      class Cmp {
        public exp: any;
        public items: any[] = [0, 1, 2, 3, 4];

        @ViewChild('parent') public elm: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 'go';
      fixture.detectChanges();
      engine.flush();

      const parent = cmp.elm.nativeElement;
      const players = getLog();
      expect(players.length).toEqual(2);

      const [pA, pZ] = players;
      expect(pA.element).toEqual(parent);
      expect(pA.delay).toEqual(0);
      expect(pA.duration).toEqual(1000);

      expect(pZ.element).toEqual(parent);
      expect(pZ.delay).toEqual(1000);
      expect(pZ.duration).toEqual(1000);
    });

    it('should silently continue if a sub trigger is animated that doesn\'t contain a trigger that is setup for animation',
       () => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div #parent class="parent" [@parent]="exp1">
              <div [@child]="exp2" class="child"></div>
            </div>
          `,
           animations: [
             trigger(
                 'child',
                 [transition('a => z', [style({opacity: 0}), animate(1000, style({opacity: 1}))])]),
             trigger('parent', [transition(
                                   'a => z',
                                   [
                                     style({opacity: 0}), animate(1000, style({opacity: 1})),
                                     query('.child', [animateChild({duration: '1s'})]),
                                     animate(1000, style({opacity: 0}))
                                   ])])
           ]
         })
         class Cmp {
           public exp1: any;
           public exp2: any;

           @ViewChild('parent') public elm: any;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp1 = 'a';
         cmp.exp2 = 'a';
         fixture.detectChanges();
         engine.flush();
         resetLog();

         cmp.exp1 = 'z';
         fixture.detectChanges();
         engine.flush();

         const parent = cmp.elm.nativeElement;
         const players = getLog();
         expect(players.length).toEqual(2);

         const [pA, pZ] = players;
         expect(pA.element).toEqual(parent);
         expect(pA.delay).toEqual(0);
         expect(pA.duration).toEqual(1000);

         expect(pZ.element).toEqual(parent);
         expect(pZ.delay).toEqual(1000);
         expect(pZ.duration).toEqual(1000);
       });

    it('should animate all sub triggers on the element at the same time', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div #parent class="parent" [@parent]="exp1">
              <div [@w]="exp2" [@h]="exp2" class="child"></div>
            </div>
          `,
        animations: [
          trigger(
              'w',
              [transition('* => go', [style({width: 0}), animate(1800, style({width: '100px'}))])]),
          trigger(
              'h', [transition(
                       '* => go', [style({height: 0}), animate(1500, style({height: '100px'}))])]),
          trigger(
              'parent', [transition(
                            '* => go',
                            [
                              style({opacity: 0}), animate(1000, style({opacity: 1})),
                              query('.child', [animateChild()]), animate(1000, style({opacity: 0}))
                            ])])
        ]
      })
      class Cmp {
        public exp1: any;
        public exp2: any;

        @ViewChild('parent') public elm: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 'go';
      cmp.exp2 = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(4);
      const [pA, pc1, pc2, pZ] = players;

      expect(pc1.delay).toEqual(0);
      expect(pc1.duration).toEqual(2800);

      expect(pc2.delay).toEqual(0);
      expect(pc2.duration).toEqual(2500);

      expect(pZ.delay).toEqual(2800);
      expect(pZ.duration).toEqual(1000);
    });

    it('should skip a sub animation when a zero duration value is passed in', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div #parent class="parent" [@parent]="exp1">
              <div [@child]="exp2" class="child"></div>
            </div>
          `,
        animations: [
          trigger(
              'child',
              [transition('* => go', [style({width: 0}), animate(1800, style({width: '100px'}))])]),
          trigger('parent', [transition(
                                '* => go',
                                [
                                  style({opacity: 0}), animate(1000, style({opacity: 1})),
                                  query('.child', [animateChild({duration: '0'})]),
                                  animate(1000, style({opacity: 0}))
                                ])])
        ]
      })
      class Cmp {
        public exp1: any;
        public exp2: any;

        @ViewChild('parent') public elm: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 'go';
      cmp.exp2 = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(2);
      const [pA, pZ] = players;

      expect(pA.delay).toEqual(0);
      expect(pA.duration).toEqual(1000);

      expect(pZ.delay).toEqual(1000);
      expect(pZ.duration).toEqual(1000);
    });

    it('should only allow a sub animation to be used up by a parent trigger once', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@parent]="exp1" class="parent1" #parent>
              <div [@parent]="exp1" class="parent2">
                <div [@child]="exp2" class="child">
                </div>
              </div>
            </div>
          `,
        animations: [
          trigger('parent', [transition(
                                '* => go',
                                [
                                  style({opacity: 0}), animate(1000, style({opacity: 1})),
                                  query('.child', animateChild())
                                ])]),
          trigger(
              'child',
              [transition('* => go', [style({opacity: 0}), animate(1800, style({opacity: 1}))])])
        ]
      })
      class Cmp {
        public exp1: any;
        public exp2: any;

        @ViewChild('parent') public elm: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp1 = 'go';
      cmp.exp2 = 'go';
      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(3);

      const [p1, p2, p3] = players;

      // parent2 is evaluated first because it is inside of parent1
      expect(p1.element.classList.contains('parent2')).toBeTruthy();
      expect(p2.element.classList.contains('child')).toBeTruthy();
      expect(p3.element.classList.contains('parent1')).toBeTruthy();
    });

    it('should emulate a leave animation on the nearest sub host elements when a parent is removed',
       fakeAsync(() => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div @parent *ngIf="exp" class="parent1" #parent>
              <child-cmp #child @leave (@leave.start)="animateStart($event)"></child-cmp>
            </div>
          `,
           animations: [
             trigger(
                 'leave',
                 [
                   transition(':leave', [animate(1000, style({color: 'gold'}))]),
                 ]),
             trigger(
                 'parent',
                 [
                   transition(':leave', [query(':leave', animateChild())]),
                 ]),
           ]
         })
         class ParentCmp {
           public exp: boolean = true;
           @ViewChild('child') public childElm: any;

           public childEvent: any;

           animateStart(event: any) {
             if (event.toState == 'void') {
               this.childEvent = event;
             }
           }
         }

         @Component({
           selector: 'child-cmp',
           template: '...',
           animations: [
             trigger(
                 'child',
                 [
                   transition(':leave', [animate(1000, style({color: 'gold'}))]),
                 ]),
           ]
         })
         class ChildCmp {
           public childEvent: any;

           @HostBinding('@child') public animate = true;

           @HostListener('@child.start', ['$event'])
           animateStart(event: any) {
             if (event.toState == 'void') {
               this.childEvent = event;
             }
           }
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});
         const fixture = TestBed.createComponent(ParentCmp);
         const cmp = fixture.componentInstance;

         fixture.detectChanges();

         const childCmp = cmp.childElm;

         cmp.exp = false;
         fixture.detectChanges();
         flushMicrotasks();

         expect(cmp.childEvent.toState).toEqual('void');
         expect(cmp.childEvent.totalTime).toEqual(1000);
         expect(childCmp.childEvent.toState).toEqual('void');
         expect(childCmp.childEvent.totalTime).toEqual(1000);
       }));

    it('should emulate a leave animation on a sub component\'s inner elements when a parent leave animation occurs with animateChild',
       () => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div @myAnimation *ngIf="exp" class="parent">
              <child-cmp></child-cmp>
            </div>
          `,
           animations: [
             trigger(
                 'myAnimation',
                 [
                   transition(
                       ':leave',
                       [
                         query('@*', animateChild()),
                       ]),
                 ]),
           ]
         })
         class ParentCmp {
           public exp: boolean = true;
         }

         @Component({
           selector: 'child-cmp',
           template: `
               <section>
                 <div class="inner-div" @myChildAnimation></div>
               </section>
             `,
           animations: [
             trigger(
                 'myChildAnimation',
                 [
                   transition(
                       ':leave',
                       [
                         style({opacity: 0}),
                         animate('1s', style({opacity: 1})),
                       ]),
                 ]),
           ]
         })
         class ChildCmp {
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(ParentCmp);
         const cmp = fixture.componentInstance;

         cmp.exp = true;
         fixture.detectChanges();

         cmp.exp = false;
         fixture.detectChanges();

         let players = getLog();
         expect(players.length).toEqual(1);
         const [player] = players;

         expect(player.element.classList.contains('inner-div')).toBeTruthy();
         expect(player.keyframes).toEqual([
           {opacity: '0', offset: 0},
           {opacity: '1', offset: 1},
         ]);
       });

    it('should not cause a removal of inner @trigger DOM nodes when a parent animation occurs',
       fakeAsync(() => {
         @Component({
           selector: 'ani-cmp',
           template: `
            <div @parent *ngIf="exp" class="parent">
              this <div @child>child</div>
            </div>
          `,
           animations: [
             trigger(
                 'parent',
                 [
                   transition(
                       ':leave',
                       [
                         style({opacity: 0}),
                         animate('1s', style({opacity: 1})),
                       ]),
                 ]),
             trigger(
                 'child',
                 [
                   transition(
                       '* => something',
                       [
                         style({opacity: 0}),
                         animate('1s', style({opacity: 1})),
                       ]),
                 ]),
           ]
         })
         class Cmp {
           public exp: boolean = true;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = true;
         fixture.detectChanges();
         flushMicrotasks();

         cmp.exp = false;
         fixture.detectChanges();
         flushMicrotasks();

         const players = getLog();
         expect(players.length).toEqual(1);

         const element = players[0]!.element;
         expect(element.innerText.trim()).toMatch(/this\s+child/mg);
       }));

    it('should only mark outermost *directive nodes :enter and :leave when inserts and removals occur',
       () => {
         @Component({
           selector: 'ani-cmp',
           animations: [
             trigger(
                 'anim',
                 [
                   transition(
                       '* => enter',
                       [
                         query(':enter', [animate(1000, style({color: 'red'}))]),
                       ]),
                   transition(
                       '* => leave',
                       [
                         query(':leave', [animate(1000, style({color: 'blue'}))]),
                       ]),
                 ]),
           ],
           template: `
            <section class="container" [@anim]="exp ? 'enter' : 'leave'">
              <div class="a" *ngIf="exp">
                <div class="b" *ngIf="exp">
                  <div class="c" *ngIf="exp">
                    text
                  </div>
                </div>
              </div>
              <div>
                <div class="d" *ngIf="exp">
                  text2
                </div>
              </div>
            </section>
          `
         })
         class Cmp {
           // TODO(issue/24571): remove '!'.
           public exp!: boolean;
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;
         const container = fixture.elementRef.nativeElement;

         cmp.exp = true;
         fixture.detectChanges();
         engine.flush();

         let players = getLog();
         resetLog();
         expect(players.length).toEqual(2);
         const [p1, p2] = players;

         expect(p1.element.classList.contains('a')).toBeTrue();
         expect(p2.element.classList.contains('d')).toBeTrue();

         cmp.exp = false;
         fixture.detectChanges();
         engine.flush();

         players = getLog();
         resetLog();
         expect(players.length).toEqual(2);
         const [p3, p4] = players;

         expect(p3.element.classList.contains('a')).toBeTrue();
         expect(p4.element.classList.contains('d')).toBeTrue();
       });

    it('should collect multiple root levels of :enter and :leave nodes', () => {
      @Component({
        selector: 'ani-cmp',
        animations: [trigger(
            'pageAnimation',
            [
              transition(':enter', []),
              transition(
                  '* => *',
                  [
                    query(':leave', [animate('1s', style({opacity: 0}))], {optional: true}),
                    query(':enter', [animate('1s', style({opacity: 1}))], {optional: true})
                  ])
            ])],
        template: `
            <div [@pageAnimation]="status">
              <header>
                <div *ngIf="!loading" class="title">{{ title }}</div>
                <div *ngIf="loading" class="loading">loading...</div>
              </header>
              <section>
                <div class="page">
                  <div *ngIf="page1" class="page1">
                    <div *ngIf="true">page 1</div>
                  </div>
                  <div *ngIf="page2" class="page2">
                    <div *ngIf="true">page 2</div>
                  </div>
                </div>
              </section>
            </div>
          `
      })
      class Cmp {
        get title() {
          if (this.page1) {
            return 'hello from page1';
          }
          return 'greetings from page2';
        }

        page1 = false;
        page2 = false;
        loading = false;

        get status() {
          if (this.loading) return 'loading';
          if (this.page1) return 'page1';
          if (this.page2) return 'page2';
          return '';
        }
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.loading = true;
      fixture.detectChanges();
      engine.flush();

      let players = getLog();
      resetLog();
      cancelAllPlayers(players);

      cmp.page1 = true;
      cmp.loading = false;
      fixture.detectChanges();
      engine.flush();

      let p1: MockAnimationPlayer;
      let p2: MockAnimationPlayer;
      let p3: MockAnimationPlayer;

      players = getLog();
      expect(players.length).toEqual(3);
      [p1, p2, p3] = players;

      expect(p1.element.classList.contains('loading')).toBe(true);
      expect(p2.element.classList.contains('title')).toBe(true);
      expect(p3.element.classList.contains('page1')).toBe(true);

      resetLog();
      cancelAllPlayers(players);

      cmp.page1 = false;
      cmp.loading = true;
      fixture.detectChanges();

      players = getLog();
      cancelAllPlayers(players);

      expect(players.length).toEqual(3);
      [p1, p2, p3] = players;

      expect(p1.element.classList.contains('title')).toBe(true);
      expect(p2.element.classList.contains('page1')).toBe(true);
      expect(p3.element.classList.contains('loading')).toBe(true);

      resetLog();
      cancelAllPlayers(players);

      cmp.page2 = true;
      cmp.loading = false;
      fixture.detectChanges();
      engine.flush();

      players = getLog();
      expect(players.length).toEqual(3);
      [p1, p2, p3] = players;

      expect(p1.element.classList.contains('loading')).toBe(true);
      expect(p2.element.classList.contains('title')).toBe(true);
      expect(p3.element.classList.contains('page2')).toBe(true);
    });

    it('should emulate leave animation callbacks for all sub elements that have leave triggers within the component',
       fakeAsync(() => {
         @Component({
           selector: 'ani-cmp',
           animations: [
             trigger('parent', []), trigger('child', []),
             trigger(
                 'childWithAnimation',
                 [
                   transition(
                       ':leave',
                       [
                         animate(1000, style({background: 'red'})),
                       ]),
                 ])
           ],
           template: `
            <div data-name="p" class="parent" @parent *ngIf="exp" (@parent.start)="callback($event)" (@parent.done)="callback($event)">
              <div data-name="c1" @child (@child.start)="callback($event)" (@child.done)="callback($event)"></div>
              <div data-name="c2" @child (@child.start)="callback($event)" (@child.done)="callback($event)"></div>
              <div data-name="c3" @childWithAnimation (@childWithAnimation.start)="callback($event)" (@childWithAnimation.done)="callback($event)"></div>
            </div>
          `
         })
         class Cmp {
           // TODO(issue/24571): remove '!'.
           public exp!: boolean;
           public log: string[] = [];
           callback(event: any) {
             this.log.push(event.element.getAttribute('data-name') + '-' + event.phaseName);
           }
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;

         cmp.exp = true;
         fixture.detectChanges();
         flushMicrotasks();
         cmp.log = [];

         cmp.exp = false;
         fixture.detectChanges();
         flushMicrotasks();
         expect(cmp.log).toEqual([
           'c1-start', 'c1-done', 'c2-start', 'c2-done', 'p-start', 'c3-start', 'c3-done', 'p-done'
         ]);
       }));

    it('should build, but not run sub triggers when a parent animation is scheduled', () => {
      @Component({
        selector: 'parent-cmp',
        animations:
            [trigger('parent', [transition('* => *', [animate(1000, style({opacity: 0}))])])],
        template: '<div [@parent]="exp"><child-cmp #child></child-cmp></div>'
      })
      class ParentCmp {
        public exp: any;

        @ViewChild('child') public childCmp: any;
      }

      @Component({
        selector: 'child-cmp',
        animations:
            [trigger('child', [transition('* => *', [animate(1000, style({color: 'red'}))])])],
        template: '<div [@child]="exp"></div>'
      })
      class ChildCmp {
        public exp: any;
      }

      TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(ParentCmp);
      fixture.detectChanges();
      engine.flush();
      resetLog();

      const cmp = fixture.componentInstance;
      const childCmp = cmp.childCmp;

      cmp.exp = 1;
      childCmp.exp = 1;
      fixture.detectChanges();
      engine.flush();

      // we have 2 players, but the child is not used even though
      // it is created.
      const players = getLog();
      expect(players.length).toEqual(2);
      expect(engine.players.length).toEqual(1);

      expect((engine.players[0] as TransitionAnimationPlayer).getRealPlayer()).toBe(players[1]);
    });

    it('should fire and synchronize the start/done callbacks on sub triggers even if they are not allowed to animate within the animation',
       fakeAsync(() => {
         @Component({
           selector: 'parent-cmp',
           animations: [
             trigger(
                 'parent',
                 [
                   transition(
                       '* => go',
                       [
                         style({height: '0px'}),
                         animate(1000, style({height: '100px'})),
                       ]),
                 ]),
           ],
           template: `
            <div *ngIf="!remove"
                 [@parent]="exp"
                 (@parent.start)="track($event)"
                 (@parent.done)="track($event)">
                 <child-cmp #child></child-cmp>
            </div>
          `
         })
         class ParentCmp {
           @ViewChild('child') public childCmp: any;

           public exp: any;
           public log: string[] = [];
           public remove = false;

           track(event: any) {
             this.log.push(`${event.triggerName}-${event.phaseName}`);
           }
         }

         @Component({
           selector: 'child-cmp',
           animations: [
             trigger(
                 'child',
                 [
                   transition(
                       '* => go',
                       [
                         style({width: '0px'}),
                         animate(1000, style({width: '100px'})),
                       ]),
                 ]),
           ],
           template: `
            <div [@child]="exp"
                 (@child.start)="track($event)"
                 (@child.done)="track($event)"></div>
          `
         })
         class ChildCmp {
           public exp: any;
           public log: string[] = [];
           track(event: any) {
             this.log.push(`${event.triggerName}-${event.phaseName}`);
           }
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});
         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(ParentCmp);
         fixture.detectChanges();
         flushMicrotasks();

         const cmp = fixture.componentInstance;
         const child = cmp.childCmp;

         expect(cmp.log).toEqual(['parent-start', 'parent-done']);
         expect(child.log).toEqual(['child-start', 'child-done']);

         cmp.log = [];
         child.log = [];
         cmp.exp = 'go';
         cmp.childCmp.exp = 'go';
         fixture.detectChanges();
         flushMicrotasks();

         expect(cmp.log).toEqual(['parent-start']);
         expect(child.log).toEqual(['child-start']);

         const players = engine.players;
         expect(players.length).toEqual(1);
         players[0].finish();

         expect(cmp.log).toEqual(['parent-start', 'parent-done']);
         expect(child.log).toEqual(['child-start', 'child-done']);

         cmp.log = [];
         child.log = [];
         cmp.remove = true;
         fixture.detectChanges();
         flushMicrotasks();

         expect(cmp.log).toEqual(['parent-start', 'parent-done']);
         expect(child.log).toEqual(['child-start', 'child-done']);
       }));

    it('should fire and synchronize the start/done callbacks on multiple blocked sub triggers',
       fakeAsync(() => {
         @Component({
           selector: 'cmp',
           animations: [
             trigger(
                 'parent1',
                 [
                   transition(
                       '* => go, * => go-again',
                       [
                         style({opacity: 0}),
                         animate('1s', style({opacity: 1})),
                       ]),
                 ]),
             trigger(
                 'parent2',
                 [
                   transition(
                       '* => go, * => go-again',
                       [
                         style({lineHeight: '0px'}),
                         animate('1s', style({lineHeight: '10px'})),
                       ]),
                 ]),
             trigger(
                 'child1',
                 [
                   transition(
                       '* => go, * => go-again',
                       [
                         style({width: '0px'}),
                         animate('1s', style({width: '100px'})),
                       ]),
                 ]),
             trigger(
                 'child2',
                 [
                   transition(
                       '* => go, * => go-again',
                       [
                         style({height: '0px'}),
                         animate('1s', style({height: '100px'})),
                       ]),
                 ]),
           ],
           template: `
               <div [@parent1]="parent1Exp" (@parent1.start)="track($event)"
                    [@parent2]="parent2Exp" (@parent2.start)="track($event)">
                 <div [@child1]="child1Exp" (@child1.start)="track($event)"
                      [@child2]="child2Exp" (@child2.start)="track($event)"></div>
               </div>
          `
         })
         class Cmp {
           public parent1Exp = '';
           public parent2Exp = '';
           public child1Exp = '';
           public child2Exp = '';
           public log: string[] = [];

           track(event: any) {
             this.log.push(`${event.triggerName}-${event.phaseName}`);
           }
         }

         TestBed.configureTestingModule({declarations: [Cmp]});
         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(Cmp);
         fixture.detectChanges();
         flushMicrotasks();

         const cmp = fixture.componentInstance;
         cmp.log = [];
         cmp.parent1Exp = 'go';
         cmp.parent2Exp = 'go';
         cmp.child1Exp = 'go';
         cmp.child2Exp = 'go';
         fixture.detectChanges();
         flushMicrotasks();

         expect(cmp.log).toEqual(
             ['parent1-start', 'parent2-start', 'child1-start', 'child2-start']);

         cmp.parent1Exp = 'go-again';
         cmp.parent2Exp = 'go-again';
         cmp.child1Exp = 'go-again';
         cmp.child2Exp = 'go-again';
         fixture.detectChanges();
         flushMicrotasks();
       }));

    it('should stretch the starting keyframe of a child animation queries are issued by the parent',
       () => {
         @Component({
           selector: 'parent-cmp',
           animations: [trigger(
               'parent',
               [transition(
                   '* => *',
                   [animate(1000, style({color: 'red'})), query('@child', animateChild())])])],
           template: '<div [@parent]="exp"><child-cmp #child></child-cmp></div>'
         })
         class ParentCmp {
           public exp: any;

           @ViewChild('child') public childCmp: any;
         }

         @Component({
           selector: 'child-cmp',
           animations: [trigger(
               'child',
               [transition(
                   '* => *', [style({color: 'blue'}), animate(1000, style({color: 'red'}))])])],
           template: '<div [@child]="exp" class="child"></div>'
         })
         class ChildCmp {
           public exp: any;
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(ParentCmp);
         fixture.detectChanges();
         engine.flush();
         resetLog();

         const cmp = fixture.componentInstance;
         const childCmp = cmp.childCmp;

         cmp.exp = 1;
         childCmp.exp = 1;
         fixture.detectChanges();
         engine.flush();

         expect(engine.players.length).toEqual(1);  // child player, parent cover, parent player
         const groupPlayer = (engine.players[0] as TransitionAnimationPlayer).getRealPlayer() as
             AnimationGroupPlayer;
         const childPlayer = groupPlayer.players.find(player => {
           if (player instanceof MockAnimationPlayer) {
             return matchesElement(player.element, '.child');
           }
           return false;
         }) as MockAnimationPlayer;

         const keyframes = childPlayer.keyframes.map(kf => {
           delete kf['offset'];
           return kf;
         });

         expect(keyframes.length).toEqual(3);

         const [k1, k2, k3] = keyframes;
         expect(k1).toEqual(k2);
       });

    it('should allow a parent trigger to control child triggers across multiple template boundaries even if there are no animations in between',
       () => {
         @Component({
           selector: 'parent-cmp',
           animations: [
             trigger(
                 'parentAnimation',
                 [
                   transition(
                       '* => go',
                       [
                         query(':self, @grandChildAnimation', style({opacity: 0})),
                         animate(1000, style({opacity: 1})),
                         query(
                             '@grandChildAnimation',
                             [
                               animate(1000, style({opacity: 1})),
                               animateChild(),
                             ]),
                       ]),
                 ]),
           ],
           template: '<div [@parentAnimation]="exp"><child-cmp #child></child-cmp></div>'
         })
         class ParentCmp {
           public exp: any;

           @ViewChild('child') public innerCmp: any;
         }

         @Component(
             {selector: 'child-cmp', template: '<grandchild-cmp #grandchild></grandchild-cmp>'})
         class ChildCmp {
           @ViewChild('grandchild') public innerCmp: any;
         }

         @Component({
           selector: 'grandchild-cmp',
           animations: [
             trigger(
                 'grandChildAnimation',
                 [
                   transition(
                       '* => go',
                       [
                         style({width: '0px'}),
                         animate(1000, style({width: '200px'})),
                       ]),
                 ]),
           ],
           template: '<div [@grandChildAnimation]="exp"></div>'
         })
         class GrandChildCmp {
           public exp: any;
         }

         TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp, GrandChildCmp]});

         const engine = TestBed.inject(ɵAnimationEngine);
         const fixture = TestBed.createComponent(ParentCmp);
         fixture.detectChanges();
         engine.flush();
         resetLog();

         const cmp = fixture.componentInstance;
         const grandChildCmp = cmp.innerCmp.innerCmp;

         cmp.exp = 'go';
         grandChildCmp.exp = 'go';

         fixture.detectChanges();
         engine.flush();
         const players = getLog();
         expect(players.length).toEqual(5);
         const [p1, p2, p3, p4, p5] = players;

         expect(p5.keyframes).toEqual([
           {offset: 0, width: '0px'}, {offset: .67, width: '0px'}, {offset: 1, width: '200px'}
         ]);
       });

    it('should scope :enter queries between sub animations', () => {
      @Component({
        selector: 'cmp',
        animations: [
          trigger(
              'parent',
              [
                transition(':enter', group([
                             sequence([
                               style({opacity: 0}),
                               animate(1000, style({opacity: 1})),
                             ]),
                             query(':enter @child', animateChild()),
                           ])),
              ]),
          trigger(
              'child',
              [
                transition(
                    ':enter',
                    [
                      query(
                          ':enter .item',
                          [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                    ]),
              ]),
        ],
        template: `
               <div @parent *ngIf="exp1" class="container">
                 <div *ngIf="exp2">
                   <div @child>
                     <div *ngIf="exp3">
                       <div class="item"></div>
                     </div>
                   </div>
                 </div>
               </div>
             `
      })
      class Cmp {
        public exp1: any;
        public exp2: any;
        public exp3: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      resetLog();

      const cmp = fixture.componentInstance;
      cmp.exp1 = true;
      cmp.exp2 = true;
      cmp.exp3 = true;
      fixture.detectChanges();

      const players = getLog();
      expect(players.length).toEqual(2);

      const [p1, p2] = players;
      expect(p1.element.classList.contains('container')).toBeTruthy();
      expect(p2.element.classList.contains('item')).toBeTruthy();
    });

    it('should scope :leave queries between sub animations', () => {
      @Component({
        selector: 'cmp',
        animations: [
          trigger(
              'parent',
              [
                transition(':leave', group([
                             sequence([
                               style({opacity: 0}),
                               animate(1000, style({opacity: 1})),
                             ]),
                             query(':leave @child', animateChild()),
                           ])),
              ]),
          trigger(
              'child',
              [
                transition(
                    ':leave',
                    [
                      query(
                          ':leave .item',
                          [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                    ]),
              ]),
        ],
        template: `
               <div @parent *ngIf="exp1" class="container">
                 <div *ngIf="exp2">
                   <div @child>
                     <div *ngIf="exp3">
                       <div class="item"></div>
                     </div>
                   </div>
                 </div>
               </div>
             `
      })
      class Cmp {
        public exp1: any;
        public exp2: any;
        public exp3: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.exp1 = true;
      cmp.exp2 = true;
      cmp.exp3 = true;
      fixture.detectChanges();
      resetLog();

      cmp.exp1 = false;
      fixture.detectChanges();

      const players = getLog();
      expect(players.length).toEqual(2);

      const [p1, p2] = players;
      expect(p1.element.classList.contains('container')).toBeTruthy();
      expect(p2.element.classList.contains('item')).toBeTruthy();
    });
  });

  describe('animation control flags', () => {
    describe('[@.disabled]', () => {
      it('should allow a parent animation to query and animate inner nodes that are in a disabled region',
         () => {
           @Component({
             selector: 'some-cmp',
             template: `
              <div [@myAnimation]="exp">
                <div [@.disabled]="disabledExp">
                  <div class="header"></div>
                  <div class="footer"></div>
                </div>
              </div>
            `,
             animations: [
               trigger(
                   'myAnimation',
                   [
                     transition(
                         '* => go',
                         [
                           query('.header', animate(750, style({opacity: 0}))),
                           query('.footer', animate(250, style({opacity: 0}))),
                         ]),
                   ]),
             ]
           })
           class Cmp {
             exp: any = '';
             disableExp = false;
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.disableExp = true;
           fixture.detectChanges();
           resetLog();

           cmp.exp = 'go';
           fixture.detectChanges();
           const players = getLog();
           expect(players.length).toEqual(2);

           const [p1, p2] = players;
           expect(p1.duration).toEqual(750);
           expect(p1.element.classList.contains('header')).toBeTrue();
           expect(p2.duration).toEqual(250);
           expect(p2.element.classList.contains('footer')).toBeTrue();
         });

      it('should allow a parent animation to query and animate sub animations that are in a disabled region',
         () => {
           @Component({
             selector: 'some-cmp',
             template: `
              <div class="parent" [@parentAnimation]="exp">
                <div [@.disabled]="disabledExp">
                  <div class="child" [@childAnimation]="exp"></div>
                </div>
              </div>
            `,
             animations: [
               trigger(
                   'parentAnimation',
                   [
                     transition(
                         '* => go',
                         [
                           query('@childAnimation', animateChild()),
                           animate(1000, style({opacity: 0}))
                         ]),
                   ]),
               trigger(
                   'childAnimation',
                   [
                     transition('* => go', [animate(500, style({opacity: 0}))]),
                   ]),
             ]
           })
           class Cmp {
             exp: any = '';
             disableExp = false;
           }

           TestBed.configureTestingModule({declarations: [Cmp]});

           const fixture = TestBed.createComponent(Cmp);
           const cmp = fixture.componentInstance;
           cmp.disableExp = true;
           fixture.detectChanges();
           resetLog();

           cmp.exp = 'go';
           fixture.detectChanges();

           const players = getLog();
           expect(players.length).toEqual(2);

           const [p1, p2] = players;
           expect(p1.duration).toEqual(500);
           expect(p1.element.classList.contains('child')).toBeTrue();
           expect(p2.duration).toEqual(1000);
           expect(p2.element.classList.contains('parent')).toBeTrue();
         });
    });
  });
});
})();

function cancelAllPlayers(players: AnimationPlayer[]) {
  players.forEach(p => p.destroy());
}

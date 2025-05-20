/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  animate,
  animateChild,
  animation,
  AnimationEvent,
  AnimationMetadata,
  AnimationOptions,
  AUTO_STYLE,
  group,
  keyframes,
  query,
  sequence,
  state,
  style,
  transition,
  trigger,
  useAnimation,
  ɵPRE_STYLE as PRE_STYLE,
} from '@angular/animations';
import {AnimationDriver, NoopAnimationDriver, ɵAnimationEngine} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Inject,
  RendererFactory2,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {fakeAsync, flushMicrotasks, TestBed} from '../../testing';
import {ɵDomRendererFactory2} from '@angular/platform-browser';
import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import {hasStyle, isNode} from '@angular/private/testing';

const DEFAULT_NAMESPACE_ID = 'id';
const DEFAULT_COMPONENT_ID = '1';

(function () {
  // these tests are only meant to be run within the DOM (for now)
  if (isNode) return;

  describe('animation tests', function () {
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
        imports: [BrowserAnimationsModule],
      });
    });

    describe('animation modules', function () {
      it('should hint at BrowserAnimationsModule being used', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          declarations: [SharedAnimationCmp],
          imports: [BrowserAnimationsModule],
        });

        const fixture = TestBed.createComponent(SharedAnimationCmp);
        expect(fixture.componentInstance.animationType).toEqual('BrowserAnimations');
      });

      it('should hint at NoopAnimationsModule being used', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          declarations: [SharedAnimationCmp],
          imports: [NoopAnimationsModule],
        });

        const fixture = TestBed.createComponent(SharedAnimationCmp);
        expect(fixture.componentInstance.animationType).toEqual('NoopAnimations');
      });

      it('should hint at NoopAnimationsModule being used when BrowserAnimationsModule is provided with disabled animations', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          declarations: [SharedAnimationCmp],
          imports: [BrowserAnimationsModule.withConfig({disableAnimations: true})],
        });

        const fixture = TestBed.createComponent(SharedAnimationCmp);
        expect(fixture.componentInstance.animationType).toEqual('NoopAnimations');
      });
    });

    @Component({
      template: '<p>template text</p>',
      standalone: false,
    })
    class SharedAnimationCmp {
      constructor(
        @Inject(ANIMATION_MODULE_TYPE) public animationType: 'NoopAnimations' | 'BrowserAnimations',
      ) {}
    }

    describe('fakeAsync testing', () => {
      it('should only require one flushMicrotasks call to kick off animation callbacks', fakeAsync(() => {
        @Component({
          selector: 'cmp',
          template: `
            <div [@myAnimation]="exp" (@myAnimation.start)="cb('start')" (@myAnimation.done)="cb('done')"></div>
          `,
          animations: [
            trigger('myAnimation', [
              transition('* => on, * => off', [animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          status: string = '';
          cb(status: string) {
            this.status = status;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'on';
        fixture.detectChanges();
        expect(cmp.status).toEqual('');

        flushMicrotasks();
        expect(cmp.status).toEqual('start');

        let player = MockAnimationDriver.log.pop()!;
        player.finish();
        expect(cmp.status).toEqual('done');

        cmp.status = '';
        cmp.exp = 'off';
        fixture.detectChanges();
        expect(cmp.status).toEqual('');

        player = MockAnimationDriver.log.pop()!;
        player.finish();
        expect(cmp.status).toEqual('');
        flushMicrotasks();
        expect(cmp.status).toEqual('done');
      }));

      it('should always run .start callbacks before .done callbacks even for noop animations', fakeAsync(() => {
        @Component({
          selector: 'cmp',
          template: `
                <div [@myAnimation]="exp" (@myAnimation.start)="cb('start')" (@myAnimation.done)="cb('done')"></div>
          `,
          animations: [trigger('myAnimation', [transition('* => go', [])])],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          log: string[] = [];
          cb(status: string) {
            this.log.push(status);
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();
        expect(cmp.log).toEqual([]);

        flushMicrotasks();
        expect(cmp.log).toEqual(['start', 'done']);
      }));

      it('should emit the correct totalTime value for a noop-animation', fakeAsync(() => {
        @Component({
          selector: 'cmp',
          template: `
                <div [@myAnimation]="exp" (@myAnimation.start)="cb($event)" (@myAnimation.done)="cb($event)"></div>
          `,
          animations: [
            trigger('myAnimation', [transition('* => go', [animate('1s', style({opacity: 0}))])]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          log: AnimationEvent[] = [];
          cb(event: AnimationEvent) {
            this.log.push(event);
          }
        }

        TestBed.configureTestingModule({
          declarations: [Cmp],
          providers: [{provide: AnimationDriver, useClass: NoopAnimationDriver}],
        });

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();
        expect(cmp.log).toEqual([]);

        flushMicrotasks();
        expect(cmp.log.length).toEqual(2);
        const [start, end] = cmp.log;
        expect(start.totalTime).toEqual(1000);
        expect(end.totalTime).toEqual(1000);
      }));
    });

    describe('component fixture integration', () => {
      describe('whenRenderingDone', () => {
        it('should wait until the animations are finished until continuing', fakeAsync(() => {
          @Component({
            selector: 'cmp',
            template: `
              <div [@myAnimation]="exp"></div>
            `,
            animations: [
              trigger('myAnimation', [transition('* => on', [animate(1000, style({opacity: 1}))])]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});
          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;

          let isDone = false;
          fixture.whenRenderingDone().then(() => (isDone = true));
          expect(isDone).toBe(false);

          cmp.exp = 'on';
          fixture.detectChanges();
          engine.flush();
          expect(isDone).toBe(false);

          const players = engine.players;
          expect(players.length).toEqual(1);
          players[0].finish();
          expect(isDone).toBe(false);

          flushMicrotasks();
          expect(isDone).toBe(true);
        }));

        it('should wait for a noop animation to finish before continuing', fakeAsync(() => {
          @Component({
            selector: 'cmp',
            template: `
              <div [@myAnimation]="exp"></div>
            `,
            animations: [
              trigger('myAnimation', [transition('* => on', [animate(1000, style({opacity: 1}))])]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
          }

          TestBed.configureTestingModule({
            providers: [{provide: AnimationDriver, useClass: NoopAnimationDriver}],
            declarations: [Cmp],
          });

          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;

          let isDone = false;
          fixture.whenRenderingDone().then(() => (isDone = true));
          expect(isDone).toBe(false);

          cmp.exp = 'off';
          fixture.detectChanges();
          engine.flush();
          expect(isDone).toBe(false);

          flushMicrotasks();
          expect(isDone).toBe(true);
        }));

        it('should wait for active animations to finish even if they have already started', fakeAsync(() => {
          @Component({
            selector: 'cmp',
            template: `
                <div [@myAnimation]="exp"></div>
              `,
            animations: [
              trigger('myAnimation', [transition('* => on', [animate(1000, style({opacity: 1}))])]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});
          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          cmp.exp = 'on';
          fixture.detectChanges();
          engine.flush();

          const players = engine.players;
          expect(players.length).toEqual(1);

          let isDone = false;
          fixture.whenRenderingDone().then(() => (isDone = true));
          flushMicrotasks();
          expect(isDone).toBe(false);

          players[0].finish();
          flushMicrotasks();
          expect(isDone).toBe(true);
        }));
      });
    });

    describe('animation triggers', () => {
      it('should trigger a state change animation from void => state', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp" [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('void => *', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().length).toEqual(1);
        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['opacity', '0'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['opacity', '1'],
          ]),
        ]);
      });

      // https://github.com/angular/angular/issues/32794
      it('should support nested animation triggers', () => {
        const REUSABLE_ANIMATION = [
          trigger('myAnimation', [
            transition('void => *', [
              style({'opacity': '0'}),
              animate(500, style({'opacity': '1'})),
            ]),
          ]),
        ];

        @Component({
          selector: 'if-cmp',
          template: `
          <div @myAnimation></div>
        `,
          animations: [REUSABLE_ANIMATION],
          standalone: false,
        })
        class Cmp {}

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        fixture.detectChanges();
        engine.flush();

        expect(getLog().length).toEqual(1);
        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['opacity', '0'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['opacity', '1'],
          ]),
        ]);
      });

      it('should allow a transition to use a function to determine what method to run', () => {
        let valueToMatch = '';
        let capturedElement: any;
        const transitionFn = (fromState: string, toState: string, element: any) => {
          capturedElement = element;
          return toState == valueToMatch;
        };

        @Component({
          selector: 'if-cmp',
          template: '<div #element [@myAnimation]="exp"></div>',
          animations: [
            trigger('myAnimation', [
              transition(transitionFn, [style({opacity: 0}), animate(1234, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          @ViewChild('element') element: any;
          exp: any = '';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        valueToMatch = cmp.exp = 'something';
        fixture.detectChanges();
        const element = cmp.element.nativeElement;

        let players = getLog();
        expect(players.length).toEqual(1);
        let [p1] = players;
        expect(p1.totalTime).toEqual(1234);
        expect(capturedElement).toEqual(element);
        resetLog();

        valueToMatch = 'something-else';
        cmp.exp = 'this-wont-match';
        fixture.detectChanges();

        players = getLog();
        expect(players.length).toEqual(0);
      });

      it('should allow a transition to use a function to determine what method to run and expose any parameter values', () => {
        const transitionFn = (
          fromState: string,
          toState: string,
          element?: any,
          params?: {[key: string]: any},
        ) => {
          return params!['doMatch'] == true;
        };

        @Component({
          selector: 'if-cmp',
          template: '<div [@myAnimation]="{value:exp, params: {doMatch:doMatch}}"></div>',
          animations: [
            trigger('myAnimation', [
              transition(transitionFn, [style({opacity: 0}), animate(3333, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          doMatch = false;
          exp: any = '';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.doMatch = true;
        fixture.detectChanges();

        let players = getLog();
        expect(players.length).toEqual(1);
        let [p1] = players;
        expect(p1.totalTime).toEqual(3333);
        resetLog();

        cmp.doMatch = false;
        cmp.exp = 'this-wont-match';
        fixture.detectChanges();

        players = getLog();
        expect(players.length).toEqual(0);
      });

      it('should allow a state value to be `0`', () => {
        @Component({
          selector: 'if-cmp',
          template: `
            <div [@myAnimation]="exp"></div>
          `,
          animations: [
            trigger('myAnimation', [
              transition('0 => 1', [
                style({height: '0px'}),
                animate(1234, style({height: '100px'})),
              ]),
              transition('* => 1', [style({width: '0px'}), animate(4567, style({width: '100px'}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 0;
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp = 1;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().length).toEqual(1);
        const player = getLog().pop()!;
        expect(player.duration).toEqual(1234);
      });

      it('should always cancel the previous transition if a follow-up transition is not matched', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@myAnimation]="exp" (@myAnimation.start)="callback($event)" (@myAnimation.done)="callback($event)"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('a => b', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any;
          startEvent: any;
          doneEvent: any;

          callback(event: any) {
            if (event.phaseName == 'done') {
              this.doneEvent = event;
            } else {
              this.startEvent = event;
            }
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = 'a';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(0);
        expect(engine.players.length).toEqual(0);

        flushMicrotasks();
        expect(cmp.startEvent.toState).toEqual('a');
        expect(cmp.startEvent.totalTime).toEqual(0);
        expect(cmp.startEvent.toState).toEqual('a');
        expect(cmp.startEvent.totalTime).toEqual(0);
        resetLog();

        cmp.exp = 'b';
        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        expect(engine.players.length).toEqual(1);

        flushMicrotasks();
        expect(cmp.startEvent.toState).toEqual('b');
        expect(cmp.startEvent.totalTime).toEqual(500);
        expect(cmp.startEvent.toState).toEqual('b');
        expect(cmp.startEvent.totalTime).toEqual(500);
        resetLog();

        let completed = false;
        players[0].onDone(() => (completed = true));

        cmp.exp = 'c';
        fixture.detectChanges();
        engine.flush();

        expect(engine.players.length).toEqual(0);
        expect(getLog().length).toEqual(0);

        flushMicrotasks();
        expect(cmp.startEvent.toState).toEqual('c');
        expect(cmp.startEvent.totalTime).toEqual(0);
        expect(cmp.startEvent.toState).toEqual('c');
        expect(cmp.startEvent.totalTime).toEqual(0);

        expect(completed).toBe(true);
      }));

      it('should always fire inner callbacks even if no animation is fired when a view is inserted', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp">
            <div @myAnimation (@myAnimation.start)="track($event)" (@myAnimation.done)="track($event)"></div>
          </div>
        `,
          animations: [trigger('myAnimation', [])],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          log: string[] = [];
          track(event: any) {
            this.log.push(`${event.triggerName}-${event.phaseName}`);
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();
        flushMicrotasks();

        expect(cmp.log).toEqual([]);

        cmp.exp = true;
        fixture.detectChanges();
        flushMicrotasks();

        expect(cmp.log).toEqual(['myAnimation-start', 'myAnimation-done']);
      }));

      it('should only turn a view removal as into `void` state transition', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp1" [@myAnimation]="exp2"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('void <=> *', [
                style({width: '0px'}),
                animate(1000, style({width: '100px'})),
              ]),
              transition('* => *', [
                style({height: '0px'}),
                animate(1000, style({height: '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp1: any = false;
          exp2: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        function resetState() {
          cmp.exp2 = 'something';
          fixture.detectChanges();
          engine.flush();
          resetLog();
        }

        cmp.exp1 = true;
        cmp.exp2 = null;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['width', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['width', '100px'],
          ]),
        ]);

        resetState();
        cmp.exp2 = false;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['height', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['height', '100px'],
          ]),
        ]);

        resetState();
        cmp.exp2 = 0;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['height', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['height', '100px'],
          ]),
        ]);

        resetState();
        cmp.exp2 = '';

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['height', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['height', '100px'],
          ]),
        ]);

        resetState();
        cmp.exp2 = undefined;

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['height', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['height', '100px'],
          ]),
        ]);

        resetState();
        cmp.exp1 = false;
        cmp.exp2 = 'abc';

        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['width', '0px'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['width', '100px'],
          ]),
        ]);
      });

      it('should stringify boolean triggers to `1` and `0`', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('void => 1', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
              transition('1 => 0', [style({opacity: 1}), animate(1000, style({opacity: 0}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['opacity', '0'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['opacity', '1'],
          ]),
        ]);

        cmp.exp = false;
        fixture.detectChanges();
        engine.flush();

        expect(getLog().pop()!.keyframes).toEqual([
          new Map<string, string | number>([
            ['offset', 0],
            ['opacity', '1'],
          ]),
          new Map<string, string | number>([
            ['offset', 1],
            ['opacity', '0'],
          ]),
        ]);
      });

      it('should understand boolean values as `true` and `false` for transition animations', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('true => false', [
                style({opacity: 0}),
                animate(1234, style({opacity: 1})),
              ]),
              transition('false => true', [
                style({opacity: 1}),
                animate(4567, style({opacity: 0})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = true;
        fixture.detectChanges();

        cmp.exp = false;
        fixture.detectChanges();

        let players = getLog();
        expect(players.length).toEqual(1);
        let [player] = players;

        expect(player.duration).toEqual(1234);
      });

      it('should understand boolean values as `true` and `false` for transition animations and apply the corresponding state() value', () => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              state('true', style({color: 'red'})),
              state('false', style({color: 'blue'})),
              transition('true <=> false', [animate(1000, style({color: 'gold'})), animate(1000)]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = false;
        fixture.detectChanges();

        cmp.exp = true;
        fixture.detectChanges();

        let players = getLog();
        expect(players.length).toEqual(1);
        let [player] = players;

        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'blue'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'gold'],
            ['offset', 0.5],
          ]),
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should not throw an error if a trigger with the same name exists in separate components', () => {
        @Component({
          selector: 'cmp1',
          template: '...',
          animations: [trigger('trig', [])],
          standalone: false,
        })
        class Cmp1 {}

        @Component({
          selector: 'cmp2',
          template: '...',
          animations: [trigger('trig', [])],
          standalone: false,
        })
        class Cmp2 {}

        TestBed.configureTestingModule({declarations: [Cmp1, Cmp2]});
        const cmp1 = TestBed.createComponent(Cmp1);
        const cmp2 = TestBed.createComponent(Cmp2);
      });

      describe('host bindings', () => {
        it('should trigger a state change animation from state => state on the component host element', fakeAsync(() => {
          @Component({
            selector: 'my-cmp',
            template: '...',
            animations: [
              trigger('myAnimation', [
                transition('a => b', [
                  style({'opacity': '0'}),
                  animate(500, style({'opacity': '1'})),
                ]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            @HostBinding('@myAnimation') exp = 'a';
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          fixture.detectChanges();
          engine.flush();
          expect(getLog().length).toEqual(0);

          cmp.exp = 'b';
          fixture.detectChanges();
          engine.flush();
          expect(getLog().length).toEqual(1);

          const data = getLog().pop()!;
          expect(data.element).toEqual(fixture.elementRef.nativeElement);
          expect(data.keyframes).toEqual([
            new Map<string, string | number>([
              ['offset', 0],
              ['opacity', '0'],
            ]),
            new Map<string, string | number>([
              ['offset', 1],
              ['opacity', '1'],
            ]),
          ]);
        }));

        it('should trigger a leave animation when the inner has ViewContainerRef injected', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            template: `
             <child-cmp *ngIf="exp"></child-cmp>
           `,
            standalone: false,
          })
          class ParentCmp {
            public exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '...',
            animations: [
              trigger('host', [
                transition(':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))]),
              ]),
            ],
            standalone: false,
          })
          class ChildCmp {
            @HostBinding('@host') public hostAnimation = true;
            constructor(private vcr: ViewContainerRef) {}
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
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
            new Map<string, string | number>([
              ['opacity', '1'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['opacity', '0'],
              ['offset', 1],
            ]),
          ]);

          player.finish();
          expect(fixture.debugElement.nativeElement.children.length).toBe(0);
        }));

        it('should trigger a leave animation when the inner components host binding updates', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            template: `
                <child-cmp *ngIf="exp"></child-cmp>
              `,
            standalone: false,
          })
          class ParentCmp {
            public exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '...',
            animations: [
              trigger('host', [
                transition(':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))]),
              ]),
            ],
            standalone: false,
          })
          class ChildCmp {
            @HostBinding('@host') public hostAnimation = true;
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
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
            new Map<string, string | number>([
              ['opacity', '1'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['opacity', '0'],
              ['offset', 1],
            ]),
          ]);

          player.finish();
          expect(fixture.debugElement.nativeElement.children.length).toBe(0);
        }));

        it('should wait for child animations before removing parent', fakeAsync(() => {
          @Component({
            template: '<child-cmp *ngIf="exp" @parentTrigger></child-cmp>',
            animations: [
              trigger('parentTrigger', [
                transition(':leave', [group([query('@*', animateChild())])]),
              ]),
            ],
            standalone: false,
          })
          class ParentCmp {
            exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '<p @childTrigger>Hello there</p>',
            animations: [
              trigger('childTrigger', [
                transition(':leave', [style({opacity: 1}), animate('200ms', style({opacity: 0}))]),
              ]),
            ],
            standalone: false,
          })
          class ChildCmp {}

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});
          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(ParentCmp);

          fixture.detectChanges();
          engine.flush();
          expect(getLog().length).toBe(0);

          fixture.componentInstance.exp = false;
          fixture.detectChanges();
          expect(fixture.nativeElement.children.length).toBe(1);

          engine.flush();
          expect(getLog().length).toBe(2);

          const player = getLog()[1];
          expect(player.keyframes).toEqual([
            new Map<string, string | number>([
              ['opacity', '1'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['opacity', '0'],
              ['offset', 1],
            ]),
          ]);

          player.finish();
          flushMicrotasks();
          expect(fixture.nativeElement.children.length).toBe(0);
        }));

        // animationRenderer => nonAnimationRenderer
        it('should trigger a leave animation when the outer components element binding updates on the host component element', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            animations: [
              trigger('host', [
                transition(':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))]),
              ]),
            ],
            template: `
                <child-cmp *ngIf="exp" @host></child-cmp>
              `,
            standalone: false,
          })
          class ParentCmp {
            public exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '...',
            standalone: false,
          })
          class ChildCmp {}

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
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
            new Map<string, string | number>([
              ['opacity', '1'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['opacity', '0'],
              ['offset', 1],
            ]),
          ]);

          player.finish();
          flushMicrotasks();
          expect(fixture.debugElement.nativeElement.children.length).toBe(0);
        }));

        it('should trigger a leave animation when both the inner and outer components trigger on the same element', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            animations: [
              trigger('host', [
                transition(':leave', [
                  style({height: '100px'}),
                  animate(1000, style({height: '0px'})),
                ]),
              ]),
            ],
            template: `
                <child-cmp *ngIf="exp" @host></child-cmp>
              `,
            standalone: false,
          })
          class ParentCmp {
            public exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '...',
            animations: [
              trigger('host', [
                transition(':leave', [
                  style({width: '100px'}),
                  animate(1000, style({width: '0px'})),
                ]),
              ]),
            ],
            standalone: false,
          })
          class ChildCmp {
            @HostBinding('@host') public hostAnimation = true;
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
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
            new Map<string, string | number>([
              ['width', '100px'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['width', '0px'],
              ['offset', 1],
            ]),
          ]);

          expect(p2.keyframes).toEqual([
            new Map<string, string | number>([
              ['height', '100px'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['height', '0px'],
              ['offset', 1],
            ]),
          ]);

          p1.finish();
          p2.finish();
          flushMicrotasks();
          expect(fixture.debugElement.nativeElement.children.length).toBe(0);
        }));

        it('should not throw when the host element is removed and no animation triggers', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            template: `
                <child-cmp *ngIf="exp"></child-cmp>
              `,
            standalone: false,
          })
          class ParentCmp {
            public exp = true;
          }

          @Component({
            selector: 'child-cmp',
            template: '...',
            animations: [trigger('host', [transition('a => b', [style({height: '100px'})])])],
            standalone: false,
          })
          class ChildCmp {
            @HostBinding('@host') public hostAnimation = 'a';
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
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

        it('should properly evaluate pre/auto-style values when components are inserted/removed which contain host animations', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            template: `
                <child-cmp *ngFor="let item of items"></child-cmp>
              `,
            standalone: false,
          })
          class ParentCmp {
            items: any[] = [1, 2, 3, 4, 5];
          }

          @Component({
            selector: 'child-cmp',
            template: '... child ...',
            animations: [
              trigger('host', [transition(':leave', [animate(1000, style({opacity: 0}))])]),
            ],
            standalone: false,
          })
          class ChildCmp {
            @HostBinding('@host') public hostAnimation = 'a';
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(ParentCmp);
          const cmp = fixture.componentInstance;
          const element = fixture.nativeElement;
          fixture.detectChanges();

          cmp.items = [0, 2, 4, 6]; // 1,3,5 get removed
          fixture.detectChanges();

          const items = element.querySelectorAll('child-cmp');
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            expect(item.style['display']).toBeFalsy();
          }
        }));
      });

      it('should cancel and merge in mid-animation styles into the follow-up animation, but only for animation keyframes that start right away', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('a => b', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
              transition('b => c', [
                group([
                  animate(500, style({'width': '100px'})),
                  animate(500, style({'height': '100px'})),
                ]),
                animate(500, keyframes([style({'opacity': '0'}), style({'opacity': '1'})])),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
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
        expect(p1.previousStyles).toEqual(new Map([['opacity', AUTO_STYLE]]));
        expect(p2.previousStyles).toEqual(new Map([['opacity', AUTO_STYLE]]));
        expect(p3.previousStyles).toEqual(new Map());
      });

      it('should provide the styling of previous players that are grouped', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
          <div [@myAnimation]="exp"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('1 => 2', [
                group([
                  animate(500, style({'width': '100px'})),
                  animate(500, style({'height': '100px'})),
                ]),
                animate(500, keyframes([style({'opacity': '0'}), style({'opacity': '1'})])),
              ]),
              transition('2 => 3', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        fixture.detectChanges();
        engine.flush();

        cmp.exp = '1';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(0);
        resetLog();

        cmp.exp = '2';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(3);
        resetLog();

        cmp.exp = '3';
        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const player = players[0] as MockAnimationPlayer;
        const pp = player.previousPlayers as MockAnimationPlayer[];

        expect(pp.length).toEqual(3);
        expect(pp[0].currentSnapshot).toEqual(new Map([['width', AUTO_STYLE]]));
        expect(pp[1].currentSnapshot).toEqual(new Map([['height', AUTO_STYLE]]));
        expect(pp[2].currentSnapshot).toEqual(new Map([['opacity', AUTO_STYLE]]));
      });

      it('should provide the styling of previous players that are grouped and queried and make sure match the players with the correct elements', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
          <div class="container" [@myAnimation]="exp">
            <div class="inner"></div>
          </div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('1 => 2', [
                style({fontSize: '10px'}),
                query('.inner', [style({fontSize: '20px'})]),
                animate('1s', style({fontSize: '100px'})),
                query('.inner', [animate('1s', style({fontSize: '200px'}))]),
              ]),
              transition('2 => 3', [
                animate('1s', style({fontSize: '0px'})),
                query('.inner', [animate('1s', style({fontSize: '0px'}))]),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        fixture.detectChanges();

        cmp.exp = '1';
        fixture.detectChanges();
        resetLog();

        cmp.exp = '2';
        fixture.detectChanges();
        resetLog();

        cmp.exp = '3';
        fixture.detectChanges();
        const players = getLog();
        expect(players.length).toEqual(2);
        const [p1, p2] = players as MockAnimationPlayer[];

        const pp1 = p1.previousPlayers as MockAnimationPlayer[];
        expect(p1.element.classList.contains('container')).toBeTruthy();
        for (let i = 0; i < pp1.length; i++) {
          expect(pp1[i].element).toEqual(p1.element);
        }

        const pp2 = p2.previousPlayers as MockAnimationPlayer[];
        expect(p2.element.classList.contains('inner')).toBeTruthy();
        for (let i = 0; i < pp2.length; i++) {
          expect(pp2[i].element).toEqual(p2.element);
        }
      });

      it('should properly balance styles between states even if there are no destination state styles', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div @myAnimation *ngIf="exp"></div>
          `,
          animations: [
            trigger('myAnimation', [
              state('void', style({opacity: 0, width: '0px', height: '0px'})),
              transition(':enter', animate(1000)),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const [p1] = getLog();
        expect(p1.keyframes).toEqual([
          new Map<string, string | number>([
            ['opacity', '0'],
            ['width', '0px'],
            ['height', '0px'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['opacity', AUTO_STYLE],
            ['width', AUTO_STYLE],
            ['height', AUTO_STYLE],
            ['offset', 1],
          ]),
        ]);
      });

      it('should not apply the destination styles if the final animate step already contains styles', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div @myAnimation *ngIf="exp"></div>
          `,
          animations: [
            trigger('myAnimation', [
              state('void', style({color: 'red'})),
              state('*', style({color: 'blue'})),
              transition(':enter', [
                style({fontSize: '0px '}),
                animate(1000, style({fontSize: '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);

        // notice how the final color is NOT blue
        expect(players[0].keyframes).toEqual([
          new Map<string, string | number>([
            ['fontSize', '0px'],
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['fontSize', '100px'],
            ['color', 'red'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should invoke an animation trigger that is state-less', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngFor="let item of items" @myAnimation></div>
          `,
          animations: [
            trigger('myAnimation', [
              transition(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          items: number[] = [];
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.items = [1, 2, 3, 4, 5];
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(5);

        for (let i = 0; i < 5; i++) {
          const item = getLog()[i];
          expect(item.duration).toEqual(1000);
          expect(item.keyframes).toEqual([
            new Map<string, string | number>([
              ['opacity', '0'],
              ['offset', 0],
            ]),
            new Map<string, string | number>([
              ['opacity', '1'],
              ['offset', 1],
            ]),
          ]);
        }
      });

      it('should retain styles on the element once the animation is complete', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div #green @green></div>
          `,
          animations: [
            trigger('green', [
              state('*', style({backgroundColor: 'green'})),
              transition('* => *', animate(500)),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          @ViewChild('green') public element: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();
        engine.flush();

        const player = engine.players.pop()!;
        player.finish();

        expect(hasStyle(cmp.element.nativeElement, 'background-color', 'green')).toBeTruthy();
      });

      it('should retain state styles when the underlying DOM structure changes even if there are no insert/remove animations', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div class="item" *ngFor="let item of items" [@color]="colorExp">
              {{ item }}
            </div>
          `,
          animations: [trigger('color', [state('green', style({backgroundColor: 'green'}))])],
          standalone: false,
        })
        class Cmp {
          public colorExp = 'green';
          public items = [0, 1, 2, 3];

          reorder() {
            const temp = this.items[0];
            this.items[0] = this.items[1];
            this.items[1] = temp;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();

        let elements: HTMLElement[] = fixture.nativeElement.querySelectorAll('.item');
        assertBackgroundColor(elements[0], 'green');
        assertBackgroundColor(elements[1], 'green');
        assertBackgroundColor(elements[2], 'green');
        assertBackgroundColor(elements[3], 'green');

        elements[0].title = '0a';
        elements[1].title = '1a';

        cmp.reorder();
        fixture.detectChanges();

        elements = fixture.nativeElement.querySelectorAll('.item');
        assertBackgroundColor(elements[0], 'green');
        assertBackgroundColor(elements[1], 'green');
        assertBackgroundColor(elements[2], 'green');
        assertBackgroundColor(elements[3], 'green');

        function assertBackgroundColor(element: HTMLElement, color: string) {
          expect(element.style.getPropertyValue('background-color')).toEqual(color);
        }
      });

      it('should retain state styles when the underlying DOM structure changes even if there are insert/remove animations', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div class="item" *ngFor="let item of items" [@color]="colorExp">
              {{ item }}
            </div>
          `,
          animations: [
            trigger('color', [
              transition('* => *', animate(500)),
              state('green', style({backgroundColor: 'green'})),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public colorExp = 'green';
          public items = [0, 1, 2, 3];

          reorder() {
            const temp = this.items[0];
            this.items[0] = this.items[1];
            this.items[1] = temp;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();

        getLog().forEach((p) => p.finish());

        let elements: HTMLElement[] = fixture.nativeElement.querySelectorAll('.item');
        assertBackgroundColor(elements[0], 'green');
        assertBackgroundColor(elements[1], 'green');
        assertBackgroundColor(elements[2], 'green');
        assertBackgroundColor(elements[3], 'green');

        elements[0].title = '0a';
        elements[1].title = '1a';

        cmp.reorder();
        fixture.detectChanges();

        getLog().forEach((p) => p.finish());

        elements = fixture.nativeElement.querySelectorAll('.item');
        assertBackgroundColor(elements[0], 'green');
        assertBackgroundColor(elements[1], 'green');
        assertBackgroundColor(elements[2], 'green');
        assertBackgroundColor(elements[3], 'green');

        function assertBackgroundColor(element: HTMLElement, color: string) {
          expect(element.style.getPropertyValue('background-color')).toEqual(color);
        }
      });

      it('should keep/restore the trigger value when there are move operations (with *ngFor + trackBy)', fakeAsync(() => {
        @Component({
          selector: 'ani-cmp',
          template: `
          <div *ngFor="let item of items, trackBy: trackItem"
               @myAnimation (@myAnimation.start)="cb($event)">
            item{{ item }}
          </div>
        `,
          animations: [trigger('myAnimation', [])],
          standalone: false,
        })
        class Cmp {
          public items: number[] = [];

          log: string[] = [];
          cb(event: AnimationEvent) {
            this.log.push(
              `[${event.element.innerText.trim()}] ${event.fromState} => ${event.toState}`,
            );
          }

          trackItem(_index: number, item: number) {
            return item.toString();
          }
          addItem() {
            this.items.push(this.items.length);
          }
          removeItem() {
            this.items.pop();
          }
          reverseItems() {
            this.items = this.items.reverse();
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();

        const completeAnimations = () => {
          fixture.detectChanges();
          flushMicrotasks();
          engine.players.forEach((player) => player.finish());
        };

        cmp.log = [];
        [0, 1, 2].forEach(() => cmp.addItem());
        completeAnimations();
        expect(cmp.log).toEqual([
          '[item0] void => null',
          '[item1] void => null',
          '[item2] void => null',
        ]);

        cmp.reverseItems();
        completeAnimations();

        cmp.log = [];
        [0, 1, 2].forEach(() => cmp.removeItem());
        completeAnimations();
        expect(cmp.log).toEqual([
          '[item2] null => void',
          '[item1] null => void',
          '[item0] null => void',
        ]);
      }));

      it('should animate removals of nodes to the `void` state for each animation trigger, but treat all auto styles as pre styles', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngIf="exp" class="ng-if" [@trig1]="exp2" @trig2></div>
          `,
          animations: [
            trigger('trig1', [transition('state => void', [animate(1000, style({opacity: 0}))])]),
            trigger('trig2', [transition(':leave', [animate(1000, style({width: '0px'}))])]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp = true;
          public exp2 = 'state';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();
        resetLog();

        const element = fixture.nativeElement.querySelector('.ng-if');
        assertHasParent(element, true);

        cmp.exp = false;
        fixture.detectChanges();
        engine.flush();

        assertHasParent(element, true);

        expect(getLog().length).toEqual(2);

        const player2 = getLog().pop()!;
        const player1 = getLog().pop()!;

        expect(player2.keyframes).toEqual([
          new Map<string, string | number>([
            ['width', PRE_STYLE],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['width', '0px'],
            ['offset', 1],
          ]),
        ]);

        expect(player1.keyframes).toEqual([
          new Map<string, string | number>([
            ['opacity', PRE_STYLE],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['opacity', '0'],
            ['offset', 1],
          ]),
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
            trigger('myAnimation', [
              transition('* => go', [
                style({width: '0px'}),
                animate(1000, style({width: '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: string | null | undefined;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();
        engine.flush();
        expect(getLog().length).toEqual(1);
        const [player1] = getLog();
        resetLog();

        let finished = false;
        player1.onDone(() => (finished = true));

        let destroyed = false;
        player1.onDestroy(() => (destroyed = true));

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
          animations: [
            trigger('myAnimation', [transition('a => b', [animate(1000, style({width: '0px'}))])]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp = true;
          public exp2 = '0';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
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
      });

      it('should cancel all active inner child animations when a parent removal animation is set to go', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div *ngIf="exp1" @parent>
              <div [@child]="exp2" class="child1"></div>
              <div [@child]="exp2" class="child2"></div>
            </div>
          `,
          animations: [
            trigger('parent', [
              transition(':leave', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
            trigger('child', [
              transition('a => b', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
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
        cmp.exp2 = 'a';
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp2 = 'b';
        fixture.detectChanges();
        engine.flush();

        let players = getLog();
        expect(players.length).toEqual(2);
        const [p1, p2] = players;

        let count = 0;
        p1.onDone(() => count++);
        p2.onDone(() => count++);

        cmp.exp1 = false;
        fixture.detectChanges();
        engine.flush();

        expect(count).toEqual(2);
      });

      it('should destroy inner animations when a parent node is set for removal', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div #parent class="parent">
              <div [@child]="exp" class="child1"></div>
              <div [@child]="exp" class="child2"></div>
            </div>
          `,
          animations: [
            trigger('child', [
              transition('a => b', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;

          @ViewChild('parent') public parentElement: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        const someTrigger = trigger('someTrigger', []);
        const hostElement = fixture.nativeElement;
        engine.register(DEFAULT_NAMESPACE_ID, hostElement);
        engine.registerTrigger(
          DEFAULT_COMPONENT_ID,
          DEFAULT_NAMESPACE_ID,
          hostElement,
          someTrigger.name,
          someTrigger,
        );

        cmp.exp = 'a';
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp = 'b';
        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(2);
        const [p1, p2] = players;

        let count = 0;
        p1.onDone(() => count++);
        p2.onDone(() => count++);

        engine.onRemove(DEFAULT_NAMESPACE_ID, cmp.parentElement.nativeElement, null);
        expect(count).toEqual(2);
      });

      it('should allow inner removals to happen when a non removal-based parent animation is set to animate', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div #parent [@parent]="exp1" class="parent">
              <div #child *ngIf="exp2" class="child"></div>
            </div>
          `,
          animations: [
            trigger('parent', [
              transition('a => b', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp1: any;
          public exp2: any;

          @ViewChild('parent') public parent: any;

          @ViewChild('child') public child: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp1 = 'a';
        cmp.exp2 = true;
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp1 = 'b';
        fixture.detectChanges();
        engine.flush();

        const player = getLog()[0];
        const p = cmp.parent.nativeElement;
        const c = cmp.child.nativeElement;

        expect(p.contains(c)).toBeTruthy();

        cmp.exp2 = false;
        fixture.detectChanges();
        engine.flush();

        expect(p.contains(c)).toBeFalsy();

        player.finish();

        expect(p.contains(c)).toBeFalsy();
      });

      it('should make inner removals wait until a parent based removal animation has finished', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div #parent *ngIf="exp1" @parent class="parent">
              <div #child1 *ngIf="exp2" class="child1"></div>
              <div #child2 *ngIf="exp2" class="child2"></div>
            </div>
          `,
          animations: [
            trigger('parent', [
              transition(':leave', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp1: any;
          public exp2: any;

          @ViewChild('parent') public parent: any;

          @ViewChild('child1') public child1Elm: any;

          @ViewChild('child2') public child2Elm: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp1 = true;
        cmp.exp2 = true;
        fixture.detectChanges();
        engine.flush();
        resetLog();

        const p = cmp.parent.nativeElement;
        const c1 = cmp.child1Elm.nativeElement;
        const c2 = cmp.child2Elm.nativeElement;

        cmp.exp1 = false;
        cmp.exp2 = false;
        fixture.detectChanges();
        engine.flush();

        expect(p.contains(c1)).toBeTruthy();
        expect(p.contains(c2)).toBeTruthy();

        cmp.exp2 = false;
        fixture.detectChanges();
        engine.flush();

        expect(p.contains(c1)).toBeTruthy();
        expect(p.contains(c2)).toBeTruthy();
      });

      it('should detect trigger changes based on object.value properties', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="{value:exp}"></div>
          `,
          animations: [
            trigger('myAnimation', [
              transition('* => 1', [animate(1234, style({opacity: 0}))]),
              transition('* => 2', [animate(5678, style({opacity: 0}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = '1';
        fixture.detectChanges();
        engine.flush();
        let players = getLog();
        expect(players.length).toEqual(1);
        expect(players[0].duration).toEqual(1234);
        resetLog();

        cmp.exp = '2';
        fixture.detectChanges();
        engine.flush();
        players = getLog();
        expect(players.length).toEqual(1);
        expect(players[0].duration).toEqual(5678);
      });

      it('should not render animations when the object expression value is the same as it was previously', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="{value:exp,params:params}"></div>
          `,
          animations: [
            trigger('myAnimation', [transition('* => *', [animate(1234, style({opacity: 0}))])]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
          public params: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = '1';
        cmp.params = {};
        fixture.detectChanges();
        engine.flush();
        let players = getLog();
        expect(players.length).toEqual(1);
        expect(players[0].duration).toEqual(1234);
        resetLog();

        cmp.exp = '1';
        cmp.params = {};
        fixture.detectChanges();
        engine.flush();
        players = getLog();
        expect(players.length).toEqual(0);
      });

      it("should update the final state styles when params update even if the expression hasn't changed", fakeAsync(() => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="{value:exp,params:{color:color}}"></div>
          `,
          animations: [
            trigger('myAnimation', [
              state('*', style({color: '{{ color }}'}), {params: {color: 'black'}}),
              transition('* => 1', animate(500)),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
          public color: string | null | undefined;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = '1';
        cmp.color = 'red';
        fixture.detectChanges();
        const player = getLog()[0]!;
        const element = player.element;
        player.finish();

        flushMicrotasks();
        expect(hasStyle(element, 'color', 'red')).toBeTruthy();

        cmp.exp = '1';
        cmp.color = 'blue';
        fixture.detectChanges();
        resetLog();

        flushMicrotasks();
        expect(hasStyle(element, 'color', 'blue')).toBeTruthy();

        cmp.exp = '1';
        cmp.color = null;
        fixture.detectChanges();
        resetLog();

        flushMicrotasks();
        expect(hasStyle(element, 'color', 'black')).toBeTruthy();
      }));

      it('should substitute in values if the provided state match is an object with values', () => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="exp"></div>
          `,
          animations: [
            trigger('myAnimation', [
              transition(
                'a => b',
                [style({opacity: '{{ start }}'}), animate(1000, style({opacity: '{{ end }}'}))],
                buildParams({start: '0', end: '1'}),
              ),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = {value: 'a'};
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp = {value: 'b', params: {start: 0.3, end: 0.6}};
        fixture.detectChanges();
        engine.flush();
        const player = getLog().pop()!;
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['opacity', '0.3'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['opacity', '0.6'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should retain substituted styles on the element once the animation is complete if referenced in the final state', fakeAsync(() => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="{value:exp, params: { color: color }}"></div>
          `,
          animations: [
            trigger('myAnimation', [
              state(
                'start',
                style({
                  color: '{{ color }}',
                  fontSize: '{{ fontSize }}px',
                  width: '{{ width }}',
                }),
                {params: {color: 'red', fontSize: '200', width: '10px'}},
              ),
              state(
                'final',
                style({color: '{{ color }}', fontSize: '{{ fontSize }}px', width: '888px'}),
                {params: {color: 'green', fontSize: '50', width: '100px'}},
              ),
              transition('start => final', animate(500)),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
          public color: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = 'start';
        cmp.color = 'red';
        fixture.detectChanges();
        resetLog();

        cmp.exp = 'final';
        cmp.color = 'blue';
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [p1] = players;

        expect(p1.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['fontSize', '200px'],
            ['width', '10px'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'blue'],
            ['fontSize', '50px'],
            ['width', '888px'],
            ['offset', 1],
          ]),
        ]);

        const element = p1.element;
        p1.finish();
        flushMicrotasks();

        expect(hasStyle(element, 'color', 'blue')).toBeTruthy();
        expect(hasStyle(element, 'fontSize', '50px')).toBeTruthy();
        expect(hasStyle(element, 'width', '888px')).toBeTruthy();
      }));

      it('should only evaluate final state param substitutions from the expression and state values and not from the transition options ', fakeAsync(() => {
        @Component({
          selector: 'ani-cmp',
          template: `
            <div [@myAnimation]="exp"></div>
          `,
          animations: [
            trigger('myAnimation', [
              state(
                'start',
                style({
                  width: '{{ width }}',
                  height: '{{ height }}',
                }),
                {params: {width: '0px', height: '0px'}},
              ),
              state(
                'final',
                style({
                  width: '{{ width }}',
                  height: '{{ height }}',
                }),
                {params: {width: '100px', height: '100px'}},
              ),
              transition('start => final', [animate(500)], {
                params: {width: '333px', height: '666px'},
              }),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = 'start';
        fixture.detectChanges();
        resetLog();

        cmp.exp = 'final';
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [p1] = players;

        expect(p1.keyframes).toEqual([
          new Map<string, string | number>([
            ['width', '0px'],
            ['height', '0px'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['width', '100px'],
            ['height', '100px'],
            ['offset', 1],
          ]),
        ]);

        const element = p1.element;
        p1.finish();
        flushMicrotasks();

        expect(hasStyle(element, 'width', '100px')).toBeTruthy();
        expect(hasStyle(element, 'height', '100px')).toBeTruthy();
      }));

      it('should apply default params when resolved animation value is null or undefined', () => {
        @Component({
          selector: 'ani-cmp',
          template: `<div [@myAnimation]="exp"></div>`,
          animations: [
            trigger('myAnimation', [
              transition(
                'a => b',
                [style({opacity: '{{ start }}'}), animate(1000, style({opacity: '{{ end }}'}))],
                buildParams({start: '0.4', end: '0.7'}),
              ),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          public exp: any;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = {value: 'a'};
        fixture.detectChanges();
        engine.flush();
        resetLog();

        cmp.exp = {value: 'b', params: {start: undefined, end: null}};
        fixture.detectChanges();
        engine.flush();
        const player = getLog().pop()!;
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['opacity', '0.4'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['opacity', '0.7'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should not flush animations twice when an inner component runs change detection', () => {
        @Component({
          selector: 'outer-cmp',
          template: `
            <div *ngIf="exp" @outer></div>
            <inner-cmp #inner></inner-cmp>
          `,
          animations: [
            trigger('outer', [
              transition(':enter', [style({opacity: 0}), animate('1s', style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class OuterCmp {
          @ViewChild('inner') public inner: any;
          public exp: any = null;

          update() {
            this.exp = 'go';
          }

          ngDoCheck() {
            if (this.exp == 'go') {
              this.inner.update();
            }
          }
        }

        @Component({
          selector: 'inner-cmp',
          template: `
            <div *ngIf="exp" @inner></div>
          `,
          animations: [
            trigger('inner', [
              transition(':enter', [style({opacity: 0}), animate('1s', style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class InnerCmp {
          public exp: any;
          constructor(private _ref: ChangeDetectorRef) {}
          update() {
            this.exp = 'go';
            this._ref.detectChanges();
          }
        }

        TestBed.configureTestingModule({declarations: [OuterCmp, InnerCmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(OuterCmp);
        const cmp = fixture.componentInstance;
        fixture.detectChanges();
        expect(getLog()).toEqual([]);

        cmp.update();
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(2);
      });

      describe('transition aliases', () => {
        describe(':increment', () => {
          it('should detect when a value has incremented', () => {
            @Component({
              selector: 'if-cmp',
              template: `
          <div [@myAnimation]="exp"></div>
        `,
              animations: [
                trigger('myAnimation', [
                  transition(':increment', [animate(1234, style({background: 'red'}))]),
                ]),
              ],
              standalone: false,
            })
            class Cmp {
              exp: number = 0;
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            const cmp = fixture.componentInstance;
            fixture.detectChanges();
            let players = getLog();
            expect(players.length).toEqual(0);

            cmp.exp++;
            fixture.detectChanges();
            players = getLog();
            expect(players.length).toEqual(1);
            expect(players[0].duration).toEqual(1234);
            resetLog();

            cmp.exp = 5;
            fixture.detectChanges();
            players = getLog();
            expect(players.length).toEqual(1);
            expect(players[0].duration).toEqual(1234);
          });
        });

        describe(':decrement', () => {
          it('should detect when a value has decremented', () => {
            @Component({
              selector: 'if-cmp',
              template: `
          <div [@myAnimation]="exp"></div>
        `,
              animations: [
                trigger('myAnimation', [
                  transition(':decrement', [animate(1234, style({background: 'red'}))]),
                ]),
              ],
              standalone: false,
            })
            class Cmp {
              exp: number = 5;
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            const cmp = fixture.componentInstance;
            fixture.detectChanges();
            let players = getLog();
            expect(players.length).toEqual(0);

            cmp.exp--;
            fixture.detectChanges();
            players = getLog();
            expect(players.length).toEqual(1);
            expect(players[0].duration).toEqual(1234);
            resetLog();

            cmp.exp = 0;
            fixture.detectChanges();
            players = getLog();
            expect(players.length).toEqual(1);
            expect(players[0].duration).toEqual(1234);
          });
        });
      });

      it('should animate nodes properly when they have been re-ordered', () => {
        @Component({
          selector: 'if-cmp',
          template: `
                <div *ngFor="let item of items" [class]="'class-' + item.value">
                  <div [@myAnimation]="item.count">
                    {{ item.value }}
                  </div>
                </div>
              `,
          animations: [
            trigger('myAnimation', [
              state('0', style({opacity: 0})),
              state('1', style({opacity: 0.4})),
              state('2', style({opacity: 0.8})),
              transition('* => 1, * => 2', [animate(1000)]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          items = [
            {value: '1', count: 0},
            {value: '2', count: 0},
            {value: '3', count: 0},
            {value: '4', count: 0},
            {value: '5', count: 0},
          ];

          reOrder() {
            this.items = [
              this.items[4],
              this.items[1],
              this.items[3],
              this.items[0],
              this.items[2],
            ];
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        const one = cmp.items[0];
        const two = cmp.items[1];
        one.count++;
        fixture.detectChanges();

        cmp.reOrder();
        fixture.detectChanges();
        resetLog();

        one.count++;
        two.count++;
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(2);
      });
    });

    it('should not animate i18n insertBefore', () => {
      // I18n uses `insertBefore` API to insert nodes in correct order. Animation assumes that
      // any `insertBefore` is a move and tries to animate it.
      // NOTE: This test was extracted from `g3`
      @Component({
        template: `<div i18n>Hello <span>World</span>!</div>`,
        animations: [trigger('myAnimation', [transition('* => *', [animate(1000)])])],
        standalone: false,
      })
      class Cmp {}

      TestBed.configureTestingModule({declarations: [Cmp]});
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const players = getLog();
      const span = fixture.debugElement.nativeElement.querySelector('span');
      expect(span.innerText).toEqual('World');
      // We should not insert `ng-star-inserted` into the span class.
      expect(span.className).not.toContain('ng-star-inserted');
    });

    describe('animation listeners', () => {
      it('should trigger a `start` state change listener for when the animation changes state from void => state', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp" [@myAnimation]="exp" (@myAnimation.start)="callback($event)"></div>
        `,
          animations: [
            trigger('myAnimation', [
              transition('void => *', [
                style({'opacity': '0'}),
                animate(500, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          event: AnimationEvent | undefined;

          callback = (event: any) => {
            this.event = event;
          };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'true';
        fixture.detectChanges();
        flushMicrotasks();

        expect(cmp.event?.triggerName).toEqual('myAnimation');
        expect(cmp.event?.phaseName).toEqual('start');
        expect(cmp.event?.totalTime).toEqual(500);
        expect(cmp.event?.fromState).toEqual('void');
        expect(cmp.event?.toState).toEqual('true');
      }));

      it('should trigger a `done` state change listener for when the animation changes state from a => b', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div *ngIf="exp" [@myAnimation123]="exp" (@myAnimation123.done)="callback($event)"></div>
        `,
          animations: [
            trigger('myAnimation123', [
              transition('* => b', [
                style({'opacity': '0'}),
                animate(999, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
          event: AnimationEvent | undefined;

          callback = (event: any) => {
            this.event = event;
          };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp = 'b';
        fixture.detectChanges();
        engine.flush();

        expect(cmp.event).toBeFalsy();

        const player = engine.players.pop()!;
        player.finish();
        flushMicrotasks();

        expect(cmp.event?.triggerName).toEqual('myAnimation123');
        expect(cmp.event?.phaseName).toEqual('done');
        expect(cmp.event?.totalTime).toEqual(999);
        expect(cmp.event?.fromState).toEqual('void');
        expect(cmp.event?.toState).toEqual('b');
      }));

      it('should handle callbacks for multiple triggers running simultaneously', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@ani1]="exp1" (@ani1.done)="callback1($event)"></div>
          <div [@ani2]="exp2" (@ani2.done)="callback2($event)"></div>
        `,
          animations: [
            trigger('ani1', [
              transition('* => a', [
                style({'opacity': '0'}),
                animate(999, style({'opacity': '1'})),
              ]),
            ]),
            trigger('ani2', [
              transition('* => b', [
                style({'width': '0px'}),
                animate(999, style({'width': '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp1: any = false;
          exp2: any = false;
          event1: AnimationEvent | undefined;
          event2: AnimationEvent | undefined;
          callback1 = (event: any) => {
            this.event1 = event;
          };
          callback2 = (event: any) => {
            this.event2 = event;
          };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp1 = 'a';
        cmp.exp2 = 'b';
        fixture.detectChanges();
        engine.flush();

        expect(cmp.event1).toBeFalsy();
        expect(cmp.event2).toBeFalsy();

        const player1 = engine.players[0];
        const player2 = engine.players[1];

        player1.finish();
        player2.finish();
        expect(cmp.event1).toBeFalsy();
        expect(cmp.event2).toBeFalsy();

        flushMicrotasks();
        expect(cmp.event1?.triggerName).toBeTruthy('ani1');
        expect(cmp.event2?.triggerName).toBeTruthy('ani2');
      }));

      it('should handle callbacks for multiple triggers running simultaneously on the same element', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
          <div [@ani1]="exp1" (@ani1.done)="callback1($event)" [@ani2]="exp2" (@ani2.done)="callback2($event)"></div>
        `,
          animations: [
            trigger('ani1', [
              transition('* => a', [
                style({'opacity': '0'}),
                animate(999, style({'opacity': '1'})),
              ]),
            ]),
            trigger('ani2', [
              transition('* => b', [
                style({'width': '0px'}),
                animate(999, style({'width': '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp1: any = false;
          exp2: any = false;
          event1: AnimationEvent | undefined;
          event2: AnimationEvent | undefined;
          callback1 = (event: any) => {
            this.event1 = event;
          };
          callback2 = (event: any) => {
            this.event2 = event;
          };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;

        cmp.exp1 = 'a';
        cmp.exp2 = 'b';
        fixture.detectChanges();
        engine.flush();

        expect(cmp.event1).toBeFalsy();
        expect(cmp.event2).toBeFalsy();

        const player1 = engine.players[0];
        const player2 = engine.players[1];

        player1.finish();
        player2.finish();
        expect(cmp.event1).toBeFalsy();
        expect(cmp.event2).toBeFalsy();

        flushMicrotasks();
        expect(cmp.event1?.triggerName).toBeTruthy('ani1');
        expect(cmp.event2?.triggerName).toBeTruthy('ani2');
      }));

      it('should handle a leave animation for multiple triggers even if not all triggers have their own leave transition specified', fakeAsync(() => {
        @Component({
          selector: 'if-cmp',
          template: `
               <div *ngIf="exp" @foo @bar>123</div>
             `,
          animations: [
            trigger('foo', [
              transition(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
            ]),
            trigger('bar', [transition(':leave', [animate(1000, style({opacity: 0}))])]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const elm = fixture.elementRef.nativeElement;
        const cmp = fixture.componentInstance;

        cmp.exp = true;
        fixture.detectChanges();

        let players = getLog();
        expect(players.length).toEqual(1);
        let [p1] = players;
        p1.finish();
        flushMicrotasks();
        expect(elm.innerText.trim()).toEqual('123');

        resetLog();
        cmp.exp = false;
        fixture.detectChanges();

        players = getLog();
        expect(players.length).toEqual(1);
        [p1] = players;
        p1.finish();
        flushMicrotasks();
        expect(elm.innerText.trim()).toEqual('');
      }));

      it('should trigger a state change listener for when the animation changes state from void => state on the host element', fakeAsync(() => {
        @Component({
          selector: 'my-cmp',
          template: `...`,
          animations: [
            trigger('myAnimation2', [
              transition('void => *', [
                style({'opacity': '0'}),
                animate(1000, style({'opacity': '1'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          event: AnimationEvent | undefined;

          @HostBinding('@myAnimation2') exp: any = false;

          @HostListener('@myAnimation2.start', ['$event'])
          callback = (event: any) => {
            this.event = event;
          };
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'TRUE';
        fixture.detectChanges();
        flushMicrotasks();

        expect(cmp.event?.triggerName).toEqual('myAnimation2');
        expect(cmp.event?.phaseName).toEqual('start');
        expect(cmp.event?.totalTime).toEqual(1000);
        expect(cmp.event?.fromState).toEqual('void');
        expect(cmp.event?.toState).toEqual('TRUE');
      }));

      it('should always fire callbacks even when a transition is not detected', fakeAsync(() => {
        @Component({
          selector: 'my-cmp',
          template: `
              <div [@myAnimation]="exp" (@myAnimation.start)="callback($event)" (@myAnimation.done)="callback($event)"></div>
            `,
          animations: [trigger('myAnimation', [])],
          standalone: false,
        })
        class Cmp {
          exp: string | undefined;
          log: any[] = [];
          callback = (event: any) => this.log.push(`${event.phaseName} => ${event.toState}`);
        }

        TestBed.configureTestingModule({
          providers: [{provide: AnimationDriver, useClass: NoopAnimationDriver}],
          declarations: [Cmp],
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

      it('should fire callback events for leave animations even if there is no leave transition', fakeAsync(() => {
        @Component({
          selector: 'my-cmp',
          template: `
              <div *ngIf="exp" @myAnimation (@myAnimation.start)="callback($event)" (@myAnimation.done)="callback($event)"></div>
            `,
          animations: [trigger('myAnimation', [])],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
          log: any[] = [];
          callback = (event: any) => {
            const state = event.toState || '_default_';
            this.log.push(`${event.phaseName} => ${state}`);
          };
        }

        TestBed.configureTestingModule({
          providers: [{provide: AnimationDriver, useClass: NoopAnimationDriver}],
          declarations: [Cmp],
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

      it('should fire callbacks on a sub animation once it starts and finishes', fakeAsync(() => {
        @Component({
          selector: 'my-cmp',
          template: `
              <div class="parent"
                  [@parent]="exp1"
                  (@parent.start)="cb('parent-start',$event)"
                  (@parent.done)="cb('parent-done', $event)">
                <div class="child"
                  [@child]="exp2"
                  (@child.start)="cb('child-start',$event)"
                  (@child.done)="cb('child-done', $event)"></div>
              </div>
            `,
          animations: [
            trigger('parent', [
              transition('* => go', [
                style({width: '0px'}),
                animate(1000, style({width: '100px'})),
                query('.child', [animateChild({duration: '1s'})]),
                animate(1000, style({width: '0px'})),
              ]),
            ]),
            trigger('child', [
              transition('* => go', [
                style({height: '0px'}),
                animate(1000, style({height: '100px'})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          log: string[] = [];
          exp1: string | undefined;
          exp2: string | undefined;

          cb(name: string, event: AnimationEvent) {
            this.log.push(name);
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp1 = 'go';
        cmp.exp2 = 'go';
        fixture.detectChanges();
        engine.flush();
        flushMicrotasks();

        expect(cmp.log).toEqual(['parent-start', 'child-start']);
        cmp.log = [];

        const players = getLog();
        expect(players.length).toEqual(4);

        // players:
        //  - _scp (skipped child player): player for the child animation
        //  - pp1 (parent player 1): player for parent animation (from 0px to 100px)
        //  - pcp (parent child player):
        //     player for child animation executed by parent via query and animateChild
        //  - pp2 (parent player 2): player for parent animation (from 100px to 0px)
        const [_scp, pp1, pcp, pp2] = players;

        pp1.finish();
        flushMicrotasks();
        expect(cmp.log).toEqual([]);

        pcp.finish();
        flushMicrotasks();
        expect(cmp.log).toEqual([]);

        pp2.finish();
        flushMicrotasks();
        expect(cmp.log).toEqual(['parent-done', 'child-done']);
      }));

      it('should fire callbacks and collect the correct the totalTime and element details for any queried sub animations', fakeAsync(() => {
        @Component({
          selector: 'my-cmp',
          template: `
              <div class="parent" [@parent]="exp" (@parent.done)="cb('all','done', $event)">
                <div *ngFor="let item of items"
                     class="item item-{{ item }}"
                     @child
                     (@child.start)="cb('c-' + item, 'start', $event)"
                     (@child.done)="cb('c-' + item, 'done', $event)">
                  {{ item }}
                </div>
              </div>
            `,
          animations: [
            trigger('parent', [
              transition('* => go', [
                style({opacity: 0}),
                animate('1s', style({opacity: 1})),
                query('.item', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
                query('.item', [animateChild({duration: '1.8s', delay: '300ms'})]),
              ]),
            ]),
            trigger('child', [
              transition(':enter', [style({opacity: 0}), animate(1500, style({opacity: 1}))]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          log: string[] = [];
          events: {[name: string]: any} = {};
          exp: string | undefined;
          items: any = [0, 1, 2, 3];

          cb(name: string, phase: string, event: AnimationEvent) {
            this.log.push(name + '-' + phase);
            this.events[name] = event;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();
        engine.flush();
        flushMicrotasks();

        expect(cmp.log).toEqual(['c-0-start', 'c-1-start', 'c-2-start', 'c-3-start']);
        cmp.log = [];

        const players = getLog();
        expect(players.length).toEqual(13);

        // players:
        //  - _sc1p, _sc2p, _sc3p, _sc4p (skipped child n (1 to 4) players):
        //     players for the children animations
        //  - pp1 (parent player 1): player for parent animation (from opacity 0 to opacity 1)
        //  - pc1p1, pc2p1, pc3p1, pc4p1 (parent child n (1 to 4) player 1):
        //     players for children animations executed by parent via query and animate
        //     (from opacity 0 to opacity 1)
        //  - pc1p2, pc2p2, pc3p2, pc4p2 (parent child n (1 to 4) player 2):
        //     players for children animations executed by parent via query and animateChild
        const [
          _sc1p,
          _sc2p,
          _sc3p,
          _sc4p,
          pp1,
          pc1p1,
          pc2p1,
          pc3p1,
          pc4p1,
          pc1p2,
          pc2p2,
          pc3p2,
          pc4p2,
        ] = getLog();
        pp1.finish();
        pc1p1.finish();
        pc2p1.finish();
        pc3p1.finish();
        pc4p1.finish();
        flushMicrotasks();

        expect(cmp.log).toEqual([]);
        pc1p2.finish();
        pc2p2.finish();
        pc3p2.finish();
        pc4p2.finish();
        flushMicrotasks();

        expect(cmp.log).toEqual(['all-done', 'c-0-done', 'c-1-done', 'c-2-done', 'c-3-done']);

        expect(cmp.events['all'].totalTime).toEqual(4100); // 1000 + 1000 + 1800 + 300
        expect(cmp.events['all'].element.innerText.trim().replaceAll('\n', ' ')).toEqual('0 1 2 3');
        expect(cmp.events['c-0'].totalTime).toEqual(1500);
        expect(cmp.events['c-0'].element.innerText.trim()).toEqual('0');
        expect(cmp.events['c-1'].totalTime).toEqual(1500);
        expect(cmp.events['c-1'].element.innerText.trim()).toEqual('1');
        expect(cmp.events['c-2'].totalTime).toEqual(1500);
        expect(cmp.events['c-2'].element.innerText.trim()).toEqual('2');
        expect(cmp.events['c-3'].totalTime).toEqual(1500);
        expect(cmp.events['c-3'].element.innerText.trim()).toEqual('3');
      }));
    });

    describe('animation control flags', () => {
      describe('[@.disabled]', () => {
        it('should disable child animations when set to true', () => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableExp">
                <div [@myAnimation]="exp"></div>
              </div>
            `,
            animations: [
              trigger('myAnimation', [
                transition('* => 1, * => 2', [animate(1234, style({width: '100px'}))]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
            disableExp = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          fixture.detectChanges();
          resetLog();

          cmp.disableExp = true;
          cmp.exp = '1';
          fixture.detectChanges();

          let players = getLog();
          expect(players.length).toEqual(0);

          cmp.disableExp = false;
          cmp.exp = '2';
          fixture.detectChanges();

          players = getLog();
          expect(players.length).toEqual(1);
          expect(players[0].totalTime).toEqual(1234);
        });

        it('should ensure state() values are applied when an animation is disabled', () => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableExp">
                <div [@myAnimation]="exp" #elm></div>
              </div>
            `,
            animations: [
              trigger('myAnimation', [
                state('1', style({height: '100px'})),
                state('2', style({height: '200px'})),
                state('3', style({height: '300px'})),
                transition('* => *', animate(500)),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
            disableExp = false;

            @ViewChild('elm', {static: true}) public element: any;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const engine = TestBed.inject(ɵAnimationEngine);

          function assertHeight(element: any, height: string) {
            expect(element.style['height']).toEqual(height);
          }

          fixture.detectChanges();

          const cmp = fixture.componentInstance;
          const element = cmp.element.nativeElement;
          fixture.detectChanges();

          cmp.disableExp = true;
          cmp.exp = '1';
          fixture.detectChanges();
          assertHeight(element, '100px');

          cmp.exp = '2';
          fixture.detectChanges();
          assertHeight(element, '200px');

          cmp.exp = '3';
          fixture.detectChanges();
          assertHeight(element, '300px');
        });

        it('should disable animations for the element that they are disabled on', () => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableExp" [@myAnimation]="exp"></div>
            `,
            animations: [
              trigger('myAnimation', [
                transition('* => 1, * => 2', [animate(1234, style({width: '100px'}))]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            exp: any = false;
            disableExp = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          fixture.detectChanges();
          resetLog();

          cmp.disableExp = true;
          cmp.exp = '1';
          fixture.detectChanges();

          let players = getLog();
          expect(players.length).toEqual(0);
          resetLog();

          cmp.disableExp = false;
          cmp.exp = '2';
          fixture.detectChanges();

          players = getLog();
          expect(players.length).toEqual(1);
          expect(players[0].totalTime).toEqual(1234);
        });

        it('should respect inner disabled nodes once a parent becomes enabled', () => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableParentExp">
                <div [@.disabled]="disableChildExp">
                  <div [@myAnimation]="exp"></div>
                </div>
              </div>
            `,
            animations: [
              trigger('myAnimation', [
                transition('* => 1, * => 2, * => 3', [animate(1234, style({width: '100px'}))]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            disableParentExp = false;
            disableChildExp = false;
            exp = '';
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          fixture.detectChanges();
          resetLog();

          cmp.disableParentExp = true;
          cmp.disableChildExp = true;
          cmp.exp = '1';
          fixture.detectChanges();

          let players = getLog();
          expect(players.length).toEqual(0);

          cmp.disableParentExp = false;
          cmp.exp = '2';
          fixture.detectChanges();

          players = getLog();
          expect(players.length).toEqual(0);

          cmp.disableChildExp = false;
          cmp.exp = '3';
          fixture.detectChanges();

          players = getLog();
          expect(players.length).toEqual(1);
        });

        it('should properly handle dom operations when disabled', () => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableExp" #parent>
                <div *ngIf="exp" @myAnimation></div>
              </div>
            `,
            animations: [
              trigger('myAnimation', [
                transition(':enter', [style({opacity: 0}), animate(1234, style({opacity: 1}))]),
                transition(':leave', [animate(1234, style({opacity: 0}))]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            @ViewChild('parent') public parentElm: any;
            disableExp = false;
            exp = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          cmp.disableExp = true;
          fixture.detectChanges();
          resetLog();

          const parent = cmp.parentElm.nativeElement;

          cmp.exp = true;
          fixture.detectChanges();
          expect(getLog().length).toEqual(0);
          expect(parent.childElementCount).toEqual(1);

          cmp.exp = false;
          fixture.detectChanges();
          expect(getLog().length).toEqual(0);
          expect(parent.childElementCount).toEqual(0);
        });

        it('should properly resolve animation event listeners when disabled', fakeAsync(() => {
          @Component({
            selector: 'if-cmp',
            template: `
              <div [@.disabled]="disableExp">
                <div [@myAnimation]="exp" (@myAnimation.start)="startEvent=$event" (@myAnimation.done)="doneEvent=$event"></div>
              </div>
            `,
            animations: [
              trigger('myAnimation', [
                transition('* => 1, * => 2', [
                  style({opacity: 0}),
                  animate(9876, style({opacity: 1})),
                ]),
              ]),
            ],
            standalone: false,
          })
          class Cmp {
            disableExp = false;
            exp = '';
            startEvent: AnimationEvent | undefined;
            doneEvent: AnimationEvent | undefined;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          cmp.disableExp = true;
          fixture.detectChanges();
          resetLog();
          expect(cmp.startEvent).toBeFalsy();
          expect(cmp.doneEvent).toBeFalsy();

          cmp.exp = '1';
          fixture.detectChanges();
          flushMicrotasks();
          expect(cmp.startEvent?.totalTime).toEqual(9876);
          expect(cmp.startEvent?.disabled).toBeTruthy();
          expect(cmp.doneEvent?.totalTime).toEqual(9876);
          expect(cmp.doneEvent?.disabled).toBeTruthy();

          cmp.exp = '2';
          cmp.disableExp = false;
          fixture.detectChanges();
          flushMicrotasks();
          expect(cmp.startEvent?.totalTime).toEqual(9876);
          expect(cmp.startEvent?.disabled).toBeFalsy();
          // the done event isn't fired because it's an actual animation
        }));

        it('should work when there are no animations on the component handling the disable/enable flag', () => {
          @Component({
            selector: 'parent-cmp',
            template: `
              <div [@.disabled]="disableExp">
                <child-cmp #child></child-cmp>
              </div>
                `,
            standalone: false,
          })
          class ParentCmp {
            @ViewChild('child') public child: ChildCmp | null = null;
            disableExp = false;
          }

          @Component({
            selector: 'child-cmp',
            template: `
                <div [@myAnimation]="exp"></div>
                `,
            animations: [
              trigger('myAnimation', [
                transition('* => go, * => goAgain', [
                  style({opacity: 0}),
                  animate('1s', style({opacity: 1})),
                ]),
              ]),
            ],
            standalone: false,
          })
          class ChildCmp {
            public exp = '';
          }

          TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp]});

          const fixture = TestBed.createComponent(ParentCmp);
          const cmp = fixture.componentInstance;
          cmp.disableExp = true;
          fixture.detectChanges();
          resetLog();

          const child = cmp.child!;
          child.exp = 'go';
          fixture.detectChanges();

          expect(getLog().length).toEqual(0);
          resetLog();

          cmp.disableExp = false;
          child.exp = 'goAgain';
          fixture.detectChanges();
          expect(getLog().length).toEqual(1);
        });

        it('should treat the property as true when the expression is missing', () => {
          @Component({
            selector: 'parent-cmp',
            animations: [
              trigger('myAnimation', [
                transition('* => go', [style({opacity: 0}), animate(500, style({opacity: 1}))]),
              ]),
            ],
            template: `
              <div @.disabled>
                <div [@myAnimation]="exp"></div>
              </div>
                `,
            standalone: false,
          })
          class Cmp {
            exp = '';
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          fixture.detectChanges();
          resetLog();

          cmp.exp = 'go';
          fixture.detectChanges();
          expect(getLog().length).toEqual(0);
        });

        it('should respect parent/sub animations when the respective area in the DOM is disabled', fakeAsync(() => {
          @Component({
            selector: 'parent-cmp',
            animations: [
              trigger('parent', [
                transition('* => empty', [
                  style({opacity: 0}),
                  query('@child', [animateChild()]),
                  animate('1s', style({opacity: 1})),
                ]),
              ]),
              trigger('child', [transition(':leave', [animate('1s', style({opacity: 0}))])]),
            ],
            template: `
              <div [@.disabled]="disableExp" #container>
                <div [@parent]="exp" (@parent.done)="onDone($event)">
                  <div class="item" *ngFor="let item of items" @child (@child.done)="onDone($event)"></div>
                </div>
              </div>
                `,
            standalone: false,
          })
          class Cmp {
            @ViewChild('container') public container: any;

            disableExp = false;
            exp = '';
            items: any[] = [];
            doneLog: any[] = [];

            onDone(event: any) {
              this.doneLog.push(event);
            }
          }

          TestBed.configureTestingModule({declarations: [Cmp]});
          const engine = TestBed.inject(ɵAnimationEngine);
          const fixture = TestBed.createComponent(Cmp);
          const cmp = fixture.componentInstance;
          cmp.disableExp = true;
          cmp.items = [0, 1, 2, 3, 4];
          fixture.detectChanges();
          flushMicrotasks();

          cmp.exp = 'empty';
          cmp.items = [];
          cmp.doneLog = [];
          fixture.detectChanges();
          flushMicrotasks();

          const elms = cmp.container.nativeElement.querySelectorAll('.item');
          expect(elms.length).toEqual(0);

          expect(cmp.doneLog.length).toEqual(6);
        }));
      });
    });

    describe('animation normalization', () => {
      it('should convert hyphenated properties to camelcase by default', () => {
        @Component({
          selector: 'cmp',
          template: `
               <div [@myAnimation]="exp"></div>
             `,
          animations: [
            trigger('myAnimation', [
              transition('* => go', [
                style({'background-color': 'red', height: '100px', fontSize: '100px'}),
                animate(
                  '1s',
                  style({'background-color': 'blue', height: '200px', fontSize: '200px'}),
                ),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(1);
        expect(players[0].keyframes).toEqual([
          new Map<string, string | number>([
            ['backgroundColor', 'red'],
            ['height', '100px'],
            ['fontSize', '100px'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['backgroundColor', 'blue'],
            ['height', '200px'],
            ['fontSize', '200px'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should convert hyphenated properties to camelCase by default that are auto/pre style properties', () => {
        @Component({
          selector: 'cmp',
          template: `
               <div [@myAnimation]="exp"></div>
             `,
          animations: [
            trigger('myAnimation', [
              transition('* => go', [
                style({'background-color': AUTO_STYLE, 'font-size': '100px'}),
                animate('1s', style({'background-color': 'blue', 'font-size': PRE_STYLE})),
              ]),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = 'go';
        fixture.detectChanges();

        const players = getLog();
        expect(players.length).toEqual(1);
        expect(players[0].keyframes).toEqual([
          new Map<string, string | number>([
            ['backgroundColor', AUTO_STYLE],
            ['fontSize', '100px'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['backgroundColor', 'blue'],
            ['fontSize', PRE_STYLE],
            ['offset', 1],
          ]),
        ]);
      });
    });

    it('should throw neither state() or transition() are used inside of trigger()', () => {
      @Component({
        selector: 'if-cmp',
        template: `
          <div [@myAnimation]="exp"></div>
        `,
        animations: [trigger('myAnimation', [animate(1000, style({width: '100px'}))])],
        standalone: false,
      })
      class Cmp {
        exp: any = false;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      expect(() => {
        TestBed.createComponent(Cmp);
      }).toThrowError(
        /only state\(\) and transition\(\) definitions can sit inside of a trigger\(\)/,
      );
    });

    describe('animation and useAnimation functions', () => {
      it('should apply the delay specified in the animation', () => {
        const animationMetaData = animation(
          [style({color: 'red'}), animate(1000, style({color: 'green'}))],
          {delay: 3000},
        );

        @Component({
          selector: 'cmp',
          template: `
         <div @anim *ngIf="exp">
         </div>
       `,
          animations: [trigger('anim', [transition(':enter', useAnimation(animationMetaData))])],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [player] = players;
        expect(player.delay).toEqual(3000);
        expect(player.duration).toEqual(1000);
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'green'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should apply the delay specified in the animation using params', () => {
        const animationMetaData = animation(
          [style({color: 'red'}), animate(500, style({color: 'green'}))],
          {delay: '{{animationDelay}}ms', params: {animationDelay: 5500}},
        );

        @Component({
          selector: 'cmp',
          template: `
         <div @anim *ngIf="exp">
         </div>
       `,
          animations: [trigger('anim', [transition(':enter', useAnimation(animationMetaData))])],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [player] = players;
        expect(player.delay).toEqual(5500);
        expect(player.duration).toEqual(500);
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'green'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should apply the delay specified in the useAnimation call', () => {
        const animationMetaData = animation([
          style({color: 'red'}),
          animate(550, style({color: 'green'})),
        ]);

        @Component({
          selector: 'cmp',
          template: `
         <div @anim *ngIf="exp">
         </div>
       `,
          animations: [
            trigger('anim', [transition(':enter', useAnimation(animationMetaData, {delay: 1500}))]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [player] = players;
        expect(player.delay).toEqual(1500);
        expect(player.duration).toEqual(550);
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'green'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should apply the delay specified in the useAnimation call using params', () => {
        const animationMetaData = animation([
          style({color: 'red'}),
          animate(700, style({color: 'green'})),
        ]);

        @Component({
          selector: 'cmp',
          template: `
         <div @anim *ngIf="exp">
         </div>
       `,
          animations: [
            trigger('anim', [
              transition(
                ':enter',
                useAnimation(animationMetaData, {
                  delay: '{{useAnimationDelay}}ms',
                  params: {useAnimationDelay: 7500},
                }),
              ),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [player] = players;
        expect(player.delay).toEqual(7500);
        expect(player.duration).toEqual(700);
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'green'],
            ['offset', 1],
          ]),
        ]);
      });

      it('should combine the delays specified in the animation and the useAnimation with that of the caller', () => {
        const animationMetaData = animation(
          [style({color: 'red'}), animate(567, style({color: 'green'}))],
          {delay: 1000},
        );

        @Component({
          selector: 'cmp',
          template: `
         <div @anim *ngIf="exp">
         </div>
       `,
          animations: [
            trigger('anim', [
              transition(':enter', useAnimation(animationMetaData, {delay: 34}), {delay: 200}),
            ]),
          ],
          standalone: false,
        })
        class Cmp {
          exp: boolean = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});

        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;

        fixture.detectChanges();
        engine.flush();

        const players = getLog();
        expect(players.length).toEqual(1);
        const [player] = players;
        expect(player.delay).toEqual(1234);
        expect(player.duration).toEqual(567);
        expect(player.keyframes).toEqual([
          new Map<string, string | number>([
            ['color', 'red'],
            ['offset', 0],
          ]),
          new Map<string, string | number>([
            ['color', 'green'],
            ['offset', 1],
          ]),
        ]);
      });
    });

    it('should combine multiple errors together into one exception when an animation fails to be built', () => {
      @Component({
        selector: 'if-cmp',
        template: `
          <div [@foo]="fooExp" [@bar]="barExp"></div>
        `,
        animations: [
          trigger('foo', [
            transition(':enter', []),
            transition('* => *', [query('foo', animate(1000, style({background: 'red'})))]),
          ]),
          trigger('bar', [
            transition(':enter', []),
            transition('* => *', [query('bar', animate(1000, style({background: 'blue'})))]),
          ]),
        ],
        standalone: false,
      })
      class Cmp {
        fooExp: any = false;
        barExp: any = false;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      cmp.fooExp = 'go';
      cmp.barExp = 'go';

      let errorMsg: string = '';
      try {
        fixture.detectChanges();
      } catch (e) {
        errorMsg = (e as Error).message;
      }

      expect(errorMsg).toMatch(/@foo has failed due to:/);
      expect(errorMsg).toMatch(/`query\("foo"\)` returned zero elements/);
      expect(errorMsg).toMatch(/@bar has failed due to:/);
      expect(errorMsg).toMatch(/`query\("bar"\)` returned zero elements/);
    });

    it('should not throw an error if styles overlap in separate transitions', () => {
      @Component({
        selector: 'if-cmp',
        template: `
          <div [@myAnimation]="exp"></div>
        `,
        animations: [
          trigger('myAnimation', [
            transition('void => *', [style({opacity: 0}), animate('0.5s 1s', style({opacity: 1}))]),
            transition('* => void', [
              animate(1000, style({height: 0})),
              animate(1000, style({opacity: 0})),
            ]),
          ]),
        ],
        standalone: false,
      })
      class Cmp {
        exp: any = false;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      expect(() => {
        TestBed.createComponent(Cmp);
      }).not.toThrowError();
    });

    it("should add the transition provided delay to all the transition's timelines", () => {
      @Component({
        selector: 'cmp',
        template: `
       <div @parent *ngIf="exp">
         <div @child *ngIf="exp"></div>
       </div>
     `,
        animations: [
          trigger('parent', [
            transition(
              ':enter',
              [
                style({background: 'red'}),
                group(
                  [
                    animate('1s 3s ease', style({background: 'green'})),
                    query('@child', animateChild()),
                  ],
                  {delay: 111},
                ),
              ],
              {delay: '2s'},
            ),
          ]),
          trigger('child', [
            transition(
              ':enter',
              [style({color: 'white'}), animate('2s 3s ease', style({color: 'black'}))],
              {delay: 222},
            ),
          ]),
        ],
        standalone: false,
      })
      class Cmp {
        exp: boolean = false;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.exp = true;

      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(4);
      // players:
      //  - scp (skipped child player): player for the child animation
      //  - pp1 (parent player 1): player for parent animation (from background red to red)
      //  - pp2 (parent player 2): player for parent animation (from background red to green)
      //  - pcp (parent child player):
      //     player for child animation executed by parent via query and animateChild
      const [scp, pp1, pp2, pcp] = players;
      expect(scp.delay).toEqual(222);
      expect(pp1.delay).toEqual(2000);
      expect(pp2.delay).toEqual(2111); // 2000 + 111
      expect(pcp.delay).toEqual(0); // all the delays are included in the child animation
      expect(pcp.duration).toEqual(7333); // 2s + 3s + 2000 + 111 + 222
    });

    it('should keep (transition from/to) styles defined in different timelines', () => {
      @Component({
        selector: 'cmp',
        template: '<div @animation *ngIf="exp"></div>',
        animations: [
          trigger('animation', [
            transition(':enter', [
              group([
                style({opacity: 0, color: 'red'}),
                // Note: the objective of this test is to make sure the animation
                // transitions from opacity 0 and color red to opacity 1 and color blue,
                // even though the two styles are defined in different timelines
                animate(500, style({opacity: 1, color: 'blue'})),
              ]),
            ]),
          ]),
        ],
        standalone: false,
      })
      class Cmp {
        exp: boolean = false;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.exp = true;

      fixture.detectChanges();
      engine.flush();

      const players = getLog();
      expect(players.length).toEqual(1);

      const [player] = players;

      expect(player.keyframes).toEqual([
        new Map<string, string | number>([
          ['opacity', '0'],
          ['color', 'red'],
          ['offset', 0],
        ]),
        new Map<string, string | number>([
          ['opacity', '1'],
          ['color', 'blue'],
          ['offset', 1],
        ]),
      ]);
    });

    describe('errors for not using the animation module', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [{provide: RendererFactory2, useExisting: ɵDomRendererFactory2}],
        });
      });

      function syntheticPropError(name: string, nameKind: string) {
        return `NG05105: Unexpected synthetic ${nameKind} ${name} found. Please make sure that:
  - Make sure \`provideAnimationsAsync()\`, \`provideAnimations()\` or \`provideNoopAnimations()\` call was added to a list of providers used to bootstrap an application.
  - There is a corresponding animation configuration named \`${name}\` defined in the \`animations\` field of the \`@Component\` decorator (see https://angular.dev/api/core/Component#animations).`;
      }

      describe('when modules are missing', () => {
        it('should throw when using an @prop binding without the animation module', () => {
          @Component({
            template: `<div [@myAnimation]="true"></div>`,
            standalone: false,
          })
          class Cmp {}

          TestBed.configureTestingModule({declarations: [Cmp]});
          const comp = TestBed.createComponent(Cmp);
          expect(() => comp.detectChanges()).toThrowError(
            syntheticPropError('@myAnimation', 'property'),
          );
        });

        it('should throw when using an @prop listener without the animation module', () => {
          @Component({
            template: `<div (@myAnimation.start)="a = true"></div>`,
            standalone: false,
          })
          class Cmp {
            a = false;
          }

          TestBed.configureTestingModule({declarations: [Cmp]});

          expect(() => TestBed.createComponent(Cmp)).toThrowError(
            syntheticPropError('@myAnimation.start', 'listener'),
          );
        });
      });

      describe('when modules are present, but animations are missing', () => {
        it('should throw when using an @prop property, BrowserAnimationModule is imported, but there is no animation rule', () => {
          @Component({
            template: `<div [@myAnimation]="true"></div>`,
            standalone: false,
          })
          class Cmp {}

          TestBed.configureTestingModule({declarations: [Cmp], imports: [BrowserAnimationsModule]});
          const comp = TestBed.createComponent(Cmp);
          expect(() => comp.detectChanges()).toThrowError(
            syntheticPropError('@myAnimation', 'property'),
          );
        });

        it('should throw when using an @prop listener, BrowserAnimationModule is imported, but there is no animation rule', () => {
          @Component({
            template: `<div (@myAnimation.start)="true"></div>`,
            standalone: false,
          })
          class Cmp {}

          TestBed.configureTestingModule({declarations: [Cmp], imports: [BrowserAnimationsModule]});

          expect(() => TestBed.createComponent(Cmp)).toThrowError(
            syntheticPropError('@myAnimation.start', 'listener'),
          );
        });
      });
    });

    describe('non-animatable css props', () => {
      function buildAndAnimateSimpleTestComponent(triggerAnimationData: AnimationMetadata[]) {
        @Component({
          selector: 'cmp',
          template: `
          <div *ngIf="exp" [@myAnimation]="exp">
            <p *ngIf="exp"></p>
          </div>
        `,
          animations: [trigger('myAnimation', [transition('void => *', triggerAnimationData)])],
          standalone: false,
        })
        class Cmp {
          exp: any = false;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const engine = TestBed.inject(ɵAnimationEngine);
        const fixture = TestBed.createComponent(Cmp);
        const cmp = fixture.componentInstance;
        cmp.exp = true;
        fixture.detectChanges();
        engine.flush();
      }

      it('should show a warning if the animation tries to transition a non-animatable property', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          style({display: 'block'}),
          animate(500, style({display: 'inline'})),
        ]);
        expect(spyWarn).toHaveBeenCalledOnceWith(
          'Warning: The animation trigger "myAnimation" is attempting to animate the following' +
            ' not animatable properties: display' +
            '\n' +
            '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)',
        );
      });

      it('should not show a warning if the animation tries to transition an animatable property', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          style({fontSize: 5}),
          animate(500, style({fontSize: 15})),
        ]);
        expect(spyWarn).not.toHaveBeenCalled();
      });

      it('should show a single warning if the animation tries to transition multiple non-animatable properties', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          style({display: 'block', fontStyle: 'normal'}),
          animate(500, style({display: 'inline', fontStyle: 'italic'})),
        ]);
        expect(spyWarn).toHaveBeenCalledOnceWith(
          'Warning: The animation trigger "myAnimation" is attempting to animate the following' +
            ' not animatable properties: display, fontStyle' +
            '\n' +
            '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)',
        );
      });

      it('should only warn on non-animatable properties if the animation tries to transition both animate and non-animatable properties', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          style({'flex-direction': 'column', fontSize: 5}),
          animate(500, style({'flex-direction': 'row', fontSize: 10})),
        ]);
        expect(spyWarn).toHaveBeenCalledOnceWith(
          'Warning: The animation trigger "myAnimation" is attempting to animate the following' +
            ' not animatable properties: flex-direction' +
            '\n' +
            '(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)',
        );
      });

      it('should not show a warning if the animation uses but does not animate a non-animatable property', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([transition('void => *', [style({display: 'block'})])]);
        expect(spyWarn).not.toHaveBeenCalled();
      });

      it('should not show a warning if the same non-animatable property is used (with different values) on different elements in the same transition', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          style({position: 'relative'}),
          query(':enter', [
            style({
              position: 'absolute',
            }),
          ]),
        ]);
        expect(spyWarn).not.toHaveBeenCalled();
      });

      it('should not show a warning if a different easing function is used in different steps', () => {
        const spyWarn = spyOn(console, 'warn');
        buildAndAnimateSimpleTestComponent([
          sequence([
            animate('1s ease-in', style({background: 'red'})),
            animate('1s ease-out', style({background: 'green'})),
          ]),
        ]);
        expect(spyWarn).not.toHaveBeenCalled();
      });
    });
  });
})();

function assertHasParent(element: any, yes: boolean) {
  const parent = element.parentNode;
  if (yes) {
    expect(parent).toBeTruthy();
  } else {
    expect(parent).toBeFalsy();
  }
}

function buildParams(params: {[name: string]: any}): AnimationOptions {
  return {params};
}

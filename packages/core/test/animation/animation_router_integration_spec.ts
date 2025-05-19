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
  group,
  query,
  sequence,
  style,
  transition,
  trigger,
  ɵAnimationGroupPlayer as AnimationGroupPlayer,
} from '@angular/animations';
import {
  AnimationDriver,
  ɵAnimationEngine,
  ɵTransitionAnimationPlayer as TransitionAnimationPlayer,
} from '@angular/animations/browser';
import {MockAnimationDriver, MockAnimationPlayer} from '@angular/animations/browser/testing';
import {Component, HostBinding} from '../../src/core';
import {fakeAsync, flushMicrotasks, TestBed, tick} from '../../testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, Router, RouterModule, RouterOutlet} from '@angular/router';
import {isNode} from '@angular/private/testing';

(function () {
  // these tests are only meant to be run within the DOM (for now)
  if (isNode) return;

  describe('Animation Router Tests', function () {
    function getLog(): MockAnimationPlayer[] {
      return MockAnimationDriver.log as MockAnimationPlayer[];
    }

    function resetLog() {
      MockAnimationDriver.log = [];
    }

    beforeEach(() => {
      resetLog();
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([]), BrowserAnimationsModule],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
      });
    });

    it('should query the old and new routes via :leave and :enter', fakeAsync(() => {
      @Component({
        animations: [
          trigger('routerAnimations', [
            transition('page1 => page2', [
              query(':leave', animateChild()),
              query(':enter', animateChild()),
            ]),
          ]),
        ],
        template: `
          <div [@routerAnimations]="prepareRouteAnimation(r)">
            <router-outlet #r="outlet"></router-outlet>
          </div>
        `,
        standalone: false,
      })
      class ContainerCmp {
        constructor(public router: Router) {}

        prepareRouteAnimation(r: RouterOutlet) {
          const animation = r.activatedRouteData['animation'];
          const value = animation ? animation['value'] : null;
          return value;
        }
      }

      @Component({
        selector: 'page1',
        template: `page1`,
        animations: [
          trigger('page1Animation', [
            transition(':leave', [style({width: '200px'}), animate(1000, style({width: '0px'}))]),
          ]),
        ],
        standalone: false,
      })
      class Page1Cmp {
        @HostBinding('@page1Animation') public doAnimate = true;
      }

      @Component({
        selector: 'page2',
        template: `page2`,
        animations: [
          trigger('page2Animation', [
            transition(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
          ]),
        ],
        standalone: false,
      })
      class Page2Cmp {
        @HostBinding('@page2Animation') public doAnimate = true;
      }

      TestBed.configureTestingModule({
        declarations: [Page1Cmp, Page2Cmp, ContainerCmp],
        imports: [
          RouterModule.forRoot([
            {path: 'page1', component: Page1Cmp, data: makeAnimationData('page1')},
            {path: 'page2', component: Page2Cmp, data: makeAnimationData('page2')},
          ]),
        ],
      });

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(ContainerCmp);
      const cmp = fixture.componentInstance;
      cmp.router.initialNavigation();
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page1');
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page2');
      tick();
      fixture.detectChanges();
      engine.flush();

      const player = engine.players[0]!;
      const groupPlayer = (
        player as TransitionAnimationPlayer
      ).getRealPlayer() as AnimationGroupPlayer;
      const players = groupPlayer.players as MockAnimationPlayer[];

      expect(players.length).toEqual(2);
      const [p1, p2] = players;

      expect(p1.duration).toEqual(1000);
      expect(p1.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['width', '200px'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['width', '0px'],
        ]),
      ]);

      expect(p2.duration).toEqual(2000);
      expect(p2.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['opacity', '0'],
        ]),
        new Map<string, string | number>([
          ['offset', 0.5],
          ['opacity', '0'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['opacity', '1'],
        ]),
      ]);
    }));

    it('should allow inner enter animations to be emulated within a routed item', fakeAsync(() => {
      @Component({
        animations: [
          trigger('routerAnimations', [
            transition('page1 => page2', [query(':enter', animateChild())]),
          ]),
        ],
        template: `
          <div [@routerAnimations]="prepareRouteAnimation(r)">
            <router-outlet #r="outlet"></router-outlet>
          </div>
        `,
        standalone: false,
      })
      class ContainerCmp {
        constructor(public router: Router) {}

        prepareRouteAnimation(r: RouterOutlet) {
          const animation = r.activatedRouteData['animation'];
          const value = animation ? animation['value'] : null;
          return value;
        }
      }

      @Component({
        selector: 'page1',
        template: `page1`,
        animations: [],
        standalone: false,
      })
      class Page1Cmp {}

      @Component({
        selector: 'page2',
        template: `
          <h1>Page 2</h1>
          <div *ngIf="exp" class="if-one" @ifAnimation></div>
          <div *ngIf="exp" class="if-two" @ifAnimation></div>
        `,
        animations: [
          trigger('page2Animation', [
            transition(':enter', [
              query('.if-one', animateChild()),
              query('.if-two', animateChild()),
            ]),
          ]),
          trigger('ifAnimation', [
            transition(':enter', [style({opacity: 0}), animate(1000, style({opacity: 1}))]),
          ]),
        ],
        standalone: false,
      })
      class Page2Cmp {
        @HostBinding('@page2Animation') public doAnimate = true;

        public exp = true;
      }

      TestBed.configureTestingModule({
        declarations: [Page1Cmp, Page2Cmp, ContainerCmp],
        imports: [
          RouterModule.forRoot([
            {path: 'page1', component: Page1Cmp, data: makeAnimationData('page1')},
            {path: 'page2', component: Page2Cmp, data: makeAnimationData('page2')},
          ]),
        ],
      });

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(ContainerCmp);
      const cmp = fixture.componentInstance;
      cmp.router.initialNavigation();
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page1');
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page2');
      tick();
      fixture.detectChanges();
      engine.flush();

      const player = engine.players[0]!;
      const groupPlayer = (
        player as TransitionAnimationPlayer
      ).getRealPlayer() as AnimationGroupPlayer;
      const players = groupPlayer.players as MockAnimationPlayer[];

      expect(players.length).toEqual(2);
      const [p1, p2] = players;

      expect(p1.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['opacity', '0'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['opacity', '1'],
        ]),
      ]);

      expect(p2.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['opacity', '0'],
        ]),
        new Map<string, string | number>([
          ['offset', 0.5],
          ['opacity', '0'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['opacity', '1'],
        ]),
      ]);
    }));

    it('should allow inner leave animations to be emulated within a routed item', fakeAsync(() => {
      @Component({
        animations: [
          trigger('routerAnimations', [
            transition('page1 => page2', [query(':leave', animateChild())]),
          ]),
        ],
        template: `
          <div [@routerAnimations]="prepareRouteAnimation(r)">
            <router-outlet #r="outlet"></router-outlet>
          </div>
        `,
        standalone: false,
      })
      class ContainerCmp {
        constructor(public router: Router) {}

        prepareRouteAnimation(r: RouterOutlet) {
          const animation = r.activatedRouteData['animation'];
          const value = animation ? animation['value'] : null;
          return value;
        }
      }

      @Component({
        selector: 'page1',
        template: `
          <h1>Page 1</h1>
          <div *ngIf="exp" class="if-one" @ifAnimation></div>
          <div *ngIf="exp" class="if-two" @ifAnimation></div>
        `,
        animations: [
          trigger('page1Animation', [
            transition(':leave', [
              query('.if-one', animateChild()),
              query('.if-two', animateChild()),
            ]),
          ]),
          trigger('ifAnimation', [
            transition(':leave', [style({opacity: 1}), animate(1000, style({opacity: 0}))]),
          ]),
        ],
        standalone: false,
      })
      class Page1Cmp {
        @HostBinding('@page1Animation') public doAnimate = true;

        public exp = true;
      }

      @Component({
        selector: 'page2',
        template: `page2`,
        animations: [],
        standalone: false,
      })
      class Page2Cmp {}

      TestBed.configureTestingModule({
        declarations: [Page1Cmp, Page2Cmp, ContainerCmp],
        imports: [
          RouterModule.forRoot([
            {path: 'page1', component: Page1Cmp, data: makeAnimationData('page1')},
            {path: 'page2', component: Page2Cmp, data: makeAnimationData('page2')},
          ]),
        ],
      });

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(ContainerCmp);
      const cmp = fixture.componentInstance;
      cmp.router.initialNavigation();
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page1');
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page2');
      tick();
      fixture.detectChanges();
      engine.flush();

      const player = engine.players[0]!;
      const groupPlayer = (
        player as TransitionAnimationPlayer
      ).getRealPlayer() as AnimationGroupPlayer;
      const players = groupPlayer.players as MockAnimationPlayer[];

      expect(players.length).toEqual(2);
      const [p1, p2] = players;

      expect(p1.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['opacity', '1'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['opacity', '0'],
        ]),
      ]);

      expect(p2.keyframes).toEqual([
        new Map<string, string | number>([
          ['offset', 0],
          ['opacity', '1'],
        ]),
        new Map<string, string | number>([
          ['offset', 0.5],
          ['opacity', '1'],
        ]),
        new Map<string, string | number>([
          ['offset', 1],
          ['opacity', '0'],
        ]),
      ]);
    }));

    it('should properly collect :enter / :leave router nodes even when another non-router *template component is within the trigger boundaries', fakeAsync(() => {
      @Component({
        selector: 'ani-cmp',
        animations: [
          trigger('pageAnimation', [
            transition('page1 => page2', [
              query('.router-container :leave', animate('1s', style({opacity: 0}))),
              query('.router-container :enter', animate('1s', style({opacity: 1}))),
            ]),
          ]),
        ],
        template: `
          <div [@pageAnimation]="prepRoute(outlet)">
            <header>
              <div class="inner">
                <div *ngIf="!loading" class="title">Page Ready</div>
                <div *ngIf="loading" class="loading">loading...</div>
              </div>
            </header>
            <section class="router-container">
              <router-outlet #outlet="outlet"></router-outlet>
            </section>
          </div>
        `,
        standalone: false,
      })
      class ContainerCmp {
        loading = false;

        constructor(public router: Router) {}

        prepRoute(outlet: any) {
          return outlet.activatedRouteData['animation'];
        }
      }

      @Component({
        selector: 'page1',
        template: `page1`,
        standalone: false,
      })
      class Page1Cmp {}

      @Component({
        selector: 'page2',
        template: `page2`,
        standalone: false,
      })
      class Page2Cmp {}

      TestBed.configureTestingModule({
        declarations: [Page1Cmp, Page2Cmp, ContainerCmp],
        imports: [
          RouterModule.forRoot([
            {path: 'page1', component: Page1Cmp, data: makeAnimationData('page1')},
            {path: 'page2', component: Page2Cmp, data: makeAnimationData('page2')},
          ]),
        ],
      });

      const engine = TestBed.inject(ɵAnimationEngine);
      const fixture = TestBed.createComponent(ContainerCmp);
      const cmp = fixture.componentInstance;
      cmp.router.initialNavigation();
      tick();
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page1');
      tick();
      cmp.loading = true;
      fixture.detectChanges();
      engine.flush();

      cmp.router.navigateByUrl('/page2');
      tick();
      cmp.loading = false;
      fixture.detectChanges();
      engine.flush();

      const players = engine.players;
      expect(players.length).toEqual(1);
      const [p1] = players;

      const innerPlayers = (
        (p1 as TransitionAnimationPlayer).getRealPlayer() as AnimationGroupPlayer
      ).players;
      expect(innerPlayers.length).toEqual(2);

      const [ip1, ip2] = innerPlayers as any;
      expect(ip1.element.innerText).toEqual('page1');
      expect(ip2.element.innerText).toEqual('page2');
    }));

    it('should allow a recursive set of :leave animations to occur for nested routes', fakeAsync(() => {
      @Component({
        selector: 'ani-cmp',
        template: '<router-outlet name="recur"></router-outlet>',
        standalone: false,
      })
      class ContainerCmp {
        constructor(private _router: Router) {}
        log: string[] = [];

        enter() {
          this._router.navigateByUrl('/(recur:recur/nested)');
        }

        leave() {
          this._router.navigateByUrl('/');
        }
      }

      @Component({
        selector: 'recur-page',
        template: 'Depth: {{ depth }} \n <router-outlet></router-outlet>',
        animations: [
          trigger('pageAnimations', [
            transition(':leave', [
              group([
                sequence([style({opacity: 1}), animate('1s', style({opacity: 0}))]),
                query('@*', animateChild(), {optional: true}),
              ]),
            ]),
          ]),
        ],
        standalone: false,
      })
      class RecurPageCmp {
        @HostBinding('@pageAnimations') public animatePage = true;

        @HostBinding('attr.data-depth') public depth = 0;

        constructor(
          private container: ContainerCmp,
          private route: ActivatedRoute,
        ) {
          this.route.data.subscribe((data) => {
            this.container.log.push(`DEPTH ${data['depth']}`);
            this.depth = data['depth'];
          });
        }
      }

      TestBed.configureTestingModule({
        declarations: [ContainerCmp, RecurPageCmp],
        imports: [
          RouterModule.forRoot([
            {
              path: 'recur',
              component: RecurPageCmp,
              outlet: 'recur',
              data: {depth: 0},
              children: [{path: 'nested', component: RecurPageCmp, data: {depth: 1}}],
            },
          ]),
        ],
      });

      const fixture = TestBed.createComponent(ContainerCmp);
      const cmp = fixture.componentInstance;
      cmp.enter();
      tick();
      fixture.detectChanges();
      flushMicrotasks();

      expect(cmp.log).toEqual(['DEPTH 0', 'DEPTH 1']);

      cmp.leave();
      tick();
      fixture.detectChanges();

      const players = getLog();
      expect(players.length).toEqual(2);

      const [p1, p2] = players;
      expect(p1.element.getAttribute('data-depth')).toEqual('0');
      expect(p2.element.getAttribute('data-depth')).toEqual('1');
    }));
  });
});

function makeAnimationData(value: string, params: {[key: string]: any} = {}): {[key: string]: any} {
  return {'animation': {value, params}};
}

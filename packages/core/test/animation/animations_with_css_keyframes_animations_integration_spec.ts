/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, group, keyframes, query, state, style, transition, trigger} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine as AnimationEngine, ɵCssKeyframesDriver as CssKeyframesDriver, ɵCssKeyframesPlayer as CssKeyframesPlayer} from '@angular/animations/browser';
import {AnimationGroupPlayer} from '@angular/animations/src/players/animation_group_player';
import {Component, ViewChild} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';

import {TestBed} from '../../testing';

(function() {
// these tests are only mean't to be run within the DOM (for now)
// Buggy in Chromium 39, see https://github.com/angular/angular/issues/15793
if (isNode) return;

describe('animation integration tests using css keyframe animations', function() {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AnimationDriver, useClass: CssKeyframesDriver}],
      imports: [BrowserAnimationsModule]
    });
  });

  it('should compute (*) animation styles for a container that is being removed', () => {
    @Component({
      selector: 'ani-cmp',
      template: `
          <div @auto *ngIf="exp">
            <div style="line-height:20px;">1</div>
            <div style="line-height:20px;">2</div>
            <div style="line-height:20px;">3</div>
            <div style="line-height:20px;">4</div>
            <div style="line-height:20px;">5</div>
          </div>
        `,
      animations: [trigger(
          'auto',
          [
            state('void', style({height: '0px'})),
            state('*', style({height: '*'})),
            transition('* => *', animate(1000)),
          ])]
    })
    class Cmp {
      public exp: boolean = false;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const engine = TestBed.inject(AnimationEngine);
    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;

    cmp.exp = true;
    fixture.detectChanges();

    expect(engine.players.length).toEqual(1);
    let player = getPlayer(engine) as CssKeyframesPlayer;
    expect(player.keyframes).toEqual([{height: '0px', offset: 0}, {height: '100px', offset: 1}]);

    player.finish();
    if (browserDetection.isOldChrome) return;

    cmp.exp = false;
    fixture.detectChanges();

    player = getPlayer(engine) as CssKeyframesPlayer;
    expect(player.keyframes).toEqual([{height: '100px', offset: 0}, {height: '0px', offset: 1}]);
  });

  it('should cleanup all existing @keyframe <style> objects after the animation has finished',
     () => {
       @Component({
         selector: 'ani-cmp',
         template: `
          <div [@myAnimation]="myAnimationExp">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        `,
         animations: [trigger(
             'myAnimation',
             [
               transition(
                   '* => go',
                   [
                     query(
                         'div',
                         [
                           style({opacity: 0}),
                           animate('1s', style({opacity: 0})),
                         ]),
                   ]),
             ])]
       })
       class Cmp {
         public myAnimationExp = '';
       }

       TestBed.configureTestingModule({declarations: [Cmp]});

       const engine = TestBed.inject(AnimationEngine);
       const fixture = TestBed.createComponent(Cmp);
       const cmp = fixture.componentInstance;

       cmp.myAnimationExp = 'go';
       fixture.detectChanges();

       const webPlayer = <AnimationGroupPlayer>getPlayer(engine);
       const players = webPlayer.players as CssKeyframesPlayer[];
       expect(players.length).toEqual(5);

       const head = document.querySelector('head')!;
       const sheets: any[] = [];
       for (let i = 0; i < 5; i++) {
         const sheet = findStyleObjectWithKeyframes(i);
         expect(head.contains(sheet)).toBeTruthy();
         sheets.push(sheet);
       }

       cmp.myAnimationExp = 'go-back';
       fixture.detectChanges();

       for (let i = 0; i < 5; i++) {
         expect(head.contains(sheets[i])).toBeFalsy();
       }
     });

  it('should properly handle easing values that are apart of the sequence', () => {
    @Component({
      selector: 'ani-cmp',
      template: `
          <div #elm [@myAnimation]="myAnimationExp"></div>
        `,
      animations: [
        trigger(
            'myAnimation',
            [
              transition(
                  '* => goSteps',
                  [
                    style({opacity: 0}),
                    animate('1s ease-out', style({opacity: 1})),
                  ]),
              transition(
                  '* => goKeyframes',
                  [
                    animate('1s cubic-bezier(0.5, 1, 0.5, 1)', keyframes([
                              style({opacity: 0}),
                              style({opacity: 0.5}),
                              style({opacity: 1}),
                            ])),
                  ]),
            ]),
      ]
    })
    class Cmp {
      @ViewChild('elm') public element: any;

      public myAnimationExp = '';
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const engine = TestBed.inject(AnimationEngine);
    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;

    cmp.myAnimationExp = 'goSteps';
    fixture.detectChanges();

    let kfElm = findStyleObjectWithKeyframes();
    const [r1, r2] = kfElm.sheet.cssRules[0].cssRules;
    assertEasing(r1, 'ease-out');
    assertEasing(r2, '');

    const element = cmp.element.nativeElement;

    const webPlayer = getPlayer(engine);
    cmp.myAnimationExp = 'goKeyframes';
    fixture.detectChanges();

    assertEasing(element, 'cubic-bezier(0.5,1,0.5,1)');
  });

  it('should restore existing style values once the animation completes', () => {
    @Component({
      selector: 'ani-cmp',
      template: `
          <div #elm [@myAnimation]="myAnimationExp"></div>
        `,
      animations: [
        trigger(
            'myAnimation',
            [
              state('go', style({width: '200px'})),
              transition(
                  '* => go',
                  [
                    style({height: '100px', width: '100px'}), group([
                      animate('1s', style({height: '200px'})),
                      animate('1s', style({width: '200px'}))
                    ])
                  ]),
            ]),
      ]
    })
    class Cmp {
      @ViewChild('elm') public element: any;

      public myAnimationExp = '';
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const engine = TestBed.inject(AnimationEngine);
    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;

    fixture.detectChanges();
    const element = cmp.element.nativeElement;
    element.style['width'] = '50px';
    element.style['height'] = '50px';

    assertStyle(element, 'width', '50px');
    assertStyle(element, 'height', '50px');

    cmp.myAnimationExp = 'go';
    fixture.detectChanges();

    const player = getPlayer(engine);

    assertStyle(element, 'width', '100px');
    assertStyle(element, 'height', '100px');

    player.finish();

    assertStyle(element, 'width', '200px');
    assertStyle(element, 'height', '50px');
  });

  it('should clean up 0 second animation styles (queried styles) that contain camel casing when complete',
     () => {
       @Component({
         selector: 'ani-cmp',
         template: `
          <div #elm [@myAnimation]="myAnimationExp">
            <div class="foo"></div>
            <div class="bar"></div>
          </div>
        `,
         animations: [
           trigger(
               'myAnimation',
               [
                 state('go', style({width: '200px'})),
                 transition(
                     '* => go',
                     [
                       query('.foo', [style({maxHeight: '0px'})]),
                       query(
                           '.bar',
                           [
                             style({width: '0px'}),
                             animate('1s', style({width: '100px'})),
                           ]),
                     ]),
               ]),
         ]
       })
       class Cmp {
         @ViewChild('elm', {static: true}) public element: any;

         public myAnimationExp = '';
       }

       TestBed.configureTestingModule({declarations: [Cmp]});

       const engine = TestBed.inject(AnimationEngine);
       const fixture = TestBed.createComponent(Cmp);
       const cmp = fixture.componentInstance;

       const elm = cmp.element.nativeElement;
       const foo = elm.querySelector('.foo') as HTMLElement;

       cmp.myAnimationExp = 'go';
       fixture.detectChanges();

       expect(foo.style.getPropertyValue('max-height')).toEqual('0px');

       const player = engine.players.pop()!;
       player.finish();

       expect(foo.style.getPropertyValue('max-height')).toBeFalsy();
     });

  it('should apply the `display` and `position` styles as regular inline styles for the duration of the animation',
     () => {
       @Component({
         selector: 'ani-cmp',
         template: `
          <div #elm [@myAnimation]="myAnimationExp" style="display:table; position:fixed"></div>
        `,
         animations: [
           trigger(
               'myAnimation',
               [
                 state('go', style({display: 'inline-block'})),
                 transition(
                     '* => go',
                     [
                       style({display: 'inline', position: 'absolute', opacity: 0}),
                       animate('1s', style({display: 'inline', opacity: 1, position: 'static'})),
                       animate('1s', style({display: 'flexbox', opacity: 0})),
                     ])
               ]),
         ]
       })
       class Cmp {
         @ViewChild('elm', {static: true}) public element: any;

         public myAnimationExp = '';
       }

       TestBed.configureTestingModule({declarations: [Cmp]});

       const engine = TestBed.inject(AnimationEngine);
       const fixture = TestBed.createComponent(Cmp);
       const cmp = fixture.componentInstance;

       const elm = cmp.element.nativeElement;
       expect(elm.style.getPropertyValue('display')).toEqual('table');
       expect(elm.style.getPropertyValue('position')).toEqual('fixed');

       cmp.myAnimationExp = 'go';
       fixture.detectChanges();

       expect(elm.style.getPropertyValue('display')).toEqual('inline');
       expect(elm.style.getPropertyValue('position')).toEqual('absolute');

       const player = engine.players.pop()!;
       player.finish();
       player.destroy();

       expect(elm.style.getPropertyValue('display')).toEqual('inline-block');
       expect(elm.style.getPropertyValue('position')).toEqual('fixed');
     });
});
})();

function getPlayer(engine: AnimationEngine, index = 0) {
  return (engine.players[index] as any)!.getRealPlayer();
}

function findStyleObjectWithKeyframes(index?: number): any|null {
  const sheetWithKeyframes = document.styleSheets[document.styleSheets.length - (index || 1)];
  const styleElms = Array.from(document.querySelectorAll('head style') as any as any[]);
  return styleElms.find(elm => elm.sheet == sheetWithKeyframes) || null;
}

function assertEasing(node: any, easing: string) {
  expect((node.style.animationTimingFunction || '').replace(/\s+/g, '')).toEqual(easing);
}

function assertStyle(node: any, prop: string, value: string) {
  expect(node.style[prop] || '').toEqual(value);
}

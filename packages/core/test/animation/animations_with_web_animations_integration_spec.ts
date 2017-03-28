/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, style, transition, trigger} from '@angular/animations';
import {AnimationDriver, ɵAnimationEngine} from '@angular/animations/browser';
import {ɵDomAnimationEngine, ɵWebAnimationsDriver, ɵWebAnimationsPlayer, ɵsupportsWebAnimations} from '@angular/animations/browser'
import {Component, ViewChild} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TestBed} from '../../testing';

export function main() {
  // these tests are only mean't to be run within the DOM (for now)
  if (typeof Element == 'undefined' || !ɵsupportsWebAnimations()) return;

  describe('animation integration tests using web animations', function() {

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{provide: AnimationDriver, useClass: ɵWebAnimationsDriver}],
        imports: [BrowserAnimationsModule]
      });
    });

    it('should animate a component that captures height during an animation', () => {
      @Component({
        selector: 'if-cmp',
        template: `
          <div *ngIf="exp" #element [@myAnimation]="exp">
            hello {{ text }} 
          </div>
        `,
        animations: [trigger(
            'myAnimation',
            [
              transition('* => *', [style({height: '0px'}), animate(1000, style({height: '*'}))]),
            ])]
      })
      class Cmp {
        exp: any = false;
        text: string;

        @ViewChild('element') public element: any;
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.get(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.exp = 1;
      cmp.text = '';
      fixture.detectChanges();
      engine.flush();

      const element = cmp.element.nativeElement;
      element.style.lineHeight = '20px';
      element.style.width = '50px';

      cmp.exp = 2;
      cmp.text = '12345';
      fixture.detectChanges();
      engine.flush();

      let player = engine.activePlayers.pop() as ɵWebAnimationsPlayer;
      player.setPosition(1);

      assertStyleBetween(element, 'height', 15, 25);

      cmp.exp = 3;
      cmp.text = '12345-12345-12345-12345';
      fixture.detectChanges();
      engine.flush();

      player = engine.activePlayers.pop() as ɵWebAnimationsPlayer;
      player.setPosition(1);
      assertStyleBetween(element, 'height', 35, 45);
    });
  });
}

function assertStyleBetween(
    element: any, prop: string, start: string | number, end: string | number) {
  const style = (window.getComputedStyle(element) as any)[prop] as string;
  if (typeof start == 'number' && typeof end == 'number') {
    const value = parseFloat(style);
    expect(value).toBeGreaterThan(start);
    expect(value).toBeLessThan(end);
  }
}

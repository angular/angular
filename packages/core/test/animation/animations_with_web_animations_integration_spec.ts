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

    it('should compute pre (!) and post (*) animation styles with different dom states', () => {
      @Component({
        selector: 'ani-cmp',
        template: `
            <div [@myAnimation]="exp" #parent>
              <div *ngFor="let item of items" class="child" style="line-height:20px">
                - {{ item }} 
              </div>
            </div>
          `,
        animations: [trigger(
            'myAnimation',
            [transition('* => *', [style({height: '!'}), animate(1000, style({height: '*'}))])])]
      })
      class Cmp {
        public exp: number;
        public items = [0, 1, 2, 3, 4];
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const engine = TestBed.get(ɵAnimationEngine);
      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      cmp.exp = 1;
      fixture.detectChanges();
      engine.flush();

      expect(engine.players.length).toEqual(1);
      let player = engine.players[0];
      let webPlayer = player.getRealPlayer() as ɵWebAnimationsPlayer;

      expect(webPlayer.keyframes).toEqual([
        {height: '0px', offset: 0}, {height: '100px', offset: 1}
      ]);

      // we destroy the player because since it has started and is
      // at 0ms duration a height value of `0px` will be extracted
      // from the element and passed into the follow-up animation.
      player.destroy();

      cmp.exp = 2;
      cmp.items = [0, 1, 2, 6];
      fixture.detectChanges();
      engine.flush();

      expect(engine.players.length).toEqual(1);
      player = engine.players[0];
      webPlayer = player.getRealPlayer() as ɵWebAnimationsPlayer;

      expect(webPlayer.keyframes).toEqual([
        {height: '100px', offset: 0}, {height: '80px', offset: 1}
      ]);
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

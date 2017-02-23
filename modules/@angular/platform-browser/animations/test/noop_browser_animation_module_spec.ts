/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {animate, state, style, transition, trigger} from '@angular/animations';
import {USE_VIEW_ENGINE} from '@angular/compiler/src/config';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ɵAnimationEngine} from '@angular/platform-browser/animations';
import {NoopBrowserAnimationModule} from '../src/noop_browser_animation_module';
import {NoopAnimationEngine} from '../src/render/noop_animation_engine';

export function main() {
  describe('NoopBrowserAnimationModule', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({imports: [NoopBrowserAnimationModule]});
      TestBed.configureCompiler({
        useJit: true,
        providers: [{
          provide: USE_VIEW_ENGINE,
          useValue: true,
        }]
      });
    });

    it('the engine should be a Noop engine', () => {
      const engine = TestBed.get(ɵAnimationEngine);
      expect(engine instanceof NoopAnimationEngine).toBeTruthy();
    });

    it('should flush and fire callbacks when the zone becomes stable', (async) => {
      @Component({
        selector: 'my-cmp',
        template:
            '<div [@myAnimation]="exp" (@myAnimation.start)="onStart($event)" (@myAnimation.done)="onDone($event)"></div>',
        animations: [trigger(
            'myAnimation',
            [transition(
                '* => state', [style({'opacity': '0'}), animate(500, style({'opacity': '1'}))])])],
      })
      class Cmp {
        exp: any;
        startEvent: any;
        doneEvent: any;
        onStart(event: any) { this.startEvent = event; }
        onDone(event: any) { this.doneEvent = event; }
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      cmp.exp = 'state';
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(cmp.startEvent.triggerName).toEqual('myAnimation');
        expect(cmp.startEvent.phaseName).toEqual('start');
        expect(cmp.doneEvent.triggerName).toEqual('myAnimation');
        expect(cmp.doneEvent.phaseName).toEqual('done');
        async();
      });
    });
  });
}

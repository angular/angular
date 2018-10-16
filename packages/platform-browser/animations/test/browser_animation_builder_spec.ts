/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationBuilder, animate, style} from '@angular/animations';
import {AnimationDriver} from '@angular/animations/browser';
import {MockAnimationDriver} from '@angular/animations/browser/testing';
import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {el} from '../../testing/src/browser_util';
import {BrowserAnimationBuilder} from '../src/animation_builder';

{
  describe('BrowserAnimationBuilder', () => {
    if (isNode) return;
    let element: any;
    beforeEach(() => {
      element = el('<div></div>');

      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
        providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}]
      });
    });

    it('should inject AnimationBuilder into a component', () => {
      @Component({
        selector: 'ani-cmp',
        template: '...',
      })
      class Cmp {
        constructor(public builder: AnimationBuilder) {}
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;

      fixture.detectChanges();
      expect(cmp.builder instanceof BrowserAnimationBuilder).toBeTruthy();
    });

    it('should listen on start and done on the animation builder\'s player', fakeAsync(() => {
         @Component({
           selector: 'ani-cmp',
           template: '...',
         })
         class Cmp {
           @ViewChild('target') public target: any;

           constructor(public builder: AnimationBuilder) {}

           build() {
             const definition =
                 this.builder.build([style({opacity: 0}), animate(1000, style({opacity: 1}))]);

             return definition.create(this.target);
           }
         }

         TestBed.configureTestingModule({declarations: [Cmp]});

         const fixture = TestBed.createComponent(Cmp);
         const cmp = fixture.componentInstance;
         fixture.detectChanges();

         const player = cmp.build();

         let started = false;
         player.onStart(() => started = true);

         let finished = false;
         player.onDone(() => finished = true);

         let destroyed = false;
         player.onDestroy(() => destroyed = true);

         player.init();
         flushMicrotasks();
         expect(started).toBeFalsy();
         expect(finished).toBeFalsy();
         expect(destroyed).toBeFalsy();

         player.play();
         flushMicrotasks();
         expect(started).toBeTruthy();
         expect(finished).toBeFalsy();
         expect(destroyed).toBeFalsy();

         player.finish();
         flushMicrotasks();
         expect(started).toBeTruthy();
         expect(finished).toBeTruthy();
         expect(destroyed).toBeFalsy();

         player.destroy();
         flushMicrotasks();
         expect(started).toBeTruthy();
         expect(finished).toBeTruthy();
         expect(destroyed).toBeTruthy();
       }));
  });
}

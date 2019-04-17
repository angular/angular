/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, animate, style, transition, trigger} from '@angular/animations';
import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('acceptance integration tests', () => {
  onlyInIvy('animation and host metadata is inherited only in ivy')
      .fit('animation trigger events should only fire once in both super class and sub class components',
          fakeAsync(() => {
            const sharedAnimations = [
              trigger(
                  'foo',
                  [
                    transition(
                        ':increment',
                        [
                          style({opacity: 0}),
                          animate('1s', style({opacity: 1})),
                        ]),
                  ]),
            ];

            @Component({
              selector: 'super-comp',
              animations: sharedAnimations,
              template: '...',
              host: {
                '[@foo]': 'foo1Value',
                '(@foo.start)': 'foo1Start($event)',
                '(@foo.done)': 'foo1Done($event)',
              }
            })
            class SuperClassComp {
              foo1Value = 0;
              log1: any[] = [];

              foo1Start(event: AnimationEvent) { this.log1.push('start-parent', event.toState); }

              foo1Done(event: AnimationEvent) { this.log1.push('done-parent', event.toState); }

              fire() { this.foo1Value++; }
            }

            @Component({
              selector: 'sub-comp',
              animations: sharedAnimations,
              template: '...',
              host: {
                '[@foo]': 'foo2Value',
                '(@foo.start)': 'foo2Start($event)',
                '(@foo.done)': 'foo2Done($event)',
              }
            })
            class SubClassComp extends SuperClassComp {
              foo2Value = 0;
              log2: any[] = [];

              foo2Start(event: AnimationEvent) { this.log2.push('start-child', event.toState); }

              foo2Done(event: AnimationEvent) { this.log2.push('done-child', event.toState); }

              fire() {
                super.fire();
                this.foo2Value++;
              }
            }

            @Component({
              selector: 'app',
              template: `
            <sub-comp #sub></sub-comp>
          `
            })
            class AppComp {
              @ViewChild('sub')
              subComp: SubClassComp|null = null;
            }

            TestBed.configureTestingModule({declarations: [SubClassComp, SuperClassComp, AppComp]});
            const fixture = TestBed.createComponent(AppComp);
            fixture.detectChanges();
            flushMicrotasks();

            const comp = fixture.componentInstance.subComp !;
            comp.log1.length = 0;
            comp.log2.length = 0;

            comp.fire();
            fixture.detectChanges();
            flushMicrotasks();

            expect(comp.log1).toEqual([
              'start-parent',
              1,
              'done-parent',
              1,
            ]);

            expect(comp.log2).toEqual([
              'start-child',
              1,
              'done-child',
              1,
            ]);
          }));
});

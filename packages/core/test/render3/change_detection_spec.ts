/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {withBody} from '@angular/private/testing';

import {Component, DoCheck, OnInit, Renderer2, RendererFactory2} from '../../src/core';
import {whenRendered} from '../../src/render3/component';
import {getRenderedText} from '../../src/render3/index';
import {detectChanges, markDirty} from '../../src/render3/instructions/all';

describe('change detection', () => {
  describe('markDirty, detectChanges, whenRendered, getRenderedText', () => {
    let mycompOninit: MyComponentWithOnInit;

    @Component({
      selector: 'my-comp',
      standalone: true,
      template: '<span>{{ value }}</span>',
    })
    class MyComponent implements DoCheck {
      value: string = 'works';
      doCheckCount = 0;
      ngDoCheck(): void {
        this.doCheckCount++;
      }
    }

    @Component({
      selector: 'my-comp-oninit',
      standalone: true,
      template: '<span>{{ value }}</span>',
    })
    class MyComponentWithOnInit implements OnInit, DoCheck {
      value: string = 'works';
      doCheckCount = 0;

      constructor() {
        mycompOninit = this;
      }

      ngOnInit() {
        markDirty(this);
      }

      ngDoCheck(): void {
        this.doCheckCount++;
      }

      click() {
        this.value = 'click works';
        markDirty(this);
      }
    }

    @Component({
      selector: 'my-parent-comp',
      standalone: true,
      imports: [CommonModule, MyComponentWithOnInit],
      template: `
        -->
        <div *ngIf="show">
          <my-comp-oninit></my-comp-oninit>
        </div>
      `,
    })
    class MyParentComponent implements OnInit {
      show = false;
      value = 'parent';
      mycomp: any = undefined;

      ngOnInit() {}

      click() {
        this.show = true;
        markDirty(this);
      }
    }

    it('should mark a component dirty and schedule change detection', withBody('my-comp', () => {
         const fixture = TestBed.createComponent(MyComponent);
         fixture.detectChanges();

         const myComp = fixture.componentInstance;
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');

         fixture.detectChanges();

         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges on a component', withBody('my-comp', () => {
         const fixture = TestBed.createComponent(MyComponent);
         fixture.detectChanges();

         const myComp = fixture.componentInstance;
         expect(getRenderedText(myComp)).toEqual('works');
         myComp.value = 'updated';
         detectChanges(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));

    it('should detectChanges after markDirty is called multiple times within ngOnInit',
       withBody('my-comp-oninit', () => {
         const fixture = TestBed.createComponent(MyParentComponent);
         fixture.detectChanges();

         const myParentComp = fixture.componentInstance;
         expect(myParentComp.show).toBe(false);
         myParentComp.click();
         fixture.detectChanges();

         expect(myParentComp.show).toBe(true);
         const myComp = mycompOninit;
         expect(getRenderedText(myComp)).toEqual('works');
         expect(myComp.doCheckCount).toBe(1);
         myComp.click();
         expect(getRenderedText(myComp)).toEqual('works');

         fixture.detectChanges();

         expect(getRenderedText(myComp)).toEqual('click works');
         expect(myComp.doCheckCount).toBe(2);
       }));

    it('should detectChanges only once if markDirty is called multiple times',
       withBody('my-comp', () => {
         const fixture = TestBed.createComponent(MyComponent);
         fixture.detectChanges();

         const myComp = fixture.componentInstance;

         expect(getRenderedText(myComp)).toEqual('works');
         expect(myComp.doCheckCount).toBe(1);
         myComp.value = 'ignore';
         markDirty(myComp);
         myComp.value = 'updated';
         markDirty(myComp);
         expect(getRenderedText(myComp)).toEqual('works');

         fixture.detectChanges();

         expect(getRenderedText(myComp)).toEqual('updated');
         expect(myComp.doCheckCount).toBe(2);
       }));

    it('should notify whenRendered', withBody('my-comp', async () => {
         const fixture = TestBed.createComponent(MyComponent);
         fixture.detectChanges();

         const myComp = fixture.componentInstance;
         await whenRendered(myComp);
         myComp.value = 'updated';
         markDirty(myComp);
         setTimeout(() => fixture.detectChanges(), 0);
         await whenRendered(myComp);
         expect(getRenderedText(myComp)).toEqual('updated');
       }));
  });

  it('should call begin and end when the renderer factory implements them',
     withBody('<my-comp></my-comp>', () => {
       const log: string[] = [];

       const testRendererFactory: RendererFactory2 = {
         createRenderer: (): Renderer2 => {
           return document as unknown as Renderer2;
         },
         begin: () => log.push('begin'),
         end: () => log.push('end'),
       };

       @Component({
         selector: 'my-comp',
         standalone: true,
         template: '{{ value }}',
       })
       class MyComponent {
         get value(): string {
           log.push('detect changes');
           return 'works';
         }
       }

       TestBed.configureTestingModule({
         providers: [
           {
             provide: DOCUMENT,
             useFactory: () => document,
           },
           {
             provide: RendererFactory2,
             useValue: testRendererFactory,
           }
         ]
       });

       const fixture = TestBed.createComponent(MyComponent);
       fixture.detectChanges();

       const myComp = fixture.componentInstance;
       expect(getRenderedText(myComp)).toEqual('works');

       expect(log).toEqual([
         'begin',
         'detect changes',  // regular change detection cycle
         'end',
         'detect changes'  // check no changes cycle
       ]);
     }));
});

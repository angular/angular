/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('ngIf directive', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule],
      });
    });

    it('should work in a template attribute', async(() => {
         const template = '<div><span template="ngIf booleanCondition">hello</span></div>';
         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');
       }));

    it('should work in a template element', async(() => {
         const template =
             '<div><template [ngIf]="booleanCondition"><span>hello2</span></template></div>';

         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello2');
       }));

    it('should toggle node when condition changes', async(() => {
         const template = '<div><span template="ngIf booleanCondition">hello</span></div>';

         fixture = createTestComponent(template);
         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().booleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should handle nested if correctly', async(() => {
         const template =
             '<div><template [ngIf]="booleanCondition"><span *ngIf="nestedBooleanCondition">hello</span></template></div>';

         fixture = createTestComponent(template);

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().booleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().nestedBooleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().nestedBooleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(0);
         expect(fixture.nativeElement).toHaveText('');
       }));

    it('should update several nodes with if', async(() => {
         const template = '<div>' +
             '<span template="ngIf numberCondition + 1 >= 2">helloNumber</span>' +
             '<span template="ngIf stringCondition == \'foo\'">helloString</span>' +
             '<span template="ngIf functionCondition(stringCondition, numberCondition)">helloFunction</span>' +
             '</div>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(3);
         expect(getDOM().getText(fixture.nativeElement))
             .toEqual('helloNumberhelloStringhelloFunction');

         getComponent().numberCondition = 0;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('helloString');

         getComponent().numberCondition = 1;
         getComponent().stringCondition = 'bar';
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('helloNumber');
       }));

    it('should not add the element twice if the condition goes from true to true (JS)',
       async(() => {
         const template = '<div><span template="ngIf numberCondition">hello</span></div>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');

         getComponent().numberCondition = 2;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.nativeElement, 'span').length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');
       }));

    it('should not recreate the element if the condition goes from true to true (JS)', async(() => {
         const template = '<div><span template="ngIf numberCondition">hello</span></div>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         getDOM().addClass(getDOM().querySelector(fixture.nativeElement, 'span'), 'foo');

         getComponent().numberCondition = 2;
         fixture.detectChanges();
         expect(getDOM().hasClass(getDOM().querySelector(fixture.nativeElement, 'span'), 'foo'))
             .toBe(true);
       }));
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  booleanCondition: boolean = true;
  nestedBooleanCondition: boolean = true;
  numberCondition: number = 1;
  stringCondition: string = 'foo';
  functionCondition: Function = (s: any, n: any): boolean => s == 'foo' && n == 1;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}

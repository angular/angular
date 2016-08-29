/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('ngIf directive', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [CommonModule]});
    });

    it('should work in a template attribute', async(() => {
         const template = '<div><copy-me template="ngIf booleanCondition">hello</copy-me></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');
       }));

    it('should work in a template element', async(() => {
         const template =
             '<div><template [ngIf]="booleanCondition"><copy-me>hello2</copy-me></template></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello2');
       }));

    it('should toggle node when condition changes', async(() => {
         const template = '<div><copy-me template="ngIf booleanCondition">hello</copy-me></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(0);
         expect(fixture.debugElement.nativeElement).toHaveText('');

         fixture.debugElement.componentInstance.booleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');

         fixture.debugElement.componentInstance.booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(0);
         expect(fixture.debugElement.nativeElement).toHaveText('');
       }));

    it('should handle nested if correctly', async(() => {
         const template =
             '<div><template [ngIf]="booleanCondition"><copy-me *ngIf="nestedBooleanCondition">hello</copy-me></template></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(0);
         expect(fixture.debugElement.nativeElement).toHaveText('');

         fixture.debugElement.componentInstance.booleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');

         fixture.debugElement.componentInstance.nestedBooleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(0);
         expect(fixture.debugElement.nativeElement).toHaveText('');

         fixture.debugElement.componentInstance.nestedBooleanCondition = true;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');

         fixture.debugElement.componentInstance.booleanCondition = false;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(0);
         expect(fixture.debugElement.nativeElement).toHaveText('');
       }));

    it('should update several nodes with if', async(() => {
         const template = '<div>' +
             '<copy-me template="ngIf numberCondition + 1 >= 2">helloNumber</copy-me>' +
             '<copy-me template="ngIf stringCondition == \'foo\'">helloString</copy-me>' +
             '<copy-me template="ngIf functionCondition(stringCondition, numberCondition)">helloFunction</copy-me>' +
             '</div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(3);
         expect(getDOM().getText(fixture.debugElement.nativeElement))
             .toEqual('helloNumberhelloStringhelloFunction');

         fixture.debugElement.componentInstance.numberCondition = 0;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('helloString');

         fixture.debugElement.componentInstance.numberCondition = 1;
         fixture.debugElement.componentInstance.stringCondition = 'bar';
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('helloNumber');
       }));

    it('should not add the element twice if the condition goes from true to true (JS)',
       async(() => {
         const template = '<div><copy-me template="ngIf numberCondition">hello</copy-me></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');

         fixture.debugElement.componentInstance.numberCondition = 2;
         fixture.detectChanges();
         expect(getDOM().querySelectorAll(fixture.debugElement.nativeElement, 'copy-me').length)
             .toEqual(1);
         expect(fixture.debugElement.nativeElement).toHaveText('hello');
       }));

    it('should not recreate the element if the condition goes from true to true (JS)', async(() => {
         const template = '<div><copy-me template="ngIf numberCondition">hello</copy-me></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         getDOM().addClass(
             getDOM().querySelector(fixture.debugElement.nativeElement, 'copy-me'), 'foo');

         fixture.debugElement.componentInstance.numberCondition = 2;
         fixture.detectChanges();
         expect(getDOM().hasClass(
                    getDOM().querySelector(fixture.debugElement.nativeElement, 'copy-me'), 'foo'))
             .toBe(true);
       }));
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  booleanCondition: boolean;
  nestedBooleanCondition: boolean;
  numberCondition: number;
  stringCondition: string;
  functionCondition: Function;
  constructor() {
    this.booleanCondition = true;
    this.nestedBooleanCondition = true;
    this.numberCondition = 1;
    this.stringCondition = 'foo';
    this.functionCondition = function(s: any, n: any): boolean { return s == 'foo' && n == 1; };
  }
}

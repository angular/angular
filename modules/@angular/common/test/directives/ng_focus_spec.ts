/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';

export function main() {
  describe('Focus Directive', () => {
    beforeEach(() => { TestBed.configureTestingModule({imports: [TestModule]}); });

    it('Should set focus when the directive get truthy boolean', async(() => {
         var template = '<div class="test-input" [ngFocus]="inFocus" ></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.autoDetectChanges();
         let el = fixture.nativeElement.querySelector('.test-input');
         let spy = spyOn(el, 'focus').and.callThrough();
         fixture.componentInstance.inFocus = true;
         fixture.whenStable().then(() => { expect(spy).toHaveBeenCalled(); });


       }));

    it('Should get out of focus when the directive get falsey boolean', async(() => {
         var template = '<div><input class="test-input" [ngFocus]="inFocus" ></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         let el = fixture.nativeElement.querySelector('.test-input');
         let spy = spyOn(el, 'blur').and.callThrough();
         fixture.componentInstance.inFocus = true;
         fixture.detectChanges();
         fixture.componentInstance.inFocus = false;
         fixture.detectChanges();
         fixture.whenStable().then(() => { expect(spy).toHaveBeenCalled(); });


       }));


  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  inFocus: boolean;
}

@NgModule({imports: [CommonModule], declarations: [TestComponent], exports: [TestComponent]})
export class TestModule {
}

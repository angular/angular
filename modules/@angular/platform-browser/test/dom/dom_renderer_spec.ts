/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, it} from '@angular/core/testing/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {By} from '@angular/platform-browser/src/dom/debug/by';

export function main() {
  describe('DomRenderer', () => {

    describe('integration test', () => {

      beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

      it('ngStyle should set style with !important', () => {
        const fixture = TestBed.createComponent(NgStyleWithImportantCmp);
        fixture.detectChanges();

        const div = fixture.debugElement.query(By.css('div')).nativeElement;
        expect(div.style.getPropertyValue('max-width')).toEqual('40px');
        expect(div.style.getPropertyPriority('max-width')).toEqual('important');
      });

      it('should set style with !important', () => {
        const fixture = TestBed.createComponent(StyleWithImportantCmp);
        fixture.detectChanges();

        const div = fixture.debugElement.query(By.css('div')).nativeElement;
        expect(div.style.getPropertyValue('max-width')).toEqual('40px');
        expect(div.style.getPropertyPriority('max-width')).toEqual('important');
      });

    });

  });
}

@Component({
  selector: 'ngStyle-imp-cmp',
  template: `<div [ngStyle]="{'max-width.px!important': '40'}"></div>`
})
class NgStyleWithImportantCmp {
}

@Component(
    {selector: 'style-imp-cmp', template: `<div [style.max-width.px!important]="'40'"></div>`})
class StyleWithImportantCmp {
}

@NgModule({
  declarations: [
    NgStyleWithImportantCmp,
    StyleWithImportantCmp,
  ],
  imports: [CommonModule]
})
class TestModule {
}

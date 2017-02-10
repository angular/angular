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
import {browserDetection} from '@angular/platform-browser/testing/browser_util';

export function main() {
  describe('DomRenderer', () => {

    describe('integration test', () => {

      beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

      // IE and Safari doesn't support css variables
      if (!browserDetection.isIE && !browserDetection.isIOS7) {
        it('should set custom css variable', () => {
          const fixture = TestBed.createComponent(StyleWithCssVariableCmp);
          fixture.detectChanges();

          const div = fixture.debugElement.query(By.css('#customProp')).nativeElement;
          expect(div.style.getPropertyValue('--screen-category')).toEqual('custom');
        });
      }

      if (browserDetection.isFirefox) {
        it('should set style with vendor prefix', () => {
          const fixture = TestBed.createComponent(StyleWithVendorPrefixCmp);
          fixture.detectChanges();

          const div = fixture.debugElement.query(By.css('#vendor')).nativeElement;
          expect(div.style.getPropertyValue('-moz-column-count')).toEqual('3');
        });
      }

    });

  });
}

@Component({
  selector: 'custom-prop-cmp',
  template: `<div id="customProp" [ngStyle]="{'--screen-category': 'custom'}"></div>`
})
class StyleWithCssVariableCmp {
}

@Component({
  selector: 'vendor-prefix-cmp',
  template: `<div id="vendor" [ngStyle]="{'-moz-column-count': 3}"></div>`
})
class StyleWithVendorPrefixCmp {
}

@NgModule({
  declarations: [
    StyleWithCssVariableCmp,
    StyleWithVendorPrefixCmp,
  ],
  imports: [CommonModule]
})
class TestModule {
}

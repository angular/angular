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
import {BrowserModule} from '@angular/platform-browser';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('DomRenderer', () => {

    describe('integration test', () => {

      beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

      it(`should set 'value' prop to empty string instead of null`, () => {
        const fixture = TestBed.createComponent(ValueNullCmp);
        fixture.detectChanges();

        const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
        expect(textarea).toHaveText('');
      });

    });

  });
}

@Component({selector: 'value-null-cmp', template: `<textarea [value]="null"></textarea>`})
class ValueNullCmp {
}

@NgModule({
  declarations: [
    ValueNullCmp,
  ],
  imports: [CommonModule]
})
class TestModule {
}

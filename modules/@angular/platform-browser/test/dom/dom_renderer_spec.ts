/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, NgModule, Renderer, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, it} from '@angular/core/testing/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {By} from '@angular/platform-browser/src/dom/debug/by';

export function main() {
  describe('DomRenderer', () => {

    beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

    it('should set element text', () => {
      const fixture = TestBed.createComponent(SetTextCmp);
      fixture.detectChanges();

      const div = fixture.debugElement.query(By.css('div')).nativeElement;
      expect(div.textContent).toEqual('Some text');
    });
  });
}

@Component({selector: 'set-text-cmp', template: `<div #test></div>`})
class SetTextCmp {
  @ViewChild('test') testDiv: ElementRef;

  constructor(private renderer: Renderer) {}

  ngAfterViewInit(): void { this.renderer.setText(this.testDiv.nativeElement, 'Some text'); }
}

@NgModule({
  declarations: [
    SetTextCmp,
  ]
})
class TestModule {
}

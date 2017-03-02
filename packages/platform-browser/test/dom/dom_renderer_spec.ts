/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CommonModule} from '@angular/common';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('DomRenderer', () => {

    beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

    // other browsers don't support shadow dom
    if (browserDetection.isChromeDesktop) {
      it('should allow to style components with emulated encapsulation and no encapsulation inside of components with shadow DOM',
         () => {
           TestBed.overrideComponent(CmpEncapsulationNative, {
             set: {
               template:
                   '<div class="native"></div><cmp-emulated></cmp-emulated><cmp-none></cmp-none>'
             }
           });

           const fixture = TestBed.createComponent(SomeApp);

           const cmp = fixture.debugElement.query(By.css('cmp-native')).nativeElement;


           const native = cmp.shadowRoot.querySelector('.native');
           expect(window.getComputedStyle(native).color).toEqual('rgb(255, 0, 0)');

           const emulated = cmp.shadowRoot.querySelector('.emulated');
           expect(window.getComputedStyle(emulated).color).toEqual('rgb(0, 0, 255)');

           const none = cmp.shadowRoot.querySelector('.none');
           expect(window.getComputedStyle(none).color).toEqual('rgb(0, 255, 0)');
         });
    }
  });
}

@Component({
  selector: 'cmp-native',
  template: `<div class="native"></div>`,
  styles: [`.native { color: red; }`],
  encapsulation: ViewEncapsulation.Native
})
class CmpEncapsulationNative {
}

@Component({
  selector: 'cmp-emulated',
  template: `<div class="emulated"></div>`,
  styles: [`.emulated { color: blue; }`],
  encapsulation: ViewEncapsulation.Emulated
})
class CmpEncapsulationEmulated {
}

@Component({
  selector: 'cmp-none',
  template: `<div class="none"></div>`,
  styles: [`.none { color: lime; }`],
  encapsulation: ViewEncapsulation.None
})
class CmpEncapsulationNone {
}

@Component({
  selector: 'some-app',
  template: `
	  <cmp-native></cmp-native>
	  <cmp-emulated></cmp-emulated>
	  <cmp-none></cmp-none>
  `,
})
export class SomeApp {
}

@NgModule({
  declarations: [
    SomeApp,
    CmpEncapsulationNative,
    CmpEncapsulationEmulated,
    CmpEncapsulationNone,
  ],
  imports: [CommonModule]
})
class TestModule {
}

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
import {describe, it} from '@angular/core/testing/testing_internal';
import {BrowserModule} from '@angular/platform-browser';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';
import {TEMPLATE_BINDINGS_EXP} from '../../src/dom/dom_renderer';

export function main() {
  describe('DomRenderer', () => {

    describe('setBindingDebugInfo', () => {
      describe('template binding regex', () => {
        it('should match the string containing Unicode char with code 8233', () => {
          // https://github.com/angular/angular/issues/14423
          const expression = `{"ng-reflect-ng-if": "${String.fromCharCode(8233)}"}`;
          const binding = `template bindings=${expression}`;
          const match = binding.match(TEMPLATE_BINDINGS_EXP);
          expect(match).not.toBeNull();
          expect(match.length).toBe(2);
          expect(match[1]).toEqual(expression);
        });
      });
    });

    describe('integration test', () => {
      beforeEach(() => TestBed.configureTestingModule({imports: [BrowserModule, TestModule]}));

      // other browsers don't support shadow dom
      if (browserDetection.isChromeDesktop) {
        it('should add only styles with native encapsulation to the shadow DOM', () => {
          const fixture = TestBed.createComponent(SomeApp);
          fixture.detectChanges();

          const cmp = fixture.debugElement.query(By.css('cmp-native')).nativeElement;
          const styles = cmp.shadowRoot.querySelectorAll('style');
          expect(styles.length).toBe(1);
          expect(styles[0]).toHaveText('.cmp-native { color: red; }');
        });
      }
    });
  });
}

@Component({
  selector: 'cmp-native',
  template: ``,
  styles: [`.cmp-native { color: red; }`],
  encapsulation: ViewEncapsulation.Native
})
class CmpEncapsulationNative {
}

@Component({
  selector: 'cmp-emulated',
  template: ``,
  styles: [`.cmp-emulated { color: blue; }`],
  encapsulation: ViewEncapsulation.Emulated
})
class CmpEncapsulationEmulated {
}

@Component({
  selector: 'cmp-none',
  template: ``,
  styles: [`.cmp-none { color: yellow; }`],
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
class SomeApp {
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

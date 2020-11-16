/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Renderer2, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {NAMESPACE_URIS} from '@angular/platform-browser/src/dom/dom_renderer';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('DefaultDomRendererV2', () => {
    if (isNode) return;
    let renderer: Renderer2;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          TestCmp, SomeApp, CmpEncapsulationEmulated, CmpEncapsulationShadow, CmpEncapsulationNone,
          CmpEncapsulationShadow
        ]
      });
      renderer = TestBed.createComponent(TestCmp).componentInstance.renderer;
    });

    describe('setAttribute', () => {
      describe('with namespace', () => {
        it('xmlns', () => shouldSetAttributeWithNs('xmlns'));
        it('xml', () => shouldSetAttributeWithNs('xml'));
        it('svg', () => shouldSetAttributeWithNs('svg'));
        it('xhtml', () => shouldSetAttributeWithNs('xhtml'));
        it('xlink', () => shouldSetAttributeWithNs('xlink'));

        it('unknown', () => {
          const div = document.createElement('div');
          expect(div.hasAttribute('unknown:name')).toBe(false);

          renderer.setAttribute(div, 'name', 'value', 'unknown');

          expect(div.getAttribute('unknown:name')).toBe('value');
        });

        function shouldSetAttributeWithNs(namespace: string): void {
          const namespaceUri = NAMESPACE_URIS[namespace];
          const div = document.createElement('div');
          expect(div.hasAttributeNS(namespaceUri, 'name')).toBe(false);

          renderer.setAttribute(div, 'name', 'value', namespace);

          expect(div.getAttributeNS(namespaceUri, 'name')).toBe('value');
        }
      });
    });

    describe('removeAttribute', () => {
      describe('with namespace', () => {
        it('xmlns', () => shouldRemoveAttributeWithNs('xmlns'));
        it('xml', () => shouldRemoveAttributeWithNs('xml'));
        it('svg', () => shouldRemoveAttributeWithNs('svg'));
        it('xhtml', () => shouldRemoveAttributeWithNs('xhtml'));
        it('xlink', () => shouldRemoveAttributeWithNs('xlink'));

        it('unknown', () => {
          const div = document.createElement('div');
          div.setAttribute('unknown:name', 'value');
          expect(div.hasAttribute('unknown:name')).toBe(true);

          renderer.removeAttribute(div, 'name', 'unknown');

          expect(div.hasAttribute('unknown:name')).toBe(false);
        });

        function shouldRemoveAttributeWithNs(namespace: string): void {
          const namespaceUri = NAMESPACE_URIS[namespace];
          const div = document.createElement('div');
          div.setAttributeNS(namespaceUri, `${namespace}:name`, 'value');
          expect(div.hasAttributeNS(namespaceUri, 'name')).toBe(true);

          renderer.removeAttribute(div, 'name', namespace);

          expect(div.hasAttributeNS(namespaceUri, 'name')).toBe(false);
        }
      });
    });

    describe('removeChild', () => {
      it('should not error when removing a child with a different parent than given', () => {
        const savedParent = document.createElement('div');
        const realParent = document.createElement('div');
        const child = document.createElement('div');

        realParent.appendChild(child);
        renderer.removeChild(savedParent, child);
      });
    });

    if (browserDetection.supportsShadowDom) {
      it('should allow to style components with emulated encapsulation and no encapsulation inside of components with shadow DOM',
         () => {
           const fixture = TestBed.createComponent(SomeApp);
           const cmp = fixture.debugElement.query(By.css('cmp-shadow')).nativeElement;
           const shadow = cmp.shadowRoot.querySelector('.shadow');

           expect(window.getComputedStyle(shadow).color).toEqual('rgb(255, 0, 0)');

           const emulated = cmp.shadowRoot.querySelector('.emulated');
           expect(window.getComputedStyle(emulated).color).toEqual('rgb(0, 0, 255)');

           const none = cmp.shadowRoot.querySelector('.none');
           expect(window.getComputedStyle(none).color).toEqual('rgb(0, 255, 0)');
         });
    }
  });
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
  selector: 'cmp-shadow',
  template: `<div class="shadow"></div><cmp-emulated></cmp-emulated><cmp-none></cmp-none>`,
  styles: [`.shadow { color: red; }`],
  encapsulation: ViewEncapsulation.ShadowDom
})
class CmpEncapsulationShadow {
}

@Component({
  selector: 'some-app',
  template: `
	  <cmp-shadow></cmp-shadow>
	  <cmp-emulated></cmp-emulated>
	  <cmp-none></cmp-none>
  `,
})
export class SomeApp {
}

@Component({selector: 'test-cmp', template: ''})
class TestCmp {
  constructor(public renderer: Renderer2) {}
}

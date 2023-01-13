/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Renderer2, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {NAMESPACE_URIS, REMOVE_STYLES_ON_COMPONENT_DESTROY} from '@angular/platform-browser/src/dom/dom_renderer';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('DefaultDomRendererV2', () => {
    if (isNode) {
      // Jasmine will throw if there are no tests.
      it('should pass', () => {});
      return;
    }

    let renderer: Renderer2;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          TestCmp,
          SomeApp,
          SomeAppForCleanUp,
          CmpEncapsulationEmulated,
          CmpEncapsulationNone,
          CmpEncapsulationShadow,
        ],
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

    it('should allow to style components with emulated encapsulation and no encapsulation inside of components with shadow DOM',
       () => {
         const fixture = TestBed.createComponent(SomeApp);
         fixture.detectChanges();

         const cmp = fixture.debugElement.query(By.css('cmp-shadow')).nativeElement;
         const shadow = cmp.shadowRoot.querySelector('.shadow');

         expect(window.getComputedStyle(shadow).color).toEqual('rgb(255, 0, 0)');

         const emulated = cmp.shadowRoot.querySelector('.emulated');
         expect(window.getComputedStyle(emulated).color).toEqual('rgb(0, 0, 255)');

         const none = cmp.shadowRoot.querySelector('.none');
         expect(window.getComputedStyle(none).color).toEqual('rgb(0, 255, 0)');
       });

    it('should be able to append children to a <template> element', () => {
      const template = document.createElement('template');
      const child = document.createElement('div');

      renderer.appendChild(template, child);

      expect(child.parentNode).toBe(template.content);
    });

    it('should be able to insert children before others in a <template> element', () => {
      const template = document.createElement('template');
      const child = document.createElement('div');
      const otherChild = document.createElement('div');
      template.content.appendChild(child);

      renderer.insertBefore(template, otherChild, child);

      expect(otherChild.parentNode).toBe(template.content);
    });

    describe('should not cleanup styles of destroyed components by default', () => {
      it('works for components without encapsulation emulated', () => {
        const fixture = TestBed.createComponent(SomeAppForCleanUp);
        const compInstance = fixture.componentInstance;
        compInstance.showEmulatedComponents = true;

        fixture.detectChanges();
        // verify style is in DOM
        expect(styleCount(fixture, '.emulated')).toBe(1);

        // Remove a single instance of the component.
        compInstance.componentOneInstanceHidden = true;
        fixture.detectChanges();
        // Verify style is still in DOM
        expect(styleCount(fixture, '.emulated')).toBe(1);

        // Hide all instances of the component
        compInstance.componentTwoInstanceHidden = true;
        fixture.detectChanges();

        // Verify style is still in DOM
        expect(styleCount(fixture, '.emulated')).toBe(1);
      });

      it('works for components without encapsulation none', () => {
        const fixture = TestBed.createComponent(SomeAppForCleanUp);
        const compInstance = fixture.componentInstance;
        compInstance.showEmulatedComponents = false;

        fixture.detectChanges();
        // verify style is in DOM
        expect(styleCount(fixture, '.none')).toBe(1);

        // Remove a single instance of the component.
        compInstance.componentOneInstanceHidden = true;
        fixture.detectChanges();
        // Verify style is still in DOM
        expect(styleCount(fixture, '.none')).toBe(1);

        // Hide all instances of the component
        compInstance.componentTwoInstanceHidden = true;
        fixture.detectChanges();

        // Verify style is still in DOM
        expect(styleCount(fixture, '.none')).toBe(1);
      });
    });

    describe(
        'should cleanup styles of destroyed components when `REMOVE_STYLES_ON_COMPONENT_DESTROY` is `true`',
        () => {
          beforeEach(() => {
            TestBed.resetTestingModule();

            TestBed.configureTestingModule({
              declarations: [
                SomeAppForCleanUp,
                CmpEncapsulationEmulated,
                CmpEncapsulationNone,
              ],
              providers: [
                {
                  provide: REMOVE_STYLES_ON_COMPONENT_DESTROY,
                  useValue: true,
                },
              ],
            });
          });

          it('works for components without encapsulation emulated', () => {
            const fixture = TestBed.createComponent(SomeAppForCleanUp);
            const compInstance = fixture.componentInstance;
            compInstance.showEmulatedComponents = true;

            fixture.detectChanges();
            // verify style is in DOM
            expect(styleCount(fixture, '.emulated')).toBe(1);

            // Remove a single instance of the component.
            compInstance.componentOneInstanceHidden = true;
            fixture.detectChanges();
            // Verify style is still in DOM
            expect(styleCount(fixture, '.emulated')).toBe(1);

            // Hide all instances of the component
            compInstance.componentTwoInstanceHidden = true;
            fixture.detectChanges();

            // Verify style is not in DOM
            expect(styleCount(fixture, '.emulated')).toBe(0);
          });

          it('works for components without encapsulation none', () => {
            const fixture = TestBed.createComponent(SomeAppForCleanUp);
            const compInstance = fixture.componentInstance;
            compInstance.showEmulatedComponents = false;

            fixture.detectChanges();
            // verify style is in DOM
            expect(styleCount(fixture, '.none')).toBe(1);

            // Remove a single instance of the component.
            compInstance.componentOneInstanceHidden = true;
            fixture.detectChanges();
            // Verify style is still in DOM
            expect(styleCount(fixture, '.none')).toBe(1);

            // Hide all instances of the component
            compInstance.componentTwoInstanceHidden = true;
            fixture.detectChanges();

            // Verify style is not in DOM
            expect(styleCount(fixture, '.emulated')).toBe(0);
          });
        });
  });
}

function styleCount(fixture: ComponentFixture<unknown>, cssContentMatcher: string): number {
  const html = fixture.debugElement.parent?.parent;
  const debugElements = html?.queryAll(By.css('style'));

  if (!debugElements) {
    return 0;
  }

  return debugElements
      .filter(({nativeElement}) => nativeElement.textContent.includes(cssContentMatcher))
      .length;
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

@Component({
  selector: 'some-app',
  template: `
    <cmp-emulated *ngIf="!componentOneInstanceHidden && showEmulatedComponents"></cmp-emulated>
    <cmp-emulated *ngIf="!componentTwoInstanceHidden && showEmulatedComponents"></cmp-emulated>

    <cmp-none *ngIf="!componentOneInstanceHidden && !showEmulatedComponents"></cmp-none>
    <cmp-none *ngIf="!componentTwoInstanceHidden && !showEmulatedComponents"></cmp-none>
  `,
})
export class SomeAppForCleanUp {
  componentOneInstanceHidden = false;
  componentTwoInstanceHidden = false;
  showEmulatedComponents = true;
}

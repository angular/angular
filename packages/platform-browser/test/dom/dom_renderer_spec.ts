/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, Renderer2, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '../../src/dom/debug/by';
import {
  addBaseHrefToCssSourceMap,
  NAMESPACE_URIS,
  REMOVE_STYLES_ON_COMPONENT_DESTROY,
} from '../../src/dom/dom_renderer';
import {expect} from '@angular/private/testing/matchers';
import {isNode} from '@angular/private/testing';

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
        IsolatedShadowComponentParentApp,
        SomeAppForCleanUp,
        CmpEncapsulationEmulated,
        CmpEncapsulationNone,
        CmpEncapsulationShadow,
        CmpEncapsulationIsolatedShadowWithChildren,
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
    it('should not error when removing a child without passing a parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');

      parent.appendChild(child);
      renderer.removeChild(null, child);
    });
  });

  it('should style non-descendant components correctly with different types of encapsulation', () => {
    const fixture = TestBed.createComponent(SomeApp);
    fixture.detectChanges();

    const cmp = fixture.debugElement.query(By.css('cmp-shadow')).nativeElement;
    const shadowRoot = cmp.shadowRoot;
    const shadow = shadowRoot.querySelector('.shadow');
    expect(window.getComputedStyle(shadow).color).toEqual('rgb(255, 0, 0)');

    const emulated = fixture.debugElement.query(By.css('.emulated')).nativeElement;
    expect(window.getComputedStyle(emulated).color).toEqual('rgb(0, 0, 255)');

    const none = fixture.debugElement.query(By.css('.none')).nativeElement;
    expect(window.getComputedStyle(none).color).toEqual('rgb(0, 255, 0)');
  });

  it('should encapsulate shadow DOM components, with child components inheriting from shadow styles not global styles', () => {
    const fixture = TestBed.createComponent(IsolatedShadowComponentParentApp);
    fixture.detectChanges();
    const shadowcmp = fixture.debugElement.query(By.css('cmp-shadow-children')).nativeElement;
    const shadowRoot = shadowcmp.shadowRoot;

    const shadow = shadowRoot.querySelector('.shadow');
    expect(window.getComputedStyle(shadow).color).toEqual('rgb(255, 0, 0)');

    const emulated = fixture.debugElement.query(By.css('.emulated')).nativeElement;
    expect(window.getComputedStyle(emulated).color).toEqual('rgb(255, 0, 0)');

    const none = fixture.debugElement.query(By.css('.none')).nativeElement;
    expect(window.getComputedStyle(none).color).toEqual('rgb(255, 0, 0)');
  });

  it('child components of shadow components should inherit browser defaults rather than their component styles', () => {
    const fixture = TestBed.createComponent(IsolatedShadowComponentParentApp);
    fixture.detectChanges();

    const shadowcmp = fixture.debugElement.query(By.css('cmp-shadow-children')).nativeElement;
    const shadowRoot = shadowcmp.shadowRoot;
    const shadow = shadowRoot.querySelector('.shadow');
    expect(window.getComputedStyle(shadow).backgroundColor).toEqual('rgba(0, 0, 0, 0)');

    const emulated = fixture.debugElement.query(By.css('.emulated')).nativeElement;
    expect(window.getComputedStyle(emulated).backgroundColor).toEqual('rgba(0, 0, 0, 0)');

    const none = fixture.debugElement.query(By.css('.none')).nativeElement;
    expect(window.getComputedStyle(none).backgroundColor).toEqual('rgba(0, 0, 0, 0)');
  });

  it('shadow components should not be polluted by child components styles when using IsolatedShadowDom', () => {
    const fixture = TestBed.createComponent(IsolatedShadowComponentParentApp);
    fixture.detectChanges();

    const cmp = fixture.debugElement.query(By.css('cmp-shadow-children')).nativeElement;
    const shadowRoot = cmp.shadowRoot;
    const shadow = shadowRoot.querySelector('.shadow');
    expect(window.getComputedStyle(shadow).backgroundColor).not.toEqual('rgb(0, 0, 255)');
    expect(window.getComputedStyle(shadow).backgroundColor).not.toEqual('rgb(0, 255, 0)');
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

  describe('should not cleanup styles of destroyed components when `REMOVE_STYLES_ON_COMPONENT_DESTROY` is `false`', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        declarations: [SomeAppForCleanUp, CmpEncapsulationEmulated, CmpEncapsulationNone],
        providers: [
          {
            provide: REMOVE_STYLES_ON_COMPONENT_DESTROY,
            useValue: false,
          },
        ],
      });
    });

    it('works for components without encapsulation emulated', async () => {
      const fixture = TestBed.createComponent(SomeAppForCleanUp);
      const compInstance = fixture.componentInstance;
      compInstance.showEmulatedComponents = true;

      fixture.detectChanges();
      // verify style is in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(1);

      // Remove a single instance of the component.
      compInstance.componentOneInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      // Verify style is still in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(1);

      // Hide all instances of the component
      compInstance.componentTwoInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // Verify style is still in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(1);
    });

    it('works for components without encapsulation none', async () => {
      const fixture = TestBed.createComponent(SomeAppForCleanUp);
      const compInstance = fixture.componentInstance;
      compInstance.showEmulatedComponents = false;

      fixture.detectChanges();
      // verify style is in DOM
      expect(await styleCount(fixture, '.none')).toBe(1);

      // Remove a single instance of the component.
      compInstance.componentOneInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      // Verify style is still in DOM
      expect(await styleCount(fixture, '.none')).toBe(1);

      // Hide all instances of the component
      compInstance.componentTwoInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // Verify style is still in DOM
      expect(await styleCount(fixture, '.none')).toBe(1);
    });
  });

  describe('should cleanup styles of destroyed components by default', () => {
    it('works for components without encapsulation emulated', async () => {
      const fixture = TestBed.createComponent(SomeAppForCleanUp);
      const compInstance = fixture.componentInstance;
      compInstance.showEmulatedComponents = true;
      fixture.detectChanges();
      // verify style is in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(1);

      // Remove a single instance of the component.
      compInstance.componentOneInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      // Verify style is still in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(1);

      // Hide all instances of the component
      compInstance.componentTwoInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // Verify style is not in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(0);
    });

    it('works for components without encapsulation none', async () => {
      const fixture = TestBed.createComponent(SomeAppForCleanUp);
      const compInstance = fixture.componentInstance;
      compInstance.showEmulatedComponents = false;

      fixture.detectChanges();
      // verify style is in DOM
      expect(await styleCount(fixture, '.none')).toBe(1);

      // Remove a single instance of the component.
      compInstance.componentOneInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      // Verify style is still in DOM
      expect(await styleCount(fixture, '.none')).toBe(1);

      // Hide all instances of the component
      compInstance.componentTwoInstanceHidden = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      // Verify style is not in DOM
      expect(await styleCount(fixture, '.emulated')).toBe(0);
    });
  });

  describe('should support namespaces', () => {
    it('should create SVG elements', () => {
      expect(
        document.createElementNS(NAMESPACE_URIS['svg'], 'math') instanceof SVGElement,
      ).toBeTrue();
    });

    it('should create MathML elements', () => {
      // MathMLElement is fairly recent and doesn't exist on our Saucelabs test environments
      if (typeof MathMLElement !== 'undefined') {
        expect(
          document.createElementNS(NAMESPACE_URIS['math'], 'math') instanceof MathMLElement,
        ).toBeTrue();
      }
    });
  });

  it('should update an external sourceMappingURL by prepending the baseHref as a prefix', () => {
    document.head.innerHTML = `<base href="/base/" />`;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [CmpEncapsulationNoneWithSourceMap],
    });

    const fixture = TestBed.createComponent(CmpEncapsulationNoneWithSourceMap);
    fixture.detectChanges();

    expect(document.head.querySelector('style')?.textContent).toContain(
      '/*# sourceMappingURL=/base/cmp-none.css.map */',
    );

    document.head.innerHTML = '';
  });
});

describe('addBaseHrefToCssSourceMap', () => {
  it('should return the original styles if baseHref is empty', () => {
    const styles = ['body { color: red; }'];
    const result = addBaseHrefToCssSourceMap('', styles);
    expect(result).toEqual(styles);
  });

  it('should skip styles that do not contain a sourceMappingURL', () => {
    const styles = ['body { color: red; }', 'h1 { font-size: 2rem; }'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(styles);
  });

  it('should not modify inline (encoded) sourceMappingURL maps', () => {
    const styles = ['/*# sourceMappingURL=data:application/json;base64,xyz */'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(styles);
  });

  it('should prepend baseHref to external sourceMappingURL', () => {
    const styles = ['/*# sourceMappingURL=style.css */'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(['/*# sourceMappingURL=/base/style.css */']);
  });

  it('should handle baseHref with a trailing slash correctly', () => {
    const styles = ['/*# sourceMappingURL=style.css */'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(['/*# sourceMappingURL=/base/style.css */']);
  });

  it('should handle baseHref without a trailing slash correctly', () => {
    const styles = ['/*# sourceMappingURL=style.css */'];
    const result = addBaseHrefToCssSourceMap('/base', styles);
    expect(result).toEqual(['/*# sourceMappingURL=/style.css */']);
  });

  it('should not duplicate slashes in the final URL', () => {
    const styles = ['/*# sourceMappingURL=./style.css */'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(['/*# sourceMappingURL=/base/style.css */']);
  });

  it('should not add base href to sourceMappingURL that is absolute', () => {
    const styles = ['/*# sourceMappingURL=http://example.com/style.css */'];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual(['/*# sourceMappingURL=http://example.com/style.css */']);
  });

  it('should process multiple styles and handle each case correctly', () => {
    const styles = [
      '/*# sourceMappingURL=style1.css */',
      '/*# sourceMappingURL=data:application/json;base64,xyz */',
      'h1 { font-size: 2rem; }',
      '/*# sourceMappingURL=style2.css */',
    ];
    const result = addBaseHrefToCssSourceMap('/base/', styles);
    expect(result).toEqual([
      '/*# sourceMappingURL=/base/style1.css */',
      '/*# sourceMappingURL=data:application/json;base64,xyz */',
      'h1 { font-size: 2rem; }',
      '/*# sourceMappingURL=/base/style2.css */',
    ]);
  });
});

async function styleCount(
  fixture: ComponentFixture<unknown>,
  cssContentMatcher: string,
): Promise<number> {
  // flush
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });

  const html = fixture.debugElement.parent?.parent;
  const debugElements = html?.queryAll(By.css('style'));

  if (!debugElements) {
    return 0;
  }

  return debugElements.filter(({nativeElement}) =>
    nativeElement.textContent.includes(cssContentMatcher),
  ).length;
}

@Component({
  selector: 'cmp-emulated',
  template: `
    <div class="emulated"></div>`,
  styles: [
    `.emulated {
      background-color: blue;
      color: blue;
    }`,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  standalone: false,
})
class CmpEncapsulationEmulated {}

@Component({
  selector: 'cmp-none',
  template: `
    <div class="none"></div>`,
  styles: [
    `.none {
      background-color: lime;
      color: lime;
    }`,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
class CmpEncapsulationNone {}

@Component({
  selector: 'cmp-none',
  template: `
    <div class="none"></div>`,
  styles: [
    `.none {
      background-color: lime;
      color: lime;
    }

    /*# sourceMappingURL=cmp-none.css.map */`,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
class CmpEncapsulationNoneWithSourceMap {}

@Component({
  selector: 'cmp-shadow',
  template: `
    <div class="shadow"></div>`,
  styles: [
    `.shadow {
      color: red;
    }`,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
class CmpEncapsulationShadow {}

@Component({
  selector: 'cmp-shadow-children',
  template: `
    <div class="shadow">
      <cmp-emulated></cmp-emulated>
      <cmp-none></cmp-none>
    </div>`,
  styles: [
    `.shadow {
      color: red;
    }`,
  ],
  encapsulation: ViewEncapsulation.IsolatedShadowDom,
  standalone: false,
})
class CmpEncapsulationIsolatedShadowWithChildren {}

@Component({
  selector: 'some-app',
  template: `
    <cmp-shadow></cmp-shadow>
    <cmp-emulated></cmp-emulated>
    <cmp-none></cmp-none>
  `,
  standalone: false,
})
export class SomeApp {}

@Component({
  selector: 'shadow-parent-app-with-children',
  template: `
    <cmp-shadow-children></cmp-shadow-children>
  `,
  standalone: false,
})
export class IsolatedShadowComponentParentApp {}

@Component({
  selector: 'test-cmp',
  template: '',
  standalone: false,
})
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
  standalone: false,
})
export class SomeAppForCleanUp {
  componentOneInstanceHidden = false;
  componentTwoInstanceHidden = false;
  showEmulatedComponents = true;
}

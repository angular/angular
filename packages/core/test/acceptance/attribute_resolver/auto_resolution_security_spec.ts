/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  AttributeResolver,
  Component,
  createComponent,
  Directive,
  EnvironmentInjector,
  Injector,
  provideAttributeResolvers,
  Renderer2,
  RendererFactory2,
  withAutoResolution,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

const SVG = 'http://www.w3.org/2000/svg';
const MATH_ML = 'http://www.w3.org/1998/Math/MathML';
const XHTML = 'http://www.w3.org/1999/xhtml';

// These specs run in Domino and in a browser, because the name and the namespace of a host created
// in code come from the DOM.
describe('automatic resolution of an attribute that a resolved value would bypass the sanitizer for', () => {
  function provideResolver(...names: string[]) {
    const resolver = jasmine.createSpy<AttributeResolver>('resolver').and.returnValue('resolved');
    TestBed.configureTestingModule({
      providers: [
        provideAttributeResolvers(
          Object.fromEntries(names.map((name) => [name, resolver])),
          withAutoResolution(),
        ),
      ],
    });
    return resolver;
  }

  describe('in a template', () => {
    @Directive({selector: '[marked]'})
    class Marked {}

    it('skips the HTML, the resource URL, and the sandbox of an <iframe>, and resolves them elsewhere', async () => {
      const resolver = provideResolver('srcdoc', 'src', 'sandbox');

      @Component({
        imports: [Marked],
        template: `<iframe
            marked
            srcdoc="template"
            src="about:blank"
            sandbox="allow-forms"
          ></iframe>
          <div marked srcdoc="template" src="about:blank" sandbox="allow-forms"></div>`,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const iframe: HTMLElement = fixture.nativeElement.querySelector('iframe');
      const div: HTMLElement = fixture.nativeElement.querySelector('div');

      expect(iframe.getAttribute('srcdoc')).toBe('template');
      expect(iframe.getAttribute('src')).toBe('about:blank');
      expect(iframe.getAttribute('sandbox')).toBe('allow-forms');
      expect(div.getAttribute('srcdoc')).toBe('resolved');
      expect(div.getAttribute('src')).toBe('resolved');
      expect(div.getAttribute('sandbox')).toBe('resolved');
      expect(resolver).toHaveBeenCalledTimes(3);
    });

    it('skips an attribute by the namespace of the element', async () => {
      const resolver = provideResolver('href', 'values');

      @Component({
        imports: [Marked],
        template: `<math><mi marked href="/template"></mi></math>
          <svg><animate marked values="template"></animate></svg>
          <math><animate marked values="template"></animate></math>
          <div marked href="/template" values="template"></div>`,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const [svgAnimate, mathAnimate]: Element[] = Array.from(
        fixture.nativeElement.querySelectorAll('animate'),
      );
      const div: HTMLElement = fixture.nativeElement.querySelector('div');

      expect(fixture.nativeElement.querySelector('mi').getAttribute('href')).toBe('/template');
      expect(svgAnimate.namespaceURI).toBe(SVG);
      expect(svgAnimate.getAttribute('values')).toBe('template');
      // Only SVG's `animate` can animate another attribute.
      expect(mathAnimate.namespaceURI).toBe(MATH_ML);
      expect(mathAnimate.getAttribute('values')).toBe('resolved');
      expect(div.getAttribute('href')).toBe('resolved');
      expect(div.getAttribute('values')).toBe('resolved');
      expect(resolver).toHaveBeenCalledTimes(3);
    });
  });

  describe('on a host created in code', () => {
    @Component({template: '', host: {href: '/source', values: 'source', role: 'source'}})
    class Host {}

    async function createHost(hostElement: Element): Promise<Element> {
      const appRef = TestBed.inject(ApplicationRef);
      const host = createComponent(Host, {
        hostElement,
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });
      appRef.attachView(host.hostView);
      await appRef.whenStable();
      return host.location.nativeElement;
    }

    async function expectSkipped() {
      provideResolver('href', 'values', 'role');

      const svgA = await createHost(document.createElementNS(SVG, 'svg:a'));
      const svgAnimate = await createHost(document.createElementNS(SVG, 'svg:animate'));
      const svgG = await createHost(document.createElementNS(SVG, 'svg:g'));
      const a = await createHost(document.createElement('a'));
      const unprefixedSvgA = await createHost(document.createElementNS(SVG, 'a'));
      const mi = await createHost(document.createElementNS(MATH_ML, 'mi'));
      const prefixedMi = await createHost(document.createElementNS(MATH_ML, 'm:mi'));
      const mathAnimate = await createHost(document.createElementNS(MATH_ML, 'animate'));
      const div = await createHost(document.createElement('div'));

      // A host created with a qualified name is checked by its local name.
      expect(svgA.getAttribute('href')).toBe('/source');
      expect(svgA.getAttribute('role')).toBe('resolved');
      expect(svgAnimate.getAttribute('values')).toBe('source');
      expect(svgAnimate.getAttribute('role')).toBe('resolved');
      expect(svgG.getAttribute('href')).toBe('resolved');
      expect(svgG.getAttribute('values')).toBe('resolved');

      expect(a.getAttribute('href')).toBe('/source');
      expect(unprefixedSvgA.getAttribute('href')).toBe('/source');
      expect(mi.getAttribute('href')).toBe('/source');
      expect(prefixedMi.getAttribute('href')).toBe('/source');
      expect(mi.getAttribute('values')).toBe('resolved');
      expect(mathAnimate.getAttribute('values')).toBe('resolved');
      expect(div.getAttribute('href')).toBe('resolved');
      expect(div.getAttribute('values')).toBe('resolved');
    }

    it('skips an attribute by the local name and the namespace of the host', async () => {
      await expectSkipped();
    });

    describe('in production mode', () => {
      const _global = globalThis as unknown as {ngDevMode: unknown};
      let savedNgDevMode: unknown;
      beforeEach(() => (savedNgDevMode = _global.ngDevMode));
      afterEach(() => (_global.ngDevMode = savedNgDevMode));

      it('skips an attribute by the local name and the namespace of the host', async () => {
        _global.ngDevMode = false;
        await expectSkipped();
      });
    });
  });

  describe('on a host created in code by a renderer that wraps its elements', () => {
    @Component({
      template: '',
      host: {class: 'source', style: 'color: red', href: '/source', role: 'source'},
    })
    class Host {}

    /** What a renderer's element wrapper tells about the element, which `RElement` doesn't declare. */
    interface Metadata {
      tagName?: string;
      localName?: string;
      namespaceURI?: string | null;
    }

    /**
     * Creates `Host` on a wrapper that a renderer passes to Angular instead of the element it writes
     * to, and returns that element.
     */
    async function createWrappedHost(metadata: Metadata): Promise<HTMLElement> {
      const element = document.createElement('div');
      const wrapper = {...metadata, getAttribute: (name: string) => element.getAttribute(name)};
      const unwrap = (value: unknown) => (value === wrapper ? element : value);
      const rewrap = (value: unknown) => (value === element ? wrapper : value);
      const wrapRenderer = (renderer: Renderer2) =>
        new Proxy(renderer, {
          get: (target, property) => {
            const value = Reflect.get(target, property);
            return typeof value === 'function'
              ? (...args: unknown[]) => rewrap(value.apply(target, args.map(unwrap)))
              : value;
          },
        });
      const domRendererFactory = TestBed.inject(RendererFactory2);
      const rendererFactory: RendererFactory2 = {
        createRenderer: (hostElement, type) =>
          wrapRenderer(domRendererFactory.createRenderer(unwrap(hostElement), type)),
        begin: () => domRendererFactory.begin?.(),
        end: () => domRendererFactory.end?.(),
      };

      const appRef = TestBed.inject(ApplicationRef);
      const host = createComponent(Host, {
        hostElement: wrapper as unknown as Element,
        environmentInjector: TestBed.inject(EnvironmentInjector),
        elementInjector: Injector.create({
          providers: [{provide: RendererFactory2, useValue: rendererFactory}],
        }),
      });
      appRef.attachView(host.hostView);
      await appRef.whenStable();
      expect(host.location.nativeElement).toBe(wrapper);
      return element;
    }

    async function expectResolvedByMetadata() {
      TestBed.configureTestingModule({
        providers: [
          provideAttributeResolvers(
            {
              class: () => 'resolved',
              style: () => 'color: blue',
              href: () => 'resolved',
              role: () => 'resolved',
            },
            withAutoResolution(),
          ),
        ],
      });

      // Without a namespace, nothing tells whether the host is a MathML element, whose `href` is a
      // URL, so only `class` and `style` are resolved.
      const tagNameOnly = await createWrappedHost({tagName: 'mi'});
      const noNamespace = await createWrappedHost({tagName: 'm:mi', localName: 'mi'});
      const noMetadata = await createWrappedHost({});
      for (const element of [tagNameOnly, noNamespace, noMetadata]) {
        expect(element.getAttribute('href')).toBe('/source');
        expect(element.getAttribute('role')).toBe('source');
        expect(element.getAttribute('class')).toBe('resolved');
        expect(element.style.color).toBe('blue');
      }

      // A host without a local name is checked by its tag name without a prefix.
      const mi = await createWrappedHost({tagName: 'm:mi', namespaceURI: MATH_ML});
      const div = await createWrappedHost({tagName: 'div', namespaceURI: XHTML});
      expect(mi.getAttribute('href')).toBe('/source');
      expect(mi.getAttribute('role')).toBe('resolved');
      expect(div.getAttribute('href')).toBe('resolved');
      expect(div.getAttribute('role')).toBe('resolved');
      expect(div.getAttribute('class')).toBe('resolved');

      // An element without a namespace has a `namespaceURI` of `null`, which reads like HTML, so a
      // MathML name in no namespace is resolved like any HTML element.
      const nullNamespace = await createWrappedHost({tagName: 'mi', namespaceURI: null});
      expect(nullNamespace.getAttribute('href')).toBe('resolved');
      expect(nullNamespace.getAttribute('role')).toBe('resolved');
      expect(nullNamespace.getAttribute('class')).toBe('resolved');
      expect(nullNamespace.style.color).toBe('blue');
    }

    it('resolves only class and style on a host whose wrapper tells no namespace', async () => {
      await expectResolvedByMetadata();
    });

    describe('in production mode', () => {
      const _global = globalThis as unknown as {ngDevMode: unknown};
      let savedNgDevMode: unknown;
      beforeEach(() => (savedNgDevMode = _global.ngDevMode));
      afterEach(() => (_global.ngDevMode = savedNgDevMode));

      it('resolves only class and style on a host whose wrapper tells no namespace', async () => {
        _global.ngDevMode = false;
        await expectResolvedByMetadata();
      });
    });
  });
});

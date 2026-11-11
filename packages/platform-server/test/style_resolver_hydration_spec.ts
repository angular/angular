/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  destroyPlatform,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
  provideAttributeResolvers,
  Renderer2,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {
  clearDocument,
  getAppContents,
  prepareEnvironmentAndHydrate,
  resetTViewsFor,
} from './dom_utils';
import {
  clearConsole,
  getComponentRef,
  resetNgDevModeCounters,
  ssr,
  verifyAllNodesClaimedForHydration,
} from './hydration_utils';

describe('(style) binding with hydration', () => {
  const originalWindow = globalThis.window;
  let doc: Document;

  beforeAll(async () => {
    globalThis.window = globalThis as unknown as Window & typeof globalThis;
    await import('../../core/primitives/event-dispatch/contract_bundle_min.js' as string);
  });

  afterAll(() => {
    globalThis.window = originalWindow;
  });

  beforeEach(() => {
    resetNgDevModeCounters();
    doc = TestBed.inject(DOCUMENT);
    clearConsole(TestBed.inject(ApplicationRef));
  });

  afterEach(() => {
    destroyPlatform();
    window._ejsas = {};
    clearDocument(doc);
    clearConsole(TestBed.inject(ApplicationRef));
  });

  it("removes a style that only the server resolved and keeps a constructor's style", async () => {
    @Directive({selector: '[outlined]'})
    class Outlined {
      constructor() {
        inject(Renderer2).setStyle(inject(ElementRef).nativeElement, 'outline', '1px solid red');
      }
    }

    @Component({
      selector: 'app',
      imports: [Outlined],
      template: `<div
        outlined
        [style.color]="isServer ? 'red' : null"
        [style.width]="width()"
        (style)="(merge) => merge()"
      ></div>`,
    })
    class App {
      protected readonly isServer = isPlatformServer(inject(PLATFORM_ID));
      readonly width = signal('1px');
    }

    const html = await ssr(App);
    const contents = getAppContents(html);
    expect(contents).toContain('color: red');
    expect(contents).toContain('outline: 1px solid red');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
    const app = getComponentRef<App>(appRef);
    const host = app.location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    const div = host.querySelector('div')!;
    expect(div.style.getPropertyValue('color')).toBe('');
    expect(div.style.getPropertyValue('width')).toBe('1px');
    expect(div.style.getPropertyValue('outline')).toBe('1px solid red');

    app.instance.width.set('2px');
    appRef.tick();

    expect(div.style.getPropertyValue('width')).toBe('2px');
    expect(div.style.getPropertyValue('outline')).toBe('1px solid red');
  });

  it("keeps a style that only the server's constructor set, except on an element with static styles", async () => {
    @Directive({selector: '[serverOutlined]'})
    class ServerOutlined {
      constructor() {
        if (isPlatformServer(inject(PLATFORM_ID))) {
          inject(Renderer2).setStyle(inject(ElementRef).nativeElement, 'outline', '1px solid red');
        }
      }
    }

    @Component({
      selector: 'app',
      imports: [ServerOutlined],
      template: `<div
          id="bound"
          serverOutlined
          [style.width]="'1px'"
          (style)="(merge) => merge()"
        ></div>
        <div id="static" serverOutlined style="width: 1px" (style)="(merge) => merge()"></div>`,
    })
    class App {}

    const html = await ssr(App);
    const server = doc.createElement('div');
    server.innerHTML = getAppContents(html);
    expect(server.querySelector('#bound')!.getAttribute('style')).toContain(
      'outline: 1px solid red',
    );
    expect(server.querySelector('#static')!.getAttribute('style')).toContain(
      'outline: 1px solid red',
    );

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    const bound = host.querySelector<HTMLElement>('#bound')!;
    const withStatics = host.querySelector<HTMLElement>('#static')!;
    expect(bound.style.getPropertyValue('outline')).toBe('1px solid red');
    expect(bound.style.getPropertyValue('width')).toBe('1px');
    expect(withStatics.style.getPropertyValue('outline')).toBe('');
    expect(withStatics.style.getPropertyValue('width')).toBe('1px');
  });

  it('serializes the resolved declarations in the order that they apply', async () => {
    // `style_order_spec.ts` checks in a browser that this HTML gives the client's values.
    @Component({
      selector: 'app',
      template: `<div
        style="padding: 4px; padding-left: 2px"
        (attr.style)="$event.resolve(['padding-left: 2px', 'padding: 4px'])"
      ></div>`,
    })
    class App {}

    const html = await ssr(App);

    expect(getAppContents(html)).toContain('<div style="padding-left: 2px; padding: 4px;"></div>');
  });

  it("serializes a constructor's style that the resolver takes over in the resolved order", async () => {
    // `style_order_spec.ts` checks in a browser that this HTML gives the client's values.
    @Directive({selector: '[padded]'})
    class Padded {
      constructor() {
        const renderer = inject(Renderer2);
        const element = inject(ElementRef).nativeElement;
        renderer.setStyle(element, 'outline', '1px solid red');
        renderer.setStyle(element, 'padding', '4px');
      }
    }

    @Component({
      selector: 'app',
      imports: [Padded],
      template: `<div
        padded
        (attr.style)="$event.resolve(['padding-left: 2px', 'padding: 4px'])"
      ></div>`,
    })
    class App {}

    const html = await ssr(App);

    expect(getAppContents(html)).toContain(
      'style="outline: 1px solid red; padding-left: 2px; padding: 4px;"',
    );
  });

  describe("serializes a constructor's shorthand next to a static longhand in the resolved order", () => {
    @Directive({selector: '[padded]'})
    class Padded {
      constructor() {
        inject(Renderer2).setStyle(inject(ElementRef).nativeElement, 'padding', '4px');
      }
    }

    it('with the longhand first', async () => {
      @Component({
        selector: 'app',
        imports: [Padded],
        template: `<div
          padded
          style="padding-left: 2px"
          (attr.style)="$event.resolve(['padding-left: 2px', 'padding: 4px'])"
        ></div>`,
      })
      class App {}

      const html = await ssr(App);

      expect(getAppContents(html)).toContain('style="padding-left: 2px; padding: 4px;"');
    });

    it('with the shorthand first', async () => {
      @Component({
        selector: 'app',
        imports: [Padded],
        template: `<div
          padded
          style="padding-left: 2px"
          (attr.style)="$event.resolve(['padding: 4px', 'padding-left: 2px'])"
        ></div>`,
      })
      class App {}

      const html = await ssr(App);

      expect(getAppContents(html)).toContain('style="padding: 4px; padding-left: 2px;"');
    });
  });

  describe("serializes a constructor's style that a later resolution takes over in the resolved order", () => {
    // `style_order_spec.ts` checks in a browser that this HTML gives the client's values.
    function createApp(constructorStyle: string, first: string[], second: string[]) {
      @Directive({selector: '[styled]'})
      class Styled {
        constructor() {
          const [property, value] = constructorStyle.split(': ');
          inject(Renderer2).setStyle(inject(ElementRef).nativeElement, property, value);
        }
      }

      @Component({
        selector: 'app',
        imports: [Styled],
        template: `<div styled (attr.style)="$event.resolve(declarations())"></div>`,
      })
      class App implements AfterViewInit {
        readonly declarations = signal(first);

        ngAfterViewInit(): void {
          // Resolves again before the server serializes the page.
          this.declarations.set(second);
        }
      }
      return App;
    }

    it('for a shorthand after the longhand that the first resolution set', async () => {
      const App = createApp(
        'padding: 4px',
        ['padding-left: 2px'],
        ['padding-left: 2px', 'padding: 4px'],
      );

      const html = await ssr(App);

      expect(getAppContents(html)).toContain('style="padding-left: 2px; padding: 4px;"');
    });

    it('for a longhand after the shorthand that the first resolution set', async () => {
      const App = createApp(
        'padding-left: 2px',
        ['padding: 4px'],
        ['padding: 4px', 'padding-left: 2px'],
      );

      const html = await ssr(App);

      expect(getAppContents(html)).toContain('style="padding: 4px; padding-left: 2px;"');
    });
  });

  it("keeps a style that the app's resolver writes with an escaped name", async () => {
    @Component({
      selector: 'app',
      template: `<div [style.color]="'blue'" (style)="(merge) => merge()"></div>`,
    })
    class App {}

    // Domino reads a name such as `COLOR` in any case, but doesn't decode escapes.
    const envProviders = [provideAttributeResolvers({style: () => String.raw`\63 olor: red`})];
    const html = await ssr(App, {envProviders});
    expect(getAppContents(html)).toContain('color: red');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App, {envProviders});
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    expect(host.querySelector('div')!.style.getPropertyValue('color')).toBe('red');
  });
});

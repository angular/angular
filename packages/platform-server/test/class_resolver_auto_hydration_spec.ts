/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {
  ApplicationRef,
  Component,
  destroyPlatform,
  Directive,
  inject,
  joinTokens,
  lastValue,
  PLATFORM_ID,
  provideAttributeResolvers,
  Provider,
  withAutoResolution,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {
  cn,
  describeOffSubtreeHydration,
  describeRootHostHydration,
} from './class_resolver_hydration_cases';
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
  verifyClientAndSSRContentsMatch,
} from './hydration_utils';

describe('automatic class resolution with hydration', () => {
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

  it('hydrates an automatically resolved element without a class mismatch', async () => {
    @Directive({selector: '[tone]', host: {class: 'px-2'}})
    class Tone {}

    @Directive({selector: '[marker]', host: {'[class]': 'classes'}})
    class Marker {
      readonly classes = isPlatformServer(inject(PLATFORM_ID)) ? 'server-only' : 'client-only';
    }

    @Component({
      selector: 'app',
      imports: [Tone, Marker],
      template: `<div tone class="px-4"></div>
        <span marker></span>`,
    })
    class App {}

    const envProviders = () => [provideAttributeResolvers({class: cn}, withAutoResolution())];
    const html = await ssr(App, {envProviders: envProviders()});
    expect(getAppContents(html)).toContain('<div tone="" class="px-4">');
    expect(getAppContents(html)).toContain('server-only');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App, {
      envProviders: envProviders(),
    });
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    expect(Array.from(host.querySelector('div')!.classList)).toEqual(['px-4']);
    expect(Array.from(host.querySelector('span')!.classList)).toEqual(['client-only']);
  });

  describe('when the server resolver adds a class', () => {
    @Directive({selector: '[marker]', host: {'[class]': "'px-4'"}})
    class Marker {}

    @Component({selector: 'app', imports: [Marker], template: `<span marker></span>`})
    class App {}

    async function hydrateWith(envProviders: () => Provider[]): Promise<HTMLElement> {
      const serverCn = (...classes: string[]) => cn(...classes, 'server-only');
      const html = await ssr(App, {
        envProviders: [provideAttributeResolvers({class: serverCn}, withAutoResolution())],
      });
      expect(getAppContents(html)).toContain('<span marker="" class="px-4 server-only">');

      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc, html, App, {
        envProviders: envProviders(),
      });
      const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(host);
      return host.querySelector('span')!;
    }

    it('removes it with the plain merge when the client map has no class resolver', async () => {
      const span = await hydrateWith(() => [provideAttributeResolvers({}, withAutoResolution())]);

      expect(Array.from(span.classList)).toEqual(['px-4']);
    });

    it("keeps it when the client's root providers don't turn automatic resolution on", async () => {
      const span = await hydrateWith(() => [provideAttributeResolvers({})]);

      expect(Array.from(span.classList).sort()).toEqual(['px-4', 'server-only']);
    });

    it('removes it from an element without class sources with the plain merge', async () => {
      @Directive({selector: '[plain]'})
      class Plain {}

      @Component({selector: 'app', imports: [Plain], template: `<span plain></span>`})
      class PlainApp {}

      const serverCn = (...classes: string[]) => cn(...classes, 'server-only');
      const html = await ssr(PlainApp, {
        envProviders: [provideAttributeResolvers({class: serverCn}, withAutoResolution())],
      });
      expect(getAppContents(html)).toContain('<span plain="" class="server-only">');

      resetTViewsFor(PlainApp);
      const appRef = await prepareEnvironmentAndHydrate(doc, html, PlainApp, {
        envProviders: [provideAttributeResolvers({}, withAutoResolution())],
      });
      const host = getComponentRef<PlainApp>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();
      appRef.tick();

      verifyAllNodesClaimedForHydration(host);
      expect(host.querySelector('span')!.classList.length).toBe(0);
    });
  });

  describe('of attributes that the root map names', () => {
    const envProviders = () => [
      provideAttributeResolvers(
        {role: lastValue, 'aria-describedby': joinTokens},
        withAutoResolution(),
      ),
    ];

    it('renders them on the server as the browser does, and keeps them', async () => {
      @Directive({
        selector: '[menuItem]',
        host: {
          '[attr.role]': "'menuitem'",
          '[attr.aria-describedby]': "'hint shared'",
          '[style.padding]': "'8px'",
        },
      })
      class MenuItem {}

      @Component({
        selector: 'app',
        imports: [MenuItem],
        template: `<li
          menuItem
          role="separator"
          aria-describedby="shared label"
          style="padding: 4px; color: red"
        ></li>`,
      })
      class App {}

      const html = await ssr(App, {envProviders: envProviders()});
      const ssrContents = getAppContents(html);
      expect(ssrContents).toContain('role="separator"');
      expect(ssrContents).toContain('aria-describedby="hint shared label"');
      expect(ssrContents).toContain('padding: 4px');

      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc, html, App, {
        envProviders: envProviders(),
      });
      const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(host);
      verifyClientAndSSRContentsMatch(ssrContents, host);
    });

    it('removes a value that only the server gives', async () => {
      @Directive({selector: '[serverRole]', host: {'[attr.role]': 'role'}})
      class ServerRole {
        readonly role = isPlatformServer(inject(PLATFORM_ID)) ? 'server-only' : null;
      }

      @Component({selector: 'app', imports: [ServerRole], template: `<li serverRole></li>`})
      class App {}

      const html = await ssr(App, {envProviders: envProviders()});
      expect(getAppContents(html)).toContain('<li serverrole="" role="server-only">');

      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc, html, App, {
        envProviders: envProviders(),
      });
      const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(host);
      expect(host.querySelector('li')!.hasAttribute('role')).toBe(false);
    });
  });

  describeOffSubtreeHydration(
    () => [provideAttributeResolvers({class: cn}, withAutoResolution())],
    () => doc,
  );

  describeRootHostHydration(
    () => [provideAttributeResolvers({class: cn}, withAutoResolution())],
    () => doc,
    {'[class]': 'classes'},
  );
});

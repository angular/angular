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
  PLATFORM_ID,
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
  verifyClientAndSSRContentsMatch,
} from './hydration_utils';

describe('(attr.x) binding with hydration', () => {
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

  @Directive({selector: '[hint]', host: {'aria-describedby': 'hint shared'}})
  class Hint {}

  @Directive({
    selector: '[errors]',
    host: {'[attr.aria-describedby]': "'shared error'", '[attr.role]': "'option'"},
  })
  class Errors {}

  it('renders a resolved value and a resolved token list on the server as the browser does, and keeps them', async () => {
    @Component({
      selector: 'app',
      imports: [Hint, Errors],
      template: `<input
        hint
        errors
        role="tab"
        (attr.role)="$event.resolve($event.resolver())"
        (attr.aria-describedby)="$event.resolve($event.resolver())"
      />`,
    })
    class App {}

    const html = await ssr(App);
    const ssrContents = getAppContents(html);
    expect(ssrContents).toContain('aria-describedby="hint shared error"');
    expect(ssrContents).toContain('role="tab"');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    verifyClientAndSSRContentsMatch(ssrContents, host);
  });

  it('replaces a value and the tokens that only the server resolved', async () => {
    @Component({
      selector: 'app',
      imports: [Hint, Errors],
      template: `<input
        hint
        errors
        role="tab"
        (attr.role)="$event.resolve(isServer ? 'server-role' : $event.resolver())"
        (attr.aria-describedby)="
          $event.resolve($event.resolver(isServer ? 'server-only' : 'client-only'))
        "
      />`,
    })
    class App {
      protected readonly isServer = isPlatformServer(inject(PLATFORM_ID));
    }

    const html = await ssr(App);
    const ssrContents = getAppContents(html);
    expect(ssrContents).toContain('aria-describedby="hint shared error server-only"');
    expect(ssrContents).toContain('role="server-role"');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    const input = host.querySelector('input')!;
    expect(input.getAttribute('aria-describedby')).toBe('hint shared error client-only');
    expect(input.getAttribute('role')).toBe('tab');
  });

  it('removes a token list that only the server resolved on an element without static tokens', async () => {
    @Component({
      selector: 'app',
      template: `<input
        (attr.aria-describedby)="$event.resolve(isServer ? 'server-only' : null)"
      />`,
    })
    class App {
      protected readonly isServer = isPlatformServer(inject(PLATFORM_ID));
    }

    const html = await ssr(App);
    expect(getAppContents(html)).toContain('aria-describedby="server-only"');

    resetTViewsFor(App);
    const appRef = await prepareEnvironmentAndHydrate(doc, html, App);
    const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
    appRef.tick();

    verifyAllNodesClaimedForHydration(host);
    expect(host.querySelector('input')!.hasAttribute('aria-describedby')).toBe(false);
  });
});

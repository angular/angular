/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformServer} from '@angular/common';
import {
  BoundClassResolver,
  Component,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  Provider,
} from '@angular/core';

import {getAppContents, prepareEnvironmentAndHydrate, resetTViewsFor} from './dom_utils';
import {getComponentRef, ssr, verifyAllNodesClaimedForHydration} from './hydration_utils';

/**
 * Call it inside a `describe` that sets up hydration.
 *
 * @param host Host bindings that resolve the host's classes from the component's `classes` field,
 *     either directly or through its `resolve` callback.
 */
export function describeRootHostHydration(
  envProviders: () => Provider[],
  doc: () => Document,
  host: {[key: string]: string},
): void {
  describe('on the host of a component created in code', () => {
    it("starts a hydrated root component's host from the classes that the server resolved", async () => {
      @Component({selector: 'app', template: '<p>content</p>', host})
      class App {
        protected readonly classes = isPlatformServer(inject(PLATFORM_ID))
          ? 'server-only'
          : 'client-only';
        protected readonly resolve = (cn: BoundClassResolver) => cn(this.classes);
      }

      const html = await ssr(App, {envProviders: envProviders()});
      expect(getAppContents(html)).toContain('class="server-only"');

      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc(), html, App, {
        envProviders: envProviders(),
      });
      const hostElement = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(hostElement);
      expect(Array.from(hostElement.classList)).toEqual(['client-only']);
    });

    it("starts a hydrated root component's host from the server's classes when its constructor creates a component", async () => {
      @Component({selector: 'app-detached', template: ''})
      class Detached {}

      @Component({selector: 'app', template: '<p>content</p>', host})
      class App {
        protected readonly classes = isPlatformServer(inject(PLATFORM_ID))
          ? 'server-only'
          : 'client-only';
        protected readonly resolve = (cn: BoundClassResolver) => cn(this.classes);

        constructor() {
          const detached = createComponent(Detached, {
            environmentInjector: inject(EnvironmentInjector),
          });
          inject(DestroyRef).onDestroy(() => detached.destroy());
        }
      }

      const html = await ssr(App, {envProviders: envProviders()});
      expect(getAppContents(html)).toContain('class="server-only"');

      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc(), html, App, {
        envProviders: envProviders(),
      });
      const hostElement = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(hostElement);
      expect(Array.from(hostElement.classList)).toEqual(['client-only']);
    });

    it('keeps the classes that a host element had before a component was created on it after hydration', async () => {
      @Component({selector: 'app', template: '<p>content</p>'})
      class App {}

      @Component({selector: 'app-badge', template: '', host})
      class Badge {
        protected readonly classes = 'badge';
        protected readonly resolve = (cn: BoundClassResolver) => cn(this.classes);
      }

      const html = await ssr(App, {envProviders: envProviders()});
      resetTViewsFor(App);
      const appRef = await prepareEnvironmentAndHydrate(doc(), html, App, {
        envProviders: envProviders(),
      });
      appRef.tick();

      const hostElement = doc().createElement('div');
      hostElement.className = 'unrelated';
      doc().body.appendChild(hostElement);
      const badge = createComponent(Badge, {environmentInjector: appRef.injector, hostElement});
      appRef.attachView(badge.hostView);
      appRef.tick();

      expect(Array.from(hostElement.classList).sort()).toEqual(['badge', 'unrelated']);
    });
  });
}

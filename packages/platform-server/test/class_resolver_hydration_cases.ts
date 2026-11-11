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
  Directive,
  EnvironmentInjector,
  inject,
  Input,
  PLATFORM_ID,
  provideAttributeResolvers,
  Provider,
  withAutoResolution,
} from '@angular/core';

import {getAppContents, prepareEnvironmentAndHydrate, resetTViewsFor} from './dom_utils';
import {getComponentRef, ssr, verifyAllNodesClaimedForHydration} from './hydration_utils';

/** Stand-in for `cn` (`clsx` and `tailwind-merge`). */
export function cn(...inputs: string[]): string {
  const byPrefix = new Map<string, string>();
  for (const className of inputs.join(' ').split(/\s+/).filter(Boolean)) {
    const prefix = className.split('-')[0];
    byPrefix.delete(prefix);
    byPrefix.set(prefix, className);
  }
  return [...byPrefix.values()].join(' ');
}

/**
 * The `test` target runs these specs without automatic resolution, and the
 * `attribute_resolver_auto_hydration_test` target runs them with automatic resolution in the root
 * providers. Call it inside a `describe` that sets up hydration.
 */
export function describeOffSubtreeHydration(
  envProviders: () => Provider[],
  doc: () => Document,
): void {
  describe('in a subtree that provides the resolver without automatic resolution', () => {
    it('hydrates the classes that Angular gives without a resolver', async () => {
      @Directive({
        selector: '[tone]',
        host: {
          'class': 'px-2 tone',
          '[class.raised]': 'raised',
          '[class]': "raised ? 'py-1' : 'py-2'",
        },
      })
      class Tone {
        @Input() raised = true;
      }

      @Component({
        selector: 'ui-chip',
        template: '',
        host: {'class': 'px-2 chip', '[class.selected]': 'selected'},
      })
      class UiChip {
        @Input() selected = false;
      }

      @Component({
        selector: 'legacy-panel',
        imports: [Tone, UiChip],
        providers: [provideAttributeResolvers({class: cn}, withAutoResolution(false))],
        template: `
          <div id="bound" tone class="px-4 static" [class]="'m-1 m-2'" [class.active]="true"></div>
          <ui-chip id="chip" class="px-4" [selected]="true" [class.wide]="true" />
          <div id="dynamic" tone [raised]="false" [class]="'m-1 m-2'"></div>
        `,
      })
      class LegacyPanel {}

      @Component({selector: 'app', imports: [LegacyPanel], template: '<legacy-panel />'})
      class App {}

      const html = await ssr(App, {envProviders: envProviders()});
      expect(getAppContents(html)).toContain('m-1 m-2');

      resetTViewsFor(App, LegacyPanel, UiChip);
      const appRef = await prepareEnvironmentAndHydrate(doc(), html, App, {
        envProviders: envProviders(),
      });
      const host = getComponentRef<App>(appRef).location.nativeElement as HTMLElement;
      appRef.tick();

      verifyAllNodesClaimedForHydration(host);
      const classesOf = (id: string) => Array.from(host.querySelector(`#${id}`)!.classList).sort();
      expect(classesOf('bound')).toEqual([
        'active',
        'm-1',
        'm-2',
        'px-2',
        'px-4',
        'py-1',
        'raised',
        'static',
        'tone',
      ]);
      expect(classesOf('chip')).toEqual(['chip', 'px-2', 'px-4', 'selected', 'wide']);
      expect(classesOf('dynamic')).toEqual(['m-1', 'm-2', 'px-2', 'py-2', 'tone']);
    });
  });
}

/**
 * The `test` target runs these specs with an explicit `(class)` host binding, and the
 * `attribute_resolver_auto_hydration_test` target with a `[class]` host binding that automatic
 * resolution resolves. Call it inside a `describe` that sets up hydration.
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

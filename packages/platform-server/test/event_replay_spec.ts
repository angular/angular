/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, destroyPlatform, getPlatform, Type} from '@angular/core';
import {EventContract} from '@angular/core/primitives/event-dispatch';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {withEventReplay} from '@angular/platform-browser/src/hydration';

import {provideServerRendering} from '../public_api';
import {EVENT_DISPATCH_SCRIPT_ID, renderApplication} from '../src/utils';

import {getAppContents, hydrate, render as renderHtml, resetTViewsFor} from './dom_utils';

/**
 * Represents the <script> tag added by the build process to inject
 * event dispatch (JSAction) logic.
 */
const EVENT_DISPATCH_SCRIPT = `<script type="text/javascript" id="${EVENT_DISPATCH_SCRIPT_ID}"></script>`;

/** Checks whether event dispatch script is present in the generated HTML */
function hasEventDispatchScript(content: string) {
  return content.includes(EVENT_DISPATCH_SCRIPT_ID);
}

/** Checks whether there are any `jsaction` attributes present in the generated HTML */
function hasJSActionAttrs(content: string) {
  return content.includes('jsaction="');
}

describe('event replay', () => {
  beforeEach(() => {
    if (getPlatform()) destroyPlatform();
  });

  afterAll(() => {
    destroyPlatform();
  });

  describe('event replay', () => {
    /**
     * This renders the application with server side rendering logic.
     *
     * @param component the test component to be rendered
     * @param doc the document
     * @param envProviders the environment providers
     * @returns a promise containing the server rendered app as a string
     */
    async function ssr(
      component: Type<unknown>,
      options?: {doc?: string; enableEventReplay?: boolean},
    ): Promise<string> {
      const enableEventReplay = options?.enableEventReplay ?? true;
      const defaultHtml = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;
      const hydrationProviders = enableEventReplay
        ? provideClientHydration(withEventReplay())
        : provideClientHydration();
      const providers = [provideServerRendering(), hydrationProviders];

      const bootstrap = () => bootstrapApplication(component, {providers});

      return renderApplication(bootstrap, {
        document: options?.doc ?? defaultHtml,
      });
    }

    describe('server rendering', () => {
      let doc: Document;
      let eventContract: EventContract | undefined = undefined;
      const originalDocument = globalThis.document;
      const originalWindow = globalThis.window;

      function render(doc: Document, html: string) {
        renderHtml(doc, html);
        globalThis.document = doc;
        const scripts = doc.getElementsByTagName('script');
        for (const script of Array.from(scripts)) {
          if (script?.textContent?.startsWith('window.__jsaction_bootstrap')) {
            eval(script.textContent);
          }
        }
        eventContract = globalThis.window['ngContracts']['ng'];
        expect(eventContract).toBeDefined();
      }

      beforeAll(async () => {
        globalThis.window = globalThis as unknown as Window & typeof globalThis;
        await import('@angular/core/primitives/event-dispatch/contract_bundle_min.js' as string);
      });

      beforeEach(() => {
        doc = TestBed.inject(DOCUMENT);
      });

      afterEach(() => {
        doc.body.textContent = '';
        eventContract?.cleanUp();
        eventContract = undefined;
      });
      afterAll(() => {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
      });
      it('should serialize event types to be listened to and jsaction', async () => {
        const clickSpy = jasmine.createSpy('onClick');
        const blurSpy = jasmine.createSpy('onBlur');
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <div (click)="onClick()" id="1">
              <div (blur)="onClick()" id="2"></div>
            </div>
          `,
        })
        class SimpleComponent {
          onClick = clickSpy;
          onBlur = blurSpy;
        }

        const docContents = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;
        const html = await ssr(SimpleComponent, {doc: docContents});
        const ssrContents = getAppContents(html);
        expect(ssrContents).toContain(
          `<script>window.__jsaction_bootstrap('ngContracts', document.body, "ng", ["click","blur"]);</script>`,
        );
        expect(ssrContents).toContain(
          '<div id="1" jsaction="click:"><div id="2" jsaction="blur:"></div></div>',
        );

        render(doc, ssrContents);
        const el = doc.getElementById('1')!;
        const clickEvent = new CustomEvent('click', {bubbles: true});
        el.dispatchEvent(clickEvent);
        expect(clickSpy).not.toHaveBeenCalled();
        resetTViewsFor(SimpleComponent);
        const appRef = await hydrate(doc, SimpleComponent, {
          hydrationFeatures: [withEventReplay()],
        });
        appRef.tick();
        expect(clickSpy).toHaveBeenCalled();
      });

      it(`should add 'nonce' attribute to event record script when 'ngCspNonce' is provided`, async () => {
        @Component({
          standalone: true,
          selector: 'app',
          template: `
            <div (click)="onClick()">
                <div (blur)="onClick()"></div>
            </div>
          `,
        })
        class SimpleComponent {
          onClick() {}
        }

        const doc =
          `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}` +
          `<app ngCspNonce="{{nonce}}"></app></body></html>`;
        const html = await ssr(SimpleComponent, {doc});
        expect(getAppContents(html)).toContain(
          '<script nonce="{{nonce}}">window.__jsaction_bootstrap',
        );
      });

      describe('event dispatch script', () => {
        it('should not be present on a page if there are no events to replay', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: 'Some text',
          })
          class SimpleComponent {}

          const doc = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;
          const html = await ssr(SimpleComponent, {doc});
          const ssrContents = getAppContents(html);

          expect(hasJSActionAttrs(ssrContents)).toBeFalse();
          expect(hasEventDispatchScript(ssrContents)).toBeFalse();
        });

        it('should not be present on a page where event replay is not enabled', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: '<input (click)="onClick()" />',
          })
          class SimpleComponent {
            onClick() {}
          }

          const doc = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;
          const html = await ssr(SimpleComponent, {doc, enableEventReplay: false});
          const ssrContents = getAppContents(html);

          // Expect that there are no JSAction artifacts in the HTML
          // (even though there are events in a template), since event
          // replay is disabled in the config.
          expect(hasJSActionAttrs(ssrContents)).toBeFalse();
          expect(hasEventDispatchScript(ssrContents)).toBeFalse();
        });

        it('should be retained if there are events to replay', async () => {
          @Component({
            standalone: true,
            selector: 'app',
            template: '<input (click)="onClick()" />',
          })
          class SimpleComponent {
            onClick() {}
          }

          const doc = `<html><head></head><body>${EVENT_DISPATCH_SCRIPT}<app></app></body></html>`;
          const html = await ssr(SimpleComponent, {doc});
          const ssrContents = getAppContents(html);

          expect(hasJSActionAttrs(ssrContents)).toBeTrue();
          expect(hasEventDispatchScript(ssrContents)).toBeTrue();

          // Verify that inlined event delegation script goes first and
          // event contract setup goes second (since it uses some code from
          // the inlined script).
          expect(ssrContents).toContain(
            `<script type="text/javascript" id="ng-event-dispatch-contract"></script>` +
              `<script>window.__jsaction_bootstrap('ngContracts', document.body, "ng", ["click"]);</script>`,
          );
        });
      });
    });
  });
});

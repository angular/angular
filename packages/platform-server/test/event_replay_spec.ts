/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, destroyPlatform, getPlatform, Type} from '@angular/core';
import {bootstrapEventContract, EventContract} from '@angular/core/primitives/event-dispatch';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {withEventReplay} from '@angular/platform-browser/src/hydration';

import {provideServerRendering} from '../public_api';
import {EVENT_DISPATCH_SCRIPT_ID, renderApplication} from '../src/utils';

import {getAppContents, hydrate, render, resetTViewsFor} from './dom_utils';

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
      let eventContract!: EventContract;

      beforeEach(() => {
        doc = TestBed.inject(DOCUMENT);
        eventContract = bootstrapEventContract(
          'ngContracts',
          doc.body,
          'ng',
          ['click', 'blur'],
          globalThis,
        );
      });

      afterEach(() => {
        doc.body.textContent = '';
        eventContract.cleanUp();
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

        const docContents = `<html><head></head><body><app></app></body></html>`;
        const html = await ssr(SimpleComponent, {doc: docContents});
        const ssrContents = getAppContents(html);
        expect(
          ssrContents.startsWith(
            `<script>window.__jsaction_bootstrap('ngContracts', document.body, "ng", ["click","blur"]);</script>`,
          ),
        ).toBeTrue();
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

        const doc = `<html><head></head><body><app ngCspNonce="{{nonce}}"></app></body></html>`;
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
        });
      });
    });
  });
});

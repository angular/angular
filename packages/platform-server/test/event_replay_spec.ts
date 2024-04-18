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
import {renderApplication} from '../src/utils';

import {getAppContents, hydrate, render, resetTViewsFor} from './dom_utils';

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
    async function ssr(component: Type<unknown>, options?: {
      doc?: string,
    }): Promise<string> {
      const defaultHtml = '<html><head></head><body><app></app></body></html>';
      const providers = [
        provideServerRendering(),
        // @ts-ignore
        provideClientHydration(withEventReplay()),
      ];

      const bootstrap = () => bootstrapApplication(component, {providers});

      return renderApplication(bootstrap, {
        document: options?.doc ?? defaultHtml,
      });
    }

    describe('server rendering', () => {
      let doc: Document;
      let eventContract: EventContract;

      beforeEach(() => {
        doc = TestBed.inject(DOCUMENT);
        eventContract =
            bootstrapEventContract('ngContracts', doc.body, 'ng', ['click', 'blur'], globalThis);
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
                `<script>window.__jsaction_bootstrap('ngContracts', document.body, 'ng', ["click","blur"]);</script>`))
            .toBeTrue();
        expect(ssrContents)
            .toContain('<div id="1" jsaction="click:"><div id="2" jsaction="blur:"></div></div>');

        render(doc, ssrContents);
        const el = doc.getElementById('1')!;
        const clickEvent = new CustomEvent('click', {bubbles: true});
        el.dispatchEvent(clickEvent);
        expect(clickSpy).not.toHaveBeenCalled();
        resetTViewsFor(SimpleComponent);
        const appRef =
            await hydrate(doc, SimpleComponent, {hydrationFeatures: [withEventReplay()]});
        appRef.tick();
        expect(clickSpy).toHaveBeenCalled();
      });
    });
  });
});

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Component, destroyPlatform, getPlatform, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {withEventReplay} from '@angular/platform-browser/src/hydration';

import {provideServerRendering} from '../public_api';
import {renderApplication} from '../src/utils';

import {getAppContents} from './dom_utils';

describe('event replay', () => {
  beforeEach(() => {
    if (getPlatform()) destroyPlatform();
  });

  afterAll(() => {
    destroyPlatform();
  });

  describe('dom serialization', () => {
    let doc: Document;

    beforeEach(() => {
      doc = TestBed.inject(DOCUMENT);
    });

    afterEach(() => {
      doc.body.textContent = '';
    });

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
      options?: {
        doc?: string;
      },
    ): Promise<string> {
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
      it('should serialize event types to be listened to and jsaction', async () => {
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

        const doc = `<html><head></head><body><app></app></body></html>`;
        const html = await ssr(SimpleComponent, {doc});
        const ssrContents = getAppContents(html);
        expect(
          ssrContents.startsWith(
            `<script>window.__jsaction_bootstrap('ngContracts', document.body, "ng", ["click","blur"]);</script>`,
          ),
        ).toBeTrue();
        expect(ssrContents).toContain('<div jsaction="click:"><div jsaction="blur:"></div></div>');
      });
    });
  });
});

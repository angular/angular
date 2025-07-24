/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_ID,
  Component,
  makeStateKey,
  NgModule,
  TransferState,
  ɵgetTransferState as getTransferState,
  Injector,
  inject,
  ɵsetDocument as setDocument,
} from '@angular/core';
import {BrowserModule, withEventReplay, withIncrementalHydration} from '@angular/platform-browser';
import {renderModule, ServerModule} from '../index';
import {getHydrationInfoFromTransferState, ssr} from './hydration_utils';
import domino from '../src/bundled-domino';

describe('transfer_state', () => {
  const defaultExpectedOutput =
    '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app><script id="ng-state" type="application/json">{"test":10}</script></body></html>';

  it('adds transfer script tag when using renderModule', async () => {
    const STATE_KEY = makeStateKey<number>('test');

    @Component({
      selector: 'app',
      template: 'Works!',
      standalone: false,
    })
    class TransferComponent {
      constructor(private transferStore: TransferState) {
        this.transferStore.set(STATE_KEY, 10);
      }
    }

    @NgModule({
      bootstrap: [TransferComponent],
      declarations: [TransferComponent],
      imports: [BrowserModule, ServerModule],
    })
    class TransferStoreModule {}

    const output = await renderModule(TransferStoreModule, {document: '<app></app>'});
    expect(output).toBe(defaultExpectedOutput);
  });

  it('cannot break out of <script> tag in serialized output', async () => {
    const STATE_KEY = makeStateKey<string>('testString');

    @Component({
      selector: 'esc-app',
      template: 'Works!',
      standalone: false,
    })
    class EscapedComponent {
      constructor(private transferStore: TransferState) {
        this.transferStore.set(STATE_KEY, '</script><script>alert(\'Hello&\' + "World");');
      }
    }
    @NgModule({
      bootstrap: [EscapedComponent],
      declarations: [EscapedComponent],
      imports: [BrowserModule, ServerModule],
    })
    class EscapedTransferStoreModule {}

    const output = await renderModule(EscapedTransferStoreModule, {
      document: '<esc-app></esc-app>',
    });
    expect(output).toBe(
      '<html><head></head><body><esc-app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</esc-app>' +
        '<script id="ng-state" type="application/json">' +
        `{"testString":"\\u003C/script>\\u003Cscript>alert('Hello&' + \\"World\\");"}` +
        '</script></body></html>',
    );
  });

  it('adds transfer script tag when setting state during onSerialize', async () => {
    const STATE_KEY = makeStateKey<number>('test');

    @Component({
      selector: 'app',
      template: 'Works!',
      standalone: false,
    })
    class TransferComponent {
      constructor(private transferStore: TransferState) {
        this.transferStore.onSerialize(STATE_KEY, () => 10);
      }
    }

    @NgModule({
      bootstrap: [TransferComponent],
      declarations: [TransferComponent],
      imports: [BrowserModule, ServerModule],
    })
    class TransferStoreModule {}

    const output = await renderModule(TransferStoreModule, {document: '<app></app>'});
    expect(output).toBe(defaultExpectedOutput);
  });

  describe('getTransferState', () => {
    it('ensures it only returns public info of the Transfer State', async () => {
      @Component({
        selector: 'dep',
        template: ``,
      })
      class Dep {}

      @Component({
        selector: 'app',
        imports: [Dep],
        template: `
          <!-- This defer block will add internal defer data to the transfer state --> 
          @defer (hydrate on interaction) {
            <dep />
          }
      `,
      })
      class SimpleComponent {
        constructor() {
          // This is adds a data to the transfer state.
          inject(TransferState).set<string>(makeStateKey('test'), 'testitest');
        }
      }

      const appId = 'custom-app-id';
      const providers = [{provide: APP_ID, useValue: appId}];
      const hydrationFeatures = () => [withIncrementalHydration(), withEventReplay()];

      const html = await ssr(SimpleComponent, {envProviders: providers, hydrationFeatures});
      const transferCacheJson = getHydrationInfoFromTransferState(html)!;

      // getTransferState reaches into the DOM to retrieve the transfer state.
      // So we need to set the document with the generated HTML.
      const {document} = domino.createWindow(html);
      setDocument(document);
      const transferState = getTransferState(Injector.create({providers}));

      // The transfer state also contains internal hydration keys,
      expect(Object.keys(transferState).length).not.toEqual(JSON.parse(transferCacheJson).length);

      // We only retrieve the public data from the transfer state.
      expect(Object.keys(transferState)).toEqual(['test']);
    });
  });
});

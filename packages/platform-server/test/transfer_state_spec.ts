/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, makeStateKey, NgModule, TransferState} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {renderModule, ServerModule} from '@angular/platform-server';

describe('transfer_state', () => {
  const defaultExpectedOutput =
      '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</app><script id="ng-state" type="application/json">{&q;test&q;:10}</script></body></html>';

  it('adds transfer script tag when using renderModule', async () => {
    const STATE_KEY = makeStateKey<number>('test');

    @Component({selector: 'app', template: 'Works!'})
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
    class TransferStoreModule {
    }

    const output = await renderModule(TransferStoreModule, {document: '<app></app>'});
    expect(output).toBe(defaultExpectedOutput);
  });

  it('cannot break out of <script> tag in serialized output', async () => {
    const STATE_KEY = makeStateKey<string>('testString');

    @Component({selector: 'esc-app', template: 'Works!'})
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
    class EscapedTransferStoreModule {
    }

    const output =
        await renderModule(EscapedTransferStoreModule, {document: '<esc-app></esc-app>'});
    expect(output).toBe(
        '<html><head></head><body><esc-app ng-version="0.0.0-PLACEHOLDER" ng-server-context="other">Works!</esc-app>' +
        '<script id="ng-state" type="application/json">' +
        '{&q;testString&q;:&q;&l;/script&g;&l;script&g;' +
        'alert(&s;Hello&a;&s; + \\&q;World\\&q;);&q;}</script></body></html>');
  });

  it('adds transfer script tag when setting state during onSerialize', async () => {
    const STATE_KEY = makeStateKey<number>('test');

    @Component({selector: 'app', template: 'Works!'})
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
    class TransferStoreModule {
    }

    const output = await renderModule(TransferStoreModule, {document: '<app></app>'});
    expect(output).toBe(defaultExpectedOutput);
  });
});

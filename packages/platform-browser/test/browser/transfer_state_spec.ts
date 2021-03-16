/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, BrowserTransferStateModule, TransferState} from '@angular/platform-browser';
import {escapeHtml, makeStateKey, unescapeHtml} from '@angular/platform-browser/src/browser/transfer_state';

(function() {
function removeScriptTag(doc: Document, id: string) {
  const existing = doc.getElementById(id);
  if (existing) {
    doc.body.removeChild(existing);
  }
}

function addScriptTag(doc: Document, appId: string, data: {}) {
  const script = doc.createElement('script');
  const id = appId + '-state';
  script.id = id;
  script.setAttribute('type', 'application/json');
  script.textContent = escapeHtml(JSON.stringify(data));

  // Remove any stale script tags.
  removeScriptTag(doc, id);

  doc.body.appendChild(script);
}

describe('TransferState', () => {
  const APP_ID = 'test-app';
  let doc: Document;

  const TEST_KEY = makeStateKey<number>('test');
  const BOOLEAN_KEY = makeStateKey<boolean>('boolean');
  const DELAYED_KEY = makeStateKey<string>('delayed');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule.withServerTransition({appId: APP_ID}),
        BrowserTransferStateModule,
      ]
    });
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    removeScriptTag(doc, APP_ID + '-state');
  });

  it('is initialized from script tag', () => {
    addScriptTag(doc, APP_ID, {test: 10});
    const transferState: TransferState = TestBed.inject(TransferState);
    expect(transferState.get(TEST_KEY, 0)).toBe(10);
  });

  it('is initialized to empty state if script tag not found', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    expect(transferState.get(TEST_KEY, 0)).toBe(0);
  });

  it('supports adding new keys using set', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 20);
    expect(transferState.get(TEST_KEY, 0)).toBe(20);
    expect(transferState.hasKey(TEST_KEY)).toBe(true);
  });

  it('supports setting and accessing value \'0\' via get', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 0);
    expect(transferState.get(TEST_KEY, 20)).toBe(0);
    expect(transferState.hasKey(TEST_KEY)).toBe(true);
  });

  it('supports setting and accessing value \'false\' via get', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(BOOLEAN_KEY, false);
    expect(transferState.get(BOOLEAN_KEY, true)).toBe(false);
    expect(transferState.hasKey(BOOLEAN_KEY)).toBe(true);
  });

  it('supports setting and accessing value \'null\' via get', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, null);
    expect(transferState.get(TEST_KEY, 20 as any)).toBe(null);
    expect(transferState.hasKey(TEST_KEY)).toBe(true);
  });

  it('supports removing keys', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 20);
    transferState.remove(TEST_KEY);
    expect(transferState.get(TEST_KEY, 0)).toBe(0);
    expect(transferState.hasKey(TEST_KEY)).toBe(false);
  });

  it('supports serialization using toJson()', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 20);
    expect(transferState.toJson()).toBe('{"test":20}');
  });

  it('calls onSerialize callbacks when calling toJson()', () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 20);

    let value = 'initial';
    transferState.onSerialize(DELAYED_KEY, () => value);
    value = 'changed';

    expect(transferState.toJson()).toBe('{"test":20,"delayed":"changed"}');
  });
});

describe('escape/unescape', () => {
  it('works with all escaped characters', () => {
    const testString = '</script><script>alert(\'Hello&\' + "World");';
    const testObj = {testString};
    const escaped = escapeHtml(JSON.stringify(testObj));
    expect(escaped).toBe(
        '{&q;testString&q;:&q;&l;/script&g;&l;script&g;' +
        'alert(&s;Hello&a;&s; + \\&q;World\\&q;);&q;}');

    const unescapedObj = JSON.parse(unescapeHtml(escaped)) as {testString: string};
    expect(unescapedObj['testString']).toBe(testString);
  });
});
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_ID as APP_ID_TOKEN, PLATFORM_ID} from '../src/core';
import {TestBed} from '../testing';

import {getDocument} from '../src/render3/interfaces/document';
import {makeStateKey, TransferState} from '../src/transfer_state';

function removeScriptTag(doc: Document, id: string) {
  doc.getElementById(id)?.remove();
}

function addScriptTag(doc: Document, appId: string, data: object | string) {
  const script = doc.createElement('script');
  const id = appId + '-state';
  script.id = id;
  script.setAttribute('type', 'application/json');
  script.textContent = typeof data === 'string' ? data : JSON.stringify(data);

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
    doc = getDocument();
    TestBed.configureTestingModule({
      providers: [
        {provide: APP_ID_TOKEN, useValue: APP_ID},
        {provide: PLATFORM_ID, useValue: 'browser'},
      ],
    });
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

  it("supports setting and accessing value '0' via get", () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(TEST_KEY, 0);
    expect(transferState.get(TEST_KEY, 20)).toBe(0);
    expect(transferState.hasKey(TEST_KEY)).toBe(true);
  });

  it("supports setting and accessing value 'false' via get", () => {
    const transferState: TransferState = TestBed.inject(TransferState);
    transferState.set(BOOLEAN_KEY, false);
    expect(transferState.get(BOOLEAN_KEY, true)).toBe(false);
    expect(transferState.hasKey(BOOLEAN_KEY)).toBe(true);
  });

  it("supports setting and accessing value 'null' via get", () => {
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

  it('should provide an ability to detect whether the state is empty', () => {
    const transferState = TestBed.inject(TransferState);

    // The state is empty initially.
    expect(transferState.isEmpty).toBeTrue();

    transferState.set(TEST_KEY, 20);
    expect(transferState.isEmpty).toBeFalse();

    transferState.remove(TEST_KEY);
    expect(transferState.isEmpty).toBeTrue();
  });

  it('should encode `<` to avoid breaking out of <script> tag in serialized output', () => {
    const transferState = TestBed.inject(TransferState);

    // The state is empty initially.
    expect(transferState.isEmpty).toBeTrue();

    transferState.set(DELAYED_KEY, '</script><script>alert(\'Hello&\' + "World");');
    expect(transferState.toJson()).toBe(
      `{"delayed":"\\u003C/script>\\u003Cscript>alert('Hello&' + \\"World\\");"}`,
    );
  });

  it('should decode `\\u003C` (<) when restoring stating', () => {
    const encodedState = `{"delayed":"\\u003C/script>\\u003Cscript>alert('Hello&' + \\"World\\");"}`;
    addScriptTag(doc, APP_ID, encodedState);
    const transferState = TestBed.inject(TransferState);

    expect(transferState.toJson()).toBe(encodedState);
    expect(transferState.get(DELAYED_KEY, null)).toBe(
      '</script><script>alert(\'Hello&\' + "World");',
    );
  });
});

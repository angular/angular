/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Contains the business logic for
 * change detection data streaming used for displaying
 * CD info in the directive explorer.
 */

import {CdElementData, Events, MessageBus} from '../../../../../protocol';
import {CdAnalyzer, CdData, getCdAnalyzer} from './analyzer';

// State of change detection data streaming
let isCdDataStreamEnabled = false;
let cdAnalyzerUnsubscriber: (() => void) | undefined;
let cdAnalyzerDispose: (() => void) | undefined;

export function enableCdDataStream(messageBus: MessageBus<Events>) {
  return () => {
    if (!isCdDataStreamEnabled) {
      const {analyzer, disposeFn} = getCdAnalyzer();
      cdAnalyzerDispose = disposeFn;
      emitLatestCdData(analyzer, messageBus);
    }
    isCdDataStreamEnabled = true;
  };
}

export function disableCdDataStream() {
  cdAnalyzerUnsubscriber?.();
  cdAnalyzerDispose?.();
  isCdDataStreamEnabled = false;
}

function emitLatestCdData(cdAnalyzer: CdAnalyzer, messageBus: MessageBus<Events>) {
  cdAnalyzerUnsubscriber = cdAnalyzer.onCycle((_, all) => {
    const serializedData = serializeCdData(all);
    messageBus.emit('latestCdData', [serializedData]);
  });
}

function serializeCdData(data: CdData[]): CdElementData[] {
  return data.map((value) => ({
    element: value.elementPosition,
    cdCount: value.cdPassDurations.length,
    lastCdPassDuration: value.cdPassDurations[value.cdPassDurations.length - 1] ?? 0,
  }));
}

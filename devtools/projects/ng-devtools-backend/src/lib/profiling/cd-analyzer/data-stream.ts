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
import {CdAnalyzer, CdData, getCdAnalyzer, gracefullyDisposeAnalyzer} from './analyzer';

// State of change detection data streaming
let isCdDataStreamEnabled = false;
let cdAnalyzerUnsubscriber: (() => void) | undefined;

const ANALYZER_CONSUMER_KEY = 'cd-data-stream';

export function enableCdDataStream(messageBus: MessageBus<Events>) {
  return () => {
    if (!isCdDataStreamEnabled) {
      emitLatestCdData(getCdAnalyzer(ANALYZER_CONSUMER_KEY), messageBus);
    }
    isCdDataStreamEnabled = true;
  };
}

export function disableCdDataStream() {
  cdAnalyzerUnsubscriber?.();
  gracefullyDisposeAnalyzer(ANALYZER_CONSUMER_KEY);
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
    cdPassDurations: value.cdPassDurations,
  }));
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgQueryDefinition, QueryTiming} from '../angular/query-definition';

export interface TimingStrategy {
  /** Sets up the given strategy. Throws if the strategy could not be set up. */
  setup(): void;
  /** Detects the timing result for a given query. */
  detectTiming(query: NgQueryDefinition): TimingResult;
}

export type TimingResult = {
  timing: QueryTiming|null;
  message?: string;
};

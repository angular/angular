/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgQueryDefinition} from '../../angular/query-definition';
import {TimingResult, TimingStrategy} from '../timing-strategy';

/**
 * Query timing strategy that is used for queries used within test files. The query
 * timing is not analyzed for test files as the template strategy cannot work within
 * spec files (due to missing component modules) and the usage strategy is not capable
 * of detecting the timing of queries based on how they are used in tests.
 */
export class QueryTestStrategy implements TimingStrategy {
  setup() {}

  /**
   * Detects the timing for a given query. For queries within tests, we always
   * add a TODO and print a message saying that the timing can't be detected for tests.
   */
  detectTiming(query: NgQueryDefinition): TimingResult {
    return {timing: null, message: 'Timing within tests cannot be detected.'};
  }
}

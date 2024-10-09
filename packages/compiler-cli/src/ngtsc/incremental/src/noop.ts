/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {IncrementalBuild} from '../api';

export const NOOP_INCREMENTAL_BUILD: IncrementalBuild<any, any> = {
  priorAnalysisFor: () => null,
  priorTypeCheckingResultsFor: () => null,
  recordSuccessfulTypeCheck: () => {},
};

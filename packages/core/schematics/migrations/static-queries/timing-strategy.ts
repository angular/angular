/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgQueryDefinition, QueryTiming} from './angular/query-definition';

export interface TimingStrategy { detectTiming(query: NgQueryDefinition): QueryTiming; }

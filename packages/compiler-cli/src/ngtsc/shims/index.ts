/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

export {TypeCheckShimGenerator} from '../typecheck/src/shim';
export {PerFileShimGenerator, TopLevelShimGenerator} from './api';
export {FactoryGenerator, FactoryInfo, FactoryTracker, generatedFactoryTransform} from './src/factory_generator';
export {SummaryGenerator} from './src/summary_generator';

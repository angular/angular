/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

export {ShimAdapter} from './src/adapter.js';
export {copyFileShimData, isShim, retagAllTsFiles, retagTsFile, sfExtensionData, untagAllTsFiles, untagTsFile} from './src/expando.js';
export {FactoryGenerator, generatedFactoryTransform} from './src/factory_generator.js';
export {ShimReferenceTagger} from './src/reference_tagger.js';
export {SummaryGenerator} from './src/summary_generator.js';

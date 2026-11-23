/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {AbsoluteSourceSpan} from '../src/expression_parser/ast';
export * from '../src/indexer/api';
export {type IndexerComponentInfo, IndexingContext} from '../src/indexer/context';
export {getIndexerTemplateIdentifiers, IndexerVisitor} from '../src/indexer/template';
export {generateIndexerAnalysis} from '../src/indexer/transform';

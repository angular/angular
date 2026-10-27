/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TODO(crisbeto): temporarily re-exported. The indexer lives in `@angular/compiler`. Its symbols
// are re-exported here for existing consumers, with renamed symbols aliased to their previous names.
export {
  AbsoluteSourceSpan,
  IdentifierKind,
  IndexingContext,
  generateIndexerAnalysis as generateAnalysis,
  getIndexerTemplateIdentifiers as getTemplateIdentifiers,
  type AbstractBoundTemplate,
  type AttributeIdentifier,
  type BoundAttributeIdentifier,
  type ComponentNodeIdentifier,
  type DirectiveHostIdentifier,
  type DirectiveNodeIdentifier,
  type ElementIdentifier,
  type IndexedComponent,
  type IndexerComponentInfo as ComponentInfo,
  type LetDeclarationIdentifier,
  type MethodIdentifier,
  type NodeAdapter,
  type PipeIdentifier,
  type PropertyIdentifier,
  type ReferenceIdentifier,
  type TemplateIdentifier,
  type TemplateNodeIdentifier,
  type TopLevelIdentifier,
  type VariableIdentifier,
} from '@angular/compiler';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {EntryType} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractGenerics} from './generics_extractor';

/** Extract the documentation entry for a type alias. */
export function extractTypeAlias(declaration: ts.TypeAliasDeclaration) {
  // TODO: this does not yet resolve type queries (`typeof`). We may want to
  //     fix this eventually, but for now it does not appear that any type aliases in
  //     Angular's public API rely on this.

  return {
    name: declaration.name.getText(),
    type: declaration.type.getText(),
    entryType: EntryType.TypeAlias,
    generics: extractGenerics(declaration),
    rawComment: extractRawJsDoc(declaration),
    description: extractJsDocDescription(declaration),
    jsdocTags: extractJsDocTags(declaration),
  };
}

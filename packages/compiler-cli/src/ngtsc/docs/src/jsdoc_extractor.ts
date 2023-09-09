/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {JsDocTagEntry} from './entities';


/** Gets the set of JsDoc tags applied to a node. */
export function extractJsDocTags(node: ts.HasJSDoc): JsDocTagEntry[] {
  return ts.getJSDocTags(node).map(t => ({
                                     name: t.tagName.getText(),
                                     comment: ts.getTextOfJSDocComment(t.comment) ?? '',
                                   }));
}

/**
 * Gets the JsDoc description for a node. If the node does not have
 * a description, returns the empty string.
 */
export function extractJsDocDescription(node: ts.HasJSDoc): string {
  // If the node is a top-level statement (const, class, function, etc.), we will get
  // a `ts.JSDoc` here. If the node is a `ts.ParameterDeclaration`, we will get
  // a `ts.JSDocParameterTag`.
  const commentOrTag = ts.getJSDocCommentsAndTags(node).find(d => {
    return ts.isJSDoc(d) || ts.isJSDocParameterTag(d);
  });

  const comment = commentOrTag?.comment ?? '';
  return typeof comment === 'string' ? comment : ts.getTextOfJSDocComment(comment) ?? '';
}

/**
 * Gets the raw JsDoc applied to a node. If the node does not have a JsDoc block,
 * returns the empty string.
 */
export function extractRawJsDoc(node: ts.HasJSDoc): string {
  // Assume that any node has at most one JsDoc block.
  return ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.getFullText() ?? '';
}

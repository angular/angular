/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {JsDocTagEntry} from './entities';

/**
 * RegExp to match the `@` character follow by any Angular decorator, used to escape Angular
 * decorators in JsDoc blocks so that they're not parsed as JsDoc tags.
 */
const decoratorExpression =
  /@(?=(Injectable|Component|Directive|Pipe|NgModule|Input|Output|HostBinding|HostListener|Inject|Optional|Self|Host|SkipSelf|ViewChild|ViewChildren|ContentChild|ContentChildren))/g;

/** Gets the set of JsDoc tags applied to a node. */
export function extractJsDocTags(node: ts.HasJSDoc): JsDocTagEntry[] {
  const escapedNode = getEscapedNode(node);

  return ts.getJSDocTags(escapedNode).map((t) => {
    return {
      name: t.tagName.getText(),
      comment: unescapeAngularDecorators(ts.getTextOfJSDocComment(t.comment) ?? ''),
    };
  });
}

/**
 * Gets the JsDoc description for a node. If the node does not have
 * a description, returns the empty string.
 */
export function extractJsDocDescription(node: ts.HasJSDoc): string {
  const escapedNode = getEscapedNode(node);

  // If the node is a top-level statement (const, class, function, etc.), we will get
  // a `ts.JSDoc` here. If the node is a `ts.ParameterDeclaration`, we will get
  // a `ts.JSDocParameterTag`.
  const commentOrTag = ts.getJSDocCommentsAndTags(escapedNode).find((d) => {
    return ts.isJSDoc(d) || ts.isJSDocParameterTag(d);
  });

  const comment = commentOrTag?.comment ?? '';
  const description =
    typeof comment === 'string' ? comment : (ts.getTextOfJSDocComment(comment) ?? '');

  return unescapeAngularDecorators(description);
}

/**
 * Gets the raw JsDoc applied to a node.
 * If the node does not have a JsDoc block, returns the empty string.
 */
export function extractRawJsDoc(node: ts.HasJSDoc): string {
  // Assume that any node has at most one JsDoc block.
  const comment = ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc)?.getFullText() ?? '';
  return unescapeAngularDecorators(comment);
}

/**
 * Gets an "escaped" version of the node by copying its raw JsDoc into a new source file
 * on top of a dummy class declaration. For the purposes of JsDoc extraction, we don't actually
 * care about the node itself, only its JsDoc block.
 */
function getEscapedNode(node: ts.HasJSDoc): ts.HasJSDoc {
  // TODO(jelbourn): It's unclear whether we need to escape @param JsDoc, since they're unlikely
  //    to have an Angular decorator on the beginning of a line. If we do need to escape them,
  //    it will require some more complicated copying below.
  if (ts.isParameter(node)) {
    return node;
  }

  const rawComment = extractRawJsDoc(node);
  const escaped = escapeAngularDecorators(rawComment);
  const file = ts.createSourceFile('x.ts', `${escaped}class X {}`, ts.ScriptTarget.ES2020, true);
  return file.statements.find((s) => ts.isClassDeclaration(s)) as ts.ClassDeclaration;
}

/** Escape the `@` character for Angular decorators. */
function escapeAngularDecorators(comment: string): string {
  return comment.replace(decoratorExpression, '_NG_AT_');
}

/** Unescapes the `@` character for Angular decorators. */
function unescapeAngularDecorators(comment: string): string {
  return comment.replace(/_NG_AT_/g, '@');
}

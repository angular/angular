/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ParsedTemplate,
  TmplAstElement,
  TmplAstNode,
  parseTemplate as parseTemplateUsingCompiler,
} from '@angular/compiler';

/**
 * Traverses the given tree of nodes and runs the given callbacks for each Element node encountered.
 *
 * Note that updates to the start tags of html element should be done in the postorder callback,
 * and updates to the end tags of html elements should be done in the preorder callback to avoid
 * issues with line collisions.
 *
 * @param nodes The nodes of the ast from a parsed template.
 * @param preorderCallback A function that gets run for each Element node in a preorder traversal.
 * @param postorderCallback A function that gets run for each Element node in a postorder traversal.
 */
export function visitElements(
  nodes: TmplAstNode[],
  preorderCallback: (node: TmplAstElement) => void = () => {},
  postorderCallback: (node: TmplAstElement) => void = () => {},
): void {
  nodes.reverse();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node instanceof TmplAstElement) {
      preorderCallback(node);
      visitElements(node.children, preorderCallback, postorderCallback);
      postorderCallback(node);
    }
  }
}

/**
 * A wrapper for the Angular compilers parseTemplate, which passes the correct options to ensure
 * the parsed template is accurate.
 *
 * For more details, see https://github.com/angular/angular/blob/4332897baa2226ef246ee054fdd5254e3c129109/packages/compiler-cli/src/ngtsc/annotations/component/src/resources.ts#L230.
 *
 * @param html text of the template to parse
 * @param filePath URL to use for source mapping of the parsed template
 * @returns the updated template html.
 */
export function parseTemplate(template: string, templateUrl: string = ''): ParsedTemplate {
  return parseTemplateUsingCompiler(template, templateUrl, {
    preserveWhitespaces: true,
    preserveLineEndings: true,
    leadingTriviaChars: [],
  });
}

/**
 * Replaces the start tag of the given Element node inside of the html document with a new tag name.
 *
 * @param html The full html document.
 * @param node The Element node to be updated.
 * @param tag A new tag name.
 * @returns an updated html document.
 */
export function replaceStartTag(html: string, node: TmplAstElement, tag: string): string {
  return replaceAt(html, node.startSourceSpan.start.offset + 1, node.name, tag);
}

/**
 * Replaces the end tag of the given Element node inside of the html document with a new tag name.
 *
 * @param html The full html document.
 * @param node The Element node to be updated.
 * @param tag A new tag name.
 * @returns an updated html document.
 */
export function replaceEndTag(html: string, node: TmplAstElement, tag: string): string {
  if (!node.endSourceSpan) {
    return html;
  }
  return replaceAt(html, node.endSourceSpan.start.offset + 2, node.name, tag);
}

/**
 * Appends an attribute to the given node of the template html.
 *
 * @param html The template html to be updated.
 * @param node The node to be updated.
 * @param name The name of the attribute.
 * @param value The value of the attribute.
 * @returns The updated template html.
 */
export function addAttribute(
  html: string,
  node: TmplAstElement,
  name: string,
  value: string,
): string {
  const existingAttr = node.attributes.find(currentAttr => currentAttr.name === name);

  if (existingAttr) {
    // If the attribute has a value already, replace it.
    if (existingAttr.valueSpan) {
      return (
        html.slice(0, existingAttr.valueSpan.start.offset) +
        value +
        html.slice(existingAttr.valueSpan.end.offset)
      );
    } else if (existingAttr.keySpan) {
      // Otherwise add a value to a value-less attribute. Note that the `keySpan` null check is
      // only necessary for the compiler. Technically an attribute should always have a key.
      return (
        html.slice(0, existingAttr.keySpan.end.offset) +
        `="${value}"` +
        html.slice(existingAttr.keySpan.end.offset)
      );
    }
  }

  // Otherwise insert a new attribute.
  const index = node.startSourceSpan.start.offset + node.name.length + 1;
  const prefix = html.slice(0, index);
  const suffix = html.slice(index);

  if (node.startSourceSpan.start.line === node.startSourceSpan.end.line) {
    return prefix + ` ${name}="${value}"` + suffix;
  }

  const attr = node.attributes[0];
  const ctx = attr.sourceSpan.start.getContext(attr.sourceSpan.start.col + 1, 1)!;
  const indentation = ctx.before;

  return prefix + indentation + `${name}="${value}"` + suffix;
}

/**
 * Replaces a substring of a given string starting at some offset index.
 *
 * @param str A string to be updated.
 * @param offset An offset index to start at.
 * @param oldSubstr The old substring to be replaced.
 * @param newSubstr A new substring.
 * @returns the updated string.
 */
function replaceAt(str: string, offset: number, oldSubstr: string, newSubstr: string): string {
  const index = offset;
  const prefix = str.slice(0, index);
  const suffix = str.slice(index + oldSubstr.length);
  return prefix + newSubstr + suffix;
}

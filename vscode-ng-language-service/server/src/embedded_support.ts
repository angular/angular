/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript';

/**
 * Takes a TS file and strips out all non-inline template content.
 *
 * This process is the same as what's done in the VSCode example for embedded languages.
 *
 * Note that the example below implements the support on the client side. This is done on the server
 * side to enable language services in other editors to take advantage of this feature by depending
 * on the @angular/language-server package.
 *
 * @see https://github.com/microsoft/vscode-extension-samples/blob/fdd3bb95ce8e38ffe58fc9158797239fdf5017f1/lsp-embedded-request-forwarding/client/src/embeddedSupport.ts#L131-L141
 * @see https://code.visualstudio.com/api/language-extensions/embedded-languages
 */
export function getHTMLVirtualContent(sf: ts.SourceFile): string {
  const inlineTemplateNodes: ts.Node[] = findAllMatchingNodes(sf, isInlineTemplateNode);
  const documentText = sf.text;

  // Create a blank document with same text length
  let content = documentText
    .split('\n')
    .map((line) => {
      return ' '.repeat(line.length);
    })
    .join('\n');

  // add back all the inline template regions in-place
  for (const region of inlineTemplateNodes) {
    content =
      content.slice(0, region.getStart(sf) + 1) +
      documentText.slice(region.getStart(sf) + 1, region.getEnd() - 1) +
      content.slice(region.getEnd() - 1);
  }
  return content;
}

/**
 * Takes a TS file and strips out all non-inline style content.
 *
 * @see {@link getHTMLVirtualContent}
 */
export function getSCSSVirtualContent(sf: ts.SourceFile): string {
  const inlineStyleNodes: ts.Node[] = findAllMatchingNodes(sf, isInlineStyleNode);
  const documentText = sf.text;

  // Create a blank document with same text length
  let content = documentText
    .split('\n')
    .map((line) => {
      return ' '.repeat(line.length);
    })
    .join('\n');

  // add back all the inline style regions in-place
  for (const region of inlineStyleNodes) {
    content =
      content.slice(0, region.getStart(sf) + 1) +
      documentText.slice(region.getStart(sf) + 1, region.getEnd() - 1) +
      content.slice(region.getEnd() - 1);
  }
  return content;
}

export function getCSSVirtualContent(sf: ts.SourceFile): string {
  const inlineStyleNodes: ts.Node[] = findAllMatchingNodes(sf, isTemplateStyleNode);
  const documentText = sf.text;

  let content = documentText
    .split('\n')
    .map((line) => {
      return ' '.repeat(line.length);
    })
    .join('\n');

  for (const region of inlineStyleNodes) {
    const templateContent = documentText.slice(region.getStart(sf) + 1, region.getEnd() - 1);
    const cssContent = extractComponentStyleBindings(templateContent);
    content =
      content.slice(0, region.getStart(sf) + 1) + cssContent + content.slice(region.getEnd() - 1);
  }
  return content;
}

function extractComponentStyleBindings(templateContent: string): string {
  const styleRegex = /\[style\]\s*=\s*(['"])\s*\{/g;
  // Initialize result with spaces but PRESERVE newlines to maintain line mapping
  let result = templateContent.replace(/[^\n\r]/g, ' ');

  let match;
  while ((match = styleRegex.exec(templateContent)) !== null) {
    const startObj = match.index + match[0].length; // index after `{`
    // find balancing `}`
    let braceCount = 1;
    let i = startObj;
    for (; i < templateContent.length; i++) {
      if (templateContent[i] === '{') {
        braceCount++;
      } else if (templateContent[i] === '}') {
        braceCount--;
      }
      if (braceCount === 0) {
        break;
      }
    }

    if (braceCount === 0) {
      const endObj = i;
      // We want to replace `[style]="{` with `       a { `
      const prefixLen = match[0].length;
      // Use * (universal selector) to avoid polluting completion list with class names
      // and to ensure we are in a rule block.
      const selectorStr = ' * {';
      const filler = ' '.repeat(prefixLen - selectorStr.length) + selectorStr;

      const prefixStart = match.index;

      // Write filler into result
      result =
        result.substring(0, prefixStart) + filler + result.substring(prefixStart + filler.length);

      // Copy object content and blank out quotes on keys
      let objContent = templateContent.substring(startObj, endObj);

      // Transform content to be more CSS-like:
      // 1. Replace quotes with spaces (so keys become identifiers)
      // 2. Replace top-level commas with semicolons (so key-values become declarations)
      let transformedContent = '';
      let parenDepth = 0;
      for (let j = 0; j < objContent.length; j++) {
        const char = objContent[j];
        if (char === "'" || char === '"') {
          transformedContent += ' ';
        } else if (char === '(') {
          parenDepth++;
          transformedContent += char;
        } else if (char === ')') {
          if (parenDepth > 0) parenDepth--;
          transformedContent += char;
        } else if (char === ',' && parenDepth === 0) {
          transformedContent += ';';
        } else {
          transformedContent += char;
        }
      }
      objContent = transformedContent;

      result =
        result.substring(0, startObj) + objContent + result.substring(startObj + objContent.length);

      // Add closing brace
      const closingBrace = '}';
      result = result.substring(0, endObj) + closingBrace + result.substring(endObj + 1);
    }
  }
  return result;
}

export function isTemplateStyleNode(node: ts.Node) {
  if (!ts.isStringLiteralLike(node)) {
    return false;
  }
  return isAssignmentToPropertyWithName(node, 'template');
}

export function isInlineStyleNode(node: ts.Node) {
  if (!ts.isStringLiteralLike(node)) {
    return false;
  }

  if (isAssignmentToPropertyWithName(node, 'styles')) {
    return true;
  }

  if (
    node.parent &&
    ts.isArrayLiteralExpression(node.parent) &&
    isAssignmentToPropertyWithName(node.parent, 'styles')
  ) {
    return true;
  }

  return false;
}

function isAssignmentToPropertyWithName(node: ts.Node, propertyName: 'styles' | 'template') {
  const assignment = getPropertyAssignmentFromValue(node, propertyName);
  return assignment !== null && getClassDeclFromDecoratorProp(assignment) !== null;
}

function isInlineTemplateNode(node: ts.Node) {
  return ts.isStringLiteralLike(node) ? isAssignmentToPropertyWithName(node, 'template') : false;
}

/**
 * Returns a property assignment from the assignment value if the property name
 * matches the specified `key`, or `null` if there is no match.
 */
export function getPropertyAssignmentFromValue(
  value: ts.Node,
  key: string,
): ts.PropertyAssignment | null {
  const propAssignment = value.parent;
  if (
    !propAssignment ||
    !ts.isPropertyAssignment(propAssignment) ||
    propAssignment.name.getText() !== key
  ) {
    return null;
  }
  return propAssignment;
}

/**
 * Given a decorator property assignment, return the ClassDeclaration node that corresponds to the
 * directive class the property applies to.
 * If the property assignment is not on a class decorator, no declaration is returned.
 *
 * For example,
 *
 * @Component({
 *   template: '<div></div>'
 *   ^^^^^^^^^^^^^^^^^^^^^^^---- property assignment
 * })
 * class AppComponent {}
 *           ^---- class declaration node
 *
 * @param propAsgnNode property assignment
 */
export function getClassDeclFromDecoratorProp(
  propAsgnNode: ts.PropertyAssignment,
): ts.ClassDeclaration | undefined {
  if (!propAsgnNode.parent || !ts.isObjectLiteralExpression(propAsgnNode.parent)) {
    return;
  }
  const objLitExprNode = propAsgnNode.parent;
  if (!objLitExprNode.parent || !ts.isCallExpression(objLitExprNode.parent)) {
    return;
  }
  const callExprNode = objLitExprNode.parent;
  if (!callExprNode.parent || !ts.isDecorator(callExprNode.parent)) {
    return;
  }
  const decorator = callExprNode.parent;
  if (!decorator.parent || !ts.isClassDeclaration(decorator.parent)) {
    return;
  }
  const classDeclNode = decorator.parent;
  return classDeclNode;
}

export function findAllMatchingNodes(
  sf: ts.SourceFile,
  filter: (node: ts.Node) => boolean,
): ts.Node[] {
  const results: ts.Node[] = [];
  const stack: ts.Node[] = [sf];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (filter(node)) {
      results.push(node);
    } else {
      stack.push(...node.getChildren());
    }
  }

  return results;
}

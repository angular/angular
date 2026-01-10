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

function isInlineTemplateNode(node: ts.Node) {
  const assignment = getPropertyAssignmentFromValue(node, 'template');
  return (
    ts.isStringLiteralLike(node) &&
    assignment !== null &&
    getClassDeclFromDecoratorProp(assignment) !== null
  );
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

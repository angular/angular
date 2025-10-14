'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.getHTMLVirtualContent = getHTMLVirtualContent;
exports.getPropertyAssignmentFromValue = getPropertyAssignmentFromValue;
exports.getClassDeclFromDecoratorProp = getClassDeclFromDecoratorProp;
exports.findAllMatchingNodes = findAllMatchingNodes;
const ts = __importStar(require('typescript'));
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
function getHTMLVirtualContent(sf) {
  const inlineTemplateNodes = findAllMatchingNodes(sf, isInlineTemplateNode);
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
function isInlineTemplateNode(node) {
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
function getPropertyAssignmentFromValue(value, key) {
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
function getClassDeclFromDecoratorProp(propAsgnNode) {
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
function findAllMatchingNodes(sf, filter) {
  const results = [];
  const stack = [sf];
  while (stack.length > 0) {
    const node = stack.pop();
    if (filter(node)) {
      results.push(node);
    } else {
      stack.push(...node.getChildren());
    }
  }
  return results;
}
//# sourceMappingURL=embedded_support.js.map

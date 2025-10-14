/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
export declare function getHTMLVirtualContent(sf: ts.SourceFile): string;
/**
 * Returns a property assignment from the assignment value if the property name
 * matches the specified `key`, or `null` if there is no match.
 */
export declare function getPropertyAssignmentFromValue(value: ts.Node, key: string): ts.PropertyAssignment | null;
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
export declare function getClassDeclFromDecoratorProp(propAsgnNode: ts.PropertyAssignment): ts.ClassDeclaration | undefined;
export declare function findAllMatchingNodes(sf: ts.SourceFile, filter: (node: ts.Node) => boolean): ts.Node[];

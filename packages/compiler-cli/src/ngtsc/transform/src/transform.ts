/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {IvyCompilation} from './compilation';
import {ImportManager, translateExpression} from './translator';

export function ivyTransformFactory(compilation: IvyCompilation):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return transformIvySourceFile(compilation, context, file);
    };
  };
}

/**
 * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
 */
function transformIvySourceFile(
    compilation: IvyCompilation, context: ts.TransformationContext,
    file: ts.SourceFile): ts.SourceFile {
  const importManager = new ImportManager();

  // Recursively scan through the AST and perform any updates requested by the IvyCompilation.
  const sf = visitNode(file);

  // Generate the import statements to prepend.
  const imports = importManager.getAllImports().map(
      i => ts.createImportDeclaration(
          undefined, undefined,
          ts.createImportClause(undefined, ts.createNamespaceImport(ts.createIdentifier(i.as))),
          ts.createLiteral(i.name)));

  // Prepend imports if needed.
  if (imports.length > 0) {
    sf.statements = ts.createNodeArray([...imports, ...sf.statements]);
  }
  return sf;

  // Helper function to process a class declaration.
  function visitClassDeclaration(node: ts.ClassDeclaration): ts.ClassDeclaration {
    // Determine if this class has an Ivy field that needs to be added, and compile the field
    // to an expression if so.
    const res = compilation.compileIvyFieldFor(node);
    if (res !== undefined) {
      // There is a field to add. Translate the initializer for the field into TS nodes.
      const exprNode = translateExpression(res.initializer, importManager);

      // Create a static property declaration for the new field.
      const property = ts.createProperty(
          undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], res.field, undefined, undefined,
          exprNode);

      // Replace the class declaration with an updated version.
      node = ts.updateClassDeclaration(
          node,
          // Remove the decorator which triggered this compilation, leaving the others alone.
          maybeFilterDecorator(node.decorators, compilation.ivyDecoratorFor(node) !),
          node.modifiers, node.name, node.typeParameters, node.heritageClauses || [],
          [...node.members, property]);
    }

    // Recurse into the class declaration in case there are nested class declarations.
    return ts.visitEachChild(node, child => visitNode(child), context);
  }

  // Helper function that recurses through the nodes and processes each one.
  function visitNode<T extends ts.Node>(node: T): T;
  function visitNode(node: ts.Node): ts.Node {
    if (ts.isClassDeclaration(node)) {
      return visitClassDeclaration(node);
    } else {
      return ts.visitEachChild(node, child => visitNode(child), context);
    }
  }
}
function maybeFilterDecorator(
    decorators: ts.NodeArray<ts.Decorator>| undefined,
    toRemove: ts.Decorator): ts.NodeArray<ts.Decorator>|undefined {
  if (decorators === undefined) {
    return undefined;
  }
  const filtered = decorators.filter(dec => ts.getOriginalNode(dec) !== toRemove);
  if (filtered.length === 0) {
    return undefined;
  }
  return ts.createNodeArray(filtered);
}

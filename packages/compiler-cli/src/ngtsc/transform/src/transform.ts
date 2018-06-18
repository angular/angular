/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {VisitListEntryResult, Visitor, visit} from '../../util/src/visitor';

import {CompileResult} from './api';
import {IvyCompilation} from './compilation';
import {ImportManager, translateExpression, translateStatement} from './translator';

export function ivyTransformFactory(compilation: IvyCompilation):
    ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return transformIvySourceFile(compilation, context, file);
    };
  };
}

class IvyVisitor extends Visitor {
  constructor(private compilation: IvyCompilation, private importManager: ImportManager) {
    super();
  }

  visitClassDeclaration(node: ts.ClassDeclaration):
      VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    // Determine if this class has an Ivy field that needs to be added, and compile the field
    // to an expression if so.
    const res = this.compilation.compileIvyFieldFor(node);

    if (res !== undefined) {
      // There is at least one field to add.
      const statements: ts.Statement[] = [];
      const members = [...node.members];

      res.forEach(field => {
        // Translate the initializer for the field into TS nodes.
        const exprNode = translateExpression(field.initializer, this.importManager);

        // Create a static property declaration for the new field.
        const property = ts.createProperty(
            undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], field.name, undefined,
            undefined, exprNode);

        field.statements.map(stmt => translateStatement(stmt, this.importManager))
            .forEach(stmt => statements.push(stmt));

        members.push(property);
      });

      // Replace the class declaration with an updated version.
      node = ts.updateClassDeclaration(
          node,
          // Remove the decorator which triggered this compilation, leaving the others alone.
          maybeFilterDecorator(
              node.decorators, this.compilation.ivyDecoratorFor(node) !.node as ts.Decorator),
          node.modifiers, node.name, node.typeParameters, node.heritageClauses || [], members);
      return {node, before: statements};
    }

    return {node};
  }
}

/**
 * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
 */
function transformIvySourceFile(
    compilation: IvyCompilation, context: ts.TransformationContext,
    file: ts.SourceFile): ts.SourceFile {
  const importManager = new ImportManager();

  // Recursively scan through the AST and perform any updates requested by the IvyCompilation.
  const sf = visit(file, new IvyVisitor(compilation, importManager), context);

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

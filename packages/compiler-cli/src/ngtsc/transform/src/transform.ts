/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator, ReflectionHost} from '../../host';
import {relativePathBetween} from '../../util/src/path';
import {VisitListEntryResult, Visitor, visit} from '../../util/src/visitor';

import {CompileResult} from './api';
import {IvyCompilation} from './compilation';
import {ImportManager, translateExpression, translateStatement} from './translator';

const NO_DECORATORS = new Set<ts.Decorator>();

export function ivyTransformFactory(
    compilation: IvyCompilation, reflector: ReflectionHost,
    coreImportsFrom: ts.SourceFile | null): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return transformIvySourceFile(compilation, context, reflector, coreImportsFrom, file);
    };
  };
}

class IvyVisitor extends Visitor {
  constructor(
      private compilation: IvyCompilation, private reflector: ReflectionHost,
      private importManager: ImportManager, private isCore: boolean) {
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
          node.modifiers, node.name, node.typeParameters, node.heritageClauses || [],
          // Map over the class members and remove any Angular decorators from them.
          members.map(member => this._stripAngularDecorators(member)));
      return {node, before: statements};
    }

    return {node};
  }

  /**
   * Return all decorators on a `Declaration` which are from @angular/core, or an empty set if none
   * are.
   */
  private _angularCoreDecorators(decl: ts.Declaration): Set<ts.Decorator> {
    const decorators = this.reflector.getDecoratorsOfDeclaration(decl);
    if (decorators === null) {
      return NO_DECORATORS;
    }
    const coreDecorators = decorators.filter(dec => this.isCore || isFromAngularCore(dec))
                               .map(dec => dec.node as ts.Decorator);
    if (coreDecorators.length > 0) {
      return new Set<ts.Decorator>(coreDecorators);
    } else {
      return NO_DECORATORS;
    }
  }

  /**
   * Given a `ts.Node`, filter the decorators array and return a version containing only non-Angular
   * decorators.
   *
   * If all decorators are removed (or none existed in the first place), this method returns
   * `undefined`.
   */
  private _nonCoreDecoratorsOnly(node: ts.Declaration): ts.NodeArray<ts.Decorator>|undefined {
    // Shortcut if the node has no decorators.
    if (node.decorators === undefined) {
      return undefined;
    }
    // Build a Set of the decorators on this node from @angular/core.
    const coreDecorators = this._angularCoreDecorators(node);

    if (coreDecorators.size === node.decorators.length) {
      // If all decorators are to be removed, return `undefined`.
      return undefined;
    } else if (coreDecorators.size === 0) {
      // If no decorators need to be removed, return the original decorators array.
      return node.decorators;
    }

    // Filter out the core decorators.
    const filtered = node.decorators.filter(dec => !coreDecorators.has(dec));

    // If no decorators survive, return `undefined`. This can only happen if a core decorator is
    // repeated on the node.
    if (filtered.length === 0) {
      return undefined;
    }

    // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
    const array = ts.createNodeArray(filtered);
    array.pos = node.decorators.pos;
    array.end = node.decorators.end;
    return array;
  }

  /**
   * Remove Angular decorators from a `ts.Node` in a shallow manner.
   *
   * This will remove decorators from class elements (getters, setters, properties, methods) as well
   * as parameters of constructors.
   */
  private _stripAngularDecorators<T extends ts.Node>(node: T): T {
    if (ts.isParameter(node)) {
      // Strip decorators from parameters (probably of the constructor).
      node = ts.updateParameter(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.dotDotDotToken,
                 node.name, node.questionToken, node.type, node.initializer) as T &
          ts.ParameterDeclaration;
    } else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
      // Strip decorators of methods.
      node = ts.updateMethod(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.asteriskToken,
                 node.name, node.questionToken, node.typeParameters, node.parameters, node.type,
                 node.body) as T &
          ts.MethodDeclaration;
    } else if (ts.isPropertyDeclaration(node) && node.decorators !== undefined) {
      // Strip decorators of properties.
      node = ts.updateProperty(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.questionToken, node.type, node.initializer) as T &
          ts.PropertyDeclaration;
    } else if (ts.isGetAccessor(node)) {
      // Strip decorators of getters.
      node = ts.updateGetAccessor(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.parameters, node.type, node.body) as T &
          ts.GetAccessorDeclaration;
    } else if (ts.isSetAccessor(node)) {
      // Strip decorators of setters.
      node = ts.updateSetAccessor(
                 node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name,
                 node.parameters, node.body) as T &
          ts.SetAccessorDeclaration;
    } else if (ts.isConstructorDeclaration(node)) {
      // For constructors, strip decorators of the parameters.
      const parameters = node.parameters.map(param => this._stripAngularDecorators(param));
      node =
          ts.updateConstructor(node, node.decorators, node.modifiers, parameters, node.body) as T &
          ts.ConstructorDeclaration;
    }
    return node;
  }
}

/**
 * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
 */
function transformIvySourceFile(
    compilation: IvyCompilation, context: ts.TransformationContext, reflector: ReflectionHost,
    coreImportsFrom: ts.SourceFile | null, file: ts.SourceFile): ts.SourceFile {
  const importManager = new ImportManager(coreImportsFrom !== null);

  // Recursively scan through the AST and perform any updates requested by the IvyCompilation.
  const sf = visit(
      file, new IvyVisitor(compilation, reflector, importManager, coreImportsFrom !== null),
      context);

  // Generate the import statements to prepend.
  const imports = importManager.getAllImports(file.fileName, coreImportsFrom).map(i => {
    return ts.createImportDeclaration(
        undefined, undefined,
        ts.createImportClause(undefined, ts.createNamespaceImport(ts.createIdentifier(i.as))),
        ts.createLiteral(i.name));
  });

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

function isFromAngularCore(decorator: Decorator): boolean {
  return decorator.import !== null && decorator.import.from === '@angular/core';
}

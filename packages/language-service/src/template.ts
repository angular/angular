/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from '@angular/compiler-cli';
import * as ts from 'typescript';

import {isAstResult} from './common';
import {createGlobalSymbolTable} from './global_symbols';
import * as ng from './types';
import {TypeScriptServiceHost} from './typescript_host';

/**
 * A base class to represent a template and which component class it is
 * associated with. A template source could answer basic questions about
 * top-level declarations of its class through the members() and query()
 * methods.
 */
abstract class BaseTemplate implements ng.TemplateSource {
  private readonly program: ts.Program;
  private membersTable: ng.SymbolTable|undefined;
  private queryCache: ng.SymbolQuery|undefined;

  constructor(
      private readonly host: TypeScriptServiceHost,
      private readonly classDeclNode: ts.ClassDeclaration,
      private readonly classSymbol: ng.StaticSymbol) {
    this.program = host.program;
  }

  abstract get span(): ng.Span;
  abstract get fileName(): string;
  abstract get source(): string;

  /**
   * Return the Angular StaticSymbol for the class that contains this template.
   */
  get type() { return this.classSymbol; }

  /**
   * Return a Map-like data structure that allows users to retrieve some or all
   * top-level declarations in the associated component class.
   */
  get members() {
    if (!this.membersTable) {
      const typeChecker = this.program.getTypeChecker();
      const sourceFile = this.classDeclNode.getSourceFile();
      this.membersTable = this.query.mergeSymbolTable([
        createGlobalSymbolTable(this.query),
        getClassMembersFromDeclaration(this.program, typeChecker, sourceFile, this.classDeclNode),
      ]);
    }
    return this.membersTable;
  }

  /**
   * Return an engine that provides more information about symbols in the
   * template.
   */
  get query() {
    if (!this.queryCache) {
      const program = this.program;
      const typeChecker = program.getTypeChecker();
      const sourceFile = this.classDeclNode.getSourceFile();
      this.queryCache = getSymbolQuery(program, typeChecker, sourceFile, () => {
        // Computing the ast is relatively expensive. Do it only when absolutely
        // necessary.
        // TODO: There is circular dependency here between TemplateSource and
        // TypeScriptHost. Consider refactoring the code to break this cycle.
        const ast = this.host.getTemplateAst(this);
        const pipes = isAstResult(ast) ? ast.pipes : [];
        return getPipesTable(sourceFile, program, typeChecker, pipes);
      });
    }
    return this.queryCache;
  }
}

/**
 * An InlineTemplate represents template defined in a TS file through the
 * `template` attribute in the decorator.
 */
export class InlineTemplate extends BaseTemplate {
  public readonly fileName: string;
  public readonly source: string;
  public readonly span: ng.Span;

  constructor(
      templateNode: ts.StringLiteralLike, classDeclNode: ts.ClassDeclaration,
      classSymbol: ng.StaticSymbol, host: TypeScriptServiceHost) {
    super(host, classDeclNode, classSymbol);
    const sourceFile = templateNode.getSourceFile();
    if (sourceFile !== classDeclNode.getSourceFile()) {
      throw new Error(`Inline template and component class should belong to the same source file`);
    }
    this.fileName = sourceFile.fileName;
    this.source = templateNode.text;
    this.span = {
      // TS string literal includes surrounding quotes in the start/end offsets.
      start: templateNode.getStart() + 1,
      end: templateNode.getEnd() - 1,
    };
  }
}

/**
 * An ExternalTemplate represents template defined in an external (most likely
 * HTML, but not necessarily) file through the `templateUrl` attribute in the
 * decorator.
 * Note that there is no ts.Node associated with the template because it's not
 * a TS file.
 */
export class ExternalTemplate extends BaseTemplate {
  public readonly span: ng.Span;

  constructor(
      public readonly source: string, public readonly fileName: string,
      classDeclNode: ts.ClassDeclaration, classSymbol: ng.StaticSymbol,
      host: TypeScriptServiceHost) {
    super(host, classDeclNode, classSymbol);
    this.span = {
      start: 0,
      end: source.length,
    };
  }
}

/**
 * Returns a property assignment from the assignment value, or `undefined` if there is no
 * assignment.
 */
export function getPropertyAssignmentFromValue(value: ts.Node): ts.PropertyAssignment|undefined {
  if (!value.parent || !ts.isPropertyAssignment(value.parent)) {
    return;
  }
  return value.parent;
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
 * @param propAsgn property assignment
 */
export function getClassDeclFromDecoratorProp(propAsgnNode: ts.PropertyAssignment):
    ts.ClassDeclaration|undefined {
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

/**
 * Determines if a property assignment is on a class decorator.
 * See `getClassDeclFromDecoratorProperty`, which gets the class the decorator is applied to, for
 * more details.
 *
 * @param prop property assignment
 */
export function isClassDecoratorProperty(propAsgn: ts.PropertyAssignment): boolean {
  return !!getClassDeclFromDecoratorProp(propAsgn);
}

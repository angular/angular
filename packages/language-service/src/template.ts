/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createGlobalSymbolTable} from './global_symbols';
import * as ng from './types';
import {TypeScriptServiceHost} from './typescript_host';
import {getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from './typescript_symbols';


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
  get type() {
    return this.classSymbol;
  }

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
        const pipes = (ast && ast.pipes) || [];
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
  public override readonly fileName: string;
  public override readonly source: string;
  public override readonly span: ng.Span;

  constructor(
      templateNode: ts.StringLiteralLike, classDeclNode: ts.ClassDeclaration,
      classSymbol: ng.StaticSymbol, host: TypeScriptServiceHost) {
    super(host, classDeclNode, classSymbol);
    const sourceFile = templateNode.getSourceFile();
    if (sourceFile !== classDeclNode.getSourceFile()) {
      throw new Error(`Inline template and component class should belong to the same source file`);
    }
    this.fileName = sourceFile.fileName;
    // node.text returns the TS internal representation of the normalized text,
    // and all CR characters are stripped. node.getText() returns the raw text.
    this.source = templateNode.getText().slice(1, -1);  // strip leading and trailing quotes
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
  public override readonly span: ng.Span;

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

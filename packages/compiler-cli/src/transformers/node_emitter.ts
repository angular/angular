/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AssertNotNull, BinaryOperator, BinaryOperatorExpr, BuiltinMethod, BuiltinVar, CastExpr, ClassStmt, CommaExpr, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, ExpressionStatement, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, LeadingComment, leadingComment, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, LocalizedString, NotExpr, ParseSourceFile, ParseSourceSpan, PartialModule, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, Statement, StatementVisitor, StmtModifier, TaggedTemplateExpr, ThrowStmt, TryCatchStmt, TypeofExpr, UnaryOperator, UnaryOperatorExpr, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {attachComments} from '../ngtsc/translator';
import {error} from './util';

export interface Node {
  sourceSpan: ParseSourceSpan|null;
}

const METHOD_THIS_NAME = 'this';
const CATCH_ERROR_NAME = 'error';
const CATCH_STACK_NAME = 'stack';
const _VALID_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;

export class TypeScriptNodeEmitter {
  constructor(private annotateForClosureCompiler: boolean) {}

  updateSourceFile(sourceFile: ts.SourceFile, stmts: Statement[], preamble?: string):
      [ts.SourceFile, Map<ts.Node, Node>] {
    const converter = new NodeEmitterVisitor(this.annotateForClosureCompiler);
    // [].concat flattens the result so that each `visit...` method can also return an array of
    // stmts.
    const statements: any[] = [].concat(
        ...stmts.map(stmt => stmt.visitStatement(converter, null)).filter(stmt => stmt != null));
    const sourceStatements =
        [...converter.getReexports(), ...converter.getImports(), ...statements];
    if (preamble) {
      // We always attach the preamble comment to a `NotEmittedStatement` node, because tsickle uses
      // this node type as a marker of the preamble to ensure that it adds its own new nodes after
      // the preamble.
      const preambleCommentHolder = ts.createNotEmittedStatement(sourceFile);
      // Preamble comments are passed through as-is, which means that they must already contain a
      // leading `*` if they should be a JSDOC comment.
      ts.addSyntheticLeadingComment(
          preambleCommentHolder, ts.SyntaxKind.MultiLineCommentTrivia, preamble,
          /* hasTrailingNewline */ true);
      sourceStatements.unshift(preambleCommentHolder);
    }

    converter.updateSourceMap(sourceStatements);
    const newSourceFile = ts.updateSourceFileNode(sourceFile, sourceStatements);
    return [newSourceFile, converter.getNodeMap()];
  }
}

/**
 * Update the given source file to include the changes specified in module.
 *
 * The module parameter is treated as a partial module meaning that the statements are added to
 * the module instead of replacing the module. Also, any classes are treated as partial classes
 * and the included members are added to the class with the same name instead of a new class
 * being created.
 */
export function updateSourceFile(
    sourceFile: ts.SourceFile, module: PartialModule,
    annotateForClosureCompiler: boolean): [ts.SourceFile, Map<ts.Node, Node>] {
  const converter = new NodeEmitterVisitor(annotateForClosureCompiler);
  converter.loadExportedVariableIdentifiers(sourceFile);

  const prefixStatements = module.statements.filter(statement => !(statement instanceof ClassStmt));
  const classes =
      module.statements.filter(statement => statement instanceof ClassStmt) as ClassStmt[];
  const classMap = new Map(
      classes.map<[string, ClassStmt]>(classStatement => [classStatement.name, classStatement]));
  const classNames = new Set(classes.map(classStatement => classStatement.name));

  const prefix: ts.Statement[] =
      prefixStatements.map(statement => statement.visitStatement(converter, sourceFile));

  // Add static methods to all the classes referenced in module.
  let newStatements = sourceFile.statements.map(node => {
    if (node.kind == ts.SyntaxKind.ClassDeclaration) {
      const classDeclaration = node as ts.ClassDeclaration;
      const name = classDeclaration.name;
      if (name) {
        const classStatement = classMap.get(name.text);
        if (classStatement) {
          classNames.delete(name.text);
          const classMemberHolder =
              converter.visitDeclareClassStmt(classStatement) as ts.ClassDeclaration;
          const newMethods =
              classMemberHolder.members.filter(member => member.kind !== ts.SyntaxKind.Constructor);
          const newMembers = [...classDeclaration.members, ...newMethods];

          return ts.updateClassDeclaration(
              classDeclaration,
              /* decorators */ classDeclaration.decorators,
              /* modifiers */ classDeclaration.modifiers,
              /* name */ classDeclaration.name,
              /* typeParameters */ classDeclaration.typeParameters,
              /* heritageClauses */ classDeclaration.heritageClauses || [],
              /* members */ newMembers);
        }
      }
    }
    return node;
  });

  // Validate that all the classes have been generated
  classNames.size == 0 ||
      error(`${classNames.size == 1 ? 'Class' : 'Classes'} "${
          Array.from(classNames.keys()).join(', ')}" not generated`);

  // Add imports to the module required by the new methods
  const imports = converter.getImports();
  if (imports && imports.length) {
    // Find where the new imports should go
    const index = firstAfter(
        newStatements,
        statement => statement.kind === ts.SyntaxKind.ImportDeclaration ||
            statement.kind === ts.SyntaxKind.ImportEqualsDeclaration);
    newStatements =
        [...newStatements.slice(0, index), ...imports, ...prefix, ...newStatements.slice(index)];
  } else {
    newStatements = [...prefix, ...newStatements];
  }

  converter.updateSourceMap(newStatements);
  const newSourceFile = ts.updateSourceFileNode(sourceFile, newStatements);

  return [newSourceFile, converter.getNodeMap()];
}

// Return the index after the first value in `a` that doesn't match the predicate after a value that
// does or 0 if no values match.
function firstAfter<T>(a: T[], predicate: (value: T) => boolean) {
  let index = 0;
  const len = a.length;
  for (; index < len; index++) {
    const value = a[index];
    if (predicate(value)) break;
  }
  if (index >= len) return 0;
  for (; index < len; index++) {
    const value = a[index];
    if (!predicate(value)) break;
  }
  return index;
}

// A recorded node is a subtype of the node that is marked as being recorded. This is used
// to ensure that NodeEmitterVisitor.record has been called on all nodes returned by the
// NodeEmitterVisitor
export type RecordedNode<T extends ts.Node = ts.Node> = (T&{
  __recorded: any;
})|null;

function escapeLiteral(value: string): string {
  return value.replace(/(\"|\\)/g, '\\$1').replace(/(\n)|(\r)/g, function(v, n, r) {
    return n ? '\\n' : '\\r';
  });
}

function createLiteral(value: any) {
  if (value === null) {
    return ts.createNull();
  } else if (value === undefined) {
    return ts.createIdentifier('undefined');
  } else {
    const result = ts.createLiteral(value);
    if (ts.isStringLiteral(result) && result.text.indexOf('\\') >= 0) {
      // Hack to avoid problems cause indirectly by:
      //    https://github.com/Microsoft/TypeScript/issues/20192
      // This avoids the string escaping normally performed for a string relying on that
      // TypeScript just emits the text raw for a numeric literal.
      (result as any).kind = ts.SyntaxKind.NumericLiteral;
      result.text = `"${escapeLiteral(result.text)}"`;
    }
    return result;
  }
}

function isExportTypeStatement(statement: ts.Statement): boolean {
  return !!statement.modifiers &&
      statement.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Visits an output ast and produces the corresponding TypeScript synthetic nodes.
 */
export class NodeEmitterVisitor implements StatementVisitor, ExpressionVisitor {
  private _nodeMap = new Map<ts.Node, Node>();
  private _importsWithPrefixes = new Map<string, string>();
  private _reexports = new Map<string, {name: string, as: string}[]>();
  private _templateSources = new Map<ParseSourceFile, ts.SourceMapSource>();
  private _exportedVariableIdentifiers = new Map<string, ts.Identifier>();

  constructor(private annotateForClosureCompiler: boolean) {}

  /**
   * Process the source file and collect exported identifiers that refer to variables.
   *
   * Only variables are collected because exported classes still exist in the module scope in
   * CommonJS, whereas variables have their declarations moved onto the `exports` object, and all
   * references are updated accordingly.
   */
  loadExportedVariableIdentifiers(sourceFile: ts.SourceFile): void {
    sourceFile.statements.forEach(statement => {
      if (ts.isVariableStatement(statement) && isExportTypeStatement(statement)) {
        statement.declarationList.declarations.forEach(declaration => {
          if (ts.isIdentifier(declaration.name)) {
            this._exportedVariableIdentifiers.set(declaration.name.text, declaration.name);
          }
        });
      }
    });
  }

  getReexports(): ts.Statement[] {
    return Array.from(this._reexports.entries())
        .map(
            ([exportedFilePath, reexports]) => ts.createExportDeclaration(
                /* decorators */ undefined,
                /* modifiers */ undefined,
                ts.createNamedExports(
                    reexports.map(({name, as}) => ts.createExportSpecifier(name, as))),
                /* moduleSpecifier */ createLiteral(exportedFilePath)));
  }

  getImports(): ts.Statement[] {
    return Array.from(this._importsWithPrefixes.entries())
        .map(
            ([namespace, prefix]) => ts.createImportDeclaration(
                /* decorators */ undefined,
                /* modifiers */ undefined,
                /* importClause */
                ts.createImportClause(
                    /* name */<ts.Identifier>(undefined as any),
                    ts.createNamespaceImport(ts.createIdentifier(prefix))),
                /* moduleSpecifier */ createLiteral(namespace)));
  }

  getNodeMap() {
    return this._nodeMap;
  }

  updateSourceMap(statements: ts.Statement[]) {
    let lastRangeStartNode: ts.Node|undefined = undefined;
    let lastRangeEndNode: ts.Node|undefined = undefined;
    let lastRange: ts.SourceMapRange|undefined = undefined;

    const recordLastSourceRange = () => {
      if (lastRange && lastRangeStartNode && lastRangeEndNode) {
        if (lastRangeStartNode == lastRangeEndNode) {
          ts.setSourceMapRange(lastRangeEndNode, lastRange);
        } else {
          ts.setSourceMapRange(lastRangeStartNode, lastRange);
          // Only emit the pos for the first node emitted in the range.
          ts.setEmitFlags(lastRangeStartNode, ts.EmitFlags.NoTrailingSourceMap);
          ts.setSourceMapRange(lastRangeEndNode, lastRange);
          // Only emit emit end for the last node emitted in the range.
          ts.setEmitFlags(lastRangeEndNode, ts.EmitFlags.NoLeadingSourceMap);
        }
      }
    };

    const visitNode = (tsNode: ts.Node) => {
      const ngNode = this._nodeMap.get(tsNode);
      if (ngNode) {
        const range = this.sourceRangeOf(ngNode);
        if (range) {
          if (!lastRange || range.source != lastRange.source || range.pos != lastRange.pos ||
              range.end != lastRange.end) {
            recordLastSourceRange();
            lastRangeStartNode = tsNode;
            lastRange = range;
          }
          lastRangeEndNode = tsNode;
        }
      }
      ts.forEachChild(tsNode, visitNode);
    };
    statements.forEach(visitNode);
    recordLastSourceRange();
  }

  private postProcess<T extends ts.Node>(ngNode: Node, tsNode: T|null): RecordedNode<T> {
    if (tsNode && !this._nodeMap.has(tsNode)) {
      this._nodeMap.set(tsNode, ngNode);
    }
    if (tsNode !== null && ngNode instanceof Statement && ngNode.leadingComments !== undefined) {
      attachComments(tsNode as unknown as ts.Statement, ngNode.leadingComments);
    }
    return tsNode as RecordedNode<T>;
  }

  private sourceRangeOf(node: Node): ts.SourceMapRange|null {
    if (node.sourceSpan) {
      const span = node.sourceSpan;
      if (span.start.file == span.end.file) {
        const file = span.start.file;
        if (file.url) {
          let source = this._templateSources.get(file);
          if (!source) {
            source = ts.createSourceMapSource(file.url, file.content, pos => pos);
            this._templateSources.set(file, source);
          }
          return {pos: span.start.offset, end: span.end.offset, source};
        }
      }
    }
    return null;
  }

  private getModifiers(stmt: Statement) {
    let modifiers: ts.Modifier[] = [];
    if (stmt.hasModifier(StmtModifier.Exported)) {
      modifiers.push(ts.createToken(ts.SyntaxKind.ExportKeyword));
    }
    return modifiers;
  }

  // StatementVisitor
  visitDeclareVarStmt(stmt: DeclareVarStmt) {
    if (stmt.hasModifier(StmtModifier.Exported) && stmt.value instanceof ExternalExpr &&
        !stmt.type) {
      // check for a reexport
      const {name, moduleName} = stmt.value.value;
      if (moduleName) {
        let reexports = this._reexports.get(moduleName);
        if (!reexports) {
          reexports = [];
          this._reexports.set(moduleName, reexports);
        }
        reexports.push({name: name!, as: stmt.name});
        return null;
      }
    }

    const varDeclList = ts.createVariableDeclarationList([ts.createVariableDeclaration(
        ts.createIdentifier(stmt.name),
        /* type */ undefined,
        (stmt.value && stmt.value.visitExpression(this, null)) || undefined)]);

    if (stmt.hasModifier(StmtModifier.Exported)) {
      // Note: We need to add an explicit variable and export declaration so that
      // the variable can be referred in the same file as well.
      const tsVarStmt =
          this.postProcess(stmt, ts.createVariableStatement(/* modifiers */[], varDeclList));
      const exportStmt = this.postProcess(
          stmt,
          ts.createExportDeclaration(
              /*decorators*/ undefined, /*modifiers*/ undefined,
              ts.createNamedExports([ts.createExportSpecifier(stmt.name, stmt.name)])));
      return [tsVarStmt, exportStmt];
    }
    return this.postProcess(stmt, ts.createVariableStatement(this.getModifiers(stmt), varDeclList));
  }

  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt) {
    return this.postProcess(
        stmt,
        ts.createFunctionDeclaration(
            /* decorators */ undefined, this.getModifiers(stmt),
            /* asteriskToken */ undefined, stmt.name, /* typeParameters */ undefined,
            stmt.params.map(
                p => ts.createParameter(
                    /* decorators */ undefined, /* modifiers */ undefined,
                    /* dotDotDotToken */ undefined, p.name)),
            /* type */ undefined, this._visitStatements(stmt.statements)));
  }

  visitExpressionStmt(stmt: ExpressionStatement) {
    return this.postProcess(stmt, ts.createStatement(stmt.expr.visitExpression(this, null)));
  }

  visitReturnStmt(stmt: ReturnStatement) {
    return this.postProcess(
        stmt, ts.createReturn(stmt.value ? stmt.value.visitExpression(this, null) : undefined));
  }

  visitDeclareClassStmt(stmt: ClassStmt) {
    const modifiers = this.getModifiers(stmt);
    const fields = stmt.fields.map(field => {
      const property = ts.createProperty(
          /* decorators */ undefined, /* modifiers */ translateModifiers(field.modifiers),
          field.name,
          /* questionToken */ undefined,
          /* type */ undefined,
          field.initializer == null ? ts.createNull() :
                                      field.initializer.visitExpression(this, null));

      if (this.annotateForClosureCompiler) {
        // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
        // prevent this transformation, such assignments need to be annotated with @nocollapse.
        // Note that tsickle is typically responsible for adding such annotations, however it
        // doesn't yet handle synthetic fields added during other transformations.
        ts.addSyntheticLeadingComment(
            property, ts.SyntaxKind.MultiLineCommentTrivia, '* @nocollapse ',
            /* hasTrailingNewLine */ false);
      }

      return property;
    });
    const getters = stmt.getters.map(
        getter => ts.createGetAccessor(
            /* decorators */ undefined, /* modifiers */ undefined, getter.name, /* parameters */[],
            /* type */ undefined, this._visitStatements(getter.body)));

    const constructor =
        (stmt.constructorMethod && [ts.createConstructor(
                                       /* decorators */ undefined,
                                       /* modifiers */ undefined,
                                       /* parameters */
                                       stmt.constructorMethod.params.map(
                                           p => ts.createParameter(
                                               /* decorators */ undefined,
                                               /* modifiers */ undefined,
                                               /* dotDotDotToken */ undefined, p.name)),
                                       this._visitStatements(stmt.constructorMethod.body))]) ||
        [];

    // TODO {chuckj}: Determine what should be done for a method with a null name.
    const methods = stmt.methods.filter(method => method.name)
                        .map(
                            method => ts.createMethod(
                                /* decorators */ undefined,
                                /* modifiers */ translateModifiers(method.modifiers),
                                /* astriskToken */ undefined, method.name!/* guarded by filter */,
                                /* questionToken */ undefined, /* typeParameters */ undefined,
                                method.params.map(
                                    p => ts.createParameter(
                                        /* decorators */ undefined, /* modifiers */ undefined,
                                        /* dotDotDotToken */ undefined, p.name)),
                                /* type */ undefined, this._visitStatements(method.body)));
    return this.postProcess(
        stmt,
        ts.createClassDeclaration(
            /* decorators */ undefined, modifiers, stmt.name, /* typeParameters*/ undefined,
            stmt.parent &&
                    [ts.createHeritageClause(
                        ts.SyntaxKind.ExtendsKeyword, [stmt.parent.visitExpression(this, null)])] ||
                [],
            [...fields, ...getters, ...constructor, ...methods]));
  }

  visitIfStmt(stmt: IfStmt) {
    return this.postProcess(
        stmt,
        ts.createIf(
            stmt.condition.visitExpression(this, null), this._visitStatements(stmt.trueCase),
            stmt.falseCase && stmt.falseCase.length && this._visitStatements(stmt.falseCase) ||
                undefined));
  }

  visitTryCatchStmt(stmt: TryCatchStmt): RecordedNode<ts.TryStatement> {
    return this.postProcess(
        stmt,
        ts.createTry(
            this._visitStatements(stmt.bodyStmts),
            ts.createCatchClause(
                CATCH_ERROR_NAME,
                this._visitStatementsPrefix(
                    [ts.createVariableStatement(
                        /* modifiers */ undefined,
                        [ts.createVariableDeclaration(
                            CATCH_STACK_NAME, /* type */ undefined,
                            ts.createPropertyAccess(
                                ts.createIdentifier(CATCH_ERROR_NAME),
                                ts.createIdentifier(CATCH_STACK_NAME)))])],
                    stmt.catchStmts)),
            /* finallyBlock */ undefined));
  }

  visitThrowStmt(stmt: ThrowStmt) {
    return this.postProcess(stmt, ts.createThrow(stmt.error.visitExpression(this, null)));
  }

  // ExpressionVisitor
  visitWrappedNodeExpr(expr: WrappedNodeExpr<any>) {
    return this.postProcess(expr, expr.node);
  }

  visitTypeofExpr(expr: TypeofExpr) {
    const typeOf = ts.createTypeOf(expr.expr.visitExpression(this, null));
    return this.postProcess(expr, typeOf);
  }

  // ExpressionVisitor
  visitReadVarExpr(expr: ReadVarExpr) {
    switch (expr.builtin) {
      case BuiltinVar.This:
        return this.postProcess(expr, ts.createIdentifier(METHOD_THIS_NAME));
      case BuiltinVar.CatchError:
        return this.postProcess(expr, ts.createIdentifier(CATCH_ERROR_NAME));
      case BuiltinVar.CatchStack:
        return this.postProcess(expr, ts.createIdentifier(CATCH_STACK_NAME));
      case BuiltinVar.Super:
        return this.postProcess(expr, ts.createSuper());
    }
    if (expr.name) {
      return this.postProcess(expr, ts.createIdentifier(expr.name));
    }
    throw Error(`Unexpected ReadVarExpr form`);
  }

  visitWriteVarExpr(expr: WriteVarExpr): RecordedNode<ts.BinaryExpression> {
    return this.postProcess(
        expr,
        ts.createAssignment(
            ts.createIdentifier(expr.name), expr.value.visitExpression(this, null)));
  }

  visitWriteKeyExpr(expr: WriteKeyExpr): RecordedNode<ts.BinaryExpression> {
    return this.postProcess(
        expr,
        ts.createAssignment(
            ts.createElementAccess(
                expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)),
            expr.value.visitExpression(this, null)));
  }

  visitWritePropExpr(expr: WritePropExpr): RecordedNode<ts.BinaryExpression> {
    return this.postProcess(
        expr,
        ts.createAssignment(
            ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name),
            expr.value.visitExpression(this, null)));
  }

  visitInvokeMethodExpr(expr: InvokeMethodExpr): RecordedNode<ts.CallExpression> {
    const methodName = getMethodName(expr);
    return this.postProcess(
        expr,
        ts.createCall(
            ts.createPropertyAccess(expr.receiver.visitExpression(this, null), methodName),
            /* typeArguments */ undefined, expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitInvokeFunctionExpr(expr: InvokeFunctionExpr): RecordedNode<ts.CallExpression> {
    return this.postProcess(
        expr,
        ts.createCall(
            expr.fn.visitExpression(this, null), /* typeArguments */ undefined,
            expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitTaggedTemplateExpr(expr: TaggedTemplateExpr): RecordedNode<ts.TaggedTemplateExpression> {
    throw new Error('tagged templates are not supported in pre-ivy mode.');
  }

  visitInstantiateExpr(expr: InstantiateExpr): RecordedNode<ts.NewExpression> {
    return this.postProcess(
        expr,
        ts.createNew(
            expr.classExpr.visitExpression(this, null), /* typeArguments */ undefined,
            expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitLiteralExpr(expr: LiteralExpr) {
    return this.postProcess(expr, createLiteral(expr.value));
  }

  visitLocalizedString(expr: LocalizedString, context: any) {
    throw new Error('localized strings are not supported in pre-ivy mode.');
  }

  visitExternalExpr(expr: ExternalExpr) {
    return this.postProcess(expr, this._visitIdentifier(expr.value));
  }

  visitConditionalExpr(expr: ConditionalExpr): RecordedNode<ts.ParenthesizedExpression> {
    // TODO {chuckj}: Review use of ! on falseCase. Should it be non-nullable?
    return this.postProcess(
        expr,
        ts.createParen(ts.createConditional(
            expr.condition.visitExpression(this, null), expr.trueCase.visitExpression(this, null),
            expr.falseCase!.visitExpression(this, null))));
  }

  visitNotExpr(expr: NotExpr): RecordedNode<ts.PrefixUnaryExpression> {
    return this.postProcess(
        expr,
        ts.createPrefix(
            ts.SyntaxKind.ExclamationToken, expr.condition.visitExpression(this, null)));
  }

  visitAssertNotNullExpr(expr: AssertNotNull): RecordedNode<ts.Expression> {
    return expr.condition.visitExpression(this, null);
  }

  visitCastExpr(expr: CastExpr): RecordedNode<ts.Expression> {
    return expr.value.visitExpression(this, null);
  }

  visitFunctionExpr(expr: FunctionExpr) {
    return this.postProcess(
        expr,
        ts.createFunctionExpression(
            /* modifiers */ undefined, /* astriskToken */ undefined,
            /* name */ expr.name || undefined,
            /* typeParameters */ undefined,
            expr.params.map(
                p => ts.createParameter(
                    /* decorators */ undefined, /* modifiers */ undefined,
                    /* dotDotDotToken */ undefined, p.name)),
            /* type */ undefined, this._visitStatements(expr.statements)));
  }

  visitUnaryOperatorExpr(expr: UnaryOperatorExpr):
      RecordedNode<ts.UnaryExpression|ts.ParenthesizedExpression> {
    let unaryOperator: ts.BinaryOperator;
    switch (expr.operator) {
      case UnaryOperator.Minus:
        unaryOperator = ts.SyntaxKind.MinusToken;
        break;
      case UnaryOperator.Plus:
        unaryOperator = ts.SyntaxKind.PlusToken;
        break;
      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
    const binary = ts.createPrefix(unaryOperator, expr.expr.visitExpression(this, null));
    return this.postProcess(expr, expr.parens ? ts.createParen(binary) : binary);
  }

  visitBinaryOperatorExpr(expr: BinaryOperatorExpr):
      RecordedNode<ts.BinaryExpression|ts.ParenthesizedExpression> {
    let binaryOperator: ts.BinaryOperator;
    switch (expr.operator) {
      case BinaryOperator.And:
        binaryOperator = ts.SyntaxKind.AmpersandAmpersandToken;
        break;
      case BinaryOperator.BitwiseAnd:
        binaryOperator = ts.SyntaxKind.AmpersandToken;
        break;
      case BinaryOperator.Bigger:
        binaryOperator = ts.SyntaxKind.GreaterThanToken;
        break;
      case BinaryOperator.BiggerEquals:
        binaryOperator = ts.SyntaxKind.GreaterThanEqualsToken;
        break;
      case BinaryOperator.Divide:
        binaryOperator = ts.SyntaxKind.SlashToken;
        break;
      case BinaryOperator.Equals:
        binaryOperator = ts.SyntaxKind.EqualsEqualsToken;
        break;
      case BinaryOperator.Identical:
        binaryOperator = ts.SyntaxKind.EqualsEqualsEqualsToken;
        break;
      case BinaryOperator.Lower:
        binaryOperator = ts.SyntaxKind.LessThanToken;
        break;
      case BinaryOperator.LowerEquals:
        binaryOperator = ts.SyntaxKind.LessThanEqualsToken;
        break;
      case BinaryOperator.Minus:
        binaryOperator = ts.SyntaxKind.MinusToken;
        break;
      case BinaryOperator.Modulo:
        binaryOperator = ts.SyntaxKind.PercentToken;
        break;
      case BinaryOperator.Multiply:
        binaryOperator = ts.SyntaxKind.AsteriskToken;
        break;
      case BinaryOperator.NotEquals:
        binaryOperator = ts.SyntaxKind.ExclamationEqualsToken;
        break;
      case BinaryOperator.NotIdentical:
        binaryOperator = ts.SyntaxKind.ExclamationEqualsEqualsToken;
        break;
      case BinaryOperator.Or:
        binaryOperator = ts.SyntaxKind.BarBarToken;
        break;
      case BinaryOperator.Plus:
        binaryOperator = ts.SyntaxKind.PlusToken;
        break;
      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
    const binary = ts.createBinary(
        expr.lhs.visitExpression(this, null), binaryOperator, expr.rhs.visitExpression(this, null));
    return this.postProcess(expr, expr.parens ? ts.createParen(binary) : binary);
  }

  visitReadPropExpr(expr: ReadPropExpr): RecordedNode<ts.PropertyAccessExpression> {
    return this.postProcess(
        expr, ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name));
  }

  visitReadKeyExpr(expr: ReadKeyExpr): RecordedNode<ts.ElementAccessExpression> {
    return this.postProcess(
        expr,
        ts.createElementAccess(
            expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)));
  }

  visitLiteralArrayExpr(expr: LiteralArrayExpr): RecordedNode<ts.ArrayLiteralExpression> {
    return this.postProcess(
        expr, ts.createArrayLiteral(expr.entries.map(entry => entry.visitExpression(this, null))));
  }

  visitLiteralMapExpr(expr: LiteralMapExpr): RecordedNode<ts.ObjectLiteralExpression> {
    return this.postProcess(
        expr,
        ts.createObjectLiteral(expr.entries.map(
            entry => ts.createPropertyAssignment(
                entry.quoted || !_VALID_IDENTIFIER_RE.test(entry.key) ?
                    ts.createLiteral(entry.key) :
                    entry.key,
                entry.value.visitExpression(this, null)))));
  }

  visitCommaExpr(expr: CommaExpr): RecordedNode<ts.Expression> {
    return this.postProcess(
        expr,
        expr.parts.map(e => e.visitExpression(this, null))
            .reduce<ts.Expression|null>(
                (left, right) =>
                    left ? ts.createBinary(left, ts.SyntaxKind.CommaToken, right) : right,
                null));
  }

  private _visitStatements(statements: Statement[]): ts.Block {
    return this._visitStatementsPrefix([], statements);
  }

  private _visitStatementsPrefix(prefix: ts.Statement[], statements: Statement[]) {
    return ts.createBlock([
      ...prefix, ...statements.map(stmt => stmt.visitStatement(this, null)).filter(f => f != null)
    ]);
  }

  private _visitIdentifier(value: ExternalReference): ts.Expression {
    // name can only be null during JIT which never executes this code.
    const moduleName = value.moduleName, name = value.name!;
    let prefixIdent: ts.Identifier|null = null;
    if (moduleName) {
      let prefix = this._importsWithPrefixes.get(moduleName);
      if (prefix == null) {
        prefix = `i${this._importsWithPrefixes.size}`;
        this._importsWithPrefixes.set(moduleName, prefix);
      }
      prefixIdent = ts.createIdentifier(prefix);
    }
    if (prefixIdent) {
      return ts.createPropertyAccess(prefixIdent, name);
    } else {
      const id = ts.createIdentifier(name);
      if (this._exportedVariableIdentifiers.has(name)) {
        // In order for this new identifier node to be properly rewritten in CommonJS output,
        // it must have its original node set to a parsed instance of the same identifier.
        ts.setOriginalNode(id, this._exportedVariableIdentifiers.get(name));
      }
      return id;
    }
  }
}

function getMethodName(methodRef: {name: string|null; builtin: BuiltinMethod | null}): string {
  if (methodRef.name) {
    return methodRef.name;
  } else {
    switch (methodRef.builtin) {
      case BuiltinMethod.Bind:
        return 'bind';
      case BuiltinMethod.ConcatArray:
        return 'concat';
      case BuiltinMethod.SubscribeObservable:
        return 'subscribe';
    }
  }
  throw new Error('Unexpected method reference form');
}

function modifierFromModifier(modifier: StmtModifier): ts.Modifier {
  switch (modifier) {
    case StmtModifier.Exported:
      return ts.createToken(ts.SyntaxKind.ExportKeyword);
    case StmtModifier.Final:
      return ts.createToken(ts.SyntaxKind.ConstKeyword);
    case StmtModifier.Private:
      return ts.createToken(ts.SyntaxKind.PrivateKeyword);
    case StmtModifier.Static:
      return ts.createToken(ts.SyntaxKind.StaticKeyword);
  }
}

function translateModifiers(modifiers: StmtModifier[]|null): ts.Modifier[]|undefined {
  return modifiers == null ? undefined : modifiers!.map(modifierFromModifier);
}

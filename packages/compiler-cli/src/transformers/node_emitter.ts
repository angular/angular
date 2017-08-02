/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AssertNotNull, BinaryOperator, BinaryOperatorExpr, BuiltinMethod, BuiltinVar, CastExpr, ClassStmt, CommaExpr, CommentStmt, CompileIdentifierMetadata, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, ExpressionStatement, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, NotExpr, ParseSourceSpan, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, Statement, StatementVisitor, StaticSymbol, StmtModifier, ThrowStmt, TryCatchStmt, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';

export interface Node { sourceSpan: ParseSourceSpan|null; }

const METHOD_THIS_NAME = 'this';
const CATCH_ERROR_NAME = 'error';
const CATCH_STACK_NAME = 'stack';

export class TypeScriptNodeEmitter {
  updateSourceFile(sourceFile: ts.SourceFile, stmts: Statement[], preamble?: string):
      [ts.SourceFile, Map<ts.Node, Node>] {
    const converter = new _NodeEmitterVisitor();
    // [].concat flattens the result so that each `visit...` method can also return an array of
    // stmts.
    const statements: any[] = [].concat(
        ...stmts.map(stmt => stmt.visitStatement(converter, null)).filter(stmt => stmt != null));
    const newSourceFile = ts.updateSourceFileNode(
        sourceFile, [...converter.getReexports(), ...converter.getImports(), ...statements]);
    if (preamble) {
      if (preamble.startsWith('/*') && preamble.endsWith('*/')) {
        preamble = preamble.substr(2, preamble.length - 4);
      }
      if (!statements.length) {
        statements.push(ts.createEmptyStatement());
      }
      statements[0] = ts.setSyntheticLeadingComments(
          statements[0],
          [{kind: ts.SyntaxKind.MultiLineCommentTrivia, text: preamble, pos: -1, end: -1}]);
    }
    return [newSourceFile, converter.getNodeMap()];
  }
}

// A recorded node is a subtype of the node that is marked as being recoreded. This is used
// to ensure that NodeEmitterVisitor.record has been called on all nodes returned by the
// NodeEmitterVisitor
type RecordedNode<T extends ts.Node = ts.Node> = (T & { __recorded: any; }) | null;

function createLiteral(value: any) {
  if (value === null) {
    return ts.createNull();
  } else if (value === undefined) {
    return ts.createIdentifier('undefined');
  } else {
    return ts.createLiteral(value);
  }
}

/**
 * Visits an output ast and produces the corresponding TypeScript synthetic nodes.
 */
class _NodeEmitterVisitor implements StatementVisitor, ExpressionVisitor {
  private _nodeMap = new Map<ts.Node, Node>();
  private _importsWithPrefixes = new Map<string, string>();
  private _reexports = new Map<string, {name: string, as: string}[]>();

  getReexports(): ts.Statement[] {
    return Array.from(this._reexports.entries())
        .map(
            ([exportedFilePath, reexports]) => ts.createExportDeclaration(
                /* decorators */ undefined,
                /* modifiers */ undefined, ts.createNamedExports(reexports.map(
                                               ({name, as}) => ts.createExportSpecifier(name, as))),
                /* moduleSpecifier */ createLiteral(exportedFilePath)));
  }

  getImports(): ts.Statement[] {
    return Array.from(this._importsWithPrefixes.entries())
        .map(
            ([namespace, prefix]) => ts.createImportDeclaration(
                /* decorators */ undefined,
                /* modifiers */ undefined,
                /* importClause */ ts.createImportClause(
                    /* name */<ts.Identifier>(undefined as any),
                    ts.createNamespaceImport(ts.createIdentifier(prefix))),
                /* moduleSpecifier */ createLiteral(namespace)));
  }

  getNodeMap() { return this._nodeMap; }

  private record<T extends ts.Node>(ngNode: Node, tsNode: T|null): RecordedNode<T> {
    if (tsNode && !this._nodeMap.has(tsNode)) {
      this._nodeMap.set(tsNode, ngNode);
      ts.forEachChild(tsNode, child => this.record(ngNode, tsNode));
    }
    return tsNode as RecordedNode<T>;
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
        reexports.push({name: name !, as: stmt.name});
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
          this.record(stmt, ts.createVariableStatement(/* modifiers */[], varDeclList));
      const exportStmt = this.record(
          stmt, ts.createExportDeclaration(
                    /*decorators*/ undefined, /*modifiers*/ undefined,
                    ts.createNamedExports([ts.createExportSpecifier(stmt.name, stmt.name)])));
      return [tsVarStmt, exportStmt];
    }
    return this.record(stmt, ts.createVariableStatement(this.getModifiers(stmt), varDeclList));
  }

  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any) {
    return this.record(
        stmt, ts.createFunctionDeclaration(
                  /* decorators */ undefined, this.getModifiers(stmt),
                  /* asteriskToken */ undefined, stmt.name, /* typeParameters */ undefined,
                  stmt.params.map(
                      p => ts.createParameter(
                          /* decorators */ undefined, /* modifiers */ undefined,
                          /* dotDotDotToken */ undefined, p.name)),
                  /* type */ undefined, this._visitStatements(stmt.statements)));
  }

  visitExpressionStmt(stmt: ExpressionStatement) {
    return this.record(stmt, ts.createStatement(stmt.expr.visitExpression(this, null)));
  }

  visitReturnStmt(stmt: ReturnStatement) {
    return this.record(
        stmt, ts.createReturn(stmt.value ? stmt.value.visitExpression(this, null) : undefined));
  }

  visitDeclareClassStmt(stmt: ClassStmt) {
    const modifiers = this.getModifiers(stmt);
    const fields = stmt.fields.map(
        field => ts.createProperty(
            /* decorators */ undefined, /* modifiers */ undefined, field.name,
            /* questionToken */ undefined,
            /* type */ undefined, ts.createNull()));
    const getters = stmt.getters.map(
        getter => ts.createGetAccessor(
            /* decorators */ undefined, /* modifiers */ undefined, getter.name, /* parameters */[],
            /* type */ undefined, this._visitStatements(getter.body)));

    const constructor =
        (stmt.constructorMethod && [ts.createConstructor(
                                       /* decorators */ undefined,
                                       /* modifiers */ undefined,
                                       /* parameters */ stmt.constructorMethod.params.map(
                                           p => ts.createParameter(
                                               /* decorators */ undefined,
                                               /* modifiers */ undefined,
                                               /* dotDotDotToken */ undefined, p.name)),
                                       this._visitStatements(stmt.constructorMethod.body))]) ||
        [];

    // TODO {chuckj}: Determine what should be done for a method with a null name.
    const methods = stmt.methods.filter(method => method.name)
                        .map(
                            method => ts.createMethodDeclaration(
                                /* decorators */ undefined, /* modifiers */ undefined,
                                /* astriskToken */ undefined, method.name !/* guarded by filter */,
                                /* questionToken */ undefined, /* typeParameters */ undefined,
                                method.params.map(
                                    p => ts.createParameter(
                                        /* decorators */ undefined, /* modifiers */ undefined,
                                        /* dotDotDotToken */ undefined, p.name)),
                                /* type */ undefined, this._visitStatements(method.body)));
    return this.record(
        stmt, ts.createClassDeclaration(
                  /* decorators */ undefined, modifiers, stmt.name, /* typeParameters*/ undefined,
                  stmt.parent && [ts.createHeritageClause(
                                     ts.SyntaxKind.ExtendsKeyword,
                                     [stmt.parent.visitExpression(this, null)])] ||
                      [],
                  [...fields, ...getters, ...constructor, ...methods]));
  }

  visitIfStmt(stmt: IfStmt) {
    return this.record(
        stmt,
        ts.createIf(
            stmt.condition.visitExpression(this, null), this._visitStatements(stmt.trueCase),
            stmt.falseCase && stmt.falseCase.length && this._visitStatements(stmt.falseCase) ||
                undefined));
  }

  visitTryCatchStmt(stmt: TryCatchStmt): RecordedNode<ts.TryStatement> {
    return this.record(
        stmt, ts.createTry(
                  this._visitStatements(stmt.bodyStmts),
                  ts.createCatchClause(
                      CATCH_ERROR_NAME, this._visitStatementsPrefix(
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
    return this.record(stmt, ts.createThrow(stmt.error.visitExpression(this, null)));
  }

  visitCommentStmt(stmt: CommentStmt) { return null; }

  // ExpressionVisitor
  visitReadVarExpr(expr: ReadVarExpr) {
    switch (expr.builtin) {
      case BuiltinVar.This:
        return this.record(expr, ts.createIdentifier(METHOD_THIS_NAME));
      case BuiltinVar.CatchError:
        return this.record(expr, ts.createIdentifier(CATCH_ERROR_NAME));
      case BuiltinVar.CatchStack:
        return this.record(expr, ts.createIdentifier(CATCH_STACK_NAME));
      case BuiltinVar.Super:
        return this.record(expr, ts.createSuper());
    }
    if (expr.name) {
      return this.record(expr, ts.createIdentifier(expr.name));
    }
    throw Error(`Unexpected ReadVarExpr form`);
  }

  visitWriteVarExpr(expr: WriteVarExpr): RecordedNode<ts.BinaryExpression> {
    return this.record(
        expr, ts.createAssignment(
                  ts.createIdentifier(expr.name), expr.value.visitExpression(this, null)));
  }

  visitWriteKeyExpr(expr: WriteKeyExpr): RecordedNode<ts.BinaryExpression> {
    return this.record(
        expr,
        ts.createAssignment(
            ts.createElementAccess(
                expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)),
            expr.value.visitExpression(this, null)));
  }

  visitWritePropExpr(expr: WritePropExpr): RecordedNode<ts.BinaryExpression> {
    return this.record(
        expr, ts.createAssignment(
                  ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name),
                  expr.value.visitExpression(this, null)));
  }

  visitInvokeMethodExpr(expr: InvokeMethodExpr): RecordedNode<ts.CallExpression> {
    const methodName = getMethodName(expr);
    return this.record(
        expr,
        ts.createCall(
            ts.createPropertyAccess(expr.receiver.visitExpression(this, null), methodName),
            /* typeArguments */ undefined, expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitInvokeFunctionExpr(expr: InvokeFunctionExpr): RecordedNode<ts.CallExpression> {
    return this.record(
        expr, ts.createCall(
                  expr.fn.visitExpression(this, null), /* typeArguments */ undefined,
                  expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitInstantiateExpr(expr: InstantiateExpr): RecordedNode<ts.NewExpression> {
    return this.record(
        expr, ts.createNew(
                  expr.classExpr.visitExpression(this, null), /* typeArguments */ undefined,
                  expr.args.map(arg => arg.visitExpression(this, null))));
  }

  visitLiteralExpr(expr: LiteralExpr) { return this.record(expr, createLiteral(expr.value)); }

  visitExternalExpr(expr: ExternalExpr) {
    return this.record(expr, this._visitIdentifier(expr.value));
  }

  visitConditionalExpr(expr: ConditionalExpr): RecordedNode<ts.ConditionalExpression> {
    // TODO {chuckj}: Review use of ! on flaseCase. Should it be non-nullable?
    return this.record(
        expr,
        ts.createConditional(
            expr.condition.visitExpression(this, null), expr.trueCase.visitExpression(this, null),
            expr.falseCase !.visitExpression(this, null)));
    ;
  }

  visitNotExpr(expr: NotExpr): RecordedNode<ts.PrefixUnaryExpression> {
    return this.record(
        expr, ts.createPrefix(
                  ts.SyntaxKind.ExclamationToken, expr.condition.visitExpression(this, null)));
  }

  visitAssertNotNullExpr(expr: AssertNotNull): RecordedNode<ts.Expression> {
    return expr.condition.visitExpression(this, null);
  }

  visitCastExpr(expr: CastExpr): RecordedNode<ts.Expression> {
    return expr.value.visitExpression(this, null);
  }

  visitFunctionExpr(expr: FunctionExpr) {
    return this.record(
        expr, ts.createFunctionExpression(
                  /* modifiers */ undefined, /* astriskToken */ undefined, /* name */ undefined,
                  /* typeParameters */ undefined,
                  expr.params.map(
                      p => ts.createParameter(
                          /* decorators */ undefined, /* modifiers */ undefined,
                          /* dotDotDotToken */ undefined, p.name)),
                  /* type */ undefined, this._visitStatements(expr.statements)));
  }

  visitBinaryOperatorExpr(expr: BinaryOperatorExpr): RecordedNode<ts.BinaryExpression> {
    let binaryOperator: ts.BinaryOperator;
    switch (expr.operator) {
      case BinaryOperator.And:
        binaryOperator = ts.SyntaxKind.AmpersandAmpersandToken;
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
    return this.record(
        expr, ts.createBinary(
                  expr.lhs.visitExpression(this, null), binaryOperator,
                  expr.rhs.visitExpression(this, null)));
  }

  visitReadPropExpr(expr: ReadPropExpr): RecordedNode<ts.PropertyAccessExpression> {
    return this.record(
        expr, ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name));
  }

  visitReadKeyExpr(expr: ReadKeyExpr): RecordedNode<ts.ElementAccessExpression> {
    return this.record(
        expr,
        ts.createElementAccess(
            expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)));
  }

  visitLiteralArrayExpr(expr: LiteralArrayExpr): RecordedNode<ts.ArrayLiteralExpression> {
    return this.record(
        expr, ts.createArrayLiteral(expr.entries.map(entry => entry.visitExpression(this, null))));
  }

  visitLiteralMapExpr(expr: LiteralMapExpr): RecordedNode<ts.ObjectLiteralExpression> {
    return this.record(
        expr, ts.createObjectLiteral(expr.entries.map(
                  entry => ts.createPropertyAssignment(
                      entry.quoted ? ts.createLiteral(entry.key) : entry.key,
                      entry.value.visitExpression(this, null)))));
  }

  visitCommaExpr(expr: CommaExpr): RecordedNode<ts.Expression> {
    return this.record(
        expr, expr.parts.map(e => e.visitExpression(this, null))
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
    const {name, moduleName} = value;
    let prefixIdent: ts.Identifier|null = null;
    if (moduleName) {
      let prefix = this._importsWithPrefixes.get(moduleName);
      if (prefix == null) {
        prefix = `i${this._importsWithPrefixes.size}`;
        this._importsWithPrefixes.set(moduleName, prefix);
      }
      prefixIdent = ts.createIdentifier(prefix);
    }
    // name can only be null during JIT which never executes this code.
    let result: ts.Expression =
        prefixIdent ? ts.createPropertyAccess(prefixIdent, name !) : ts.createIdentifier(name !);
    return result;
  }
}


function getMethodName(methodRef: {name: string | null; builtin: BuiltinMethod | null}): string {
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

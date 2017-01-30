/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {StaticSymbol} from '../aot/static_symbol';
import {CompileIdentifierMetadata} from '../compile_metadata';
import {isBlank, isPresent} from '../facade/lang';

import {AbstractEmitterVisitor, CATCH_ERROR_VAR, CATCH_STACK_VAR, EmitterVisitorContext, OutputEmitter} from './abstract_emitter';
import * as o from './output_ast';
import {ImportResolver} from './path_util';

const _debugFilePath = '/debug/lib';

export function debugOutputAstAsTypeScript(ast: o.Statement | o.Expression | o.Type | any[]):
    string {
  const converter = new _TsEmitterVisitor(_debugFilePath, {
    fileNameToModuleName(filePath: string, containingFilePath: string) { return filePath; },
    getImportAs(symbol: StaticSymbol) { return null; },
    getTypeArity: symbol => null
  });
  const ctx = EmitterVisitorContext.createRoot([]);
  const asts: any[] = Array.isArray(ast) ? ast : [ast];

  asts.forEach((ast) => {
    if (ast instanceof o.Statement) {
      ast.visitStatement(converter, ctx);
    } else if (ast instanceof o.Expression) {
      ast.visitExpression(converter, ctx);
    } else if (ast instanceof o.Type) {
      ast.visitType(converter, ctx);
    } else {
      throw new Error(`Don't know how to print debug info for ${ast}`);
    }
  });
  return ctx.toSource();
}

export class TypeScriptEmitter implements OutputEmitter {
  constructor(private _importResolver: ImportResolver) {}
  emitStatements(genFilePath: string, stmts: o.Statement[], exportedVars: string[]): string {
    const converter = new _TsEmitterVisitor(genFilePath, this._importResolver);
    const ctx = EmitterVisitorContext.createRoot(exportedVars);
    converter.visitAllStatements(stmts, ctx);
    const srcParts: string[] = [];
    converter.reexports.forEach((reexports, exportedFilePath) => {
      const reexportsCode =
          reexports.map(reexport => `${reexport.name} as ${reexport.as}`).join(',');
      srcParts.push(
          `export {${reexportsCode}} from '${this._importResolver.fileNameToModuleName(exportedFilePath, genFilePath)}';`);
    });
    converter.importsWithPrefixes.forEach((prefix, importedFilePath) => {
      // Note: can't write the real word for import as it screws up system.js auto detection...
      srcParts.push(
          `imp` +
          `ort * as ${prefix} from '${this._importResolver.fileNameToModuleName(importedFilePath, genFilePath)}';`);
    });
    srcParts.push(ctx.toSource());
    return srcParts.join('\n');
  }
}

class _TsEmitterVisitor extends AbstractEmitterVisitor implements o.TypeVisitor {
  private typeExpression = 0;

  constructor(private _genFilePath: string, private _importResolver: ImportResolver) {
    super(false);
  }

  importsWithPrefixes = new Map<string, string>();
  reexports = new Map<string, {name: string, as: string}[]>();

  visitType(t: o.Type, ctx: EmitterVisitorContext, defaultType: string = 'any') {
    if (isPresent(t)) {
      this.typeExpression++;
      t.visitType(this, ctx);
      this.typeExpression--;
    } else {
      ctx.print(defaultType);
    }
  }

  visitLiteralExpr(ast: o.LiteralExpr, ctx: EmitterVisitorContext): any {
    const value = ast.value;
    if (isBlank(value) && ast.type != o.NULL_TYPE) {
      ctx.print(`(${value} as any)`);
      return null;
    }
    return super.visitLiteralExpr(ast, ctx);
  }


  // Temporary workaround to support strictNullCheck enabled consumers of ngc emit.
  // In SNC mode, [] have the type never[], so we cast here to any[].
  // TODO: narrow the cast to a more explicit type, or use a pattern that does not
  // start with [].concat. see https://github.com/angular/angular/pull/11846
  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: EmitterVisitorContext): any {
    if (ast.entries.length === 0) {
      ctx.print('(');
    }
    const result = super.visitLiteralArrayExpr(ast, ctx);
    if (ast.entries.length === 0) {
      ctx.print(' as any[])');
    }
    return result;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    this._visitIdentifier(ast.value, ast.typeParams, ctx);
    return null;
  }

  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    if (ctx.isExportedVar(stmt.name) && stmt.value instanceof o.ExternalExpr && !stmt.type) {
      // check for a reexport
      const {name, filePath, members} = this._resolveStaticSymbol(stmt.value.value);
      if (members.length === 0 && filePath !== this._genFilePath) {
        let reexports = this.reexports.get(filePath);
        if (!reexports) {
          reexports = [];
          this.reexports.set(filePath, reexports);
        }
        reexports.push({name, as: stmt.name});
        return null;
      }
    }
    if (ctx.isExportedVar(stmt.name)) {
      ctx.print(`export `);
    }
    if (stmt.hasModifier(o.StmtModifier.Final)) {
      ctx.print(`const`);
    } else {
      ctx.print(`var`);
    }
    ctx.print(` ${stmt.name}:`);
    this.visitType(stmt.type, ctx);
    ctx.print(` = `);
    stmt.value.visitExpression(this, ctx);
    ctx.println(`;`);
    return null;
  }

  visitCastExpr(ast: o.CastExpr, ctx: EmitterVisitorContext): any {
    ctx.print(`(<`);
    ast.type.visitType(this, ctx);
    ctx.print(`>`);
    ast.value.visitExpression(this, ctx);
    ctx.print(`)`);
    return null;
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, ctx: EmitterVisitorContext): any {
    ctx.print(`new `);
    this.typeExpression++;
    ast.classExpr.visitExpression(this, ctx);
    this.typeExpression--;
    ctx.print(`(`);
    this.visitAllExpressions(ast.args, ctx, ',');
    ctx.print(`)`);
    return null;
  }

  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any {
    ctx.pushClass(stmt);
    if (ctx.isExportedVar(stmt.name)) {
      ctx.print(`export `);
    }
    ctx.print(`class ${stmt.name}`);
    if (isPresent(stmt.parent)) {
      ctx.print(` extends `);
      this.typeExpression++;
      stmt.parent.visitExpression(this, ctx);
      this.typeExpression--;
    }
    ctx.println(` {`);
    ctx.incIndent();
    stmt.fields.forEach((field) => this._visitClassField(field, ctx));
    if (isPresent(stmt.constructorMethod)) {
      this._visitClassConstructor(stmt, ctx);
    }
    stmt.getters.forEach((getter) => this._visitClassGetter(getter, ctx));
    stmt.methods.forEach((method) => this._visitClassMethod(method, ctx));
    ctx.decIndent();
    ctx.println(`}`);
    ctx.popClass();
    return null;
  }

  private _visitClassField(field: o.ClassField, ctx: EmitterVisitorContext) {
    if (field.hasModifier(o.StmtModifier.Private)) {
      // comment out as a workaround for #10967
      ctx.print(`/*private*/ `);
    }
    ctx.print(field.name);
    ctx.print(':');
    this.visitType(field.type, ctx);
    ctx.println(`;`);
  }

  private _visitClassGetter(getter: o.ClassGetter, ctx: EmitterVisitorContext) {
    if (getter.hasModifier(o.StmtModifier.Private)) {
      ctx.print(`private `);
    }
    ctx.print(`get ${getter.name}()`);
    ctx.print(':');
    this.visitType(getter.type, ctx);
    ctx.println(` {`);
    ctx.incIndent();
    this.visitAllStatements(getter.body, ctx);
    ctx.decIndent();
    ctx.println(`}`);
  }

  private _visitClassConstructor(stmt: o.ClassStmt, ctx: EmitterVisitorContext) {
    ctx.print(`constructor(`);
    this._visitParams(stmt.constructorMethod.params, ctx);
    ctx.println(`) {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.constructorMethod.body, ctx);
    ctx.decIndent();
    ctx.println(`}`);
  }

  private _visitClassMethod(method: o.ClassMethod, ctx: EmitterVisitorContext) {
    if (method.hasModifier(o.StmtModifier.Private)) {
      ctx.print(`private `);
    }
    ctx.print(`${method.name}(`);
    this._visitParams(method.params, ctx);
    ctx.print(`):`);
    this.visitType(method.type, ctx, 'void');
    ctx.println(` {`);
    ctx.incIndent();
    this.visitAllStatements(method.body, ctx);
    ctx.decIndent();
    ctx.println(`}`);
  }

  visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any {
    ctx.print(`(`);
    this._visitParams(ast.params, ctx);
    ctx.print(`):`);
    this.visitType(ast.type, ctx, 'void');
    ctx.println(` => {`);
    ctx.incIndent();
    this.visitAllStatements(ast.statements, ctx);
    ctx.decIndent();
    ctx.print(`}`);
    return null;
  }

  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any {
    if (ctx.isExportedVar(stmt.name)) {
      ctx.print(`export `);
    }
    ctx.print(`function ${stmt.name}(`);
    this._visitParams(stmt.params, ctx);
    ctx.print(`):`);
    this.visitType(stmt.type, ctx, 'void');
    ctx.println(` {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.statements, ctx);
    ctx.decIndent();
    ctx.println(`}`);
    return null;
  }

  visitTryCatchStmt(stmt: o.TryCatchStmt, ctx: EmitterVisitorContext): any {
    ctx.println(`try {`);
    ctx.incIndent();
    this.visitAllStatements(stmt.bodyStmts, ctx);
    ctx.decIndent();
    ctx.println(`} catch (${CATCH_ERROR_VAR.name}) {`);
    ctx.incIndent();
    const catchStmts =
        [<o.Statement>CATCH_STACK_VAR.set(CATCH_ERROR_VAR.prop('stack')).toDeclStmt(null, [
          o.StmtModifier.Final
        ])].concat(stmt.catchStmts);
    this.visitAllStatements(catchStmts, ctx);
    ctx.decIndent();
    ctx.println(`}`);
    return null;
  }

  visitBuiltintType(type: o.BuiltinType, ctx: EmitterVisitorContext): any {
    let typeStr: string;
    switch (type.name) {
      case o.BuiltinTypeName.Bool:
        typeStr = 'boolean';
        break;
      case o.BuiltinTypeName.Dynamic:
        typeStr = 'any';
        break;
      case o.BuiltinTypeName.Function:
        typeStr = 'Function';
        break;
      case o.BuiltinTypeName.Number:
        typeStr = 'number';
        break;
      case o.BuiltinTypeName.Int:
        typeStr = 'number';
        break;
      case o.BuiltinTypeName.String:
        typeStr = 'string';
        break;
      default:
        throw new Error(`Unsupported builtin type ${type.name}`);
    }
    ctx.print(typeStr);
    return null;
  }

  visitExpressionType(ast: o.ExpressionType, ctx: EmitterVisitorContext): any {
    ast.value.visitExpression(this, ctx);
    return null;
  }

  visitArrayType(type: o.ArrayType, ctx: EmitterVisitorContext): any {
    this.visitType(type.of, ctx);
    ctx.print(`[]`);
    return null;
  }

  visitMapType(type: o.MapType, ctx: EmitterVisitorContext): any {
    ctx.print(`{[key: string]:`);
    this.visitType(type.valueType, ctx);
    ctx.print(`}`);
    return null;
  }

  getBuiltinMethodName(method: o.BuiltinMethod): string {
    let name: string;
    switch (method) {
      case o.BuiltinMethod.ConcatArray:
        name = 'concat';
        break;
      case o.BuiltinMethod.SubscribeObservable:
        name = 'subscribe';
        break;
      case o.BuiltinMethod.Bind:
        name = 'bind';
        break;
      default:
        throw new Error(`Unknown builtin method: ${method}`);
    }
    return name;
  }

  private _visitParams(params: o.FnParam[], ctx: EmitterVisitorContext): void {
    this.visitAllObjects(param => {
      ctx.print(param.name);
      ctx.print(':');
      this.visitType(param.type, ctx);
    }, params, ctx, ',');
  }

  private _resolveStaticSymbol(value: CompileIdentifierMetadata):
      {name: string, filePath: string, members?: string[], arity?: number} {
    const reference = value.reference;
    if (!(reference instanceof StaticSymbol)) {
      throw new Error(`Internal error: unknown identifier ${JSON.stringify(value)}`);
    }
    const arity = this._importResolver.getTypeArity(reference) || undefined;
    const importReference = this._importResolver.getImportAs(reference) || reference;
    return {
      name: importReference.name,
      filePath: importReference.filePath,
      members: importReference.members, arity
    };
  }

  private _visitIdentifier(
      value: CompileIdentifierMetadata, typeParams: o.Type[], ctx: EmitterVisitorContext): void {
    const {name, filePath, members, arity} = this._resolveStaticSymbol(value);
    if (filePath != this._genFilePath) {
      let prefix = this.importsWithPrefixes.get(filePath);
      if (isBlank(prefix)) {
        prefix = `import${this.importsWithPrefixes.size}`;
        this.importsWithPrefixes.set(filePath, prefix);
      }
      ctx.print(`${prefix}.`);
    }
    if (members.length) {
      ctx.print(name);
      ctx.print('.');
      ctx.print(members.join('.'));
    } else {
      ctx.print(name);
    }

    if (this.typeExpression > 0) {
      // If we are in a type expreession that refers to a generic type then supply
      // the required type parameters. If there were not enough type parameters
      // supplied, supply any as the type. Outside a type expression the reference
      // should not supply type parameters and be treated as a simple value reference
      // to the constructor function itself.
      const suppliedParameters = (typeParams && typeParams.length) || 0;
      const additionalParameters = (arity || 0) - suppliedParameters;
      if (suppliedParameters > 0 || additionalParameters > 0) {
        ctx.print(`<`);
        if (suppliedParameters > 0) {
          this.visitAllObjects(type => type.visitType(this, ctx), typeParams, ctx, ',');
        }
        if (additionalParameters > 0) {
          for (let i = 0; i < additionalParameters; i++) {
            if (i > 0 || suppliedParameters > 0) ctx.print(',');
            ctx.print('any');
          }
        }
        ctx.print(`>`);
      }
    }
  }
}

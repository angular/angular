import * as o from './output_ast';
import {
  isPresent,
  isBlank,
  isString,
  evalExpression,
  RegExpWrapper,
  StringWrapper,
  isArray
} from 'angular2/src/facade/lang';
import {CompileIdentifierMetadata} from '../compile_metadata';
import {BaseException} from 'angular2/src/facade/exceptions';
import {
  OutputEmitter,
  EmitterVisitorContext,
  AbstractEmitterVisitor,
  CATCH_ERROR_VAR,
  CATCH_STACK_VAR
} from './abstract_emitter';
import {getImportModulePath, ImportEnv} from './path_util';

var _debugModuleUrl = 'asset://debug/lib';

export function debugOutputAstAsTypeScript(ast: o.Statement | o.Expression | o.Type |
                                           any[]): string {
  var converter = new _TsEmitterVisitor(_debugModuleUrl);
  var ctx = EmitterVisitorContext.createRoot([]);
  var asts: any[];
  if (isArray(ast)) {
    asts = <any[]>ast;
  } else {
    asts = [ast];
  }
  asts.forEach((ast) => {
    if (ast instanceof o.Statement) {
      ast.visitStatement(converter, ctx);
    } else if (ast instanceof o.Expression) {
      ast.visitExpression(converter, ctx);
    } else if (ast instanceof o.Type) {
      ast.visitType(converter, ctx);
    } else {
      throw new BaseException(`Don't know how to print debug info for ${ast}`);
    }
  });
  return ctx.toSource();
}

export class TypeScriptEmitter implements OutputEmitter {
  constructor() {}
  emitStatements(moduleUrl: string, stmts: o.Statement[], exportedVars: string[]): string {
    var converter = new _TsEmitterVisitor(moduleUrl);
    var ctx = EmitterVisitorContext.createRoot(exportedVars);
    converter.visitAllStatements(stmts, ctx);
    var srcParts = [];
    converter.importsWithPrefixes.forEach((prefix, importedModuleUrl) => {
      // Note: can't write the real word for import as it screws up system.js auto detection...
      srcParts.push(
          `imp` +
          `ort * as ${prefix} from '${getImportModulePath(moduleUrl, importedModuleUrl, ImportEnv.JS)}';`);
    });
    srcParts.push(ctx.toSource());
    return srcParts.join('\n');
  }
}

class _TsEmitterVisitor extends AbstractEmitterVisitor implements o.TypeVisitor {
  constructor(private _moduleUrl: string) { super(false); }

  importsWithPrefixes = new Map<string, string>();

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    this._visitIdentifier(ast.value, ast.typeParams, ctx);
    return null;
  }
  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    if (ctx.isExportedVar(stmt.name)) {
      ctx.print(`export `);
    }
    if (stmt.hasModifier(o.StmtModifier.Final)) {
      ctx.print(`const`);
    } else {
      ctx.print(`var`);
    }
    ctx.print(` ${stmt.name}`);
    if (isPresent(stmt.type)) {
      ctx.print(`:`);
      stmt.type.visitType(this, ctx);
    }
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
  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any {
    ctx.pushClass(stmt);
    if (ctx.isExportedVar(stmt.name)) {
      ctx.print(`export `);
    }
    ctx.print(`class ${stmt.name}`);
    if (isPresent(stmt.parent)) {
      ctx.print(` extends `);
      stmt.parent.visitExpression(this, ctx);
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
      ctx.print(`private `);
    }
    ctx.print(field.name);
    if (isPresent(field.type)) {
      ctx.print(`:`);
      field.type.visitType(this, ctx);
    } else {
      ctx.print(`: any`);
    }
    ctx.println(`;`);
  }
  private _visitClassGetter(getter: o.ClassGetter, ctx: EmitterVisitorContext) {
    if (getter.hasModifier(o.StmtModifier.Private)) {
      ctx.print(`private `);
    }
    ctx.print(`get ${getter.name}()`);
    if (isPresent(getter.type)) {
      ctx.print(`:`);
      getter.type.visitType(this, ctx);
    }
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
    if (isPresent(method.type)) {
      method.type.visitType(this, ctx);
    } else {
      ctx.print(`void`);
    }
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
    if (isPresent(ast.type)) {
      ast.type.visitType(this, ctx);
    } else {
      ctx.print(`void`);
    }
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
    if (isPresent(stmt.type)) {
      stmt.type.visitType(this, ctx);
    } else {
      ctx.print(`void`);
    }
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
    var catchStmts = [
      <o.Statement>CATCH_STACK_VAR.set(CATCH_ERROR_VAR.prop('stack'))
          .toDeclStmt(null, [o.StmtModifier.Final])
    ].concat(stmt.catchStmts);
    this.visitAllStatements(catchStmts, ctx);
    ctx.decIndent();
    ctx.println(`}`);
    return null;
  }

  visitBuiltintType(type: o.BuiltinType, ctx: EmitterVisitorContext): any {
    var typeStr;
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
        throw new BaseException(`Unsupported builtin type ${type.name}`);
    }
    ctx.print(typeStr);
    return null;
  }
  visitExternalType(ast: o.ExternalType, ctx: EmitterVisitorContext): any {
    this._visitIdentifier(ast.value, ast.typeParams, ctx);
    return null;
  }
  visitArrayType(type: o.ArrayType, ctx: EmitterVisitorContext): any {
    if (isPresent(type.of)) {
      type.of.visitType(this, ctx);
    } else {
      ctx.print(`any`);
    }
    ctx.print(`[]`);
    return null;
  }
  visitMapType(type: o.MapType, ctx: EmitterVisitorContext): any {
    ctx.print(`{[key: string]:`);
    if (isPresent(type.valueType)) {
      type.valueType.visitType(this, ctx);
    } else {
      ctx.print(`any`);
    }
    ctx.print(`}`);
    return null;
  }

  getBuiltinMethodName(method: o.BuiltinMethod): string {
    var name;
    switch (method) {
      case o.BuiltinMethod.ConcatArray:
        name = 'concat';
        break;
      case o.BuiltinMethod.SubscribeObservable:
        name = 'subscribe';
        break;
      case o.BuiltinMethod.bind:
        name = 'bind';
        break;
      default:
        throw new BaseException(`Unknown builtin method: ${method}`);
    }
    return name;
  }


  private _visitParams(params: o.FnParam[], ctx: EmitterVisitorContext): void {
    this.visitAllObjects((param) => {
      ctx.print(param.name);
      if (isPresent(param.type)) {
        ctx.print(`:`);
        param.type.visitType(this, ctx);
      }
    }, params, ctx, ',');
  }

  private _visitIdentifier(value: CompileIdentifierMetadata, typeParams: o.Type[],
                           ctx: EmitterVisitorContext): void {
    if (isPresent(value.moduleUrl) && value.moduleUrl != this._moduleUrl) {
      var prefix = this.importsWithPrefixes.get(value.moduleUrl);
      if (isBlank(prefix)) {
        prefix = `import${this.importsWithPrefixes.size}`;
        this.importsWithPrefixes.set(value.moduleUrl, prefix);
      }
      ctx.print(`${prefix}.`);
    }
    ctx.print(value.name);
    if (isPresent(typeParams) && typeParams.length > 0) {
      ctx.print(`<`);
      this.visitAllObjects((type) => type.visitType(this, ctx), typeParams, ctx, ',');
      ctx.print(`>`);
    }
  }
}

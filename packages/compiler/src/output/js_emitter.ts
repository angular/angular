/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {StaticSymbol} from '../aot/static_symbol';
import {CompileIdentifierMetadata} from '../compile_metadata';

import {EmitterVisitorContext, OutputEmitter} from './abstract_emitter';
import {AbstractJsEmitterVisitor} from './abstract_js_emitter';
import * as o from './output_ast';

export class JavaScriptEmitter implements OutputEmitter {
  emitStatements(genFilePath: string, stmts: o.Statement[], preamble: string = ''): string {
    const converter = new JsEmitterVisitor();
    const ctx = EmitterVisitorContext.createRoot();
    converter.visitAllStatements(stmts, ctx);

    const preambleLines = preamble ? preamble.split('\n') : [];
    converter.importsWithPrefixes.forEach((prefix, importedModuleName) => {
      // Note: can't write the real word for import as it screws up system.js auto detection...
      preambleLines.push(
          `var ${prefix} = req` +
          `uire('${importedModuleName}');`);
    });

    const sm = ctx.toSourceMapGenerator(genFilePath, preambleLines.length).toJsComment();
    const lines = [...preambleLines, ctx.toSource(), sm];
    if (sm) {
      // always add a newline at the end, as some tools have bugs without it.
      lines.push('');
    }
    return lines.join('\n');
  }
}

class JsEmitterVisitor extends AbstractJsEmitterVisitor {
  importsWithPrefixes = new Map<string, string>();

  visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any {
    const {name, moduleName} = ast.value;
    if (moduleName) {
      let prefix = this.importsWithPrefixes.get(moduleName);
      if (prefix == null) {
        prefix = `i${this.importsWithPrefixes.size}`;
        this.importsWithPrefixes.set(moduleName, prefix);
      }
      ctx.print(ast, `${prefix}.`);
    }
    ctx.print(ast, name!);
    return null;
  }
  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any {
    super.visitDeclareVarStmt(stmt, ctx);
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.println(stmt, exportVar(stmt.name));
    }
    return null;
  }
  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any {
    super.visitDeclareFunctionStmt(stmt, ctx);
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.println(stmt, exportVar(stmt.name));
    }
    return null;
  }
  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any {
    super.visitDeclareClassStmt(stmt, ctx);
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.println(stmt, exportVar(stmt.name));
    }
    return null;
  }
}

function exportVar(varName: string): string {
  return `Object.defineProperty(exports, '${varName}', { get: function() { return ${varName}; }});`;
}

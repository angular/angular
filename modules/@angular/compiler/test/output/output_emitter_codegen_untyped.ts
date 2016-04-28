// ATTENTION: This file will be overwritten with generated code by main()
import {print} from 'angular2/src/facade/lang';
import {unimplemented} from 'angular2/src/facade/exceptions';
import {codegenExportsVars, codegenStmts} from './output_emitter_util';
import {JavaScriptEmitter} from 'angular2/src/compiler/output/js_emitter';

export function getExpressions(): any {
  return unimplemented();
}

// Generator
export function main(args: string[]) {
  var emitter = new JavaScriptEmitter();
  var emittedCode =
      emitter.emitStatements('asset:angular2/test/compiler/output/output_emitter_codegen_untyped',
                             codegenStmts, codegenExportsVars);
  // debug: console.error(emittedCode);
  print(emittedCode);
}

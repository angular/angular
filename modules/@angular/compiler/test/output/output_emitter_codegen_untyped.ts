// ATTENTION: This file will be overwritten with generated code by main()
import {print} from '../../src/facade/lang';
import {unimplemented} from '../../src/facade/exceptions';
import {codegenExportsVars, codegenStmts} from './output_emitter_util';
import {JavaScriptEmitter} from '@angular/compiler/src/output/js_emitter';
import {assetUrl} from '../../src/util';

export function getExpressions(): any {
  return unimplemented();
}

// Generator
export function emit () {
  var emitter = new JavaScriptEmitter();
  var emittedCode =
    emitter.emitStatements(
      assetUrl('compiler', 'output/output_emitter_codegen_untyped', 'test'),
      codegenStmts, codegenExportsVars);
  return emittedCode;
}

export function main(args: string[]) {
  var emittedCode = emit();
  // debug: console.error(emittedCode);
  print(emittedCode);
}

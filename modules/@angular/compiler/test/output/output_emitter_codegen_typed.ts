// ATTENTION: This file will be overwritten with generated code by main()
import {print, IS_DART} from '../../src/facade/lang';
import {unimplemented} from '../../src/facade/exceptions';
import {codegenExportsVars, codegenStmts} from './output_emitter_util';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {DartEmitter} from '@angular/compiler/src/output/dart_emitter';
import * as o from '@angular/compiler/src/output/output_ast';

export function getExpressions(): any {
  return unimplemented();
}

// Generator
export function main(args: string[]) {
  var emitter = IS_DART ? new DartEmitter() : new TypeScriptEmitter();
  var emittedCode =
      emitter.emitStatements('asset:angular2/test/compiler/output/output_emitter_codegen_typed',
                             codegenStmts, codegenExportsVars);
  // debug: console.error(emittedCode);
  print(emittedCode);
}

// ATTENTION: This file will be overwritten with generated code by main()
import {print, IS_DART} from '../../src/facade/lang';
import {unimplemented} from '../../src/facade/exceptions';
import {codegenExportsVars, codegenStmts} from './output_emitter_util';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {DartEmitter} from '@angular/compiler/src/output/dart_emitter';
import {DartImportGenerator} from '@angular/compiler/src/output/dart_imports';
import * as o from '@angular/compiler/src/output/output_ast';
import {assetUrl} from '../../src/util';
import {SimpleJsImportGenerator} from '../offline_compiler_util';

export function getExpressions(): any {
  return unimplemented();
}

// Generator
export function emit() {
  var emitter = IS_DART ? new DartEmitter(new DartImportGenerator()) :
                          new TypeScriptEmitter(new SimpleJsImportGenerator());
  var emittedCode =
      emitter.emitStatements(assetUrl('compiler', 'output/output_emitter_codegen_typed', 'test'),
                             codegenStmts, codegenExportsVars);
  return emittedCode;
}

export function main(args: string[]) {
  var emittedCode = emit();
  // debug: console.error(emittedCode);
  print(emittedCode);
}

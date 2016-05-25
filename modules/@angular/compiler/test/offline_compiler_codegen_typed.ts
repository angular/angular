// ATTENTION: This file will be overwritten with generated code by main()
import {print, IS_DART} from '../src/facade/lang';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {DartEmitter} from '@angular/compiler/src/output/dart_emitter';
import {DartImportGenerator} from '@angular/compiler/src/output/dart_imports';
import * as o from '@angular/compiler/src/output/output_ast';
import {compileComp, compAMetadata} from './offline_compiler_util';
import {ComponentFactory} from '@angular/core/src/linker/component_factory';
import {CompA, SimpleJsImportGenerator} from './offline_compiler_util';

export const CompANgFactory: ComponentFactory<CompA> = null;

export function emit(): Promise<string> {
  var emitter = IS_DART ? new DartEmitter(new DartImportGenerator()) :
                          new TypeScriptEmitter(new SimpleJsImportGenerator());
  return compileComp(emitter, compAMetadata);
}

// Generator
export function main(args: string[]) {
  emit().then((source) => {
    // debug: console.error(source);
    print(source);
  });
}

// ATTENTION: This file will be overwritten with generated code by main()
import {print, IS_DART} from '../src/facade/lang';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {DartEmitter} from '@angular/compiler/src/output/dart_emitter';
import * as o from '@angular/compiler/src/output/output_ast';
import {compileComp, compAMetadata} from './offline_compiler_util';
import {ComponentFactory} from '@angular/core/src/linker/component_factory';

export const CompANgFactory: ComponentFactory = null;

// Generator
export function main(args: string[]) {
  var emitter = IS_DART ? new DartEmitter() : new TypeScriptEmitter();
  compileComp(emitter, compAMetadata)
      .then((source) => {
        // debug: console.error(source);
        print(source);
      });
}

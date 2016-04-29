// ATTENTION: This file will be overwritten with generated code by main()
import {print, IS_DART} from 'angular2/src/facade/lang';
import {TypeScriptEmitter} from 'angular2/src/compiler/output/ts_emitter';
import {DartEmitter} from 'angular2/src/compiler/output/dart_emitter';
import * as o from 'angular2/src/compiler/output/output_ast';
import {compileComp, compAMetadata} from './offline_compiler_util';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

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

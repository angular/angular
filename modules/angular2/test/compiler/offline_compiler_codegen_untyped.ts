// ATTENTION: This file will be overwritten with generated code by main()
import {print} from 'angular2/src/facade/lang';
import {JavaScriptEmitter} from 'angular2/src/compiler/output/js_emitter';
import {compileComp, compAMetadata} from './offline_compiler_util';
import {ComponentFactory} from 'angular2/src/core/linker/component_factory';

export const CompANgFactory: ComponentFactory = null;

// Generator
export function main(args: string[]) {
  var emitter = new JavaScriptEmitter();
  compileComp(emitter, compAMetadata)
      .then((source) => {
        // debug: console.error(source);
        print(source);
      });
}

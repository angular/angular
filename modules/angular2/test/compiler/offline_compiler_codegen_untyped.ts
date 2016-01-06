// ATTENTION: This file will be overwritten with generated code by main()
import {print} from 'angular2/src/facade/lang';
import {JavaScriptEmitter} from 'angular2/src/compiler/output/js_emitter';
import {compileComp, compAMetadata} from './offline_compiler_util';
import {HostViewFactory} from 'angular2/src/core/linker/view';

export const hostViewFactory_CompA: HostViewFactory = null;

// Generator
export function main(args: string[]) {
  var emitter = new JavaScriptEmitter();
  compileComp(emitter, compAMetadata)
      .then((source) => {
        // debug: console.error(source);
        print(source);
      });
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {COMPILER_OPTIONS, Compiler, CompilerOptions, Inject, Injectable} from '@angular/core';

import {NG2_CAPTURED_CONTENT_SELECTORS} from './constants';
import {isPresent} from './util';

@Injectable()
export class RuntimeCompilerCapturingFactory extends compiler.RuntimeCompilerFactory {
  constructor(
      @Inject(COMPILER_OPTIONS) defaultOptions: CompilerOptions[],
      @Inject(NG2_CAPTURED_CONTENT_SELECTORS) private _captured: CapturedContentSelectors) {
    super(defaultOptions);
  }
  createCompiler(options: CompilerOptions[] = []): Compiler {
    // Very ugly hack to get access to the compiler's internal objects.
    // Better here than in the compiler module itself, though.
    let runtimeCompiler: any = <any>super.createCompiler(options);
    let spy = this._captured;
    let originalCompileTemplate = runtimeCompiler._compileTemplate;
    runtimeCompiler._compileTemplate = function(template: any) {
      if (!template.isCompiled && !template.isHost) {
        const metadata = template.normalizedCompMeta;
        if (isPresent(metadata.template) && isPresent(metadata.template.ngContentSelectors)) {
          spy.ngContentSelectors[metadata.selector] = metadata.template.ngContentSelectors;
        }
      }
      return originalCompileTemplate.call(this, template);
    };
    return runtimeCompiler;
  }
}

@Injectable()
export class CapturedContentSelectors {
  ngContentSelectors: {[componentSelector: string]: string[]} = {};
}

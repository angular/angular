/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ɵReflectionCapabilities as ReflectionCapabilities, ɵstringify as stringify} from '@angular/core';

import {CompileReflector} from '../compile_reflector';
import * as o from '../output/output_ast';
import {getUrlScheme} from '../url_resolver';
import {MODULE_SUFFIX, ValueTransformer, noUndefined, syntaxError, visitValue} from '../util';

export class JitReflector implements CompileReflector {
  private reflectionCapabilities: ReflectionCapabilities;
  constructor() { this.reflectionCapabilities = new ReflectionCapabilities(); }
  componentModuleUrl(type: any, cmpMetadata: Component): string {
    const moduleId = cmpMetadata.moduleId;

    if (typeof moduleId === 'string') {
      const scheme = getUrlScheme(moduleId);
      return scheme ? moduleId : `package:${moduleId}${MODULE_SUFFIX}`;
    } else if (moduleId !== null && moduleId !== void 0) {
      throw syntaxError(
          `moduleId should be a string in "${stringify(type)}". See https://goo.gl/wIDDiL for more information.\n` +
          `If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.`);
    }

    return `./${stringify(type)}`;
  }
  parameters(typeOrFunc: /*Type*/ any): any[][] {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }
  annotations(typeOrFunc: /*Type*/ any): any[] {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }
  propMetadata(typeOrFunc: /*Type*/ any): {[key: string]: any[]} {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }
  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }
  resolveExternalReference(ref: o.ExternalReference): any { return ref.runtime; }
}
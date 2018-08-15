/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector} from '../compile_reflector';
import * as o from '../output/output_ast';

/**
 * Implementation of `CompileReflector` which resolves references to @angular/core
 * symbols at runtime, according to a consumer-provided mapping.
 *
 * Only supports `resolveExternalReference`, all other methods throw.
 */
export class R3JitReflector implements CompileReflector {
  constructor(private context: {[key: string]: any}) {}

  resolveExternalReference(ref: o.ExternalReference): any {
    // This reflector only handles @angular/core imports.
    if (ref.moduleName !== '@angular/core') {
      throw new Error(`Cannot resolve external reference to ${
          ref.moduleName}, only references to @angular/core are supported.`);
    }
    if (!this.context.hasOwnProperty(ref.name!)) {
      throw new Error(`No value provided for @angular/core symbol '${ref.name!}'.`);
    }
    return this.context[ref.name!];
  }

  parameters(typeOrFunc: any): any[][] {
    throw new Error('Not implemented.');
  }

  annotations(typeOrFunc: any): any[] {
    throw new Error('Not implemented.');
  }

  shallowAnnotations(typeOrFunc: any): any[] {
    throw new Error('Not implemented.');
  }

  tryAnnotations(typeOrFunc: any): any[] {
    throw new Error('Not implemented.');
  }

  propMetadata(typeOrFunc: any): {[key: string]: any[];} {
    throw new Error('Not implemented.');
  }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    throw new Error('Not implemented.');
  }

  guards(typeOrFunc: any): {[key: string]: any;} {
    throw new Error('Not implemented.');
  }

  componentModuleUrl(type: any, cmpMetadata: any): string {
    throw new Error('Not implemented.');
  }
}

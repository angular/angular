/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
import {GetterFn, MethodFn, SetterFn} from './types';

export {PlatformReflectionCapabilities};
export {GetterFn, MethodFn, SetterFn};

/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector {
  constructor(public reflectionCapabilities: PlatformReflectionCapabilities) {}

  updateCapabilities(caps: PlatformReflectionCapabilities) {
    this.reflectionCapabilities = caps;
  }

  factory(type: Type<any>): Function {
    return this.reflectionCapabilities.factory(type);
  }

  parameters(typeOrFunc: Type<any>): any[][] {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }

  annotations(typeOrFunc: Type<any>): any[] {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }

  propMetadata(typeOrFunc: Type<any>): {[key: string]: any[]} {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }

  getter(name: string): GetterFn {
    return this.reflectionCapabilities.getter(name);
  }

  setter(name: string): SetterFn {
    return this.reflectionCapabilities.setter(name);
  }

  method(name: string): MethodFn {
    return this.reflectionCapabilities.method(name);
  }

  importUri(type: any): string {
    return this.reflectionCapabilities.importUri(type);
  }

  resourceUri(type: any): string {
    return this.reflectionCapabilities.resourceUri(type);
  }

  resolveIdentifier(name: string, moduleUrl: string, members: string[], runtime: any): any {
    return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, members, runtime);
  }

  resolveEnum(identifier: any, name: string): any {
    return this.reflectionCapabilities.resolveEnum(identifier, name);
  }
}

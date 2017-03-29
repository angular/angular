/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
import {ReflectorReader} from './reflector_reader';
import {GetterFn, MethodFn, SetterFn} from './types';

export {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
export {GetterFn, MethodFn, SetterFn} from './types';

/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector extends ReflectorReader {
  constructor(public reflectionCapabilities: PlatformReflectionCapabilities) { super(); }

  updateCapabilities(caps: PlatformReflectionCapabilities) { this.reflectionCapabilities = caps; }

  factory(type: Type<any>): Function { return this.reflectionCapabilities.factory(type); }

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

  getter(name: string): GetterFn { return this.reflectionCapabilities.getter(name); }

  setter(name: string): SetterFn { return this.reflectionCapabilities.setter(name); }

  method(name: string): MethodFn { return this.reflectionCapabilities.method(name); }

  importUri(type: any): string { return this.reflectionCapabilities.importUri(type); }

  resourceUri(type: any): string { return this.reflectionCapabilities.resourceUri(type); }

  resolveIdentifier(name: string, moduleUrl: string, members: string[]|null, runtime: any): any {
    return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, members, runtime);
  }

  resolveEnum(identifier: any, name: string): any {
    return this.reflectionCapabilities.resolveEnum(identifier, name);
  }
}

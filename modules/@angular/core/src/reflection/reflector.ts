/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MapWrapper} from '../facade/collection';
import {Type} from '../type';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
import {ReflectorReader} from './reflector_reader';
import {GetterFn, MethodFn, SetterFn} from './types';

export {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
export {GetterFn, MethodFn, SetterFn} from './types';


/**
 * Reflective information about a symbol, including annotations, interfaces, and other metadata.
 */
export class ReflectionInfo {
  constructor(
      public annotations?: any[], public parameters?: any[][], public factory?: Function,
      public interfaces?: any[], public propMetadata?: {[key: string]: any[]}) {}
}

/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export class Reflector extends ReflectorReader {
  /** @internal */
  _injectableInfo = new Map<any, ReflectionInfo>();
  /** @internal */
  _getters = new Map<string, GetterFn>();
  /** @internal */
  _setters = new Map<string, SetterFn>();
  /** @internal */
  _methods = new Map<string, MethodFn>();
  /** @internal */
  _usedKeys: Set<any> = null;

  constructor(public reflectionCapabilities: PlatformReflectionCapabilities) { super(); }

  updateCapabilities(caps: PlatformReflectionCapabilities) { this.reflectionCapabilities = caps; }

  isReflectionEnabled(): boolean { return this.reflectionCapabilities.isReflectionEnabled(); }

  /**
   * Causes `this` reflector to track keys used to access
   * {@link ReflectionInfo} objects.
   */
  trackUsage(): void { this._usedKeys = new Set(); }

  /**
   * Lists types for which reflection information was not requested since
   * {@link #trackUsage} was called. This list could later be audited as
   * potential dead code.
   */
  listUnusedKeys(): any[] {
    if (!this._usedKeys) {
      throw new Error('Usage tracking is disabled');
    }
    const allTypes = MapWrapper.keys(this._injectableInfo);
    return allTypes.filter(key => !this._usedKeys.has(key));
  }

  registerFunction(func: Function, funcInfo: ReflectionInfo): void {
    this._injectableInfo.set(func, funcInfo);
  }

  registerType(type: Type<any>, typeInfo: ReflectionInfo): void {
    this._injectableInfo.set(type, typeInfo);
  }

  registerGetters(getters: {[key: string]: GetterFn}): void { _mergeMaps(this._getters, getters); }

  registerSetters(setters: {[key: string]: SetterFn}): void { _mergeMaps(this._setters, setters); }

  registerMethods(methods: {[key: string]: MethodFn}): void { _mergeMaps(this._methods, methods); }

  factory(type: Type<any>): Function {
    if (this._containsReflectionInfo(type)) {
      return this._getReflectionInfo(type).factory || null;
    }

    return this.reflectionCapabilities.factory(type);
  }

  parameters(typeOrFunc: Type<any>): any[][] {
    if (this._injectableInfo.has(typeOrFunc)) {
      return this._getReflectionInfo(typeOrFunc).parameters || [];
    }

    return this.reflectionCapabilities.parameters(typeOrFunc);
  }

  annotations(typeOrFunc: Type<any>): any[] {
    if (this._injectableInfo.has(typeOrFunc)) {
      return this._getReflectionInfo(typeOrFunc).annotations || [];
    }

    return this.reflectionCapabilities.annotations(typeOrFunc);
  }

  propMetadata(typeOrFunc: Type<any>): {[key: string]: any[]} {
    if (this._injectableInfo.has(typeOrFunc)) {
      return this._getReflectionInfo(typeOrFunc).propMetadata || {};
    }

    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }

  interfaces(type: Type<any>): any[] {
    if (this._injectableInfo.has(type)) {
      return this._getReflectionInfo(type).interfaces || [];
    }

    return this.reflectionCapabilities.interfaces(type);
  }

  hasLifecycleHook(type: any, lcInterface: Type<any>, lcProperty: string): boolean {
    if (this.interfaces(type).indexOf(lcInterface) !== -1) {
      return true;
    }

    return this.reflectionCapabilities.hasLifecycleHook(type, lcInterface, lcProperty);
  }

  getter(name: string): GetterFn {
    return this._getters.has(name) ? this._getters.get(name) :
                                     this.reflectionCapabilities.getter(name);
  }

  setter(name: string): SetterFn {
    return this._setters.has(name) ? this._setters.get(name) :
                                     this.reflectionCapabilities.setter(name);
  }

  method(name: string): MethodFn {
    return this._methods.has(name) ? this._methods.get(name) :
                                     this.reflectionCapabilities.method(name);
  }

  /** @internal */
  _getReflectionInfo(typeOrFunc: any): ReflectionInfo {
    if (this._usedKeys) {
      this._usedKeys.add(typeOrFunc);
    }

    return this._injectableInfo.get(typeOrFunc);
  }

  /** @internal */
  _containsReflectionInfo(typeOrFunc: any) { return this._injectableInfo.has(typeOrFunc); }

  importUri(type: any): string { return this.reflectionCapabilities.importUri(type); }

  resolveIdentifier(name: string, moduleUrl: string, runtime: any): any {
    return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, runtime);
  }
  resolveEnum(identifier: any, name: string): any {
    return this.reflectionCapabilities.resolveEnum(identifier, name);
  }
}

function _mergeMaps(target: Map<string, Function>, config: {[key: string]: Function}): void {
  Object.keys(config).forEach(k => { target.set(k, config[k]); });
}

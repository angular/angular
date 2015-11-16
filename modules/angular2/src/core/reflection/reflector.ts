import {Type, isPresent, stringify} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {
  ListWrapper,
  Map,
  MapWrapper,
  Set,
  SetWrapper,
  StringMapWrapper
} from 'angular2/src/facade/collection';
import {SetterFn, GetterFn, MethodFn} from './types';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
export {SetterFn, GetterFn, MethodFn} from './types';
export {PlatformReflectionCapabilities} from './platform_reflection_capabilities';

export class ReflectionInfo {
  constructor(public annotations?: any[], public parameters?: any[][], public factory?: Function,
              public interfaces?: any[], public propMetadata?: {[key: string]: any[]}) {}
}

export class Reflector {
  /** @internal */
  _injectableInfo = new Map<any, ReflectionInfo>();
  /** @internal */
  _getters = new Map<string, GetterFn>();
  /** @internal */
  _setters = new Map<string, SetterFn>();
  /** @internal */
  _methods = new Map<string, MethodFn>();
  /** @internal */
  _usedKeys: Set<any>;
  reflectionCapabilities: PlatformReflectionCapabilities;

  constructor(reflectionCapabilities: PlatformReflectionCapabilities) {
    this._usedKeys = null;
    this.reflectionCapabilities = reflectionCapabilities;
  }

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
    if (this._usedKeys == null) {
      throw new BaseException('Usage tracking is disabled');
    }
    var allTypes = MapWrapper.keys(this._injectableInfo);
    return allTypes.filter(key => !SetWrapper.has(this._usedKeys, key));
  }

  registerFunction(func: Function, funcInfo: ReflectionInfo): void {
    this._injectableInfo.set(func, funcInfo);
  }

  registerType(type: Type, typeInfo: ReflectionInfo): void {
    this._injectableInfo.set(type, typeInfo);
  }

  registerGetters(getters: {[key: string]: GetterFn}): void { _mergeMaps(this._getters, getters); }

  registerSetters(setters: {[key: string]: SetterFn}): void { _mergeMaps(this._setters, setters); }

  registerMethods(methods: {[key: string]: MethodFn}): void { _mergeMaps(this._methods, methods); }

  factory(type: Type): Function {
    if (this._containsReflectionInfo(type)) {
      var res = this._getReflectionInfo(type).factory;
      return isPresent(res) ? res : null;
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOrFunc: /*Type*/ any): any[] {
    if (this._injectableInfo.has(typeOrFunc)) {
      var res = this._getReflectionInfo(typeOrFunc).parameters;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.parameters(typeOrFunc);
    }
  }

  annotations(typeOrFunc: /*Type*/ any): any[] {
    if (this._injectableInfo.has(typeOrFunc)) {
      var res = this._getReflectionInfo(typeOrFunc).annotations;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.annotations(typeOrFunc);
    }
  }

  propMetadata(typeOrFunc: /*Type*/ any): {[key: string]: any[]} {
    if (this._injectableInfo.has(typeOrFunc)) {
      var res = this._getReflectionInfo(typeOrFunc).propMetadata;
      return isPresent(res) ? res : {};
    } else {
      return this.reflectionCapabilities.propMetadata(typeOrFunc);
    }
  }

  interfaces(type: Type): any[] {
    if (this._injectableInfo.has(type)) {
      var res = this._getReflectionInfo(type).interfaces;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.interfaces(type);
    }
  }

  getter(name: string): GetterFn {
    if (this._getters.has(name)) {
      return this._getters.get(name);
    } else {
      return this.reflectionCapabilities.getter(name);
    }
  }

  setter(name: string): SetterFn {
    if (this._setters.has(name)) {
      return this._setters.get(name);
    } else {
      return this.reflectionCapabilities.setter(name);
    }
  }

  method(name: string): MethodFn {
    if (this._methods.has(name)) {
      return this._methods.get(name);
    } else {
      return this.reflectionCapabilities.method(name);
    }
  }

  /** @internal */
  _getReflectionInfo(typeOrFunc) {
    if (isPresent(this._usedKeys)) {
      this._usedKeys.add(typeOrFunc);
    }
    return this._injectableInfo.get(typeOrFunc);
  }

  /** @internal */
  _containsReflectionInfo(typeOrFunc) { return this._injectableInfo.has(typeOrFunc); }

  importUri(type: Type): string { return this.reflectionCapabilities.importUri(type); }
}

function _mergeMaps(target: Map<any, any>, config: {[key: string]: Function}): void {
  StringMapWrapper.forEach(config, (v, k) => target.set(k, v));
}

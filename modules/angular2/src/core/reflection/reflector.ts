import {Type, isPresent, stringify, BaseException} from 'angular2/src/core/facade/lang';
import {
  ListWrapper,
  Map,
  MapWrapper,
  Set,
  SetWrapper,
  StringMap,
  StringMapWrapper
} from 'angular2/src/core/facade/collection';
import {SetterFn, GetterFn, MethodFn} from './types';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
export {SetterFn, GetterFn, MethodFn} from './types';
export {PlatformReflectionCapabilities} from './platform_reflection_capabilities';

export class ReflectionInfo {
  _factory: Function;
  _annotations: any[];
  _parameters: any[][];
  _interfaces: any[];

  constructor(annotations?: any[], parameters?: any[][], factory?: Function, interfaces?: any[]) {
    this._annotations = annotations;
    this._parameters = parameters;
    this._factory = factory;
    this._interfaces = interfaces;
  }
}

export class Reflector {
  _injectableInfo: Map<any, ReflectionInfo>;
  _getters: Map<string, GetterFn>;
  _setters: Map<string, SetterFn>;
  _methods: Map<string, MethodFn>;
  _usedKeys: Set<any>;
  reflectionCapabilities: PlatformReflectionCapabilities;

  constructor(reflectionCapabilities: PlatformReflectionCapabilities) {
    this._injectableInfo = new Map();
    this._getters = new Map();
    this._setters = new Map();
    this._methods = new Map();
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
    return ListWrapper.filter(allTypes, (key) => { return !SetWrapper.has(this._usedKeys, key); });
  }

  registerFunction(func: Function, funcInfo: ReflectionInfo): void {
    this._injectableInfo.set(func, funcInfo);
  }

  registerType(type: Type, typeInfo: ReflectionInfo): void {
    this._injectableInfo.set(type, typeInfo);
  }

  registerGetters(getters: StringMap<string, GetterFn>): void {
    _mergeMaps(this._getters, getters);
  }

  registerSetters(setters: StringMap<string, SetterFn>): void {
    _mergeMaps(this._setters, setters);
  }

  registerMethods(methods: StringMap<string, MethodFn>): void {
    _mergeMaps(this._methods, methods);
  }

  factory(type: Type): Function {
    if (this._containsReflectionInfo(type)) {
      var res = this._getReflectionInfo(type)._factory;
      return isPresent(res) ? res : null;
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOrFunc: /*Type*/ any): any[] {
    if (this._injectableInfo.has(typeOrFunc)) {
      var res = this._getReflectionInfo(typeOrFunc)._parameters;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.parameters(typeOrFunc);
    }
  }

  annotations(typeOrFunc: /*Type*/ any): any[] {
    if (this._injectableInfo.has(typeOrFunc)) {
      var res = this._getReflectionInfo(typeOrFunc)._annotations;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.annotations(typeOrFunc);
    }
  }

  interfaces(type: Type): any[] {
    if (this._injectableInfo.has(type)) {
      var res = this._getReflectionInfo(type)._interfaces;
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

  _getReflectionInfo(typeOrFunc) {
    if (isPresent(this._usedKeys)) {
      this._usedKeys.add(typeOrFunc);
    }
    return this._injectableInfo.get(typeOrFunc);
  }

  _containsReflectionInfo(typeOrFunc) { return this._injectableInfo.has(typeOrFunc); }

  importUri(type: Type): string { return this.reflectionCapabilities.importUri(type); }
}

function _mergeMaps(target: Map<any, any>, config: StringMap<string, Function>): void {
  StringMapWrapper.forEach(config, (v, k) => target.set(k, v));
}

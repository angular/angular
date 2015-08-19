import {ExpandoWrapper, Type, isPresent, stringify, BaseException} from 'angular2/src/facade/lang';
import {
  List,
  ListWrapper,
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper
} from 'angular2/src/facade/collection';
import {SetterFn, GetterFn, MethodFn} from './types';
import {PlatformReflectionCapabilities} from './platform_reflection_capabilities';
export {SetterFn, GetterFn, MethodFn} from './types';
export {PlatformReflectionCapabilities} from './platform_reflection_capabilities';

export class ReflectionInfo {
  _factory: Function;
  _annotations: List<any>;
  _parameters: List<List<any>>;
  _interfaces: List<any>;

  constructor(annotations?: List<any>, parameters?: List<List<any>>, factory?: Function,
              interfaces?: List<any>) {
    this._annotations = annotations;
    this._parameters = parameters;
    this._factory = factory;
    this._interfaces = interfaces;
  }
}

export class Reflector {
  _injectableInfo: ExpandoWrapper<ReflectionInfo>;
  _getters: Map<string, GetterFn>;
  _setters: Map<string, SetterFn>;
  _methods: Map<string, MethodFn>;
  reflectionCapabilities: PlatformReflectionCapabilities;

  constructor(reflectionCapabilities: PlatformReflectionCapabilities) {
    this._injectableInfo = new ExpandoWrapper<ReflectionInfo>('injectable_info');
    this._getters = new Map();
    this._setters = new Map();
    this._methods = new Map();
    this.reflectionCapabilities = reflectionCapabilities;
  }

  isReflectionEnabled(): boolean { return this.reflectionCapabilities.isReflectionEnabled(); }

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
      var res = this._injectableInfo.get(type)._factory;
      return isPresent(res) ? res : null;
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOrFunc: /*Type*/ any): List<any> {
    if (this._containsReflectionInfo(typeOrFunc)) {
      var res = this._injectableInfo.get(typeOrFunc)._parameters;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.parameters(typeOrFunc);
    }
  }

  annotations(typeOrFunc: /*Type*/ any): List<any> {
    if (this._containsReflectionInfo(typeOrFunc)) {
      var res = this._injectableInfo.get(typeOrFunc)._annotations;
      return isPresent(res) ? res : [];
    } else {
      return this.reflectionCapabilities.annotations(typeOrFunc);
    }
  }

  interfaces(type: Type): List<any> {
    if (this._containsReflectionInfo(type)) {
      var res = this._injectableInfo.get(type)._interfaces;
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

  _containsReflectionInfo(typeOrFunc) { return isPresent(this._injectableInfo.get(typeOrFunc)); }
}

function _mergeMaps(target: Map<any, any>, config: StringMap<string, Function>): void {
  StringMapWrapper.forEach(config, (v, k) => target.set(k, v));
}

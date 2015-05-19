import {Type, isPresent, stringify, BaseException} from 'angular2/src/facade/lang';
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

export class Reflector {
  _typeInfo: Map<Type, any>;
  _getters: Map<string, GetterFn>;
  _setters: Map<string, SetterFn>;
  _methods: Map<string, MethodFn>;
  reflectionCapabilities: PlatformReflectionCapabilities;

  constructor(reflectionCapabilities: PlatformReflectionCapabilities) {
    this._typeInfo = MapWrapper.create();
    this._getters = MapWrapper.create();
    this._setters = MapWrapper.create();
    this._methods = MapWrapper.create();
    this.reflectionCapabilities = reflectionCapabilities;
  }

  registerType(type: Type, typeInfo: StringMap<string, any>): void {
    MapWrapper.set(this._typeInfo, type, typeInfo);
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
    if (this._containsTypeInfo(type)) {
      return this._getTypeInfoField(type, "factory", null);
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOrFunc): List<any> {
    if (MapWrapper.contains(this._typeInfo, typeOrFunc)) {
      return this._getTypeInfoField(typeOrFunc, "parameters", []);
    } else {
      return this.reflectionCapabilities.parameters(typeOrFunc);
    }
  }

  annotations(typeOrFunc): List<any> {
    if (MapWrapper.contains(this._typeInfo, typeOrFunc)) {
      return this._getTypeInfoField(typeOrFunc, "annotations", []);
    } else {
      return this.reflectionCapabilities.annotations(typeOrFunc);
    }
  }

  interfaces(type): List<any> {
    if (MapWrapper.contains(this._typeInfo, type)) {
      return this._getTypeInfoField(type, "interfaces", []);
    } else {
      return this.reflectionCapabilities.interfaces(type);
    }
  }

  getter(name: string): GetterFn {
    if (MapWrapper.contains(this._getters, name)) {
      return MapWrapper.get(this._getters, name);
    } else {
      return this.reflectionCapabilities.getter(name);
    }
  }

  setter(name: string): SetterFn {
    if (MapWrapper.contains(this._setters, name)) {
      return MapWrapper.get(this._setters, name);
    } else {
      return this.reflectionCapabilities.setter(name);
    }
  }

  method(name: string): MethodFn {
    if (MapWrapper.contains(this._methods, name)) {
      return MapWrapper.get(this._methods, name);
    } else {
      return this.reflectionCapabilities.method(name);
    }
  }

  _getTypeInfoField(typeOrFunc, key, defaultValue) {
    var res = MapWrapper.get(this._typeInfo, typeOrFunc)[key];
    return isPresent(res) ? res : defaultValue;
  }

  _containsTypeInfo(typeOrFunc) { return MapWrapper.contains(this._typeInfo, typeOrFunc); }
}

function _mergeMaps(target: Map<any, any>, config: StringMap<string, Function>): void {
  StringMapWrapper.forEach(config, (v, k) => MapWrapper.set(target, k, v));
}

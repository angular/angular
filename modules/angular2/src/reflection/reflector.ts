import {Type, isPresent, stringify, BaseException} from 'angular2/src/facade/lang';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {SetterFn, GetterFn, MethodFn} from './types';
export {SetterFn, GetterFn, MethodFn} from './types';

export class Reflector {
  _typeInfo: Map<Type, any>;
  _getters: Map<string, GetterFn>;
  _setters: Map<string, SetterFn>;
  _methods: Map<string, MethodFn>;
  reflectionCapabilities: any;

  constructor(reflectionCapabilities) {
    this._typeInfo = MapWrapper.create();
    this._getters = MapWrapper.create();
    this._setters = MapWrapper.create();
    this._methods = MapWrapper.create();
    this.reflectionCapabilities = reflectionCapabilities;
  }

  registerType(type: Type, typeInfo: Map<Type, any>): void {
    MapWrapper.set(this._typeInfo, type, typeInfo);
  }

  registerGetters(getters: Map<string, GetterFn>): void { _mergeMaps(this._getters, getters); }

  registerSetters(setters: Map<string, SetterFn>): void { _mergeMaps(this._setters, setters); }

  registerMethods(methods: Map<string, MethodFn>): void { _mergeMaps(this._methods, methods); }

  factory(type: Type): Function {
    if (MapWrapper.contains(this._typeInfo, type)) {
      return MapWrapper.get(this._typeInfo, type)["factory"];
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOfFunc): List<any> {
    if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
      return MapWrapper.get(this._typeInfo, typeOfFunc)["parameters"];
    } else {
      return this.reflectionCapabilities.parameters(typeOfFunc);
    }
  }

  annotations(typeOfFunc): List<any> {
    if (MapWrapper.contains(this._typeInfo, typeOfFunc)) {
      return MapWrapper.get(this._typeInfo, typeOfFunc)["annotations"];
    } else {
      return this.reflectionCapabilities.annotations(typeOfFunc);
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
}

function _mergeMaps(target: Map<any, any>, config: Map<string, Function>): void {
  StringMapWrapper.forEach(config, (v, k) => MapWrapper.set(target, k, v));
}

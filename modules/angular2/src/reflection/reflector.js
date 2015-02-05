import {Type, isPresent, stringify, BaseException} from 'angular2/src/facade/lang';
import {List, ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {SetterFn, GetterFn, MethodFn} from './types';
export {SetterFn, GetterFn, MethodFn} from './types';

export class Reflector {
  _typeInfo:Map;
  _getters:Map;
  _setters:Map;
  _methods:Map;
  reflectionCapabilities:any;

  constructor(reflectionCapabilities) {
    this._typeInfo = MapWrapper.create();
    this._getters = MapWrapper.create();
    this._setters = MapWrapper.create();
    this._methods = MapWrapper.create();
    this.reflectionCapabilities = reflectionCapabilities;
  }

  registerType(type, typeInfo){
    MapWrapper.set(this._typeInfo, type, typeInfo);
  }

  registerGetters(getters){
    _mergeMaps(this._getters, getters);
  }

  registerSetters(setters){
    _mergeMaps(this._setters, setters);
  }

  registerMethods(methods){
    _mergeMaps(this._methods, methods);
  }

  factory(type:Type):Function {
    if(MapWrapper.contains(this._typeInfo, type)) {
      return MapWrapper.get(this._typeInfo, type)["factory"];
    } else {
      return this.reflectionCapabilities.factory(type);
    }
  }

  parameters(typeOfFunc):List {
    if(MapWrapper.contains(this._typeInfo, typeOfFunc)) {
      return MapWrapper.get(this._typeInfo, typeOfFunc)["parameters"];
    } else {
      return this.reflectionCapabilities.parameters(typeOfFunc);
    }
  }

  annotations(typeOfFunc):List {
    if(MapWrapper.contains(this._typeInfo, typeOfFunc)) {
      return MapWrapper.get(this._typeInfo, typeOfFunc)["annotations"];
    } else {
      return this.reflectionCapabilities.annotations(typeOfFunc);
    }
  }

  getter(name:string):GetterFn {
    if(MapWrapper.contains(this._getters, name)) {
      return MapWrapper.get(this._getters, name);
    } else {
      return this.reflectionCapabilities.getter(name);
    }
  }

  setter(name:string):SetterFn {
    if(MapWrapper.contains(this._setters, name)) {
      return MapWrapper.get(this._setters, name);
    } else {
      return this.reflectionCapabilities.setter(name);
    }
  }

  method(name:string):MethodFn {
    if(MapWrapper.contains(this._methods, name)) {
      return MapWrapper.get(this._methods, name);
    } else {
      return this.reflectionCapabilities.method(name);
    }
  }
}

function _mergeMaps(target:Map, config) {
  StringMapWrapper.forEach(config, (v, k) => MapWrapper.set(target, k, v));
}
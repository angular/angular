import {Type} from 'angular2/src/facade/lang';
import {GetterFn, SetterFn, MethodFn} from './types';
import {List} from 'angular2/src/facade/collection';

export interface PlatformReflectionCapabilities {
  factory(type: Type): Function;
  interfaces(type: Type): List<any>;
  parameters(type: Type): List<List<any>>;
  annotations(type: Type): List<any>;
  getter(name: string): GetterFn;
  setter(name: string): SetterFn;
  method(name: string): MethodFn;
}

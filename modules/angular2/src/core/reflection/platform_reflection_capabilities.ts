import {Type} from 'angular2/src/core/facade/lang';
import {GetterFn, SetterFn, MethodFn} from './types';
import {List} from 'angular2/src/core/facade/collection';

export interface PlatformReflectionCapabilities {
  isReflectionEnabled(): boolean;
  factory(type: Type): Function;
  interfaces(type: Type): List<any>;
  parameters(type: Type): List<List<any>>;
  annotations(type: Type): List<any>;
  getter(name: string): GetterFn;
  setter(name: string): SetterFn;
  method(name: string): MethodFn;
}

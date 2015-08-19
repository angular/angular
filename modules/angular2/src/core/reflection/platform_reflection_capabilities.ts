import {Type} from 'angular2/src/core/facade/lang';
import {GetterFn, SetterFn, MethodFn} from './types';

export interface PlatformReflectionCapabilities {
  isReflectionEnabled(): boolean;
  factory(type: Type): Function;
  interfaces(type: Type): any[];
  parameters(type: Type): any[][];
  annotations(type: Type): any[];
  getter(name: string): GetterFn;
  setter(name: string): SetterFn;
  method(name: string): MethodFn;
  importUri(type: Type): string;
}

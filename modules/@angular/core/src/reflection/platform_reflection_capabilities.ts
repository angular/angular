/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {GetterFn, MethodFn, SetterFn} from './types';

export interface PlatformReflectionCapabilities {
  isReflectionEnabled(): boolean;
  factory(type: Type<any>): Function;
  interfaces(type: Type<any>): any[];
  hasLifecycleHook(type: any, lcInterface: Type<any>, lcProperty: string): boolean;
  parameters(type: Type<any>): any[][];
  annotations(type: Type<any>): any[];
  propMetadata(typeOrFunc: Type<any>): {[key: string]: any[]};
  getter(name: string): GetterFn;
  setter(name: string): SetterFn;
  method(name: string): MethodFn;
  importUri(type: Type<any>): string;
  resolveIdentifier(name: string, moduleUrl: string, runtime: any): any;
  resolveEnum(enumIdentifier: any, name: string): any;
}

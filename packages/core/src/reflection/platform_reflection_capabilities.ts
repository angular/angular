/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {GetterFn, MethodFn, SetterFn} from './types';

export interface PlatformReflectionCapabilities {
  isReflectionEnabled(): boolean;
  factory(type: Type<any>): Function;
  hasLifecycleHook(type: any, lcProperty: string): boolean;
  guards(type: any): {[key: string]: any};

  /**
   * Return a list of annotations/types for constructor parameters
   */
  parameters(type: Type<any>): any[][];

  /**
   * Return a list of annotations declared on the class
   */
  annotations(type: Type<any>): any[];

  /**
   * Return a object literal which describes the annotations on Class fields/properties.
   */
  propMetadata(typeOrFunc: Type<any>): {[key: string]: any[]};
  getter(name: string): GetterFn;
  setter(name: string): SetterFn;
  method(name: string): MethodFn;
  importUri(type: Type<any>): string;
  resourceUri(type: Type<any>): string;
  resolveIdentifier(name: string, moduleUrl: string, members: string[], runtime: any): any;
  resolveEnum(enumIdentifier: any, name: string): any;
}

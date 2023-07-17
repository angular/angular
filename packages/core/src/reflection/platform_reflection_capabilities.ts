/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';

export interface PlatformReflectionCapabilities {
  factory(type: Type<any>): Function;
  hasLifecycleHook(type: any, lcProperty: string): boolean;

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
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Descriptor} from '../../../../../protocol';

/**
 * An object-tree-exlorer data source unit that represents an object.
 */
export interface FlatNode {
  /**
   * Determines whether the node/property is expandable (e.g. an object or an array).
   */
  expandable: boolean;

  /**
   * Property that the flat node represents.
   */
  prop: Property;

  /**
   * Depth of the node/property relative to the root of the object tree.
   */
  level: number;
}

/**
 * Flat node property data.
 */
export interface Property {
  /**
   * Name of the property.
   */
  name: string;

  /**
   * The descriptor of the property containing the property details.
   */
  descriptor: Descriptor;

  /**
   * Parent of the property, if there is such.
   */
  parent: Property | null;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MatTreeFlattener } from '@angular/material/tree';
import { Descriptor } from '../../../../../../protocol';
import { FlatNode, Property } from './element-property-resolver';
export declare const getTreeFlattener: () => MatTreeFlattener<Property, FlatNode, FlatNode>;
export declare const expandable: (prop: Descriptor) => boolean;

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../facade/lang';
import {RouteData} from '../../instruction';

export interface RouteHandler {
  componentType: Type;
  resolveComponentType(): Promise<any>;
  data: RouteData;
}

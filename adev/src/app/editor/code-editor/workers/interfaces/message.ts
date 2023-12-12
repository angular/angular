/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TsVfsWorkerActions} from '../enums/actions';

export interface ActionMessage<T = any> {
  action: TsVfsWorkerActions;
  data?: T;
}

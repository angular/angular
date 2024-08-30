/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApiItemType} from './api-item-type';

export interface ApiItem {
  title: string;
  itemType: ApiItemType;
  url: string;
  isFeatured?: boolean;
  isDeprecated?: boolean;
  isDeveloperPreview?: boolean;
  isExperimental?: boolean;
  groupName?: string;
}

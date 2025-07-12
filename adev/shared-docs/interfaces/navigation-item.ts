/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface NavigationItem {
  label?: string;
  path?: string;
  children?: NavigationItem[];
  isExternal?: boolean;
  isExpanded?: boolean;
  level?: number;
  parent?: NavigationItem;
  contentPath?: string;
  status?: 'new' | 'updated';
}

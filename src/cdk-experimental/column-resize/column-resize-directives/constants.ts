/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';
import {ColumnResizeNotifier, ColumnResizeNotifierSource} from '../column-resize-notifier';
import {HeaderRowEventDispatcher} from '../event-dispatcher';
import {
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
  FLEX_RESIZE_STRATEGY_PROVIDER,
} from '../resize-strategy';

const PROVIDERS: Provider[] = [
  ColumnResizeNotifier,
  HeaderRowEventDispatcher,
  ColumnResizeNotifierSource,
];

export const TABLE_PROVIDERS: Provider[] = [
  ...PROVIDERS,
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
];
export const FLEX_PROVIDERS: Provider[] = [...PROVIDERS, FLEX_RESIZE_STRATEGY_PROVIDER];

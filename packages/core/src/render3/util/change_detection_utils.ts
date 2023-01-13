/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../../util/assert';
import {getComponentViewByInstance} from '../context_discovery';
import {detectChanges} from '../instructions/change_detection';
import {markViewDirty} from '../instructions/mark_view_dirty';

import {getRootComponents} from './discovery_utils';

/**
 * Marks a component for check (in case of OnPush components) and synchronously
 * performs change detection on the application this component belongs to.
 *
 * @param component Component to {@link ChangeDetectorRef#markForCheck mark for check}.
 *
 * @publicApi
 * @globalApi ng
 */
export function applyChanges(component: {}): void {
  ngDevMode && assertDefined(component, 'component');
  markViewDirty(getComponentViewByInstance(component));
  getRootComponents(component).forEach(rootComponent => detectChanges(rootComponent));
}

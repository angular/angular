/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertDefined} from '../../util/assert';
import {getComponentViewByInstance} from '../context_discovery';
import {detectChangesInternal} from '../instructions/change_detection';
import {markViewDirty} from '../instructions/mark_view_dirty';
import {FLAGS} from '../interfaces/view';
import {getRootComponents} from './discovery_utils';
/**
 * Marks a component for check (in case of OnPush components) and synchronously
 * performs change detection on the application this component belongs to.
 *
 * @param component Component to {@link /api/core/ChangeDetectorRef#markForCheck mark for check}
 *
 * @publicApi
 */
export function applyChanges(component) {
  ngDevMode && assertDefined(component, 'component');
  markViewDirty(
    getComponentViewByInstance(component),
    3 /* NotificationSource.DebugApplyChanges */,
  );
  getRootComponents(component).forEach((rootComponent) => detectChanges(rootComponent));
}
/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component.
 *
 * @param component The component which the change detection should be performed on.
 */
function detectChanges(component) {
  const view = getComponentViewByInstance(component);
  view[FLAGS] |= 1024 /* LViewFlags.RefreshView */;
  detectChangesInternal(view);
}
//# sourceMappingURL=change_detection_utils.js.map

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertGreaterThan, assertNotEqual, assertNumber} from '../../util/assert';
import {NO_PARENT_INJECTOR} from '../interfaces/injector';
import {DECLARATION_VIEW, HEADER_OFFSET} from '../interfaces/view';
/// Parent Injector Utils ///////////////////////////////////////////////////////////////
export function hasParentInjector(parentLocation) {
  return parentLocation !== NO_PARENT_INJECTOR;
}
export function getParentInjectorIndex(parentLocation) {
  if (ngDevMode) {
    assertNumber(parentLocation, 'Number expected');
    assertNotEqual(parentLocation, -1, 'Not a valid state.');
    const parentInjectorIndex =
      parentLocation & 32767; /* RelativeInjectorLocationFlags.InjectorIndexMask */
    assertGreaterThan(
      parentInjectorIndex,
      HEADER_OFFSET,
      'Parent injector must be pointing past HEADER_OFFSET.',
    );
  }
  return parentLocation & 32767 /* RelativeInjectorLocationFlags.InjectorIndexMask */;
}
export function getParentInjectorViewOffset(parentLocation) {
  return parentLocation >> 16 /* RelativeInjectorLocationFlags.ViewOffsetShift */;
}
/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the view is found that contains the parent
 * injector.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LView instance from which to start walking up the view tree
 * @returns The LView instance that contains the parent injector
 */
export function getParentInjectorView(location, startView) {
  let viewOffset = getParentInjectorViewOffset(location);
  let parentView = startView;
  // For most cases, the parent injector can be found on the host node (e.g. for component
  // or container), but we must keep the loop here to support the rarer case of deeply nested
  // <ng-template> tags or inline views, where the parent injector might live many views
  // above the child injector.
  while (viewOffset > 0) {
    parentView = parentView[DECLARATION_VIEW];
    viewOffset--;
  }
  return parentView;
}
//# sourceMappingURL=injector_utils.js.map

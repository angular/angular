/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertGreaterThan, assertNotEqual, assertNumber} from '../../util/assert';
import {NO_PARENT_INJECTOR, RelativeInjectorLocation, RelativeInjectorLocationFlags} from '../interfaces/injector';
import {DECLARATION_VIEW, HEADER_OFFSET, LView} from '../interfaces/view';


/// Parent Injector Utils ///////////////////////////////////////////////////////////////
export function hasParentInjector(parentLocation: RelativeInjectorLocation): boolean {
  return parentLocation !== NO_PARENT_INJECTOR;
}

export function getParentInjectorIndex(parentLocation: RelativeInjectorLocation): number {
  ngDevMode && assertNumber(parentLocation, 'Number expected');
  ngDevMode && assertNotEqual(parentLocation as any, -1, 'Not a valid state.');
  const parentInjectorIndex =
      (parentLocation as any as number) & RelativeInjectorLocationFlags.InjectorIndexMask;
  ngDevMode &&
      assertGreaterThan(
          parentInjectorIndex, HEADER_OFFSET,
          'Parent injector must be pointing past HEADER_OFFSET.');
  return (parentLocation as any as number) & RelativeInjectorLocationFlags.InjectorIndexMask;
}

export function getParentInjectorViewOffset(parentLocation: RelativeInjectorLocation): number {
  return (parentLocation as any as number) >> RelativeInjectorLocationFlags.ViewOffsetShift;
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
export function getParentInjectorView(location: RelativeInjectorLocation, startView: LView): LView {
  let viewOffset = getParentInjectorViewOffset(location);
  let parentView = startView;
  // For most cases, the parent injector can be found on the host node (e.g. for component
  // or container), but we must keep the loop here to support the rarer case of deeply nested
  // <ng-template> tags or inline views, where the parent injector might live many views
  // above the child injector.
  while (viewOffset > 0) {
    parentView = parentView[DECLARATION_VIEW]!;
    viewOffset--;
  }
  return parentView;
}

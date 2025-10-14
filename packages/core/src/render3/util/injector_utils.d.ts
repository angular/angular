/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RelativeInjectorLocation } from '../interfaces/injector';
import { LView } from '../interfaces/view';
export declare function hasParentInjector(parentLocation: RelativeInjectorLocation): boolean;
export declare function getParentInjectorIndex(parentLocation: RelativeInjectorLocation): number;
export declare function getParentInjectorViewOffset(parentLocation: RelativeInjectorLocation): number;
/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the view is found that contains the parent
 * injector.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LView instance from which to start walking up the view tree
 * @returns The LView instance that contains the parent injector
 */
export declare function getParentInjectorView(location: RelativeInjectorLocation, startView: LView): LView;

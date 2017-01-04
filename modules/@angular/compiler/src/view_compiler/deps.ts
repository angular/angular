/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is currently not read, but will probably be used in the future.
 * We keep it as we already pass it through all the right places...
 */
export class ComponentViewDependency {
  constructor(public compType: any) {}
}

/**
 * This is currently not read, but will probably be used in the future.
 * We keep it as we already pass it through all the right places...
 */
export class ComponentFactoryDependency {
  constructor(public compType: any) {}
}

/**
 * This is currently not read, but will probably be used in the future.
 * We keep it as we already pass it through all the right places...
 */
export class DirectiveWrapperDependency {
  constructor(public dirType: any) {}
}

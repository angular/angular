/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @experimental View triggers are experimental
 */
export interface Trigger {
  name: string;
  transitionFactories: TransitionFactory[];
}

/**
 * @experimental View triggers are experimental
 */
export interface TransitionFactory {
  match(currentState: any, nextState: any): TransitionInstruction;
}

/**
 * @experimental View triggers are experimental
 */
export interface TransitionInstruction {}

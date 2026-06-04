/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Descriptor} from './descriptor';

export interface DebugSignalGraphNode {
  id: string;
  kind:
    | 'signal'
    | 'computed'
    | 'effect'
    | 'template'
    | 'linkedSignal'
    | 'afterRenderEffectPhase'
    | 'childSignalProp' // Represents a signal passed as a prop to a child component in a CoW app
    | 'unknown';
  epoch: number;
  label?: string;
  preview: Descriptor;
  debuggable: boolean;
}

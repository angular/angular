/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ControlDirectiveHost} from '../interfaces/control';
import {DirectiveDef} from '../interfaces/definition';

export function ɵɵControlFeature(passThroughInput: string | null) {
  return (definition: DirectiveDef<unknown>) => {
    definition.controlDef = {
      create: (inst: unknown, host: ControlDirectiveHost): void => {
        (inst as any)?.ɵngControlCreate(host);
      },
      update: (inst: unknown, host: ControlDirectiveHost): void => {
        (inst as any)?.ɵngControlUpdate?.(host);
      },
      passThroughInput,
    };
  };
}

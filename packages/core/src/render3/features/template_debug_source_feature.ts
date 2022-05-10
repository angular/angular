/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {noop} from '../../util/noop';
import {ɵɵattribute} from '../instructions/attribute';
import {ComponentDef, HostBindingsFunction, RenderFlags} from '../interfaces/definition';

/**
 * A feature that augments components with an attribute `data-debug-source` which points to the
 * origin file for that component's template.
 *
 * @codeGenApi
 */
export function ɵɵTemplateDebugSourceFeature(debugSource: string) {
  return (def: ComponentDef<unknown>) => {
    const prevHostBindings: HostBindingsFunction<unknown> = def.hostBindings || noop;
    (def as any).hostBindings = (rf: RenderFlags, ctx: unknown) => {
      if (rf & 2) {
        ɵɵattribute('data-debug-source', debugSource);
      }
      prevHostBindings(rf, ctx);
    };
    (def as any).hostVars++;
  };
}

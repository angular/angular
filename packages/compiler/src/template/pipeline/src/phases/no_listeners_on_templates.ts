/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

export function phaseNoListenersOnTemplates(job: CompilationJob): void {
  for (const unit of job.units) {
    let inTemplate = false;
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.Template:
          inTemplate = true;
          break;
        case ir.OpKind.ElementStart:
        case ir.OpKind.Element:
        case ir.OpKind.ContainerStart:
        case ir.OpKind.Container:
          inTemplate = false;
          break;
        case ir.OpKind.Listener:
          if (inTemplate) {
            ir.OpList.remove<ir.CreateOp>(op);
          }
          break;
      }
    }
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Resolves known event modifiers at compile time.
 *
 * For example:
 * - `click.prevent` => `click` + `event.preventDefault()`
 * - `click.stop` => `click` + `event.stopPropagation()`
 * - `click.prevent.stop` => `click` + both calls
 */
export function resolveEventModifiers(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.Listener || op.isLegacyAnimationListener) {
        continue;
      }

      const parsed = parseEventModifiers(op.name);
      if (parsed === null) {
        continue;
      }

      op.name = parsed.eventName;

      const event = new o.ReadVarExpr('$event');
      const modifierStatements: ir.UpdateOp[] = [];
      if (parsed.prevent) {
        modifierStatements.push(
          ir.createStatementOp<ir.UpdateOp>(event.prop('preventDefault').callFn([]).toStmt()),
        );
      }
      if (parsed.stop) {
        modifierStatements.push(
          ir.createStatementOp<ir.UpdateOp>(event.prop('stopPropagation').callFn([]).toStmt()),
        );
      }

      op.handlerOps.prepend(modifierStatements);
      op.consumesDollarEvent = true;
    }
  }
}

function parseEventModifiers(
  eventName: string,
): {eventName: string; prevent: boolean; stop: boolean} | null {
  const parts = eventName.split('.');
  if (parts.length === 1) {
    return null;
  }

  let prevent = false;
  let stop = false;
  while (parts.length > 1) {
    const maybeModifier = parts[parts.length - 1];
    if (maybeModifier === 'prevent') {
      prevent = true;
      parts.pop();
    } else if (maybeModifier === 'stop') {
      stop = true;
      parts.pop();
    } else {
      break;
    }
  }

  if (!prevent && !stop) {
    return null;
  }

  return {
    eventName: parts.join('.'),
    prevent,
    stop,
  };
}

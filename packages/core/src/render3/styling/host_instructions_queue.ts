/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {HostInstructionsQueue, HostInstructionsQueueIndex, StylingContext, StylingIndex} from '../interfaces/styling';
import {DEFAULT_TEMPLATE_DIRECTIVE_INDEX} from '../styling/shared';

/*
 * This file contains the logic to defer all hostBindings-related styling code to run
 * at a later point, instead of immediately (as is the case with how template-level
 * styling instructions are run).
 *
 * Certain styling instructions, present within directives, components and sub-classed
 * directives, are evaluated at different points (depending on priority) and will therefore
 * not be applied to the styling context of an element immediately. They are instead
 * designed to be applied just before styling is applied to an element.
 *
 * (The priority for when certain host-related styling operations are executed is discussed
 * more within `interfaces/styling.ts`.)
 */

export function registerHostDirective(context: StylingContext, directiveIndex: number) {
  let buffer = context[StylingIndex.HostInstructionsQueue];
  if (!buffer) {
    buffer = context[StylingIndex.HostInstructionsQueue] = [DEFAULT_TEMPLATE_DIRECTIVE_INDEX];
  }
  buffer[HostInstructionsQueueIndex.LastRegisteredDirectiveIndexPosition] = directiveIndex;
}

/**
 * Queues a styling instruction to be run just before `renderStyling()` is executed.
 */
export function enqueueHostInstruction<T extends Function>(
    context: StylingContext, priority: number, instructionFn: T, instructionFnArgs: ParamsOf<T>) {
  const buffer: HostInstructionsQueue|null = context[StylingIndex.HostInstructionsQueue];
  // Buffer may be null if host element is a template node. In this case, just ignore the style.
  if (buffer != null) {
    const index = findNextInsertionIndex(buffer, priority);
    buffer.splice(index, 0, priority, instructionFn, instructionFnArgs);
  }
}

/**
 * Figures out where exactly to to insert the next host instruction queue entry.
 */
function findNextInsertionIndex(buffer: HostInstructionsQueue, priority: number): number {
  for (let i = HostInstructionsQueueIndex.ValuesStartPosition; i < buffer.length;
       i += HostInstructionsQueueIndex.Size) {
    const p = buffer[i + HostInstructionsQueueIndex.DirectiveIndexOffset] as number;
    if (p > priority) {
      return i;
    }
  }
  return buffer.length;
}

/**
 * Iterates through the host instructions queue (if present within the provided
 * context) and executes each queued instruction entry.
 */
export function flushQueue(context: StylingContext): void {
  const buffer = context[StylingIndex.HostInstructionsQueue];
  if (buffer) {
    for (let i = HostInstructionsQueueIndex.ValuesStartPosition; i < buffer.length;
         i += HostInstructionsQueueIndex.Size) {
      const fn = buffer[i + HostInstructionsQueueIndex.InstructionFnOffset] as Function;
      const args = buffer[i + HostInstructionsQueueIndex.ParamsOffset] as any[];
      fn.apply(this, args);
    }
    buffer.length = HostInstructionsQueueIndex.ValuesStartPosition;
  }
}

/**
 * Determines whether or not to allow the host instructions queue to be flushed or not.
 *
 * Because the hostBindings function code is unaware of the presence of other host bindings
 * (as well as the template function) then styling is evaluated multiple times per element.
 * To prevent style and class values from being applied to the element multiple times, a
 * flush is only allowed when the last directive (the directive that was registered into
 * the styling context) attempts to render its styling.
 */
export function allowFlush(context: StylingContext, directiveIndex: number): boolean {
  const buffer = context[StylingIndex.HostInstructionsQueue];
  if (buffer) {
    return buffer[HostInstructionsQueueIndex.LastRegisteredDirectiveIndexPosition] ===
        directiveIndex;
  }
  return true;
}

/**
 * Infers the parameters of a given function into a typed array.
 */
export type ParamsOf<T> = T extends(...args: infer T) => any ? T : never;

/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {HostInstructionsQueueIndex, StylingContext, StylingIndex} from '../interfaces/styling';
import {getDirectiveInheritanceInstructionsQueue, getHostInstructionsQueue, setHostInstructionsQueue} from '../state';

import {DEFAULT_TEMPLATE_DIRECTIVE_INDEX} from './shared';

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
  context[StylingIndex.FinalDirectiveIndexThatFlushes] = directiveIndex;
}

/**
 * Queues a styling instruction to be run just before `renderStyling()` is executed.
 */
export function enqueueHostInstruction(
    priority: number, instructionFn: Function, arg1: any, arg2: any, arg3: any, arg4: any,
    arg5: any) {
  const queue = getHostInstructionsQueue();
  let i = queue[HostInstructionsQueueIndex.ValuesLengthPosition];

  // the goal is to reuse the array instead of recreating a new array between each
  // host element.
  if (i < queue.length) {
    queue[i++] = priority;
    queue[i++] = instructionFn;
    queue[i++] = arg1;
    queue[i++] = arg2;
    queue[i++] = arg3;
    queue[i++] = arg4;
    queue[i++] = arg5;
  } else {
    queue.push(priority, instructionFn, arg1, arg2, arg3, arg4, arg5);
  }
  queue[HostInstructionsQueueIndex.ValuesLengthPosition] += HostInstructionsQueueIndex.Size;
}

/**
 * Iterates through the host instructions queue (if present within the provided
 * context) and executes each queued instruction entry.
 */
export function flushQueue(): void {
  const queue = getHostInstructionsQueue();
  const length = queue[HostInstructionsQueueIndex.ValuesLengthPosition] as number;
  queue[HostInstructionsQueueIndex.ValuesLengthPosition] =
      HostInstructionsQueueIndex.ValuesStartPosition;
  let i = HostInstructionsQueueIndex.ValuesStartPosition;
  while (i < length) {
    const fn = queue[i + HostInstructionsQueueIndex.InstructionFnOffset] as Function;
    i += HostInstructionsQueueIndex.ParamsStartOffset;
    fn(queue[i++], queue[i++], queue[i++], queue[i++], queue[i++]);
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
  const index = context[StylingIndex.FinalDirectiveIndexThatFlushes];

  // if the template level value is set then this means that there are no host
  // level bindings to flush at all
  return index === DEFAULT_TEMPLATE_DIRECTIVE_INDEX || index === directiveIndex;
}

/**
 * The total amount of entries per host instruction.
 */
const QUEUE_TUPLE_LENGTH = 7;

/**
 * Called when a directive inheritance chain has starts.
 *
 * When an inheritance chain starts (where parent and sub-classed
 * directives execute their host binding functions) all style and
 * class bindings are applied to the active host instructions queue.
 *
 * Style and class binding code expects the sub-classed directives to
 * apply their styling bindings first and then the parent bindings. For
 * this to work a special "inheritance-only" host instructions queue is
 * assigned which is then later flushed inside of `directiveInheritanceEnd`.
 */
export function directiveInheritanceStart() {
  setHostInstructionsQueue(getDirectiveInheritanceInstructionsQueue());
}

/**
 * Called when a directive inheritance chain has ended.
 *
 * Due to the nature of how sub-classed directives are evaluated during
 * change detection, style and class bindings are evaluated at the wrong
 * moment and their values are not applied in the correct order. For this
 * to work properly, all style/class bindings applied during an inheritance
 * chain are reverse-inserted into the host instructions queue when the
 * inheritance chain exits.
 */
export function directiveInheritanceEnd() {
  // this will restore the non-inheritance host instructions queue
  setHostInstructionsQueue(null);

  const queue = getDirectiveInheritanceInstructionsQueue();
  const length = queue[HostInstructionsQueueIndex.ValuesLengthPosition];

  // the loop will iterate one tuple at a time in reverse. This is because the
  // sub-classed directive bindings are applied from parent to child. Therefore
  // to apply them in the order of child-first then the loop will iterate in the
  // opposite order.
  for (let i = length - QUEUE_TUPLE_LENGTH; i >= 0; i -= QUEUE_TUPLE_LENGTH) {
    let j = i;

    // it's safe to call this function again because the host instructions queue
    // is now writing to the default queue (this was reset at the start of this
    // function).
    enqueueHostInstruction(
        queue[j++] as number, queue[j++] as Function, queue[j++], queue[j++], queue[j++],
        queue[j++], queue[j++]);
  }

  queue[HostInstructionsQueueIndex.ValuesLengthPosition] =
      HostInstructionsQueueIndex.ValuesStartPosition;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WrappedValue} from '../change_detection/change_detection_util';
import {PipeTransform} from '../change_detection/pipe_transform';
import {setInjectImplementation} from '../di/inject_switch';
import {getFactoryDef} from './definition_factory';
import {setIncludeViewProviders} from './di';
import {RuntimeError, RuntimeErrorCode} from './error_code';
import {store, ɵɵdirectiveInject} from './instructions/all';
import {PipeDef, PipeDefList} from './interfaces/definition';
import {HEADER_OFFSET, LView, TVIEW} from './interfaces/view';
import {pureFunction1Internal, pureFunction2Internal, pureFunction3Internal, pureFunction4Internal, pureFunctionVInternal} from './pure_function';
import {getBindingIndex, getBindingRoot, getLView, getTView} from './state';
import {NO_CHANGE} from './tokens';
import {load} from './util/view_utils';



/**
 * Create a pipe.
 *
 * @param index Pipe index where the pipe will be stored.
 * @param pipeName The name of the pipe
 * @returns T the instance of the pipe.
 *
 * @codeGenApi
 */
export function ɵɵpipe(index: number, pipeName: string): any {
  const tView = getTView();
  let pipeDef: PipeDef<any>;
  const adjustedIndex = index + HEADER_OFFSET;

  if (tView.firstCreatePass) {
    pipeDef = getPipeDef(pipeName, tView.pipeRegistry);
    tView.data[adjustedIndex] = pipeDef;
    if (pipeDef.onDestroy) {
      (tView.destroyHooks || (tView.destroyHooks = [])).push(adjustedIndex, pipeDef.onDestroy);
    }
  } else {
    pipeDef = tView.data[adjustedIndex] as PipeDef<any>;
  }

  const pipeFactory = pipeDef.factory || (pipeDef.factory = getFactoryDef(pipeDef.type, true));
  const previousInjectImplementation = setInjectImplementation(ɵɵdirectiveInject);
  try {
    // DI for pipes is supposed to behave like directives when placed on a component
    // host node, which means that we have to disable access to `viewProviders`.
    const previousIncludeViewProviders = setIncludeViewProviders(false);
    const pipeInstance = pipeFactory();
    setIncludeViewProviders(previousIncludeViewProviders);
    store(tView, getLView(), adjustedIndex, pipeInstance);
    return pipeInstance;
  } finally {
    // we have to restore the injector implementation in finally, just in case the creation of the
    // pipe throws an error.
    setInjectImplementation(previousInjectImplementation);
  }
}

/**
 * Searches the pipe registry for a pipe with the given name. If one is found,
 * returns the pipe. Otherwise, an error is thrown because the pipe cannot be resolved.
 *
 * @param name Name of pipe to resolve
 * @param registry Full list of available pipes
 * @returns Matching PipeDef
 */
function getPipeDef(name: string, registry: PipeDefList|null): PipeDef<any> {
  if (registry) {
    for (let i = registry.length - 1; i >= 0; i--) {
      const pipeDef = registry[i];
      if (name === pipeDef.name) {
        return pipeDef;
      }
    }
  }
  throw new RuntimeError(RuntimeErrorCode.PIPE_NOT_FOUND, `The pipe '${name}' could not be found!`);
}

/**
 * Invokes a pipe with 1 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind1(index: number, slotOffset: number, v1: any): any {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load<PipeTransform>(lView, adjustedIndex);
  return unwrapValue(
      lView,
      isPure(lView, adjustedIndex) ?
          pureFunction1Internal(
              lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, pipeInstance) :
          pipeInstance.transform(v1));
}

/**
 * Invokes a pipe with 2 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind2(index: number, slotOffset: number, v1: any, v2: any): any {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load<PipeTransform>(lView, adjustedIndex);
  return unwrapValue(
      lView,
      isPure(lView, adjustedIndex) ?
          pureFunction2Internal(
              lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, pipeInstance) :
          pipeInstance.transform(v1, v2));
}

/**
 * Invokes a pipe with 3 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 4rd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind3(index: number, slotOffset: number, v1: any, v2: any, v3: any): any {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load<PipeTransform>(lView, adjustedIndex);
  return unwrapValue(
      lView,
      isPure(lView, adjustedIndex) ? pureFunction3Internal(
                                         lView, getBindingRoot(), slotOffset,
                                         pipeInstance.transform, v1, v2, v3, pipeInstance) :
                                     pipeInstance.transform(v1, v2, v3));
}

/**
 * Invokes a pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 3rd argument to {@link PipeTransform#transform}.
 * @param v4 4th argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
export function ɵɵpipeBind4(
    index: number, slotOffset: number, v1: any, v2: any, v3: any, v4: any): any {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load<PipeTransform>(lView, adjustedIndex);
  return unwrapValue(
      lView,
      isPure(lView, adjustedIndex) ? pureFunction4Internal(
                                         lView, getBindingRoot(), slotOffset,
                                         pipeInstance.transform, v1, v2, v3, v4, pipeInstance) :
                                     pipeInstance.transform(v1, v2, v3, v4));
}

/**
 * Invokes a pipe with variable number of arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param values Array of arguments to pass to {@link PipeTransform#transform} method.
 *
 * @codeGenApi
 */
export function ɵɵpipeBindV(index: number, slotOffset: number, values: [any, ...any[]]): any {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load<PipeTransform>(lView, adjustedIndex);
  return unwrapValue(
      lView,
      isPure(lView, adjustedIndex) ?
          pureFunctionVInternal(
              lView, getBindingRoot(), slotOffset, pipeInstance.transform, values, pipeInstance) :
          pipeInstance.transform.apply(pipeInstance, values));
}

function isPure(lView: LView, index: number): boolean {
  return (<PipeDef<any>>lView[TVIEW].data[index]).pure;
}

/**
 * Unwrap the output of a pipe transformation.
 * In order to trick change detection into considering that the new value is always different from
 * the old one, the old value is overwritten by NO_CHANGE.
 *
 * @param newValue the pipe transformation output.
 */
function unwrapValue(lView: LView, newValue: any): any {
  if (WrappedValue.isWrapped(newValue)) {
    newValue = WrappedValue.unwrap(newValue);
    // The NO_CHANGE value needs to be written at the index where the impacted binding value is
    // stored
    const bindingToInvalidateIdx = getBindingIndex();
    lView[bindingToInvalidateIdx] = NO_CHANGE;
  }
  return newValue;
}

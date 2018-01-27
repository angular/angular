/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PipeDef} from './interfaces/definition';

/**
 * Create a pipe.
 *
 * @param index Pipe index where the pipe will be stored.
 * @param pipeDef Pipe definition object for registering life cycle hooks.
 * @param pipe A Pipe instance.
 */
export function pipe<T>(index: number, pipeDef: PipeDef<T>, pipe: T): void {
  throw new Error('TODO: implement!');
}

/**
 * Invokes a pure pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param v1 1st argument to {@link PipeTransform#transform}.
 */
export function pipeBind1(index: number, v1: any): any {
  throw new Error('TODO: implement!');
}

/**
 * Invokes a pure pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 */
export function pipeBind2(index: number, v1: any, v2: any): any {
  throw new Error('TODO: implement!');
}

/**
 * Invokes a pure pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 4rd argument to {@link PipeTransform#transform}.
 */
export function pipeBind3(index: number, v1: any, v2: any, v3: any): any {
  throw new Error('TODO: implement!');
}

/**
 * Invokes a pure pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 3rd argument to {@link PipeTransform#transform}.
 * @param v4 4th argument to {@link PipeTransform#transform}.
 */
export function pipeBind4(index: number, v1: any, v2: any, v3: any, v4: any): any {
  throw new Error('TODO: implement!');
}

/**
 * Invokes a pure pipe with variable number of arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param values Array of arguments to pass to {@link PipeTransform#transform} method.
 */
export function pipeBindV(index: number, values: any[]): any {
  throw new Error('TODO: implement!');
}
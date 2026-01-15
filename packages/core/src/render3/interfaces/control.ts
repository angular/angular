/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export type ControlDirectiveFn = (instance: unknown, host: ControlDirectiveHost) => void;

export interface ControlDirectiveDef {
  readonly passThroughInput: string | null;
  readonly create: ControlDirectiveFn;
  readonly update: ControlDirectiveFn;
}

export interface ControlDirectiveHost<_TPassthroughInput extends string | undefined = undefined> {
  readonly descriptor: string;
  readonly hasPassThrough: boolean;
  readonly customControl: unknown | undefined;

  listenToCustomControlModel(listener: (value: unknown) => void): void;
  listenToCustomControlOutput(outputName: string, listener: () => void): void;
  customControlModel(value: unknown): void;
  customControlHasInput(inputName: string): boolean;
  property(inputName: string, value: unknown): boolean;
  listenToDom(eventName: string, listener: (event: Event) => void): void;
}

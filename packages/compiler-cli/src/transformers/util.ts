/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export const GENERATED_FILES = /(.*?)\.(ngfactory|shim\.ngstyle|ngstyle|ngsummary)\.(js|d\.ts|ts)$/;

export const enum StructureIsReused {Not = 0, SafeModules = 1, Completely = 2}

// Note: This is an internal property in TypeScript. Use it only for assertions and tests.
export function tsStructureIsReused(program: ts.Program): StructureIsReused {
  return (program as any).structureIsReused;
}
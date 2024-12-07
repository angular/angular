/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {global} from '../util/global';
import {CompilerFacade, ExportedCompilerFacade, Type} from './compiler_facade_interface';
export * from './compiler_facade_interface';

export const enum JitCompilerUsage {
  Decorator,
  PartialDeclaration,
}

interface JitCompilerUsageRequest {
  usage: JitCompilerUsage;
  kind: 'directive' | 'component' | 'pipe' | 'injectable' | 'NgModule';
  type: Type;
}

export function getCompilerFacade(request: JitCompilerUsageRequest): CompilerFacade {
  const globalNg: ExportedCompilerFacade = global['ng'];
  if (globalNg && globalNg.ɵcompilerFacade) {
    return globalNg.ɵcompilerFacade;
  }

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    // Log the type as an error so that a developer can easily navigate to the type from the
    // console.
    console.error(`JIT compilation failed for ${request.kind}`, request.type);

    let message = `The ${request.kind} '${request.type.name}' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.\n\n`;
    if (request.usage === JitCompilerUsage.PartialDeclaration) {
      message += `The ${request.kind} is part of a library that has been partially compiled.\n`;
      message += `However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.\n`;
      message += '\n';
      message += `Ideally, the library is processed using the Angular Linker to become fully AOT compiled.\n`;
    } else {
      message += `JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.\n`;
    }
    message += `Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',\n`;
    message += `or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`;
    throw new Error(message);
  } else {
    throw new Error('JIT compiler unavailable');
  }
}

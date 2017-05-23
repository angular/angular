/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AngularCompilerOptions, CompilerHost, ModuleFilenameResolver, createModuleFilenameResolver} from '@angular/compiler-cli';
import * as ts from 'typescript';

class ReflectorModuleModuleResolutionHost implements ts.ModuleResolutionHost {
  constructor(private host: ts.LanguageServiceHost) {
    if (host.directoryExists)
      this.directoryExists = directoryName => this.host.directoryExists !(directoryName);
  }

  fileExists(fileName: string): boolean { return !!this.host.getScriptSnapshot(fileName); }

  readFile(fileName: string): string {
    let snapshot = this.host.getScriptSnapshot(fileName);
    if (snapshot) {
      return snapshot.getText(0, snapshot.getLength());
    }

    // Typescript readFile() declaration should be `readFile(fileName: string): string | undefined
    return undefined !;
  }

  directoryExists: (directoryName: string) => boolean;
}

// This reflector host's purpose is to first set verboseInvalidExpressions to true so the
// reflector will collect errors instead of throwing, and second to all deferring the creation
// of the program until it is actually needed.
export class ReflectorHost extends CompilerHost {
  constructor(
      private getProgram: () => ts.Program, options: AngularCompilerOptions,
      host: ts.ModuleResolutionHost, resolver: ModuleFilenameResolver) {
    super(
        // The ancestor value for program is overridden below so passing null here is safe.
        /* program */ null !, options, host, resolver, {verboseInvalidExpression: true});
  }

  protected get program() { return this.getProgram(); }
  protected set program(value: ts.Program) {
    // Discard the result set by ancestor constructor
  }
}

export function createReflectorHost(
    getProgram: () => ts.Program, serviceHost: ts.LanguageServiceHost,
    options: AngularCompilerOptions): ReflectorHost {
  const host = new ReflectorModuleModuleResolutionHost(serviceHost);
  const resolver = createModuleFilenameResolver(host, options);
  return new ReflectorHost(getProgram, options, host, resolver);
}
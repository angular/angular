/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AngularCompilerOptions, AotCompilerHost, CompilerHost, ModuleResolutionHostAdapter} from '@angular/compiler-cli';
import * as ts from 'typescript';

class ReflectorModuleModuleResolutionHost implements ts.ModuleResolutionHost {
  constructor(private host: ts.LanguageServiceHost) {
    if (host.directoryExists)
      this.directoryExists = directoryName => this.host.directoryExists(directoryName);
  }

  fileExists(fileName: string): boolean { return !!this.host.getScriptSnapshot(fileName); }

  readFile(fileName: string): string {
    let snapshot = this.host.getScriptSnapshot(fileName);
    if (snapshot) {
      return snapshot.getText(0, snapshot.getLength());
    }
  }

  directoryExists: (directoryName: string) => boolean;
}

export class ReflectorHost extends CompilerHost {
  constructor(
      private getProgram: () => ts.Program, serviceHost: ts.LanguageServiceHost,
      options: AngularCompilerOptions) {
    super(
        null, options,
        new ModuleResolutionHostAdapter(new ReflectorModuleModuleResolutionHost(serviceHost)));
  }

  protected get program() { return this.getProgram(); }
  protected set program(value: ts.Program) {
    // Discard the result set by ancestor constructor
  }
}

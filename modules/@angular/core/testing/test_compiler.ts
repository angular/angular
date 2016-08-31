/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, CompilerOptions, ComponentMetadataType, DirectiveMetadataType, Injector, NgModuleMetadataType, PipeMetadataType, Type} from '@angular/core';

import {unimplemented} from './facade/errors';
import {MetadataOverride} from './metadata_override';


/**
 * Special interface to the compiler only used by testing
 *
 * @experimental
 */
export class TestingCompiler extends Compiler {
  get injector(): Injector { throw unimplemented(); }
  overrideModule(module: Type<any>, overrides: MetadataOverride<NgModuleMetadataType>): void {
    throw unimplemented();
  }
  overrideDirective(directive: Type<any>, overrides: MetadataOverride<DirectiveMetadataType>):
      void {
    throw unimplemented();
  }
  overrideComponent(component: Type<any>, overrides: MetadataOverride<ComponentMetadataType>):
      void {
    throw unimplemented();
  }
  overridePipe(directive: Type<any>, overrides: MetadataOverride<PipeMetadataType>): void {
    throw unimplemented();
  }
}

/**
 * A factory for creating a Compiler
 *
 * @experimental
 */
export abstract class TestingCompilerFactory {
  abstract createTestingCompiler(options?: CompilerOptions[]): TestingCompiler;
}

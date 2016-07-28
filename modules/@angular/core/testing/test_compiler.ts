/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, CompilerOptions, ComponentMetadataType, DirectiveMetadataType, Injector, NgModuleFactory, NgModuleMetadataType, PipeMetadataType} from '../index';
import {unimplemented} from '../src/facade/exceptions';
import {ConcreteType} from '../src/facade/lang';
import {MetadataOverride} from './metadata_override';

/**
 * Special interface to the compiler only used by testing
 *
 * @experimental
 */
export class TestingCompiler extends Compiler {
  get injector(): Injector { throw unimplemented(); }
  overrideModule(module: ConcreteType<any>, overrides: MetadataOverride<NgModuleMetadataType>):
      void {
    throw unimplemented();
  }
  overrideDirective(
      directive: ConcreteType<any>, overrides: MetadataOverride<DirectiveMetadataType>): void {
    throw unimplemented();
  }
  overrideComponent(
      component: ConcreteType<any>, overrides: MetadataOverride<ComponentMetadataType>): void {
    throw unimplemented();
  }
  overridePipe(directive: ConcreteType<any>, overrides: MetadataOverride<PipeMetadataType>): void {
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

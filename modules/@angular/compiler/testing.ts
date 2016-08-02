/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './testing/schema_registry_mock';
export * from './testing/test_component_builder';
export * from './testing/directive_resolver_mock';
export * from './testing/ng_module_resolver_mock';
export * from './testing/pipe_resolver_mock';

import {ConcreteType, Type} from './src/facade/lang';
import {createPlatformFactory, ModuleWithComponentFactories, Injectable, CompilerOptions, COMPILER_OPTIONS, PlatformRef, CompilerFactory, ComponentFactory, NgModuleFactory, Injector, NgModuleMetadata, NgModuleMetadataType, ComponentMetadata, ComponentMetadataType, DirectiveMetadata, DirectiveMetadataType, PipeMetadata, PipeMetadataType} from '@angular/core';
import {MetadataOverride} from '@angular/core/testing';
import {TestingCompilerFactory, TestingCompiler} from './core_private_testing';
import {platformCoreDynamic, RuntimeCompiler, DirectiveResolver, NgModuleResolver, PipeResolver} from './index';
import {MockDirectiveResolver} from './testing/directive_resolver_mock';
import {MockNgModuleResolver} from './testing/ng_module_resolver_mock';
import {MockPipeResolver} from './testing/pipe_resolver_mock';
import {MetadataOverrider} from './testing/metadata_overrider';

@Injectable()
export class TestingCompilerFactoryImpl implements TestingCompilerFactory {
  constructor(private _compilerFactory: CompilerFactory) {}

  createTestingCompiler(options: CompilerOptions[]): TestingCompiler {
    const compiler = <RuntimeCompiler>this._compilerFactory.createCompiler(options);
    return new TestingCompilerImpl(
        compiler, compiler.injector.get(MockDirectiveResolver),
        compiler.injector.get(MockPipeResolver), compiler.injector.get(MockNgModuleResolver));
  }
}

export class TestingCompilerImpl implements TestingCompiler {
  private _overrider = new MetadataOverrider();
  constructor(
      private _compiler: RuntimeCompiler, private _directiveResolver: MockDirectiveResolver,
      private _pipeResolver: MockPipeResolver, private _moduleResolver: MockNgModuleResolver) {}
  get injector(): Injector { return this._compiler.injector; }
  compileComponentAsync<T>(component: ConcreteType<T>, ngModule: Type = null):
      Promise<ComponentFactory<T>> {
    return this._compiler.compileComponentAsync(component, <any>ngModule);
  }
  compileComponentSync<T>(component: ConcreteType<T>, ngModule: Type = null): ComponentFactory<T> {
    return this._compiler.compileComponentSync(component, <any>ngModule);
  }
  compileModuleSync<T>(moduleType: ConcreteType<T>): NgModuleFactory<T> {
    return this._compiler.compileModuleSync(moduleType);
  }

  compileModuleAsync<T>(moduleType: ConcreteType<T>): Promise<NgModuleFactory<T>> {
    return this._compiler.compileModuleAsync(moduleType);
  }
  compileModuleAndAllComponentsSync<T>(moduleType: ConcreteType<T>):
      ModuleWithComponentFactories<T> {
    return this._compiler.compileModuleAndAllComponentsSync(moduleType);
  }

  compileModuleAndAllComponentsAsync<T>(moduleType: ConcreteType<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._compiler.compileModuleAndAllComponentsAsync(moduleType);
  }

  overrideModule(ngModule: ConcreteType<any>, override: MetadataOverride<NgModuleMetadataType>):
      void {
    const oldMetadata = this._moduleResolver.resolve(ngModule, false);
    this._moduleResolver.setNgModule(
        ngModule, this._overrider.overrideMetadata(NgModuleMetadata, oldMetadata, override));
  }
  overrideDirective(
      directive: ConcreteType<any>, override: MetadataOverride<DirectiveMetadataType>): void {
    const oldMetadata = this._directiveResolver.resolve(directive, false);
    this._directiveResolver.setDirective(
        directive, this._overrider.overrideMetadata(DirectiveMetadata, oldMetadata, override));
  }
  overrideComponent(
      component: ConcreteType<any>, override: MetadataOverride<ComponentMetadataType>): void {
    const oldMetadata = this._directiveResolver.resolve(component, false);
    this._directiveResolver.setDirective(
        component, this._overrider.overrideMetadata(ComponentMetadata, oldMetadata, override));
  }
  overridePipe(pipe: ConcreteType<any>, override: MetadataOverride<PipeMetadataType>): void {
    const oldMetadata = this._pipeResolver.resolve(pipe, false);
    this._pipeResolver.setPipe(
        pipe, this._overrider.overrideMetadata(PipeMetadata, oldMetadata, override));
  }
  clearCache(): void { this._compiler.clearCache(); }
  clearCacheFor(type: Type) { this._compiler.clearCacheFor(type); }
}

/**
 * Platform for dynamic tests
 *
 * @experimental
 */
export const platformCoreDynamicTesting =
    createPlatformFactory(platformCoreDynamic, 'coreDynamicTesting', [
      {
        provide: COMPILER_OPTIONS,
        useValue: {
          providers: [
            MockPipeResolver, {provide: PipeResolver, useExisting: MockPipeResolver},
            MockDirectiveResolver, {provide: DirectiveResolver, useExisting: MockDirectiveResolver},
            MockNgModuleResolver, {provide: NgModuleResolver, useExisting: MockNgModuleResolver}
          ]
        },
        multi: true
      },
      {provide: TestingCompilerFactory, useClass: TestingCompilerFactoryImpl}
    ]);

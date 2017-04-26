/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all APIs of the compiler package.
 *
 * <div class="callout is-critical">
 *   <header>Unstable APIs</header>
 *   <p>
 *     All compiler apis are currently considered experimental and private!
 *   </p>
 *   <p>
 *     We expect the APIs in this package to keep on changing. Do not rely on them.
 *   </p>
 * </div>
 */
export * from './schema_registry_mock';
export * from './directive_resolver_mock';
export * from './ng_module_resolver_mock';
export * from './pipe_resolver_mock';

import {createPlatformFactory, ModuleWithComponentFactories, Injectable, CompilerOptions, COMPILER_OPTIONS, CompilerFactory, ComponentFactory, NgModuleFactory, Injector, NgModule, Component, Directive, Pipe, Type, PlatformRef, ɵstringify} from '@angular/core';
import {MetadataOverride, ɵTestingCompilerFactory as TestingCompilerFactory, ɵTestingCompiler as TestingCompiler} from '@angular/core/testing';
import {platformCoreDynamic, JitCompiler, DirectiveResolver, NgModuleResolver, PipeResolver, CompileMetadataResolver} from '@angular/compiler';
import {MockDirectiveResolver} from './directive_resolver_mock';
import {MockNgModuleResolver} from './ng_module_resolver_mock';
import {MockPipeResolver} from './pipe_resolver_mock';
import {MetadataOverrider} from './metadata_overrider';

@Injectable()
export class TestingCompilerFactoryImpl implements TestingCompilerFactory {
  constructor(private _compilerFactory: CompilerFactory) {}

  createTestingCompiler(options: CompilerOptions[]): TestingCompiler {
    const compiler = <JitCompiler>this._compilerFactory.createCompiler(options);
    return new TestingCompilerImpl(
        compiler, compiler.injector.get(MockDirectiveResolver),
        compiler.injector.get(MockPipeResolver), compiler.injector.get(MockNgModuleResolver),
        compiler.injector.get(CompileMetadataResolver));
  }
}

export class TestingCompilerImpl implements TestingCompiler {
  private _overrider = new MetadataOverrider();
  constructor(
      private _compiler: JitCompiler, private _directiveResolver: MockDirectiveResolver,
      private _pipeResolver: MockPipeResolver, private _moduleResolver: MockNgModuleResolver,
      private _metadataResolver: CompileMetadataResolver) {}
  get injector(): Injector { return this._compiler.injector; }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._compiler.compileModuleSync(moduleType);
  }

  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._compiler.compileModuleAsync(moduleType);
  }
  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    return this._compiler.compileModuleAndAllComponentsSync(moduleType);
  }

  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return this._compiler.compileModuleAndAllComponentsAsync(moduleType);
  }

  getNgContentSelectors(component: Type<any>): string[] {
    return this._compiler.getNgContentSelectors(component);
  }

  getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    return this._compiler.getComponentFactory(component);
  }

  checkOverrideAllowed(type: Type<any>) {
    if (this._compiler.hasAotSummary(type)) {
      throw new Error(`${ɵstringify(type)} was AOT compiled, so its metadata cannot be changed.`);
    }
  }

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void {
    this.checkOverrideAllowed(ngModule);
    const oldMetadata = this._moduleResolver.resolve(ngModule, false);
    this._moduleResolver.setNgModule(
        ngModule, this._overrider.overrideMetadata(NgModule, oldMetadata, override));
  }
  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void {
    this.checkOverrideAllowed(directive);
    const oldMetadata = this._directiveResolver.resolve(directive, false);
    this._directiveResolver.setDirective(
        directive, this._overrider.overrideMetadata(Directive, oldMetadata !, override));
  }
  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void {
    this.checkOverrideAllowed(component);
    const oldMetadata = this._directiveResolver.resolve(component, false);
    this._directiveResolver.setDirective(
        component, this._overrider.overrideMetadata(Component, oldMetadata !, override));
  }
  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void {
    this.checkOverrideAllowed(pipe);
    const oldMetadata = this._pipeResolver.resolve(pipe, false);
    this._pipeResolver.setPipe(pipe, this._overrider.overrideMetadata(Pipe, oldMetadata, override));
  }
  loadAotSummaries(summaries: () => any[]) { this._compiler.loadAotSummaries(summaries); }
  clearCache(): void { this._compiler.clearCache(); }
  clearCacheFor(type: Type<any>) { this._compiler.clearCacheFor(type); }
}

/**
 * Platform for dynamic tests
 *
 * @experimental
 */
export const platformCoreDynamicTesting: (extraProviders?: any[]) => PlatformRef =
    createPlatformFactory(platformCoreDynamic, 'coreDynamicTesting', [
      {
        provide: COMPILER_OPTIONS,
        useValue: {
          providers: [
            MockPipeResolver,
            {provide: PipeResolver, useExisting: MockPipeResolver},
            MockDirectiveResolver,
            {provide: DirectiveResolver, useExisting: MockDirectiveResolver},
            MockNgModuleResolver,
            {provide: NgModuleResolver, useExisting: MockNgModuleResolver},
          ]
        },
        multi: true
      },
      {provide: TestingCompilerFactory, useClass: TestingCompilerFactoryImpl}
    ]);

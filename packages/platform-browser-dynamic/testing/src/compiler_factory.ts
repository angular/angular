/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileReflector, DirectiveResolver, ERROR_COMPONENT_TYPE, NgModuleResolver, PipeResolver} from '@angular/compiler';
import {MockDirectiveResolver, MockNgModuleResolver, MockPipeResolver} from '@angular/compiler/testing';
import {CompilerFactory, CompilerOptions, Component, ComponentFactory, Directive, Injector, ModuleWithComponentFactories, NgModule, NgModuleFactory, Pipe, StaticProvider, Type, ɵstringify as stringify} from '@angular/core';
import {MetadataOverride, ɵTestingCompiler as TestingCompiler, ɵTestingCompilerFactory as TestingCompilerFactory} from '@angular/core/testing';
import {ɵCompilerImpl as CompilerImpl} from '@angular/platform-browser-dynamic';

import {MetadataOverrider} from './metadata_overrider';

export const COMPILER_PROVIDERS: StaticProvider[] = [
  {provide: MockPipeResolver, deps: [CompileReflector]},
  {provide: PipeResolver, useExisting: MockPipeResolver},
  {provide: MockDirectiveResolver, deps: [CompileReflector]},
  {provide: DirectiveResolver, useExisting: MockDirectiveResolver},
  {provide: MockNgModuleResolver, deps: [CompileReflector]},
  {provide: NgModuleResolver, useExisting: MockNgModuleResolver},
];

export class TestingCompilerFactoryImpl implements TestingCompilerFactory {
  constructor(private _injector: Injector, private _compilerFactory: CompilerFactory) {}

  createTestingCompiler(options: CompilerOptions[]): TestingCompiler {
    const compiler = <CompilerImpl>this._compilerFactory.createCompiler(options);
    return new TestingCompilerImpl(
        compiler, compiler.injector.get(MockDirectiveResolver),
        compiler.injector.get(MockPipeResolver), compiler.injector.get(MockNgModuleResolver));
  }
}

export class TestingCompilerImpl implements TestingCompiler {
  private _overrider = new MetadataOverrider();
  constructor(
      private _compiler: CompilerImpl, private _directiveResolver: MockDirectiveResolver,
      private _pipeResolver: MockPipeResolver, private _moduleResolver: MockNgModuleResolver) {}
  get injector(): Injector {
    return this._compiler.injector;
  }

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

  getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    return this._compiler.getComponentFactory(component);
  }

  checkOverrideAllowed(type: Type<any>) {
    if (this._compiler.hasAotSummary(type)) {
      throw new Error(`${stringify(type)} was AOT compiled, so its metadata cannot be changed.`);
    }
  }

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void {
    this.checkOverrideAllowed(ngModule);
    const oldMetadata = this._moduleResolver.resolve(ngModule, false);
    this._moduleResolver.setNgModule(
        ngModule, this._overrider.overrideMetadata(NgModule, oldMetadata, override));
    this.clearCacheFor(ngModule);
  }
  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void {
    this.checkOverrideAllowed(directive);
    const oldMetadata = this._directiveResolver.resolve(directive, false);
    this._directiveResolver.setDirective(
        directive, this._overrider.overrideMetadata(Directive, oldMetadata!, override));
    this.clearCacheFor(directive);
  }
  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void {
    this.checkOverrideAllowed(component);
    const oldMetadata = this._directiveResolver.resolve(component, false);
    this._directiveResolver.setDirective(
        component, this._overrider.overrideMetadata(Component, oldMetadata!, override));
    this.clearCacheFor(component);
  }
  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void {
    this.checkOverrideAllowed(pipe);
    const oldMetadata = this._pipeResolver.resolve(pipe, false);
    this._pipeResolver.setPipe(pipe, this._overrider.overrideMetadata(Pipe, oldMetadata, override));
    this.clearCacheFor(pipe);
  }
  loadAotSummaries(summaries: () => any[]) {
    this._compiler.loadAotSummaries(summaries);
  }
  clearCache(): void {
    this._compiler.clearCache();
  }
  clearCacheFor(type: Type<any>) {
    this._compiler.clearCacheFor(type);
  }

  getComponentFromError(error: Error) {
    return (error as any)[ERROR_COMPONENT_TYPE] || null;
  }

  getModuleId(moduleType: Type<any>): string|undefined {
    return this._moduleResolver.resolve(moduleType, true).id;
  }
}

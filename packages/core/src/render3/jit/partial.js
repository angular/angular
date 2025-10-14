/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FactoryTarget, getCompilerFacade} from '../../compiler/compiler_facade';
import {setClassMetadata, setClassMetadataAsync} from '../metadata';
import {angularCoreEnv} from './environment';
/**
 * Compiles a partial directive declaration object into a full directive definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareDirective(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'directive',
    type: decl.type,
  });
  return compiler.compileDirectiveDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵfac.js`,
    decl,
  );
}
/**
 * Evaluates the class metadata declaration.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareClassMetadata(decl) {
  setClassMetadata(
    decl.type,
    decl.decorators,
    decl.ctorParameters ?? null,
    decl.propDecorators ?? null,
  );
}
/**
 * Evaluates the class metadata of a component that contains deferred blocks.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareClassMetadataAsync(decl) {
  setClassMetadataAsync(decl.type, decl.resolveDeferredDeps, (...types) => {
    const meta = decl.resolveMetadata(...types);
    setClassMetadata(decl.type, meta.decorators, meta.ctorParameters, meta.propDecorators);
  });
}
/**
 * Compiles a partial component declaration object into a full component definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareComponent(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'component',
    type: decl.type,
  });
  return compiler.compileComponentDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵcmp.js`,
    decl,
  );
}
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareFactory(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: getFactoryKind(decl.target),
    type: decl.type,
  });
  return compiler.compileFactoryDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵfac.js`,
    decl,
  );
}
function getFactoryKind(target) {
  switch (target) {
    case FactoryTarget.Directive:
      return 'directive';
    case FactoryTarget.Component:
      return 'component';
    case FactoryTarget.Injectable:
      return 'injectable';
    case FactoryTarget.Pipe:
      return 'pipe';
    case FactoryTarget.NgModule:
      return 'NgModule';
  }
}
/**
 * Compiles a partial injectable declaration object into a full injectable definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareInjectable(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'injectable',
    type: decl.type,
  });
  return compiler.compileInjectableDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵprov.js`,
    decl,
  );
}
/**
 * These enums are used in the partial factory declaration calls.
 */
export {FactoryTarget} from '../../compiler/compiler_facade';
/**
 * Compiles a partial injector declaration object into a full injector definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareInjector(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'NgModule',
    type: decl.type,
  });
  return compiler.compileInjectorDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵinj.js`,
    decl,
  );
}
/**
 * Compiles a partial NgModule declaration object into a full NgModule definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclareNgModule(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'NgModule',
    type: decl.type,
  });
  return compiler.compileNgModuleDeclaration(
    angularCoreEnv,
    `ng:///${decl.type.name}/ɵmod.js`,
    decl,
  );
}
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
export function ɵɵngDeclarePipe(decl) {
  const compiler = getCompilerFacade({
    usage: 1 /* JitCompilerUsage.PartialDeclaration */,
    kind: 'pipe',
    type: decl.type,
  });
  return compiler.compilePipeDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵpipe.js`, decl);
}
//# sourceMappingURL=partial.js.map

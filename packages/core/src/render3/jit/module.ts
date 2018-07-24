/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, R3InjectorMetadata, R3NgModuleMetadata, R3Reference, WrappedNodeExpr, compileInjector, compileNgModule as compileR3NgModule, jitExpression} from '@angular/compiler';

import {ModuleWithProviders, NgModule, NgModuleDefInternal, NgModuleTransitiveScopes} from '../../metadata/ng_module';
import {Type} from '../../type';
import {ComponentDefInternal} from '../interfaces/definition';

import {angularCoreEnv} from './environment';
import {NG_COMPONENT_DEF, NG_DIRECTIVE_DEF, NG_INJECTOR_DEF, NG_MODULE_DEF, NG_PIPE_DEF} from './fields';
import {reflectDependencies} from './util';

const EMPTY_ARRAY: Type<any>[] = [];

export function compileNgModule(type: Type<any>, ngModule: NgModule): void {
  const declarations: Type<any>[] = flatten(ngModule.declarations || EMPTY_ARRAY);

  let ngModuleDef: any = null;
  Object.defineProperty(type, NG_MODULE_DEF, {
    get: () => {
      if (ngModuleDef === null) {
        const meta: R3NgModuleMetadata = {
          type: wrap(type),
          bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(wrap),
          declarations: declarations.map(wrapReference),
          imports: flatten(ngModule.imports || EMPTY_ARRAY)
                       .map(expandModuleWithProviders)
                       .map(wrapReference),
          exports: flatten(ngModule.exports || EMPTY_ARRAY)
                       .map(expandModuleWithProviders)
                       .map(wrapReference),
          emitInline: true,
        };
        const res = compileR3NgModule(meta);
        ngModuleDef =
            jitExpression(res.expression, angularCoreEnv, `ng://${type.name}/ngModuleDef.js`);
      }
      return ngModuleDef;
    },
  });

  let ngInjectorDef: any = null;
  Object.defineProperty(type, NG_INJECTOR_DEF, {
    get: () => {
      if (ngInjectorDef === null) {
        const meta: R3InjectorMetadata = {
          name: type.name,
          type: wrap(type),
          deps: reflectDependencies(type),
          providers: new WrappedNodeExpr(ngModule.providers || EMPTY_ARRAY),
          imports: new WrappedNodeExpr([
            ngModule.imports || EMPTY_ARRAY,
            ngModule.exports || EMPTY_ARRAY,
          ]),
        };
        const res = compileInjector(meta);
        ngInjectorDef =
            jitExpression(res.expression, angularCoreEnv, `ng://${type.name}/ngInjectorDef.js`);
      }
      return ngInjectorDef;
    },
  });

  declarations.forEach(declaration => {
    // Some declared components may be compiled asynchronously, and thus may not have their
    // ngComponentDef set yet. If this is the case, then a reference to the module is written into
    // the `ngSelectorScope` property of the declared type.
    if (declaration.hasOwnProperty(NG_COMPONENT_DEF)) {
      // An `ngComponentDef` field exists - go ahead and patch the component directly.
      patchComponentDefWithScope(
          (declaration as Type<any>& {ngComponentDef: ComponentDefInternal<any>}).ngComponentDef,
          type);
    } else if (
        !declaration.hasOwnProperty(NG_DIRECTIVE_DEF) && !declaration.hasOwnProperty(NG_PIPE_DEF)) {
      // Set `ngSelectorScope` for future reference when the component compilation finishes.
      (declaration as Type<any>& {ngSelectorScope?: any}).ngSelectorScope = type;
    }
  });
}

/**
 * Patch the definition of a component with directives and pipes from the compilation scope of
 * a given module.
 */
export function patchComponentDefWithScope<C, M>(
    componentDef: ComponentDefInternal<C>, module: Type<M>) {
  componentDef.directiveDefs = () => Array.from(transitiveScopesFor(module).compilation.directives)
                                         .map(dir => dir.ngDirectiveDef || dir.ngComponentDef)
                                         .filter(def => !!def);
  componentDef.pipeDefs = () =>
      Array.from(transitiveScopesFor(module).compilation.pipes).map(pipe => pipe.ngPipeDef);
}

/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given module.
 *
 * This operation is memoized and the result is cached on the module's definition. It can be called
 * on modules with components that have not fully compiled yet, but the result should not be used
 * until they have.
 */
export function transitiveScopesFor<T>(moduleType: Type<T>): NgModuleTransitiveScopes {
  if (!isNgModule(moduleType)) {
    throw new Error(`${moduleType.name} does not have an ngModuleDef`);
  }
  const def = moduleType.ngModuleDef;

  if (def.transitiveCompileScopes !== null) {
    return def.transitiveCompileScopes;
  }

  const scopes: NgModuleTransitiveScopes = {
    compilation: {
      directives: new Set<any>(),
      pipes: new Set<any>(),
    },
    exported: {
      directives: new Set<any>(),
      pipes: new Set<any>(),
    },
  };

  def.declarations.forEach(declared => {
    const declaredWithDefs = declared as Type<any>& { ngPipeDef?: any; };

    if (declaredWithDefs.ngPipeDef !== undefined) {
      scopes.compilation.pipes.add(declared);
    } else {
      // Either declared has an ngComponentDef or ngDirectiveDef, or it's a component which hasn't
      // had its template compiled yet. In either case, it gets added to the compilation's
      // directives.
      scopes.compilation.directives.add(declared);
    }
  });

  def.imports.forEach(<I>(imported: Type<I>) => {
    let importedTyped = imported as Type<I>& {
      // If imported is an @NgModule:
      ngModuleDef?: NgModuleDefInternal<I>;
    };

    if (!isNgModule<I>(importedTyped)) {
      throw new Error(`Importing ${importedTyped.name} which does not have an ngModuleDef`);
    }

    // When this module imports another, the imported module's exported directives and pipes are
    // added to the compilation scope of this module.
    const importedScope = transitiveScopesFor(importedTyped);
    importedScope.exported.directives.forEach(entry => scopes.compilation.directives.add(entry));
    importedScope.exported.pipes.forEach(entry => scopes.compilation.pipes.add(entry));
  });

  def.exports.forEach(<E>(exported: Type<E>) => {
    const exportedTyped = exported as Type<E>& {
      // Components, Directives, NgModules, and Pipes can all be exported.
      ngComponentDef?: any;
      ngDirectiveDef?: any;
      ngModuleDef?: NgModuleDefInternal<E>;
      ngPipeDef?: any;
    };

    // Either the type is a module, a pipe, or a component/directive (which may not have an
    // ngComponentDef as it might be compiled asynchronously).
    if (isNgModule(exportedTyped)) {
      // When this module exports another, the exported module's exported directives and pipes are
      // added to both the compilation and exported scopes of this module.
      const exportedScope = transitiveScopesFor(exportedTyped);
      exportedScope.exported.directives.forEach(entry => {
        scopes.compilation.directives.add(entry);
        scopes.exported.directives.add(entry);
      });
      exportedScope.exported.pipes.forEach(entry => {
        scopes.compilation.pipes.add(entry);
        scopes.exported.pipes.add(entry);
      });
    } else if (exportedTyped.ngPipeDef !== undefined) {
      scopes.exported.pipes.add(exportedTyped);
    } else {
      scopes.exported.directives.add(exportedTyped);
    }
  });

  def.transitiveCompileScopes = scopes;
  return scopes;
}

function flatten<T>(values: any[]): T[] {
  const out: T[] = [];
  values.forEach(value => {
    if (Array.isArray(value)) {
      out.push(...flatten<T>(value));
    } else {
      out.push(value);
    }
  });
  return out;
}

function expandModuleWithProviders(value: Type<any>| ModuleWithProviders): Type<any> {
  if (isModuleWithProviders(value)) {
    return value.ngModule;
  }
  return value;
}

function wrap(value: Type<any>): Expression {
  return new WrappedNodeExpr(value);
}

function wrapReference(value: Type<any>): R3Reference {
  const wrapped = wrap(value);
  return {value: wrapped, type: wrapped};
}

function isModuleWithProviders(value: any): value is ModuleWithProviders {
  return (value as{ngModule?: any}).ngModule !== undefined;
}

function isNgModule<T>(value: Type<T>): value is Type<T>&{ngModuleDef: NgModuleDefInternal<T>} {
  return (value as{ngModuleDef?: NgModuleDefInternal<T>}).ngModuleDef !== undefined;
}

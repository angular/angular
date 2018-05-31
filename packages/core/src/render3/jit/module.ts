/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, R3NgModuleMetadata, WrappedNodeExpr, compileNgModule as compileR3NgModule, jitExpression} from '@angular/compiler';

import {ModuleWithProviders, NgModule, NgModuleDef} from '../../metadata/ng_module';
import {Type} from '../../type';
import {ComponentDef} from '../interfaces/definition';
import {flatten} from '../util';

import {angularCoreEnv} from './environment';

const EMPTY_ARRAY: Type<any>[] = [];

export function compileNgModule(type: Type<any>, ngModule: NgModule): void {
  const meta: R3NgModuleMetadata = {
    type: wrap(type),
    bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(wrap),
    declarations: flatten(ngModule.declarations || EMPTY_ARRAY).map(wrap),
    imports: flatten(ngModule.imports || EMPTY_ARRAY).map(expandModuleWithProviders).map(wrap),
    exports: flatten(ngModule.exports || EMPTY_ARRAY).map(expandModuleWithProviders).map(wrap),
    emitInline: true,
  };

  // Compute transitiveCompileScope
  const transitiveCompileScope = {
    directives: [] as any[],
    pipes: [] as any[],
  };

  function addExportsFrom(module: Type<any>& {ngModuleDef: NgModuleDef<any>}): void {
    module.ngModuleDef.exports.forEach((exp: any) => {
      if (isNgModule(exp)) {
        addExportsFrom(exp);
      } else if (exp.ngPipeDef) {
        transitiveCompileScope.pipes.push(exp);
      } else {
        transitiveCompileScope.directives.push(exp);
      }
    });
  }

  flatten([(ngModule.imports || EMPTY_ARRAY), (ngModule.exports || EMPTY_ARRAY)])
      .filter(importExport => isNgModule(importExport))
      .forEach(mod => addExportsFrom(mod));

  flatten(ngModule.declarations || EMPTY_ARRAY).forEach(decl => {
    if (decl.ngPipeDef) {
      transitiveCompileScope.pipes.push(decl);
    } else if (decl.ngComponentDef) {
      transitiveCompileScope.directives.push(decl);
      patchComponentWithScope(decl, type as any);
    } else {
      transitiveCompileScope.directives.push(decl);
      decl.ngSelectorScope = type;
    }
  });

  let def: any = null;
  Object.defineProperty(type, 'ngModuleDef', {
    get: () => {
      if (def === null) {
        const meta: R3NgModuleMetadata = {
          type: wrap(type),
          bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(wrap),
          declarations: flatten(ngModule.declarations || EMPTY_ARRAY).map(wrap),
          imports:
              flatten(ngModule.imports || EMPTY_ARRAY).map(expandModuleWithProviders).map(wrap),
          exports:
              flatten(ngModule.exports || EMPTY_ARRAY).map(expandModuleWithProviders).map(wrap),
          emitInline: true,
        };
        const res = compileR3NgModule(meta);
        def = jitExpression(res.expression, angularCoreEnv, `ng://${type.name}/ngModuleDef.js`);
        def.transitiveCompileScope = transitiveCompileScope;
      }
      return def;
    },
  });
}

export function patchComponentWithScope<C, M>(
    component: Type<C>& {ngComponentDef: ComponentDef<C>},
    module: Type<M>& {ngModuleDef: NgModuleDef<M>}) {
  component.ngComponentDef.directiveDefs = () =>
      module.ngModuleDef.transitiveCompileScope !.directives
          .map(dir => dir.ngDirectiveDef || dir.ngComponentDef)
          .filter(def => !!def);
  component.ngComponentDef.pipeDefs = () =>
      module.ngModuleDef.transitiveCompileScope !.pipes.map(pipe => pipe.ngPipeDef);
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

function isModuleWithProviders(value: any): value is ModuleWithProviders {
  return value.ngModule !== undefined;
}

function isNgModule(value: any): value is Type<any>&{ngModuleDef: NgModuleDef<any>} {
  return value.ngModuleDef !== undefined;
}

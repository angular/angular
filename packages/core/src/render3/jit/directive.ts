/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileComponent as compileIvyComponent, parseTemplate, ConstantPool, makeBindingParser, WrappedNodeExpr, jitPatchDefinition,} from '@angular/compiler';

import {Component} from '../../metadata/directives';
import {ReflectionCapabilities} from '../../reflection/reflection_capabilities';
import {Type} from '../../type';

import {angularCoreEnv} from './environment';
import {reflectDependencies} from './util';

let _pendingPromises: Promise<void>[] = [];

/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * ngComponentDef onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will return a `Promise` which will resolve when compilation completes and the component becomes
 * usable.
 */
export function compileComponent(type: Type<any>, metadata: Component): Promise<void>|null {
  // TODO(alxhub): implement ResourceLoader support for template compilation.
  if (!metadata.template) {
    throw new Error('templateUrl not yet supported');
  }

  // Parse the template and check for errors.
  const template = parseTemplate(metadata.template !, `ng://${type.name}/template.html`);
  if (template.errors !== undefined) {
    const errors = template.errors.map(err => err.toString()).join(', ');
    throw new Error(`Errors during JIT compilation of template for ${type.name}: ${errors}`);
  }

  // The ConstantPool is a requirement of the JIT'er.
  const constantPool = new ConstantPool();

  // Compile the component metadata, including template, into an expression.
  // TODO(alxhub): implement inputs, outputs, queries, etc.
  const res = compileIvyComponent(
      {
        name: type.name,
        type: new WrappedNodeExpr(type),
        selector: metadata.selector !, template,
        deps: reflectDependencies(type),
        directives: new Map(),
        pipes: new Map(),
        host: {
          attributes: {},
          listeners: {},
          properties: {},
        },
        inputs: {},
        outputs: {},
        lifecycle: {
          usesOnChanges: false,
        },
        queries: [],
        typeSourceSpan: null !,
        viewQueries: [],
      },
      constantPool, makeBindingParser());

  // Patch the generated expression as ngComponentDef on the type.
  jitPatchDefinition(type, 'ngComponentDef', res.expression, angularCoreEnv, constantPool);
  return null;
}

/**
 * A wrapper around `compileComponent` which is intended to be used for the `@Component` decorator.
 *
 * This wrapper keeps track of the `Promise` returned by `compileComponent` and will cause
 * `awaitCurrentlyCompilingComponents` to wait on the compilation to be finished.
 */
export function compileComponentDecorator(type: Type<any>, metadata: Component): void {
  const res = compileComponent(type, metadata);
  if (res !== null) {
    _pendingPromises.push(res);
  }
}

/**
 * Returns a promise which will await the compilation of any `@Component`s which have been defined
 * since the last time `awaitCurrentlyCompilingComponents` was called.
 */
export function awaitCurrentlyCompilingComponents(): Promise<void> {
  const res = Promise.all(_pendingPromises).then(() => undefined);
  _pendingPromises = [];
  return res;
}

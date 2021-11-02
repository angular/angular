/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is an interop file allowing for `@babel/core` to be imported in both CommonJS or
 * ES module files. The `@babel/core` package needs some special treatment because:
 *
 * Using a default import does not with CommonJS because the `@babel/core` package does not
 * expose a `default` export at runtime (because it sets the `_esModule` property that causes
 * TS to not create the necessary interop `default` export). On the other side, when loaded
 * as part of an ESM, NodeJS will make all of the exports available as default export.
 *
 * Using named import bindings (i.e. namespace import or actual named bindings) is not
 * working well for ESM because as said before, NodeJS will make all of the exports available
 * as the `default` export. Hence ESM that imports CJS, always should use the default import.
 *
 * There is no solution that would work for both CJS and ESM, so we need to use a custom interop
 * that switches between the named exports or the default exports depending on what is available.
 * This allows the code to run in both ESM (for production) and CJS (for development).
 *
 * TODO(devversion): remove this once devmode uses ESM as well.
 */

// tslint:disable-next-line
import * as _babelNamespace from '@babel/core';
// tslint:disable-next-line
import _babelDefault from '@babel/core';

const babel: typeof _babelNamespace = _babelDefault ?? _babelNamespace;

// We create an alias of the `types` namespace so that we can re-export the
// types namespace. Preserving the namespace is important so that types
// can still be referenced using a qualified name.
import _typesNamespace = _babelNamespace.types;

// If the default export is available, we use its `types` runtime value
// for the type namespace we re-export. This is a trick we use to preserve
// the namespace types, while changing the runtime value of the namespace.
// TS complains about us assigning to a namespace but this is legal at runtime.
if (_babelDefault !== undefined) {
  // @ts-ignore
  _typesNamespace = _babelDefault.types;
}

export import types = _typesNamespace;
export type PluginObj = _babelNamespace.PluginObj;
export type ConfigAPI = _babelNamespace.ConfigAPI;
export type NodePath<T = _babelNamespace.Node> = _babelNamespace.NodePath<T>;

export const NodePath: typeof _babelNamespace.NodePath = babel.NodePath;
export const transformSync: typeof _babelNamespace.transformSync = babel.transformSync;
export const parse: typeof _babelNamespace.parse = babel.parse;

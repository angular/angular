/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3DeclareNgModuleFacade} from '../compiler_facade_interface';
import * as o from '../output/output_ast';

import {Identifiers as R3} from './r3_identifiers';
import {jitOnlyGuardedExpression, R3CompiledExpression, R3Reference, refsToArray} from './util';
import {DefinitionMap} from './view/util';

/**
 * How the selector scope of an NgModule (its declarations, imports, and exports) should be emitted
 * as a part of the NgModule definition.
 */
export enum R3SelectorScopeMode {
  /**
   * Emit the declarations inline into the module definition.
   *
   * This option is useful in certain contexts where it's known that JIT support is required. The
   * tradeoff here is that this emit style prevents directives and pipes from being tree-shaken if
   * they are unused, but the NgModule is used.
   */
  Inline,

  /**
   * Emit the declarations using a side effectful function call, `ɵɵsetNgModuleScope`, that is
   * guarded with the `ngJitMode` flag.
   *
   * This form of emit supports JIT and can be optimized away if the `ngJitMode` flag is set to
   * false, which allows unused directives and pipes to be tree-shaken.
   */
  SideEffect,

  /**
   * Don't generate selector scopes at all.
   *
   * This is useful for contexts where JIT support is known to be unnecessary.
   */
  Omit,
}

/**
 * Metadata required by the module compiler to generate a module def (`ɵmod`) for a type.
 */
export interface R3NgModuleMetadata {
  /**
   * An expression representing the module type being compiled.
   */
  type: R3Reference;

  /**
   * An array of expressions representing the bootstrap components specified by the module.
   */
  bootstrap: R3Reference[];

  /**
   * An array of expressions representing the directives and pipes declared by the module.
   */
  declarations: R3Reference[];

  /**
   * Those declarations which should be visible to downstream consumers. If not specified, all
   * declarations are made visible to downstream consumers.
   */
  publicDeclarationTypes: o.Expression[]|null;

  /**
   * An array of expressions representing the imports of the module.
   */
  imports: R3Reference[];

  /**
   * Whether or not to include `imports` in generated type declarations.
   */
  includeImportTypes: boolean;

  /**
   * An array of expressions representing the exports of the module.
   */
  exports: R3Reference[];

  /**
   * How to emit the selector scope values (declarations, imports, exports).
   */
  selectorScopeMode: R3SelectorScopeMode;

  /**
   * Whether to generate closure wrappers for bootstrap, declarations, imports, and exports.
   */
  containsForwardDecls: boolean;

  /**
   * The set of schemas that declare elements to be allowed in the NgModule.
   */
  schemas: R3Reference[]|null;

  /** Unique ID or expression representing the unique ID of an NgModule. */
  id: o.Expression|null;
}

/**
 * The shape of the object literal that is passed to the `ɵɵdefineNgModule()` call.
 */
interface R3NgModuleDefMap {
  /**
   * An expression representing the module type being compiled.
   */
  type: o.Expression;
  /**
   * An expression evaluating to an array of expressions representing the bootstrap components
   * specified by the module.
   */
  bootstrap?: o.Expression;
  /**
   * An expression evaluating to an array of expressions representing the directives and pipes
   * declared by the module.
   */
  declarations?: o.Expression;
  /**
   * An expression evaluating to an array of expressions representing the imports of the module.
   */
  imports?: o.Expression;
  /**
   * An expression evaluating to an array of expressions representing the exports of the module.
   */
  exports?: o.Expression;
  /**
   * A literal array expression containing the schemas that declare elements to be allowed in the
   * NgModule.
   */
  schemas?: o.LiteralArrayExpr;
  /**
   * An expression evaluating to the unique ID of an NgModule.
   * */
  id?: o.Expression;
}

/**
 * Construct an `R3NgModuleDef` for the given `R3NgModuleMetadata`.
 */
export function compileNgModule(meta: R3NgModuleMetadata): R3CompiledExpression {
  const {
    type: moduleType,
    bootstrap,
    declarations,
    imports,
    exports,
    schemas,
    containsForwardDecls,
    selectorScopeMode,
    id
  } = meta;

  const statements: o.Statement[] = [];
  const definitionMap = new DefinitionMap<R3NgModuleDefMap>();
  definitionMap.set('type', moduleType.value);

  if (bootstrap.length > 0) {
    definitionMap.set('bootstrap', refsToArray(bootstrap, containsForwardDecls));
  }

  if (selectorScopeMode === R3SelectorScopeMode.Inline) {
    // If requested to emit scope information inline, pass the `declarations`, `imports` and
    // `exports` to the `ɵɵdefineNgModule()` call directly.

    if (declarations.length > 0) {
      definitionMap.set('declarations', refsToArray(declarations, containsForwardDecls));
    }

    if (imports.length > 0) {
      definitionMap.set('imports', refsToArray(imports, containsForwardDecls));
    }

    if (exports.length > 0) {
      definitionMap.set('exports', refsToArray(exports, containsForwardDecls));
    }
  } else if (selectorScopeMode === R3SelectorScopeMode.SideEffect) {
    // In this mode, scope information is not passed into `ɵɵdefineNgModule` as it
    // would prevent tree-shaking of the declarations, imports and exports references. Instead, it's
    // patched onto the NgModule definition with a `ɵɵsetNgModuleScope` call that's guarded by the
    // `ngJitMode` flag.
    const setNgModuleScopeCall = generateSetNgModuleScopeCall(meta);
    if (setNgModuleScopeCall !== null) {
      statements.push(setNgModuleScopeCall);
    }
  } else {
    // Selector scope emit was not requested, so skip it.
  }

  if (schemas !== null && schemas.length > 0) {
    definitionMap.set('schemas', o.literalArr(schemas.map(ref => ref.value)));
  }

  if (id !== null) {
    definitionMap.set('id', id);

    // Generate a side-effectful call to register this NgModule by its id, as per the semantics of
    // NgModule ids.
    statements.push(o.importExpr(R3.registerNgModuleType).callFn([moduleType.value, id]).toStmt());
  }

  const expression =
      o.importExpr(R3.defineNgModule).callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createNgModuleType(meta);

  return {expression, type, statements};
}

/**
 * This function is used in JIT mode to generate the call to `ɵɵdefineNgModule()` from a call to
 * `ɵɵngDeclareNgModule()`.
 */
export function compileNgModuleDeclarationExpression(meta: R3DeclareNgModuleFacade): o.Expression {
  const definitionMap = new DefinitionMap<R3NgModuleDefMap>();
  definitionMap.set('type', new o.WrappedNodeExpr(meta.type));
  if (meta.bootstrap !== undefined) {
    definitionMap.set('bootstrap', new o.WrappedNodeExpr(meta.bootstrap));
  }
  if (meta.declarations !== undefined) {
    definitionMap.set('declarations', new o.WrappedNodeExpr(meta.declarations));
  }
  if (meta.imports !== undefined) {
    definitionMap.set('imports', new o.WrappedNodeExpr(meta.imports));
  }
  if (meta.exports !== undefined) {
    definitionMap.set('exports', new o.WrappedNodeExpr(meta.exports));
  }
  if (meta.schemas !== undefined) {
    definitionMap.set('schemas', new o.WrappedNodeExpr(meta.schemas));
  }
  if (meta.id !== undefined) {
    definitionMap.set('id', new o.WrappedNodeExpr(meta.id));
  }
  return o.importExpr(R3.defineNgModule).callFn([definitionMap.toLiteralMap()]);
}

export function createNgModuleType(
    {type: moduleType, declarations, exports, imports, includeImportTypes, publicDeclarationTypes}:
        R3NgModuleMetadata): o.ExpressionType {
  return new o.ExpressionType(o.importExpr(R3.NgModuleDeclaration, [
    new o.ExpressionType(moduleType.type),
    publicDeclarationTypes === null ? tupleTypeOf(declarations) :
                                      tupleOfTypes(publicDeclarationTypes),
    includeImportTypes ? tupleTypeOf(imports) : o.NONE_TYPE,
    tupleTypeOf(exports),
  ]));
}

/**
 * Generates a function call to `ɵɵsetNgModuleScope` with all necessary information so that the
 * transitive module scope can be computed during runtime in JIT mode. This call is marked pure
 * such that the references to declarations, imports and exports may be elided causing these
 * symbols to become tree-shakeable.
 */
function generateSetNgModuleScopeCall(meta: R3NgModuleMetadata): o.Statement|null {
  const {type: moduleType, declarations, imports, exports, containsForwardDecls} = meta;

  const scopeMap = new DefinitionMap<
      {declarations: o.Expression, imports: o.Expression, exports: o.Expression}>();

  if (declarations.length > 0) {
    scopeMap.set('declarations', refsToArray(declarations, containsForwardDecls));
  }

  if (imports.length > 0) {
    scopeMap.set('imports', refsToArray(imports, containsForwardDecls));
  }

  if (exports.length > 0) {
    scopeMap.set('exports', refsToArray(exports, containsForwardDecls));
  }

  if (Object.keys(scopeMap.values).length === 0) {
    return null;
  }

  // setNgModuleScope(...)
  const fnCall = new o.InvokeFunctionExpr(
      /* fn */ o.importExpr(R3.setNgModuleScope),
      /* args */[moduleType.value, scopeMap.toLiteralMap()]);

  // (ngJitMode guard) && setNgModuleScope(...)
  const guardedCall = jitOnlyGuardedExpression(fnCall);

  // function() { (ngJitMode guard) && setNgModuleScope(...); }
  const iife = new o.FunctionExpr(
      /* params */[],
      /* statements */[guardedCall.toStmt()]);

  // (function() { (ngJitMode guard) && setNgModuleScope(...); })()
  const iifeCall = new o.InvokeFunctionExpr(
      /* fn */ iife,
      /* args */[]);

  return iifeCall.toStmt();
}

function tupleTypeOf(exp: R3Reference[]): o.Type {
  const types = exp.map(ref => o.typeofExpr(ref.type));
  return exp.length > 0 ? o.expressionType(o.literalArr(types)) : o.NONE_TYPE;
}

function tupleOfTypes(types: o.Expression[]): o.Type {
  const typeofTypes = types.map(type => o.typeofExpr(type));
  return types.length > 0 ? o.expressionType(o.literalArr(typeofTypes)) : o.NONE_TYPE;
}

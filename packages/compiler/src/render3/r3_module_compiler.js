/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {jitOnlyGuardedExpression, refsToArray} from './util';
import {DefinitionMap} from './view/util';
/**
 * How the selector scope of an NgModule (its declarations, imports, and exports) should be emitted
 * as a part of the NgModule definition.
 */
export var R3SelectorScopeMode;
(function (R3SelectorScopeMode) {
  /**
   * Emit the declarations inline into the module definition.
   *
   * This option is useful in certain contexts where it's known that JIT support is required. The
   * tradeoff here is that this emit style prevents directives and pipes from being tree-shaken if
   * they are unused, but the NgModule is used.
   */
  R3SelectorScopeMode[(R3SelectorScopeMode['Inline'] = 0)] = 'Inline';
  /**
   * Emit the declarations using a side effectful function call, `ɵɵsetNgModuleScope`, that is
   * guarded with the `ngJitMode` flag.
   *
   * This form of emit supports JIT and can be optimized away if the `ngJitMode` flag is set to
   * false, which allows unused directives and pipes to be tree-shaken.
   */
  R3SelectorScopeMode[(R3SelectorScopeMode['SideEffect'] = 1)] = 'SideEffect';
  /**
   * Don't generate selector scopes at all.
   *
   * This is useful for contexts where JIT support is known to be unnecessary.
   */
  R3SelectorScopeMode[(R3SelectorScopeMode['Omit'] = 2)] = 'Omit';
})(R3SelectorScopeMode || (R3SelectorScopeMode = {}));
/**
 * The type of the NgModule meta data.
 * - Global: Used for full and partial compilation modes which mainly includes R3References.
 * - Local: Used for the local compilation mode which mainly includes the raw expressions as appears
 * in the NgModule decorator.
 */
export var R3NgModuleMetadataKind;
(function (R3NgModuleMetadataKind) {
  R3NgModuleMetadataKind[(R3NgModuleMetadataKind['Global'] = 0)] = 'Global';
  R3NgModuleMetadataKind[(R3NgModuleMetadataKind['Local'] = 1)] = 'Local';
})(R3NgModuleMetadataKind || (R3NgModuleMetadataKind = {}));
/**
 * Construct an `R3NgModuleDef` for the given `R3NgModuleMetadata`.
 */
export function compileNgModule(meta) {
  const statements = [];
  const definitionMap = new DefinitionMap();
  definitionMap.set('type', meta.type.value);
  // Assign bootstrap definition. In local compilation mode (i.e., for
  // `R3NgModuleMetadataKind.LOCAL`) we assign the bootstrap field using the runtime
  // `ɵɵsetNgModuleScope`.
  if (meta.kind === R3NgModuleMetadataKind.Global && meta.bootstrap.length > 0) {
    definitionMap.set('bootstrap', refsToArray(meta.bootstrap, meta.containsForwardDecls));
  }
  if (meta.selectorScopeMode === R3SelectorScopeMode.Inline) {
    // If requested to emit scope information inline, pass the `declarations`, `imports` and
    // `exports` to the `ɵɵdefineNgModule()` call directly.
    if (meta.declarations.length > 0) {
      definitionMap.set('declarations', refsToArray(meta.declarations, meta.containsForwardDecls));
    }
    if (meta.imports.length > 0) {
      definitionMap.set('imports', refsToArray(meta.imports, meta.containsForwardDecls));
    }
    if (meta.exports.length > 0) {
      definitionMap.set('exports', refsToArray(meta.exports, meta.containsForwardDecls));
    }
  } else if (meta.selectorScopeMode === R3SelectorScopeMode.SideEffect) {
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
  if (meta.schemas !== null && meta.schemas.length > 0) {
    definitionMap.set('schemas', o.literalArr(meta.schemas.map((ref) => ref.value)));
  }
  if (meta.id !== null) {
    definitionMap.set('id', meta.id);
    // Generate a side-effectful call to register this NgModule by its id, as per the semantics of
    // NgModule ids.
    statements.push(
      o.importExpr(R3.registerNgModuleType).callFn([meta.type.value, meta.id]).toStmt(),
    );
  }
  const expression = o
    .importExpr(R3.defineNgModule)
    .callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createNgModuleType(meta);
  return {expression, type, statements};
}
/**
 * This function is used in JIT mode to generate the call to `ɵɵdefineNgModule()` from a call to
 * `ɵɵngDeclareNgModule()`.
 */
export function compileNgModuleDeclarationExpression(meta) {
  const definitionMap = new DefinitionMap();
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
export function createNgModuleType(meta) {
  if (meta.kind === R3NgModuleMetadataKind.Local) {
    return new o.ExpressionType(meta.type.value);
  }
  const {
    type: moduleType,
    declarations,
    exports,
    imports,
    includeImportTypes,
    publicDeclarationTypes,
  } = meta;
  return new o.ExpressionType(
    o.importExpr(R3.NgModuleDeclaration, [
      new o.ExpressionType(moduleType.type),
      publicDeclarationTypes === null
        ? tupleTypeOf(declarations)
        : tupleOfTypes(publicDeclarationTypes),
      includeImportTypes ? tupleTypeOf(imports) : o.NONE_TYPE,
      tupleTypeOf(exports),
    ]),
  );
}
/**
 * Generates a function call to `ɵɵsetNgModuleScope` with all necessary information so that the
 * transitive module scope can be computed during runtime in JIT mode. This call is marked pure
 * such that the references to declarations, imports and exports may be elided causing these
 * symbols to become tree-shakeable.
 */
function generateSetNgModuleScopeCall(meta) {
  const scopeMap = new DefinitionMap();
  if (meta.kind === R3NgModuleMetadataKind.Global) {
    if (meta.declarations.length > 0) {
      scopeMap.set('declarations', refsToArray(meta.declarations, meta.containsForwardDecls));
    }
  } else {
    if (meta.declarationsExpression) {
      scopeMap.set('declarations', meta.declarationsExpression);
    }
  }
  if (meta.kind === R3NgModuleMetadataKind.Global) {
    if (meta.imports.length > 0) {
      scopeMap.set('imports', refsToArray(meta.imports, meta.containsForwardDecls));
    }
  } else {
    if (meta.importsExpression) {
      scopeMap.set('imports', meta.importsExpression);
    }
  }
  if (meta.kind === R3NgModuleMetadataKind.Global) {
    if (meta.exports.length > 0) {
      scopeMap.set('exports', refsToArray(meta.exports, meta.containsForwardDecls));
    }
  } else {
    if (meta.exportsExpression) {
      scopeMap.set('exports', meta.exportsExpression);
    }
  }
  if (meta.kind === R3NgModuleMetadataKind.Local && meta.bootstrapExpression) {
    scopeMap.set('bootstrap', meta.bootstrapExpression);
  }
  if (Object.keys(scopeMap.values).length === 0) {
    return null;
  }
  // setNgModuleScope(...)
  const fnCall = new o.InvokeFunctionExpr(
    /* fn */ o.importExpr(R3.setNgModuleScope),
    /* args */ [meta.type.value, scopeMap.toLiteralMap()],
  );
  // (ngJitMode guard) && setNgModuleScope(...)
  const guardedCall = jitOnlyGuardedExpression(fnCall);
  // function() { (ngJitMode guard) && setNgModuleScope(...); }
  const iife = new o.FunctionExpr(/* params */ [], /* statements */ [guardedCall.toStmt()]);
  // (function() { (ngJitMode guard) && setNgModuleScope(...); })()
  const iifeCall = new o.InvokeFunctionExpr(/* fn */ iife, /* args */ []);
  return iifeCall.toStmt();
}
function tupleTypeOf(exp) {
  const types = exp.map((ref) => o.typeofExpr(ref.type));
  return exp.length > 0 ? o.expressionType(o.literalArr(types)) : o.NONE_TYPE;
}
function tupleOfTypes(types) {
  const typeofTypes = types.map((type) => o.typeofExpr(type));
  return types.length > 0 ? o.expressionType(o.literalArr(typeofTypes)) : o.NONE_TYPE;
}
//# sourceMappingURL=r3_module_compiler.js.map

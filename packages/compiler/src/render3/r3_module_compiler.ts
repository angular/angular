/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileShallowModuleMetadata, identifierName} from '../compile_metadata';
import {InjectableCompiler} from '../injectable_compiler';
import {mapLiteral} from '../output/map_util';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

import {R3DependencyMetadata, compileFactoryFunction} from './r3_factory';
import {Identifiers as R3} from './r3_identifiers';
import {R3Reference, convertMetaToOutput, mapToMapExpression} from './util';

export interface R3NgModuleDef {
  expression: o.Expression;
  type: o.Type;
  additionalStatements: o.Statement[];
}

/**
 * Metadata required by the module compiler to generate a `ngModuleDef` for a type.
 */
export interface R3NgModuleMetadata {
  /**
   * An expression representing the module type being compiled.
   */
  type: o.Expression;

  /**
   * An array of expressions representing the bootstrap components specified by the module.
   */
  bootstrap: R3Reference[];

  /**
   * An array of expressions representing the directives and pipes declared by the module.
   */
  declarations: R3Reference[];

  /**
   * An array of expressions representing the imports of the module.
   */
  imports: R3Reference[];

  /**
   * An array of expressions representing the exports of the module.
   */
  exports: R3Reference[];

  /**
   * Whether to emit the selector scope values (declarations, imports, exports) inline into the
   * module definition, or to generate additional statements which patch them on. Inline emission
   * does not allow components to be tree-shaken, but is useful for JIT mode.
   */
  emitInline: boolean;

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
 * Construct an `R3NgModuleDef` for the given `R3NgModuleMetadata`.
 */
export function compileNgModule(meta: R3NgModuleMetadata): R3NgModuleDef {
  const {
    type: moduleType,
    bootstrap,
    declarations,
    imports,
    exports,
    schemas,
    containsForwardDecls,
    emitInline,
    id
  } = meta;

  const additionalStatements: o.Statement[] = [];
  const definitionMap = {
    type: moduleType
  } as{
    type: o.Expression,
    bootstrap: o.Expression,
    declarations: o.Expression,
    imports: o.Expression,
    exports: o.Expression,
    schemas: o.LiteralArrayExpr,
    id: o.Expression
  };

  // Only generate the keys in the metadata if the arrays have values.
  if (bootstrap.length) {
    definitionMap.bootstrap = refsToArray(bootstrap, containsForwardDecls);
  }

  // If requested to emit scope information inline, pass the declarations, imports and exports to
  // the `ɵɵdefineNgModule` call. The JIT compilation uses this.
  if (emitInline) {
    if (declarations.length) {
      definitionMap.declarations = refsToArray(declarations, containsForwardDecls);
    }

    if (imports.length) {
      definitionMap.imports = refsToArray(imports, containsForwardDecls);
    }

    if (exports.length) {
      definitionMap.exports = refsToArray(exports, containsForwardDecls);
    }
  }

  // If not emitting inline, the scope information is not passed into `ɵɵdefineNgModule` as it would
  // prevent tree-shaking of the declarations, imports and exports references.
  else {
    const setNgModuleScopeCall = generateSetNgModuleScopeCall(meta);
    if (setNgModuleScopeCall !== null) {
      additionalStatements.push(setNgModuleScopeCall);
    }
  }

  if (schemas && schemas.length) {
    definitionMap.schemas = o.literalArr(schemas.map(ref => ref.value));
  }

  if (id) {
    definitionMap.id = id;
  }

  const expression = o.importExpr(R3.defineNgModule).callFn([mapToMapExpression(definitionMap)]);
  const type = new o.ExpressionType(o.importExpr(R3.NgModuleDefWithMeta, [
    new o.ExpressionType(moduleType), tupleTypeOf(declarations), tupleTypeOf(imports),
    tupleTypeOf(exports)
  ]));


  return {expression, type, additionalStatements};
}

/**
 * Generates a function call to `ɵɵsetNgModuleScope` with all necessary information so that the
 * transitive module scope can be computed during runtime in JIT mode. This call is marked pure
 * such that the references to declarations, imports and exports may be elided causing these
 * symbols to become tree-shakeable.
 */
function generateSetNgModuleScopeCall(meta: R3NgModuleMetadata): o.Statement|null {
  const {type: moduleType, declarations, imports, exports, containsForwardDecls} = meta;

  const scopeMap = {} as{
    declarations: o.Expression,
    imports: o.Expression,
    exports: o.Expression,
  };

  if (declarations.length) {
    scopeMap.declarations = refsToArray(declarations, containsForwardDecls);
  }

  if (imports.length) {
    scopeMap.imports = refsToArray(imports, containsForwardDecls);
  }

  if (exports.length) {
    scopeMap.exports = refsToArray(exports, containsForwardDecls);
  }

  if (Object.keys(scopeMap).length === 0) {
    return null;
  }

  const fnCall = new o.InvokeFunctionExpr(
      /* fn */ o.importExpr(R3.setNgModuleScope),
      /* args */[moduleType, mapToMapExpression(scopeMap)],
      /* type */ undefined,
      /* sourceSpan */ undefined,
      /* pure */ true);
  return fnCall.toStmt();
}

export interface R3InjectorDef {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

export interface R3InjectorMetadata {
  name: string;
  type: o.Expression;
  deps: R3DependencyMetadata[]|null;
  providers: o.Expression|null;
  imports: o.Expression[];
}

export function compileInjector(meta: R3InjectorMetadata): R3InjectorDef {
  const result = compileFactoryFunction({
    name: meta.name,
    type: meta.type,
    deps: meta.deps,
    injectFn: R3.inject,
  });
  const definitionMap = {
    factory: result.factory,
  } as{factory: o.Expression, providers: o.Expression, imports: o.Expression};

  if (meta.providers !== null) {
    definitionMap.providers = meta.providers;
  }

  if (meta.imports.length > 0) {
    definitionMap.imports = o.literalArr(meta.imports);
  }

  const expression = o.importExpr(R3.defineInjector).callFn([mapToMapExpression(definitionMap)]);
  const type =
      new o.ExpressionType(o.importExpr(R3.InjectorDef, [new o.ExpressionType(meta.type)]));
  return {expression, type, statements: result.statements};
}

// TODO(alxhub): integrate this with `compileNgModule`. Currently the two are separate operations.
export function compileNgModuleFromRender2(
    ctx: OutputContext, ngModule: CompileShallowModuleMetadata,
    injectableCompiler: InjectableCompiler): void {
  const className = identifierName(ngModule.type) !;

  const rawImports = ngModule.rawImports ? [ngModule.rawImports] : [];
  const rawExports = ngModule.rawExports ? [ngModule.rawExports] : [];

  const injectorDefArg = mapLiteral({
    'factory':
        injectableCompiler.factoryFor({type: ngModule.type, symbol: ngModule.type.reference}, ctx),
    'providers': convertMetaToOutput(ngModule.rawProviders, ctx),
    'imports': convertMetaToOutput([...rawImports, ...rawExports], ctx),
  });

  const injectorDef = o.importExpr(R3.defineInjector).callFn([injectorDefArg]);

  ctx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ 'ngInjectorDef',
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ injectorDef, )],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}

function accessExportScope(module: o.Expression): o.Expression {
  const selectorScope = new o.ReadPropExpr(module, 'ngModuleDef');
  return new o.ReadPropExpr(selectorScope, 'exported');
}

function tupleTypeOf(exp: R3Reference[]): o.Type {
  const types = exp.map(ref => o.typeofExpr(ref.type));
  return exp.length > 0 ? o.expressionType(o.literalArr(types)) : o.NONE_TYPE;
}

function refsToArray(refs: R3Reference[], shouldForwardDeclare: boolean): o.Expression {
  const values = o.literalArr(refs.map(ref => ref.value));
  return shouldForwardDeclare ? o.fn([], [new o.ReturnStatement(values)]) : values;
}

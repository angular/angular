/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  compileNgModule,
  ConstantPool,
  outputAst as o,
  R3DeclareNgModuleMetadata,
  R3NgModuleMetadata,
  R3NgModuleMetadataKind,
  R3PartialDeclaration,
  R3Reference,
  R3SelectorScopeMode,
} from '@angular/compiler';

import {AstObject, AstValue} from '../../ast/ast_value';

import {LinkedDefinition, PartialLinker} from './partial_linker';
import {wrapReference} from './util';

/**
 * A `PartialLinker` that is designed to process `ɵɵngDeclareNgModule()` call expressions.
 */
export class PartialNgModuleLinkerVersion1<TExpression> implements PartialLinker<TExpression> {
  constructor(
    /**
     * If true then emit the additional declarations, imports, exports, etc in the NgModule
     * definition. These are only used by JIT compilation.
     */
    private emitInline: boolean,
  ) {}

  linkPartialDeclaration(
    constantPool: ConstantPool,
    metaObj: AstObject<R3PartialDeclaration, TExpression>,
  ): LinkedDefinition {
    const meta = toR3NgModuleMeta(metaObj, this.emitInline);
    return compileNgModule(meta);
  }
}

/**
 * Derives the `R3NgModuleMetadata` structure from the AST object.
 */
export function toR3NgModuleMeta<TExpression>(
  metaObj: AstObject<R3DeclareNgModuleMetadata, TExpression>,
  supportJit: boolean,
): R3NgModuleMetadata {
  const wrappedType = metaObj.getOpaque('type');

  const meta: R3NgModuleMetadata = {
    kind: R3NgModuleMetadataKind.Global,
    type: wrapReference(wrappedType),
    bootstrap: [],
    declarations: [],
    publicDeclarationTypes: null,
    includeImportTypes: true,
    imports: [],
    exports: [],
    selectorScopeMode: supportJit ? R3SelectorScopeMode.Inline : R3SelectorScopeMode.Omit,
    containsForwardDecls: false,
    schemas: [],
    id: metaObj.has('id') ? metaObj.getOpaque('id') : null,
  };

  // Each of `bootstrap`, `declarations`, `imports` and `exports` are normally an array. But if any
  // of the references are not yet declared, then the arrays must be wrapped in a function to
  // prevent errors at runtime when accessing the values.

  // The following blocks of code will unwrap the arrays from such functions, because
  // `R3NgModuleMetadata` expects arrays of `R3Reference` objects.

  // Further, since the `ɵɵdefineNgModule()` will also suffer from the forward declaration problem,
  // we must update the `containsForwardDecls` property if a function wrapper was found.

  if (metaObj.has('bootstrap')) {
    const bootstrap = metaObj.getValue('bootstrap');
    if (bootstrap.isFunction()) {
      meta.containsForwardDecls = true;
      meta.bootstrap = wrapReferences(unwrapForwardRefs(bootstrap));
    } else meta.bootstrap = wrapReferences(bootstrap as AstValue<TExpression[], TExpression>);
  }

  if (metaObj.has('declarations')) {
    const declarations = metaObj.getValue('declarations');
    if (declarations.isFunction()) {
      meta.containsForwardDecls = true;
      meta.declarations = wrapReferences(unwrapForwardRefs(declarations));
    } else meta.declarations = wrapReferences(declarations as AstValue<TExpression[], TExpression>);
  }

  if (metaObj.has('imports')) {
    const imports = metaObj.getValue('imports');
    if (imports.isFunction()) {
      meta.containsForwardDecls = true;
      meta.imports = wrapReferences(unwrapForwardRefs(imports));
    } else meta.imports = wrapReferences(imports as AstValue<TExpression[], TExpression>);
  }

  if (metaObj.has('exports')) {
    const exports = metaObj.getValue('exports');
    if (exports.isFunction()) {
      meta.containsForwardDecls = true;
      meta.exports = wrapReferences(unwrapForwardRefs(exports));
    } else meta.exports = wrapReferences(exports as AstValue<TExpression[], TExpression>);
  }

  if (metaObj.has('schemas')) {
    const schemas = metaObj.getValue('schemas');
    meta.schemas = wrapReferences(schemas as AstValue<TExpression[], TExpression>);
  }

  return meta;
}

/**
 * Extract an array from the body of the function.
 *
 * If `field` is `function() { return [exp1, exp2, exp3]; }` then we return `[exp1, exp2, exp3]`.
 *
 */
function unwrapForwardRefs<TExpression>(
  field: AstValue<unknown, TExpression>,
): AstValue<TExpression[], TExpression> {
  return (field as AstValue<Function, TExpression>).getFunctionReturnValue();
}

/**
 * Wrap the array of expressions into an array of R3 references.
 */
function wrapReferences<TExpression>(values: AstValue<TExpression[], TExpression>): R3Reference[] {
  return values.getArray().map((i) => wrapReference(i.getOpaque()));
}

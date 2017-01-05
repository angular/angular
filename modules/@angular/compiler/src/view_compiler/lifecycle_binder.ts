/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveSummary, CompilePipeSummary} from '../compile_metadata';
import {isFirstViewCheck} from '../compiler_util/binding_util';
import {DirectiveWrapperExpressions} from '../directive_wrapper_compiler';
import * as o from '../output/output_ast';
import {LifecycleHooks} from '../private_import_core';
import {DirectiveAst, ProviderAst, ProviderAstType} from '../template_parser/template_ast';

import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';

export function bindDirectiveAfterContentLifecycleCallbacks(
    directiveMeta: CompileDirectiveSummary, directiveInstance: o.Expression,
    compileElement: CompileElement) {
  const view = compileElement.view;
  const lifecycleHooks = directiveMeta.type.lifecycleHooks;
  const afterContentLifecycleCallbacksMethod = view.afterContentLifecycleCallbacksMethod;
  afterContentLifecycleCallbacksMethod.resetDebugInfo(
      compileElement.nodeIndex, compileElement.sourceAst);
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterContentInit) !== -1) {
    afterContentLifecycleCallbacksMethod.addStmt(new o.IfStmt(
        isFirstViewCheck(o.THIS_EXPR),
        [directiveInstance.callMethod('ngAfterContentInit', []).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterContentChecked) !== -1) {
    afterContentLifecycleCallbacksMethod.addStmt(
        directiveInstance.callMethod('ngAfterContentChecked', []).toStmt());
  }
}

export function bindDirectiveAfterViewLifecycleCallbacks(
    directiveMeta: CompileDirectiveSummary, directiveInstance: o.Expression,
    compileElement: CompileElement) {
  const view = compileElement.view;
  const lifecycleHooks = directiveMeta.type.lifecycleHooks;
  const afterViewLifecycleCallbacksMethod = view.afterViewLifecycleCallbacksMethod;
  afterViewLifecycleCallbacksMethod.resetDebugInfo(
      compileElement.nodeIndex, compileElement.sourceAst);
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterViewInit) !== -1) {
    afterViewLifecycleCallbacksMethod.addStmt(new o.IfStmt(
        isFirstViewCheck(o.THIS_EXPR),
        [directiveInstance.callMethod('ngAfterViewInit', []).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterViewChecked) !== -1) {
    afterViewLifecycleCallbacksMethod.addStmt(
        directiveInstance.callMethod('ngAfterViewChecked', []).toStmt());
  }
}

export function bindDirectiveWrapperLifecycleCallbacks(
    dir: DirectiveAst, directiveWrapperIntance: o.Expression, compileElement: CompileElement) {
  compileElement.view.destroyMethod.addStmts(
      DirectiveWrapperExpressions.ngOnDestroy(dir.directive, directiveWrapperIntance));
  compileElement.view.detachMethod.addStmts(DirectiveWrapperExpressions.ngOnDetach(
      dir.hostProperties, directiveWrapperIntance, o.THIS_EXPR,
      compileElement.compViewExpr || o.THIS_EXPR, compileElement.renderNode));
}


export function bindInjectableDestroyLifecycleCallbacks(
    provider: ProviderAst, providerInstance: o.Expression, compileElement: CompileElement) {
  const onDestroyMethod = compileElement.view.destroyMethod;
  onDestroyMethod.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
  if (provider.providerType !== ProviderAstType.Directive &&
      provider.providerType !== ProviderAstType.Component &&
      provider.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
    onDestroyMethod.addStmt(providerInstance.callMethod('ngOnDestroy', []).toStmt());
  }
}

export function bindPipeDestroyLifecycleCallbacks(
    pipeMeta: CompilePipeSummary, pipeInstance: o.Expression, view: CompileView) {
  const onDestroyMethod = view.destroyMethod;
  if (pipeMeta.type.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
    onDestroyMethod.addStmt(pipeInstance.callMethod('ngOnDestroy', []).toStmt());
  }
}

import * as o from '../output/output_ast';
import {Identifiers} from '../identifiers';
import {DetectChangesVars, ChangeDetectorStateEnum} from './constants';
import {LifecycleHooks} from 'angular2/src/core/metadata/lifecycle_hooks';

import {CompileDirectiveMetadata, CompilePipeMetadata} from '../compile_metadata';
import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';

var STATE_IS_NEVER_CHECKED =
    o.THIS_EXPR.prop('state').identical(ChangeDetectorStateEnum.NeverChecked);

export function bindDirectiveDetectChangesLifecycleCallbacks(
    directiveMeta: CompileDirectiveMetadata, directiveInstance: o.Expression,
    changesVar: o.Expression, compileElement: CompileElement) {
  var view = compileElement.view;
  var detectChangesInInputsMethod = view.detectChangesInInputsMethod;
  var lifecycleHooks = directiveMeta.lifecycleHooks;
  if (lifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1) {
    detectChangesInInputsMethod.addStmt(
        new o.IfStmt(changesVar.notIdentical(o.NULL_EXPR),
                     [directiveInstance.callMethod('ngOnChanges', [changesVar]).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.OnInit) !== -1) {
    detectChangesInInputsMethod.addStmt(new o.IfStmt(
        STATE_IS_NEVER_CHECKED, [directiveInstance.callMethod('ngOnInit', []).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.DoCheck) !== -1) {
    detectChangesInInputsMethod.addStmt(directiveInstance.callMethod('ngDoCheck', []).toStmt());
  }
}

export function bindDirectiveAfterContentLifecycleCallbacks(directiveMeta: CompileDirectiveMetadata,
                                                            directiveInstance: o.Expression,
                                                            compileElement: CompileElement) {
  var view = compileElement.view;
  var lifecycleHooks = directiveMeta.lifecycleHooks;
  var afterContentLifecycleCallbacksMethod = view.afterContentLifecycleCallbacksMethod;
  afterContentLifecycleCallbacksMethod.resetDebugInfo({nodeIndex: compileElement.nodeIndex});
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterContentInit) !== -1) {
    afterContentLifecycleCallbacksMethod.addStmt(new o.IfStmt(
        STATE_IS_NEVER_CHECKED, [directiveInstance.callMethod('ngAfterContentInit', []).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterContentChecked) !== -1) {
    afterContentLifecycleCallbacksMethod.addStmt(
        directiveInstance.callMethod('ngAfterContentChecked', []).toStmt());
  }
}

export function bindDirectiveAfterViewLifecycleCallbacks(directiveMeta: CompileDirectiveMetadata,
                                                         directiveInstance: o.Expression,
                                                         compileElement: CompileElement) {
  var view = compileElement.view;
  var lifecycleHooks = directiveMeta.lifecycleHooks;
  var afterViewLifecycleCallbacksMethod = view.afterViewLifecycleCallbacksMethod;
  afterViewLifecycleCallbacksMethod.resetDebugInfo({nodeIndex: compileElement.nodeIndex});
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterViewInit) !== -1) {
    afterViewLifecycleCallbacksMethod.addStmt(new o.IfStmt(
        STATE_IS_NEVER_CHECKED, [directiveInstance.callMethod('ngAfterViewInit', []).toStmt()]));
  }
  if (lifecycleHooks.indexOf(LifecycleHooks.AfterViewChecked) !== -1) {
    afterViewLifecycleCallbacksMethod.addStmt(
        directiveInstance.callMethod('ngAfterViewChecked', []).toStmt());
  }
}

export function bindDirectiveDestroyLifecycleCallbacks(directiveMeta: CompileDirectiveMetadata,
                                                       directiveInstance: o.Expression,
                                                       compileElement: CompileElement) {
  var onDestroyMethod = compileElement.view.destroyMethod;
  onDestroyMethod.resetDebugInfo({nodeIndex: compileElement.nodeIndex});
  if (directiveMeta.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
    onDestroyMethod.addStmt(directiveInstance.callMethod('ngOnDestroy', []).toStmt());
  }
}

export function bindPipeDestroyLifecycleCallbacks(
    pipeMeta: CompilePipeMetadata, directiveInstance: o.Expression, view: CompileView) {
  var onDestroyMethod = view.destroyMethod;
  if (pipeMeta.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
    onDestroyMethod.addStmt(directiveInstance.callMethod('ngOnDestroy', []).toStmt());
  }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ListWrapper} from '../facade/collection';
import {identifierToken} from '../identifiers';
import {AnimationOutput} from '../private_import_core';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';

import {CompileElement, CompileNode} from './compile_element';
import {CompileView} from './compile_view';
import {CompileElementAnimationOutput, CompileEventListener, bindAnimationOutputs, bindDirectiveOutputs, bindRenderOutputs, collectEventListeners} from './event_binder';
import {bindDirectiveAfterContentLifecycleCallbacks, bindDirectiveAfterViewLifecycleCallbacks, bindDirectiveDetectChangesLifecycleCallbacks, bindInjectableDestroyLifecycleCallbacks, bindPipeDestroyLifecycleCallbacks} from './lifecycle_binder';
import {bindDirectiveHostProps, bindDirectiveInputs, bindRenderInputs, bindRenderText} from './property_binder';

export function bindView(
    view: CompileView, parsedTemplate: TemplateAst[], animationOutputs: AnimationOutput[]): void {
  var visitor = new ViewBinderVisitor(view, animationOutputs);
  templateVisitAll(visitor, parsedTemplate);
  view.pipes.forEach(
      (pipe) => { bindPipeDestroyLifecycleCallbacks(pipe.meta, pipe.instance, pipe.view); });
}

class ViewBinderVisitor implements TemplateAstVisitor {
  private _nodeIndex: number = 0;
  private _animationOutputsMap: {[key: string]: AnimationOutput} = {};

  constructor(public view: CompileView, public animationOutputs: AnimationOutput[]) {
    animationOutputs.forEach(
        entry => { this._animationOutputsMap[entry.fullPropertyName] = entry; });
  }

  visitBoundText(ast: BoundTextAst, parent: CompileElement): any {
    var node = this.view.nodes[this._nodeIndex++];
    bindRenderText(ast, node, this.view);
    return null;
  }
  visitText(ast: TextAst, parent: CompileElement): any {
    this._nodeIndex++;
    return null;
  }

  visitNgContent(ast: NgContentAst, parent: CompileElement): any { return null; }

  visitElement(ast: ElementAst, parent: CompileElement): any {
    var compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    var eventListeners: CompileEventListener[] = [];
    var animationEventListeners: CompileElementAnimationOutput[] = [];
    collectEventListeners(ast.outputs, ast.directives, compileElement).forEach(entry => {
      // TODO: figure out how to abstract this `if` statement elsewhere
      if (entry.eventName[0] == '@') {
        let animationOutputName = entry.eventName.substr(1);
        let output = this._animationOutputsMap[animationOutputName];
        // no need to report an error here since the parser will
        // have caught the missing animation trigger definition
        if (output) {
          animationEventListeners.push(new CompileElementAnimationOutput(entry, output));
        }
      } else {
        eventListeners.push(entry);
      }
    });
    bindAnimationOutputs(animationEventListeners);
    bindRenderInputs(ast.inputs, compileElement);
    bindRenderOutputs(eventListeners);
    ast.directives.forEach((directiveAst) => {
      var directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);

      bindDirectiveHostProps(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
    });
    templateVisitAll(this, ast.children, compileElement);
    // afterContent and afterView lifecycles need to be called bottom up
    // so that children are notified before parents
    ast.directives.forEach((directiveAst) => {
      var directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      var providerInstance = compileElement.instances.get(providerAst.token.reference);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: CompileElement): any {
    var compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
    ast.directives.forEach((directiveAst) => {
      var directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveDetectChangesLifecycleCallbacks(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      var providerInstance = compileElement.instances.get(providerAst.token.reference);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    bindView(compileElement.embeddedView, ast.children, this.animationOutputs);
    return null;
  }

  visitAttr(ast: AttrAst, ctx: any): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any { return null; }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    return null;
  }

  visitReference(ast: ReferenceAst, ctx: any): any { return null; }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}

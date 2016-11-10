/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';

import {CompileElement} from './compile_element';
import {CompileView} from './compile_view';
import {bindOutputs} from './event_binder';
import {bindDirectiveAfterContentLifecycleCallbacks, bindDirectiveAfterViewLifecycleCallbacks, bindDirectiveWrapperLifecycleCallbacks, bindInjectableDestroyLifecycleCallbacks, bindPipeDestroyLifecycleCallbacks} from './lifecycle_binder';
import {bindDirectiveHostProps, bindDirectiveInputs, bindRenderInputs, bindRenderText} from './property_binder';

export function bindView(
    view: CompileView, parsedTemplate: TemplateAst[], schemaRegistry: ElementSchemaRegistry): void {
  const visitor = new ViewBinderVisitor(view, schemaRegistry);
  templateVisitAll(visitor, parsedTemplate);
  view.pipes.forEach(
      (pipe) => { bindPipeDestroyLifecycleCallbacks(pipe.meta, pipe.instance, pipe.view); });
}

class ViewBinderVisitor implements TemplateAstVisitor {
  private _nodeIndex: number = 0;

  constructor(public view: CompileView, private _schemaRegistry: ElementSchemaRegistry) {}

  visitBoundText(ast: BoundTextAst, parent: CompileElement): any {
    const node = this.view.nodes[this._nodeIndex++];
    bindRenderText(ast, node, this.view);
    return null;
  }
  visitText(ast: TextAst, parent: CompileElement): any {
    this._nodeIndex++;
    return null;
  }

  visitNgContent(ast: NgContentAst, parent: CompileElement): any { return null; }

  visitElement(ast: ElementAst, parent: CompileElement): any {
    const compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    const hasEvents = bindOutputs(ast.outputs, ast.directives, compileElement, true);
    bindRenderInputs(ast.inputs, hasEvents, compileElement);
    ast.directives.forEach((directiveAst, dirIndex) => {
      const directiveWrapperInstance =
          compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
      bindDirectiveInputs(directiveAst, directiveWrapperInstance, dirIndex, compileElement);
      bindDirectiveHostProps(
          directiveAst, directiveWrapperInstance, compileElement, ast.name, this._schemaRegistry);
    });
    templateVisitAll(this, ast.children, compileElement);
    // afterContent and afterView lifecycles need to be called bottom up
    // so that children are notified before parents
    ast.directives.forEach((directiveAst) => {
      const directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
      const directiveWrapperInstance =
          compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveWrapperLifecycleCallbacks(
          directiveAst, directiveWrapperInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      const providerInstance = compileElement.instances.get(providerAst.token.reference);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: CompileElement): any {
    const compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    bindOutputs(ast.outputs, ast.directives, compileElement, false);
    ast.directives.forEach((directiveAst, dirIndex) => {
      const directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
      const directiveWrapperInstance =
          compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
      bindDirectiveInputs(directiveAst, directiveWrapperInstance, dirIndex, compileElement);

      bindDirectiveAfterContentLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(
          directiveAst.directive, directiveInstance, compileElement);
      bindDirectiveWrapperLifecycleCallbacks(
          directiveAst, directiveWrapperInstance, compileElement);
    });
    ast.providers.forEach((providerAst) => {
      const providerInstance = compileElement.instances.get(providerAst.token.reference);
      bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
    });
    bindView(compileElement.embeddedView, ast.children, this._schemaRegistry);
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

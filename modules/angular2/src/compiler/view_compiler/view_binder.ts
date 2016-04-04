import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {
  ListWrapper,
} from 'angular2/src/facade/collection';
import * as o from '../output/output_ast';
import {
  TemplateAst,
  TemplateAstVisitor,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundElementPropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst,
  DirectiveAst,
  BoundDirectivePropertyAst,
  templateVisitAll,
  PropertyBindingType,
  ProviderAst
} from '../template_ast';
import {
  bindRenderText,
  bindRenderInputs,
  bindDirectiveInputs,
  bindDirectiveHostProps
} from './property_binder';
import {bindRenderOutputs, collectEventListeners, bindDirectiveOutputs} from './event_binder';
import {
  bindDirectiveAfterContentLifecycleCallbacks,
  bindDirectiveAfterViewLifecycleCallbacks,
  bindDirectiveDestroyLifecycleCallbacks,
  bindPipeDestroyLifecycleCallbacks
} from './lifecycle_binder';
import {CompileView} from './compile_view';
import {CompileElement, CompileNode} from './compile_element';
import {CompilePipeMetadata} from '../compile_metadata';
import {injectFromViewParentInjector, getPropertyInView} from './util';
import {NameResolver} from './expression_converter';
import {Identifiers, identifierToken} from '../identifiers';
import {EventHandlerVars} from './constants';

export function bindView(view: CompileView, parsedTemplate: TemplateAst[]): void {
  var visitor = new ViewBinderVisitor(view);
  templateVisitAll(visitor, parsedTemplate);
}

class ViewBinderVisitor implements TemplateAstVisitor, NameResolver {
  private _nodeIndex: number = 0;

  constructor(public view: CompileView) {}

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
    var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
    bindRenderInputs(ast.inputs, compileElement);
    bindRenderOutputs(eventListeners);
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
      var directiveInstance = compileElement.directiveInstances[index];
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveHostProps(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
    });
    templateVisitAll(this, ast.children, compileElement);
    // afterContent and afterView lifecycles need to be called bottom up
    // so that children are notified before parents
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
      var directiveInstance = compileElement.directiveInstances[index];
      bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                                  compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                               compileElement);
      bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                             compileElement);
    });
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: CompileElement): any {
    var compileElement = <CompileElement>this.view.nodes[this._nodeIndex++];
    var eventListeners = collectEventListeners(ast.outputs, ast.directives, compileElement);
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
      var directiveInstance = compileElement.directiveInstances[index];
      bindDirectiveInputs(directiveAst, directiveInstance, compileElement);
      bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners);
      bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                                  compileElement);
      bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                               compileElement);
      bindDirectiveDestroyLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                             compileElement);
    });
    return null;
  }

  visitAttr(ast: AttrAst, ctx: any): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any { return null; }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    return null;
  }

  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }

  createPipe(name: string): o.Expression {
    var pipeMeta: CompilePipeMetadata =
        this.view.pipeMetas.find((pipeMeta) => pipeMeta.name == name);
    var pipeFieldName = pipeMeta.pure ? `_pipe_${name}` : `_pipe_${name}_${this.view.pipes.size}`;
    var pipeExpr = this.view.pipes.get(pipeFieldName);
    if (isBlank(pipeExpr)) {
      var deps = pipeMeta.type.diDeps.map((diDep) => {
        if (diDep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
          return o.THIS_EXPR.prop('ref');
        }
        return injectFromViewParentInjector(diDep.token, false);
      });
      this.view.fields.push(
          new o.ClassField(pipeFieldName, o.importType(pipeMeta.type), [o.StmtModifier.Private]));
      this.view.constructorMethod.resetDebugInfo(null, null);
      this.view.constructorMethod.addStmt(o.THIS_EXPR.prop(pipeFieldName)
                                              .set(o.importExpr(pipeMeta.type).instantiate(deps))
                                              .toStmt());
      pipeExpr = o.THIS_EXPR.prop(pipeFieldName);
      this.view.pipes.set(pipeFieldName, pipeExpr);
      bindPipeDestroyLifecycleCallbacks(pipeMeta, pipeExpr, this.view);
    }
    return pipeExpr;
  }

  getVariable(name: string): o.Expression {
    if (name == EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    var currView: CompileView = this.view;
    var result = currView.variables.get(name);
    var viewPath = [];
    while (isBlank(result) && isPresent(currView.declarationElement.view)) {
      currView = currView.declarationElement.view;
      result = currView.variables.get(name);
      viewPath.push(currView);
    }
    if (isPresent(result)) {
      return getPropertyInView(result, viewPath);
    } else {
      return null;
    }
  }
}

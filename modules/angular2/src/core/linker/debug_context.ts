import {isPresent, isBlank, CONST} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Injector} from 'angular2/src/core/di';
import {RenderDebugInfo} from 'angular2/src/core/render/api';
import {AppView} from './view';
import {ViewType} from './view_type';

@CONST()
export class StaticNodeDebugInfo {
  constructor(public source: string, public providerTokens: any[], public componentToken: any,
              public varTokens: {[key: string]: any}) {}
}

@CONST()
export class StaticBindingDebugInfo {
  constructor(public source: string) {}
}

export class DebugContext implements RenderDebugInfo {
  constructor(private _view: AppView<any>, public nodeIndex: number = null,
              public bindingIndex: number = null) {}

  private get _staticNodeInfo(): StaticNodeDebugInfo {
    return isPresent(this.nodeIndex) ? this._view.staticNodeDebugInfos[this.nodeIndex] : null;
  }

  private get _staticBindingInfo(): StaticBindingDebugInfo {
    return isPresent(this.bindingIndex) ? this._view.staticBindingDebugInfos[this.bindingIndex] :
                                          null;
  }

  get context() { return this._view.context; }
  get component() {
    var staticNodeInfo = this._staticNodeInfo;
    if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
      return this.injector.get(staticNodeInfo.componentToken);
    } else if (this.providerTokens.length > 0) {
      // TODO(tbosch): This was a bug in the old implementation that we
      // keep for now to land the big codegen PR.
      // clean this up later!
      return this.injector.get(this.providerTokens[0]);
    }
    return this.context;
  }
  get componentRenderElement() {
    var componentView = this._view;
    while (isPresent(componentView.declarationAppElement) &&
           componentView.type !== ViewType.COMPONENT) {
      componentView = componentView.declarationAppElement.parentView;
    }
    return isPresent(componentView.declarationAppElement) ?
               componentView.declarationAppElement.nativeElement :
               null;
  }
  get injector(): Injector { return this._view.injector(this.nodeIndex, true); }
  get renderNode(): any {
    if (isPresent(this.nodeIndex)) {
      return this._view.allNodes[this.nodeIndex];
    } else {
      return null;
    }
  }
  get providerTokens(): any[] {
    var staticNodeInfo = this._staticNodeInfo;
    return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
  }
  get nodeSource(): string {
    var staticNodeInfo = this._staticNodeInfo;
    return isPresent(staticNodeInfo) ? staticNodeInfo.source : null;
  }
  get source(): string {
    var sourceStack = [];
    var ctx: DebugContext = this;
    var view = this._view;
    while (isPresent(ctx)) {
      if (sourceStack.length === 0 || view.type === ViewType.COMPONENT) {
        sourceStack.push(isPresent(ctx.bindingSource) ? ctx.bindingSource : ctx.nodeSource);
      }
      if (isPresent(view.declarationAppElement)) {
        ctx = view.declarationAppElement.debugContext;
        view = view.declarationAppElement.parentView;
      } else {
        ctx = null;
      }
    }
    return sourceStack.join('\n in component ');
  }
  get locals(): {[key: string]: string} {
    var varValues: {[key: string]: string} = {};
    // TODO(tbosch): right now, the semantics of debugNode.locals are
    // that it contains the variables of all elements, not just
    // the given one. We preserve this for now to not have a breaking
    // change, but should change this later!
    ListWrapper.forEachWithIndex(this._view.staticNodeDebugInfos,
                                 (staticNodeInfo: StaticNodeDebugInfo, nodeIndex: number) => {
                                   var vars = staticNodeInfo.varTokens;
                                   StringMapWrapper.forEach(vars, (varToken, varName) => {
                                     var varValue;
                                     if (isBlank(varToken)) {
                                       varValue = this._view.allNodes[nodeIndex];
                                     } else {
                                       varValue = this._view.injectorGet(varToken, nodeIndex, null);
                                     }
                                     varValues[varName] = varValue;
                                   });
                                 });
    StringMapWrapper.forEach(this._view.locals,
                             (localValue, localName) => { varValues[localName] = localValue; });
    return varValues;
  }

  get bindingSource(): string {
    var staticBindingInfo = this._staticBindingInfo;
    return isPresent(staticBindingInfo) ? staticBindingInfo.source : null;
  }
}

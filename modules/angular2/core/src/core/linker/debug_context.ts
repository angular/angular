import {isPresent, isBlank, CONST} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Injector} from 'angular2/src/core/di';
import {RenderDebugInfo} from 'angular2/src/core/render/api';
import {AppView} from './view';
import {ViewType} from './view_type';

@CONST()
export class StaticNodeDebugInfo {
  constructor(public providerTokens: any[], public componentToken: any,
              public varTokens: {[key: string]: any}) {}
}

export class DebugContext implements RenderDebugInfo {
  constructor(private _view: AppView<any>, private _nodeIndex: number, private _tplRow: number,
              private _tplCol: number) {}

  private get _staticNodeInfo(): StaticNodeDebugInfo {
    return isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
  }

  get context() { return this._view.context; }
  get component() {
    var staticNodeInfo = this._staticNodeInfo;
    if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
      return this.injector.get(staticNodeInfo.componentToken);
    }
    return null;
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
  get injector(): Injector { return this._view.injector(this._nodeIndex); }
  get renderNode(): any {
    if (isPresent(this._nodeIndex) && isPresent(this._view.allNodes)) {
      return this._view.allNodes[this._nodeIndex];
    } else {
      return null;
    }
  }
  get providerTokens(): any[] {
    var staticNodeInfo = this._staticNodeInfo;
    return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
  }
  get source(): string {
    return `${this._view.componentType.templateUrl}:${this._tplRow}:${this._tplCol}`;
  }
  get locals(): {[key: string]: string} {
    var varValues: {[key: string]: string} = {};
    // TODO(tbosch): right now, the semantics of debugNode.locals are
    // that it contains the variables of all elements, not just
    // the given one. We preserve this for now to not have a breaking
    // change, but should change this later!
    ListWrapper.forEachWithIndex(
        this._view.staticNodeDebugInfos,
        (staticNodeInfo: StaticNodeDebugInfo, nodeIndex: number) => {
          var vars = staticNodeInfo.varTokens;
          StringMapWrapper.forEach(vars, (varToken, varName) => {
            var varValue;
            if (isBlank(varToken)) {
              varValue = isPresent(this._view.allNodes) ? this._view.allNodes[nodeIndex] : null;
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
}

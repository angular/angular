import {isBlank, isPresent, BaseException} from 'angular2/src/facade/lang';
import {RenderTemplateCmd, RenderTemplateCmdType, RenderBeginElementCmd, RenderBeginComponentCmd, RenderNgContentCmd, RenderTextCmd, RenderEmbeddedTemplateCmd, RenderCommonBeginElementCmd} from './api';

export interface ComponentTemplateResolver {
  resolveComponentTemplate(templateId:string):RenderTemplateCmd[];
}

export class RenderView<N> {
  constructor(public fragments:N[][],
    public boundElements: N[],
    public boundTextNodes: N[],
    public nativeShadowRoots: N[]) {}  
}

export class RenderViewBuilder<N> {
  boundElements:N[][];
  boundTextNodes:N[][];
  fragments:N[][];	
  nativeShadowRoots:N[];
  
  constructor(private _componentTemplateResolver:ComponentTemplateResolver) {    }
  
  build(fragmentCmds:RenderTemplateCmd[], inplaceElement:N):RenderView<N> {
    this.boundElements = [];
    this.boundTextNodes = [];
    this.fragments = [];
    this.nativeShadowRoots = [];
    this._createFragments(fragmentCmds, null, inplaceElement);
    
    return new RenderView(this.fragments, flattenArr(this.boundElements), flattenArr(this.boundTextNodes), this.nativeShadowRoots);    
  }
	
	private _createFragments(fragmentCmds:RenderTemplateCmd[], parentComponent:Component<N>, inplaceElement:N) {
    var parent:N | Component<N> = null; // can be a ShadowRoot as well...
    var fragmentRootNodes = [];
    if (isBlank(parentComponent) || this.fragments.length === 0) {
      this.fragments.push(fragmentRootNodes);      
    }
    if (isPresent(parentComponent)) {
      parent = parentComponent.childrenRoot;      
    }
    var parentStack:List<N | Component<N>> = [];
    var boundElements = [];
    var boundTextNodes = [];
    this.boundElements.push(boundElements);
    this.boundTextNodes.push(boundTextNodes);
    for (var cmdIdx=0; cmdIdx<fragmentCmds.length; cmdIdx++) {
      var cmd = fragmentCmds[cmdIdx];
      switch (cmd.type) {
        case RenderTemplateCmdType.BEGIN_COMPONENT:
        case RenderTemplateCmdType.BEGIN_BASIC_ELEMENT: {
          var bec = <RenderBeginElementCmd> cmd;
          var el:N;
          if (isPresent(inplaceElement)) {
            el = inplaceElement;
            inplaceElement = null;
            this.mergeElement(el, bec.attrs);
            fragmentRootNodes.push(el);
          } else {
            el = this.createElement(bec.name, bec.attrs);
            this._addChild(parent, fragmentRootNodes, el, bec.ngContentIndex);
          }
          if (bec.isBound) {
            boundElements.push(el);
          }
          parentStack.push(parent);
          if (cmd.type === RenderTemplateCmdType.BEGIN_COMPONENT) {
            var root = el;
            var bc = <RenderBeginComponentCmd>cmd;
            if (bc.nativeShadow) {
              root = this.createShadowRoot(el);
              this.nativeShadowRoots.push(root);
            }
            parent = new Component(root, this._componentTemplateResolver.resolveComponentTemplate(bc.templateId));
          } else {
            parent = el;              
          }
          // TODO: events!
          break;
        }
        case RenderTemplateCmdType.END_COMPONENT: {
          var c = <Component<N>> parent;
          this._createFragments(c.shadowTemplate, c, null);
          parent = parentStack.pop();
          break;
        }
        case RenderTemplateCmdType.END_BASIC_ELEMENT: {
          parent = parentStack.pop();
          break;
        } 
        case RenderTemplateCmdType.EMBEDDED_TEMPLATE: {
          var etc = <RenderEmbeddedTemplateCmd> cmd;
          var el = this.createTemplateAnchor(etc.attrs);
          this._addChild(parent, fragmentRootNodes, el, etc.ngContentIndex);
          boundElements.push(el);
          if (etc.isMerged) {
            this._createFragments(etc.content, null, null);            
          }
          break;
        }
        case RenderTemplateCmdType.NG_CONTENT: {
          var nct = <RenderNgContentCmd> cmd;
          var projectedNodes = parentComponent.project(nct.index);          
          for (var i=0; i<projectedNodes.length; i++) {
            var node = projectedNodes[i];
            this._addChild(parent, fragmentRootNodes, node, nct.ngContentIndex); 
          }
        }
        case RenderTemplateCmdType.TEXT: {
          var ttc = <RenderTextCmd> cmd;
          var text = this.createText(ttc.value);
          this._addChild(parent, fragmentRootNodes, text, ttc.ngContentIndex);
          if (ttc.isBound) {
            boundTextNodes.push(text);
          }
          break;
        }
      }
    }
    return fragmentRootNodes;
	}

  private _addChild(parent:N | Component<N>, fragmentRootNodes: N[], node: N, ngContentIndex: number) {
    if (isPresent(parent)) {
      if (isPresent(ngContentIndex)) {
        (<Component<N>>parent).addLightDom(ngContentIndex, node);
      } else {
        this.appendChild(<N> parent, node);
      }
    } else {
      fragmentRootNodes.push(node);
    } 
  }
  
  protected createTemplateAnchor(attrs:string[]):N {
    return abstract();
  }	  
  
  protected createElement(name:string, attrs:string[]):N {
    return abstract();
  }
  
  protected createShadowRoot(host:N):N {
    return abstract();
  }
  
  protected mergeElement(existing:N, attrs:string[]) {
    abstract();
  }
  
  protected createText(value:string): N {
    return abstract();
  }
  
  protected appendChild(parent:N, child:N) {
    abstract();
  }
}


class Component<N> {
  private lightDomNodes:N[][] = [];
  constructor(public childrenRoot:N, public shadowTemplate:RenderTemplateCmd[]) {}
  addLightDom(ngContentIndex:number, node: N) {
    while (this.lightDomNodes.length <= ngContentIndex) {
      this.lightDomNodes.push([]);
    }
    this.lightDomNodes[ngContentIndex].push(node);
  }
  project(ngContentIndex: number):N[] {
    return ngContentIndex < this.lightDomNodes.length ? this.lightDomNodes[ngContentIndex] : []; 
  }
}

function abstract():any {
  throw new BaseException('Abstract method call');
}

function flattenArr(arr:any[][]):any[] {
  var res = [];
  for (var i=0; i<arr.length; i++) {
    var entry = arr[i];
    for (var j=0; j<entry.length; j++) {
      res.push(entry[j]);
    }
  }
  return res;
}
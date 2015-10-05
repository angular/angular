import {isBlank, isPresent} from 'angular2/src/core/facade/lang';
import {
  RenderEventDispatcher,
  RenderTemplateCmd,
  RenderCommandVisitor,
  RenderBeginElementCmd,
  RenderBeginComponentCmd,
  RenderNgContentCmd,
  RenderTextCmd,
  RenderEmbeddedTemplateCmd
} from './api';
import {DefaultRenderView, DefaultRenderFragmentRef} from './view';

export function createRenderView(fragmentCmds: RenderTemplateCmd[], inplaceElement: any,
                                 nodeFactory: NodeFactory<any>): DefaultRenderView<any> {
  var builders: RenderViewBuilder<any>[] = [];
  visitAll(new RenderViewBuilder<any>(null, null, inplaceElement, builders, nodeFactory),
           fragmentCmds);
  var boundElements: any[] = [];
  var boundTextNodes: any[] = [];
  var nativeShadowRoots: any[] = [];
  var fragments: DefaultRenderFragmentRef<any>[] = [];
  var viewElementOffset = 0;
  var view: DefaultRenderView<any>;
  var eventDispatcher = (boundElementIndex: number, eventName: string, event: any) =>
      view.dispatchRenderEvent(boundElementIndex, eventName, event);
  var globalEventAdders: Function[] = [];

  for (var i = 0; i < builders.length; i++) {
    var builder = builders[i];
    addAll(builder.boundElements, boundElements);
    addAll(builder.boundTextNodes, boundTextNodes);
    addAll(builder.nativeShadowRoots, nativeShadowRoots);
    if (isBlank(builder.rootNodesParent)) {
      fragments.push(new DefaultRenderFragmentRef<any>(builder.fragmentRootNodes));
    }
    for (var j = 0; j < builder.eventData.length; j++) {
      var eventData = builder.eventData[j];
      var boundElementIndex = eventData[0] + viewElementOffset;
      var target = eventData[1];
      var eventName = eventData[2];
      if (isPresent(target)) {
        var handler =
            createEventHandler(boundElementIndex, `${target}:${eventName}`, eventDispatcher);
        globalEventAdders.push(createGlobalEventAdder(target, eventName, handler, nodeFactory));
      } else {
        var handler = createEventHandler(boundElementIndex, eventName, eventDispatcher);
        nodeFactory.on(boundElements[boundElementIndex], eventName, handler);
      }
    }
    viewElementOffset += builder.boundElements.length;
  }
  view = new DefaultRenderView<any>(fragments, boundTextNodes, boundElements, nativeShadowRoots,
                                    globalEventAdders);
  return view;
}

function createEventHandler(boundElementIndex: number, eventName: string,
                            eventDispatcher: Function): Function {
  return ($event) => eventDispatcher(boundElementIndex, eventName, $event);
}

function createGlobalEventAdder(target: string, eventName: string, eventHandler: Function,
                                nodeFactory: NodeFactory<any>): Function {
  return () => nodeFactory.globalOn(target, eventName, eventHandler);
}

export interface NodeFactory<N> {
  resolveComponentTemplate(templateId: number): RenderTemplateCmd[];
  createTemplateAnchor(attrNameAndValues: string[]): N;
  createElement(name: string, attrNameAndValues: string[]): N;
  mergeElement(existing: N, attrNameAndValues: string[]);
  createShadowRoot(host: N, templateId: number): N;
  createText(value: string): N;
  appendChild(parent: N, child: N);
  on(element: N, eventName: string, callback: Function);
  globalOn(target: string, eventName: string, callback: Function): Function;
}

class RenderViewBuilder<N> implements RenderCommandVisitor {
  parentStack: Array<N | Component<N>>;
  boundTextNodes: N[] = [];
  boundElements: N[] = [];
  eventData: any[][] = [];

  fragmentRootNodes: N[] = [];
  nativeShadowRoots: N[] = [];

  constructor(public parentComponent: Component<N>, public rootNodesParent: N,
              public inplaceElement: N, public allBuilders: RenderViewBuilder<N>[],
              public factory: NodeFactory<N>) {
    this.parentStack = [rootNodesParent];
    allBuilders.push(this);
  }

  get parent(): N | Component<N> { return this.parentStack[this.parentStack.length - 1]; }

  visitText(cmd: RenderTextCmd, context: any): any {
    var text = this.factory.createText(cmd.value);
    this._addChild(text, cmd.ngContentIndex);
    if (cmd.isBound) {
      this.boundTextNodes.push(text);
    }
    return null;
  }
  visitNgContent(cmd: RenderNgContentCmd, context: any): any {
    if (isPresent(this.parentComponent)) {
      var projectedNodes = this.parentComponent.project();
      for (var i = 0; i < projectedNodes.length; i++) {
        var node = projectedNodes[i];
        this._addChild(node, cmd.ngContentIndex);
      }
    }
    return null;
  }
  visitBeginElement(cmd: RenderBeginElementCmd, context: any): any {
    this.parentStack.push(this._beginElement(cmd));
    return null;
  }
  visitEndElement(context: any): any {
    this._endElement();
    return null;
  }
  visitBeginComponent(cmd: RenderBeginComponentCmd, context: any): any {
    var el = this._beginElement(cmd);
    var root = el;
    if (cmd.nativeShadow) {
      root = this.factory.createShadowRoot(el, cmd.templateId);
      this.nativeShadowRoots.push(root);
    }
    this.parentStack.push(new Component(el, root, cmd, this.factory));
    return null;
  }
  visitEndComponent(context: any): any {
    var c = <Component<N>>this.parent;
    var template = this.factory.resolveComponentTemplate(c.cmd.templateId);
    this._visitChildTemplate(template, c, c.shadowRoot);
    this._endElement();
    return null;
  }
  visitEmbeddedTemplate(cmd: RenderEmbeddedTemplateCmd, context: any): any {
    var el = this.factory.createTemplateAnchor(cmd.attrNameAndValues);
    this._addChild(el, cmd.ngContentIndex);
    this.boundElements.push(el);
    if (cmd.isMerged) {
      this._visitChildTemplate(cmd.children, this.parentComponent, null);
    }
    return null;
  }

  private _beginElement(cmd: RenderBeginElementCmd): N {
    var el: N;
    if (isPresent(this.inplaceElement)) {
      el = this.inplaceElement;
      this.inplaceElement = null;
      this.factory.mergeElement(el, cmd.attrNameAndValues);
      this.fragmentRootNodes.push(el);
    } else {
      el = this.factory.createElement(cmd.name, cmd.attrNameAndValues);
      this._addChild(el, cmd.ngContentIndex);
    }
    if (cmd.isBound) {
      this.boundElements.push(el);
      for (var i = 0; i < cmd.eventTargetAndNames.length; i += 2) {
        var target = cmd.eventTargetAndNames[i];
        var eventName = cmd.eventTargetAndNames[i + 1];
        this.eventData.push([this.boundElements.length - 1, target, eventName]);
      }
    }
    return el;
  }

  private _endElement() { this.parentStack.pop(); }

  private _visitChildTemplate(cmds: RenderTemplateCmd[], parent: Component<N>, rootNodesParent: N) {
    visitAll(new RenderViewBuilder(parent, rootNodesParent, null, this.allBuilders, this.factory),
             cmds);
  }

  private _addChild(node: N, ngContentIndex: number) {
    var parent = this.parent;
    if (isPresent(parent)) {
      if (parent instanceof Component) {
        parent.addContentNode(ngContentIndex, node);
      } else {
        this.factory.appendChild(<N>parent, node);
      }
    } else {
      this.fragmentRootNodes.push(node);
    }
  }
}

class Component<N> {
  private contentNodesByNgContentIndex: N[][] = [];
  private projectingNgContentIndex: number = 0;

  constructor(public hostElement: N, public shadowRoot: N, public cmd: RenderBeginComponentCmd,
              public factory: NodeFactory<N>) {}
  addContentNode(ngContentIndex: number, node: N) {
    if (isBlank(ngContentIndex)) {
      if (this.cmd.nativeShadow) {
        this.factory.appendChild(this.hostElement, node);
      }
    } else {
      while (this.contentNodesByNgContentIndex.length <= ngContentIndex) {
        this.contentNodesByNgContentIndex.push([]);
      }
      this.contentNodesByNgContentIndex[ngContentIndex].push(node);
    }
  }
  project(): N[] {
    var ngContentIndex = this.projectingNgContentIndex++;
    return ngContentIndex < this.contentNodesByNgContentIndex.length ?
               this.contentNodesByNgContentIndex[ngContentIndex] :
               [];
  }
}

function addAll(source: any[], target: any[]) {
  for (var i = 0; i < source.length; i++) {
    target.push(source[i]);
  }
}

function visitAll(visitor: RenderCommandVisitor, fragmentCmds: RenderTemplateCmd[]) {
  for (var i = 0; i < fragmentCmds.length; i++) {
    fragmentCmds[i].visit(visitor, null);
  }
}
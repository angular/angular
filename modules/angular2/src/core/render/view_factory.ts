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
  var view: DefaultRenderView<any>;
  var eventDispatcher = (boundElementIndex: number, eventName: string, event: any) =>
      view.dispatchRenderEvent(boundElementIndex, eventName, event);
  var context = new BuildContext(eventDispatcher, nodeFactory, inplaceElement);
  context.build(fragmentCmds);
  var fragments: DefaultRenderFragmentRef<any>[] = [];
  for (var i = 0; i < context.fragments.length; i++) {
    fragments.push(new DefaultRenderFragmentRef(context.fragments[i]));
  }
  view = new DefaultRenderView<any>(fragments, context.boundTextNodes, context.boundElements,
                                    context.nativeShadowRoots, context.globalEventAdders,
                                    context.rootContentInsertionPoints);
  return view;
}

export interface NodeFactory<N> {
  resolveComponentTemplate(templateId: number): RenderTemplateCmd[];
  createTemplateAnchor(attrNameAndValues: string[]): N;
  createElement(name: string, attrNameAndValues: string[]): N;
  createRootContentInsertionPoint(): N;
  mergeElement(existing: N, attrNameAndValues: string[]);
  createShadowRoot(host: N, templateId: number): N;
  createText(value: string): N;
  appendChild(parent: N, child: N);
  on(element: N, eventName: string, callback: Function);
  globalOn(target: string, eventName: string, callback: Function): Function;
}

class BuildContext<N> {
  constructor(private _eventDispatcher: Function, public factory: NodeFactory<N>,
              private _inplaceElement: N) {
    this.isHost = isPresent((_inplaceElement));
  }
  private _builders: RenderViewBuilder<N>[] = [];

  globalEventAdders: Function[] = [];
  boundElements: N[] = [];
  boundTextNodes: N[] = [];
  nativeShadowRoots: N[] = [];
  fragments: N[][] = [];
  rootContentInsertionPoints: N[] = [];
  componentCount: number = 0;
  isHost: boolean;

  build(fragmentCmds: RenderTemplateCmd[]) {
    this.enqueueFragmentBuilder(null, fragmentCmds);
    this._build(this._builders[0]);
  }

  private _build(builder: RenderViewBuilder<N>) {
    this._builders = [];
    builder.build(this);
    var enqueuedBuilders = this._builders;
    for (var i = 0; i < enqueuedBuilders.length; i++) {
      this._build(enqueuedBuilders[i]);
    }
  }

  enqueueComponentBuilder(component: Component<N>) {
    this.componentCount++;
    this._builders.push(new RenderViewBuilder<N>(
        component, null, this.factory.resolveComponentTemplate(component.cmd.templateId)));
  }

  enqueueFragmentBuilder(parentComponent: Component<N>, commands: RenderTemplateCmd[]) {
    var rootNodes = [];
    this.fragments.push(rootNodes);
    this._builders.push(new RenderViewBuilder<N>(parentComponent, rootNodes, commands));
  }

  consumeInplaceElement(): N {
    var result = this._inplaceElement;
    this._inplaceElement = null;
    return result;
  }

  addEventListener(boundElementIndex: number, target: string, eventName: string) {
    if (isPresent(target)) {
      var handler =
          createEventHandler(boundElementIndex, `${target}:${eventName}`, this._eventDispatcher);
      this.globalEventAdders.push(createGlobalEventAdder(target, eventName, handler, this.factory));
    } else {
      var handler = createEventHandler(boundElementIndex, eventName, this._eventDispatcher);
      this.factory.on(this.boundElements[boundElementIndex], eventName, handler);
    }
  }
}


function createEventHandler(boundElementIndex: number, eventName: string,
                            eventDispatcher: Function): Function {
  return ($event) => eventDispatcher(boundElementIndex, eventName, $event);
}

function createGlobalEventAdder(target: string, eventName: string, eventHandler: Function,
                                nodeFactory: NodeFactory<any>): Function {
  return () => nodeFactory.globalOn(target, eventName, eventHandler);
}

class RenderViewBuilder<N> implements RenderCommandVisitor {
  parentStack: Array<N | Component<N>>;

  constructor(public parentComponent: Component<N>, public fragmentRootNodes: N[],
              public commands: RenderTemplateCmd[]) {
    var rootNodesParent = isPresent(fragmentRootNodes) ? null : parentComponent.shadowRoot;
    this.parentStack = [rootNodesParent];
  }

  build(context: BuildContext<N>) {
    for (var i = 0; i < this.commands.length; i++) {
      this.commands[i].visit(this, context);
    }
  }

  get parent(): N | Component<N> { return this.parentStack[this.parentStack.length - 1]; }

  visitText(cmd: RenderTextCmd, context: BuildContext<N>): any {
    var text = context.factory.createText(cmd.value);
    this._addChild(text, cmd.ngContentIndex, context);
    if (cmd.isBound) {
      context.boundTextNodes.push(text);
    }
    return null;
  }
  visitNgContent(cmd: RenderNgContentCmd, context: BuildContext<N>): any {
    if (isPresent(this.parentComponent)) {
      if (this.parentComponent.isRoot) {
        var insertionPoint = context.factory.createRootContentInsertionPoint();
        if (this.parent instanceof Component) {
          context.factory.appendChild((<Component<N>>this.parent).shadowRoot, insertionPoint);
        } else {
          context.factory.appendChild(<N>this.parent, insertionPoint);
        }
        context.rootContentInsertionPoints.push(insertionPoint);
      } else {
        var projectedNodes = this.parentComponent.project(cmd.index);
        for (var i = 0; i < projectedNodes.length; i++) {
          var node = projectedNodes[i];
          this._addChild(node, cmd.ngContentIndex, context);
        }
      }
    }
    return null;
  }
  visitBeginElement(cmd: RenderBeginElementCmd, context: BuildContext<N>): any {
    this.parentStack.push(this._beginElement(cmd, context));
    return null;
  }
  visitEndElement(context: BuildContext<N>): any {
    this._endElement();
    return null;
  }
  visitBeginComponent(cmd: RenderBeginComponentCmd, context: BuildContext<N>): any {
    var el = this._beginElement(cmd, context);
    var root = el;
    if (cmd.nativeShadow) {
      root = context.factory.createShadowRoot(el, cmd.templateId);
      context.nativeShadowRoots.push(root);
    }
    var isRoot = context.componentCount === 0 && context.isHost;
    var component = new Component(el, root, cmd, isRoot);
    context.enqueueComponentBuilder(component);
    this.parentStack.push(component);
    return null;
  }
  visitEndComponent(context: BuildContext<N>): any {
    this._endElement();
    return null;
  }
  visitEmbeddedTemplate(cmd: RenderEmbeddedTemplateCmd, context: BuildContext<N>): any {
    var el = context.factory.createTemplateAnchor(cmd.attrNameAndValues);
    this._addChild(el, cmd.ngContentIndex, context);
    context.boundElements.push(el);
    if (cmd.isMerged) {
      context.enqueueFragmentBuilder(this.parentComponent, cmd.children);
    }
    return null;
  }

  private _beginElement(cmd: RenderBeginElementCmd, context: BuildContext<N>): N {
    var el: N = context.consumeInplaceElement();
    if (isPresent(el)) {
      context.factory.mergeElement(el, cmd.attrNameAndValues);
      this.fragmentRootNodes.push(el);
    } else {
      el = context.factory.createElement(cmd.name, cmd.attrNameAndValues);
      this._addChild(el, cmd.ngContentIndex, context);
    }
    if (cmd.isBound) {
      var boundElementIndex = context.boundElements.length;
      context.boundElements.push(el);
      for (var i = 0; i < cmd.eventTargetAndNames.length; i += 2) {
        var target = cmd.eventTargetAndNames[i];
        var eventName = cmd.eventTargetAndNames[i + 1];
        context.addEventListener(boundElementIndex, target, eventName);
      }
    }
    return el;
  }

  private _endElement() { this.parentStack.pop(); }

  private _addChild(node: N, ngContentIndex: number, context: BuildContext<N>) {
    var parent = this.parent;
    if (isPresent(parent)) {
      if (parent instanceof Component) {
        parent.addContentNode(ngContentIndex, node, context);
      } else {
        context.factory.appendChild(<N>parent, node);
      }
    } else {
      this.fragmentRootNodes.push(node);
    }
  }
}

class Component<N> {
  private contentNodesByNgContentIndex: N[][] = [];

  constructor(public hostElement: N, public shadowRoot: N, public cmd: RenderBeginComponentCmd,
              public isRoot: boolean) {}
  addContentNode(ngContentIndex: number, node: N, context: BuildContext<N>) {
    if (isBlank(ngContentIndex)) {
      if (this.cmd.nativeShadow) {
        context.factory.appendChild(this.hostElement, node);
      }
    } else {
      while (this.contentNodesByNgContentIndex.length <= ngContentIndex) {
        this.contentNodesByNgContentIndex.push([]);
      }
      this.contentNodesByNgContentIndex[ngContentIndex].push(node);
    }
  }
  project(ngContentIndex: number): N[] {
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

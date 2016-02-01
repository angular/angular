import {
  ListWrapper,
  MapWrapper,
  Map,
  StringMapWrapper,
} from 'angular2/src/facade/collection';
import {
  ChangeDetector,
  ChangeDispatcher,
  DirectiveIndex,
  BindingTarget,
  Locals,
  ProtoChangeDetector,
  ChangeDetectorRef
} from 'angular2/src/core/change_detection/change_detection';
import {ResolvedProvider, Injectable, Injector} from 'angular2/src/core/di';
import {DebugContext} from 'angular2/src/core/change_detection/interfaces';

import {AppProtoElement, AppElement, DirectiveProvider} from './element';
import {
  isPresent,
  isBlank,
  Type,
  isArray,
  isNumber,
  CONST,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {Renderer, RootRenderer, RenderDebugInfo} from 'angular2/src/core/render/api';
import {ViewRef_, HostViewFactoryRef} from './view_ref';
import {ProtoPipes} from 'angular2/src/core/pipes/pipes';
import {camelCaseToDashCase} from 'angular2/src/core/render/util';

export {DebugContext} from 'angular2/src/core/change_detection/interfaces';
import {Pipes} from 'angular2/src/core/pipes/pipes';
import {AppViewManager_, AppViewManager} from './view_manager';
import {ResolvedMetadataCache} from './resolved_metadata_cache';
import {ViewType} from './view_type';

const REFLECT_PREFIX: string = 'ng-reflect-';

const EMPTY_CONTEXT = CONST_EXPR(new Object());

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView implements ChangeDispatcher {
  ref: ViewRef_;
  rootNodesOrAppElements: any[];
  allNodes: any[];
  disposables: Function[];
  appElements: AppElement[];

  /**
   * The context against which data-binding expressions in this view are evaluated against.
   * This is always a component instance.
   */
  context: any = null;

  /**
   * Variables, local to this view, that can be used in binding expressions (in addition to the
   * context). This is used for thing like `<video #player>` or
   * `<li template="for #item of items">`, where "player" and "item" are locals, respectively.
   */
  locals: Locals;

  pipes: Pipes;

  parentInjector: Injector;

  /**
   * Whether root injectors of this view
   * have a hostBoundary.
   */
  hostInjectorBoundary: boolean;

  destroyed: boolean = false;

  constructor(public proto: AppProtoView, public renderer: Renderer,
              public viewManager: AppViewManager_, public projectableNodes: Array<any | any[]>,
              public containerAppElement: AppElement,
              imperativelyCreatedProviders: ResolvedProvider[], rootInjector: Injector,
              public changeDetector: ChangeDetector) {
    this.ref = new ViewRef_(this);
    var injectorWithHostBoundary = AppElement.getViewParentInjector(
        this.proto.type, containerAppElement, imperativelyCreatedProviders, rootInjector);
    this.parentInjector = injectorWithHostBoundary.injector;
    this.hostInjectorBoundary = injectorWithHostBoundary.hostInjectorBoundary;
    var pipes;
    var context;
    switch (proto.type) {
      case ViewType.COMPONENT:
        pipes = new Pipes(proto.protoPipes, containerAppElement.getInjector());
        context = containerAppElement.getComponent();
        break;
      case ViewType.EMBEDDED:
        pipes = containerAppElement.parentView.pipes;
        context = containerAppElement.parentView.context;
        break;
      case ViewType.HOST:
        pipes = null;
        context = EMPTY_CONTEXT;
        break;
    }
    this.pipes = pipes;
    this.context = context;
  }

  init(rootNodesOrAppElements: any[], allNodes: any[], disposables: Function[],
       appElements: AppElement[]) {
    this.rootNodesOrAppElements = rootNodesOrAppElements;
    this.allNodes = allNodes;
    this.disposables = disposables;
    this.appElements = appElements;
    var localsMap = new Map<string, any>();
    StringMapWrapper.forEach(this.proto.templateVariableBindings,
                             (templateName, _) => { localsMap.set(templateName, null); });
    for (var i = 0; i < appElements.length; i++) {
      var appEl = appElements[i];
      var providerTokens = [];
      if (isPresent(appEl.proto.protoInjector)) {
        for (var j = 0; j < appEl.proto.protoInjector.numberOfProviders; j++) {
          providerTokens.push(appEl.proto.protoInjector.getProviderAtIndex(j).key.token);
        }
      }
      StringMapWrapper.forEach(appEl.proto.directiveVariableBindings, (directiveIndex, name) => {
        if (isBlank(directiveIndex)) {
          localsMap.set(name, appEl.nativeElement);
        } else {
          localsMap.set(name, appEl.getDirectiveAtIndex(directiveIndex));
        }
      });
      this.renderer.setElementDebugInfo(
          appEl.nativeElement, new RenderDebugInfo(appEl.getInjector(), appEl.getComponent(),
                                                   providerTokens, localsMap));
    }
    var parentLocals = null;
    if (this.proto.type !== ViewType.COMPONENT) {
      parentLocals =
          isPresent(this.containerAppElement) ? this.containerAppElement.parentView.locals : null;
    }
    if (this.proto.type === ViewType.COMPONENT) {
      // Note: the render nodes have been attached to their host element
      // in the ViewFactory already.
      this.containerAppElement.attachComponentView(this);
      this.containerAppElement.parentView.changeDetector.addViewChild(this.changeDetector);
    }
    this.locals = new Locals(parentLocals, localsMap);
    this.changeDetector.hydrate(this.context, this.locals, this, this.pipes);
    this.viewManager.onViewCreated(this);
  }

  destroy() {
    if (this.destroyed) {
      throw new BaseException('This view has already been destroyed!');
    }
    this.changeDetector.destroyRecursive();
  }

  notifyOnDestroy() {
    this.destroyed = true;
    var hostElement =
        this.proto.type === ViewType.COMPONENT ? this.containerAppElement.nativeElement : null;
    this.renderer.destroyView(hostElement, this.allNodes);
    for (var i = 0; i < this.disposables.length; i++) {
      this.disposables[i]();
    }
    this.viewManager.onViewDestroyed(this);
  }

  get changeDetectorRef(): ChangeDetectorRef { return this.changeDetector.ref; }

  get flatRootNodes(): any[] { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }

  hasLocal(contextName: string): boolean {
    return StringMapWrapper.contains(this.proto.templateVariableBindings, contextName);
  }

  setLocal(contextName: string, value: any): void {
    if (!this.hasLocal(contextName)) {
      return;
    }
    var templateName = this.proto.templateVariableBindings[contextName];
    this.locals.set(templateName, value);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b: BindingTarget, currentValue: any): void {
    if (b.isTextNode()) {
      this.renderer.setText(this.allNodes[b.elementIndex], currentValue);
    } else {
      var nativeElement = this.appElements[b.elementIndex].nativeElement;
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(nativeElement, b.name, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(nativeElement, b.name,
                                          isPresent(currentValue) ? `${currentValue}` : null);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(nativeElement, b.name, currentValue);
      } else if (b.isElementStyle()) {
        var unit = isPresent(b.unit) ? b.unit : '';
        this.renderer.setElementStyle(nativeElement, b.name,
                                      isPresent(currentValue) ? `${currentValue}${unit}` : null);
      } else {
        throw new BaseException('Unsupported directive record');
      }
    }
  }

  logBindingUpdate(b: BindingTarget, value: any): void {
    if (b.isDirective() || b.isElementProperty()) {
      var nativeElement = this.appElements[b.elementIndex].nativeElement;
      this.renderer.setBindingDebugInfo(
          nativeElement, `${REFLECT_PREFIX}${camelCaseToDashCase(b.name)}`, `${value}`);
    }
  }

  notifyAfterContentChecked(): void {
    var count = this.appElements.length;
    for (var i = count - 1; i >= 0; i--) {
      this.appElements[i].ngAfterContentChecked();
    }
  }

  notifyAfterViewChecked(): void {
    var count = this.appElements.length;
    for (var i = count - 1; i >= 0; i--) {
      this.appElements[i].ngAfterViewChecked();
    }
  }

  getDebugContext(appElement: AppElement, elementIndex: number,
                  directiveIndex: number): DebugContext {
    try {
      if (isBlank(appElement) && elementIndex < this.appElements.length) {
        appElement = this.appElements[elementIndex];
      }
      var container = this.containerAppElement;

      var element = isPresent(appElement) ? appElement.nativeElement : null;
      var componentElement = isPresent(container) ? container.nativeElement : null;
      var directive =
          isPresent(directiveIndex) ? appElement.getDirectiveAtIndex(directiveIndex) : null;
      var injector = isPresent(appElement) ? appElement.getInjector() : null;

      return new DebugContext(element, componentElement, directive, this.context,
                              _localsToStringMap(this.locals), injector);

    } catch (e) {
      // TODO: vsavkin log the exception once we have a good way to log errors and warnings
      // if an error happens during getting the debug context, we return null.
      return null;
    }
  }

  getDirectiveFor(directive: DirectiveIndex): any {
    return this.appElements[directive.elementIndex].getDirectiveAtIndex(directive.directiveIndex);
  }

  getDetectorFor(directive: DirectiveIndex): ChangeDetector {
    var componentView = this.appElements[directive.elementIndex].componentView;
    return isPresent(componentView) ? componentView.changeDetector : null;
  }

  /**
   * Triggers the event handlers for the element and the directives.
   *
   * This method is intended to be called from directive EventEmitters.
   *
   * @param {string} eventName
   * @param {*} eventObj
   * @param {number} boundElementIndex
   * @return false if preventDefault must be applied to the DOM event
   */
  triggerEventHandlers(eventName: string, eventObj: Event, boundElementIndex: number): boolean {
    return this.changeDetector.handleEvent(eventName, boundElementIndex, eventObj);
  }
}

function _localsToStringMap(locals: Locals): {[key: string]: any} {
  var res = {};
  var c = locals;
  while (isPresent(c)) {
    res = StringMapWrapper.merge(res, MapWrapper.toStringMap(c.current));
    c = c.parent;
  }
  return res;
}

/**
 *
 */
export class AppProtoView {
  static create(metadataCache: ResolvedMetadataCache, type: ViewType, pipes: Type[],
                templateVariableBindings: {[key: string]: string}): AppProtoView {
    var protoPipes = null;
    if (isPresent(pipes) && pipes.length > 0) {
      var boundPipes = ListWrapper.createFixedSize(pipes.length);
      for (var i = 0; i < pipes.length; i++) {
        boundPipes[i] = metadataCache.getResolvedPipeMetadata(pipes[i]);
      }
      protoPipes = ProtoPipes.fromProviders(boundPipes);
    }
    return new AppProtoView(type, protoPipes, templateVariableBindings);
  }

  constructor(public type: ViewType, public protoPipes: ProtoPipes,
              public templateVariableBindings: {[key: string]: string}) {}
}


@CONST()
export class HostViewFactory {
  constructor(public selector: string, public viewFactory: Function) {}
}

export function flattenNestedViewRenderNodes(nodes: any[]): any[] {
  return _flattenNestedViewRenderNodes(nodes, []);
}

function _flattenNestedViewRenderNodes(nodes: any[], renderNodes: any[]): any[] {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node instanceof AppElement) {
      var appEl = <AppElement>node;
      renderNodes.push(appEl.nativeElement);
      if (isPresent(appEl.nestedViews)) {
        for (var k = 0; k < appEl.nestedViews.length; k++) {
          _flattenNestedViewRenderNodes(appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
        }
      }
    } else {
      renderNodes.push(node);
    }
  }
  return renderNodes;
}

export function checkSlotCount(componentName: string, expectedSlotCount: number,
                               projectableNodes: any[][]): void {
  var givenSlotCount = isPresent(projectableNodes) ? projectableNodes.length : 0;
  if (givenSlotCount < expectedSlotCount) {
    throw new BaseException(
        `The component ${componentName} has ${expectedSlotCount} <ng-content> elements,` +
        ` but only ${givenSlotCount} slots were provided.`);
  }
}

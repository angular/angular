import {
  ListWrapper,
  MapWrapper,
  Map,
  StringMapWrapper,
  StringMap
} from 'angular2/src/core/facade/collection';
import {
  AST,
  ChangeDetector,
  ChangeDetectorRef,
  ChangeDispatcher,
  DirectiveIndex,
  DirectiveRecord,
  BindingTarget,
  Locals,
  ProtoChangeDetector
} from 'angular2/src/core/change_detection/change_detection';
import {DebugContext} from 'angular2/src/core/change_detection/interfaces';

import {
  ProtoElementInjector,
  ElementInjector,
  PreBuiltObjects,
  DirectiveBinding
} from './element_injector';
import {ElementBinder} from './element_binder';
import {isPresent, isBlank, BaseException} from 'angular2/src/core/facade/lang';
import * as renderApi from 'angular2/src/core/render/api';
import {RenderEventDispatcher} from 'angular2/src/core/render/api';
import {ViewRef, ProtoViewRef, internalView} from './view_ref';
import {ElementRef} from './element_ref';
import {ProtoPipes} from 'angular2/src/core/pipes/pipes';
import {camelCaseToDashCase} from 'angular2/src/core/render/dom/util';

export {DebugContext} from 'angular2/src/core/change_detection/interfaces';

const REFLECT_PREFIX: string = 'ng-reflect-';

export class AppProtoViewMergeMapping {
  renderProtoViewRef: renderApi.RenderProtoViewRef;
  renderFragmentCount: number;
  renderElementIndices: number[];
  renderInverseElementIndices: number[];
  renderTextIndices: number[];
  nestedViewIndicesByElementIndex: number[];
  hostElementIndicesByViewIndex: number[];
  nestedViewCountByViewIndex: number[];
  constructor(renderProtoViewMergeMapping: renderApi.RenderProtoViewMergeMapping) {
    this.renderProtoViewRef = renderProtoViewMergeMapping.mergedProtoViewRef;
    this.renderFragmentCount = renderProtoViewMergeMapping.fragmentCount;
    this.renderElementIndices = renderProtoViewMergeMapping.mappedElementIndices;
    this.renderInverseElementIndices = inverseIndexMapping(
        this.renderElementIndices, renderProtoViewMergeMapping.mappedElementCount);
    this.renderTextIndices = renderProtoViewMergeMapping.mappedTextIndices;
    this.hostElementIndicesByViewIndex = renderProtoViewMergeMapping.hostElementIndicesByViewIndex;
    this.nestedViewIndicesByElementIndex =
        inverseIndexMapping(this.hostElementIndicesByViewIndex, this.renderElementIndices.length);
    this.nestedViewCountByViewIndex = renderProtoViewMergeMapping.nestedViewCountByViewIndex;
  }
}

function inverseIndexMapping(input: number[], resultLength: number): number[] {
  var result = ListWrapper.createGrowableSize(resultLength);
  for (var i = 0; i < input.length; i++) {
    var value = input[i];
    if (isPresent(value)) {
      result[input[i]] = i;
    }
  }
  return result;
}

export class AppViewContainer {
  // The order in this list matches the DOM order.
  views: AppView[] = [];
}

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView implements ChangeDispatcher, RenderEventDispatcher {
  // AppViews that have been merged in depth first order.
  // This list is shared between all merged views. Use this.elementOffset to get the local
  // entries.
  views: AppView[] = null;
  // root elementInjectors of this AppView
  // This list is local to this AppView and not shared with other Views.
  rootElementInjectors: ElementInjector[];
  // ElementInjectors of all AppViews in views grouped by view.
  // This list is shared between all merged views. Use this.elementOffset to get the local
  // entries.
  elementInjectors: ElementInjector[] = null;
  // ViewContainers of all AppViews in views grouped by view.
  // This list is shared between all merged views. Use this.elementOffset to get the local
  // entries.
  viewContainers: AppViewContainer[] = null;
  // PreBuiltObjects of all AppViews in views grouped by view.
  // This list is shared between all merged views. Use this.elementOffset to get the local
  // entries.
  preBuiltObjects: PreBuiltObjects[] = null;
  // ElementRef of all AppViews in views grouped by view.
  // This list is shared between all merged views. Use this.elementOffset to get the local
  // entries.
  elementRefs: ElementRef[];

  ref: ViewRef;
  changeDetector: ChangeDetector = null;


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

  constructor(public renderer: renderApi.Renderer, public proto: AppProtoView,
              public mainMergeMapping: AppProtoViewMergeMapping, public viewOffset: number,
              public elementOffset: number, public textOffset: number,
              protoLocals: Map<string, any>, public render: renderApi.RenderViewRef,
              public renderFragment: renderApi.RenderFragmentRef) {
    this.ref = new ViewRef(this);

    this.locals = new Locals(null, MapWrapper.clone(protoLocals));  // TODO optimize this
  }

  init(changeDetector: ChangeDetector, elementInjectors: ElementInjector[],
       rootElementInjectors: ElementInjector[], preBuiltObjects: PreBuiltObjects[],
       views: AppView[], elementRefs: ElementRef[], viewContainers: AppViewContainer[]) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.views = views;
    this.elementRefs = elementRefs;
    this.viewContainers = viewContainers;
  }

  setLocal(contextName: string, value: any): void {
    if (!this.hydrated()) throw new BaseException('Cannot set locals on dehydrated view.');
    if (!this.proto.variableBindings.has(contextName)) {
      return;
    }
    var templateName = this.proto.variableBindings.get(contextName);
    this.locals.set(templateName, value);
  }

  hydrated(): boolean { return isPresent(this.context); }

  /**
   * Triggers the event handlers for the element and the directives.
   *
   * This method is intended to be called from directive EventEmitters.
   *
   * @param {string} eventName
   * @param {*} eventObj
   * @param {number} boundElementIndex
   */
  triggerEventHandlers(eventName: string, eventObj: Event, boundElementIndex: number): void {
    var locals = new Map();
    locals.set('$event', eventObj);
    this.dispatchEvent(boundElementIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b: BindingTarget, currentValue: any): void {
    if (b.isTextNode()) {
      this.renderer.setText(
          this.render, this.mainMergeMapping.renderTextIndices[b.elementIndex + this.textOffset],
          currentValue);
    } else {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(elementRef, b.name, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(elementRef, b.name, `${currentValue}`);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(elementRef, b.name, currentValue);
      } else if (b.isElementStyle()) {
        var unit = isPresent(b.unit) ? b.unit : '';
        this.renderer.setElementStyle(elementRef, b.name, `${currentValue}${unit}`);
      } else {
        throw new BaseException('Unsupported directive record');
      }
    }
  }

  logBindingUpdate(b: BindingTarget, value: any): void {
    if (b.isDirective() || b.isElementProperty()) {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      this.renderer.setElementAttribute(
          elementRef, `${REFLECT_PREFIX}${camelCaseToDashCase(b.name)}`, `${value}`);
    }
  }

  notifyAfterContentChecked(): void {
    var eiCount = this.proto.elementBinders.length;
    var ei = this.elementInjectors;
    for (var i = eiCount - 1; i >= 0; i--) {
      if (isPresent(ei[i + this.elementOffset])) ei[i + this.elementOffset].afterContentChecked();
    }
  }

  notifyAfterViewChecked(): void {
    // required for query
  }

  getDirectiveFor(directive: DirectiveIndex): any {
    var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  getNestedView(boundElementIndex: number): AppView {
    var viewIndex = this.mainMergeMapping.nestedViewIndicesByElementIndex[boundElementIndex];
    return isPresent(viewIndex) ? this.views[viewIndex] : null;
  }

  getHostElement(): ElementRef {
    var boundElementIndex = this.mainMergeMapping.hostElementIndicesByViewIndex[this.viewOffset];
    return isPresent(boundElementIndex) ? this.elementRefs[boundElementIndex] : null;
  }

  getDebugContext(elementIndex: number, directiveIndex: DirectiveIndex): DebugContext {
    try {
      var offsettedIndex = this.elementOffset + elementIndex;
      var hasRefForIndex = offsettedIndex < this.elementRefs.length;

      var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
      var host = this.getHostElement();
      var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;

      var element = isPresent(elementRef) ? elementRef.nativeElement : null;
      var componentElement = isPresent(host) ? host.nativeElement : null;
      var directive = isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
      var injector = isPresent(ei) ? ei.getInjector() : null;

      return new DebugContext(element, componentElement, directive, this.context,
                              _localsToStringMap(this.locals), injector);

    } catch (e) {
      // TODO: vsavkin log the exception once we have a good way to log errors and warnings
      // if an error happens during getting the debug context, we return an empty map.
      return null;
    }
  }

  getDetectorFor(directive: DirectiveIndex): any {
    var childView = this.getNestedView(this.elementOffset + directive.elementIndex);
    return isPresent(childView) ? childView.changeDetector : null;
  }

  invokeElementMethod(elementIndex: number, methodName: string, args: any[]) {
    this.renderer.invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
  }

  // implementation of RenderEventDispatcher#dispatchRenderEvent
  dispatchRenderEvent(renderElementIndex: number, eventName: string,
                      locals: Map<string, any>): boolean {
    var elementRef =
        this.elementRefs[this.mainMergeMapping.renderInverseElementIndices[renderElementIndex]];
    var view = internalView(elementRef.parentView);
    return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
  }


  // returns false if preventDefault must be applied to the DOM event
  dispatchEvent(boundElementIndex: number, eventName: string, locals: Map<string, any>): boolean {
    try {
      if (this.hydrated()) {
        return !this.changeDetector.handleEvent(eventName, boundElementIndex - this.elementOffset,
                                                new Locals(this.locals, locals));
      } else {
        return true;
      }
    } catch (e) {
      var c = this.getDebugContext(boundElementIndex - this.elementOffset, null);
      var context = isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals,
                                                c.injector) :
                                   null;
      throw new EventEvaluationError(eventName, e, e.stack, context);
    }
  }
}

function _localsToStringMap(locals: Locals): StringMap<string, any> {
  var res = {};
  var c = locals;
  while (isPresent(c)) {
    res = StringMapWrapper.merge(res, MapWrapper.toStringMap(c.current));
    c = c.parent;
  }
  return res;
}

/**
 * Error context included when an event handler throws an exception.
 */
class _Context {
  constructor(public element: any, public componentElement: any, public context: any,
              public locals: any, public injector: any) {}
}

/**
 * Wraps an exception thrown by an event handler.
 */
class EventEvaluationError extends BaseException {
  constructor(eventName: string, originalException: any, originalStack: any, context: any) {
    super(`Error during evaluation of "${eventName}"`, originalException, originalStack, context);
  }
}


/**
 *
 */
export class AppProtoView {
  elementBinders: ElementBinder[] = [];
  protoLocals: Map<string, any> = new Map();
  mergeMapping: AppProtoViewMergeMapping;
  ref: ProtoViewRef;

  constructor(public type: renderApi.ViewType, public isEmbeddedFragment: boolean,
              public render: renderApi.RenderProtoViewRef,
              public protoChangeDetector: ProtoChangeDetector,
              public variableBindings: Map<string, string>,
              public variableLocations: Map<string, number>, public textBindingCount: number,
              public pipes: ProtoPipes) {
    this.ref = new ProtoViewRef(this);
    if (isPresent(variableBindings)) {
      MapWrapper.forEach(variableBindings,
                         (templateName, _) => { this.protoLocals.set(templateName, null); });
    }
  }

  bindElement(parent: ElementBinder, distanceToParent: number,
              protoElementInjector: ProtoElementInjector,
              componentDirective: DirectiveBinding = null): ElementBinder {
    var elBinder = new ElementBinder(this.elementBinders.length, parent, distanceToParent,
                                     protoElementInjector, componentDirective);

    this.elementBinders.push(elBinder);
    return elBinder;
  }
}

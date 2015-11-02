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
  ProtoChangeDetector
} from 'angular2/src/core/change_detection/change_detection';
import {DebugContext} from 'angular2/src/core/change_detection/interfaces';

import {
  ProtoElementInjector,
  ElementInjector,
  PreBuiltObjects,
  DirectiveProvider
} from './element_injector';
import {ElementBinder} from './element_binder';
import {isPresent} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import * as renderApi from 'angular2/src/core/render/api';
import {RenderEventDispatcher} from 'angular2/src/core/render/api';
import {ViewRef, ProtoViewRef, internalView} from './view_ref';
import {ElementRef} from './element_ref';
import {ProtoPipes} from 'angular2/src/core/pipes/pipes';
import {camelCaseToDashCase} from 'angular2/src/core/render/dom/util';
import {TemplateCmd} from './template_commands';
import {ViewRef_, ProtoViewRef_} from "./view_ref";

export {DebugContext} from 'angular2/src/core/change_detection/interfaces';

const REFLECT_PREFIX: string = 'ng-reflect-';

export enum ViewType {
  // A view that contains the host element with bound component directive.
  // Contains a COMPONENT view
  HOST,
  // The view of the component
  // Can contain 0 to n EMBEDDED views
  COMPONENT,
  // A view that is embedded into another View via a <template> element
  // inside of a COMPONENT view
  EMBEDDED
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
              public viewOffset: number, public elementOffset: number, public textOffset: number,
              protoLocals: Map<string, any>, public render: renderApi.RenderViewRef,
              public renderFragment: renderApi.RenderFragmentRef,
              public containerElementInjector: ElementInjector) {
    this.ref = new ViewRef_(this);

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
    if (!this.proto.templateVariableBindings.has(contextName)) {
      return;
    }
    var templateName = this.proto.templateVariableBindings.get(contextName);
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
    var locals = new Map<string, any>();
    locals.set('$event', eventObj);
    this.dispatchEvent(boundElementIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b: BindingTarget, currentValue: any): void {
    if (b.isTextNode()) {
      this.renderer.setText(this.render, b.elementIndex + this.textOffset, currentValue);
    } else {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(elementRef, b.name, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(elementRef, b.name,
                                          isPresent(currentValue) ? `${currentValue}` : null);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(elementRef, b.name, currentValue);
      } else if (b.isElementStyle()) {
        var unit = isPresent(b.unit) ? b.unit : '';
        this.renderer.setElementStyle(elementRef, b.name,
                                      isPresent(currentValue) ? `${currentValue}${unit}` : null);
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
    var eiCount = this.proto.elementBinders.length;
    var ei = this.elementInjectors;
    for (var i = eiCount - 1; i >= 0; i--) {
      if (isPresent(ei[i + this.elementOffset])) ei[i + this.elementOffset].afterViewChecked();
    }
  }

  getDirectiveFor(directive: DirectiveIndex): any {
    var elementInjector = this.elementInjectors[this.elementOffset + directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  getNestedView(boundElementIndex: number): AppView {
    var eli = this.elementInjectors[boundElementIndex];
    return isPresent(eli) ? eli.getNestedView() : null;
  }

  getContainerElement(): ElementRef {
    return isPresent(this.containerElementInjector) ?
               this.containerElementInjector.getElementRef() :
               null;
  }

  getDebugContext(elementIndex: number, directiveIndex: DirectiveIndex): DebugContext {
    try {
      var offsettedIndex = this.elementOffset + elementIndex;
      var hasRefForIndex = offsettedIndex < this.elementRefs.length;

      var elementRef = hasRefForIndex ? this.elementRefs[this.elementOffset + elementIndex] : null;
      var container = this.getContainerElement();
      var ei = hasRefForIndex ? this.elementInjectors[this.elementOffset + elementIndex] : null;

      var element = isPresent(elementRef) ? elementRef.nativeElement : null;
      var componentElement = isPresent(container) ? container.nativeElement : null;
      var directive = isPresent(directiveIndex) ? this.getDirectiveFor(directiveIndex) : null;
      var injector = isPresent(ei) ? ei.getInjector() : null;

      return new DebugContext(element, componentElement, directive, this.context,
                              _localsToStringMap(this.locals), injector);

    } catch (e) {
      // TODO: vsavkin log the exception once we have a good way to log errors and warnings
      // if an error happens during getting the debug context, we return null.
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
  dispatchRenderEvent(boundElementIndex: number, eventName: string,
                      locals: Map<string, any>): boolean {
    var elementRef = this.elementRefs[boundElementIndex];
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

  get ownBindersCount(): number { return this.proto.elementBinders.length; }
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
 * Error context included when an event handler throws an exception.
 */
class _Context {
  constructor(public element: any, public componentElement: any, public context: any,
              public locals: any, public injector: any) {}
}

/**
 * Wraps an exception thrown by an event handler.
 */
class EventEvaluationError extends WrappedException {
  constructor(eventName: string, originalException: any, originalStack: any, context: any) {
    super(`Error during evaluation of "${eventName}"`, originalException, originalStack, context);
  }
}

export class AppProtoViewMergeInfo {
  constructor(public embeddedViewCount: number, public elementCount: number,
              public viewCount: number) {}
}

/**
 *
 */
export class AppProtoView {
  ref: ProtoViewRef;
  protoLocals: Map<string, any>;

  elementBinders: ElementBinder[] = null;
  mergeInfo: AppProtoViewMergeInfo = null;
  variableLocations: Map<string, number> = null;
  textBindingCount = null;
  render: renderApi.RenderProtoViewRef = null;

  constructor(public templateId: string, public templateCmds: TemplateCmd[], public type: ViewType,
              public isMergable: boolean, public changeDetectorFactory: Function,
              public templateVariableBindings: Map<string, string>, public pipes: ProtoPipes) {
    this.ref = new ProtoViewRef_(this);
  }

  init(render: renderApi.RenderProtoViewRef, elementBinders: ElementBinder[],
       textBindingCount: number, mergeInfo: AppProtoViewMergeInfo,
       variableLocations: Map<string, number>) {
    this.render = render;
    this.elementBinders = elementBinders;
    this.textBindingCount = textBindingCount;
    this.mergeInfo = mergeInfo;
    this.variableLocations = variableLocations;
    this.protoLocals = new Map<string, any>();
    if (isPresent(this.templateVariableBindings)) {
      this.templateVariableBindings.forEach(
          (templateName, _) => { this.protoLocals.set(templateName, null); });
    }
    if (isPresent(variableLocations)) {
      // The view's locals needs to have a full set of variable names at construction time
      // in order to prevent new variables from being set later in the lifecycle. Since we don't
      // want
      // to actually create variable bindings for the $implicit bindings, add to the
      // protoLocals manually.
      variableLocations.forEach((_, templateName) => { this.protoLocals.set(templateName, null); });
    }
  }

  isInitialized(): boolean { return isPresent(this.elementBinders); }
}

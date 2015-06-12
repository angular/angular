import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';
import {
  AST,
  Locals,
  ChangeDispatcher,
  ProtoChangeDetector,
  ChangeDetector,
  BindingRecord,
  DirectiveRecord,
  DirectiveIndex,
  ChangeDetectorRef
} from 'angular2/change_detection';

import {
  ProtoElementInjector,
  ElementInjector,
  PreBuiltObjects,
  DirectiveBinding
} from './element_injector';
import {ElementBinder} from './element_binder';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import * as renderApi from 'angular2/src/render/api';
import {EventDispatcher} from 'angular2/src/render/api';

export class AppViewContainer {
  // The order in this list matches the DOM order.
  views: List<AppView> = [];
  freeViews: List<AppView> = [];
}

/**
 * Const of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export class AppView implements ChangeDispatcher, EventDispatcher {
  render: renderApi.RenderViewRef = null;
  /// This list matches the _nodes list. It is sparse, since only Elements have ElementInjector
  rootElementInjectors: List<ElementInjector>;
  elementInjectors: List<ElementInjector> = null;
  changeDetector: ChangeDetector = null;
  componentChildViews: List<AppView> = null;
  /// Host views that were added by an imperative view.
  /// This is a dynamically growing / shrinking array.
  freeHostViews: List<AppView> = [];
  viewContainers: List<AppViewContainer>;
  preBuiltObjects: List<PreBuiltObjects> = null;

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
              protoLocals: Map<string, any>) {
    this.viewContainers = ListWrapper.createFixedSize(this.proto.elementBinders.length);
    this.locals = new Locals(null, MapWrapper.clone(protoLocals));  // TODO optimize this
  }

  init(changeDetector: ChangeDetector, elementInjectors: List<ElementInjector>,
       rootElementInjectors: List<ElementInjector>, preBuiltObjects: List<PreBuiltObjects>,
       componentChildViews: List<AppView>) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.componentChildViews = componentChildViews;
  }

  setLocal(contextName: string, value): void {
    if (!this.hydrated()) throw new BaseException('Cannot set locals on dehydrated view.');
    if (!MapWrapper.contains(this.proto.variableBindings, contextName)) {
      return;
    }
    var templateName = MapWrapper.get(this.proto.variableBindings, contextName);
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
   * @param {int} binderIndex
   */
  triggerEventHandlers(eventName: string, eventObj, binderIndex: int): void {
    var locals = MapWrapper.create();
    MapWrapper.set(locals, '$event', eventObj);
    this.dispatchEvent(binderIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  notifyOnBinding(b: BindingRecord, currentValue: any): void {
    if (b.isElement()) {
      this.renderer.setElementProperty(this.render, b.elementIndex, b.propertyName, currentValue);
    } else {
      // we know it refers to _textNodes.
      this.renderer.setText(this.render, b.elementIndex, currentValue);
    }
  }

  notifyOnAllChangesDone(): void {
    var ei = this.elementInjectors;
    for (var i = ei.length - 1; i >= 0; i--) {
      if (isPresent(ei[i])) ei[i].onAllChangesDone();
    }
  }

  getDirectiveFor(directive: DirectiveIndex) {
    var elementInjector = this.elementInjectors[directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  getDetectorFor(directive: DirectiveIndex) {
    var childView = this.componentChildViews[directive.elementIndex];
    return isPresent(childView) ? childView.changeDetector : null;
  }

  callAction(elementIndex: number, actionExpression: string, action: Object) {
    this.renderer.callAction(this.render, elementIndex, actionExpression, action);
  }

  // implementation of EventDispatcher#dispatchEvent
  // returns false if preventDefault must be applied to the DOM event
  dispatchEvent(elementIndex: number, eventName: string, locals: Map<string, any>): boolean {
    // Most of the time the event will be fired only when the view is in the live document.
    // However, in a rare circumstance the view might get dehydrated, in between the event
    // queuing up and firing.
    var allowDefaultBehavior = true;
    if (this.hydrated()) {
      var elBinder = this.proto.elementBinders[elementIndex];
      if (isBlank(elBinder.hostListeners)) return allowDefaultBehavior;
      var eventMap = elBinder.hostListeners[eventName];
      if (isBlank(eventMap)) return allowDefaultBehavior;
      MapWrapper.forEach(eventMap, (expr, directiveIndex) => {
        var context;
        if (directiveIndex === -1) {
          context = this.context;
        } else {
          context = this.elementInjectors[elementIndex].getDirectiveAtIndex(directiveIndex);
        }
        var result = expr.eval(context, new Locals(this.locals, locals));
        if (isPresent(result)) {
          allowDefaultBehavior = allowDefaultBehavior && result == true;
        }
      });
    }
    return allowDefaultBehavior;
  }
}

/**
 *
 */
export class AppProtoView {
  elementBinders: List<ElementBinder> = [];
  protoLocals: Map<string, any> = MapWrapper.create();

  constructor(public render: renderApi.RenderProtoViewRef,
              public protoChangeDetector: ProtoChangeDetector,
              public variableBindings: Map<string, string>) {
    if (isPresent(variableBindings)) {
      MapWrapper.forEach(variableBindings, (templateName, _) => {
        MapWrapper.set(this.protoLocals, templateName, null);
      });
    }
  }

  bindElement(parent: ElementBinder, distanceToParent: int,
              protoElementInjector: ProtoElementInjector,
              directiveVariableBindings: Map<string, number>,
              componentDirective: DirectiveBinding = null): ElementBinder {
    var elBinder =
        new ElementBinder(this.elementBinders.length, parent, distanceToParent,
                          protoElementInjector, directiveVariableBindings, componentDirective);

    ListWrapper.push(this.elementBinders, elBinder);
    return elBinder;
  }

  /**
   * Adds an event binding for the last created ElementBinder via bindElement.
   *
   * If the directive index is a positive integer, the event is evaluated in the context of
   * the given directive.
   *
   * If the directive index is -1, the event is evaluated in the context of the enclosing view.
   *
   * @param {string} eventName
   * @param {AST} expression
   * @param {int} directiveIndex The directive index in the binder or -1 when the event is not bound
   *                             to a directive
   */
  bindEvent(eventBindings: List<renderApi.EventBinding>, boundElementIndex: number,
            directiveIndex: int = -1): void {
    var elBinder = this.elementBinders[boundElementIndex];
    var events = elBinder.hostListeners;
    if (isBlank(events)) {
      events = StringMapWrapper.create();
      elBinder.hostListeners = events;
    }
    for (var i = 0; i < eventBindings.length; i++) {
      var eventBinding = eventBindings[i];
      var eventName = eventBinding.fullName;
      var event = StringMapWrapper.get(events, eventName);
      if (isBlank(event)) {
        event = MapWrapper.create();
        StringMapWrapper.set(events, eventName, event);
      }
      MapWrapper.set(event, directiveIndex, eventBinding.source);
    }
  }
}

library angular2.src.core.linker.view;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, Map, StringMapWrapper;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        ChangeDetector,
        ChangeDispatcher,
        DirectiveIndex,
        BindingTarget,
        Locals,
        ProtoChangeDetector;
import "package:angular2/src/core/change_detection/interfaces.dart"
    show DebugContext;
import "element_injector.dart"
    show
        ProtoElementInjector,
        ElementInjector,
        PreBuiltObjects,
        DirectiveProvider;
import "element_binder.dart" show ElementBinder;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/render/api.dart" as renderApi;
import "package:angular2/src/core/render/api.dart" show RenderEventDispatcher;
import "view_ref.dart" show ViewRef, ProtoViewRef, internalView;
import "element_ref.dart" show ElementRef;
import "package:angular2/src/core/pipes/pipes.dart" show ProtoPipes;
import "package:angular2/src/core/render/util.dart" show camelCaseToDashCase;
import "template_commands.dart" show TemplateCmd;
import "view_ref.dart" show ViewRef_, ProtoViewRef_;
export "package:angular2/src/core/change_detection/interfaces.dart"
    show DebugContext;

const String REFLECT_PREFIX = "ng-reflect-";
enum ViewType {
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

class AppViewContainer {
  // The order in this list matches the DOM order.
  List<AppView> views = [];
}

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
class AppView implements ChangeDispatcher, RenderEventDispatcher {
  renderApi.Renderer renderer;
  AppProtoView proto;
  num viewOffset;
  num elementOffset;
  num textOffset;
  renderApi.RenderViewRef render;
  renderApi.RenderFragmentRef renderFragment;
  ElementInjector containerElementInjector;
  // AppViews that have been merged in depth first order.

  // This list is shared between all merged views. Use this.elementOffset to get the local

  // entries.
  List<AppView> views = null;
  // root elementInjectors of this AppView

  // This list is local to this AppView and not shared with other Views.
  List<ElementInjector> rootElementInjectors;
  // ElementInjectors of all AppViews in views grouped by view.

  // This list is shared between all merged views. Use this.elementOffset to get the local

  // entries.
  List<ElementInjector> elementInjectors = null;
  // ViewContainers of all AppViews in views grouped by view.

  // This list is shared between all merged views. Use this.elementOffset to get the local

  // entries.
  List<AppViewContainer> viewContainers = null;
  // PreBuiltObjects of all AppViews in views grouped by view.

  // This list is shared between all merged views. Use this.elementOffset to get the local

  // entries.
  List<PreBuiltObjects> preBuiltObjects = null;
  // ElementRef of all AppViews in views grouped by view.

  // This list is shared between all merged views. Use this.elementOffset to get the local

  // entries.
  List<ElementRef> elementRefs;
  ViewRef ref;
  ChangeDetector changeDetector = null;
  /**
   * The context against which data-binding expressions in this view are evaluated against.
   * This is always a component instance.
   */
  dynamic context = null;
  /**
   * Variables, local to this view, that can be used in binding expressions (in addition to the
   * context). This is used for thing like `<video #player>` or
   * `<li template="for #item of items">`, where "player" and "item" are locals, respectively.
   */
  Locals locals;
  AppView(
      this.renderer,
      this.proto,
      this.viewOffset,
      this.elementOffset,
      this.textOffset,
      Map<String, dynamic> protoLocals,
      this.render,
      this.renderFragment,
      this.containerElementInjector) {
    this.ref = new ViewRef_(this);
    this.locals = new Locals(null, MapWrapper.clone(protoLocals));
  }
  init(
      ChangeDetector changeDetector,
      List<ElementInjector> elementInjectors,
      List<ElementInjector> rootElementInjectors,
      List<PreBuiltObjects> preBuiltObjects,
      List<AppView> views,
      List<ElementRef> elementRefs,
      List<AppViewContainer> viewContainers) {
    this.changeDetector = changeDetector;
    this.elementInjectors = elementInjectors;
    this.rootElementInjectors = rootElementInjectors;
    this.preBuiltObjects = preBuiltObjects;
    this.views = views;
    this.elementRefs = elementRefs;
    this.viewContainers = viewContainers;
  }

  void setLocal(String contextName, dynamic value) {
    if (!this.hydrated()) throw new BaseException(
        "Cannot set locals on dehydrated view.");
    if (!this.proto.templateVariableBindings.containsKey(contextName)) {
      return;
    }
    var templateName = this.proto.templateVariableBindings[contextName];
    this.locals.set(templateName, value);
  }

  bool hydrated() {
    return isPresent(this.context);
  }

  /**
   * Triggers the event handlers for the element and the directives.
   *
   * This method is intended to be called from directive EventEmitters.
   *
   * @param {string} eventName
   * @param {*} eventObj
   * @param {number} boundElementIndex
   */
  void triggerEventHandlers(
      String eventName, dynamic eventObj, num boundElementIndex) {
    var locals = new Map<String, dynamic>();
    locals["\$event"] = eventObj;
    this.dispatchEvent(boundElementIndex, eventName, locals);
  }

  // dispatch to element injector or text nodes based on context
  void notifyOnBinding(BindingTarget b, dynamic currentValue) {
    if (b.isTextNode()) {
      this
          .renderer
          .setText(this.render, b.elementIndex + this.textOffset, currentValue);
    } else {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(elementRef, b.name, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(elementRef, b.name,
            isPresent(currentValue) ? '''${ currentValue}''' : null);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(elementRef, b.name, currentValue);
      } else if (b.isElementStyle()) {
        var unit = isPresent(b.unit) ? b.unit : "";
        this.renderer.setElementStyle(elementRef, b.name,
            isPresent(currentValue) ? '''${ currentValue}${ unit}''' : null);
      } else {
        throw new BaseException("Unsupported directive record");
      }
    }
  }

  void logBindingUpdate(BindingTarget b, dynamic value) {
    if (b.isDirective() || b.isElementProperty()) {
      var elementRef = this.elementRefs[this.elementOffset + b.elementIndex];
      this.renderer.setElementAttribute(
          elementRef,
          '''${ REFLECT_PREFIX}${ camelCaseToDashCase ( b . name )}''',
          '''${ value}''');
    }
  }

  void notifyAfterContentChecked() {
    var eiCount = this.proto.elementBinders.length;
    var ei = this.elementInjectors;
    for (var i = eiCount - 1; i >= 0; i--) {
      if (isPresent(ei[i + this.elementOffset])) ei[i + this.elementOffset]
          .afterContentChecked();
    }
  }

  void notifyAfterViewChecked() {
    var eiCount = this.proto.elementBinders.length;
    var ei = this.elementInjectors;
    for (var i = eiCount - 1; i >= 0; i--) {
      if (isPresent(ei[i + this.elementOffset])) ei[i + this.elementOffset]
          .afterViewChecked();
    }
  }

  dynamic getDirectiveFor(DirectiveIndex directive) {
    var elementInjector =
        this.elementInjectors[this.elementOffset + directive.elementIndex];
    return elementInjector.getDirectiveAtIndex(directive.directiveIndex);
  }

  AppView getNestedView(num boundElementIndex) {
    var eli = this.elementInjectors[boundElementIndex];
    return isPresent(eli) ? eli.getNestedView() : null;
  }

  ElementRef getContainerElement() {
    return isPresent(this.containerElementInjector)
        ? this.containerElementInjector.getElementRef()
        : null;
  }

  DebugContext getDebugContext(
      num elementIndex, DirectiveIndex directiveIndex) {
    try {
      var offsettedIndex = this.elementOffset + elementIndex;
      var hasRefForIndex = offsettedIndex < this.elementRefs.length;
      var elementRef = hasRefForIndex
          ? this.elementRefs[this.elementOffset + elementIndex]
          : null;
      var container = this.getContainerElement();
      var ei = hasRefForIndex
          ? this.elementInjectors[this.elementOffset + elementIndex]
          : null;
      var element = isPresent(elementRef) ? elementRef.nativeElement : null;
      var componentElement =
          isPresent(container) ? container.nativeElement : null;
      var directive = isPresent(directiveIndex)
          ? this.getDirectiveFor(directiveIndex)
          : null;
      var injector = isPresent(ei) ? ei.getInjector() : null;
      return new DebugContext(element, componentElement, directive,
          this.context, _localsToStringMap(this.locals), injector);
    } catch (e, e_stack) {
      // TODO: vsavkin log the exception once we have a good way to log errors and warnings

      // if an error happens during getting the debug context, we return null.
      return null;
    }
  }

  dynamic getDetectorFor(DirectiveIndex directive) {
    var childView =
        this.getNestedView(this.elementOffset + directive.elementIndex);
    return isPresent(childView) ? childView.changeDetector : null;
  }

  invokeElementMethod(num elementIndex, String methodName, List<dynamic> args) {
    this
        .renderer
        .invokeElementMethod(this.elementRefs[elementIndex], methodName, args);
  }

  // implementation of RenderEventDispatcher#dispatchRenderEvent
  bool dispatchRenderEvent(
      num boundElementIndex, String eventName, Map<String, dynamic> locals) {
    var elementRef = this.elementRefs[boundElementIndex];
    var view = internalView(elementRef.parentView);
    return view.dispatchEvent(elementRef.boundElementIndex, eventName, locals);
  }

  // returns false if preventDefault must be applied to the DOM event
  bool dispatchEvent(
      num boundElementIndex, String eventName, Map<String, dynamic> locals) {
    try {
      if (this.hydrated()) {
        return !this.changeDetector.handleEvent(
            eventName,
            boundElementIndex - this.elementOffset,
            new Locals(this.locals, locals));
      } else {
        return true;
      }
    } catch (e, e_stack) {
      var c =
          this.getDebugContext(boundElementIndex - this.elementOffset, null);
      var context = isPresent(c)
          ? new _Context(
              c.element, c.componentElement, c.context, c.locals, c.injector)
          : null;
      throw new EventEvaluationError(eventName, e, e_stack, context);
    }
  }

  num get ownBindersCount {
    return this.proto.elementBinders.length;
  }
}

Map<String, dynamic> _localsToStringMap(Locals locals) {
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
  dynamic element;
  dynamic componentElement;
  dynamic context;
  dynamic locals;
  dynamic injector;
  _Context(this.element, this.componentElement, this.context, this.locals,
      this.injector) {}
}

/**
 * Wraps an exception thrown by an event handler.
 */
class EventEvaluationError extends WrappedException {
  EventEvaluationError(String eventName, dynamic originalException,
      dynamic originalStack, dynamic context)
      : super('''Error during evaluation of "${ eventName}"''',
            originalException, originalStack, context) {
    /* super call moved to initializer */;
  }
}

class AppProtoViewMergeInfo {
  num embeddedViewCount;
  num elementCount;
  num viewCount;
  AppProtoViewMergeInfo(
      this.embeddedViewCount, this.elementCount, this.viewCount) {}
}

/**
 *
 */
class AppProtoView {
  String templateId;
  List<TemplateCmd> templateCmds;
  ViewType type;
  bool isMergable;
  Function changeDetectorFactory;
  Map<String, String> templateVariableBindings;
  ProtoPipes pipes;
  ProtoViewRef ref;
  Map<String, dynamic> protoLocals;
  List<ElementBinder> elementBinders = null;
  AppProtoViewMergeInfo mergeInfo = null;
  Map<String, num> variableLocations = null;
  var textBindingCount = null;
  renderApi.RenderProtoViewRef render = null;
  AppProtoView(this.templateId, this.templateCmds, this.type, this.isMergable,
      this.changeDetectorFactory, this.templateVariableBindings, this.pipes) {
    this.ref = new ProtoViewRef_(this);
  }
  init(
      renderApi.RenderProtoViewRef render,
      List<ElementBinder> elementBinders,
      num textBindingCount,
      AppProtoViewMergeInfo mergeInfo,
      Map<String, num> variableLocations) {
    this.render = render;
    this.elementBinders = elementBinders;
    this.textBindingCount = textBindingCount;
    this.mergeInfo = mergeInfo;
    this.variableLocations = variableLocations;
    this.protoLocals = new Map<String, dynamic>();
    if (isPresent(this.templateVariableBindings)) {
      this.templateVariableBindings.forEach((_, templateName) {
        this.protoLocals[templateName] = null;
      });
    }
    if (isPresent(variableLocations)) {
      // The view's locals needs to have a full set of variable names at construction time

      // in order to prevent new variables from being set later in the lifecycle. Since we don't

      // want

      // to actually create variable bindings for the $implicit bindings, add to the

      // protoLocals manually.
      variableLocations.forEach((templateName, _) {
        this.protoLocals[templateName] = null;
      });
    }
  }

  bool isInitialized() {
    return isPresent(this.elementBinders);
  }
}

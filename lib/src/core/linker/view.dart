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
        ProtoChangeDetector,
        ChangeDetectorRef;
import "package:angular2/src/core/di.dart"
    show ResolvedProvider, Injectable, Injector;
import "package:angular2/src/core/change_detection/interfaces.dart"
    show DebugContext;
import "element.dart" show AppProtoElement, AppElement, DirectiveProvider;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, isArray, isNumber;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/render/api.dart" show Renderer, RootRenderer;
import "view_ref.dart" show ViewRef_, HostViewFactoryRef;
import "package:angular2/src/core/pipes/pipes.dart" show ProtoPipes;
import "package:angular2/src/core/render/util.dart" show camelCaseToDashCase;
export "package:angular2/src/core/change_detection/interfaces.dart"
    show DebugContext;
import "package:angular2/src/core/pipes/pipes.dart" show Pipes;
import "view_manager.dart" show AppViewManager_, AppViewManager;
import "resolved_metadata_cache.dart" show ResolvedMetadataCache;
import "view_type.dart" show ViewType;

const String REFLECT_PREFIX = "ng-reflect-";
const EMPTY_CONTEXT = const Object();

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
class AppView implements ChangeDispatcher {
  AppProtoView proto;
  Renderer renderer;
  AppViewManager_ viewManager;
  List<dynamic /* dynamic | List < dynamic > */ > projectableNodes;
  AppElement containerAppElement;
  ChangeDetector changeDetector;
  ViewRef_ ref;
  List<dynamic> rootNodesOrAppElements;
  List<dynamic> allNodes;
  List<Function> disposables;
  List<AppElement> appElements;
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
  Pipes pipes;
  Injector parentInjector;
  /**
   * Whether root injectors of this view
   * have a hostBoundary.
   */
  bool hostInjectorBoundary;
  bool destroyed = false;
  AppView(
      this.proto,
      this.renderer,
      this.viewManager,
      this.projectableNodes,
      this.containerAppElement,
      List<ResolvedProvider> imperativelyCreatedProviders,
      Injector rootInjector,
      this.changeDetector) {
    this.ref = new ViewRef_(this);
    var injectorWithHostBoundary = AppElement.getViewParentInjector(
        this.proto.type,
        containerAppElement,
        imperativelyCreatedProviders,
        rootInjector);
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
  init(List<dynamic> rootNodesOrAppElements, List<dynamic> allNodes,
      List<Function> disposables, List<AppElement> appElements) {
    this.rootNodesOrAppElements = rootNodesOrAppElements;
    this.allNodes = allNodes;
    this.disposables = disposables;
    this.appElements = appElements;
    var localsMap = new Map<String, dynamic>();
    StringMapWrapper.forEach(this.proto.templateVariableBindings,
        (templateName, _) {
      localsMap[templateName] = null;
    });
    for (var i = 0; i < appElements.length; i++) {
      var appEl = appElements[i];
      StringMapWrapper.forEach(appEl.proto.directiveVariableBindings,
          (directiveIndex, name) {
        if (isBlank(directiveIndex)) {
          localsMap[name] = appEl.nativeElement;
        } else {
          localsMap[name] = appEl.getDirectiveAtIndex(directiveIndex);
        }
      });
    }
    var parentLocals = null;
    if (!identical(this.proto.type, ViewType.COMPONENT)) {
      parentLocals = isPresent(this.containerAppElement)
          ? this.containerAppElement.parentView.locals
          : null;
    }
    if (identical(this.proto.type, ViewType.COMPONENT)) {
      // Note: the render nodes have been attached to their host element

      // in the ViewFactory already.
      this.containerAppElement.attachComponentView(this);
      this
          .containerAppElement
          .parentView
          .changeDetector
          .addViewChild(this.changeDetector);
    }
    this.locals = new Locals(parentLocals, localsMap);
    this.changeDetector.hydrate(this.context, this.locals, this, this.pipes);
    this.viewManager.onViewCreated(this);
  }

  destroy() {
    if (this.destroyed) {
      throw new BaseException("This view has already been destroyed!");
    }
    this.changeDetector.destroyRecursive();
  }

  notifyOnDestroy() {
    this.destroyed = true;
    var hostElement = identical(this.proto.type, ViewType.COMPONENT)
        ? this.containerAppElement.nativeElement
        : null;
    this.renderer.destroyView(hostElement, this.allNodes);
    for (var i = 0; i < this.disposables.length; i++) {
      this.disposables[i]();
    }
    this.viewManager.onViewDestroyed(this);
  }

  ChangeDetectorRef get changeDetectorRef {
    return this.changeDetector.ref;
  }

  List<dynamic> get flatRootNodes {
    return flattenNestedViewRenderNodes(this.rootNodesOrAppElements);
  }

  bool hasLocal(String contextName) {
    return StringMapWrapper.contains(
        this.proto.templateVariableBindings, contextName);
  }

  void setLocal(String contextName, dynamic value) {
    if (!this.hasLocal(contextName)) {
      return;
    }
    var templateName = this.proto.templateVariableBindings[contextName];
    this.locals.set(templateName, value);
  }

  // dispatch to element injector or text nodes based on context
  void notifyOnBinding(BindingTarget b, dynamic currentValue) {
    if (b.isTextNode()) {
      this.renderer.setText(this.allNodes[b.elementIndex], currentValue);
    } else {
      var nativeElement = this.appElements[b.elementIndex].nativeElement;
      if (b.isElementProperty()) {
        this.renderer.setElementProperty(nativeElement, b.name, currentValue);
      } else if (b.isElementAttribute()) {
        this.renderer.setElementAttribute(nativeElement, b.name,
            isPresent(currentValue) ? '''${ currentValue}''' : null);
      } else if (b.isElementClass()) {
        this.renderer.setElementClass(nativeElement, b.name, currentValue);
      } else if (b.isElementStyle()) {
        var unit = isPresent(b.unit) ? b.unit : "";
        this.renderer.setElementStyle(nativeElement, b.name,
            isPresent(currentValue) ? '''${ currentValue}${ unit}''' : null);
      } else {
        throw new BaseException("Unsupported directive record");
      }
    }
  }

  void logBindingUpdate(BindingTarget b, dynamic value) {
    if (b.isDirective() || b.isElementProperty()) {
      var nativeElement = this.appElements[b.elementIndex].nativeElement;
      this.renderer.setBindingDebugInfo(
          nativeElement,
          '''${ REFLECT_PREFIX}${ camelCaseToDashCase ( b . name )}''',
          '''${ value}''');
    }
  }

  void notifyAfterContentChecked() {
    var count = this.appElements.length;
    for (var i = count - 1; i >= 0; i--) {
      this.appElements[i].ngAfterContentChecked();
    }
  }

  void notifyAfterViewChecked() {
    var count = this.appElements.length;
    for (var i = count - 1; i >= 0; i--) {
      this.appElements[i].ngAfterViewChecked();
    }
  }

  DebugContext getDebugContext(
      AppElement appElement, num elementIndex, num directiveIndex) {
    try {
      if (isBlank(appElement) && elementIndex < this.appElements.length) {
        appElement = this.appElements[elementIndex];
      }
      var container = this.containerAppElement;
      var element = isPresent(appElement) ? appElement.nativeElement : null;
      var componentElement =
          isPresent(container) ? container.nativeElement : null;
      var directive = isPresent(directiveIndex)
          ? appElement.getDirectiveAtIndex(directiveIndex)
          : null;
      var injector = isPresent(appElement) ? appElement.getInjector() : null;
      return new DebugContext(element, componentElement, directive,
          this.context, _localsToStringMap(this.locals), injector);
    } catch (e, e_stack) {
      // TODO: vsavkin log the exception once we have a good way to log errors and warnings

      // if an error happens during getting the debug context, we return null.
      return null;
    }
  }

  dynamic getDirectiveFor(DirectiveIndex directive) {
    return this.appElements[directive.elementIndex]
        .getDirectiveAtIndex(directive.directiveIndex);
  }

  ChangeDetector getDetectorFor(DirectiveIndex directive) {
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
  bool triggerEventHandlers(
      String eventName, dynamic eventObj, num boundElementIndex) {
    return this
        .changeDetector
        .handleEvent(eventName, boundElementIndex, eventObj);
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
 *
 */
class AppProtoView {
  ViewType type;
  ProtoPipes protoPipes;
  Map<String, String> templateVariableBindings;
  static AppProtoView create(ResolvedMetadataCache metadataCache, ViewType type,
      List<Type> pipes, Map<String, String> templateVariableBindings) {
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

  AppProtoView(this.type, this.protoPipes, this.templateVariableBindings) {}
}

class HostViewFactory {
  final String selector;
  final Function viewFactory;
  const HostViewFactory(this.selector, this.viewFactory);
}

List<dynamic> flattenNestedViewRenderNodes(List<dynamic> nodes) {
  return _flattenNestedViewRenderNodes(nodes, []);
}

List<dynamic> _flattenNestedViewRenderNodes(
    List<dynamic> nodes, List<dynamic> renderNodes) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node is AppElement) {
      var appEl = (node as AppElement);
      renderNodes.add(appEl.nativeElement);
      if (isPresent(appEl.nestedViews)) {
        for (var k = 0; k < appEl.nestedViews.length; k++) {
          _flattenNestedViewRenderNodes(
              appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
        }
      }
    } else {
      renderNodes.add(node);
    }
  }
  return renderNodes;
}

void checkSlotCount(String componentName, num expectedSlotCount,
    List<List<dynamic>> projectableNodes) {
  var givenSlotCount =
      isPresent(projectableNodes) ? projectableNodes.length : 0;
  if (givenSlotCount < expectedSlotCount) {
    throw new BaseException(
        '''The component ${ componentName} has ${ expectedSlotCount} <ng-content> elements,''' +
            ''' but only ${ givenSlotCount} slots were provided.''');
  }
}

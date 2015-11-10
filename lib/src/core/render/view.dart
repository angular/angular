library angular2.src.core.render.view;

import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, Map, StringMapWrapper;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, stringify;
import "api.dart"
    show
        RenderComponentTemplate,
        RenderViewRef,
        RenderEventDispatcher,
        RenderTemplateCmd,
        RenderProtoViewRef,
        RenderFragmentRef;

class DefaultProtoViewRef extends RenderProtoViewRef {
  RenderComponentTemplate template;
  List<RenderTemplateCmd> cmds;
  DefaultProtoViewRef(this.template, this.cmds) : super() {
    /* super call moved to initializer */;
  }
}

class DefaultRenderFragmentRef<N> extends RenderFragmentRef {
  List<N> nodes;
  DefaultRenderFragmentRef(this.nodes) : super() {
    /* super call moved to initializer */;
  }
}

class DefaultRenderView<N> extends RenderViewRef {
  List<DefaultRenderFragmentRef<N>> fragments;
  List<N> boundTextNodes;
  List<N> boundElements;
  List<N> nativeShadowRoots;
  List<Function> globalEventAdders;
  List<N> rootContentInsertionPoints;
  bool hydrated = false;
  RenderEventDispatcher eventDispatcher = null;
  List<Function> globalEventRemovers = null;
  DefaultRenderView(
      this.fragments,
      this.boundTextNodes,
      this.boundElements,
      this.nativeShadowRoots,
      this.globalEventAdders,
      this.rootContentInsertionPoints)
      : super() {
    /* super call moved to initializer */;
  }
  hydrate() {
    if (this.hydrated) throw new BaseException("The view is already hydrated.");
    this.hydrated = true;
    this.globalEventRemovers =
        ListWrapper.createFixedSize(this.globalEventAdders.length);
    for (var i = 0; i < this.globalEventAdders.length; i++) {
      this.globalEventRemovers[i] = this.globalEventAdders[i]();
    }
  }

  dehydrate() {
    if (!this
        .hydrated) throw new BaseException("The view is already dehydrated.");
    for (var i = 0; i < this.globalEventRemovers.length; i++) {
      this.globalEventRemovers[i]();
    }
    this.globalEventRemovers = null;
    this.hydrated = false;
  }

  setEventDispatcher(RenderEventDispatcher dispatcher) {
    this.eventDispatcher = dispatcher;
  }

  bool dispatchRenderEvent(
      num boundElementIndex, String eventName, dynamic event) {
    var allowDefaultBehavior = true;
    if (isPresent(this.eventDispatcher)) {
      var locals = new Map<String, dynamic>();
      locals["\$event"] = event;
      allowDefaultBehavior = this
          .eventDispatcher
          .dispatchRenderEvent(boundElementIndex, eventName, locals);
    }
    return allowDefaultBehavior;
  }
}

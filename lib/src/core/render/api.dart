library angular2.src.core.render.api;

import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/facade/collection.dart" show Map;
import "package:angular2/src/core/metadata.dart" show ViewEncapsulation;

/**
 * Represents an Angular ProtoView in the Rendering Context.
 *
 * When you implement a custom [Renderer], `RenderProtoViewRef` specifies what Render View
 * your renderer should create.
 *
 * `RenderProtoViewRef` is a counterpart to [ProtoViewRef] available in the Application
 * Context. But unlike `ProtoViewRef`, `RenderProtoViewRef` contains all static nested Proto Views
 * that are recursively merged into a single Render Proto View.

 *
 * <!-- TODO: this is created by Renderer#createProtoView in the new compiler -->
 */
class RenderProtoViewRef {}
/**
 * Represents a list of sibling Nodes that can be moved by the [Renderer] independently of
 * other Render Fragments.
 *
 * Any [RenderView] has one Render Fragment.
 *
 * Additionally any View with an Embedded View that contains a [NgContent View Projection]
 * results in additional Render Fragment.
 */

/*
  <div>foo</div>
  {{bar}}


  <div>foo</div> -> view 1 / fragment 1
  <ul>
    <template ng-for>
      <li>{{fg}}</li> -> view 2 / fragment 1
    </template>
  </ul>
  {{bar}}


  <div>foo</div> -> view 1 / fragment 1
  <ul>
    <template ng-if>
      <li><ng-content></></li> -> view 1 / fragment 2
    </template>
    <template ng-for>
      <li><ng-content></></li> ->
      <li></li>                -> view 1 / fragment 2 + view 2 / fragment 1..n-1
    </template>
  </ul>
  {{bar}}
 */

// TODO(i): refactor into an interface
class RenderFragmentRef {}
/**
 * Represents an Angular View in the Rendering Context.
 *
 * `RenderViewRef` specifies to the [Renderer] what View to update or destroy.
 *
 * Unlike a [ViewRef] available in the Application Context, Render View contains all the
 * static Component Views that have been recursively merged into a single Render View.
 *
 * Each `RenderViewRef` contains one or more [RenderFragmentRef Render Fragments], these
 * Fragments are created, hydrated, dehydrated and destroyed as a single unit together with the
 * View.
 */

// TODO(i): refactor into an interface
class RenderViewRef {}

abstract class RenderTemplateCmd {
  dynamic visit(RenderCommandVisitor visitor, dynamic context);
}

abstract class RenderBeginCmd extends RenderTemplateCmd {
  num get ngContentIndex {
    return unimplemented();
  }

  bool get isBound {
    return unimplemented();
  }
}

abstract class RenderTextCmd extends RenderBeginCmd {
  String get value {
    return unimplemented();
  }
}

abstract class RenderNgContentCmd extends RenderTemplateCmd {
  // The index of this NgContent element
  num get index {
    return unimplemented();
  }
  // The index of the NgContent element into which this

  // NgContent element should be projected (if any)
  num get ngContentIndex {
    return unimplemented();
  }
}

abstract class RenderBeginElementCmd extends RenderBeginCmd {
  String get name {
    return unimplemented();
  }

  List<String> get attrNameAndValues {
    return unimplemented();
  }

  List<String> get eventTargetAndNames {
    return unimplemented();
  }
}

abstract class RenderBeginComponentCmd extends RenderBeginElementCmd {
  String get templateId {
    return unimplemented();
  }
}

abstract class RenderEmbeddedTemplateCmd extends RenderBeginElementCmd {
  bool get isMerged {
    return unimplemented();
  }

  List<RenderTemplateCmd> get children {
    return unimplemented();
  }
}

abstract class RenderCommandVisitor {
  dynamic visitText(RenderTextCmd cmd, dynamic context);
  dynamic visitNgContent(RenderNgContentCmd cmd, dynamic context);
  dynamic visitBeginElement(RenderBeginElementCmd cmd, dynamic context);
  dynamic visitEndElement(dynamic context);
  dynamic visitBeginComponent(RenderBeginComponentCmd cmd, dynamic context);
  dynamic visitEndComponent(dynamic context);
  dynamic visitEmbeddedTemplate(RenderEmbeddedTemplateCmd cmd, dynamic context);
}
/**
 * Container class produced by a [Renderer] when creating a Render View.
 *
 * An instance of `RenderViewWithFragments` contains a [RenderViewRef] and an array of
 * [RenderFragmentRef]s belonging to this Render View.
 */

// TODO(i): refactor this by RenderViewWithFragments and adding fragments directly to RenderViewRef
class RenderViewWithFragments {
  RenderViewRef viewRef;
  List<RenderFragmentRef> fragmentRefs;
  RenderViewWithFragments(
      /**
       * Reference to the [RenderViewRef].
       */
      this.viewRef,
      /**
       * Array of [RenderFragmentRef]s ordered in the depth-first order.
       */
      this.fragmentRefs) {}
}

/**
 * Represents an Element that is part of a [RenderViewRef Render View].
 *
 * `RenderElementRef` is a counterpart to [ElementRef] available in the Application Context.
 *
 * When using `Renderer` from the Application Context, `ElementRef` can be used instead of
 * `RenderElementRef`.
 */
abstract class RenderElementRef {
  /**
   * Reference to the Render View that contains this Element.
   */
  RenderViewRef renderView;
  /**
   * @internal
   *
   * Index of the Element (in the depth-first order) inside the Render View.
   *
   * This index is used internally by Angular to locate elements.
   */
  num boundElementIndex;
}

class RenderComponentTemplate {
  String id;
  String shortId;
  ViewEncapsulation encapsulation;
  List<RenderTemplateCmd> commands;
  List<String> styles;
  RenderComponentTemplate(
      this.id, this.shortId, this.encapsulation, this.commands, this.styles) {}
}

/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use [#setElementProperty] or [#setElementAttribute]
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is [DomRenderer]. Also see [WebWorkerRenderer].
 */
abstract class Renderer {
  /**
   * Registers a component template represented as arrays of [RenderTemplateCmd]s and styles
   * with the Renderer.
   *
   * Once a template is registered it can be referenced via [RenderBeginComponentCmd] when
   * [#createProtoView creating Render ProtoView].
   */
  registerComponentTemplate(RenderComponentTemplate template);
  /**
   * Creates a [RenderProtoViewRef] from an array of [RenderTemplateCmd]`s.
   */
  RenderProtoViewRef createProtoView(
      String componentTemplateId, List<RenderTemplateCmd> cmds);
  /**
   * Creates a Root Host View based on the provided `hostProtoViewRef`.
   *
   * `fragmentCount` is the number of nested [RenderFragmentRef]s in this View. This parameter
   * is non-optional so that the renderer can create a result synchronously even when application
   * runs in a different context (e.g. in a Web Worker).
   *
   * `hostElementSelector` is a (CSS) selector for querying the main document to find the Host
   * Element. The newly created Root Host View should be attached to this element.
   *
   * Returns an instance of [RenderViewWithFragments], representing the Render View.
   */
  RenderViewWithFragments createRootHostView(
      RenderProtoViewRef hostProtoViewRef,
      num fragmentCount,
      String hostElementSelector);
  /**
   * Creates a Render View based on the provided `protoViewRef`.
   *
   * `fragmentCount` is the number of nested [RenderFragmentRef]s in this View. This parameter
   * is non-optional so that the renderer can create a result synchronously even when application
   * runs in a different context (e.g. in a Web Worker).
   *
   * Returns an instance of [RenderViewWithFragments], representing the Render View.
   */
  RenderViewWithFragments createView(
      RenderProtoViewRef protoViewRef, num fragmentCount);
  /**
   * Destroys a Render View specified via `viewRef`.
   *
   * This operation should be performed only on a View that has already been dehydrated and
   * all of its Render Fragments have been detached.
   *
   * Destroying a View indicates to the Renderer that this View is not going to be referenced in any
   * future operations. If the Renderer created any renderer-specific objects for this View, these
   * objects should now be destroyed to prevent memory leaks.
   */
  destroyView(RenderViewRef viewRef);
  /**
   * Attaches the Nodes of a Render Fragment after the last Node of `previousFragmentRef`.
   */
  attachFragmentAfterFragment(
      RenderFragmentRef previousFragmentRef, RenderFragmentRef fragmentRef);
  /**
   * Attaches the Nodes of the Render Fragment after an Element.
   */
  attachFragmentAfterElement(
      RenderElementRef elementRef, RenderFragmentRef fragmentRef);
  /**
   * Detaches the Nodes of a Render Fragment from their parent.
   *
   * This operations should be called only on a View that has been already
   * [#dehydrateView dehydrated].
   */
  detachFragment(RenderFragmentRef fragmentRef);
  /**
   * Notifies a custom Renderer to initialize a Render View.
   *
   * This method is called by Angular after a Render View has been created, or when a previously
   * dehydrated Render View is about to be reused.
   */
  hydrateView(RenderViewRef viewRef);
  /**
   * Notifies a custom Renderer that a Render View is no longer active.
   *
   * This method is called by Angular before a Render View will be destroyed, or when a hydrated
   * Render View is about to be put into a pool for future reuse.
   */
  dehydrateView(RenderViewRef viewRef);
  /**
   * Returns the underlying native element at the specified `location`, or `null` if direct access
   * to native elements is not supported (e.g. when the application runs in a web worker).
   *
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this api as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding, or other [Renderer] methods instead.
   *   </p>
   *   <p>
   *    Relying on direct DOM access creates tight coupling between your application and rendering
   *    layers which will make it impossible to separate the two and deploy your application into a
   *    web worker.
   *   </p>
   * </div>
   */
  dynamic getNativeElementSync(RenderElementRef location);
  /**
   * Sets a property on the Element specified via `location`.
   */
  setElementProperty(
      RenderElementRef location, String propertyName, dynamic propertyValue);
  /**
   * Sets an attribute on the Element specified via `location`.
   *
   * If `attributeValue` is `null`, the attribute is removed.
   */
  setElementAttribute(
      RenderElementRef location, String attributeName, String attributeValue);
  /**
   * Sets a (CSS) class on the Element specified via `location`.
   *
   * `isAdd` specifies if the class should be added or removed.
   */
  setElementClass(RenderElementRef location, String className, bool isAdd);
  /**
   * Sets a (CSS) inline style on the Element specified via `location`.
   *
   * If `styleValue` is `null`, the style is removed.
   */
  setElementStyle(
      RenderElementRef location, String styleName, String styleValue);
  /**
   * Calls a method on the Element specified via `location`.
   */
  invokeElementMethod(
      RenderElementRef location, String methodName, List<dynamic> args);
  /**
   * Sets the value of an interpolated TextNode at the specified index to the `text` value.
   *
   * `textNodeIndex` is the depth-first index of the Node among interpolated Nodes in the Render
   * View.
   */
  setText(RenderViewRef viewRef, num textNodeIndex, String text);
  /**
   * Sets a dispatcher to relay all events triggered in the given Render View.
   *
   * Each Render View can have only one Event Dispatcher, if this method is called multiple times,
   * the last provided dispatcher will be used.
   */
  setEventDispatcher(RenderViewRef viewRef, RenderEventDispatcher dispatcher);
}

/**
 * A dispatcher that relays all events that occur in a Render View.
 *
 * Use [Renderer#setEventDispatcher] to register a dispatcher for a particular Render View.
 */
abstract class RenderEventDispatcher {
  /**
   * Called when Event called `eventName` was triggered on an Element with an Event Binding for this
   * Event.
   *
   * `elementIndex` specifies the depth-first index of the Element in the Render View.
   *
   * `locals` is a map for local variable to value mapping that should be used when evaluating the
   * Event Binding expression.
   *
   * Returns `false` if `preventDefault` should be called to stop the default behavior of the Event
   * in the Rendering Context.
   */
  bool dispatchRenderEvent(
      num elementIndex, String eventName, Map<String, dynamic> locals);
}

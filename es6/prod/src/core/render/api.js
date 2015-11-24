import { unimplemented } from 'angular2/src/facade/exceptions';
/**
 * Represents an Angular ProtoView in the Rendering Context.
 *
 * When you implement a custom {@link Renderer}, `RenderProtoViewRef` specifies what Render View
 * your renderer should create.
 *
 * `RenderProtoViewRef` is a counterpart to {@link ProtoViewRef} available in the Application
 * Context. But unlike `ProtoViewRef`, `RenderProtoViewRef` contains all static nested Proto Views
 * that are recursively merged into a single Render Proto View.

 *
 * <!-- TODO: this is created by Renderer#createProtoView in the new compiler -->
 */
export class RenderProtoViewRef {
}
/**
 * Represents a list of sibling Nodes that can be moved by the {@link Renderer} independently of
 * other Render Fragments.
 *
 * Any {@link RenderView} has one Render Fragment.
 *
 * Additionally any View with an Embedded View that contains a {@link NgContent View Projection}
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
export class RenderFragmentRef {
}
/**
 * Represents an Angular View in the Rendering Context.
 *
 * `RenderViewRef` specifies to the {@link Renderer} what View to update or destroy.
 *
 * Unlike a {@link ViewRef} available in the Application Context, Render View contains all the
 * static Component Views that have been recursively merged into a single Render View.
 *
 * Each `RenderViewRef` contains one or more {@link RenderFragmentRef Render Fragments}, these
 * Fragments are created, hydrated, dehydrated and destroyed as a single unit together with the
 * View.
 */
// TODO(i): refactor into an interface
export class RenderViewRef {
}
export class RenderTemplateCmd {
}
export class RenderBeginCmd extends RenderTemplateCmd {
    get ngContentIndex() { return unimplemented(); }
    ;
    get isBound() { return unimplemented(); }
    ;
}
export class RenderTextCmd extends RenderBeginCmd {
    get value() { return unimplemented(); }
    ;
}
export class RenderNgContentCmd extends RenderTemplateCmd {
    // The index of this NgContent element
    get index() { return unimplemented(); }
    ;
    // The index of the NgContent element into which this
    // NgContent element should be projected (if any)
    get ngContentIndex() { return unimplemented(); }
    ;
}
export class RenderBeginElementCmd extends RenderBeginCmd {
    get name() { return unimplemented(); }
    ;
    get attrNameAndValues() { return unimplemented(); }
    ;
    get eventTargetAndNames() { return unimplemented(); }
    ;
}
export class RenderBeginComponentCmd extends RenderBeginElementCmd {
    get templateId() { return unimplemented(); }
    ;
}
export class RenderEmbeddedTemplateCmd extends RenderBeginElementCmd {
    get isMerged() { return unimplemented(); }
    ;
    get children() { return unimplemented(); }
    ;
}
/**
 * Container class produced by a {@link Renderer} when creating a Render View.
 *
 * An instance of `RenderViewWithFragments` contains a {@link RenderViewRef} and an array of
 * {@link RenderFragmentRef}s belonging to this Render View.
 */
// TODO(i): refactor this by RenderViewWithFragments and adding fragments directly to RenderViewRef
export class RenderViewWithFragments {
    constructor(
        /**
         * Reference to the {@link RenderViewRef}.
         */
        viewRef, 
        /**
         * Array of {@link RenderFragmentRef}s ordered in the depth-first order.
         */
        fragmentRefs) {
        this.viewRef = viewRef;
        this.fragmentRefs = fragmentRefs;
    }
}
export class RenderComponentTemplate {
    constructor(id, shortId, encapsulation, commands, styles) {
        this.id = id;
        this.shortId = shortId;
        this.encapsulation = encapsulation;
        this.commands = commands;
        this.styles = styles;
    }
}
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is {@link DomRenderer}. Also see {@link WebWorkerRenderer}.
 */
export class Renderer {
}
//# sourceMappingURL=api.js.map
import { ViewEncapsulation } from 'angular2/src/core/metadata';
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
export declare class RenderProtoViewRef {
}
/**
 * Represents a list of sibling Nodes that can be moved by the {@link Renderer} independently of
 * other Render Fragments.
 *
 * Any {@link RenderViewRef} has one Render Fragment.
 *
 * Additionally any View with an Embedded View that contains a {@link NgContentAst View Projection}
 * results in additional Render Fragment.
 */
export declare class RenderFragmentRef {
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
export declare class RenderViewRef {
}
/**
 * Abstract base class for commands to the Angular renderer, using the visitor pattern.
 */
export declare abstract class RenderTemplateCmd {
    abstract visit(visitor: RenderCommandVisitor, context: any): any;
}
/**
 * Command to begin rendering.
 */
export declare abstract class RenderBeginCmd extends RenderTemplateCmd {
    ngContentIndex: number;
    isBound: boolean;
}
/**
 * Command to render text.
 */
export declare abstract class RenderTextCmd extends RenderBeginCmd {
    value: string;
}
/**
 * Command to render projected content.
 */
export declare abstract class RenderNgContentCmd extends RenderTemplateCmd {
    index: number;
    ngContentIndex: number;
}
/**
 * Command to begin rendering an element.
 */
export declare abstract class RenderBeginElementCmd extends RenderBeginCmd {
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
}
/**
 * Command to begin rendering a component.
 */
export declare abstract class RenderBeginComponentCmd extends RenderBeginElementCmd {
    templateId: string;
}
/**
 * Command to render a component's template.
 */
export declare abstract class RenderEmbeddedTemplateCmd extends RenderBeginElementCmd {
    isMerged: boolean;
    children: RenderTemplateCmd[];
}
/**
 * Visitor for a {@link RenderTemplateCmd}.
 */
export interface RenderCommandVisitor {
    visitText(cmd: RenderTextCmd, context: any): any;
    visitNgContent(cmd: RenderNgContentCmd, context: any): any;
    visitBeginElement(cmd: RenderBeginElementCmd, context: any): any;
    visitEndElement(context: any): any;
    visitBeginComponent(cmd: RenderBeginComponentCmd, context: any): any;
    visitEndComponent(context: any): any;
    visitEmbeddedTemplate(cmd: RenderEmbeddedTemplateCmd, context: any): any;
}
/**
 * Container class produced by a {@link Renderer} when creating a Render View.
 *
 * An instance of `RenderViewWithFragments` contains a {@link RenderViewRef} and an array of
 * {@link RenderFragmentRef}s belonging to this Render View.
 */
export declare class RenderViewWithFragments {
    /**
     * Reference to the {@link RenderViewRef}.
     */
    viewRef: RenderViewRef;
    /**
     * Array of {@link RenderFragmentRef}s ordered in the depth-first order.
     */
    fragmentRefs: RenderFragmentRef[];
    constructor(
        /**
         * Reference to the {@link RenderViewRef}.
         */
        viewRef: RenderViewRef, 
        /**
         * Array of {@link RenderFragmentRef}s ordered in the depth-first order.
         */
        fragmentRefs: RenderFragmentRef[]);
}
/**
 * Represents an Element that is part of a {@link RenderViewRef Render View}.
 *
 * `RenderElementRef` is a counterpart to {@link ElementRef} available in the Application Context.
 *
 * When using `Renderer` from the Application Context, `ElementRef` can be used instead of
 * `RenderElementRef`.
 */
export interface RenderElementRef {
    /**
     * Reference to the Render View that contains this Element.
     */
    renderView: RenderViewRef;
}
/**
 * Template for rendering a component, including commands and styles.
 */
export declare class RenderComponentTemplate {
    id: string;
    shortId: string;
    encapsulation: ViewEncapsulation;
    commands: RenderTemplateCmd[];
    styles: string[];
    constructor(id: string, shortId: string, encapsulation: ViewEncapsulation, commands: RenderTemplateCmd[], styles: string[]);
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
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
export declare abstract class Renderer {
    /**
     * Registers a component template represented as arrays of {@link RenderTemplateCmd}s and styles
     * with the Renderer.
     *
     * Once a template is registered it can be referenced via {@link RenderBeginComponentCmd} when
     * {@link #createProtoView creating Render ProtoView}.
     */
    abstract registerComponentTemplate(template: RenderComponentTemplate): any;
    /**
     * Creates a {@link RenderProtoViewRef} from an array of {@link RenderTemplateCmd}`s.
     */
    abstract createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef;
    /**
     * Creates a Root Host View based on the provided `hostProtoViewRef`.
     *
     * `fragmentCount` is the number of nested {@link RenderFragmentRef}s in this View. This parameter
     * is non-optional so that the renderer can create a result synchronously even when application
     * runs in a different context (e.g. in a Web Worker).
     *
     * `hostElementSelector` is a (CSS) selector for querying the main document to find the Host
     * Element. The newly created Root Host View should be attached to this element.
     *
     * Returns an instance of {@link RenderViewWithFragments}, representing the Render View.
     */
    abstract createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number, hostElementSelector: string): RenderViewWithFragments;
    /**
     * Creates a Render View based on the provided `protoViewRef`.
     *
     * `fragmentCount` is the number of nested {@link RenderFragmentRef}s in this View. This parameter
     * is non-optional so that the renderer can create a result synchronously even when application
     * runs in a different context (e.g. in a Web Worker).
     *
     * Returns an instance of {@link RenderViewWithFragments}, representing the Render View.
     */
    abstract createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments;
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
    abstract destroyView(viewRef: RenderViewRef): any;
    /**
     * Attaches the Nodes of a Render Fragment after the last Node of `previousFragmentRef`.
     */
    abstract attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef, fragmentRef: RenderFragmentRef): any;
    /**
     * Attaches the Nodes of the Render Fragment after an Element.
     */
    abstract attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef): any;
    /**
     * Detaches the Nodes of a Render Fragment from their parent.
     *
     * This operations should be called only on a View that has been already
     * {@link #dehydrateView dehydrated}.
     */
    abstract detachFragment(fragmentRef: RenderFragmentRef): any;
    /**
     * Notifies a custom Renderer to initialize a Render View.
     *
     * This method is called by Angular after a Render View has been created, or when a previously
     * dehydrated Render View is about to be reused.
     */
    abstract hydrateView(viewRef: RenderViewRef): any;
    /**
     * Notifies a custom Renderer that a Render View is no longer active.
     *
     * This method is called by Angular before a Render View will be destroyed, or when a hydrated
     * Render View is about to be put into a pool for future reuse.
     */
    abstract dehydrateView(viewRef: RenderViewRef): any;
    /**
     * Returns the underlying native element at the specified `location`, or `null` if direct access
     * to native elements is not supported (e.g. when the application runs in a web worker).
     *
     * <div class="callout is-critical">
     *   <header>Use with caution</header>
     *   <p>
     *    Use this api as the last resort when direct access to DOM is needed. Use templating and
     *    data-binding, or other {@link Renderer} methods instead.
     *   </p>
     *   <p>
     *    Relying on direct DOM access creates tight coupling between your application and rendering
     *    layers which will make it impossible to separate the two and deploy your application into a
     *    web worker.
     *   </p>
     * </div>
     */
    abstract getNativeElementSync(location: RenderElementRef): any;
    /**
     * Sets a property on the Element specified via `location`.
     */
    abstract setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any): any;
    /**
     * Sets an attribute on the Element specified via `location`.
     *
     * If `attributeValue` is `null`, the attribute is removed.
     */
    abstract setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string): any;
    abstract setBindingDebugInfo(location: RenderElementRef, propertyName: string, propertyValue: string): any;
    /**
     * Sets a (CSS) class on the Element specified via `location`.
     *
     * `isAdd` specifies if the class should be added or removed.
     */
    abstract setElementClass(location: RenderElementRef, className: string, isAdd: boolean): any;
    /**
     * Sets a (CSS) inline style on the Element specified via `location`.
     *
     * If `styleValue` is `null`, the style is removed.
     */
    abstract setElementStyle(location: RenderElementRef, styleName: string, styleValue: string): any;
    /**
     * Calls a method on the Element specified via `location`.
     */
    abstract invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]): any;
    /**
     * Sets the value of an interpolated TextNode at the specified index to the `text` value.
     *
     * `textNodeIndex` is the depth-first index of the Node among interpolated Nodes in the Render
     * View.
     */
    abstract setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): any;
    /**
     * Sets a dispatcher to relay all events triggered in the given Render View.
     *
     * Each Render View can have only one Event Dispatcher, if this method is called multiple times,
     * the last provided dispatcher will be used.
     */
    abstract setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): any;
}
/**
 * A dispatcher that relays all events that occur in a Render View.
 *
 * Use {@link Renderer#setEventDispatcher} to register a dispatcher for a particular Render View.
 */
export interface RenderEventDispatcher {
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
    dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>): boolean;
}

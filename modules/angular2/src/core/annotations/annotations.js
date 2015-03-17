import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';
import {Injectable} from 'angular2/di';

// type StringMap = {[idx: string]: string};

/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * Directive is an abstract concept, instead use concrete directives such as: [Component], [Decorator] or [Viewport].
 *
 * A directive consists of a single directive annotation and a controller class. When the directive's [selector] matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the [elementInjector] resolves the directive's constructor arguments.
 * 2. Angular instantiates directives for each matched element using [ElementInjector].
 *
 * Angular guarantees the following constraints:
 * - Directives are instantiated in a depth-first order, according to the order in which they appear in the [View].
 * - Injection cannot cross a Shadow DOM boundary. Angular looks for directives in the current template only.
 *
 * The constructor arguments for a directive may be:
 *  - other directives, as annotated by:
 *    - `@Ancestor() d:Type`: any directive that matches the type between the current element (excluded) and the Shadow DOM root.
 *    - `@Parent() d:Type`: any directive that matches the type on a direct parent element only.
 *    - `d:Type`: a directive on the current element only.
 *    - `@Children query:Query<Type>`: A live collection of direct child directives.
 *    - `@Descendants query:Query<Type>`: A live collection of any child directives.
 *  - element specific special objects:
 *    - [NgElement] (DEPRECATED: replacment coming)
 *    - [ViewContainer] (Only for [Viewport])
 *    - [BindingPropagation] Used for controlling change detection
 *  - Component level injectables as declared by [Component.services] of a parent compontent.
 *
 *
 *
 * ## Example
 *
 * Assuming this HTML structure:
 *
 * ```
 * <div marker="1">
 *   <div marker="2">
 *     <div marker="3" example>
 *       <div marker="4">
 *         <div marker="5"></div>
 *       </div>
 *       <div marker="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `Marker` decorator and `SomeService` class:
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Decorator({
 *   selector: '[marker]',
 *   bind: {
 *     'id':'marker'
 *   }
 * })
 * class Marker {
 *   id:string;
 * }
 * ```
 *
 * We would like to demonstrate how we can inject different instances into a directive. In each case injecting
 * is as simple as asking for the type in the constructor.
 *
 *
 * ### No injection
 *
 * A directive can have a constructor with no arguments in which case nothing is injected into it.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor() {
 *   }
 * }
 * ```
 *
 *
 * ### Injecting from application injector
 *
 * Directives can inject any injectable instance from the closest component injector or any of its parents.
 * To inject from component injector the directive list the dependency as such:
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(someService:SomeService) {
 *   }
 * }
 * ```
 *
 *
 * ### Injecting directive from current element
 *
 * Directives can inject other directives declared on the current element. If no such type is found the injection will
 * delegate to component injector which will throw an error (or optionally return null as described below).
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(marker:Marker) {
 *     expect(marker.id).toEqual(2);
 *   }
 * }
 * ```
 *
 *
 * ### Injecting directive from parent element
 *
 * Directives can inject other directives declared on parent element. If no such type is found the injection will
 * delegate to component injector which will throw.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(@Parent() marker:Marker) {
 *     expect(marker.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * The `@Parent` annotation will explicitly skip the current element, even if the current element could satisfy
 * the dependency.
 *
 *
 * ### Injecting directive from ancestor element.
 *
 * Directives can inject other directives declared on ancestor (parent plus its parents) elements. If no such type is
 * found the injection will delegate to component injector which will throw.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(@Ancestor() marker:Marker) {
 *     expect(marker.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * The `@Ancestor` annotation will explicitly skip the current element, even if the current element could satisfy
 * the dependency. Unlike the `@Parent` which only checks the parent `@Ancestor` checks the parent, as well as its
 * parents recursivly. If `marker="2"` would not be preset this injection would return `marker="1"`.
 *
 *
 * ### Injecting query of child directives. [PENDING IMPLEMENTATION]
 *
 * In some cases the directive may be interersted in injecting its child directives. This is not directly possible
 * since parent directives are guarteed to be created before child directives. Instead we can injecto a container
 * which can than be filled once the data is needed.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(@Children() markers:Query<Maker>) {
 *     // markers will eventuall contain: [4, 6]
 *     // this will upbate if children are added/removed/moved,
 *     // for example by having for or if.
 *   }
 * }
 * ```
 *
 *
 * ### Injecting query of descendant directives. [PENDING IMPLEMENTATION]
 *
 * Similar to `@Children` but also includ childre of those children.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(@Children() markers:Query<Maker>) {
 *     // markers will eventuall contain: [4, 5, 6]
 *     // this will upbate if children are added/removed/moved,
 *     // for example by having for or if.
 *   }
 * }
 * ```
 *
 *
 * ### Optional injection
 *
 * Finally there may be times when we would like to inject a component which may or may not be there. For this
 * use case angular supports `@Optional` injection.
 *
 * ```
 * @Decorator({ selector: '[example]' })
 * class Example {
 *   constructor(@Optional() @Ancestor() form:Form) {
 *     // this will search for a Form directive above itself,
 *     // and inject null if not found
 *   }
 * }
 * ```
 *
 * @publicModule angular2/annotations
 */
@ABSTRACT()
export class Directive extends Injectable {
  /**
   * The CSS selector that triggers the instantiation of a directive.
   *
   * Angular only allows directives to trigger on CSS selectors that do not cross element boundaries.
   * The supported selectors are:
   *
   * - `element-name` select by element name.
   * - `.class` select by class name.
   * - `[attribute]` select by attribute name.
   * - `[attribute=value]` select by attribute name and value.
   * - `:not(sub_selector)` select only if the element does not match the `sub_selector`.
   *
   * ## Example
   *
   * Suppose we have a directive with an `input[type=text]` selector.
   *
   * And the following HTML:
   *
   * ```html
   * <form>
   *   <input type="text">
   *   <input type="radio">
   * <form>
   * ```
   *
   * The directive would only be instantiated on the `<input type="text">` element.
   *
   */
  selector:string;

  /**
   * Enumerates the set of properties that accept data binding for a directive.
   *
   * The `bind` property defines a set of `directiveProperty` to `bindingProperty` key-value pairs:
   *
   * - `directiveProperty` specifies the component property where the value is written.
   * - `bindingProperty` specifies the DOM property where the value is read from.
   *
   * You can include [Pipes] when specifying a `bindingProperty` to allow for data transformation and structural
   * change detection of the value.
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   bind: {
   *     'directiveProperty1': 'bindingProperty1',
   *     'directiveProperty2': 'bindingProperty2 | pipe1 | ...',
   *     ...
   *   }
   * }
   * ```
   *
   *
   * ## Basic Property Binding:
   *
   * ```
   * @Decorator({
   *   selector: '[tooltip]',
   *   bind: {
   *     'tooltipText': 'tooltip'
   *   }
   * })
   * class Tooltip {
   *   set tooltipText(text) {
   *     // This will get called every time the 'tooltip' binding changes with the new value.
   *   }
   * }
   * ```
   *
   * As used in this example:
   *
   * ```html
   * <div [tooltip]="someExpression">
   * ```
   *
   * Whenever the `someExpression` expression changes, the `bind` declaration instructs Angular to update the
   * `Tooltip`'s `tooltipText` property.
   *
   *
   * Similarly in this example:
   *
   * ```html
   * <div tooltip="Some Text">
   * ```
   *
   * The `Tooltip`'s `tooltipText` property gets initialized to the `Some Text` literal.
   *
   *
   * ## Bindings With Pipes:
   *
   * ```
   * @Decorator({
   *   selector: '[class-set]',
   *   bind: {
   *     'classChanges': 'classSet | keyValDiff'
   *   }
   * })
   * class ClassSet {
   *   set classChanges(changes:KeyValueChanges) {
   *     // This will get called every time the `class-set` expressions changes its structure.
   *   }
   * }
   * ```
   *
   * As used in this example:
   *
   * ```html
   * <div [class-set]="someExpression">
   * ```
   *
   * In the above example, the `ClassSet` uses the `keyValDiff` [Pipe] for watching structural changes. This means that
   * the `classChanges` setter gets invoked if the expression changes to a different reference, or if the
   * structure of the expression changes. (Shallow property watching of the object)
   *
   * NOTE: The `someExpression` can also contain its own [Pipe]s. In this case, the two pipes compose as if they were
   * inlined.
   *
   */
  bind:any; //  StringMap

  /**
   * Specifies which DOM events the directive listens to and what the action should be when they occur.
   *
   * The `events` property defines a set of `event` to `method` key-value pairs:
   *
   * - `event1` specifies the DOM event that the directive listens to.
   * - `onMethod1` specifies the method to execute when the event occurs.
   *
   *
   * ## Syntax
   *
   * ```
   * @Directive({
   *   events: {
   *     'event1': 'onMethod1',
   *     ...
   *   }
   * }
   * ```
   *
   * ## Basic Event Binding:
   *
   * ```
   * @Decorator({
   *   selector: 'input',
   *   events: {
   *     'change': 'onChange'
   *   }
   * })
   * class InputDecorator {
   *   onChange(event:Event) {
   *     // invoked whenever the DOM element fires the 'change' event.
   *   }
   * }
   * ```
   *
   */
  events:any; //  StringMap

  /**
   * Specifies a set of lifecycle events in which the directive participates.
   *
   * See: [onChange], [onDestroy] for details.
   */
  lifecycle:List; //List<LifecycleEvent>

  @CONST()
  constructor({
      selector,
      bind,
      events,
      lifecycle
    }:{
      selector:string,
      bind:any,
      events: any,
      lifecycle:List
    }={})
  {
    super();
    this.selector = selector;
    this.bind = bind;
    this.events = events;
    this.lifecycle = lifecycle;
  }

  /**
   * Returns true if a directive participates in a given [LifecycleEvent].
   */
  hasLifecycleHook(hook:string):boolean {
    return isPresent(this.lifecycle) ? ListWrapper.contains(this.lifecycle, hook) : false;
  }
}

/**
 * Components are angular directives with Shadow DOM views.
 *
 * Componests are used to encapsulate state and template into reusable building blocks. An angular component requires
 * an `@Component` and at least one `@Template` annotation (see [Template] for more datails.) Components instances are
 * used as the context for evaluation of the Shadow DOM view.
 *
 * Restrictions:
 * - Thre can anly be one component per DOM element.
 *
 * ## Example
 *     @Component({
 *       selector: 'greet'
 *     })
 *     @Template({
 *       inline: 'Hello {{name}}'
 *     })
 *     class Greet {
 *       name: string;
 *
 *       constructor() {
 *         this.name = 'World';
 *       }
 *     }
 *
 * @publicModule angular2/annotations
 */
export class Component extends Directive {
  /**
   * Defines the set of injectables that are visible to a Component and its children.
   *
   * When a [Component] defines [injectables], Angular creates a new application-level [Injector] for the component
   * and its children. Injectables are defined as a list of [Binding]s, (or as [Type]s as short hand). These bindings
   * are passed to the [Injector] constructor when making a new child [Injector]. The injectables are available for
   * all child directives of the Component (but not the declaring component's light DOM directives).
   *
   * ## Example
   *     // Example of a class which we would like to inject.
   *     class Greeter {
   *        salutation:string;
   *
   *        constructor(salutation:string) {
   *          this.salutation = salutation;
   *        }
   *
   *        greet(name:string) {
   *          return this.salutation + ' ' + name + '!';
   *        }
   *     }
   *
   *     @Component({
   *       selector: 'greet',
   *       services: [
   *         bind(String).toValue('Hello'), // Configure injection of string
   *         Greeter // Make Greeter available for injection
   *       ]
   *     })
   *     @Template({
   *       inline: '<child></child>',
   *       directives: Child
   *     })
   *     class Greet {
   *       greeter: Greeter;
   *
   *       constructor(greeter: Greeter) {
   *         // Greeter can be injected here becouse it was declared as injectable
   *         // in this component, or parent component.
   *         this.greeter = greeter;
   *       }
   *     }
   *
   *     @Decorator({
   *       selector: 'child'
   *     })
   *     class Child {
   *       greeter: Greeter;
   *
   *       constructor(greeter: Greeter) {
   *         // Greeter can be injected here becouse it was declared as injectable
   *         // in a an ancestor component.
   *         this.greeter = greeter;
   *       }
   *     }
   *
   *
   * Let's look at the [services] part of the example above.
   *
   *     services: [
   *         bind(String).toValue('Hello'),
   *         Greeter
   *     ]
   *
   * Here the `Greeter` is a short hand for `bind(Greeter).toClass(Greeter)`. See [bind] DSL for more details.
   */
  services:List;

@CONST()
  constructor({
    selector,
    bind,
    events,
    services,
    lifecycle
    }:{
      selector:String,
      bind:Object,
      events:Object,
      services:List,
      lifecycle:List
    }={})
  {
    super({
      selector: selector,
      bind: bind,
      events: events,
      lifecycle: lifecycle
    });

    this.services = services;
  }
}

/**
 * Decorators allow attaching behavior to DOM elements in a composable manner.
 *
 * Decorators:
 * - are simplest form of [Directive]s.
 * - are besed used as compostinion pattern ()
 *
 * Decoraters differ from [Component]s in that they:
 * - can have any number of decorators per element
 * - do not create their own evaluation context
 * - do not have template (and therefor do not create Shadow DOM)
 *
 * ## Example
 *
 * Let's say we would like to add tool-tip behavior to any alement.
 *
 * ```
 * <div tooltip="some text here"></div>
 * ```
 *
 * We could have a decorator directive like so:
 *
 * ```
 * @Decorator({
 *   selector: '[tooltip]',
 *   bind: {
 *     'text': 'tooltip'
 *   },
 *   event: {
 *     'onmouseenter': 'onMouseEnter',
 *     'onmouseleave': 'onMouseLeave'
 *   }
 * })
 * class Tooltip{
 *   text:string;
 *   overlay:Overlay; // NOT YET IMPLEMENTED
 *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
 *
 *   constructor(overlayManager:OverlayManager) {
 *     this.overlay = overlay;
 *   }
 *
 *   onMouseEnter() {
 *     // exact signature to be determined
 *     this.overlay = this.overlayManager.open(text, ...);
 *   }
 *
 *   onMouseLeave() {
 *     this.overlay.close();
 *     this.overlay = null;
 *   }
 * }
 * ```
 * @publicModule angular2/annotations
 */
export class DynamicComponent extends Directive {
  services:any; //List;

  @CONST()
  constructor({
    selector,
    bind,
    events,
    services,
    lifecycle
    }:{
      selector:string,
      bind:Object,
      events:Object,
      services:List,
      lifecycle:List
    }={}) {
    super({
      selector: selector,
      bind: bind,
      events: events,
      lifecycle: lifecycle
    });

    this.services = services;
  }
}

/**
 * @publicModule angular2/angular2
 */
export class Decorator extends Directive {
  compileChildren: boolean;
  @CONST()
  constructor({
      selector,
      bind,
      events,
      lifecycle,
      compileChildren = true,
    }:{
      selector:string,
      bind:any,
      events:any,
      lifecycle:List,
      compileChildren:boolean
    }={})
  {
    this.compileChildren = compileChildren;
    super({
        selector: selector,
        bind: bind,
        events: events,
        lifecycle: lifecycle
    });
  }
}

/**
 * Viewport is used for controlling the instatiation of inline templates.
 *
 * Viewport consist of a controller which can inject [ViewContainer]. A [ViewContainer] rerpsents a location in the
 * current view where child views can be inserted.
 *
 * ## Example
 *
 * Given folowing inline template, let's implement the `unless` behavior.
 *
 * ```
 * <ul>
 *   <li *unless="expr"></li>
 * </ul>
 * ```
 *
 * Can be implemented using:
 *
 * ```
 * @Viewport({
 *   selector: '[unless]',
 *   bind: {
 *     'condition': 'unless'
 *   }
 * })
 * export class If {
 *   viewContainer: ViewContainer;
 *   prevCondition: boolean;
 *
 *   constructor(viewContainer: ViewContainer) {
 *     this.viewContainer = viewContainer;
 *     this.prevCondition = null;
 *   }
 *
 *   set condition(newCondition) {
 *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
 *       this.prevCondition = true;
 *       this.viewContainer.clear();
 *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
 *       this.prevCondition = false;
 *       this.viewContainer.create();
 *     }
 *   }
 * }
 * ```
 *
 *
 * @publicModule angular2/annotations
 */
export class Viewport extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      events,
      lifecycle
    }:{
      selector:string,
      bind:any,
      lifecycle:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        events: events,
        lifecycle: lifecycle
    });
  }
}

//TODO(misko): turn into LifecycleEvent class once we switch to TypeScript;

/**
 * Specify that a directive should be notified whenever a [View] that contains it is destroyed.
 *
 * ## Example
 *
 * ```
 * @Decorator({
 *   ...,
 *   lifecycle: [ onDestroy ]
 * })
 * class ClassSet implements OnDestroy {
 *   onDestroy() {
 *     // invoked to notify directive of the containing view destruction.
 *   }
 * }
 * ```
 * @publicModule angular2/annotations
 */
export const onDestroy = "onDestroy";


/**
 * Specify that a directive should be notified when any of its bindings have changed.
 *
 * ## Example:
 *
 * ```
 * @Decorator({
 *   selector: '[class-set]',
 *   bind: {
 *     'propA': 'propA'
 *     'propB': 'propB'
 *   }
 * })
 * class ClassSet {
 *   propA;
 *   propB;
 *   onChange(changes:{[idx: string, PropertyUpdate]}) {
 *     // This will get called after any of the properties have been updated.
 *     if (changes['propA']) {
 *       // if propA was updated
 *     }
 *     if (changes['propA']) {
 *       // if propB was updated
 *     }
 *   }
 * }
 *  ```
 * @publicModule angular2/annotations
 */
export const onChange = "onChange";

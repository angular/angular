import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';
import {Injectable} from 'angular2/di';

// type StringMap = {[idx: string]: string};

/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * Directive is an abstract concept, instead use concrete directives: [Component], [DynamicComponent], [Decorator] 
 * or [Viewport].
 *
 * A directive consists of a single directive annotation and a controller class. When the directive's [selector] matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the [ElementInjector] attempts to resolve the directive's constructor arguments.
 * 2. Angular instantiates directives for each matched element using [ElementInjector].
 *
 * ## Understanding How Injection Works
 * 
 * There are three stages of injection resolution.
 * - *Pre-existing Injectors*: 
 *   - The terminal [Injector] cannot resolve dependencies. It either throws an error or, if the dependency was 
 *     specified as `@Optional`, returns `null`.
 *   - The primordial injector resolves browser singleton resources, such as: cookies, title, location, and others.
 * - *Component Injectors*: Each `@Component` has its own [Injector], and they follow the same parent-child hierachy 
 *     as the components in the DOM.
 * - *Element Injectors*: Each component has a Shadow DOM. Within the Shadow DOM each element has an [ElementInjector] 
 *  which follow the same parent-child hiercachy as the DOM elements themselves.
 * 
 * When resolving dependencies, the current injector is asked to resolve the dependency first, and if it does not 
 * have it, it delegates to the parent injector. 
 * 
 * Angular then resolves dependencies as follows, according to the order in which they appear in the [View]:
 * 
 * 1. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
 * 2. Dependencies on component injectors and their parents until it encounters the root component
 * 3. Dependencies on pre-existing injectors
 * 
 * 
 * The [ElementInjector] can inject other directives, element-specific special objects, or can delegate to the parent 
 * injector.
 * 
 * To inject other directives, declare the constructor parameter as:
 *    - `directive:DirectiveType`: a directive on the current element only
 *    - `@Ancestor() d:Type`: any directive that matches the type between the current element (excluded) and the Shadow DOM root [TODO: what does (excluded) mean? Does this apply to the @Parent annotation also?]
 *    - `@Parent() d:Type`: any directive that matches the type on a direct parent element only
 *    - `@Children query:Query<Type>`: A live collection of direct child directives
 *    - `@Descendants query:Query<Type>`: A live collection of any child directives
 * 
 * To inject element-specific special objects, declare the constructor parameter as:
 *    - `element: NgElement` to obtain a DOM element (DEPRECATED: replacment coming)
 *    - `viewContainer: ViewContainer` to control child template instantiation, for [Viewport] directives only
 *    - `bindingPropagation: BindingPropagation` to control change detection in a more granular way
 * 
 * ## Example
 *
 * The following example demonstrates how dependency injection resolves constructor arguments in practice.
 *
 *
 * Assume this HTML structure:
 *
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div dependency="3" my-directive>
 *       <div dependency="4">
 *         <div dependency="5"></div>
 *       </div>
 *       <div dependency="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `dependency` decorator and `SomeService` injectable class.
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Decorator({
 *   selector: '[dependency]',
 *   bind: {
 *     'id':'dependency'
 *   }
 * })
 * class Dependency {
 *   id:string;
 * }
 * ```
 *
 * Let's step through the different ways in which `MyDirective` could be declared...
 *
 * ### No injection
 *
 * Here the constructor is declared with no arguments, so nothing is injected into `MyDirective`.
 *
 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor() {
 *   }
 * }
 * ```
 *
 * This directive would return nothing for the example code above. [TODO: True? We spent a lot of time talking about 
 * errors but in this case, there's nothing to error on, right? I don't understand the diff between "returns" and "injects" 
 * when the example is showing a directive not the template. Which is the correct verb?]
 *
 * ### Component-level injection
 *
 * Directives can inject any injectable instance from the closest component injector or any of its parents.
 *
 * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type from the parent
 * component's injector.
 *
 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(someService: SomeService) {
 *   }
 * }
 * ```
 *
 * This directive would return `dependency=3` for the example code above. [TODO: True? Is "return" the right verb?]
 * 
 * ### Injecting a directive from the current element
 *
 * Directives can inject other directives declared on the current element.
 *
 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 * This directive would also return `dependency=3` for the example code above. [TODO: True? Why is this the same?]
 * 
 *
 * ### Injecting a directive from a direct parent element
 *
 * Directives can inject other directives declared on a direct parent element. By definition, a directive with a 
 * `@Parent` annotation does not attempt to resolve dependencies for the current element, even if this would satisfy
 * the dependency. [TODO: did I get the subject/verb right?]
 *
 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Parent() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 * This directive would return `dependency=2` for the example code above. [TODO: True?]
 * 
 * ### Injecting a directive from any ancestor elements
 *
 * Directives can inject other directives declared on any ancestor element, i.e. on the parent element and its parents.  
 * By definition, a directive with an `@Ancestor` annotation does not attempt to resolve dependencies for the current 
 * element, even if this would satisfy the dependency. [TODO: did I get the subject/verb right? ]
 *
 *  Unlike the `@Parent` which only checks the parent `@Ancestor` checks the parent, as well as its
 * parents recursivly. If `dependency="2"` would not be present this injection would return `dependency="1"`.

 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Ancestor() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 * 
 * This directive would also return `dependency=2` for the example code above. If `dependency=2` hadn't been declared 
 * on the parent `div`, this directive would return `d[TODO: True?]
 *
 * ### Injecting query of child directives. [PENDING IMPLEMENTATION]
 *
 * In some cases the directive may be interersted in injecting its child directives. This is not directly possible
 * since parent directives are guarteed to be created before child directives. Instead we can injecto a container
 * which can than be filled once the data is needed.
 *
 * ```
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Children() dependencys:Query<Maker>) {
 *     // dependencys will eventuall contain: [4, 6]
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
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Children() dependencys:Query<Maker>) {
 *     // dependencys will eventuall contain: [4, 5, 6]
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
 * @Decorator({ selector: '[my-directive]' })
 * class MyDirective {
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
 * DynamicComponents allow loading child components impretivly.
 * 
 * A Component can be made of other compontents. This recursive nature must be resolved synchronously during the 
 * component template processing. This means that all templates are resolved synchronously. This prevents lazy loading
 * of code or delayed binding of views to the components. 
 * 
 * A DynamicComponent is a placeholder into which a regular component can be loaded imperativly and thus breaking
 * the all components must be resolved synchronously restriction. Once loaded the component is premanent.
 * 
 * 
 * ## Example
 * @DynamicComponent({
 *   selector: 'dynamic-comp'
 * })
 * class DynamicComp {
 *   done;
 *   constructor(loader:PrivateComponentLoader, location:PrivateComponentLocation) {
 *     this.done = loader.load(HelloCmp, location);
 *   }
 * }
 * 
 * @Component({
 *   selector: 'hello-cmp'
 * })
 * @Template({
 *   inline: "{{greeting}}"
 * })
 * class HelloCmp {
 *   greeting:string;
 *   constructor() {
 *     this.greeting = "hello";
 *   }
 * }
 * 
 * 
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

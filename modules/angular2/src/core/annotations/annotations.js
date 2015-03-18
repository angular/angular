import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';
import {Injectable} from 'angular2/di';

// type StringMap = {[idx: string]: string};

/**
 * Directives allow you to attach behavior to the DOM elements.
 *
 * Directive is an abstract concept, instead use concrete directives such as: [Component], [Decorator] or [Viewport].
 * @publicModule angular2/angular2
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
   * Specifies which DOM events the directive listens to and what the action should be.
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
   */
  lifecycle:any; //List<LifecycleEvent>

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

  hasLifecycleHook(hook:string):boolean {
    return isPresent(this.lifecycle) ? ListWrapper.contains(this.lifecycle, hook) : false;
  }
}

/**
 * @publicModule angular2/angular2
 */
export class Component extends Directive {
  //TODO: vsavkin: uncomment it once the issue with defining fields in a sublass works
  services:any; //List;

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
 * @publicModule angular2/angular2
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
 * @publicModule angular2/angular2
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
 * @publicModule angular2/angular2
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
 * @publicModule angular2/angular2
 */
export const onChange = "onChange";

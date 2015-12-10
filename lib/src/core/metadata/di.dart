library angular2.src.core.metadata.di;

import "package:angular2/src/facade/lang.dart"
    show Type, stringify, isPresent, isString;
import "package:angular2/src/core/di.dart" show resolveForwardRef;
import "package:angular2/src/core/di/metadata.dart" show DependencyMetadata;

/**
 * Specifies that a constant attribute value should be injected.
 *
 * The directive can inject constant string literals of host element attributes.
 *
 * ### Example
 *
 * Suppose we have an `<input>` element and want to know its `type`.
 *
 * ```html
 * <input type="text">
 * ```
 *
 * A decorator can inject string literal `text` like so:
 *
 * ```javascript
 * @Directive({
 *   selector: `input'
 * })
 * class InputDirective {
 *   constructor(@Attribute('type') type) {
 *     // type would be `text` in this example
 *   }
 * }
 * ```
 */
class AttributeMetadata extends DependencyMetadata {
  final String attributeName;
  const AttributeMetadata(this.attributeName) : super();
  AttributeMetadata get token {
    // Normally one would default a token to a type of an injected value but here

    // the type of a variable is "string" and we can't use primitive type as a return value

    // so we use instance of Attribute instead. This doesn't matter much in practice as arguments

    // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into

    // account.
    return this;
  }

  String toString() {
    return '''@Attribute(${ stringify ( this . attributeName )})''';
  }
}

/**
 * Declares an injectable parameter to be a live list of directives or variable
 * bindings from the content children of a directive.
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 *
 * Assume that `<tabs>` component would like to get a list its children `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ngFor="#o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * The preferred solution is to query for `Pane` directives using this decorator.
 *
 * ```javascript
 * @Component({
 *   selector: 'pane',
 *   inputs: ['title']
 * })
 * class Pane {
 *   title:string;
 * }
 *
 * @Component({
 *  selector: 'tabs',
 *  template: `
 *    <ul>
 *      <li *ngFor="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <content></content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>;
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
  *    this.panes = panes;
  *  }
 * }
 * ```
 *
 * A query can look for variable bindings by passing in a string with desired binding symbol.
 *
 * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
 * ```html
 * <seeker>
 *   <div #findme>...</div>
 * </seeker>
 *
 * @Component({ selector: 'seeker' })
 * class Seeker {
 *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * In this case the object that is injected depend on the type of the variable
 * binding. It can be an ElementRef, a directive or a component.
 *
 * Passing in a comma separated list of variable bindings will query for all of them.
 *
 * ```html
 * <seeker>
 *   <div #find-me>...</div>
 *   <div #find-me-too>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'seeker'
 * })
 * class Seeker {
 *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * Configure whether query looks for direct children or all descendants
 * of the querying element, by using the `descendants` parameter.
 * It is set to `false` by default.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
 * ```html
 * <container #first>
 *   <item>a</item>
 *   <item>b</item>
 *   <container #second>
 *     <item>c</item>
 *   </container>
 * </container>
 * ```
 *
 * When querying for items, the first container will see only `a` and `b` by default,
 * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
 *
 * The queried directives are kept in a depth-first pre-order with respect to their
 * positions in the DOM.
 *
 * Query does not look deep into any subcomponent views.
 *
 * Query is updated as part of the change-detection cycle. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 * The injected object is an unmodifiable live list.
 * See [QueryList] for more details.
 */
class QueryMetadata extends DependencyMetadata {
  final dynamic /* Type | String */ _selector;
  /**
   * whether we want to query only direct children (false) or all
   * children (true).
   */
  final bool descendants;
  final bool first;
  const QueryMetadata(this._selector, {descendants: false, first: false})
      : descendants = descendants,
        first = first,
        super();
  /**
   * always `false` to differentiate it with [ViewQueryMetadata].
   */
  bool get isViewQuery {
    return false;
  }

  /**
   * what this is querying for.
   */
  get selector {
    return resolveForwardRef(this._selector);
  }

  /**
   * whether this is querying for a variable binding or a directive.
   */
  bool get isVarBindingQuery {
    return isString(this.selector);
  }

  /**
   * returns a list of variable bindings this is querying for.
   * Only applicable if this is a variable bindings query.
   */
  List<String> get varBindings {
    return this.selector.split(",");
  }

  String toString() {
    return '''@Query(${ stringify ( this . selector )})''';
  }
}
// TODO: add an example after ContentChildren and ViewChildren are in master

/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
 *
 *   ngAfterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
class ContentChildrenMetadata extends QueryMetadata {
  const ContentChildrenMetadata(dynamic /* Type | String */ _selector,
      {descendants: false})
      : super(_selector, descendants: descendants);
}
// TODO: add an example after ContentChild and ViewChild are in master

/**
 * Configures a content query.
 *
 * Content queries are set before the `ngAfterContentInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Directive({
 *   selector: 'someDir'
 * })
 * class SomeDir {
 *   @ContentChild(ChildDirective) contentChild;
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
class ContentChildMetadata extends QueryMetadata {
  const ContentChildMetadata(dynamic /* Type | String */ _selector)
      : super(_selector, descendants: true, first: true);
}

/**
 * Similar to [QueryMetadata], but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({...})
 * @View({
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @Query(Item) items:QueryList<Item>) {
 *     items.onChange(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as [QueryMetadata], except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a [QueryList] should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See [QueryList] for more details.
 */
class ViewQueryMetadata extends QueryMetadata {
  const ViewQueryMetadata(dynamic /* Type | String */ _selector,
      {descendants: false, first: false})
      : super(_selector, descendants: descendants, first: first);
  /**
   * always `true` to differentiate it with [QueryMetadata].
   */
  get isViewQuery {
    return true;
  }

  String toString() {
    return '''@ViewQuery(${ stringify ( this . selector )})''';
  }
}

/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChildren(ItemDirective) viewChildren: QueryList<ItemDirective>;
 *
 *   ngAfterViewInit() {
 *     // viewChildren is set
 *   }
 * }
 * ```
 */
class ViewChildrenMetadata extends ViewQueryMetadata {
  const ViewChildrenMetadata(dynamic /* Type | String */ _selector)
      : super(_selector, descendants: true);
}

/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChild(ItemDirective) viewChild:ItemDirective;
 *
 *   ngAfterViewInit() {
 *     // viewChild is set
 *   }
 * }
 * ```
 */
class ViewChildMetadata extends ViewQueryMetadata {
  const ViewChildMetadata(dynamic /* Type | String */ _selector)
      : super(_selector, descendants: true, first: true);
}

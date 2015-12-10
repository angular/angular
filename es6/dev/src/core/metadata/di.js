var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST, stringify, isString } from 'angular2/src/facade/lang';
import { resolveForwardRef } from 'angular2/src/core/di';
import { DependencyMetadata } from 'angular2/src/core/di/metadata';
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
export let AttributeMetadata = class extends DependencyMetadata {
    constructor(attributeName) {
        super();
        this.attributeName = attributeName;
    }
    get token() {
        // Normally one would default a token to a type of an injected value but here
        // the type of a variable is "string" and we can't use primitive type as a return value
        // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
        // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
        // account.
        return this;
    }
    toString() { return `@Attribute(${stringify(this.attributeName)})`; }
};
AttributeMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], AttributeMetadata);
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
 * See {@link QueryList} for more details.
 */
export let QueryMetadata = class extends DependencyMetadata {
    constructor(_selector, { descendants = false, first = false } = {}) {
        super();
        this._selector = _selector;
        this.descendants = descendants;
        this.first = first;
    }
    /**
     * always `false` to differentiate it with {@link ViewQueryMetadata}.
     */
    get isViewQuery() { return false; }
    /**
     * what this is querying for.
     */
    get selector() { return resolveForwardRef(this._selector); }
    /**
     * whether this is querying for a variable binding or a directive.
     */
    get isVarBindingQuery() { return isString(this.selector); }
    /**
     * returns a list of variable bindings this is querying for.
     * Only applicable if this is a variable bindings query.
     */
    get varBindings() { return this.selector.split(','); }
    toString() { return `@Query(${stringify(this.selector)})`; }
};
QueryMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], QueryMetadata);
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
export let ContentChildrenMetadata = class extends QueryMetadata {
    constructor(_selector, { descendants = false } = {}) {
        super(_selector, { descendants: descendants });
    }
};
ContentChildrenMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ContentChildrenMetadata);
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
export let ContentChildMetadata = class extends QueryMetadata {
    constructor(_selector) {
        super(_selector, { descendants: true, first: true });
    }
};
ContentChildMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], ContentChildMetadata);
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
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
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
export let ViewQueryMetadata = class extends QueryMetadata {
    constructor(_selector, { descendants = false, first = false } = {}) {
        super(_selector, { descendants: descendants, first: first });
    }
    /**
     * always `true` to differentiate it with {@link QueryMetadata}.
     */
    get isViewQuery() { return true; }
    toString() { return `@ViewQuery(${stringify(this.selector)})`; }
};
ViewQueryMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object, Object])
], ViewQueryMetadata);
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
export let ViewChildrenMetadata = class extends ViewQueryMetadata {
    constructor(_selector) {
        super(_selector, { descendants: true });
    }
};
ViewChildrenMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], ViewChildrenMetadata);
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
export let ViewChildMetadata = class extends ViewQueryMetadata {
    constructor(_selector) {
        super(_selector, { descendants: true, first: true });
    }
};
ViewChildMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], ViewChildMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6WyJBdHRyaWJ1dGVNZXRhZGF0YSIsIkF0dHJpYnV0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQXR0cmlidXRlTWV0YWRhdGEudG9rZW4iLCJBdHRyaWJ1dGVNZXRhZGF0YS50b1N0cmluZyIsIlF1ZXJ5TWV0YWRhdGEiLCJRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiUXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlF1ZXJ5TWV0YWRhdGEuc2VsZWN0b3IiLCJRdWVyeU1ldGFkYXRhLmlzVmFyQmluZGluZ1F1ZXJ5IiwiUXVlcnlNZXRhZGF0YS52YXJCaW5kaW5ncyIsIlF1ZXJ5TWV0YWRhdGEudG9TdHJpbmciLCJDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSIsIkNvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29udGVudENoaWxkTWV0YWRhdGEiLCJDb250ZW50Q2hpbGRNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdRdWVyeU1ldGFkYXRhIiwiVmlld1F1ZXJ5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJWaWV3UXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlZpZXdRdWVyeU1ldGFkYXRhLnRvU3RyaW5nIiwiVmlld0NoaWxkcmVuTWV0YWRhdGEiLCJWaWV3Q2hpbGRyZW5NZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdDaGlsZE1ldGFkYXRhIiwiVmlld0NoaWxkTWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsS0FBSyxFQUFRLFNBQVMsRUFBYSxRQUFRLEVBQUMsTUFBTSwwQkFBMEI7T0FDN0UsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQjtPQUMvQyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCO0FBRWhFOzs7Ozs7Ozs7Ozs7Ozs7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aXNQcmVzZW50LCBpc1N0cmluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7RGVwZW5kZW5jeU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6IGBpbnB1dCdcbiAqIH0pXG4gKiBjbGFzcyBJbnB1dERpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ3R5cGUnKSB0eXBlKSB7XG4gKiAgICAgLy8gdHlwZSB3b3VsZCBiZSBgdGV4dGAgaW4gdGhpcyBleGFtcGxlXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEF0dHJpYnV0ZU1ldGFkYXRhIGV4dGVuZHMgRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgeyBzdXBlcigpOyB9XG5cbiAgZ2V0IHRva2VuKCkge1xuICAgIC8vIE5vcm1hbGx5IG9uZSB3b3VsZCBkZWZhdWx0IGEgdG9rZW4gdG8gYSB0eXBlIG9mIGFuIGluamVjdGVkIHZhbHVlIGJ1dCBoZXJlXG4gICAgLy8gdGhlIHR5cGUgb2YgYSB2YXJpYWJsZSBpcyBcInN0cmluZ1wiIGFuZCB3ZSBjYW4ndCB1c2UgcHJpbWl0aXZlIHR5cGUgYXMgYSByZXR1cm4gdmFsdWVcbiAgICAvLyBzbyB3ZSB1c2UgaW5zdGFuY2Ugb2YgQXR0cmlidXRlIGluc3RlYWQuIFRoaXMgZG9lc24ndCBtYXR0ZXIgbXVjaCBpbiBwcmFjdGljZSBhcyBhcmd1bWVudHNcbiAgICAvLyB3aXRoIEBBdHRyaWJ1dGUgYW5ub3RhdGlvbiBhcmUgaW5qZWN0ZWQgYnkgRWxlbWVudEluamVjdG9yIHRoYXQgZG9lc24ndCB0YWtlIHRva2VucyBpbnRvXG4gICAgLy8gYWNjb3VudC5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBBdHRyaWJ1dGUoJHtzdHJpbmdpZnkodGhpcy5hdHRyaWJ1dGVOYW1lKX0pYDsgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gICogICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICAqICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZC1tZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZC1tZS10b28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAvKipcbiAgICogd2hldGhlciB3ZSB3YW50IHRvIHF1ZXJ5IG9ubHkgZGlyZWN0IGNoaWxkcmVuIChmYWxzZSkgb3IgYWxsXG4gICAqIGNoaWxkcmVuICh0cnVlKS5cbiAgICovXG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZyxcbiAgICAgICAgICAgICAge2Rlc2NlbmRhbnRzID0gZmFsc2UsIGZpcnN0ID0gZmFsc2V9OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCBmaXJzdD86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZGVzY2VuZGFudHMgPSBkZXNjZW5kYW50cztcbiAgICB0aGlzLmZpcnN0ID0gZmlyc3Q7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGBmYWxzZWAgdG8gZGlmZmVyZW50aWF0ZSBpdCB3aXRoIHtAbGluayBWaWV3UXVlcnlNZXRhZGF0YX0uXG4gICAqL1xuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8qKlxuICAgKiB3aGF0IHRoaXMgaXMgcXVlcnlpbmcgZm9yLlxuICAgKi9cbiAgZ2V0IHNlbGVjdG9yKCkgeyByZXR1cm4gcmVzb2x2ZUZvcndhcmRSZWYodGhpcy5fc2VsZWN0b3IpOyB9XG5cbiAgLyoqXG4gICAqIHdoZXRoZXIgdGhpcyBpcyBxdWVyeWluZyBmb3IgYSB2YXJpYWJsZSBiaW5kaW5nIG9yIGEgZGlyZWN0aXZlLlxuICAgKi9cbiAgZ2V0IGlzVmFyQmluZGluZ1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gaXNTdHJpbmcodGhpcy5zZWxlY3Rvcik7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3MgdGhpcyBpcyBxdWVyeWluZyBmb3IuXG4gICAqIE9ubHkgYXBwbGljYWJsZSBpZiB0aGlzIGlzIGEgdmFyaWFibGUgYmluZGluZ3MgcXVlcnkuXG4gICAqL1xuICBnZXQgdmFyQmluZGluZ3MoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5zZWxlY3Rvci5zcGxpdCgnLCcpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAUXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLy8gVE9ETzogYWRkIGFuIGV4YW1wbGUgYWZ0ZXIgQ29udGVudENoaWxkcmVuIGFuZCBWaWV3Q2hpbGRyZW4gYXJlIGluIG1hc3RlclxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29udGVudENoaWxkcmVuTWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHMgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogZGVzY2VuZGFudHN9KTtcbiAgfVxufVxuXG4vLyBUT0RPOiBhZGQgYW4gZXhhbXBsZSBhZnRlciBDb250ZW50Q2hpbGQgYW5kIFZpZXdDaGlsZCBhcmUgaW4gbWFzdGVyXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGQ7XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb250ZW50Q2hpbGRNZXRhZGF0YSBleHRlbmRzIFF1ZXJ5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3Rvcihfc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpIHsgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IHRydWUsIGZpcnN0OiB0cnVlfSk7IH1cbn1cblxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBRdWVyeShJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5vbkNoYW5nZSgoKSA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU3VwcG9ydHMgdGhlIHNhbWUgcXVlcnlpbmcgcGFyYW1ldGVycyBhcyB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGV4Y2VwdFxuICogYGRlc2NlbmRhbnRzYC4gVGhpcyBhbHdheXMgcXVlcmllcyB0aGUgd2hvbGUgdmlldy5cbiAqXG4gKiBBcyBgc2hvd25gIGlzIGZsaXBwZWQgYmV0d2VlbiB0cnVlIGFuZCBmYWxzZSwgaXRlbXMgd2lsbCBjb250YWluIHplcm8gb2Ygb25lXG4gKiBpdGVtcy5cbiAqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIHtAbGluayBRdWVyeUxpc3R9IHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIGl0ZXJhYmxlIGFuZCBvYnNlcnZhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFZpZXdRdWVyeU1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZyxcbiAgICAgICAgICAgICAge2Rlc2NlbmRhbnRzID0gZmFsc2UsIGZpcnN0ID0gZmFsc2V9OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCBmaXJzdD86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogZGVzY2VuZGFudHMsIGZpcnN0OiBmaXJzdH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGFsd2F5cyBgdHJ1ZWAgdG8gZGlmZmVyZW50aWF0ZSBpdCB3aXRoIHtAbGluayBRdWVyeU1ldGFkYXRhfS5cbiAgICovXG4gIGdldCBpc1ZpZXdRdWVyeSgpIHsgcmV0dXJuIHRydWU7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAVmlld1F1ZXJ5KCR7c3RyaW5naWZ5KHRoaXMuc2VsZWN0b3IpfSlgOyB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkcmVuKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZHJlbjogUXVlcnlMaXN0PEl0ZW1EaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld0NoaWxkcmVuTWV0YWRhdGEgZXh0ZW5kcyBWaWV3UXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZX0pOyB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZDpJdGVtRGlyZWN0aXZlO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld0NoaWxkTWV0YWRhdGEgZXh0ZW5kcyBWaWV3UXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZSwgZmlyc3Q6IHRydWV9KTsgfVxufVxuIl19
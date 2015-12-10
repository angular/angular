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
 * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6WyJBdHRyaWJ1dGVNZXRhZGF0YSIsIkF0dHJpYnV0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQXR0cmlidXRlTWV0YWRhdGEudG9rZW4iLCJBdHRyaWJ1dGVNZXRhZGF0YS50b1N0cmluZyIsIlF1ZXJ5TWV0YWRhdGEiLCJRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiUXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlF1ZXJ5TWV0YWRhdGEuc2VsZWN0b3IiLCJRdWVyeU1ldGFkYXRhLmlzVmFyQmluZGluZ1F1ZXJ5IiwiUXVlcnlNZXRhZGF0YS52YXJCaW5kaW5ncyIsIlF1ZXJ5TWV0YWRhdGEudG9TdHJpbmciLCJDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSIsIkNvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29udGVudENoaWxkTWV0YWRhdGEiLCJDb250ZW50Q2hpbGRNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdRdWVyeU1ldGFkYXRhIiwiVmlld1F1ZXJ5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJWaWV3UXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlZpZXdRdWVyeU1ldGFkYXRhLnRvU3RyaW5nIiwiVmlld0NoaWxkcmVuTWV0YWRhdGEiLCJWaWV3Q2hpbGRyZW5NZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdDaGlsZE1ldGFkYXRhIiwiVmlld0NoaWxkTWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsS0FBSyxFQUFRLFNBQVMsRUFBYSxRQUFRLEVBQUMsTUFBTSwwQkFBMEI7T0FDN0UsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQjtPQUMvQyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCO0FBRWhFOzs7Ozs7Ozs7Ozs7Ozs7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LCBpc1N0cmluZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7RGVwZW5kZW5jeU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZU1ldGFkYXRhJ31cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVNZXRhZGF0YSBleHRlbmRzIERlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIGdldCB0b2tlbigpOiBBdHRyaWJ1dGVNZXRhZGF0YSB7XG4gICAgLy8gTm9ybWFsbHkgb25lIHdvdWxkIGRlZmF1bHQgYSB0b2tlbiB0byBhIHR5cGUgb2YgYW4gaW5qZWN0ZWQgdmFsdWUgYnV0IGhlcmVcbiAgICAvLyB0aGUgdHlwZSBvZiBhIHZhcmlhYmxlIGlzIFwic3RyaW5nXCIgYW5kIHdlIGNhbid0IHVzZSBwcmltaXRpdmUgdHlwZSBhcyBhIHJldHVybiB2YWx1ZVxuICAgIC8vIHNvIHdlIHVzZSBpbnN0YW5jZSBvZiBBdHRyaWJ1dGUgaW5zdGVhZC4gVGhpcyBkb2Vzbid0IG1hdHRlciBtdWNoIGluIHByYWN0aWNlIGFzIGFyZ3VtZW50c1xuICAgIC8vIHdpdGggQEF0dHJpYnV0ZSBhbm5vdGF0aW9uIGFyZSBpbmplY3RlZCBieSBFbGVtZW50SW5qZWN0b3IgdGhhdCBkb2Vzbid0IHRha2UgdG9rZW5zIGludG9cbiAgICAvLyBhY2NvdW50LlxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQEF0dHJpYnV0ZSgke3N0cmluZ2lmeSh0aGlzLmF0dHJpYnV0ZU5hbWUpfSlgOyB9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gaW5qZWN0YWJsZSBwYXJhbWV0ZXIgdG8gYmUgYSBsaXZlIGxpc3Qgb2YgZGlyZWN0aXZlcyBvciB2YXJpYWJsZVxuICogYmluZGluZ3MgZnJvbSB0aGUgY29udGVudCBjaGlsZHJlbiBvZiBhIGRpcmVjdGl2ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbFk5bThITHk3ejA2dkRvVWFTTjI/cD1wcmV2aWV3KSlcbiAqXG4gKiBBc3N1bWUgdGhhdCBgPHRhYnM+YCBjb21wb25lbnQgd291bGQgbGlrZSB0byBnZXQgYSBsaXN0IGl0cyBjaGlsZHJlbiBgPHBhbmU+YFxuICogY29tcG9uZW50cyBhcyBzaG93biBpbiB0aGlzIGV4YW1wbGU6XG4gKlxuICogYGBgaHRtbFxuICogPHRhYnM+XG4gKiAgIDxwYW5lIHRpdGxlPVwiT3ZlcnZpZXdcIj4uLi48L3BhbmU+XG4gKiAgIDxwYW5lICpuZ0Zvcj1cIiNvIG9mIG9iamVjdHNcIiBbdGl0bGVdPVwiby50aXRsZVwiPnt7by50ZXh0fX08L3BhbmU+XG4gKiA8L3RhYnM+XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJlZmVycmVkIHNvbHV0aW9uIGlzIHRvIHF1ZXJ5IGZvciBgUGFuZWAgZGlyZWN0aXZlcyB1c2luZyB0aGlzIGRlY29yYXRvci5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYW5lJyxcbiAqICAgaW5wdXRzOiBbJ3RpdGxlJ11cbiAqIH0pXG4gKiBjbGFzcyBQYW5lIHtcbiAqICAgdGl0bGU6c3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAndGFicycsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDx1bD5cbiAqICAgICAgPGxpICpuZ0Zvcj1cIiNwYW5lIG9mIHBhbmVzXCI+e3twYW5lLnRpdGxlfX08L2xpPlxuICogICAgPC91bD5cbiAqICAgIDxjb250ZW50PjwvY29udGVudD5cbiAqICBgXG4gKiB9KVxuICogY2xhc3MgVGFicyB7XG4gKiAgIHBhbmVzOiBRdWVyeUxpc3Q8UGFuZT47XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShQYW5lKSBwYW5lczpRdWVyeUxpc3Q8UGFuZT4pIHtcbiAgKiAgICB0aGlzLnBhbmVzID0gcGFuZXM7XG4gICogIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgcXVlcnkgY2FuIGxvb2sgZm9yIHZhcmlhYmxlIGJpbmRpbmdzIGJ5IHBhc3NpbmcgaW4gYSBzdHJpbmcgd2l0aCBkZXNpcmVkIGJpbmRpbmcgc3ltYm9sLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zVDJqMjVjSDFkVVJBeUJSQ0t4MT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZG1lPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogQENvbXBvbmVudCh7IHNlbGVjdG9yOiAnc2Vla2VyJyB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kbWUnKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgY2FzZSB0aGUgb2JqZWN0IHRoYXQgaXMgaW5qZWN0ZWQgZGVwZW5kIG9uIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZVxuICogYmluZGluZy4gSXQgY2FuIGJlIGFuIEVsZW1lbnRSZWYsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50LlxuICpcbiAqIFBhc3NpbmcgaW4gYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB3aWxsIHF1ZXJ5IGZvciBhbGwgb2YgdGhlbS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kLW1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kLW1lLXRvbz4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzZWVrZXInXG4gKiB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kTWUsIGZpbmRNZVRvbycpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQ29uZmlndXJlIHdoZXRoZXIgcXVlcnkgbG9va3MgZm9yIGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHNcbiAqIG9mIHRoZSBxdWVyeWluZyBlbGVtZW50LCBieSB1c2luZyB0aGUgYGRlc2NlbmRhbnRzYCBwYXJhbWV0ZXIuXG4gKiBJdCBpcyBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93dEdlQjk3N2J2N3F2QTVGVFlsOT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPGNvbnRhaW5lciAjZmlyc3Q+XG4gKiAgIDxpdGVtPmE8L2l0ZW0+XG4gKiAgIDxpdGVtPmI8L2l0ZW0+XG4gKiAgIDxjb250YWluZXIgI3NlY29uZD5cbiAqICAgICA8aXRlbT5jPC9pdGVtPlxuICogICA8L2NvbnRhaW5lcj5cbiAqIDwvY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2hlbiBxdWVyeWluZyBmb3IgaXRlbXMsIHRoZSBmaXJzdCBjb250YWluZXIgd2lsbCBzZWUgb25seSBgYWAgYW5kIGBiYCBieSBkZWZhdWx0LFxuICogYnV0IHdpdGggYFF1ZXJ5KFRleHREaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pYCBpdCB3aWxsIHNlZSBgY2AgdG9vLlxuICpcbiAqIFRoZSBxdWVyaWVkIGRpcmVjdGl2ZXMgYXJlIGtlcHQgaW4gYSBkZXB0aC1maXJzdCBwcmUtb3JkZXIgd2l0aCByZXNwZWN0IHRvIHRoZWlyXG4gKiBwb3NpdGlvbnMgaW4gdGhlIERPTS5cbiAqXG4gKiBRdWVyeSBkb2VzIG5vdCBsb29rIGRlZXAgaW50byBhbnkgc3ViY29tcG9uZW50IHZpZXdzLlxuICpcbiAqIFF1ZXJ5IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiB0aGUgY2hhbmdlLWRldGVjdGlvbiBjeWNsZS4gU2luY2UgY2hhbmdlIGRldGVjdGlvblxuICogaGFwcGVucyBhZnRlciBjb25zdHJ1Y3Rpb24gb2YgYSBkaXJlY3RpdmUsIFF1ZXJ5TGlzdCB3aWxsIGFsd2F5cyBiZSBlbXB0eSB3aGVuIG9ic2VydmVkIGluIHRoZVxuICogY29uc3RydWN0b3IuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiB1bm1vZGlmaWFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUXVlcnlNZXRhZGF0YSBleHRlbmRzIERlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiB3aGV0aGVyIHdlIHdhbnQgdG8gcXVlcnkgb25seSBkaXJlY3QgY2hpbGRyZW4gKGZhbHNlKSBvciBhbGxcbiAgICogY2hpbGRyZW4gKHRydWUpLlxuICAgKi9cbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIGZpcnN0PzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kZXNjZW5kYW50cyA9IGRlc2NlbmRhbnRzO1xuICAgIHRoaXMuZmlyc3QgPSBmaXJzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBhbHdheXMgYGZhbHNlYCB0byBkaWZmZXJlbnRpYXRlIGl0IHdpdGgge0BsaW5rIFZpZXdRdWVyeU1ldGFkYXRhfS5cbiAgICovXG4gIGdldCBpc1ZpZXdRdWVyeSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLyoqXG4gICAqIHdoYXQgdGhpcyBpcyBxdWVyeWluZyBmb3IuXG4gICAqL1xuICBnZXQgc2VsZWN0b3IoKSB7IHJldHVybiByZXNvbHZlRm9yd2FyZFJlZih0aGlzLl9zZWxlY3Rvcik7IH1cblxuICAvKipcbiAgICogd2hldGhlciB0aGlzIGlzIHF1ZXJ5aW5nIGZvciBhIHZhcmlhYmxlIGJpbmRpbmcgb3IgYSBkaXJlY3RpdmUuXG4gICAqL1xuICBnZXQgaXNWYXJCaW5kaW5nUXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiBpc1N0cmluZyh0aGlzLnNlbGVjdG9yKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB0aGlzIGlzIHF1ZXJ5aW5nIGZvci5cbiAgICogT25seSBhcHBsaWNhYmxlIGlmIHRoaXMgaXMgYSB2YXJpYWJsZSBiaW5kaW5ncyBxdWVyeS5cbiAgICovXG4gIGdldCB2YXJCaW5kaW5ncygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnNlbGVjdG9yLnNwbGl0KCcsJyk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBRdWVyeSgke3N0cmluZ2lmeSh0aGlzLnNlbGVjdG9yKX0pYDsgfVxufVxuXG4vLyBUT0RPOiBhZGQgYW4gZXhhbXBsZSBhZnRlciBDb250ZW50Q2hpbGRyZW4gYW5kIFZpZXdDaGlsZHJlbiBhcmUgaW4gbWFzdGVyXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFF1ZXJ5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3Rvcihfc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50cyA9IGZhbHNlfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50c30pO1xuICB9XG59XG5cbi8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZCBhbmQgVmlld0NoaWxkIGFyZSBpbiBtYXN0ZXJcbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbnRlbnRDaGlsZE1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZSwgZmlyc3Q6IHRydWV9KTsgfVxufVxuXG4vKipcbiAqIFNpbWlsYXIgdG8ge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBidXQgcXVlcnlpbmcgdGhlIGNvbXBvbmVudCB2aWV3LCBpbnN0ZWFkIG9mXG4gKiB0aGUgY29udGVudCBjaGlsZHJlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZU5zRkhEZjdZanlNNkl6S3hNMWo/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpdGVtPiBhIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYiA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGMgPC9pdGVtPlxuICogICBgXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBzaG93bjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgQFF1ZXJ5KEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLm9uQ2hhbmdlKCgpID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdXBwb3J0cyB0aGUgc2FtZSBxdWVyeWluZyBwYXJhbWV0ZXJzIGFzIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgZXhjZXB0XG4gKiBgZGVzY2VuZGFudHNgLiBUaGlzIGFsd2F5cyBxdWVyaWVzIHRoZSB3aG9sZSB2aWV3LlxuICpcbiAqIEFzIGBzaG93bmAgaXMgZmxpcHBlZCBiZXR3ZWVuIHRydWUgYW5kIGZhbHNlLCBpdGVtcyB3aWxsIGNvbnRhaW4gemVybyBvZiBvbmVcbiAqIGl0ZW1zLlxuICpcbiAqIFNwZWNpZmllcyB0aGF0IGEge0BsaW5rIFF1ZXJ5TGlzdH0gc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gaXRlcmFibGUgYW5kIG9ic2VydmFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld1F1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIGZpcnN0PzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50cywgZmlyc3Q6IGZpcnN0fSk7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGB0cnVlYCB0byBkaWZmZXJlbnRpYXRlIGl0IHdpdGgge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LlxuICAgKi9cbiAgZ2V0IGlzVmlld1F1ZXJ5KCkgeyByZXR1cm4gdHJ1ZTsgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBWaWV3UXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8SXRlbURpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gdmlld0NoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKSB7IHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlfSk7IH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGQoSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkOkl0ZW1EaXJlY3RpdmU7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gdmlld0NoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRNZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKSB7IHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlLCBmaXJzdDogdHJ1ZX0pOyB9XG59XG4iXX0=
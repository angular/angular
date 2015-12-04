'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var metadata_1 = require('angular2/src/core/di/metadata');
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
var AttributeMetadata = (function (_super) {
    __extends(AttributeMetadata, _super);
    function AttributeMetadata(attributeName) {
        _super.call(this);
        this.attributeName = attributeName;
    }
    Object.defineProperty(AttributeMetadata.prototype, "token", {
        get: function () {
            // Normally one would default a token to a type of an injected value but here
            // the type of a variable is "string" and we can't use primitive type as a return value
            // so we use instance of Attribute instead. This doesn't matter much in practice as arguments
            // with @Attribute annotation are injected by ElementInjector that doesn't take tokens into
            // account.
            return this;
        },
        enumerable: true,
        configurable: true
    });
    AttributeMetadata.prototype.toString = function () { return "@Attribute(" + lang_1.stringify(this.attributeName) + ")"; };
    AttributeMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], AttributeMetadata);
    return AttributeMetadata;
})(metadata_1.DependencyMetadata);
exports.AttributeMetadata = AttributeMetadata;
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
 *   <pane *ng-for="#o of objects" [title]="o.title">{{o.text}}</pane>
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
 *      <li *ng-for="#pane of panes">{{pane.title}}</li>
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
var QueryMetadata = (function (_super) {
    __extends(QueryMetadata, _super);
    function QueryMetadata(_selector, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.first, first = _d === void 0 ? false : _d;
        _super.call(this);
        this._selector = _selector;
        this.descendants = descendants;
        this.first = first;
    }
    Object.defineProperty(QueryMetadata.prototype, "isViewQuery", {
        /**
         * always `false` to differentiate it with {@link ViewQueryMetadata}.
         */
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "selector", {
        /**
         * what this is querying for.
         */
        get: function () { return di_1.resolveForwardRef(this._selector); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "isVarBindingQuery", {
        /**
         * whether this is querying for a variable binding or a directive.
         */
        get: function () { return lang_1.isString(this.selector); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryMetadata.prototype, "varBindings", {
        /**
         * returns a list of variable bindings this is querying for.
         * Only applicable if this is a variable bindings query.
         */
        get: function () { return this.selector.split(','); },
        enumerable: true,
        configurable: true
    });
    QueryMetadata.prototype.toString = function () { return "@Query(" + lang_1.stringify(this.selector) + ")"; };
    QueryMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], QueryMetadata);
    return QueryMetadata;
})(metadata_1.DependencyMetadata);
exports.QueryMetadata = QueryMetadata;
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
var ContentChildrenMetadata = (function (_super) {
    __extends(ContentChildrenMetadata, _super);
    function ContentChildrenMetadata(_selector, _a) {
        var _b = (_a === void 0 ? {} : _a).descendants, descendants = _b === void 0 ? false : _b;
        _super.call(this, _selector, { descendants: descendants });
    }
    ContentChildrenMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], ContentChildrenMetadata);
    return ContentChildrenMetadata;
})(QueryMetadata);
exports.ContentChildrenMetadata = ContentChildrenMetadata;
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
var ContentChildMetadata = (function (_super) {
    __extends(ContentChildMetadata, _super);
    function ContentChildMetadata(_selector) {
        _super.call(this, _selector, { descendants: true, first: true });
    }
    ContentChildMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ContentChildMetadata);
    return ContentChildMetadata;
})(QueryMetadata);
exports.ContentChildMetadata = ContentChildMetadata;
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
var ViewQueryMetadata = (function (_super) {
    __extends(ViewQueryMetadata, _super);
    function ViewQueryMetadata(_selector, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.descendants, descendants = _c === void 0 ? false : _c, _d = _b.first, first = _d === void 0 ? false : _d;
        _super.call(this, _selector, { descendants: descendants, first: first });
    }
    Object.defineProperty(ViewQueryMetadata.prototype, "isViewQuery", {
        /**
         * always `true` to differentiate it with {@link QueryMetadata}.
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    ViewQueryMetadata.prototype.toString = function () { return "@ViewQuery(" + lang_1.stringify(this.selector) + ")"; };
    ViewQueryMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object, Object])
    ], ViewQueryMetadata);
    return ViewQueryMetadata;
})(QueryMetadata);
exports.ViewQueryMetadata = ViewQueryMetadata;
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
var ViewChildrenMetadata = (function (_super) {
    __extends(ViewChildrenMetadata, _super);
    function ViewChildrenMetadata(_selector) {
        _super.call(this, _selector, { descendants: true });
    }
    ViewChildrenMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ViewChildrenMetadata);
    return ViewChildrenMetadata;
})(ViewQueryMetadata);
exports.ViewChildrenMetadata = ViewChildrenMetadata;
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
var ViewChildMetadata = (function (_super) {
    __extends(ViewChildMetadata, _super);
    function ViewChildMetadata(_selector) {
        _super.call(this, _selector, { descendants: true, first: true });
    }
    ViewChildMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ViewChildMetadata);
    return ViewChildMetadata;
})(ViewQueryMetadata);
exports.ViewChildMetadata = ViewChildMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6WyJBdHRyaWJ1dGVNZXRhZGF0YSIsIkF0dHJpYnV0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQXR0cmlidXRlTWV0YWRhdGEudG9rZW4iLCJBdHRyaWJ1dGVNZXRhZGF0YS50b1N0cmluZyIsIlF1ZXJ5TWV0YWRhdGEiLCJRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiUXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlF1ZXJ5TWV0YWRhdGEuc2VsZWN0b3IiLCJRdWVyeU1ldGFkYXRhLmlzVmFyQmluZGluZ1F1ZXJ5IiwiUXVlcnlNZXRhZGF0YS52YXJCaW5kaW5ncyIsIlF1ZXJ5TWV0YWRhdGEudG9TdHJpbmciLCJDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSIsIkNvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29udGVudENoaWxkTWV0YWRhdGEiLCJDb250ZW50Q2hpbGRNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdRdWVyeU1ldGFkYXRhIiwiVmlld1F1ZXJ5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJWaWV3UXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlZpZXdRdWVyeU1ldGFkYXRhLnRvU3RyaW5nIiwiVmlld0NoaWxkcmVuTWV0YWRhdGEiLCJWaWV3Q2hpbGRyZW5NZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdDaGlsZE1ldGFkYXRhIiwiVmlld0NoaWxkTWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRixtQkFBZ0Msc0JBQXNCLENBQUMsQ0FBQTtBQUN2RCx5QkFBaUMsK0JBQStCLENBQUMsQ0FBQTtBQUVqRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNIO0lBQ3VD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N0IsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSDtJQUMwQ0ksd0NBQWlCQTtJQUN6REEsOEJBQVlBLFNBQXdCQTtRQUFJQyxrQkFBTUEsU0FBU0EsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFGbEZEO1FBQUNBLFlBQUtBLEVBQUVBOzs2QkFHUEE7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBSEQsRUFDMEMsaUJBQWlCLEVBRTFEO0FBRlksNEJBQW9CLHVCQUVoQyxDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNIO0lBQ3VDRSxxQ0FBaUJBO0lBQ3REQSwyQkFBWUEsU0FBd0JBO1FBQUlDLGtCQUFNQSxTQUFTQSxFQUFFQSxFQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUYvRkQ7UUFBQ0EsWUFBS0EsRUFBRUE7OzBCQUdQQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxFQUN1QyxpQkFBaUIsRUFFdkQ7QUFGWSx5QkFBaUIsb0JBRTdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBUeXBlLCBzdHJpbmdpZnksIGlzUHJlc2VudCwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Jlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0RlcGVuZGVuY3lNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuXG4vKipcbiAqIFNwZWNpZmllcyB0aGF0IGEgY29uc3RhbnQgYXR0cmlidXRlIHZhbHVlIHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgZGlyZWN0aXZlIGNhbiBpbmplY3QgY29uc3RhbnQgc3RyaW5nIGxpdGVyYWxzIG9mIGhvc3QgZWxlbWVudCBhdHRyaWJ1dGVzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogU3VwcG9zZSB3ZSBoYXZlIGFuIGA8aW5wdXQ+YCBlbGVtZW50IGFuZCB3YW50IHRvIGtub3cgaXRzIGB0eXBlYC5cbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAqIGBgYFxuICpcbiAqIEEgZGVjb3JhdG9yIGNhbiBpbmplY3Qgc3RyaW5nIGxpdGVyYWwgYHRleHRgIGxpa2Ugc286XG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiBgaW5wdXQnXG4gKiB9KVxuICogY2xhc3MgSW5wdXREaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAQXR0cmlidXRlKCd0eXBlJykgdHlwZSkge1xuICogICAgIC8vIHR5cGUgd291bGQgYmUgYHRleHRgIGluIHRoaXMgZXhhbXBsZVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVNZXRhZGF0YSBleHRlbmRzIERlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIGdldCB0b2tlbigpIHtcbiAgICAvLyBOb3JtYWxseSBvbmUgd291bGQgZGVmYXVsdCBhIHRva2VuIHRvIGEgdHlwZSBvZiBhbiBpbmplY3RlZCB2YWx1ZSBidXQgaGVyZVxuICAgIC8vIHRoZSB0eXBlIG9mIGEgdmFyaWFibGUgaXMgXCJzdHJpbmdcIiBhbmQgd2UgY2FuJ3QgdXNlIHByaW1pdGl2ZSB0eXBlIGFzIGEgcmV0dXJuIHZhbHVlXG4gICAgLy8gc28gd2UgdXNlIGluc3RhbmNlIG9mIEF0dHJpYnV0ZSBpbnN0ZWFkLiBUaGlzIGRvZXNuJ3QgbWF0dGVyIG11Y2ggaW4gcHJhY3RpY2UgYXMgYXJndW1lbnRzXG4gICAgLy8gd2l0aCBAQXR0cmlidXRlIGFubm90YXRpb24gYXJlIGluamVjdGVkIGJ5IEVsZW1lbnRJbmplY3RvciB0aGF0IGRvZXNuJ3QgdGFrZSB0b2tlbnMgaW50b1xuICAgIC8vIGFjY291bnQuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAQXR0cmlidXRlKCR7c3RyaW5naWZ5KHRoaXMuYXR0cmlidXRlTmFtZSl9KWA7IH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhbiBpbmplY3RhYmxlIHBhcmFtZXRlciB0byBiZSBhIGxpdmUgbGlzdCBvZiBkaXJlY3RpdmVzIG9yIHZhcmlhYmxlXG4gKiBiaW5kaW5ncyBmcm9tIHRoZSBjb250ZW50IGNoaWxkcmVuIG9mIGEgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sWTltOEhMeTd6MDZ2RG9VYVNOMj9wPXByZXZpZXcpKVxuICpcbiAqIEFzc3VtZSB0aGF0IGA8dGFicz5gIGNvbXBvbmVudCB3b3VsZCBsaWtlIHRvIGdldCBhIGxpc3QgaXRzIGNoaWxkcmVuIGA8cGFuZT5gXG4gKiBjb21wb25lbnRzIGFzIHNob3duIGluIHRoaXMgZXhhbXBsZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8dGFicz5cbiAqICAgPHBhbmUgdGl0bGU9XCJPdmVydmlld1wiPi4uLjwvcGFuZT5cbiAqICAgPHBhbmUgKm5nLWZvcj1cIiNvIG9mIG9iamVjdHNcIiBbdGl0bGVdPVwiby50aXRsZVwiPnt7by50ZXh0fX08L3BhbmU+XG4gKiA8L3RhYnM+XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJlZmVycmVkIHNvbHV0aW9uIGlzIHRvIHF1ZXJ5IGZvciBgUGFuZWAgZGlyZWN0aXZlcyB1c2luZyB0aGlzIGRlY29yYXRvci5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYW5lJyxcbiAqICAgaW5wdXRzOiBbJ3RpdGxlJ11cbiAqIH0pXG4gKiBjbGFzcyBQYW5lIHtcbiAqICAgdGl0bGU6c3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAndGFicycsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDx1bD5cbiAqICAgICAgPGxpICpuZy1mb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gICogICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICAqICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ3NlZWtlcicgfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZC1tZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZC1tZS10b28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc2Vla2VyJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICAvKipcbiAgICogd2hldGhlciB3ZSB3YW50IHRvIHF1ZXJ5IG9ubHkgZGlyZWN0IGNoaWxkcmVuIChmYWxzZSkgb3IgYWxsXG4gICAqIGNoaWxkcmVuICh0cnVlKS5cbiAgICovXG4gIGRlc2NlbmRhbnRzOiBib29sZWFuO1xuICBmaXJzdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZyxcbiAgICAgICAgICAgICAge2Rlc2NlbmRhbnRzID0gZmFsc2UsIGZpcnN0ID0gZmFsc2V9OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCBmaXJzdD86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZGVzY2VuZGFudHMgPSBkZXNjZW5kYW50cztcbiAgICB0aGlzLmZpcnN0ID0gZmlyc3Q7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGBmYWxzZWAgdG8gZGlmZmVyZW50aWF0ZSBpdCB3aXRoIHtAbGluayBWaWV3UXVlcnlNZXRhZGF0YX0uXG4gICAqL1xuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8qKlxuICAgKiB3aGF0IHRoaXMgaXMgcXVlcnlpbmcgZm9yLlxuICAgKi9cbiAgZ2V0IHNlbGVjdG9yKCkgeyByZXR1cm4gcmVzb2x2ZUZvcndhcmRSZWYodGhpcy5fc2VsZWN0b3IpOyB9XG5cbiAgLyoqXG4gICAqIHdoZXRoZXIgdGhpcyBpcyBxdWVyeWluZyBmb3IgYSB2YXJpYWJsZSBiaW5kaW5nIG9yIGEgZGlyZWN0aXZlLlxuICAgKi9cbiAgZ2V0IGlzVmFyQmluZGluZ1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gaXNTdHJpbmcodGhpcy5zZWxlY3Rvcik7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3MgdGhpcyBpcyBxdWVyeWluZyBmb3IuXG4gICAqIE9ubHkgYXBwbGljYWJsZSBpZiB0aGlzIGlzIGEgdmFyaWFibGUgYmluZGluZ3MgcXVlcnkuXG4gICAqL1xuICBnZXQgdmFyQmluZGluZ3MoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5zZWxlY3Rvci5zcGxpdCgnLCcpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAUXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLy8gVE9ETzogYWRkIGFuIGV4YW1wbGUgYWZ0ZXIgQ29udGVudENoaWxkcmVuIGFuZCBWaWV3Q2hpbGRyZW4gYXJlIGluIG1hc3RlclxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQ29udGVudENoaWxkcmVuTWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHMgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogZGVzY2VuZGFudHN9KTtcbiAgfVxufVxuXG4vLyBUT0RPOiBhZGQgYW4gZXhhbXBsZSBhZnRlciBDb250ZW50Q2hpbGQgYW5kIFZpZXdDaGlsZCBhcmUgaW4gbWFzdGVyXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGQ7XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb250ZW50Q2hpbGRNZXRhZGF0YSBleHRlbmRzIFF1ZXJ5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3Rvcihfc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpIHsgc3VwZXIoX3NlbGVjdG9yLCB7ZGVzY2VuZGFudHM6IHRydWUsIGZpcnN0OiB0cnVlfSk7IH1cbn1cblxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBRdWVyeShJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5vbkNoYW5nZSgoKSA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU3VwcG9ydHMgdGhlIHNhbWUgcXVlcnlpbmcgcGFyYW1ldGVycyBhcyB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGV4Y2VwdFxuICogYGRlc2NlbmRhbnRzYC4gVGhpcyBhbHdheXMgcXVlcmllcyB0aGUgd2hvbGUgdmlldy5cbiAqXG4gKiBBcyBgc2hvd25gIGlzIGZsaXBwZWQgYmV0d2VlbiB0cnVlIGFuZCBmYWxzZSwgaXRlbXMgd2lsbCBjb250YWluIHplcm8gb2Ygb25lXG4gKiBpdGVtcy5cbiAqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIHtAbGluayBRdWVyeUxpc3R9IHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIGl0ZXJhYmxlIGFuZCBvYnNlcnZhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFZpZXdRdWVyeU1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZyxcbiAgICAgICAgICAgICAge2Rlc2NlbmRhbnRzID0gZmFsc2UsIGZpcnN0ID0gZmFsc2V9OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCBmaXJzdD86IGJvb2xlYW59ID0ge30pIHtcbiAgICBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogZGVzY2VuZGFudHMsIGZpcnN0OiBmaXJzdH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGFsd2F5cyBgdHJ1ZWAgdG8gZGlmZmVyZW50aWF0ZSBpdCB3aXRoIHtAbGluayBRdWVyeU1ldGFkYXRhfS5cbiAgICovXG4gIGdldCBpc1ZpZXdRdWVyeSgpIHsgcmV0dXJuIHRydWU7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBAVmlld1F1ZXJ5KCR7c3RyaW5naWZ5KHRoaXMuc2VsZWN0b3IpfSlgOyB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkcmVuKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZHJlbjogUXVlcnlMaXN0PEl0ZW1EaXJlY3RpdmU+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld0NoaWxkcmVuTWV0YWRhdGEgZXh0ZW5kcyBWaWV3UXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZX0pOyB9XG59XG5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZDpJdGVtRGlyZWN0aXZlO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld0NoaWxkTWV0YWRhdGEgZXh0ZW5kcyBWaWV3UXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZSwgZmlyc3Q6IHRydWV9KTsgfVxufVxuIl19
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaS50cyJdLCJuYW1lcyI6WyJBdHRyaWJ1dGVNZXRhZGF0YSIsIkF0dHJpYnV0ZU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQXR0cmlidXRlTWV0YWRhdGEudG9rZW4iLCJBdHRyaWJ1dGVNZXRhZGF0YS50b1N0cmluZyIsIlF1ZXJ5TWV0YWRhdGEiLCJRdWVyeU1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiUXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlF1ZXJ5TWV0YWRhdGEuc2VsZWN0b3IiLCJRdWVyeU1ldGFkYXRhLmlzVmFyQmluZGluZ1F1ZXJ5IiwiUXVlcnlNZXRhZGF0YS52YXJCaW5kaW5ncyIsIlF1ZXJ5TWV0YWRhdGEudG9TdHJpbmciLCJDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSIsIkNvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29udGVudENoaWxkTWV0YWRhdGEiLCJDb250ZW50Q2hpbGRNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdRdWVyeU1ldGFkYXRhIiwiVmlld1F1ZXJ5TWV0YWRhdGEuY29uc3RydWN0b3IiLCJWaWV3UXVlcnlNZXRhZGF0YS5pc1ZpZXdRdWVyeSIsIlZpZXdRdWVyeU1ldGFkYXRhLnRvU3RyaW5nIiwiVmlld0NoaWxkcmVuTWV0YWRhdGEiLCJWaWV3Q2hpbGRyZW5NZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlZpZXdDaGlsZE1ldGFkYXRhIiwiVmlld0NoaWxkTWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTBELDBCQUEwQixDQUFDLENBQUE7QUFDckYsbUJBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFDdkQseUJBQWlDLCtCQUErQixDQUFDLENBQUE7QUFFakU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSDtJQUN1Q0Es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LENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0g7SUFDMENJLHdDQUFpQkE7SUFDekRBLDhCQUFZQSxTQUF3QkE7UUFBSUMsa0JBQU1BLFNBQVNBLEVBQUVBLEVBQUNBLFdBQVdBLEVBQUVBLElBQUlBLEVBQUNBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBRmxGRDtRQUFDQSxZQUFLQSxFQUFFQTs7NkJBR1BBO0lBQURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQUhELEVBQzBDLGlCQUFpQixFQUUxRDtBQUZZLDRCQUFvQix1QkFFaEMsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSDtJQUN1Q0UscUNBQWlCQTtJQUN0REEsMkJBQVlBLFNBQXdCQTtRQUFJQyxrQkFBTUEsU0FBU0EsRUFBRUEsRUFBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFGL0ZEO1FBQUNBLFlBQUtBLEVBQUVBOzswQkFHUEE7SUFBREEsd0JBQUNBO0FBQURBLENBQUNBLEFBSEQsRUFDdUMsaUJBQWlCLEVBRXZEO0FBRlkseUJBQWlCLG9CQUU3QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgVHlwZSwgc3RyaW5naWZ5LCBpc1ByZXNlbnQsIGlzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtEZXBlbmRlbmN5TWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL21ldGFkYXRhJztcblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIGNvbnN0YW50IGF0dHJpYnV0ZSB2YWx1ZSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGRpcmVjdGl2ZSBjYW4gaW5qZWN0IGNvbnN0YW50IHN0cmluZyBsaXRlcmFscyBvZiBob3N0IGVsZW1lbnQgYXR0cmlidXRlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFN1cHBvc2Ugd2UgaGF2ZSBhbiBgPGlucHV0PmAgZWxlbWVudCBhbmQgd2FudCB0byBrbm93IGl0cyBgdHlwZWAuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XG4gKiBgYGBcbiAqXG4gKiBBIGRlY29yYXRvciBjYW4gaW5qZWN0IHN0cmluZyBsaXRlcmFsIGB0ZXh0YCBsaWtlIHNvOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogYGlucHV0J1xuICogfSlcbiAqIGNsYXNzIElucHV0RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgndHlwZScpIHR5cGUpIHtcbiAqICAgICAvLyB0eXBlIHdvdWxkIGJlIGB0ZXh0YCBpbiB0aGlzIGV4YW1wbGVcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlTWV0YWRhdGEgZXh0ZW5kcyBEZXBlbmRlbmN5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nKSB7IHN1cGVyKCk7IH1cblxuICBnZXQgdG9rZW4oKSB7XG4gICAgLy8gTm9ybWFsbHkgb25lIHdvdWxkIGRlZmF1bHQgYSB0b2tlbiB0byBhIHR5cGUgb2YgYW4gaW5qZWN0ZWQgdmFsdWUgYnV0IGhlcmVcbiAgICAvLyB0aGUgdHlwZSBvZiBhIHZhcmlhYmxlIGlzIFwic3RyaW5nXCIgYW5kIHdlIGNhbid0IHVzZSBwcmltaXRpdmUgdHlwZSBhcyBhIHJldHVybiB2YWx1ZVxuICAgIC8vIHNvIHdlIHVzZSBpbnN0YW5jZSBvZiBBdHRyaWJ1dGUgaW5zdGVhZC4gVGhpcyBkb2Vzbid0IG1hdHRlciBtdWNoIGluIHByYWN0aWNlIGFzIGFyZ3VtZW50c1xuICAgIC8vIHdpdGggQEF0dHJpYnV0ZSBhbm5vdGF0aW9uIGFyZSBpbmplY3RlZCBieSBFbGVtZW50SW5qZWN0b3IgdGhhdCBkb2Vzbid0IHRha2UgdG9rZW5zIGludG9cbiAgICAvLyBhY2NvdW50LlxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQEF0dHJpYnV0ZSgke3N0cmluZ2lmeSh0aGlzLmF0dHJpYnV0ZU5hbWUpfSlgOyB9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gaW5qZWN0YWJsZSBwYXJhbWV0ZXIgdG8gYmUgYSBsaXZlIGxpc3Qgb2YgZGlyZWN0aXZlcyBvciB2YXJpYWJsZVxuICogYmluZGluZ3MgZnJvbSB0aGUgY29udGVudCBjaGlsZHJlbiBvZiBhIGRpcmVjdGl2ZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvbFk5bThITHk3ejA2dkRvVWFTTjI/cD1wcmV2aWV3KSlcbiAqXG4gKiBBc3N1bWUgdGhhdCBgPHRhYnM+YCBjb21wb25lbnQgd291bGQgbGlrZSB0byBnZXQgYSBsaXN0IGl0cyBjaGlsZHJlbiBgPHBhbmU+YFxuICogY29tcG9uZW50cyBhcyBzaG93biBpbiB0aGlzIGV4YW1wbGU6XG4gKlxuICogYGBgaHRtbFxuICogPHRhYnM+XG4gKiAgIDxwYW5lIHRpdGxlPVwiT3ZlcnZpZXdcIj4uLi48L3BhbmU+XG4gKiAgIDxwYW5lICpuZ0Zvcj1cIiNvIG9mIG9iamVjdHNcIiBbdGl0bGVdPVwiby50aXRsZVwiPnt7by50ZXh0fX08L3BhbmU+XG4gKiA8L3RhYnM+XG4gKiBgYGBcbiAqXG4gKiBUaGUgcHJlZmVycmVkIHNvbHV0aW9uIGlzIHRvIHF1ZXJ5IGZvciBgUGFuZWAgZGlyZWN0aXZlcyB1c2luZyB0aGlzIGRlY29yYXRvci5cbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdwYW5lJyxcbiAqICAgaW5wdXRzOiBbJ3RpdGxlJ11cbiAqIH0pXG4gKiBjbGFzcyBQYW5lIHtcbiAqICAgdGl0bGU6c3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogIHNlbGVjdG9yOiAndGFicycsXG4gKiAgdGVtcGxhdGU6IGBcbiAqICAgIDx1bD5cbiAqICAgICAgPGxpICpuZ0Zvcj1cIiNwYW5lIG9mIHBhbmVzXCI+e3twYW5lLnRpdGxlfX08L2xpPlxuICogICAgPC91bD5cbiAqICAgIDxjb250ZW50PjwvY29udGVudD5cbiAqICBgXG4gKiB9KVxuICogY2xhc3MgVGFicyB7XG4gKiAgIHBhbmVzOiBRdWVyeUxpc3Q8UGFuZT47XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShQYW5lKSBwYW5lczpRdWVyeUxpc3Q8UGFuZT4pIHtcbiAgKiAgICB0aGlzLnBhbmVzID0gcGFuZXM7XG4gICogIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgcXVlcnkgY2FuIGxvb2sgZm9yIHZhcmlhYmxlIGJpbmRpbmdzIGJ5IHBhc3NpbmcgaW4gYSBzdHJpbmcgd2l0aCBkZXNpcmVkIGJpbmRpbmcgc3ltYm9sLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zVDJqMjVjSDFkVVJBeUJSQ0t4MT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZG1lPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogQENvbXBvbmVudCh7IHNlbGVjdG9yOiAnc2Vla2VyJyB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kbWUnKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgY2FzZSB0aGUgb2JqZWN0IHRoYXQgaXMgaW5qZWN0ZWQgZGVwZW5kIG9uIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZVxuICogYmluZGluZy4gSXQgY2FuIGJlIGFuIEVsZW1lbnRSZWYsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50LlxuICpcbiAqIFBhc3NpbmcgaW4gYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB3aWxsIHF1ZXJ5IGZvciBhbGwgb2YgdGhlbS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kLW1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kLW1lLXRvbz4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzZWVrZXInXG4gKiB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kTWUsIGZpbmRNZVRvbycpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQ29uZmlndXJlIHdoZXRoZXIgcXVlcnkgbG9va3MgZm9yIGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHNcbiAqIG9mIHRoZSBxdWVyeWluZyBlbGVtZW50LCBieSB1c2luZyB0aGUgYGRlc2NlbmRhbnRzYCBwYXJhbWV0ZXIuXG4gKiBJdCBpcyBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93dEdlQjk3N2J2N3F2QTVGVFlsOT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPGNvbnRhaW5lciAjZmlyc3Q+XG4gKiAgIDxpdGVtPmE8L2l0ZW0+XG4gKiAgIDxpdGVtPmI8L2l0ZW0+XG4gKiAgIDxjb250YWluZXIgI3NlY29uZD5cbiAqICAgICA8aXRlbT5jPC9pdGVtPlxuICogICA8L2NvbnRhaW5lcj5cbiAqIDwvY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2hlbiBxdWVyeWluZyBmb3IgaXRlbXMsIHRoZSBmaXJzdCBjb250YWluZXIgd2lsbCBzZWUgb25seSBgYWAgYW5kIGBiYCBieSBkZWZhdWx0LFxuICogYnV0IHdpdGggYFF1ZXJ5KFRleHREaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pYCBpdCB3aWxsIHNlZSBgY2AgdG9vLlxuICpcbiAqIFRoZSBxdWVyaWVkIGRpcmVjdGl2ZXMgYXJlIGtlcHQgaW4gYSBkZXB0aC1maXJzdCBwcmUtb3JkZXIgd2l0aCByZXNwZWN0IHRvIHRoZWlyXG4gKiBwb3NpdGlvbnMgaW4gdGhlIERPTS5cbiAqXG4gKiBRdWVyeSBkb2VzIG5vdCBsb29rIGRlZXAgaW50byBhbnkgc3ViY29tcG9uZW50IHZpZXdzLlxuICpcbiAqIFF1ZXJ5IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiB0aGUgY2hhbmdlLWRldGVjdGlvbiBjeWNsZS4gU2luY2UgY2hhbmdlIGRldGVjdGlvblxuICogaGFwcGVucyBhZnRlciBjb25zdHJ1Y3Rpb24gb2YgYSBkaXJlY3RpdmUsIFF1ZXJ5TGlzdCB3aWxsIGFsd2F5cyBiZSBlbXB0eSB3aGVuIG9ic2VydmVkIGluIHRoZVxuICogY29uc3RydWN0b3IuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiB1bm1vZGlmaWFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgUXVlcnlNZXRhZGF0YSBleHRlbmRzIERlcGVuZGVuY3lNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiB3aGV0aGVyIHdlIHdhbnQgdG8gcXVlcnkgb25seSBkaXJlY3QgY2hpbGRyZW4gKGZhbHNlKSBvciBhbGxcbiAgICogY2hpbGRyZW4gKHRydWUpLlxuICAgKi9cbiAgZGVzY2VuZGFudHM6IGJvb2xlYW47XG4gIGZpcnN0OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIGZpcnN0PzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kZXNjZW5kYW50cyA9IGRlc2NlbmRhbnRzO1xuICAgIHRoaXMuZmlyc3QgPSBmaXJzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBhbHdheXMgYGZhbHNlYCB0byBkaWZmZXJlbnRpYXRlIGl0IHdpdGgge0BsaW5rIFZpZXdRdWVyeU1ldGFkYXRhfS5cbiAgICovXG4gIGdldCBpc1ZpZXdRdWVyeSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLyoqXG4gICAqIHdoYXQgdGhpcyBpcyBxdWVyeWluZyBmb3IuXG4gICAqL1xuICBnZXQgc2VsZWN0b3IoKSB7IHJldHVybiByZXNvbHZlRm9yd2FyZFJlZih0aGlzLl9zZWxlY3Rvcik7IH1cblxuICAvKipcbiAgICogd2hldGhlciB0aGlzIGlzIHF1ZXJ5aW5nIGZvciBhIHZhcmlhYmxlIGJpbmRpbmcgb3IgYSBkaXJlY3RpdmUuXG4gICAqL1xuICBnZXQgaXNWYXJCaW5kaW5nUXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiBpc1N0cmluZyh0aGlzLnNlbGVjdG9yKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB0aGlzIGlzIHF1ZXJ5aW5nIGZvci5cbiAgICogT25seSBhcHBsaWNhYmxlIGlmIHRoaXMgaXMgYSB2YXJpYWJsZSBiaW5kaW5ncyBxdWVyeS5cbiAgICovXG4gIGdldCB2YXJCaW5kaW5ncygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLnNlbGVjdG9yLnNwbGl0KCcsJyk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBRdWVyeSgke3N0cmluZ2lmeSh0aGlzLnNlbGVjdG9yKX0pYDsgfVxufVxuXG4vLyBUT0RPOiBhZGQgYW4gZXhhbXBsZSBhZnRlciBDb250ZW50Q2hpbGRyZW4gYW5kIFZpZXdDaGlsZHJlbiBhcmUgaW4gbWFzdGVyXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFF1ZXJ5TWV0YWRhdGEge1xuICBjb25zdHJ1Y3Rvcihfc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50cyA9IGZhbHNlfToge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50c30pO1xuICB9XG59XG5cbi8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZCBhbmQgVmlld0NoaWxkIGFyZSBpbiBtYXN0ZXJcbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAqICAgICAvLyBjb250ZW50Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbnRlbnRDaGlsZE1ldGFkYXRhIGV4dGVuZHMgUXVlcnlNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKF9zZWxlY3RvcjogVHlwZSB8IHN0cmluZykgeyBzdXBlcihfc2VsZWN0b3IsIHtkZXNjZW5kYW50czogdHJ1ZSwgZmlyc3Q6IHRydWV9KTsgfVxufVxuXG4vKipcbiAqIFNpbWlsYXIgdG8ge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBidXQgcXVlcnlpbmcgdGhlIGNvbXBvbmVudCB2aWV3LCBpbnN0ZWFkIG9mXG4gKiB0aGUgY29udGVudCBjaGlsZHJlbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZU5zRkhEZjdZanlNNkl6S3hNMWo/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpdGVtPiBhIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYiA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGMgPC9pdGVtPlxuICogICBgXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBzaG93bjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgQFF1ZXJ5KEl0ZW0pIGl0ZW1zOlF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLm9uQ2hhbmdlKCgpID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBTdXBwb3J0cyB0aGUgc2FtZSBxdWVyeWluZyBwYXJhbWV0ZXJzIGFzIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgZXhjZXB0XG4gKiBgZGVzY2VuZGFudHNgLiBUaGlzIGFsd2F5cyBxdWVyaWVzIHRoZSB3aG9sZSB2aWV3LlxuICpcbiAqIEFzIGBzaG93bmAgaXMgZmxpcHBlZCBiZXR3ZWVuIHRydWUgYW5kIGZhbHNlLCBpdGVtcyB3aWxsIGNvbnRhaW4gemVybyBvZiBvbmVcbiAqIGl0ZW1zLlxuICpcbiAqIFNwZWNpZmllcyB0aGF0IGEge0BsaW5rIFF1ZXJ5TGlzdH0gc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gaXRlcmFibGUgYW5kIG9ic2VydmFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgVmlld1F1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLFxuICAgICAgICAgICAgICB7ZGVzY2VuZGFudHMgPSBmYWxzZSwgZmlyc3QgPSBmYWxzZX06IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIGZpcnN0PzogYm9vbGVhbn0gPSB7fSkge1xuICAgIHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiBkZXNjZW5kYW50cywgZmlyc3Q6IGZpcnN0fSk7XG4gIH1cblxuICAvKipcbiAgICogYWx3YXlzIGB0cnVlYCB0byBkaWZmZXJlbnRpYXRlIGl0IHdpdGgge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LlxuICAgKi9cbiAgZ2V0IGlzVmlld1F1ZXJ5KCkgeyByZXR1cm4gdHJ1ZTsgfVxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYEBWaWV3UXVlcnkoJHtzdHJpbmdpZnkodGhpcy5zZWxlY3Rvcil9KWA7IH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8SXRlbURpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gdmlld0NoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRyZW5NZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKSB7IHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlfSk7IH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGQoSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkOkl0ZW1EaXJlY3RpdmU7XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gdmlld0NoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3Q2hpbGRNZXRhZGF0YSBleHRlbmRzIFZpZXdRdWVyeU1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoX3NlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKSB7IHN1cGVyKF9zZWxlY3Rvciwge2Rlc2NlbmRhbnRzOiB0cnVlLCBmaXJzdDogdHJ1ZX0pOyB9XG59XG4iXX0=
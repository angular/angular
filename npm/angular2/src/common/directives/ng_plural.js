'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var ng_switch_1 = require('./ng_switch');
var _CATEGORY_DEFAULT = 'other';
var NgLocalization = (function () {
    function NgLocalization() {
    }
    return NgLocalization;
}());
exports.NgLocalization = NgLocalization;
/**
 * `ngPlural` is an i18n directive that displays DOM sub-trees that match the switch expression
 * value, or failing that, DOM sub-trees that match the switch expression's pluralization category.
 *
 * To use this directive, you must provide an extension of `NgLocalization` that maps values to
 * category names. You then define a container element that sets the `[ngPlural]` attribute to a
 * switch expression.
 *    - Inner elements defined with an `[ngPluralCase]` attribute will display based on their
 * expression.
 *    - If `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 * matches the switch expression exactly.
 *    - Otherwise, the view will be treated as a "category match", and will only display if exact
 * value matches aren't found and the value maps to its category using the `getPluralCategory`
 * function provided.
 *
 * If no matching views are found for a switch expression, inner elements marked
 * `[ngPluralCase]="other"` will be displayed.
 *
 * ```typescript
 * class MyLocalization extends NgLocalization {
 *    getPluralCategory(value: any) {
 *       if(value < 5) {
 *          return 'few';
 *       }
 *    }
 * }
 *
 * @Component({
 *    selector: 'app',
 *    providers: [provide(NgLocalization, {useClass: MyLocalization})]
 * })
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ngPlural]="value">
 *       <template ngPluralCase="=0">there is nothing</template>
 *       <template ngPluralCase="=1">there is one</template>
 *       <template ngPluralCase="few">there are a few</template>
 *       <template ngPluralCase="other">there is some number</template>
 *     </div>
 *   `,
 *   directives: [NgPlural, NgPluralCase]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * ```
 */
var NgPluralCase = (function () {
    function NgPluralCase(value, template, viewContainer) {
        this.value = value;
        this._view = new ng_switch_1.SwitchView(viewContainer, template);
    }
    NgPluralCase = __decorate([
        core_1.Directive({ selector: '[ngPluralCase]' }),
        __param(0, core_1.Attribute('ngPluralCase')), 
        __metadata('design:paramtypes', [String, core_1.TemplateRef, core_1.ViewContainerRef])
    ], NgPluralCase);
    return NgPluralCase;
}());
exports.NgPluralCase = NgPluralCase;
var NgPlural = (function () {
    function NgPlural(_localization) {
        this._localization = _localization;
        this._caseViews = new collection_1.Map();
        this.cases = null;
    }
    Object.defineProperty(NgPlural.prototype, "ngPlural", {
        set: function (value) {
            this._switchValue = value;
            this._updateView();
        },
        enumerable: true,
        configurable: true
    });
    NgPlural.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.cases.forEach(function (pluralCase) {
            _this._caseViews.set(_this._formatValue(pluralCase), pluralCase._view);
        });
        this._updateView();
    };
    /** @internal */
    NgPlural.prototype._updateView = function () {
        this._clearViews();
        var view = this._caseViews.get(this._switchValue);
        if (!lang_1.isPresent(view))
            view = this._getCategoryView(this._switchValue);
        this._activateView(view);
    };
    /** @internal */
    NgPlural.prototype._clearViews = function () {
        if (lang_1.isPresent(this._activeView))
            this._activeView.destroy();
    };
    /** @internal */
    NgPlural.prototype._activateView = function (view) {
        if (!lang_1.isPresent(view))
            return;
        this._activeView = view;
        this._activeView.create();
    };
    /** @internal */
    NgPlural.prototype._getCategoryView = function (value) {
        var category = this._localization.getPluralCategory(value);
        var categoryView = this._caseViews.get(category);
        return lang_1.isPresent(categoryView) ? categoryView : this._caseViews.get(_CATEGORY_DEFAULT);
    };
    /** @internal */
    NgPlural.prototype._isValueView = function (pluralCase) { return pluralCase.value[0] === "="; };
    /** @internal */
    NgPlural.prototype._formatValue = function (pluralCase) {
        return this._isValueView(pluralCase) ? this._stripValue(pluralCase.value) : pluralCase.value;
    };
    /** @internal */
    NgPlural.prototype._stripValue = function (value) { return lang_1.NumberWrapper.parseInt(value.substring(1), 10); };
    __decorate([
        core_1.ContentChildren(NgPluralCase), 
        __metadata('design:type', core_1.QueryList)
    ], NgPlural.prototype, "cases", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], NgPlural.prototype, "ngPlural", null);
    NgPlural = __decorate([
        core_1.Directive({ selector: '[ngPlural]' }), 
        __metadata('design:paramtypes', [NgLocalization])
    ], NgPlural);
    return NgPlural;
}());
exports.NgPlural = NgPlural;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEscUJBU08sZUFBZSxDQUFDLENBQUE7QUFDdkIscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsMkJBQWtCLGdDQUFnQyxDQUFDLENBQUE7QUFDbkQsMEJBQXlCLGFBQWEsQ0FBQyxDQUFBO0FBRXZDLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0FBRWxDO0lBQUE7SUFBdUYsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FBQyxBQUF4RixJQUF3RjtBQUFsRSxzQkFBYyxpQkFBb0QsQ0FBQTtBQUV4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0RHO0FBR0g7SUFHRSxzQkFBOEMsS0FBYSxFQUFFLFFBQTZCLEVBQzlFLGFBQStCO1FBREcsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUV6RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksc0JBQVUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQVBIO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQyxDQUFDO21CQUl6QixnQkFBUyxDQUFDLGNBQWMsQ0FBQzs7b0JBSkE7SUFReEMsbUJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQVBZLG9CQUFZLGVBT3hCLENBQUE7QUFJRDtJQU1FLGtCQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFIekMsZUFBVSxHQUFHLElBQUksZ0JBQUcsRUFBbUIsQ0FBQztRQUNqQixVQUFLLEdBQTRCLElBQUksQ0FBQztJQUVqQixDQUFD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QUM7O2dCQUFBO0lBNkRwQyxlQUFDO0FBQUQsQ0FBQyxBQTVERCxJQTREQztBQTVEWSxnQkFBUSxXQTREcEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVGVtcGxhdGVSZWYsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgUXVlcnlMaXN0LFxuICBBdHRyaWJ1dGUsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIElucHV0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIE51bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7U3dpdGNoVmlld30gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuXG5jb25zdCBfQ0FURUdPUllfREVGQVVMVCA9ICdvdGhlcic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0xvY2FsaXphdGlvbiB7IGFic3RyYWN0IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnkpOiBzdHJpbmc7IH1cblxuLyoqXG4gKiBgbmdQbHVyYWxgIGlzIGFuIGkxOG4gZGlyZWN0aXZlIHRoYXQgZGlzcGxheXMgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUsIG9yIGZhaWxpbmcgdGhhdCwgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbidzIHBsdXJhbGl6YXRpb24gY2F0ZWdvcnkuXG4gKlxuICogVG8gdXNlIHRoaXMgZGlyZWN0aXZlLCB5b3UgbXVzdCBwcm92aWRlIGFuIGV4dGVuc2lvbiBvZiBgTmdMb2NhbGl6YXRpb25gIHRoYXQgbWFwcyB2YWx1ZXMgdG9cbiAqIGNhdGVnb3J5IG5hbWVzLiBZb3UgdGhlbiBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHNldHMgdGhlIGBbbmdQbHVyYWxdYCBhdHRyaWJ1dGUgdG8gYVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKiAgICAtIElubmVyIGVsZW1lbnRzIGRlZmluZWQgd2l0aCBhbiBgW25nUGx1cmFsQ2FzZV1gIGF0dHJpYnV0ZSB3aWxsIGRpc3BsYXkgYmFzZWQgb24gdGhlaXJcbiAqIGV4cHJlc3Npb24uXG4gKiAgICAtIElmIGBbbmdQbHVyYWxDYXNlXWAgaXMgc2V0IHRvIGEgdmFsdWUgc3RhcnRpbmcgd2l0aCBgPWAsIGl0IHdpbGwgb25seSBkaXNwbGF5IGlmIHRoZSB2YWx1ZVxuICogbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24gZXhhY3RseS5cbiAqICAgIC0gT3RoZXJ3aXNlLCB0aGUgdmlldyB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBcImNhdGVnb3J5IG1hdGNoXCIsIGFuZCB3aWxsIG9ubHkgZGlzcGxheSBpZiBleGFjdFxuICogdmFsdWUgbWF0Y2hlcyBhcmVuJ3QgZm91bmQgYW5kIHRoZSB2YWx1ZSBtYXBzIHRvIGl0cyBjYXRlZ29yeSB1c2luZyB0aGUgYGdldFBsdXJhbENhdGVnb3J5YFxuICogZnVuY3Rpb24gcHJvdmlkZWQuXG4gKlxuICogSWYgbm8gbWF0Y2hpbmcgdmlld3MgYXJlIGZvdW5kIGZvciBhIHN3aXRjaCBleHByZXNzaW9uLCBpbm5lciBlbGVtZW50cyBtYXJrZWRcbiAqIGBbbmdQbHVyYWxDYXNlXT1cIm90aGVyXCJgIHdpbGwgYmUgZGlzcGxheWVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15TG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICogICAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSkge1xuICogICAgICAgaWYodmFsdWUgPCA1KSB7XG4gKiAgICAgICAgICByZXR1cm4gJ2Zldyc7XG4gKiAgICAgICB9XG4gKiAgICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgICBwcm92aWRlcnM6IFtwcm92aWRlKE5nTG9jYWxpemF0aW9uLCB7dXNlQ2xhc3M6IE15TG9jYWxpemF0aW9ufSldXG4gKiB9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxwPlZhbHVlID0ge3t2YWx1ZX19PC9wPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cImluYygpXCI+SW5jcmVtZW50PC9idXR0b24+XG4gKlxuICogICAgIDxkaXYgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj50aGVyZSBpcyBub3RoaW5nPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MVwiPnRoZXJlIGlzIG9uZTwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiZmV3XCI+dGhlcmUgYXJlIGEgZmV3PC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPnRoZXJlIGlzIHNvbWUgbnVtYmVyPC90ZW1wbGF0ZT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nUGx1cmFsLCBOZ1BsdXJhbENhc2VdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlID0gJ2luaXQnO1xuICpcbiAqICAgaW5jKCkge1xuICogICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID09PSAnaW5pdCcgPyAwIDogdGhpcy52YWx1ZSArIDE7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBgYGBcbiAqL1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWxDYXNlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogU3dpdGNoVmlldztcbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgnbmdQbHVyYWxDYXNlJykgcHVibGljIHZhbHVlOiBzdHJpbmcsIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgICAgICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgdGhpcy5fdmlldyA9IG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlKTtcbiAgfVxufVxuXG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nUGx1cmFsXSd9KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIHByaXZhdGUgX3N3aXRjaFZhbHVlOiBudW1iZXI7XG4gIHByaXZhdGUgX2FjdGl2ZVZpZXc6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX2Nhc2VWaWV3cyA9IG5ldyBNYXA8YW55LCBTd2l0Y2hWaWV3PigpO1xuICBAQ29udGVudENoaWxkcmVuKE5nUGx1cmFsQ2FzZSkgY2FzZXM6IFF1ZXJ5TGlzdDxOZ1BsdXJhbENhc2U+ID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1BsdXJhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc3dpdGNoVmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5jYXNlcy5mb3JFYWNoKChwbHVyYWxDYXNlOiBOZ1BsdXJhbENhc2UpOiB2b2lkID0+IHtcbiAgICAgIHRoaXMuX2Nhc2VWaWV3cy5zZXQodGhpcy5fZm9ybWF0VmFsdWUocGx1cmFsQ2FzZSksIHBsdXJhbENhc2UuX3ZpZXcpO1xuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJWaWV3cygpO1xuXG4gICAgdmFyIHZpZXc6IFN3aXRjaFZpZXcgPSB0aGlzLl9jYXNlVmlld3MuZ2V0KHRoaXMuX3N3aXRjaFZhbHVlKTtcbiAgICBpZiAoIWlzUHJlc2VudCh2aWV3KSkgdmlldyA9IHRoaXMuX2dldENhdGVnb3J5Vmlldyh0aGlzLl9zd2l0Y2hWYWx1ZSk7XG5cbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXcodmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbGVhclZpZXdzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fYWN0aXZlVmlldykpIHRoaXMuX2FjdGl2ZVZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWN0aXZhdGVWaWV3KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAoIWlzUHJlc2VudCh2aWV3KSkgcmV0dXJuO1xuICAgIHRoaXMuX2FjdGl2ZVZpZXcgPSB2aWV3O1xuICAgIHRoaXMuX2FjdGl2ZVZpZXcuY3JlYXRlKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRDYXRlZ29yeVZpZXcodmFsdWU6IG51bWJlcik6IFN3aXRjaFZpZXcge1xuICAgIHZhciBjYXRlZ29yeTogc3RyaW5nID0gdGhpcy5fbG9jYWxpemF0aW9uLmdldFBsdXJhbENhdGVnb3J5KHZhbHVlKTtcbiAgICB2YXIgY2F0ZWdvcnlWaWV3OiBTd2l0Y2hWaWV3ID0gdGhpcy5fY2FzZVZpZXdzLmdldChjYXRlZ29yeSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChjYXRlZ29yeVZpZXcpID8gY2F0ZWdvcnlWaWV3IDogdGhpcy5fY2FzZVZpZXdzLmdldChfQ0FURUdPUllfREVGQVVMVCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9pc1ZhbHVlVmlldyhwbHVyYWxDYXNlOiBOZ1BsdXJhbENhc2UpOiBib29sZWFuIHsgcmV0dXJuIHBsdXJhbENhc2UudmFsdWVbMF0gPT09IFwiPVwiOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZm9ybWF0VmFsdWUocGx1cmFsQ2FzZTogTmdQbHVyYWxDYXNlKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5faXNWYWx1ZVZpZXcocGx1cmFsQ2FzZSkgPyB0aGlzLl9zdHJpcFZhbHVlKHBsdXJhbENhc2UudmFsdWUpIDogcGx1cmFsQ2FzZS52YWx1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmlwVmFsdWUodmFsdWU6IHN0cmluZyk6IG51bWJlciB7IHJldHVybiBOdW1iZXJXcmFwcGVyLnBhcnNlSW50KHZhbHVlLnN1YnN0cmluZygxKSwgMTApOyB9XG59XG4iXX0=
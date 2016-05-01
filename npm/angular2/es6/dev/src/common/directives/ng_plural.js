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
import { Directive, ViewContainerRef, TemplateRef, ContentChildren, QueryList, Attribute, Input } from 'angular2/core';
import { isPresent, NumberWrapper } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { SwitchView } from './ng_switch';
const _CATEGORY_DEFAULT = 'other';
export class NgLocalization {
}
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
export let NgPluralCase = class NgPluralCase {
    constructor(value, template, viewContainer) {
        this.value = value;
        this._view = new SwitchView(viewContainer, template);
    }
};
NgPluralCase = __decorate([
    Directive({ selector: '[ngPluralCase]' }),
    __param(0, Attribute('ngPluralCase')), 
    __metadata('design:paramtypes', [String, TemplateRef, ViewContainerRef])
], NgPluralCase);
export let NgPlural = class NgPlural {
    constructor(_localization) {
        this._localization = _localization;
        this._caseViews = new Map();
        this.cases = null;
    }
    set ngPlural(value) {
        this._switchValue = value;
        this._updateView();
    }
    ngAfterContentInit() {
        this.cases.forEach((pluralCase) => {
            this._caseViews.set(this._formatValue(pluralCase), pluralCase._view);
        });
        this._updateView();
    }
    /** @internal */
    _updateView() {
        this._clearViews();
        var view = this._caseViews.get(this._switchValue);
        if (!isPresent(view))
            view = this._getCategoryView(this._switchValue);
        this._activateView(view);
    }
    /** @internal */
    _clearViews() {
        if (isPresent(this._activeView))
            this._activeView.destroy();
    }
    /** @internal */
    _activateView(view) {
        if (!isPresent(view))
            return;
        this._activeView = view;
        this._activeView.create();
    }
    /** @internal */
    _getCategoryView(value) {
        var category = this._localization.getPluralCategory(value);
        var categoryView = this._caseViews.get(category);
        return isPresent(categoryView) ? categoryView : this._caseViews.get(_CATEGORY_DEFAULT);
    }
    /** @internal */
    _isValueView(pluralCase) { return pluralCase.value[0] === "="; }
    /** @internal */
    _formatValue(pluralCase) {
        return this._isValueView(pluralCase) ? this._stripValue(pluralCase.value) : pluralCase.value;
    }
    /** @internal */
    _stripValue(value) { return NumberWrapper.parseInt(value.substring(1), 10); }
};
__decorate([
    ContentChildren(NgPluralCase), 
    __metadata('design:type', QueryList)
], NgPlural.prototype, "cases", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Number), 
    __metadata('design:paramtypes', [Number])
], NgPlural.prototype, "ngPlural", null);
NgPlural = __decorate([
    Directive({ selector: '[ngPlural]' }), 
    __metadata('design:paramtypes', [NgLocalization])
], NgPlural);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLGVBQWUsRUFDZixTQUFTLEVBQ1QsU0FBUyxFQUVULEtBQUssRUFDTixNQUFNLGVBQWU7T0FDZixFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSwwQkFBMEI7T0FDMUQsRUFBQyxHQUFHLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDM0MsRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhO0FBRXRDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0FBRWxDO0FBQXVGLENBQUM7QUFFeEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNERztBQUdIO0lBR0UsWUFBOEMsS0FBYSxFQUFFLFFBQTZCLEVBQzlFLGFBQStCO1FBREcsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUV6RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RCxDQUFDO0FBQ0gsQ0FBQztBQVJEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDLENBQUM7ZUFJekIsU0FBUyxDQUFDLGNBQWMsQ0FBQzs7Z0JBSkE7QUFZeEM7SUFNRSxZQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFIekMsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1FBQ2pCLFVBQUssR0FBNEIsSUFBSSxDQUFDO0lBRWpCLENBQUM7SUFHckQsSUFBSSxRQUFRLENBQUMsS0FBYTtRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQXdCO1lBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsV0FBVztRQUNULElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixJQUFJLElBQUksR0FBZSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUV0RSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsV0FBVztRQUNULEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlELENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsYUFBYSxDQUFDLElBQWdCO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixnQkFBZ0IsQ0FBQyxLQUFhO1FBQzVCLElBQUksUUFBUSxHQUFXLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkUsSUFBSSxZQUFZLEdBQWUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFlBQVksQ0FBQyxVQUF3QixJQUFhLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFdkYsZ0JBQWdCO0lBQ2hCLFlBQVksQ0FBQyxVQUF3QjtRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQy9GLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsV0FBVyxDQUFDLEtBQWEsSUFBWSxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRixDQUFDO0FBeERDO0lBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQzs7dUNBQUE7QUFJOUI7SUFBQyxLQUFLLEVBQUU7Ozt3Q0FBQTtBQVRWO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBQyxDQUFDOztZQUFBO0FBNkRuQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVGVtcGxhdGVSZWYsXG4gIENvbnRlbnRDaGlsZHJlbixcbiAgUXVlcnlMaXN0LFxuICBBdHRyaWJ1dGUsXG4gIEFmdGVyQ29udGVudEluaXQsXG4gIElucHV0XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIE51bWJlcldyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7U3dpdGNoVmlld30gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuXG5jb25zdCBfQ0FURUdPUllfREVGQVVMVCA9ICdvdGhlcic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0xvY2FsaXphdGlvbiB7IGFic3RyYWN0IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnkpOiBzdHJpbmc7IH1cblxuLyoqXG4gKiBgbmdQbHVyYWxgIGlzIGFuIGkxOG4gZGlyZWN0aXZlIHRoYXQgZGlzcGxheXMgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUsIG9yIGZhaWxpbmcgdGhhdCwgRE9NIHN1Yi10cmVlcyB0aGF0IG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbidzIHBsdXJhbGl6YXRpb24gY2F0ZWdvcnkuXG4gKlxuICogVG8gdXNlIHRoaXMgZGlyZWN0aXZlLCB5b3UgbXVzdCBwcm92aWRlIGFuIGV4dGVuc2lvbiBvZiBgTmdMb2NhbGl6YXRpb25gIHRoYXQgbWFwcyB2YWx1ZXMgdG9cbiAqIGNhdGVnb3J5IG5hbWVzLiBZb3UgdGhlbiBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCB0aGF0IHNldHMgdGhlIGBbbmdQbHVyYWxdYCBhdHRyaWJ1dGUgdG8gYVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKiAgICAtIElubmVyIGVsZW1lbnRzIGRlZmluZWQgd2l0aCBhbiBgW25nUGx1cmFsQ2FzZV1gIGF0dHJpYnV0ZSB3aWxsIGRpc3BsYXkgYmFzZWQgb24gdGhlaXJcbiAqIGV4cHJlc3Npb24uXG4gKiAgICAtIElmIGBbbmdQbHVyYWxDYXNlXWAgaXMgc2V0IHRvIGEgdmFsdWUgc3RhcnRpbmcgd2l0aCBgPWAsIGl0IHdpbGwgb25seSBkaXNwbGF5IGlmIHRoZSB2YWx1ZVxuICogbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24gZXhhY3RseS5cbiAqICAgIC0gT3RoZXJ3aXNlLCB0aGUgdmlldyB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBcImNhdGVnb3J5IG1hdGNoXCIsIGFuZCB3aWxsIG9ubHkgZGlzcGxheSBpZiBleGFjdFxuICogdmFsdWUgbWF0Y2hlcyBhcmVuJ3QgZm91bmQgYW5kIHRoZSB2YWx1ZSBtYXBzIHRvIGl0cyBjYXRlZ29yeSB1c2luZyB0aGUgYGdldFBsdXJhbENhdGVnb3J5YFxuICogZnVuY3Rpb24gcHJvdmlkZWQuXG4gKlxuICogSWYgbm8gbWF0Y2hpbmcgdmlld3MgYXJlIGZvdW5kIGZvciBhIHN3aXRjaCBleHByZXNzaW9uLCBpbm5lciBlbGVtZW50cyBtYXJrZWRcbiAqIGBbbmdQbHVyYWxDYXNlXT1cIm90aGVyXCJgIHdpbGwgYmUgZGlzcGxheWVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNsYXNzIE15TG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICogICAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSkge1xuICogICAgICAgaWYodmFsdWUgPCA1KSB7XG4gKiAgICAgICAgICByZXR1cm4gJ2Zldyc7XG4gKiAgICAgICB9XG4gKiAgICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgICBwcm92aWRlcnM6IFtwcm92aWRlKE5nTG9jYWxpemF0aW9uLCB7dXNlQ2xhc3M6IE15TG9jYWxpemF0aW9ufSldXG4gKiB9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxwPlZhbHVlID0ge3t2YWx1ZX19PC9wPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cImluYygpXCI+SW5jcmVtZW50PC9idXR0b24+XG4gKlxuICogICAgIDxkaXYgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj50aGVyZSBpcyBub3RoaW5nPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MVwiPnRoZXJlIGlzIG9uZTwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiZmV3XCI+dGhlcmUgYXJlIGEgZmV3PC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCJvdGhlclwiPnRoZXJlIGlzIHNvbWUgbnVtYmVyPC90ZW1wbGF0ZT5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nUGx1cmFsLCBOZ1BsdXJhbENhc2VdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlID0gJ2luaXQnO1xuICpcbiAqICAgaW5jKCkge1xuICogICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID09PSAnaW5pdCcgPyAwIDogdGhpcy52YWx1ZSArIDE7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBgYGBcbiAqL1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWxDYXNlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogU3dpdGNoVmlldztcbiAgY29uc3RydWN0b3IoQEF0dHJpYnV0ZSgnbmdQbHVyYWxDYXNlJykgcHVibGljIHZhbHVlOiBzdHJpbmcsIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxPYmplY3Q+LFxuICAgICAgICAgICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgdGhpcy5fdmlldyA9IG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlKTtcbiAgfVxufVxuXG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nUGx1cmFsXSd9KVxuZXhwb3J0IGNsYXNzIE5nUGx1cmFsIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCB7XG4gIHByaXZhdGUgX3N3aXRjaFZhbHVlOiBudW1iZXI7XG4gIHByaXZhdGUgX2FjdGl2ZVZpZXc6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX2Nhc2VWaWV3cyA9IG5ldyBNYXA8YW55LCBTd2l0Y2hWaWV3PigpO1xuICBAQ29udGVudENoaWxkcmVuKE5nUGx1cmFsQ2FzZSkgY2FzZXM6IFF1ZXJ5TGlzdDxOZ1BsdXJhbENhc2U+ID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uKSB7fVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1BsdXJhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fc3dpdGNoVmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5jYXNlcy5mb3JFYWNoKChwbHVyYWxDYXNlOiBOZ1BsdXJhbENhc2UpOiB2b2lkID0+IHtcbiAgICAgIHRoaXMuX2Nhc2VWaWV3cy5zZXQodGhpcy5fZm9ybWF0VmFsdWUocGx1cmFsQ2FzZSksIHBsdXJhbENhc2UuX3ZpZXcpO1xuICAgIH0pO1xuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VwZGF0ZVZpZXcoKTogdm9pZCB7XG4gICAgdGhpcy5fY2xlYXJWaWV3cygpO1xuXG4gICAgdmFyIHZpZXc6IFN3aXRjaFZpZXcgPSB0aGlzLl9jYXNlVmlld3MuZ2V0KHRoaXMuX3N3aXRjaFZhbHVlKTtcbiAgICBpZiAoIWlzUHJlc2VudCh2aWV3KSkgdmlldyA9IHRoaXMuX2dldENhdGVnb3J5Vmlldyh0aGlzLl9zd2l0Y2hWYWx1ZSk7XG5cbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXcodmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbGVhclZpZXdzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fYWN0aXZlVmlldykpIHRoaXMuX2FjdGl2ZVZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWN0aXZhdGVWaWV3KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAoIWlzUHJlc2VudCh2aWV3KSkgcmV0dXJuO1xuICAgIHRoaXMuX2FjdGl2ZVZpZXcgPSB2aWV3O1xuICAgIHRoaXMuX2FjdGl2ZVZpZXcuY3JlYXRlKCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9nZXRDYXRlZ29yeVZpZXcodmFsdWU6IG51bWJlcik6IFN3aXRjaFZpZXcge1xuICAgIHZhciBjYXRlZ29yeTogc3RyaW5nID0gdGhpcy5fbG9jYWxpemF0aW9uLmdldFBsdXJhbENhdGVnb3J5KHZhbHVlKTtcbiAgICB2YXIgY2F0ZWdvcnlWaWV3OiBTd2l0Y2hWaWV3ID0gdGhpcy5fY2FzZVZpZXdzLmdldChjYXRlZ29yeSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChjYXRlZ29yeVZpZXcpID8gY2F0ZWdvcnlWaWV3IDogdGhpcy5fY2FzZVZpZXdzLmdldChfQ0FURUdPUllfREVGQVVMVCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9pc1ZhbHVlVmlldyhwbHVyYWxDYXNlOiBOZ1BsdXJhbENhc2UpOiBib29sZWFuIHsgcmV0dXJuIHBsdXJhbENhc2UudmFsdWVbMF0gPT09IFwiPVwiOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZm9ybWF0VmFsdWUocGx1cmFsQ2FzZTogTmdQbHVyYWxDYXNlKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5faXNWYWx1ZVZpZXcocGx1cmFsQ2FzZSkgPyB0aGlzLl9zdHJpcFZhbHVlKHBsdXJhbENhc2UudmFsdWUpIDogcGx1cmFsQ2FzZS52YWx1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmlwVmFsdWUodmFsdWU6IHN0cmluZyk6IG51bWJlciB7IHJldHVybiBOdW1iZXJXcmFwcGVyLnBhcnNlSW50KHZhbHVlLnN1YnN0cmluZygxKSwgMTApOyB9XG59XG4iXX0=
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

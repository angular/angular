'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var _WHEN_DEFAULT = lang_1.CONST_EXPR(new Object());
var SwitchView = (function () {
    function SwitchView(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
    }
    SwitchView.prototype.create = function () { this._viewContainerRef.createEmbeddedView(this._templateRef); };
    SwitchView.prototype.destroy = function () { this._viewContainerRef.clear(); };
    return SwitchView;
})();
/**
 * Adds or removes DOM sub-trees when their match expressions match the switch expression.
 *
 * Elements within `NgSwitch` but without `NgSwitchWhen` or `NgSwitchDefault` directives will be
 * preserved at the location as specified in the template.
 *
 * `NgSwitch` simply inserts nested elements based on which match expression matches the value
 * obtained from the evaluated switch expression. In other words, you define a container element
 * (where you place the directive with a switch expression on the
 * **`[ng-switch]="..."` attribute**), define any inner elements inside of the directive and
 * place a `[ng-switch-when]` attribute per element.
 *
 * The `ng-switch-when` property is used to inform `NgSwitch` which element to display when the
 * expression is evaluated. If a matching expression is not found via a `ng-switch-when` property
 * then an element with the `ng-switch-default` attribute is displayed.
 *
 * ### Example ([live demo](http://plnkr.co/edit/DQMTII95CbuqWrl3lYAs?p=preview))
 *
 * ```typescript
 * @Component({selector: 'app'})
 * @View({
 *   template: `
 *     <p>Value = {{value}}</p>
 *     <button (click)="inc()">Increment</button>
 *
 *     <div [ng-switch]="value">
 *       <p *ng-switch-when="'init'">increment to start</p>
 *       <p *ng-switch-when="0">0, increment again</p>
 *       <p *ng-switch-when="1">1, increment again</p>
 *       <p *ng-switch-when="2">2, stop incrementing</p>
 *       <p *ng-switch-default>&gt; 2, STOP!</p>
 *     </div>
 *
 *     <!-- alternate syntax -->
 *
 *     <p [ng-switch]="value">
 *       <template ng-switch-when="init">increment to start</template>
 *       <template [ng-switch-when]="0">0, increment again</template>
 *       <template [ng-switch-when]="1">1, increment again</template>
 *       <template [ng-switch-when]="2">2, stop incrementing</template>
 *       <template ng-switch-default>&gt; 2, STOP!</template>
 *     </p>
 *   `,
 *   directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault]
 * })
 * export class App {
 *   value = 'init';
 *
 *   inc() {
 *     this.value = this.value === 'init' ? 0 : this.value + 1;
 *   }
 * }
 *
 * bootstrap(App).catch(err => console.error(err));
 * ```
 */
var NgSwitch = (function () {
    function NgSwitch() {
        this._useDefault = false;
        this._valueViews = new collection_1.Map();
        this._activeViews = [];
    }
    Object.defineProperty(NgSwitch.prototype, "ngSwitch", {
        set: function (value) {
            // Empty the currently active ViewContainers
            this._emptyAllActiveViews();
            // Add the ViewContainers matching the value (with a fallback to default)
            this._useDefault = false;
            var views = this._valueViews.get(value);
            if (lang_1.isBlank(views)) {
                this._useDefault = true;
                views = lang_1.normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
            }
            this._activateViews(views);
            this._switchValue = value;
        },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    NgSwitch.prototype._onWhenValueChanged = function (oldWhen, newWhen, view) {
        this._deregisterView(oldWhen, view);
        this._registerView(newWhen, view);
        if (oldWhen === this._switchValue) {
            view.destroy();
            collection_1.ListWrapper.remove(this._activeViews, view);
        }
        else if (newWhen === this._switchValue) {
            if (this._useDefault) {
                this._useDefault = false;
                this._emptyAllActiveViews();
            }
            view.create();
            this._activeViews.push(view);
        }
        // Switch to default when there is no more active ViewContainers
        if (this._activeViews.length === 0 && !this._useDefault) {
            this._useDefault = true;
            this._activateViews(this._valueViews.get(_WHEN_DEFAULT));
        }
    };
    /** @internal */
    NgSwitch.prototype._emptyAllActiveViews = function () {
        var activeContainers = this._activeViews;
        for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
        }
        this._activeViews = [];
    };
    /** @internal */
    NgSwitch.prototype._activateViews = function (views) {
        // TODO(vicb): assert(this._activeViews.length === 0);
        if (lang_1.isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
                views[i].create();
            }
            this._activeViews = views;
        }
    };
    /** @internal */
    NgSwitch.prototype._registerView = function (value, view) {
        var views = this._valueViews.get(value);
        if (lang_1.isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
        }
        views.push(view);
    };
    /** @internal */
    NgSwitch.prototype._deregisterView = function (value, view) {
        // `_WHEN_DEFAULT` is used a marker for non-registered whens
        if (value === _WHEN_DEFAULT)
            return;
        var views = this._valueViews.get(value);
        if (views.length == 1) {
            this._valueViews.delete(value);
        }
        else {
            collection_1.ListWrapper.remove(views, view);
        }
    };
    NgSwitch = __decorate([
        core_1.Directive({ selector: '[ng-switch]', inputs: ['ngSwitch'] }), 
        __metadata('design:paramtypes', [])
    ], NgSwitch);
    return NgSwitch;
})();
exports.NgSwitch = NgSwitch;
/**
 * Insert the sub-tree when the `ng-switch-when` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchWhen = (function () {
    function NgSwitchWhen(viewContainer, templateRef, ngSwitch) {
        // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
        /** @internal */
        this._value = _WHEN_DEFAULT;
        this._switch = ngSwitch;
        this._view = new SwitchView(viewContainer, templateRef);
    }
    Object.defineProperty(NgSwitchWhen.prototype, "ngSwitchWhen", {
        set: function (value) {
            this._switch._onWhenValueChanged(this._value, value, this._view);
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    NgSwitchWhen = __decorate([
        core_1.Directive({ selector: '[ng-switch-when]', inputs: ['ngSwitchWhen'] }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchWhen);
    return NgSwitchWhen;
})();
exports.NgSwitchWhen = NgSwitchWhen;
/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
var NgSwitchDefault = (function () {
    function NgSwitchDefault(viewContainer, templateRef, sswitch) {
        sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
    }
    NgSwitchDefault = __decorate([
        core_1.Directive({ selector: '[ng-switch-default]' }),
        __param(2, core_1.Host()), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.TemplateRef, NgSwitch])
    ], NgSwitchDefault);
    return NgSwitchDefault;
})();
exports.NgSwitchDefault = NgSwitchDefault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6WyJTd2l0Y2hWaWV3IiwiU3dpdGNoVmlldy5jb25zdHJ1Y3RvciIsIlN3aXRjaFZpZXcuY3JlYXRlIiwiU3dpdGNoVmlldy5kZXN0cm95IiwiTmdTd2l0Y2giLCJOZ1N3aXRjaC5jb25zdHJ1Y3RvciIsIk5nU3dpdGNoLm5nU3dpdGNoIiwiTmdTd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCIsIk5nU3dpdGNoLl9lbXB0eUFsbEFjdGl2ZVZpZXdzIiwiTmdTd2l0Y2guX2FjdGl2YXRlVmlld3MiLCJOZ1N3aXRjaC5fcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2guX2RlcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2hXaGVuIiwiTmdTd2l0Y2hXaGVuLmNvbnN0cnVjdG9yIiwiTmdTd2l0Y2hXaGVuLm5nU3dpdGNoV2hlbiIsIk5nU3dpdGNoRGVmYXVsdCIsIk5nU3dpdGNoRGVmYXVsdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFDN0UscUJBQTZELDBCQUEwQixDQUFDLENBQUE7QUFDeEYsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFFaEUsSUFBTSxhQUFhLEdBQUcsaUJBQVUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFFL0M7SUFDRUEsb0JBQW9CQSxpQkFBbUNBLEVBQVVBLFlBQXlCQTtRQUF0RUMsc0JBQWlCQSxHQUFqQkEsaUJBQWlCQSxDQUFrQkE7UUFBVUEsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWFBO0lBQUdBLENBQUNBO0lBRTlGRCwyQkFBTUEsR0FBTkEsY0FBaUJFLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxD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Q0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBTEhEO1FBQUNBLGdCQUFTQSxDQUFDQSxFQUFDQSxRQUFRQSxFQUFFQSxxQkFBcUJBLEVBQUNBLENBQUNBO1FBRy9CQSxXQUFDQSxXQUFJQSxFQUFFQSxDQUFBQTs7d0JBR3BCQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFORCxJQU1DO0FBTFksdUJBQWUsa0JBSzNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgSG9zdCwgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWZ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIG5vcm1hbGl6ZUJsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5jb25zdCBfV0hFTl9ERUZBVUxUID0gQ09OU1RfRVhQUihuZXcgT2JqZWN0KCkpO1xuXG5jbGFzcyBTd2l0Y2hWaWV3IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgcHJpdmF0ZSBfdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmKSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpOyB9XG59XG5cbi8qKlxuICogQWRkcyBvciByZW1vdmVzIERPTSBzdWItdHJlZXMgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9ucyBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogRWxlbWVudHMgd2l0aGluIGBOZ1N3aXRjaGAgYnV0IHdpdGhvdXQgYE5nU3dpdGNoV2hlbmAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsIGJlXG4gKiBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uIGFzIHNwZWNpZmllZCBpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogYE5nU3dpdGNoYCBzaW1wbHkgaW5zZXJ0cyBuZXN0ZWQgZWxlbWVudHMgYmFzZWQgb24gd2hpY2ggbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSB2YWx1ZVxuICogb2J0YWluZWQgZnJvbSB0aGUgZXZhbHVhdGVkIHN3aXRjaCBleHByZXNzaW9uLiBJbiBvdGhlciB3b3JkcywgeW91IGRlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50XG4gKiAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogKipgW25nLXN3aXRjaF09XCIuLi5cImAgYXR0cmlidXRlKiopLCBkZWZpbmUgYW55IGlubmVyIGVsZW1lbnRzIGluc2lkZSBvZiB0aGUgZGlyZWN0aXZlIGFuZFxuICogcGxhY2UgYSBgW25nLXN3aXRjaC13aGVuXWAgYXR0cmlidXRlIHBlciBlbGVtZW50LlxuICpcbiAqIFRoZSBgbmctc3dpdGNoLXdoZW5gIHByb3BlcnR5IGlzIHVzZWQgdG8gaW5mb3JtIGBOZ1N3aXRjaGAgd2hpY2ggZWxlbWVudCB0byBkaXNwbGF5IHdoZW4gdGhlXG4gKiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZC4gSWYgYSBtYXRjaGluZyBleHByZXNzaW9uIGlzIG5vdCBmb3VuZCB2aWEgYSBgbmctc3dpdGNoLXdoZW5gIHByb3BlcnR5XG4gKiB0aGVuIGFuIGVsZW1lbnQgd2l0aCB0aGUgYG5nLXN3aXRjaC1kZWZhdWx0YCBhdHRyaWJ1dGUgaXMgZGlzcGxheWVkLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9EUU1USUk5NUNidXFXcmwzbFlBcz9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe3NlbGVjdG9yOiAnYXBwJ30pXG4gKiBAVmlldyh7XG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPHA+VmFsdWUgPSB7e3ZhbHVlfX08L3A+XG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwiaW5jKClcIj5JbmNyZW1lbnQ8L2J1dHRvbj5cbiAqXG4gKiAgICAgPGRpdiBbbmctc3dpdGNoXT1cInZhbHVlXCI+XG4gKiAgICAgICA8cCAqbmctc3dpdGNoLXdoZW49XCInaW5pdCdcIj5pbmNyZW1lbnQgdG8gc3RhcnQ8L3A+XG4gKiAgICAgICA8cCAqbmctc3dpdGNoLXdoZW49XCIwXCI+MCwgaW5jcmVtZW50IGFnYWluPC9wPlxuICogICAgICAgPHAgKm5nLXN3aXRjaC13aGVuPVwiMVwiPjEsIGluY3JlbWVudCBhZ2FpbjwvcD5cbiAqICAgICAgIDxwICpuZy1zd2l0Y2gtd2hlbj1cIjJcIj4yLCBzdG9wIGluY3JlbWVudGluZzwvcD5cbiAqICAgICAgIDxwICpuZy1zd2l0Y2gtZGVmYXVsdD4mZ3Q7IDIsIFNUT1AhPC9wPlxuICogICAgIDwvZGl2PlxuICpcbiAqICAgICA8IS0tIGFsdGVybmF0ZSBzeW50YXggLS0+XG4gKlxuICogICAgIDxwIFtuZy1zd2l0Y2hdPVwidmFsdWVcIj5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZy1zd2l0Y2gtd2hlbj1cImluaXRcIj5pbmNyZW1lbnQgdG8gc3RhcnQ8L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZy1zd2l0Y2gtd2hlbl09XCIwXCI+MCwgaW5jcmVtZW50IGFnYWluPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmctc3dpdGNoLXdoZW5dPVwiMVwiPjEsIGluY3JlbWVudCBhZ2FpbjwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nLXN3aXRjaC13aGVuXT1cIjJcIj4yLCBzdG9wIGluY3JlbWVudGluZzwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgbmctc3dpdGNoLWRlZmF1bHQ+Jmd0OyAyLCBTVE9QITwvdGVtcGxhdGU+XG4gKiAgICAgPC9wPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbTmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0XVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHAge1xuICogICB2YWx1ZSA9ICdpbml0JztcbiAqXG4gKiAgIGluYygpIHtcbiAqICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA9PT0gJ2luaXQnID8gMCA6IHRoaXMudmFsdWUgKyAxO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCkuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctc3dpdGNoXScsIGlucHV0czogWyduZ1N3aXRjaCddfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaCB7XG4gIHByaXZhdGUgX3N3aXRjaFZhbHVlOiBhbnk7XG4gIHByaXZhdGUgX3VzZURlZmF1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdmFsdWVWaWV3cyA9IG5ldyBNYXA8YW55LCBTd2l0Y2hWaWV3W10+KCk7XG4gIHByaXZhdGUgX2FjdGl2ZVZpZXdzOiBTd2l0Y2hWaWV3W10gPSBbXTtcblxuICBzZXQgbmdTd2l0Y2godmFsdWUpIHtcbiAgICAvLyBFbXB0eSB0aGUgY3VycmVudGx5IGFjdGl2ZSBWaWV3Q29udGFpbmVyc1xuICAgIHRoaXMuX2VtcHR5QWxsQWN0aXZlVmlld3MoKTtcblxuICAgIC8vIEFkZCB0aGUgVmlld0NvbnRhaW5lcnMgbWF0Y2hpbmcgdGhlIHZhbHVlICh3aXRoIGEgZmFsbGJhY2sgdG8gZGVmYXVsdClcbiAgICB0aGlzLl91c2VEZWZhdWx0ID0gZmFsc2U7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmIChpc0JsYW5rKHZpZXdzKSkge1xuICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IHRydWU7XG4gICAgICB2aWV3cyA9IG5vcm1hbGl6ZUJsYW5rKHRoaXMuX3ZhbHVlVmlld3MuZ2V0KF9XSEVOX0RFRkFVTFQpKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3cyh2aWV3cyk7XG5cbiAgICB0aGlzLl9zd2l0Y2hWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfb25XaGVuVmFsdWVDaGFuZ2VkKG9sZFdoZW4sIG5ld1doZW4sIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXJlZ2lzdGVyVmlldyhvbGRXaGVuLCB2aWV3KTtcbiAgICB0aGlzLl9yZWdpc3RlclZpZXcobmV3V2hlbiwgdmlldyk7XG5cbiAgICBpZiAob2xkV2hlbiA9PT0gdGhpcy5fc3dpdGNoVmFsdWUpIHtcbiAgICAgIHZpZXcuZGVzdHJveSgpO1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2FjdGl2ZVZpZXdzLCB2aWV3KTtcbiAgICB9IGVsc2UgaWYgKG5ld1doZW4gPT09IHRoaXMuX3N3aXRjaFZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5fdXNlRGVmYXVsdCkge1xuICAgICAgICB0aGlzLl91c2VEZWZhdWx0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2VtcHR5QWxsQWN0aXZlVmlld3MoKTtcbiAgICAgIH1cbiAgICAgIHZpZXcuY3JlYXRlKCk7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3cy5wdXNoKHZpZXcpO1xuICAgIH1cblxuICAgIC8vIFN3aXRjaCB0byBkZWZhdWx0IHdoZW4gdGhlcmUgaXMgbm8gbW9yZSBhY3RpdmUgVmlld0NvbnRhaW5lcnNcbiAgICBpZiAodGhpcy5fYWN0aXZlVmlld3MubGVuZ3RoID09PSAwICYmICF0aGlzLl91c2VEZWZhdWx0KSB7XG4gICAgICB0aGlzLl91c2VEZWZhdWx0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2FjdGl2YXRlVmlld3ModGhpcy5fdmFsdWVWaWV3cy5nZXQoX1dIRU5fREVGQVVMVCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2VtcHR5QWxsQWN0aXZlVmlld3MoKTogdm9pZCB7XG4gICAgdmFyIGFjdGl2ZUNvbnRhaW5lcnMgPSB0aGlzLl9hY3RpdmVWaWV3cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdGl2ZUNvbnRhaW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFjdGl2ZUNvbnRhaW5lcnNbaV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVWaWV3cyA9IFtdO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWN0aXZhdGVWaWV3cyh2aWV3czogU3dpdGNoVmlld1tdKTogdm9pZCB7XG4gICAgLy8gVE9ETyh2aWNiKTogYXNzZXJ0KHRoaXMuX2FjdGl2ZVZpZXdzLmxlbmd0aCA9PT0gMCk7XG4gICAgaWYgKGlzUHJlc2VudCh2aWV3cykpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmlld3NbaV0uY3JlYXRlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3cyA9IHZpZXdzO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlZ2lzdGVyVmlldyh2YWx1ZSwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAoaXNCbGFuayh2aWV3cykpIHtcbiAgICAgIHZpZXdzID0gW107XG4gICAgICB0aGlzLl92YWx1ZVZpZXdzLnNldCh2YWx1ZSwgdmlld3MpO1xuICAgIH1cbiAgICB2aWV3cy5wdXNoKHZpZXcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGVyZWdpc3RlclZpZXcodmFsdWUsIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICAvLyBgX1dIRU5fREVGQVVMVGAgaXMgdXNlZCBhIG1hcmtlciBmb3Igbm9uLXJlZ2lzdGVyZWQgd2hlbnNcbiAgICBpZiAodmFsdWUgPT09IF9XSEVOX0RFRkFVTFQpIHJldHVybjtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKHZpZXdzLmxlbmd0aCA9PSAxKSB7XG4gICAgICB0aGlzLl92YWx1ZVZpZXdzLmRlbGV0ZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZSh2aWV3cywgdmlldyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBzdWItdHJlZSB3aGVuIHRoZSBgbmctc3dpdGNoLXdoZW5gIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZVxuICogZW5jbG9zaW5nIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb24gbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBhbGwgb2YgdGhlbSBhcmUgZGlzcGxheWVkLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nLXN3aXRjaC13aGVuXScsIGlucHV0czogWyduZ1N3aXRjaFdoZW4nXX0pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hXaGVuIHtcbiAgLy8gYF9XSEVOX0RFRkFVTFRgIGlzIHVzZWQgYXMgYSBtYXJrZXIgZm9yIGEgbm90IHlldCBpbml0aWFsaXplZCB2YWx1ZVxuICAvKiogQGludGVybmFsICovXG4gIF92YWx1ZTogYW55ID0gX1dIRU5fREVGQVVMVDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlldzogU3dpdGNoVmlldztcbiAgcHJpdmF0ZSBfc3dpdGNoOiBOZ1N3aXRjaDtcblxuICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYsXG4gICAgICAgICAgICAgIEBIb3N0KCkgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgdGhpcy5fc3dpdGNoID0gbmdTd2l0Y2g7XG4gICAgdGhpcy5fdmlldyA9IG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKTtcbiAgfVxuXG4gIHNldCBuZ1N3aXRjaFdoZW4odmFsdWUpIHtcbiAgICB0aGlzLl9zd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCh0aGlzLl92YWx1ZSwgdmFsdWUsIHRoaXMuX3ZpZXcpO1xuICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IGNhc2Ugc3RhdGVtZW50cyBhcmUgZGlzcGxheWVkIHdoZW4gbm8gbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvblxuICogdmFsdWUuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctc3dpdGNoLWRlZmF1bHRdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hEZWZhdWx0IHtcbiAgY29uc3RydWN0b3Iodmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLFxuICAgICAgICAgICAgICBASG9zdCgpIHNzd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgc3N3aXRjaC5fcmVnaXN0ZXJWaWV3KF9XSEVOX0RFRkFVTFQsIG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==
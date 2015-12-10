'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6WyJTd2l0Y2hWaWV3IiwiU3dpdGNoVmlldy5jb25zdHJ1Y3RvciIsIlN3aXRjaFZpZXcuY3JlYXRlIiwiU3dpdGNoVmlldy5kZXN0cm95IiwiTmdTd2l0Y2giLCJOZ1N3aXRjaC5jb25zdHJ1Y3RvciIsIk5nU3dpdGNoLm5nU3dpdGNoIiwiTmdTd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCIsIk5nU3dpdGNoLl9lbXB0eUFsbEFjdGl2ZVZpZXdzIiwiTmdTd2l0Y2guX2FjdGl2YXRlVmlld3MiLCJOZ1N3aXRjaC5fcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2guX2RlcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2hXaGVuIiwiTmdTd2l0Y2hXaGVuLmNvbnN0cnVjdG9yIiwiTmdTd2l0Y2hXaGVuLm5nU3dpdGNoV2hlbiIsIk5nU3dpdGNoRGVmYXVsdCIsIk5nU3dpdGNoRGVmYXVsdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTZELGVBQWUsQ0FBQyxDQUFBO0FBQzdFLHFCQUE2RCwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hGLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRWhFLElBQU0sYUFBYSxHQUFHLGlCQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRS9DO0lBQ0VBLG9CQUFvQkEsaUJBQW1DQSxFQUFVQSxZQUF5QkE7UUFBdEVDLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBQVVBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFhQTtJQUFHQSxDQUFDQTtJQUU5RkQsMkJBQU1BLEdBQU5BLGNBQWlCRSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FB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QUNBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUxIRDtRQUFDQSxnQkFBU0EsQ0FBQ0EsRUFBQ0EsUUFBUUEsRUFBRUEscUJBQXFCQSxFQUFDQSxDQUFDQTtRQUcvQkEsV0FBQ0EsV0FBSUEsRUFBRUEsQ0FBQUE7O3dCQUdwQkE7SUFBREEsc0JBQUNBO0FBQURBLENBQUNBLEFBTkQsSUFNQztBQUxZLHVCQUFlLGtCQUszQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEhvc3QsIFZpZXdDb250YWluZXJSZWYsIFRlbXBsYXRlUmVmfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBub3JtYWxpemVCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuY29uc3QgX1dIRU5fREVGQVVMVCA9IENPTlNUX0VYUFIobmV3IE9iamVjdCgpKTtcblxuY2xhc3MgU3dpdGNoVmlldyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge31cblxuICBjcmVhdGUoKTogdm9pZCB7IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX3RlbXBsYXRlUmVmKTsgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX3ZpZXdDb250YWluZXJSZWYuY2xlYXIoKTsgfVxufVxuXG4vKipcbiAqIEFkZHMgb3IgcmVtb3ZlcyBET00gc3ViLXRyZWVzIHdoZW4gdGhlaXIgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIEVsZW1lbnRzIHdpdGhpbiBgTmdTd2l0Y2hgIGJ1dCB3aXRob3V0IGBOZ1N3aXRjaFdoZW5gIG9yIGBOZ1N3aXRjaERlZmF1bHRgIGRpcmVjdGl2ZXMgd2lsbCBiZVxuICogcHJlc2VydmVkIGF0IHRoZSBsb2NhdGlvbiBhcyBzcGVjaWZpZWQgaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIGBOZ1N3aXRjaGAgc2ltcGx5IGluc2VydHMgbmVzdGVkIGVsZW1lbnRzIGJhc2VkIG9uIHdoaWNoIG1hdGNoIGV4cHJlc3Npb24gbWF0Y2hlcyB0aGUgdmFsdWVcbiAqIG9idGFpbmVkIGZyb20gdGhlIGV2YWx1YXRlZCBzd2l0Y2ggZXhwcmVzc2lvbi4gSW4gb3RoZXIgd29yZHMsIHlvdSBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudFxuICogKHdoZXJlIHlvdSBwbGFjZSB0aGUgZGlyZWN0aXZlIHdpdGggYSBzd2l0Y2ggZXhwcmVzc2lvbiBvbiB0aGVcbiAqICoqYFtuZy1zd2l0Y2hdPVwiLi4uXCJgIGF0dHJpYnV0ZSoqKSwgZGVmaW5lIGFueSBpbm5lciBlbGVtZW50cyBpbnNpZGUgb2YgdGhlIGRpcmVjdGl2ZSBhbmRcbiAqIHBsYWNlIGEgYFtuZy1zd2l0Y2gtd2hlbl1gIGF0dHJpYnV0ZSBwZXIgZWxlbWVudC5cbiAqXG4gKiBUaGUgYG5nLXN3aXRjaC13aGVuYCBwcm9wZXJ0eSBpcyB1c2VkIHRvIGluZm9ybSBgTmdTd2l0Y2hgIHdoaWNoIGVsZW1lbnQgdG8gZGlzcGxheSB3aGVuIHRoZVxuICogZXhwcmVzc2lvbiBpcyBldmFsdWF0ZWQuIElmIGEgbWF0Y2hpbmcgZXhwcmVzc2lvbiBpcyBub3QgZm91bmQgdmlhIGEgYG5nLXN3aXRjaC13aGVuYCBwcm9wZXJ0eVxuICogdGhlbiBhbiBlbGVtZW50IHdpdGggdGhlIGBuZy1zd2l0Y2gtZGVmYXVsdGAgYXR0cmlidXRlIGlzIGRpc3BsYXllZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRFFNVElJOTVDYnVxV3JsM2xZQXM/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtzZWxlY3RvcjogJ2FwcCd9KVxuICogQFZpZXcoe1xuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxwPlZhbHVlID0ge3t2YWx1ZX19PC9wPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cImluYygpXCI+SW5jcmVtZW50PC9idXR0b24+XG4gKlxuICogICAgIDxkaXYgW25nLXN3aXRjaF09XCJ2YWx1ZVwiPlxuICogICAgICAgPHAgKm5nLXN3aXRjaC13aGVuPVwiJ2luaXQnXCI+aW5jcmVtZW50IHRvIHN0YXJ0PC9wPlxuICogICAgICAgPHAgKm5nLXN3aXRjaC13aGVuPVwiMFwiPjAsIGluY3JlbWVudCBhZ2FpbjwvcD5cbiAqICAgICAgIDxwICpuZy1zd2l0Y2gtd2hlbj1cIjFcIj4xLCBpbmNyZW1lbnQgYWdhaW48L3A+XG4gKiAgICAgICA8cCAqbmctc3dpdGNoLXdoZW49XCIyXCI+Miwgc3RvcCBpbmNyZW1lbnRpbmc8L3A+XG4gKiAgICAgICA8cCAqbmctc3dpdGNoLWRlZmF1bHQ+Jmd0OyAyLCBTVE9QITwvcD5cbiAqICAgICA8L2Rpdj5cbiAqXG4gKiAgICAgPCEtLSBhbHRlcm5hdGUgc3ludGF4IC0tPlxuICpcbiAqICAgICA8cCBbbmctc3dpdGNoXT1cInZhbHVlXCI+XG4gKiAgICAgICA8dGVtcGxhdGUgbmctc3dpdGNoLXdoZW49XCJpbml0XCI+aW5jcmVtZW50IHRvIHN0YXJ0PC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmctc3dpdGNoLXdoZW5dPVwiMFwiPjAsIGluY3JlbWVudCBhZ2FpbjwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nLXN3aXRjaC13aGVuXT1cIjFcIj4xLCBpbmNyZW1lbnQgYWdhaW48L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZy1zd2l0Y2gtd2hlbl09XCIyXCI+Miwgc3RvcCBpbmNyZW1lbnRpbmc8L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIG5nLXN3aXRjaC1kZWZhdWx0PiZndDsgMiwgU1RPUCE8L3RlbXBsYXRlPlxuICogICAgIDwvcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW05nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdF1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwIHtcbiAqICAgdmFsdWUgPSAnaW5pdCc7XG4gKlxuICogICBpbmMoKSB7XG4gKiAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgPT09ICdpbml0JyA/IDAgOiB0aGlzLnZhbHVlICsgMTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nLXN3aXRjaF0nLCBpbnB1dHM6IFsnbmdTd2l0Y2gnXX0pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2gge1xuICBwcml2YXRlIF9zd2l0Y2hWYWx1ZTogYW55O1xuICBwcml2YXRlIF91c2VEZWZhdWx0OiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3ZhbHVlVmlld3MgPSBuZXcgTWFwPGFueSwgU3dpdGNoVmlld1tdPigpO1xuICBwcml2YXRlIF9hY3RpdmVWaWV3czogU3dpdGNoVmlld1tdID0gW107XG5cbiAgc2V0IG5nU3dpdGNoKHZhbHVlKSB7XG4gICAgLy8gRW1wdHkgdGhlIGN1cnJlbnRseSBhY3RpdmUgVmlld0NvbnRhaW5lcnNcbiAgICB0aGlzLl9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk7XG5cbiAgICAvLyBBZGQgdGhlIFZpZXdDb250YWluZXJzIG1hdGNoaW5nIHRoZSB2YWx1ZSAod2l0aCBhIGZhbGxiYWNrIHRvIGRlZmF1bHQpXG4gICAgdGhpcy5fdXNlRGVmYXVsdCA9IGZhbHNlO1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAoaXNCbGFuayh2aWV3cykpIHtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSB0cnVlO1xuICAgICAgdmlld3MgPSBub3JtYWxpemVCbGFuayh0aGlzLl92YWx1ZVZpZXdzLmdldChfV0hFTl9ERUZBVUxUKSk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2YXRlVmlld3Modmlld3MpO1xuXG4gICAgdGhpcy5fc3dpdGNoVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX29uV2hlblZhbHVlQ2hhbmdlZChvbGRXaGVuLCBuZXdXaGVuLCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgdGhpcy5fZGVyZWdpc3RlclZpZXcob2xkV2hlbiwgdmlldyk7XG4gICAgdGhpcy5fcmVnaXN0ZXJWaWV3KG5ld1doZW4sIHZpZXcpO1xuXG4gICAgaWYgKG9sZFdoZW4gPT09IHRoaXMuX3N3aXRjaFZhbHVlKSB7XG4gICAgICB2aWV3LmRlc3Ryb3koKTtcbiAgICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hY3RpdmVWaWV3cywgdmlldyk7XG4gICAgfSBlbHNlIGlmIChuZXdXaGVuID09PSB0aGlzLl9zd2l0Y2hWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMuX3VzZURlZmF1bHQpIHtcbiAgICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk7XG4gICAgICB9XG4gICAgICB2aWV3LmNyZWF0ZSgpO1xuICAgICAgdGhpcy5fYWN0aXZlVmlld3MucHVzaCh2aWV3KTtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2ggdG8gZGVmYXVsdCB3aGVuIHRoZXJlIGlzIG5vIG1vcmUgYWN0aXZlIFZpZXdDb250YWluZXJzXG4gICAgaWYgKHRoaXMuX2FjdGl2ZVZpZXdzLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5fdXNlRGVmYXVsdCkge1xuICAgICAgdGhpcy5fdXNlRGVmYXVsdCA9IHRydWU7XG4gICAgICB0aGlzLl9hY3RpdmF0ZVZpZXdzKHRoaXMuX3ZhbHVlVmlld3MuZ2V0KF9XSEVOX0RFRkFVTFQpKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9lbXB0eUFsbEFjdGl2ZVZpZXdzKCk6IHZvaWQge1xuICAgIHZhciBhY3RpdmVDb250YWluZXJzID0gdGhpcy5fYWN0aXZlVmlld3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVDb250YWluZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhY3RpdmVDb250YWluZXJzW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlVmlld3MgPSBbXTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FjdGl2YXRlVmlld3Modmlld3M6IFN3aXRjaFZpZXdbXSk6IHZvaWQge1xuICAgIC8vIFRPRE8odmljYik6IGFzc2VydCh0aGlzLl9hY3RpdmVWaWV3cy5sZW5ndGggPT09IDApO1xuICAgIGlmIChpc1ByZXNlbnQodmlld3MpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZpZXdzW2ldLmNyZWF0ZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYWN0aXZlVmlld3MgPSB2aWV3cztcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWdpc3RlclZpZXcodmFsdWUsIHZpZXc6IFN3aXRjaFZpZXcpOiB2b2lkIHtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKGlzQmxhbmsodmlld3MpKSB7XG4gICAgICB2aWV3cyA9IFtdO1xuICAgICAgdGhpcy5fdmFsdWVWaWV3cy5zZXQodmFsdWUsIHZpZXdzKTtcbiAgICB9XG4gICAgdmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RlcmVnaXN0ZXJWaWV3KHZhbHVlLCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgLy8gYF9XSEVOX0RFRkFVTFRgIGlzIHVzZWQgYSBtYXJrZXIgZm9yIG5vbi1yZWdpc3RlcmVkIHdoZW5zXG4gICAgaWYgKHZhbHVlID09PSBfV0hFTl9ERUZBVUxUKSByZXR1cm47XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmICh2aWV3cy5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5fdmFsdWVWaWV3cy5kZWxldGUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUodmlld3MsIHZpZXcpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiB0aGUgYG5nLXN3aXRjaC13aGVuYCBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGVcbiAqIGVuY2xvc2luZyBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBJZiBtdWx0aXBsZSBtYXRjaCBleHByZXNzaW9uIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1zd2l0Y2gtd2hlbl0nLCBpbnB1dHM6IFsnbmdTd2l0Y2hXaGVuJ119KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoV2hlbiB7XG4gIC8vIGBfV0hFTl9ERUZBVUxUYCBpcyB1c2VkIGFzIGEgbWFya2VyIGZvciBhIG5vdCB5ZXQgaW5pdGlhbGl6ZWQgdmFsdWVcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmFsdWU6IGFueSA9IF9XSEVOX0RFRkFVTFQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXc6IFN3aXRjaFZpZXc7XG4gIHByaXZhdGUgX3N3aXRjaDogTmdTd2l0Y2g7XG5cbiAgY29uc3RydWN0b3Iodmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmLFxuICAgICAgICAgICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHRoaXMuX3N3aXRjaCA9IG5nU3dpdGNoO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBzZXQgbmdTd2l0Y2hXaGVuKHZhbHVlKSB7XG4gICAgdGhpcy5fc3dpdGNoLl9vbldoZW5WYWx1ZUNoYW5nZWQodGhpcy5fdmFsdWUsIHZhbHVlLCB0aGlzLl92aWV3KTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBjYXNlIHN0YXRlbWVudHMgYXJlIGRpc3BsYXllZCB3aGVuIG5vIG1hdGNoIGV4cHJlc3Npb24gbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb25cbiAqIHZhbHVlLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nLXN3aXRjaC1kZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZixcbiAgICAgICAgICAgICAgQEhvc3QoKSBzc3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIHNzd2l0Y2guX3JlZ2lzdGVyVmlldyhfV0hFTl9ERUZBVUxULCBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZikpO1xuICB9XG59XG4iXX0=
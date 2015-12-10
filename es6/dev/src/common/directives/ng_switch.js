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
import { Directive, Host, ViewContainerRef, TemplateRef } from 'angular2/core';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
const _WHEN_DEFAULT = CONST_EXPR(new Object());
class SwitchView {
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
    }
    create() { this._viewContainerRef.createEmbeddedView(this._templateRef); }
    destroy() { this._viewContainerRef.clear(); }
}
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
export let NgSwitch = class {
    constructor() {
        this._useDefault = false;
        this._valueViews = new Map();
        this._activeViews = [];
    }
    set ngSwitch(value) {
        // Empty the currently active ViewContainers
        this._emptyAllActiveViews();
        // Add the ViewContainers matching the value (with a fallback to default)
        this._useDefault = false;
        var views = this._valueViews.get(value);
        if (isBlank(views)) {
            this._useDefault = true;
            views = normalizeBlank(this._valueViews.get(_WHEN_DEFAULT));
        }
        this._activateViews(views);
        this._switchValue = value;
    }
    /** @internal */
    _onWhenValueChanged(oldWhen, newWhen, view) {
        this._deregisterView(oldWhen, view);
        this._registerView(newWhen, view);
        if (oldWhen === this._switchValue) {
            view.destroy();
            ListWrapper.remove(this._activeViews, view);
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
    }
    /** @internal */
    _emptyAllActiveViews() {
        var activeContainers = this._activeViews;
        for (var i = 0; i < activeContainers.length; i++) {
            activeContainers[i].destroy();
        }
        this._activeViews = [];
    }
    /** @internal */
    _activateViews(views) {
        // TODO(vicb): assert(this._activeViews.length === 0);
        if (isPresent(views)) {
            for (var i = 0; i < views.length; i++) {
                views[i].create();
            }
            this._activeViews = views;
        }
    }
    /** @internal */
    _registerView(value, view) {
        var views = this._valueViews.get(value);
        if (isBlank(views)) {
            views = [];
            this._valueViews.set(value, views);
        }
        views.push(view);
    }
    /** @internal */
    _deregisterView(value, view) {
        // `_WHEN_DEFAULT` is used a marker for non-registered whens
        if (value === _WHEN_DEFAULT)
            return;
        var views = this._valueViews.get(value);
        if (views.length == 1) {
            this._valueViews.delete(value);
        }
        else {
            ListWrapper.remove(views, view);
        }
    }
};
NgSwitch = __decorate([
    Directive({ selector: '[ng-switch]', inputs: ['ngSwitch'] }), 
    __metadata('design:paramtypes', [])
], NgSwitch);
/**
 * Insert the sub-tree when the `ng-switch-when` expression evaluates to the same value as the
 * enclosing switch expression.
 *
 * If multiple match expression match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 */
export let NgSwitchWhen = class {
    constructor(viewContainer, templateRef, ngSwitch) {
        // `_WHEN_DEFAULT` is used as a marker for a not yet initialized value
        /** @internal */
        this._value = _WHEN_DEFAULT;
        this._switch = ngSwitch;
        this._view = new SwitchView(viewContainer, templateRef);
    }
    set ngSwitchWhen(value) {
        this._switch._onWhenValueChanged(this._value, value, this._view);
        this._value = value;
    }
};
NgSwitchWhen = __decorate([
    Directive({ selector: '[ng-switch-when]', inputs: ['ngSwitchWhen'] }),
    __param(2, Host()), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, NgSwitch])
], NgSwitchWhen);
/**
 * Default case statements are displayed when no match expression matches the switch expression
 * value.
 *
 * See {@link NgSwitch} for more details and example.
 */
export let NgSwitchDefault = class {
    constructor(viewContainer, templateRef, sswitch) {
        sswitch._registerView(_WHEN_DEFAULT, new SwitchView(viewContainer, templateRef));
    }
};
NgSwitchDefault = __decorate([
    Directive({ selector: '[ng-switch-default]' }),
    __param(2, Host()), 
    __metadata('design:paramtypes', [ViewContainerRef, TemplateRef, NgSwitch])
], NgSwitchDefault);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6WyJTd2l0Y2hWaWV3IiwiU3dpdGNoVmlldy5jb25zdHJ1Y3RvciIsIlN3aXRjaFZpZXcuY3JlYXRlIiwiU3dpdGNoVmlldy5kZXN0cm95IiwiTmdTd2l0Y2giLCJOZ1N3aXRjaC5jb25zdHJ1Y3RvciIsIk5nU3dpdGNoLm5nU3dpdGNoIiwiTmdTd2l0Y2guX29uV2hlblZhbHVlQ2hhbmdlZCIsIk5nU3dpdGNoLl9lbXB0eUFsbEFjdGl2ZVZpZXdzIiwiTmdTd2l0Y2guX2FjdGl2YXRlVmlld3MiLCJOZ1N3aXRjaC5fcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2guX2RlcmVnaXN0ZXJWaWV3IiwiTmdTd2l0Y2hXaGVuIiwiTmdTd2l0Y2hXaGVuLmNvbnN0cnVjdG9yIiwiTmdTd2l0Y2hXaGVuLm5nU3dpdGNoV2hlbiIsIk5nU3dpdGNoRGVmYXVsdCIsIk5nU3dpdGNoRGVmYXVsdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWU7T0FDckUsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDaEYsRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0NBQWdDO0FBRS9ELE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFFL0M7SUFDRUEsWUFBb0JBLGlCQUFtQ0EsRUFBVUEsWUFBeUJBO1FBQXRFQyxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQWtCQTtRQUFVQSxpQkFBWUEsR0FBWkEsWUFBWUEsQ0FBYUE7SUFBR0EsQ0FBQ0E7SUFFOUZELE1BQU1BLEtBQVdFLElB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dGFpbmVyUmVmLCBUZW1wbGF0ZVJlZn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmNvbnN0IF9XSEVOX0RFRkFVTFQgPSBDT05TVF9FWFBSKG5ldyBPYmplY3QoKSk7XG5cbmNsYXNzIFN3aXRjaFZpZXcge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHt9XG5cbiAgY3JlYXRlKCk6IHZvaWQgeyB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7IH1cbn1cblxuLyoqXG4gKiBBZGRzIG9yIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyB3aGVuIHRoZWlyIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBFbGVtZW50cyB3aXRoaW4gYE5nU3dpdGNoYCBidXQgd2l0aG91dCBgTmdTd2l0Y2hXaGVuYCBvciBgTmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmVzIHdpbGwgYmVcbiAqIHByZXNlcnZlZCBhdCB0aGUgbG9jYXRpb24gYXMgc3BlY2lmaWVkIGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBgTmdTd2l0Y2hgIHNpbXBseSBpbnNlcnRzIG5lc3RlZCBlbGVtZW50cyBiYXNlZCBvbiB3aGljaCBtYXRjaCBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHZhbHVlXG4gKiBvYnRhaW5lZCBmcm9tIHRoZSBldmFsdWF0ZWQgc3dpdGNoIGV4cHJlc3Npb24uIEluIG90aGVyIHdvcmRzLCB5b3UgZGVmaW5lIGEgY29udGFpbmVyIGVsZW1lbnRcbiAqICh3aGVyZSB5b3UgcGxhY2UgdGhlIGRpcmVjdGl2ZSB3aXRoIGEgc3dpdGNoIGV4cHJlc3Npb24gb24gdGhlXG4gKiAqKmBbbmctc3dpdGNoXT1cIi4uLlwiYCBhdHRyaWJ1dGUqKiksIGRlZmluZSBhbnkgaW5uZXIgZWxlbWVudHMgaW5zaWRlIG9mIHRoZSBkaXJlY3RpdmUgYW5kXG4gKiBwbGFjZSBhIGBbbmctc3dpdGNoLXdoZW5dYCBhdHRyaWJ1dGUgcGVyIGVsZW1lbnQuXG4gKlxuICogVGhlIGBuZy1zd2l0Y2gtd2hlbmAgcHJvcGVydHkgaXMgdXNlZCB0byBpbmZvcm0gYE5nU3dpdGNoYCB3aGljaCBlbGVtZW50IHRvIGRpc3BsYXkgd2hlbiB0aGVcbiAqIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkLiBJZiBhIG1hdGNoaW5nIGV4cHJlc3Npb24gaXMgbm90IGZvdW5kIHZpYSBhIGBuZy1zd2l0Y2gtd2hlbmAgcHJvcGVydHlcbiAqIHRoZW4gYW4gZWxlbWVudCB3aXRoIHRoZSBgbmctc3dpdGNoLWRlZmF1bHRgIGF0dHJpYnV0ZSBpcyBkaXNwbGF5ZWQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L0RRTVRJSTk1Q2J1cVdybDNsWUFzP3A9cHJldmlldykpXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7c2VsZWN0b3I6ICdhcHAnfSlcbiAqIEBWaWV3KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8cD5WYWx1ZSA9IHt7dmFsdWV9fTwvcD5cbiAqICAgICA8YnV0dG9uIChjbGljayk9XCJpbmMoKVwiPkluY3JlbWVudDwvYnV0dG9uPlxuICpcbiAqICAgICA8ZGl2IFtuZy1zd2l0Y2hdPVwidmFsdWVcIj5cbiAqICAgICAgIDxwICpuZy1zd2l0Y2gtd2hlbj1cIidpbml0J1wiPmluY3JlbWVudCB0byBzdGFydDwvcD5cbiAqICAgICAgIDxwICpuZy1zd2l0Y2gtd2hlbj1cIjBcIj4wLCBpbmNyZW1lbnQgYWdhaW48L3A+XG4gKiAgICAgICA8cCAqbmctc3dpdGNoLXdoZW49XCIxXCI+MSwgaW5jcmVtZW50IGFnYWluPC9wPlxuICogICAgICAgPHAgKm5nLXN3aXRjaC13aGVuPVwiMlwiPjIsIHN0b3AgaW5jcmVtZW50aW5nPC9wPlxuICogICAgICAgPHAgKm5nLXN3aXRjaC1kZWZhdWx0PiZndDsgMiwgU1RPUCE8L3A+XG4gKiAgICAgPC9kaXY+XG4gKlxuICogICAgIDwhLS0gYWx0ZXJuYXRlIHN5bnRheCAtLT5cbiAqXG4gKiAgICAgPHAgW25nLXN3aXRjaF09XCJ2YWx1ZVwiPlxuICogICAgICAgPHRlbXBsYXRlIG5nLXN3aXRjaC13aGVuPVwiaW5pdFwiPmluY3JlbWVudCB0byBzdGFydDwvdGVtcGxhdGU+XG4gKiAgICAgICA8dGVtcGxhdGUgW25nLXN3aXRjaC13aGVuXT1cIjBcIj4wLCBpbmNyZW1lbnQgYWdhaW48L3RlbXBsYXRlPlxuICogICAgICAgPHRlbXBsYXRlIFtuZy1zd2l0Y2gtd2hlbl09XCIxXCI+MSwgaW5jcmVtZW50IGFnYWluPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBbbmctc3dpdGNoLXdoZW5dPVwiMlwiPjIsIHN0b3AgaW5jcmVtZW50aW5nPC90ZW1wbGF0ZT5cbiAqICAgICAgIDx0ZW1wbGF0ZSBuZy1zd2l0Y2gtZGVmYXVsdD4mZ3Q7IDIsIFNUT1AhPC90ZW1wbGF0ZT5cbiAqICAgICA8L3A+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHRdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcCB7XG4gKiAgIHZhbHVlID0gJ2luaXQnO1xuICpcbiAqICAgaW5jKCkge1xuICogICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID09PSAnaW5pdCcgPyAwIDogdGhpcy52YWx1ZSArIDE7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKS5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1zd2l0Y2hdJywgaW5wdXRzOiBbJ25nU3dpdGNoJ119KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgcHJpdmF0ZSBfc3dpdGNoVmFsdWU6IGFueTtcbiAgcHJpdmF0ZSBfdXNlRGVmYXVsdDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF92YWx1ZVZpZXdzID0gbmV3IE1hcDxhbnksIFN3aXRjaFZpZXdbXT4oKTtcbiAgcHJpdmF0ZSBfYWN0aXZlVmlld3M6IFN3aXRjaFZpZXdbXSA9IFtdO1xuXG4gIHNldCBuZ1N3aXRjaCh2YWx1ZSkge1xuICAgIC8vIEVtcHR5IHRoZSBjdXJyZW50bHkgYWN0aXZlIFZpZXdDb250YWluZXJzXG4gICAgdGhpcy5fZW1wdHlBbGxBY3RpdmVWaWV3cygpO1xuXG4gICAgLy8gQWRkIHRoZSBWaWV3Q29udGFpbmVycyBtYXRjaGluZyB0aGUgdmFsdWUgKHdpdGggYSBmYWxsYmFjayB0byBkZWZhdWx0KVxuICAgIHRoaXMuX3VzZURlZmF1bHQgPSBmYWxzZTtcbiAgICB2YXIgdmlld3MgPSB0aGlzLl92YWx1ZVZpZXdzLmdldCh2YWx1ZSk7XG4gICAgaWYgKGlzQmxhbmsodmlld3MpKSB7XG4gICAgICB0aGlzLl91c2VEZWZhdWx0ID0gdHJ1ZTtcbiAgICAgIHZpZXdzID0gbm9ybWFsaXplQmxhbmsodGhpcy5fdmFsdWVWaWV3cy5nZXQoX1dIRU5fREVGQVVMVCkpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmF0ZVZpZXdzKHZpZXdzKTtcblxuICAgIHRoaXMuX3N3aXRjaFZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9vbldoZW5WYWx1ZUNoYW5nZWQob2xkV2hlbiwgbmV3V2hlbiwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIHRoaXMuX2RlcmVnaXN0ZXJWaWV3KG9sZFdoZW4sIHZpZXcpO1xuICAgIHRoaXMuX3JlZ2lzdGVyVmlldyhuZXdXaGVuLCB2aWV3KTtcblxuICAgIGlmIChvbGRXaGVuID09PSB0aGlzLl9zd2l0Y2hWYWx1ZSkge1xuICAgICAgdmlldy5kZXN0cm95KCk7XG4gICAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fYWN0aXZlVmlld3MsIHZpZXcpO1xuICAgIH0gZWxzZSBpZiAobmV3V2hlbiA9PT0gdGhpcy5fc3dpdGNoVmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLl91c2VEZWZhdWx0KSB7XG4gICAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZW1wdHlBbGxBY3RpdmVWaWV3cygpO1xuICAgICAgfVxuICAgICAgdmlldy5jcmVhdGUoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXdzLnB1c2godmlldyk7XG4gICAgfVxuXG4gICAgLy8gU3dpdGNoIHRvIGRlZmF1bHQgd2hlbiB0aGVyZSBpcyBubyBtb3JlIGFjdGl2ZSBWaWV3Q29udGFpbmVyc1xuICAgIGlmICh0aGlzLl9hY3RpdmVWaWV3cy5sZW5ndGggPT09IDAgJiYgIXRoaXMuX3VzZURlZmF1bHQpIHtcbiAgICAgIHRoaXMuX3VzZURlZmF1bHQgPSB0cnVlO1xuICAgICAgdGhpcy5fYWN0aXZhdGVWaWV3cyh0aGlzLl92YWx1ZVZpZXdzLmdldChfV0hFTl9ERUZBVUxUKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1wdHlBbGxBY3RpdmVWaWV3cygpOiB2b2lkIHtcbiAgICB2YXIgYWN0aXZlQ29udGFpbmVycyA9IHRoaXMuX2FjdGl2ZVZpZXdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlQ29udGFpbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgYWN0aXZlQ29udGFpbmVyc1tpXS5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVZpZXdzID0gW107XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hY3RpdmF0ZVZpZXdzKHZpZXdzOiBTd2l0Y2hWaWV3W10pOiB2b2lkIHtcbiAgICAvLyBUT0RPKHZpY2IpOiBhc3NlcnQodGhpcy5fYWN0aXZlVmlld3MubGVuZ3RoID09PSAwKTtcbiAgICBpZiAoaXNQcmVzZW50KHZpZXdzKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2aWV3c1tpXS5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FjdGl2ZVZpZXdzID0gdmlld3M7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVnaXN0ZXJWaWV3KHZhbHVlLCB2aWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgdmFyIHZpZXdzID0gdGhpcy5fdmFsdWVWaWV3cy5nZXQodmFsdWUpO1xuICAgIGlmIChpc0JsYW5rKHZpZXdzKSkge1xuICAgICAgdmlld3MgPSBbXTtcbiAgICAgIHRoaXMuX3ZhbHVlVmlld3Muc2V0KHZhbHVlLCB2aWV3cyk7XG4gICAgfVxuICAgIHZpZXdzLnB1c2godmlldyk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXJlZ2lzdGVyVmlldyh2YWx1ZSwgdmlldzogU3dpdGNoVmlldyk6IHZvaWQge1xuICAgIC8vIGBfV0hFTl9ERUZBVUxUYCBpcyB1c2VkIGEgbWFya2VyIGZvciBub24tcmVnaXN0ZXJlZCB3aGVuc1xuICAgIGlmICh2YWx1ZSA9PT0gX1dIRU5fREVGQVVMVCkgcmV0dXJuO1xuICAgIHZhciB2aWV3cyA9IHRoaXMuX3ZhbHVlVmlld3MuZ2V0KHZhbHVlKTtcbiAgICBpZiAodmlld3MubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMuX3ZhbHVlVmlld3MuZGVsZXRlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHZpZXdzLCB2aWV3KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHN1Yi10cmVlIHdoZW4gdGhlIGBuZy1zd2l0Y2gtd2hlbmAgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdGhlIHNhbWUgdmFsdWUgYXMgdGhlXG4gKiBlbmNsb3Npbmcgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSWYgbXVsdGlwbGUgbWF0Y2ggZXhwcmVzc2lvbiBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIGFsbCBvZiB0aGVtIGFyZSBkaXNwbGF5ZWQuXG4gKlxuICogU2VlIHtAbGluayBOZ1N3aXRjaH0gZm9yIG1vcmUgZGV0YWlscyBhbmQgZXhhbXBsZS5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmctc3dpdGNoLXdoZW5dJywgaW5wdXRzOiBbJ25nU3dpdGNoV2hlbiddfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaFdoZW4ge1xuICAvLyBgX1dIRU5fREVGQVVMVGAgaXMgdXNlZCBhcyBhIG1hcmtlciBmb3IgYSBub3QgeWV0IGluaXRpYWxpemVkIHZhbHVlXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZhbHVlOiBhbnkgPSBfV0hFTl9ERUZBVUxUO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3OiBTd2l0Y2hWaWV3O1xuICBwcml2YXRlIF9zd2l0Y2g6IE5nU3dpdGNoO1xuXG4gIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZixcbiAgICAgICAgICAgICAgQEhvc3QoKSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICB0aGlzLl9zd2l0Y2ggPSBuZ1N3aXRjaDtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgc2V0IG5nU3dpdGNoV2hlbih2YWx1ZSkge1xuICAgIHRoaXMuX3N3aXRjaC5fb25XaGVuVmFsdWVDaGFuZ2VkKHRoaXMuX3ZhbHVlLCB2YWx1ZSwgdGhpcy5fdmlldyk7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgY2FzZSBzdGF0ZW1lbnRzIGFyZSBkaXNwbGF5ZWQgd2hlbiBubyBtYXRjaCBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uXG4gKiB2YWx1ZS5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1zd2l0Y2gtZGVmYXVsdF0nfSlcbmV4cG9ydCBjbGFzcyBOZ1N3aXRjaERlZmF1bHQge1xuICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYsXG4gICAgICAgICAgICAgIEBIb3N0KCkgc3N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBzc3dpdGNoLl9yZWdpc3RlclZpZXcoX1dIRU5fREVGQVVMVCwgbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpKTtcbiAgfVxufVxuIl19
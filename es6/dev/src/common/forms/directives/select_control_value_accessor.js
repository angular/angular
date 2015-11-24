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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Query, Directive, Renderer, forwardRef, Provider, ElementRef, QueryList } from 'angular2/core';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { NG_VALUE_ACCESSOR } from './control_value_accessor';
import { CONST_EXPR } from 'angular2/src/facade/lang';
const SELECT_VALUE_ACCESSOR = CONST_EXPR(new Provider(NG_VALUE_ACCESSOR, { useExisting: forwardRef(() => SelectControlValueAccessor), multi: true }));
/**
 * Marks `<option>` as dynamic, so Angular can be notified when options change.
 *
 * ### Example
 *
 * ```
 * <select ng-control="city">
 *   <option *ng-for="#c of cities" [value]="c"></option>
 * </select>
 * ```
 */
export let NgSelectOption = class {
};
NgSelectOption = __decorate([
    Directive({ selector: 'option' }), 
    __metadata('design:paramtypes', [])
], NgSelectOption);
/**
 * The accessor for writing a value and listening to changes on a select element.
 */
export let SelectControlValueAccessor = class {
    constructor(_renderer, _elementRef, query) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.onChange = (_) => { };
        this.onTouched = () => { };
        this._updateValueWhenListOfOptionsChanges(query);
    }
    writeValue(value) {
        this.value = value;
        this._renderer.setElementProperty(this._elementRef, 'value', value);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    _updateValueWhenListOfOptionsChanges(query) {
        ObservableWrapper.subscribe(query.changes, (_) => this.writeValue(this.value));
    }
};
SelectControlValueAccessor = __decorate([
    Directive({
        selector: 'select[ng-control],select[ng-form-control],select[ng-model]',
        host: {
            '(change)': 'onChange($event.target.value)',
            '(input)': 'onChange($event.target.value)',
            '(blur)': 'onTouched()'
        },
        bindings: [SELECT_VALUE_ACCESSOR]
    }),
    __param(2, Query(NgSelectOption, { descendants: true })), 
    __metadata('design:paramtypes', [Renderer, ElementRef, QueryList])
], SelectControlValueAccessor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2Zvcm1zL2RpcmVjdGl2ZXMvc2VsZWN0X2NvbnRyb2xfdmFsdWVfYWNjZXNzb3IudHMiXSwibmFtZXMiOlsiTmdTZWxlY3RPcHRpb24iLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3NvciIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3Iud3JpdGVWYWx1ZSIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLnJlZ2lzdGVyT25DaGFuZ2UiLCJTZWxlY3RDb250cm9sVmFsdWVBY2Nlc3Nvci5yZWdpc3Rlck9uVG91Y2hlZCIsIlNlbGVjdENvbnRyb2xWYWx1ZUFjY2Vzc29yLl91cGRhdGVWYWx1ZVdoZW5MaXN0T2ZPcHRpb25zQ2hhbmdlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLEtBQUssRUFDTCxTQUFTLEVBQ1QsUUFBUSxFQUVSLFVBQVUsRUFDVixRQUFRLEVBQ1IsVUFBVSxFQUNWLFNBQVMsRUFDVixNQUFNLGVBQWU7T0FFZixFQUFDLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ3BELEVBQUMsaUJBQWlCLEVBQXVCLE1BQU0sMEJBQTBCO09BQ3pFLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO0FBRW5ELE1BQU0scUJBQXFCLEdBQUcsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNqRCxpQkFBaUIsRUFBRSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsTUFBTSwwQkFBMEIsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbEc7Ozs7Ozs7Ozs7R0FVRztBQUNIO0FBRUFBLENBQUNBO0FBRkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUM7O21CQUUvQjtBQUVEOztHQUVHO0FBQ0g7SUFjRUMsWUFBb0JBLFNBQW1CQSxFQUFVQSxXQUF1QkEsRUFDaEJBLEtBQWdDQTtRQURwRUMsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7UUFBVUEsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBSHhFQSxhQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxPQUFNQSxDQUFDQSxDQUFDQTtRQUNyQkEsY0FBU0EsR0FBR0EsUUFBT0EsQ0FBQ0EsQ0FBQ0E7UUFJbkJBLElBQUlBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbkRBLENBQUNBO0lBRURELFVBQVVBLENBQUNBLEtBQVVBO1FBQ25CRSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN0RUEsQ0FBQ0E7SUFFREYsZ0JBQWdCQSxDQUFDQSxFQUFhQSxJQUFVRyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3REgsaUJBQWlCQSxDQUFDQSxFQUFhQSxJQUFVSSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2REosb0NBQW9DQSxDQUFDQSxLQUFnQ0E7UUFDM0VLLGlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakZBLENBQUNBO0FBQ0hMLENBQUNBO0FBOUJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLDZEQUE2RDtRQUN2RSxJQUFJLEVBQUU7WUFDSixVQUFVLEVBQUUsK0JBQStCO1lBQzNDLFNBQVMsRUFBRSwrQkFBK0I7WUFDMUMsUUFBUSxFQUFFLGFBQWE7U0FDeEI7UUFDRCxRQUFRLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztLQUNsQyxDQUFDO0lBT1ksV0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7OytCQWV4RDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgUXVlcnksXG4gIERpcmVjdGl2ZSxcbiAgUmVuZGVyZXIsXG4gIFNlbGYsXG4gIGZvcndhcmRSZWYsXG4gIFByb3ZpZGVyLFxuICBFbGVtZW50UmVmLFxuICBRdWVyeUxpc3Rcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJy4vY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmNvbnN0IFNFTEVDVF9WQUxVRV9BQ0NFU1NPUiA9IENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFxuICAgIE5HX1ZBTFVFX0FDQ0VTU09SLCB7dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IpLCBtdWx0aTogdHJ1ZX0pKTtcblxuLyoqXG4gKiBNYXJrcyBgPG9wdGlvbj5gIGFzIGR5bmFtaWMsIHNvIEFuZ3VsYXIgY2FuIGJlIG5vdGlmaWVkIHdoZW4gb3B0aW9ucyBjaGFuZ2UuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIDxzZWxlY3QgbmctY29udHJvbD1cImNpdHlcIj5cbiAqICAgPG9wdGlvbiAqbmctZm9yPVwiI2Mgb2YgY2l0aWVzXCIgW3ZhbHVlXT1cImNcIj48L29wdGlvbj5cbiAqIDwvc2VsZWN0PlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnb3B0aW9uJ30pXG5leHBvcnQgY2xhc3MgTmdTZWxlY3RPcHRpb24ge1xufVxuXG4vKipcbiAqIFRoZSBhY2Nlc3NvciBmb3Igd3JpdGluZyBhIHZhbHVlIGFuZCBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBvbiBhIHNlbGVjdCBlbGVtZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdzZWxlY3RbbmctY29udHJvbF0sc2VsZWN0W25nLWZvcm0tY29udHJvbF0sc2VsZWN0W25nLW1vZGVsXScsXG4gIGhvc3Q6IHtcbiAgICAnKGNoYW5nZSknOiAnb25DaGFuZ2UoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoaW5wdXQpJzogJ29uQ2hhbmdlKCRldmVudC50YXJnZXQudmFsdWUpJyxcbiAgICAnKGJsdXIpJzogJ29uVG91Y2hlZCgpJ1xuICB9LFxuICBiaW5kaW5nczogW1NFTEVDVF9WQUxVRV9BQ0NFU1NPUl1cbn0pXG5leHBvcnQgY2xhc3MgU2VsZWN0Q29udHJvbFZhbHVlQWNjZXNzb3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIG9uQ2hhbmdlID0gKF8pID0+IHt9O1xuICBvblRvdWNoZWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgICAgICAgIEBRdWVyeShOZ1NlbGVjdE9wdGlvbiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcXVlcnk6IFF1ZXJ5TGlzdDxOZ1NlbGVjdE9wdGlvbj4pIHtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZVdoZW5MaXN0T2ZPcHRpb25zQ2hhbmdlcyhxdWVyeSk7XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0RWxlbWVudFByb3BlcnR5KHRoaXMuX2VsZW1lbnRSZWYsICd2YWx1ZScsIHZhbHVlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICgpID0+IGFueSk6IHZvaWQgeyB0aGlzLm9uQ2hhbmdlID0gZm47IH1cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46ICgpID0+IGFueSk6IHZvaWQgeyB0aGlzLm9uVG91Y2hlZCA9IGZuOyB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVmFsdWVXaGVuTGlzdE9mT3B0aW9uc0NoYW5nZXMocXVlcnk6IFF1ZXJ5TGlzdDxOZ1NlbGVjdE9wdGlvbj4pIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUocXVlcnkuY2hhbmdlcywgKF8pID0+IHRoaXMud3JpdGVWYWx1ZSh0aGlzLnZhbHVlKSk7XG4gIH1cbn1cbiJdfQ==
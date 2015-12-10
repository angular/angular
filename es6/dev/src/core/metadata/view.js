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
import { CONST } from 'angular2/src/facade/lang';
/**
 * Defines template and style encapsulation options available for Component's {@link View}.
 *
 * See {@link ViewMetadata#encapsulation}.
 */
export var ViewEncapsulation;
(function (ViewEncapsulation) {
    /**
     * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
     * Element and pre-processing the style rules provided via
     * {@link ViewMetadata#styles} or {@link ViewMetadata#stylesUrls}, and adding the new Host Element
     * attribute to all selectors.
     *
     * This is the default option.
     */
    ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
    /**
     * Use the native encapsulation mechanism of the renderer.
     *
     * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     * creating a ShadowRoot for Component's Host Element.
     */
    ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
    /**
     * Don't provide any template or style encapsulation.
     */
    ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
})(ViewEncapsulation || (ViewEncapsulation = {}));
export var VIEW_ENCAPSULATION_VALUES = [ViewEncapsulation.Emulated, ViewEncapsulation.Native, ViewEncapsulation.None];
/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 */
export let ViewMetadata = class {
    constructor({ templateUrl, template, directives, pipes, encapsulation, styles, styleUrls } = {}) {
        this.templateUrl = templateUrl;
        this.template = template;
        this.styleUrls = styleUrls;
        this.styles = styles;
        this.directives = directives;
        this.pipes = pipes;
        this.encapsulation = encapsulation;
    }
};
ViewMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], ViewMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOlsiVmlld0VuY2Fwc3VsYXRpb24iLCJWaWV3TWV0YWRhdGEiLCJWaWV3TWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxLQUFLLEVBQU8sTUFBTSwwQkFBMEI7QUFFcEQ7Ozs7R0FJRztBQUNILFdBQVksaUJBcUJYO0FBckJELFdBQVksaUJBQWlCO0lBQzNCQTs7Ozs7OztPQU9HQTtJQUNIQSxpRUFBUUEsQ0FBQUE7SUFDUkE7Ozs7O09BS0dBO0lBQ0hBLDZEQUFNQSxDQUFBQTtJQUNOQTs7T0FFR0E7SUFDSEEseURBQUlBLENBQUFBO0FBQ05BLENBQUNBLEVBckJXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFxQjVCO0FBRUQsV0FBVyx5QkFBeUIsR0FDaEMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBR25GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0g7SUE4REVDLFlBQVlBLEVBQUNBLFdBQVdBLEVBQUVBLFFBQVFBLEVBQUVBLFVBQVVBLEVBQUVBLEtBQUtBLEVBQUVBLGFBQWFBLEVBQUVBLE1BQU1BLEVBQUVBLFNBQVNBLEVBQUNBLEdBUXBGQSxFQUFFQTtRQUNKQyxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxXQUFXQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ25CQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxhQUFhQSxDQUFDQTtJQUNyQ0EsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUEvRUQ7SUFBQyxLQUFLLEVBQUU7O2lCQStFUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBEZWZpbmVzIHRlbXBsYXRlIGFuZCBzdHlsZSBlbmNhcHN1bGF0aW9uIG9wdGlvbnMgYXZhaWxhYmxlIGZvciBDb21wb25lbnQncyB7QGxpbmsgVmlld30uXG4gKlxuICogU2VlIHtAbGluayBWaWV3TWV0YWRhdGEjZW5jYXBzdWxhdGlvbn0uXG4gKi9cbmV4cG9ydCBlbnVtIFZpZXdFbmNhcHN1bGF0aW9uIHtcbiAgLyoqXG4gICAqIEVtdWxhdGUgYE5hdGl2ZWAgc2NvcGluZyBvZiBzdHlsZXMgYnkgYWRkaW5nIGFuIGF0dHJpYnV0ZSBjb250YWluaW5nIHN1cnJvZ2F0ZSBpZCB0byB0aGUgSG9zdFxuICAgKiBFbGVtZW50IGFuZCBwcmUtcHJvY2Vzc2luZyB0aGUgc3R5bGUgcnVsZXMgcHJvdmlkZWQgdmlhXG4gICAqIHtAbGluayBWaWV3TWV0YWRhdGEjc3R5bGVzfSBvciB7QGxpbmsgVmlld01ldGFkYXRhI3N0eWxlc1VybHN9LCBhbmQgYWRkaW5nIHRoZSBuZXcgSG9zdCBFbGVtZW50XG4gICAqIGF0dHJpYnV0ZSB0byBhbGwgc2VsZWN0b3JzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBkZWZhdWx0IG9wdGlvbi5cbiAgICovXG4gIEVtdWxhdGVkLFxuICAvKipcbiAgICogVXNlIHRoZSBuYXRpdmUgZW5jYXBzdWxhdGlvbiBtZWNoYW5pc20gb2YgdGhlIHJlbmRlcmVyLlxuICAgKlxuICAgKiBGb3IgdGhlIERPTSB0aGlzIG1lYW5zIHVzaW5nIFtTaGFkb3cgRE9NXShodHRwczovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL3NoYWRvdy8pIGFuZFxuICAgKiBjcmVhdGluZyBhIFNoYWRvd1Jvb3QgZm9yIENvbXBvbmVudCdzIEhvc3QgRWxlbWVudC5cbiAgICovXG4gIE5hdGl2ZSxcbiAgLyoqXG4gICAqIERvbid0IHByb3ZpZGUgYW55IHRlbXBsYXRlIG9yIHN0eWxlIGVuY2Fwc3VsYXRpb24uXG4gICAqL1xuICBOb25lXG59XG5cbmV4cG9ydCB2YXIgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFUyA9XG4gICAgW1ZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLCBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUsIFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVdO1xuXG5cbi8qKlxuICogTWV0YWRhdGEgcHJvcGVydGllcyBhdmFpbGFibGUgZm9yIGNvbmZpZ3VyaW5nIFZpZXdzLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFuZCBhdCBsZWFzdCBvbmUgYEBWaWV3YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAVmlld2AgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhlIEhUTUwgdGVtcGxhdGUgdG8gdXNlLCBhbmQgbGlzdHMgdGhlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgYWN0aXZlXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCB0aGUgdGVtcGxhdGUgaXMgbG9hZGVkIGludG8gdGhlIGNvbXBvbmVudCdzIHNoYWRvdyByb290LCBhbmRcbiAqIHRoZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBpbiB0aGUgdGVtcGxhdGUgYXJlIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLCBzZWUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICogICB0ZW1wbGF0ZTogJ0hlbGxvIHt7bmFtZX19IScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtHcmVldFVzZXIsIEJvbGRdXG4gKiB9KVxuICogY2xhc3MgR3JlZXQge1xuICogICBuYW1lOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLm5hbWUgPSAnV29ybGQnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3TWV0YWRhdGEge1xuICAvKipcbiAgICogU3BlY2lmaWVzIGEgdGVtcGxhdGUgVVJMIGZvciBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAgICpcbiAgICogTk9URTogT25seSBvbmUgb2YgYHRlbXBsYXRlVXJsYCBvciBgdGVtcGxhdGVgIGNhbiBiZSBkZWZpbmVkIHBlciBWaWV3LlxuICAgKlxuICAgKiA8IS0tIFRPRE86IHdoYXQncyB0aGUgdXJsIHJlbGF0aXZlIHRvPyAtLT5cbiAgICovXG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhbiBpbmxpbmUgdGVtcGxhdGUgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKlxuICAgKiBOT1RFOiBPbmx5IG9uZSBvZiBgdGVtcGxhdGVVcmxgIG9yIGB0ZW1wbGF0ZWAgY2FuIGJlIGRlZmluZWQgcGVyIFZpZXcuXG4gICAqL1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgc3R5bGVzaGVldCBVUkxzIGZvciBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAgICpcbiAgICogPCEtLSBUT0RPOiB3aGF0J3MgdGhlIHVybCByZWxhdGl2ZSB0bz8gLS0+XG4gICAqL1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYW4gaW5saW5lIHN0eWxlc2hlZXQgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKi9cbiAgc3R5bGVzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgbGlzdCBvZiBkaXJlY3RpdmVzIHRoYXQgY2FuIGJlIHVzZWQgd2l0aGluIGEgdGVtcGxhdGUuXG4gICAqXG4gICAqIERpcmVjdGl2ZXMgbXVzdCBiZSBsaXN0ZWQgZXhwbGljaXRseSB0byBwcm92aWRlIHByb3BlciBjb21wb25lbnQgZW5jYXBzdWxhdGlvbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gICAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICAgKiAgIHRlbXBsYXRlOiAnXG4gICAqICAgPHVsPlxuICAgKiAgICAgPGxpICpuZy1mb3I9XCIjaXRlbSBvZiBpdGVtc1wiPnt7aXRlbX19PC9saT5cbiAgICogICA8L3VsPidcbiAgICogfSlcbiAgICogY2xhc3MgTXlDb21wb25lbnQge1xuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgZGlyZWN0aXZlczogQXJyYXk8VHlwZSB8IGFueVtdPjtcblxuICBwaXBlczogQXJyYXk8VHlwZSB8IGFueVtdPjtcblxuICAvKipcbiAgICogU3BlY2lmeSBob3cgdGhlIHRlbXBsYXRlIGFuZCB0aGUgc3R5bGVzIHNob3VsZCBiZSBlbmNhcHN1bGF0ZWQuXG4gICAqIFRoZSBkZWZhdWx0IGlzIHtAbGluayBWaWV3RW5jYXBzdWxhdGlvbiNFbXVsYXRlZCBgVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWRgfSBpZiB0aGUgdmlld1xuICAgKiBoYXMgc3R5bGVzLFxuICAgKiBvdGhlcndpc2Uge0BsaW5rIFZpZXdFbmNhcHN1bGF0aW9uI05vbmUgYFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVgfS5cbiAgICovXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHt0ZW1wbGF0ZVVybCwgdGVtcGxhdGUsIGRpcmVjdGl2ZXMsIHBpcGVzLCBlbmNhcHN1bGF0aW9uLCBzdHlsZXMsIHN0eWxlVXJsc306IHtcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICB9ID0ge30pIHtcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gc3R5bGVVcmxzO1xuICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgIHRoaXMuZGlyZWN0aXZlcyA9IGRpcmVjdGl2ZXM7XG4gICAgdGhpcy5waXBlcyA9IHBpcGVzO1xuICAgIHRoaXMuZW5jYXBzdWxhdGlvbiA9IGVuY2Fwc3VsYXRpb247XG4gIH1cbn1cbiJdfQ==
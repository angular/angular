'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
/**
 * Defines template and style encapsulation options available for Component's {@link View}.
 *
 * See {@link ViewMetadata#encapsulation}.
 */
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
})(exports.ViewEncapsulation || (exports.ViewEncapsulation = {}));
var ViewEncapsulation = exports.ViewEncapsulation;
exports.VIEW_ENCAPSULATION_VALUES = [ViewEncapsulation.Emulated, ViewEncapsulation.Native, ViewEncapsulation.None];
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
var ViewMetadata = (function () {
    function ViewMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, templateUrl = _b.templateUrl, template = _b.template, directives = _b.directives, pipes = _b.pipes, encapsulation = _b.encapsulation, styles = _b.styles, styleUrls = _b.styleUrls;
        this.templateUrl = templateUrl;
        this.template = template;
        this.styleUrls = styleUrls;
        this.styles = styles;
        this.directives = directives;
        this.pipes = pipes;
        this.encapsulation = encapsulation;
    }
    ViewMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ViewMetadata);
    return ViewMetadata;
})();
exports.ViewMetadata = ViewMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOlsiVmlld0VuY2Fwc3VsYXRpb24iLCJWaWV3TWV0YWRhdGEiLCJWaWV3TWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUEwQiwwQkFBMEIsQ0FBQyxDQUFBO0FBRXJEOzs7O0dBSUc7QUFDSCxXQUFZLGlCQUFpQjtJQUMzQkE7Ozs7Ozs7T0FPR0E7SUFDSEEsaUVBQVFBLENBQUFBO0lBQ1JBOzs7OztPQUtHQTtJQUNIQSw2REFBTUEsQ0FBQUE7SUFDTkE7O09BRUdBO0lBQ0hBLHlEQUFJQSxDQUFBQTtBQUNOQSxDQUFDQSxFQXJCVyx5QkFBaUIsS0FBakIseUJBQWlCLFFBcUI1QjtBQXJCRCxJQUFZLGlCQUFpQixHQUFqQix5QkFxQlgsQ0FBQTtBQUVVLGlDQUF5QixHQUNoQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHbkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSDtJQThERUMsc0JBQVlBLEVBUU5BO2lDQUFGQyxFQUFFQSxPQVJPQSxXQUFXQSxtQkFBRUEsUUFBUUEsZ0JBQUVBLFVBQVVBLGtCQUFFQSxLQUFLQSxhQUFFQSxhQUFhQSxxQkFBRUEsTUFBTUEsY0FBRUEsU0FBU0E7UUFTckZBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLFdBQVdBLENBQUNBO1FBQy9CQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDM0JBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxVQUFVQSxDQUFDQTtRQUM3QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLGFBQWFBLENBQUNBO0lBQ3JDQSxDQUFDQTtJQTlFSEQ7UUFBQ0EsWUFBS0EsRUFBRUE7O3FCQStFUEE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBL0VELElBK0VDO0FBOUVZLG9CQUFZLGVBOEV4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBEZWZpbmVzIHRlbXBsYXRlIGFuZCBzdHlsZSBlbmNhcHN1bGF0aW9uIG9wdGlvbnMgYXZhaWxhYmxlIGZvciBDb21wb25lbnQncyB7QGxpbmsgVmlld30uXG4gKlxuICogU2VlIHtAbGluayBWaWV3TWV0YWRhdGEjZW5jYXBzdWxhdGlvbn0uXG4gKi9cbmV4cG9ydCBlbnVtIFZpZXdFbmNhcHN1bGF0aW9uIHtcbiAgLyoqXG4gICAqIEVtdWxhdGUgYE5hdGl2ZWAgc2NvcGluZyBvZiBzdHlsZXMgYnkgYWRkaW5nIGFuIGF0dHJpYnV0ZSBjb250YWluaW5nIHN1cnJvZ2F0ZSBpZCB0byB0aGUgSG9zdFxuICAgKiBFbGVtZW50IGFuZCBwcmUtcHJvY2Vzc2luZyB0aGUgc3R5bGUgcnVsZXMgcHJvdmlkZWQgdmlhXG4gICAqIHtAbGluayBWaWV3TWV0YWRhdGEjc3R5bGVzfSBvciB7QGxpbmsgVmlld01ldGFkYXRhI3N0eWxlc1VybHN9LCBhbmQgYWRkaW5nIHRoZSBuZXcgSG9zdCBFbGVtZW50XG4gICAqIGF0dHJpYnV0ZSB0byBhbGwgc2VsZWN0b3JzLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBkZWZhdWx0IG9wdGlvbi5cbiAgICovXG4gIEVtdWxhdGVkLFxuICAvKipcbiAgICogVXNlIHRoZSBuYXRpdmUgZW5jYXBzdWxhdGlvbiBtZWNoYW5pc20gb2YgdGhlIHJlbmRlcmVyLlxuICAgKlxuICAgKiBGb3IgdGhlIERPTSB0aGlzIG1lYW5zIHVzaW5nIFtTaGFkb3cgRE9NXShodHRwczovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL3NoYWRvdy8pIGFuZFxuICAgKiBjcmVhdGluZyBhIFNoYWRvd1Jvb3QgZm9yIENvbXBvbmVudCdzIEhvc3QgRWxlbWVudC5cbiAgICovXG4gIE5hdGl2ZSxcbiAgLyoqXG4gICAqIERvbid0IHByb3ZpZGUgYW55IHRlbXBsYXRlIG9yIHN0eWxlIGVuY2Fwc3VsYXRpb24uXG4gICAqL1xuICBOb25lXG59XG5cbmV4cG9ydCB2YXIgVklFV19FTkNBUFNVTEFUSU9OX1ZBTFVFUyA9XG4gICAgW1ZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLCBWaWV3RW5jYXBzdWxhdGlvbi5OYXRpdmUsIFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVdO1xuXG5cbi8qKlxuICogTWV0YWRhdGEgcHJvcGVydGllcyBhdmFpbGFibGUgZm9yIGNvbmZpZ3VyaW5nIFZpZXdzLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFuZCBhdCBsZWFzdCBvbmUgYEBWaWV3YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAVmlld2AgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhlIEhUTUwgdGVtcGxhdGUgdG8gdXNlLCBhbmQgbGlzdHMgdGhlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgYWN0aXZlXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCB0aGUgdGVtcGxhdGUgaXMgbG9hZGVkIGludG8gdGhlIGNvbXBvbmVudCdzIHNoYWRvdyByb290LCBhbmRcbiAqIHRoZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBpbiB0aGUgdGVtcGxhdGUgYXJlIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLCBzZWUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICogICB0ZW1wbGF0ZTogJ0hlbGxvIHt7bmFtZX19IScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtHcmVldFVzZXIsIEJvbGRdXG4gKiB9KVxuICogY2xhc3MgR3JlZXQge1xuICogICBuYW1lOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLm5hbWUgPSAnV29ybGQnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBWaWV3TWV0YWRhdGEge1xuICAvKipcbiAgICogU3BlY2lmaWVzIGEgdGVtcGxhdGUgVVJMIGZvciBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAgICpcbiAgICogTk9URTogT25seSBvbmUgb2YgYHRlbXBsYXRlVXJsYCBvciBgdGVtcGxhdGVgIGNhbiBiZSBkZWZpbmVkIHBlciBWaWV3LlxuICAgKlxuICAgKiA8IS0tIFRPRE86IHdoYXQncyB0aGUgdXJsIHJlbGF0aXZlIHRvPyAtLT5cbiAgICovXG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhbiBpbmxpbmUgdGVtcGxhdGUgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKlxuICAgKiBOT1RFOiBPbmx5IG9uZSBvZiBgdGVtcGxhdGVVcmxgIG9yIGB0ZW1wbGF0ZWAgY2FuIGJlIGRlZmluZWQgcGVyIFZpZXcuXG4gICAqL1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgc3R5bGVzaGVldCBVUkxzIGZvciBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAgICpcbiAgICogPCEtLSBUT0RPOiB3aGF0J3MgdGhlIHVybCByZWxhdGl2ZSB0bz8gLS0+XG4gICAqL1xuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYW4gaW5saW5lIHN0eWxlc2hlZXQgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKi9cbiAgc3R5bGVzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGEgbGlzdCBvZiBkaXJlY3RpdmVzIHRoYXQgY2FuIGJlIHVzZWQgd2l0aGluIGEgdGVtcGxhdGUuXG4gICAqXG4gICAqIERpcmVjdGl2ZXMgbXVzdCBiZSBsaXN0ZWQgZXhwbGljaXRseSB0byBwcm92aWRlIHByb3BlciBjb21wb25lbnQgZW5jYXBzdWxhdGlvbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gICAqICAgZGlyZWN0aXZlczogW05nRm9yXVxuICAgKiAgIHRlbXBsYXRlOiAnXG4gICAqICAgPHVsPlxuICAgKiAgICAgPGxpICpuZ0Zvcj1cIiNpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICAgKiAgIDwvdWw+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBkaXJlY3RpdmVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIHBpcGVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IGhvdyB0aGUgdGVtcGxhdGUgYW5kIHRoZSBzdHlsZXMgc2hvdWxkIGJlIGVuY2Fwc3VsYXRlZC5cbiAgICogVGhlIGRlZmF1bHQgaXMge0BsaW5rIFZpZXdFbmNhcHN1bGF0aW9uI0VtdWxhdGVkIGBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZGB9IGlmIHRoZSB2aWV3XG4gICAqIGhhcyBzdHlsZXMsXG4gICAqIG90aGVyd2lzZSB7QGxpbmsgVmlld0VuY2Fwc3VsYXRpb24jTm9uZSBgVmlld0VuY2Fwc3VsYXRpb24uTm9uZWB9LlxuICAgKi9cbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG5cbiAgY29uc3RydWN0b3Ioe3RlbXBsYXRlVXJsLCB0ZW1wbGF0ZSwgZGlyZWN0aXZlcywgcGlwZXMsIGVuY2Fwc3VsYXRpb24sIHN0eWxlcywgc3R5bGVVcmxzfToge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBzdHlsZVVybHM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG4gICAgdGhpcy5kaXJlY3RpdmVzID0gZGlyZWN0aXZlcztcbiAgICB0aGlzLnBpcGVzID0gcGlwZXM7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgfVxufVxuIl19
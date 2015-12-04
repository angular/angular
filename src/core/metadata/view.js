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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcudHMiXSwibmFtZXMiOlsiVmlld0VuY2Fwc3VsYXRpb24iLCJWaWV3TWV0YWRhdGEiLCJWaWV3TWV0YWRhdGEuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQTBCLDBCQUEwQixDQUFDLENBQUE7QUFFckQ7Ozs7R0FJRztBQUNILFdBQVksaUJBQWlCO0lBQzNCQTs7Ozs7OztPQU9HQTtJQUNIQSxpRUFBUUEsQ0FBQUE7SUFDUkE7Ozs7O09BS0dBO0lBQ0hBLDZEQUFNQSxDQUFBQTtJQUNOQTs7T0FFR0E7SUFDSEEseURBQUlBLENBQUFBO0FBQ05BLENBQUNBLEVBckJXLHlCQUFpQixLQUFqQix5QkFBaUIsUUFxQjVCO0FBckJELElBQVksaUJBQWlCLEdBQWpCLHlCQXFCWCxDQUFBO0FBRVUsaUNBQXlCLEdBQ2hDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUduRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNIO0lBOERFQyxzQkFBWUEsRUFRTkE7aUNBQUZDLEVBQUVBLE9BUk9BLFdBQVdBLG1CQUFFQSxRQUFRQSxnQkFBRUEsVUFBVUEsa0JBQUVBLEtBQUtBLGFBQUVBLGFBQWFBLHFCQUFFQSxNQUFNQSxjQUFFQSxTQUFTQTtRQVNyRkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsV0FBV0EsQ0FBQ0E7UUFDL0JBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBO1FBQzdCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNuQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsYUFBYUEsQ0FBQ0E7SUFDckNBLENBQUNBO0lBOUVIRDtRQUFDQSxZQUFLQSxFQUFFQTs7cUJBK0VQQTtJQUFEQSxtQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvRUQsSUErRUM7QUE5RVksb0JBQVksZUE4RXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNULCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIERlZmluZXMgdGVtcGxhdGUgYW5kIHN0eWxlIGVuY2Fwc3VsYXRpb24gb3B0aW9ucyBhdmFpbGFibGUgZm9yIENvbXBvbmVudCdzIHtAbGluayBWaWV3fS5cbiAqXG4gKiBTZWUge0BsaW5rIFZpZXdNZXRhZGF0YSNlbmNhcHN1bGF0aW9ufS5cbiAqL1xuZXhwb3J0IGVudW0gVmlld0VuY2Fwc3VsYXRpb24ge1xuICAvKipcbiAgICogRW11bGF0ZSBgTmF0aXZlYCBzY29waW5nIG9mIHN0eWxlcyBieSBhZGRpbmcgYW4gYXR0cmlidXRlIGNvbnRhaW5pbmcgc3Vycm9nYXRlIGlkIHRvIHRoZSBIb3N0XG4gICAqIEVsZW1lbnQgYW5kIHByZS1wcm9jZXNzaW5nIHRoZSBzdHlsZSBydWxlcyBwcm92aWRlZCB2aWFcbiAgICoge0BsaW5rIFZpZXdNZXRhZGF0YSNzdHlsZXN9IG9yIHtAbGluayBWaWV3TWV0YWRhdGEjc3R5bGVzVXJsc30sIGFuZCBhZGRpbmcgdGhlIG5ldyBIb3N0IEVsZW1lbnRcbiAgICogYXR0cmlidXRlIHRvIGFsbCBzZWxlY3RvcnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgb3B0aW9uLlxuICAgKi9cbiAgRW11bGF0ZWQsXG4gIC8qKlxuICAgKiBVc2UgdGhlIG5hdGl2ZSBlbmNhcHN1bGF0aW9uIG1lY2hhbmlzbSBvZiB0aGUgcmVuZGVyZXIuXG4gICAqXG4gICAqIEZvciB0aGUgRE9NIHRoaXMgbWVhbnMgdXNpbmcgW1NoYWRvdyBET01dKGh0dHBzOi8vdzNjLmdpdGh1Yi5pby93ZWJjb21wb25lbnRzL3NwZWMvc2hhZG93LykgYW5kXG4gICAqIGNyZWF0aW5nIGEgU2hhZG93Um9vdCBmb3IgQ29tcG9uZW50J3MgSG9zdCBFbGVtZW50LlxuICAgKi9cbiAgTmF0aXZlLFxuICAvKipcbiAgICogRG9uJ3QgcHJvdmlkZSBhbnkgdGVtcGxhdGUgb3Igc3R5bGUgZW5jYXBzdWxhdGlvbi5cbiAgICovXG4gIE5vbmVcbn1cblxuZXhwb3J0IHZhciBWSUVXX0VOQ0FQU1VMQVRJT05fVkFMVUVTID1cbiAgICBbVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQsIFZpZXdFbmNhcHN1bGF0aW9uLk5hdGl2ZSwgVmlld0VuY2Fwc3VsYXRpb24uTm9uZV07XG5cblxuLyoqXG4gKiBNZXRhZGF0YSBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgY29uZmlndXJpbmcgVmlld3MuXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5kIGF0IGxlYXN0IG9uZSBgQFZpZXdgIGFubm90YXRpb24uIFRoZVxuICogYEBWaWV3YCBhbm5vdGF0aW9uIHNwZWNpZmllcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byB1c2UsIGFuZCBsaXN0cyB0aGUgZGlyZWN0aXZlcyB0aGF0IGFyZSBhY3RpdmVcbiAqIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgaW50byB0aGUgY29tcG9uZW50J3Mgc2hhZG93IHJvb3QsIGFuZFxuICogdGhlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGluIHRoZSB0ZW1wbGF0ZSBhcmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBGb3IgZGV0YWlscyBvbiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJyxcbiAqICAgZGlyZWN0aXZlczogW0dyZWV0VXNlciwgQm9sZF1cbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFZpZXdNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSB0ZW1wbGF0ZSBVUkwgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKlxuICAgKiBOT1RFOiBPbmx5IG9uZSBvZiBgdGVtcGxhdGVVcmxgIG9yIGB0ZW1wbGF0ZWAgY2FuIGJlIGRlZmluZWQgcGVyIFZpZXcuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogd2hhdCdzIHRoZSB1cmwgcmVsYXRpdmUgdG8/IC0tPlxuICAgKi9cbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFuIGlubGluZSB0ZW1wbGF0ZSBmb3IgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gICAqXG4gICAqIE5PVEU6IE9ubHkgb25lIG9mIGB0ZW1wbGF0ZVVybGAgb3IgYHRlbXBsYXRlYCBjYW4gYmUgZGVmaW5lZCBwZXIgVmlldy5cbiAgICovXG4gIHRlbXBsYXRlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBzdHlsZXNoZWV0IFVSTHMgZm9yIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICAgKlxuICAgKiA8IS0tIFRPRE86IHdoYXQncyB0aGUgdXJsIHJlbGF0aXZlIHRvPyAtLT5cbiAgICovXG4gIHN0eWxlVXJsczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhbiBpbmxpbmUgc3R5bGVzaGVldCBmb3IgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gICAqL1xuICBzdHlsZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYSBsaXN0IG9mIGRpcmVjdGl2ZXMgdGhhdCBjYW4gYmUgdXNlZCB3aXRoaW4gYSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogRGlyZWN0aXZlcyBtdXN0IGJlIGxpc3RlZCBleHBsaWNpdGx5IHRvIHByb3ZpZGUgcHJvcGVyIGNvbXBvbmVudCBlbmNhcHN1bGF0aW9uLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAgICogICBkaXJlY3RpdmVzOiBbTmdGb3JdXG4gICAqICAgdGVtcGxhdGU6ICdcbiAgICogICA8dWw+XG4gICAqICAgICA8bGkgKm5nLWZvcj1cIiNpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICAgKiAgIDwvdWw+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBkaXJlY3RpdmVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIHBpcGVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IGhvdyB0aGUgdGVtcGxhdGUgYW5kIHRoZSBzdHlsZXMgc2hvdWxkIGJlIGVuY2Fwc3VsYXRlZC5cbiAgICogVGhlIGRlZmF1bHQgaXMge0BsaW5rIFZpZXdFbmNhcHN1bGF0aW9uI0VtdWxhdGVkIGBWaWV3RW5jYXBzdWxhdGlvbi5FbXVsYXRlZGB9IGlmIHRoZSB2aWV3XG4gICAqIGhhcyBzdHlsZXMsXG4gICAqIG90aGVyd2lzZSB7QGxpbmsgVmlld0VuY2Fwc3VsYXRpb24jTm9uZSBgVmlld0VuY2Fwc3VsYXRpb24uTm9uZWB9LlxuICAgKi9cbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG5cbiAgY29uc3RydWN0b3Ioe3RlbXBsYXRlVXJsLCB0ZW1wbGF0ZSwgZGlyZWN0aXZlcywgcGlwZXMsIGVuY2Fwc3VsYXRpb24sIHN0eWxlcywgc3R5bGVVcmxzfToge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBzdHlsZVVybHM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG4gICAgdGhpcy5kaXJlY3RpdmVzID0gZGlyZWN0aXZlcztcbiAgICB0aGlzLnBpcGVzID0gcGlwZXM7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgfVxufVxuIl19
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
// #docregion LowerUpperPipe
export let LowerUpperPipeExample = class LowerUpperPipeExample {
    change(value) { this.value = value; }
};
LowerUpperPipeExample = __decorate([
    Component({
        selector: 'lowerupper-example',
        template: `<div>
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text">
    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>
    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], LowerUpperPipeExample);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [LowerUpperPipeExample],
        template: `
    <h1>LowercasePipe &amp; UppercasePipe Example</h1>
    <lowerupper-example></lowerupper-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsNEJBQTRCO0FBUzVCO0lBRUUsTUFBTSxDQUFDLEtBQWEsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQVhEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLG9CQUFvQjtRQUM5QixRQUFRLEVBQUU7Ozs7U0FJSDtLQUNSLENBQUM7O3lCQUFBO0FBS0YsZ0JBQWdCO0FBVWhCO0FBQ0EsQ0FBQztBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbkMsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1VBQUE7QUFJRjtJQUNFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuXG4vLyAjZG9jcmVnaW9uIExvd2VyVXBwZXJQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsb3dlcnVwcGVyLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPGxhYmVsPk5hbWU6IDwvbGFiZWw+PGlucHV0ICNuYW1lIChrZXl1cCk9XCJjaGFuZ2UobmFtZS52YWx1ZSlcIiB0eXBlPVwidGV4dFwiPlxuICAgIDxwPkluIGxvd2VyY2FzZTogPHByZT4ne3t2YWx1ZSB8IGxvd2VyY2FzZX19JzwvcHJlPjwvcD5cbiAgICA8cD5JbiB1cHBlcmNhc2U6IDxwcmU+J3t7dmFsdWUgfCB1cHBlcmNhc2V9fSc8L3ByZT48L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgTG93ZXJVcHBlclBpcGVFeGFtcGxlIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgY2hhbmdlKHZhbHVlOiBzdHJpbmcpIHsgdGhpcy52YWx1ZSA9IHZhbHVlOyB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0xvd2VyVXBwZXJQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPkxvd2VyY2FzZVBpcGUgJmFtcDsgVXBwZXJjYXNlUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8bG93ZXJ1cHBlci1leGFtcGxlPjwvbG93ZXJ1cHBlci1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==
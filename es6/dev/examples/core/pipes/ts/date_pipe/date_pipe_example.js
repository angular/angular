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
import { bootstrap } from 'angular2/bootstrap';
// #docregion DatePipe
export let DatePipeExample = class {
    constructor() {
        this.today = Date.now();
    }
};
DatePipeExample = __decorate([
    Component({
        selector: 'date-example',
        template: `<div>
    <p>Today is {{today | date}}</p>
    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
    <p>The time is {{today | date:'jmZ'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], DatePipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [DatePipeExample],
        template: `
    <h1>DatePipe Example</h1>
    <date-example></date-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2RhdGVfcGlwZS9kYXRlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJEYXRlUGlwZUV4YW1wbGUiLCJEYXRlUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7QUFFNUMsc0JBQXNCO0FBQ3RCO0lBQUFBO1FBU0VDLFVBQUtBLEdBQVdBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUFERCxDQUFDQTtBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGNBQWM7UUFDeEIsUUFBUSxFQUFFOzs7O1NBSUg7S0FDUixDQUFDOztvQkFHRDtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzdCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5cbi8vICNkb2NyZWdpb24gRGF0ZVBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RhdGUtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5Ub2RheSBpcyB7e3RvZGF5IHwgZGF0ZX19PC9wPlxuICAgIDxwPk9yIGlmIHlvdSBwcmVmZXIsIHt7dG9kYXkgfCBkYXRlOidmdWxsRGF0ZSd9fTwvcD5cbiAgICA8cD5UaGUgdGltZSBpcyB7e3RvZGF5IHwgZGF0ZTonam1aJ319PC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIERhdGVQaXBlRXhhbXBsZSB7XG4gIHRvZGF5OiBudW1iZXIgPSBEYXRlLm5vdygpO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtEYXRlUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5EYXRlUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8ZGF0ZS1leGFtcGxlPjwvZGF0ZS1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==
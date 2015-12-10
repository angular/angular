var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { provide, Component } from 'angular2/core';
import { bootstrap } from 'angular2/bootstrap';
import { RouteConfig, RouteParams, ROUTER_DIRECTIVES, APP_BASE_HREF } from 'angular2/router';
// #docregion routerCanDeactivate
let NoteCmp = class {
    constructor(params) {
        this.id = params.get('id');
    }
    routerCanDeactivate(next, prev) {
        return confirm('Are you sure you want to leave?');
    }
};
NoteCmp = __decorate([
    Component({
        selector: 'note-cmp',
        template: `
    <div>
      <h2>id: {{id}}</h2>
      <textarea cols="40" rows="10"></textarea>
    </div>`
    }), 
    __metadata('design:paramtypes', [RouteParams])
], NoteCmp);
// #enddocregion
let NoteIndexCmp = class {
};
NoteIndexCmp = __decorate([
    Component({
        selector: 'note-index-cmp',
        template: `
    <h1>Your Notes</h1>
    <div>
      Edit <a [routerLink]="['/NoteCmp', {id: 1}]" id="note-1-link">Note 1</a> |
      Edit <a [routerLink]="['/NoteCmp', {id: 2}]" id="note-2-link">Note 2</a>
    </div>
  `,
        directives: [ROUTER_DIRECTIVES]
    }), 
    __metadata('design:paramtypes', [])
], NoteIndexCmp);
let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My App</h1>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([
        { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
        { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
    ]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}

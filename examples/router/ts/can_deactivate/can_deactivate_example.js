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
var angular2_1 = require('angular2/angular2');
var router_1 = require('angular2/router');
// #docregion canDeactivate
var NoteCmp = (function () {
    function NoteCmp(params) {
        this.id = params.get('id');
    }
    NoteCmp.prototype.canDeactivate = function (next, prev) {
        return confirm('Are you sure you want to leave?');
    };
    NoteCmp = __decorate([
        angular2_1.Component({
            selector: 'note-cmp',
            template: "\n    <div>\n      <h2>id: {{id}}</h2>\n      <textarea cols=\"40\" rows=\"10\"></textarea>\n    </div>"
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], NoteCmp);
    return NoteCmp;
})();
// #enddocregion
var NoteIndexCmp = (function () {
    function NoteIndexCmp() {
    }
    NoteIndexCmp = __decorate([
        angular2_1.Component({
            selector: 'note-index-cmp',
            template: "\n    <h1>Your Notes</h1>\n    <div>\n      Edit <a [router-link]=\"['/NoteCmp', {id: 1}]\" id=\"note-1-link\">Note 1</a> |\n      Edit <a [router-link]=\"['/NoteCmp', {id: 2}]\" id=\"note-2-link\">Note 2</a>\n    </div>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }), 
        __metadata('design:paramtypes', [])
    ], NoteIndexCmp);
    return NoteIndexCmp;
})();
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            template: "\n    <h1>My App</h1>\n    <router-outlet></router-outlet>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
            { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
        ]), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
})();
function main() {
    return angular2_1.bootstrap(AppCmp, [angular2_1.provide(router_1.APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}
exports.main = main;
//# sourceMappingURL=can_deactivate_example.js.map
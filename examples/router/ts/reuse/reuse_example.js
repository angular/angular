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
// #docregion reuseCmp
var MyCmp = (function () {
    function MyCmp(params) {
        this.name = params.get('name') || 'NOBODY';
    }
    MyCmp.prototype.canReuse = function (next, prev) { return true; };
    MyCmp.prototype.onReuse = function (next, prev) {
        this.name = next.params['name'];
    };
    MyCmp = __decorate([
        angular2_1.Component({
            selector: 'my-cmp',
            template: "\n    <div>hello {{name}}!</div>\n    <div>message: <input id=\"message\"></div>\n  "
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], MyCmp);
    return MyCmp;
})();
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            template: "\n    <h1>Say hi to...</h1>\n    <a [router-link]=\"['/HomeCmp', {name: 'naomi'}]\" id=\"naomi-link\">Naomi</a> |\n    <a [router-link]=\"['/HomeCmp', {name: 'brad'}]\" id=\"brad-link\">Brad</a>\n    <router-outlet></router-outlet>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            { path: '/', component: MyCmp, name: 'HomeCmp' },
            { path: '/:name', component: MyCmp, name: 'HomeCmp' }
        ]), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
})();
function main() {
    return angular2_1.bootstrap(AppCmp, [angular2_1.provide(router_1.APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/reuse' })]);
}
exports.main = main;
//# sourceMappingURL=reuse_example.js.map
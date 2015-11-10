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
var testing_internal_1 = require('angular2/testing_internal');
var view_resolver_1 = require('angular2/src/core/linker/view_resolver');
var metadata_1 = require('angular2/src/core/metadata');
var SomeDir = (function () {
    function SomeDir() {
    }
    return SomeDir;
})();
var SomePipe = (function () {
    function SomePipe() {
    }
    return SomePipe;
})();
var ComponentWithView = (function () {
    function ComponentWithView() {
    }
    ComponentWithView = __decorate([
        metadata_1.Component({ selector: 'sample' }),
        metadata_1.View({ template: "some template", directives: [SomeDir], pipes: [SomePipe], styles: ["some styles"] }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithView);
    return ComponentWithView;
})();
var ComponentWithTemplate = (function () {
    function ComponentWithTemplate() {
    }
    ComponentWithTemplate = __decorate([
        metadata_1.Component({
            selector: 'sample',
            template: "some template",
            directives: [SomeDir],
            pipes: [SomePipe],
            styles: ["some styles"]
        }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithTemplate);
    return ComponentWithTemplate;
})();
var ComponentWithViewTemplate = (function () {
    function ComponentWithViewTemplate() {
    }
    ComponentWithViewTemplate = __decorate([
        metadata_1.Component({ selector: 'sample', template: "some template" }),
        metadata_1.View({ template: "some template" }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithViewTemplate);
    return ComponentWithViewTemplate;
})();
var ComponentWithViewTemplateUrl = (function () {
    function ComponentWithViewTemplateUrl() {
    }
    ComponentWithViewTemplateUrl = __decorate([
        metadata_1.Component({ selector: 'sample', templateUrl: "some template url" }),
        metadata_1.View({ template: "some template" }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithViewTemplateUrl);
    return ComponentWithViewTemplateUrl;
})();
var ComponentWithoutView = (function () {
    function ComponentWithoutView() {
    }
    ComponentWithoutView = __decorate([
        metadata_1.Component({ selector: 'sample' }), 
        __metadata('design:paramtypes', [])
    ], ComponentWithoutView);
    return ComponentWithoutView;
})();
var ClassWithView = (function () {
    function ClassWithView() {
    }
    ClassWithView = __decorate([
        metadata_1.View({ template: "some template" }), 
        __metadata('design:paramtypes', [])
    ], ClassWithView);
    return ClassWithView;
})();
var SimpleClass = (function () {
    function SimpleClass() {
    }
    return SimpleClass;
})();
function main() {
    testing_internal_1.describe("ViewResolver", function () {
        var resolver;
        testing_internal_1.beforeEach(function () { resolver = new view_resolver_1.ViewResolver(); });
        testing_internal_1.it('should read out the View metadata', function () {
            var viewMetadata = resolver.resolve(ComponentWithView);
            testing_internal_1.expect(viewMetadata)
                .toEqual(new metadata_1.View({
                template: "some template",
                directives: [SomeDir],
                pipes: [SomePipe],
                styles: ["some styles"]
            }));
        });
        testing_internal_1.it('should read out the View metadata from the Component metadata', function () {
            var viewMetadata = resolver.resolve(ComponentWithTemplate);
            testing_internal_1.expect(viewMetadata)
                .toEqual(new metadata_1.ViewMetadata({
                template: "some template",
                directives: [SomeDir],
                pipes: [SomePipe],
                styles: ["some styles"]
            }));
        });
        testing_internal_1.it('should read out the View metadata from a simple class', function () {
            var viewMetadata = resolver.resolve(ClassWithView);
            testing_internal_1.expect(viewMetadata).toEqual(new metadata_1.View({ template: "some template" }));
        });
        testing_internal_1.it('should throw when Component.template is specified together with the View metadata', function () {
            testing_internal_1.expect(function () { return resolver.resolve(ComponentWithViewTemplate); })
                .toThrowErrorWith("Component 'ComponentWithViewTemplate' cannot have both 'template' and '@View' set at the same time");
        });
        testing_internal_1.it('should throw when Component.template is specified together with the View metadata', function () {
            testing_internal_1.expect(function () { return resolver.resolve(ComponentWithViewTemplateUrl); })
                .toThrowErrorWith("Component 'ComponentWithViewTemplateUrl' cannot have both 'templateUrl' and '@View' set at the same time");
        });
        testing_internal_1.it('should throw when Component has no View decorator and no template is set', function () {
            testing_internal_1.expect(function () { return resolver.resolve(ComponentWithoutView); })
                .toThrowErrorWith("Component 'ComponentWithoutView' must have either 'template', 'templateUrl', or '@View' set");
        });
        testing_internal_1.it('should throw when simple class has no View decorator and no template is set', function () {
            testing_internal_1.expect(function () { return resolver.resolve(SimpleClass); })
                .toThrowErrorWith("No View decorator found on component 'SimpleClass'");
        });
    });
}
exports.main = main;
//# sourceMappingURL=view_resolver_spec.js.map
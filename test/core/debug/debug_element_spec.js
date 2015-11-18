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
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var core_2 = require('angular2/core');
var browser_1 = require('angular2/platform/browser');
var metadata_1 = require('angular2/src/core/metadata');
var Logger = (function () {
    function Logger() {
        this.log = [];
    }
    Logger.prototype.add = function (thing) { this.log.push(thing); };
    Logger = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Logger);
    return Logger;
})();
var MessageDir = (function () {
    function MessageDir(logger) {
        this.logger = logger;
    }
    Object.defineProperty(MessageDir.prototype, "message", {
        set: function (newMessage) { this.logger.add(newMessage); },
        enumerable: true,
        configurable: true
    });
    MessageDir = __decorate([
        metadata_1.Directive({ selector: '[message]', inputs: ['message'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [Logger])
    ], MessageDir);
    return MessageDir;
})();
var ChildComp = (function () {
    function ChildComp() {
        this.childBinding = 'Original';
    }
    ChildComp = __decorate([
        metadata_1.Component({ selector: 'child-comp' }),
        metadata_1.View({
            template: "<div class=\"child\" message=\"child\">\n               <span class=\"childnested\" message=\"nestedchild\">Child</span>\n             </div>\n             <span class=\"child\" [inner-html]=\"childBinding\"></span>",
            directives: [MessageDir],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildComp);
    return ChildComp;
})();
var ConditionalContentComp = (function () {
    function ConditionalContentComp() {
    }
    ConditionalContentComp = __decorate([
        metadata_1.Component({ selector: 'cond-content-comp', viewProviders: [Logger] }),
        metadata_1.View({
            template: "<div class=\"child\" message=\"child\" *ng-if=\"false\"><ng-content></ng-content></div>",
            directives: [core_1.NgIf, MessageDir],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ConditionalContentComp);
    return ConditionalContentComp;
})();
var ParentComp = (function () {
    function ParentComp() {
        this.parentBinding = 'OriginalParent';
    }
    ParentComp = __decorate([
        metadata_1.Component({ selector: 'parent-comp', viewProviders: [Logger] }),
        metadata_1.View({
            template: "<div class=\"parent\" message=\"parent\">\n               <span class=\"parentnested\" message=\"nestedparent\">Parent</span>\n             </div>\n             <span class=\"parent\" [inner-html]=\"parentBinding\"></span>\n             <child-comp class=\"child-comp-class\"></child-comp>\n             <cond-content-comp class=\"cond-content-comp-class\"></cond-content-comp>",
            directives: [ChildComp, MessageDir, ConditionalContentComp],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ParentComp);
    return ParentComp;
})();
var CustomEmitter = (function () {
    function CustomEmitter() {
        this.myevent = new async_1.EventEmitter();
    }
    CustomEmitter = __decorate([
        metadata_1.Directive({ selector: 'custom-emitter', outputs: ['myevent'] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CustomEmitter);
    return CustomEmitter;
})();
var EventsComp = (function () {
    function EventsComp() {
        this.clicked = false;
        this.customed = false;
    }
    EventsComp.prototype.handleClick = function () { this.clicked = true; };
    EventsComp.prototype.handleCustom = function () { this.customed = true; };
    EventsComp = __decorate([
        metadata_1.Component({ selector: 'events-comp' }),
        metadata_1.View({
            template: "<button (click)=\"handleClick()\"></button>\n             <custom-emitter (myevent)=\"handleCustom()\"></custom-emitter>",
            directives: [CustomEmitter],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], EventsComp);
    return EventsComp;
})();
var UsingFor = (function () {
    function UsingFor() {
        this.stuff = ['one', 'two', 'three'];
    }
    UsingFor = __decorate([
        metadata_1.Component({ selector: 'using-for', viewProviders: [Logger] }),
        metadata_1.View({
            template: "<span *ng-for=\"#thing of stuff\" [inner-html]=\"thing\"></span>\n            <ul message=\"list\">\n              <li *ng-for=\"#item of stuff\" [inner-html]=\"item\"></li>\n            </ul>",
            directives: [core_1.NgFor, MessageDir],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], UsingFor);
    return UsingFor;
})();
function main() {
    testing_internal_1.describe('debug element', function () {
        testing_internal_1.it('should list component child elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                var childEls = componentFixture.debugElement.children;
                // The root is a lone component, and has no children in the light dom.
                testing_internal_1.expect(childEls.length).toEqual(0);
                var rootCompChildren = componentFixture.debugElement.componentViewChildren;
                // The root component has 4 elements in its shadow view.
                testing_internal_1.expect(rootCompChildren.length).toEqual(4);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(rootCompChildren[0].nativeElement, 'parent')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(rootCompChildren[1].nativeElement, 'parent')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(rootCompChildren[2].nativeElement, 'child-comp-class'))
                    .toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(rootCompChildren[3].nativeElement, 'cond-content-comp-class'))
                    .toBe(true);
                var nested = rootCompChildren[0].children;
                testing_internal_1.expect(nested.length).toEqual(1);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(nested[0].nativeElement, 'parentnested')).toBe(true);
                var childComponent = rootCompChildren[2];
                testing_internal_1.expect(childComponent.children.length).toEqual(0);
                var childCompChildren = childComponent.componentViewChildren;
                testing_internal_1.expect(childCompChildren.length).toEqual(2);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childCompChildren[0].nativeElement, 'child')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childCompChildren[1].nativeElement, 'child')).toBe(true);
                var childNested = childCompChildren[0].children;
                testing_internal_1.expect(childNested.length).toEqual(1);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childNested[0].nativeElement, 'childnested')).toBe(true);
                var conditionalContentComp = rootCompChildren[3];
                testing_internal_1.expect(conditionalContentComp.children.length).toEqual(0);
                testing_internal_1.expect(conditionalContentComp.componentViewChildren.length).toEqual(1);
                var ngIfWithProjectedNgContent = conditionalContentComp.componentViewChildren[0];
                testing_internal_1.expect(ngIfWithProjectedNgContent.children.length).toBe(0);
                testing_internal_1.expect(ngIfWithProjectedNgContent.componentViewChildren.length).toBe(0);
                async.done();
            });
        }));
        testing_internal_1.it('should list child elements within viewports', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(UsingFor).then(function (componentFixture) {
                componentFixture.detectChanges();
                var childEls = componentFixture.debugElement.componentViewChildren;
                // TODO should this count include the <template> element?
                testing_internal_1.expect(childEls.length).toEqual(5);
                var list = childEls[4];
                testing_internal_1.expect(list.children.length).toEqual(4);
                async.done();
            });
        }));
        testing_internal_1.it('should query child elements', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                var childTestEls = componentFixture.debugElement.queryAll(browser_1.By.directive(MessageDir));
                testing_internal_1.expect(childTestEls.length).toBe(4);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[2].nativeElement, 'child')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[3].nativeElement, 'childnested')).toBe(true);
                async.done();
            });
        }));
        testing_internal_1.it('should query child elements in the light DOM', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                var parentEl = componentFixture.debugElement.componentViewChildren[0];
                var childTestEls = parentEl.queryAll(browser_1.By.directive(MessageDir), core_2.Scope.light);
                testing_internal_1.expect(childTestEls.length).toBe(1);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[0].nativeElement, 'parentnested')).toBe(true);
                async.done();
            });
        }));
        testing_internal_1.it('should query child elements in the current component view DOM', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                var childTestEls = componentFixture.debugElement.queryAll(browser_1.By.directive(MessageDir), core_2.Scope.view);
                testing_internal_1.expect(childTestEls.length).toBe(2);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[0].nativeElement, 'parent')).toBe(true);
                testing_internal_1.expect(dom_adapter_1.DOM.hasClass(childTestEls[1].nativeElement, 'parentnested')).toBe(true);
                async.done();
            });
        }));
        testing_internal_1.it('should allow injecting from the element injector', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.componentViewChildren[0].inject(Logger).log)
                    .toEqual(['parent', 'nestedparent', 'child', 'nestedchild']);
                async.done();
            });
        }));
        testing_internal_1.it('should trigger event handlers', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(EventsComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.componentInstance.clicked).toBe(false);
                testing_internal_1.expect(componentFixture.debugElement.componentInstance.customed).toBe(false);
                componentFixture.debugElement.componentViewChildren[0].triggerEventHandler('click', {});
                testing_internal_1.expect(componentFixture.debugElement.componentInstance.clicked).toBe(true);
                componentFixture.debugElement.componentViewChildren[1].triggerEventHandler('myevent', {});
                testing_internal_1.expect(componentFixture.debugElement.componentInstance.customed).toBe(true);
                async.done();
            });
        }));
    });
}
exports.main = main;
//# sourceMappingURL=debug_element_spec.js.map
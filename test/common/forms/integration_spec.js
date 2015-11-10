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
var testing_internal_1 = require('angular2/testing_internal');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var core_1 = require('angular2/core');
var debug_1 = require('angular2/src/core/debug');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var promise_1 = require("angular2/src/facade/promise");
function main() {
    testing_internal_1.describe("integration tests", function () {
        testing_internal_1.it("should initialize DOM elements with the given form object", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var t = "<div [ng-form-model]=\"form\">\n                <input type=\"text\" ng-control=\"login\">\n               </div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form =
                    new core_1.ControlGroup({ "login": new core_1.Control("loginValue") });
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                testing_internal_1.expect(input.nativeElement.value).toEqual("loginValue");
                async.done();
            });
        }));
        testing_internal_1.it("should update the control group values on DOM change", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var form = new core_1.ControlGroup({ "login": new core_1.Control("oldValue") });
            var t = "<div [ng-form-model]=\"form\">\n                <input type=\"text\" ng-control=\"login\">\n              </div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form = form;
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                input.nativeElement.value = "updatedValue";
                testing_internal_1.dispatchEvent(input.nativeElement, "change");
                testing_internal_1.expect(form.value).toEqual({ "login": "updatedValue" });
                async.done();
            });
        }));
        testing_internal_1.it("should emit ng-submit event on submit", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
            var t = "<div>\n                      <form [ng-form-model]=\"form\" (ng-submit)=\"name='updated'\"></form>\n                      <span>{{name}}</span>\n                    </div>";
            var fixture;
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
            testing_internal_1.tick();
            fixture.debugElement.componentInstance.form = new core_1.ControlGroup({});
            fixture.debugElement.componentInstance.name = 'old';
            testing_internal_1.tick();
            var form = fixture.debugElement.query(debug_1.By.css("form"));
            testing_internal_1.dispatchEvent(form.nativeElement, "submit");
            testing_internal_1.tick();
            testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual('updated');
        })));
        testing_internal_1.it("should work with single controls", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var control = new core_1.Control("loginValue");
            var t = "<div><input type=\"text\" [ng-form-control]=\"form\"></div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form = control;
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                testing_internal_1.expect(input.nativeElement.value).toEqual("loginValue");
                input.nativeElement.value = "updatedValue";
                testing_internal_1.dispatchEvent(input.nativeElement, "change");
                testing_internal_1.expect(control.value).toEqual("updatedValue");
                async.done();
            });
        }));
        testing_internal_1.it("should update DOM elements when rebinding the control group", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var t = "<div [ng-form-model]=\"form\">\n                <input type=\"text\" ng-control=\"login\">\n               </div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form =
                    new core_1.ControlGroup({ "login": new core_1.Control("oldValue") });
                fixture.detectChanges();
                fixture.debugElement.componentInstance.form =
                    new core_1.ControlGroup({ "login": new core_1.Control("newValue") });
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                testing_internal_1.expect(input.nativeElement.value).toEqual("newValue");
                async.done();
            });
        }));
        testing_internal_1.it("should update DOM elements when updating the value of a control", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var login = new core_1.Control("oldValue");
            var form = new core_1.ControlGroup({ "login": login });
            var t = "<div [ng-form-model]=\"form\">\n                <input type=\"text\" ng-control=\"login\">\n               </div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form = form;
                fixture.detectChanges();
                login.updateValue("newValue");
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                testing_internal_1.expect(input.nativeElement.value).toEqual("newValue");
                async.done();
            });
        }));
        testing_internal_1.it("should mark controls as touched after interacting with the DOM control", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            var login = new core_1.Control("oldValue");
            var form = new core_1.ControlGroup({ "login": login });
            var t = "<div [ng-form-model]=\"form\">\n                <input type=\"text\" ng-control=\"login\">\n               </div>";
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                fixture.debugElement.componentInstance.form = form;
                fixture.detectChanges();
                var loginEl = fixture.debugElement.query(debug_1.By.css("input"));
                testing_internal_1.expect(login.touched).toBe(false);
                testing_internal_1.dispatchEvent(loginEl.nativeElement, "blur");
                testing_internal_1.expect(login.touched).toBe(true);
                async.done();
            });
        }));
        testing_internal_1.describe("different control types", function () {
            testing_internal_1.it("should support <input type=text>", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"text\" ng-control=\"text\">\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "text": new core_1.Control("old") });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.value).toEqual("old");
                    input.nativeElement.value = "new";
                    testing_internal_1.dispatchEvent(input.nativeElement, "input");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "text": "new" });
                    async.done();
                });
            }));
            testing_internal_1.it("should support <input> without type", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <input ng-control=\"text\">\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "text": new core_1.Control("old") });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.value).toEqual("old");
                    input.nativeElement.value = "new";
                    testing_internal_1.dispatchEvent(input.nativeElement, "input");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "text": "new" });
                    async.done();
                });
            }));
            testing_internal_1.it("should support <textarea>", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <textarea ng-control=\"text\"></textarea>\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "text": new core_1.Control('old') });
                    fixture.detectChanges();
                    var textarea = fixture.debugElement.query(debug_1.By.css("textarea"));
                    testing_internal_1.expect(textarea.nativeElement.value).toEqual("old");
                    textarea.nativeElement.value = "new";
                    testing_internal_1.dispatchEvent(textarea.nativeElement, "input");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "text": 'new' });
                    async.done();
                });
            }));
            testing_internal_1.it("should support <type=checkbox>", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"checkbox\" ng-control=\"checkbox\">\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "checkbox": new core_1.Control(true) });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.checked).toBe(true);
                    input.nativeElement.checked = false;
                    testing_internal_1.dispatchEvent(input.nativeElement, "change");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "checkbox": false });
                    async.done();
                });
            }));
            testing_internal_1.it("should support <type=number>", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"number\" ng-control=\"num\">\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "num": new core_1.Control(10) });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.value).toEqual("10");
                    input.nativeElement.value = "20";
                    testing_internal_1.dispatchEvent(input.nativeElement, "change");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "num": 20 });
                    async.done();
                });
            }));
            testing_internal_1.it("should support <select>", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                    <select ng-control=\"city\">\n                      <option value=\"SF\"></option>\n                      <option value=\"NYC\"></option>\n                    </select>\n                  </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "city": new core_1.Control("SF") });
                    fixture.detectChanges();
                    var select = fixture.debugElement.query(debug_1.By.css("select"));
                    var sfOption = fixture.debugElement.query(debug_1.By.css("option"));
                    testing_internal_1.expect(select.nativeElement.value).toEqual('SF');
                    testing_internal_1.expect(sfOption.nativeElement.selected).toBe(true);
                    select.nativeElement.value = 'NYC';
                    testing_internal_1.dispatchEvent(select.nativeElement, "change");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "city": 'NYC' });
                    testing_internal_1.expect(sfOption.nativeElement.selected).toBe(false);
                    async.done();
                });
            }));
            testing_internal_1.it("should support <select> with a dynamic list of options", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<div [ng-form-model]=\"form\">\n                      <select ng-control=\"city\">\n                        <option *ng-for=\"#c of data\" [value]=\"c\"></option>\n                      </select>\n                  </div>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (compFixture) { return fixture = compFixture; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.form =
                    new core_1.ControlGroup({ "city": new core_1.Control("NYC") });
                fixture.debugElement.componentInstance.data = ['SF', 'NYC'];
                fixture.detectChanges();
                testing_internal_1.tick();
                var select = fixture.debugElement.query(debug_1.By.css('select'));
                testing_internal_1.expect(select.nativeElement.value).toEqual('NYC');
            })));
            testing_internal_1.it("should support custom value accessors", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"text\" ng-control=\"name\" wrapped-value>\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "name": new core_1.Control("aa") });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.value).toEqual("!aa!");
                    input.nativeElement.value = "!bb!";
                    testing_internal_1.dispatchEvent(input.nativeElement, "change");
                    testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "name": "bb" });
                    async.done();
                });
            }));
            testing_internal_1.it("should support custom value accessors on non builtin input elements that fire a change event without a 'target' property", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div [ng-form-model]=\"form\">\n                  <my-input ng-control=\"name\"></my-input>\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form =
                        new core_1.ControlGroup({ "name": new core_1.Control("aa") });
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("my-input"));
                    testing_internal_1.expect(input.componentInstance.value).toEqual("!aa!");
                    input.componentInstance.value = "!bb!";
                    async_1.ObservableWrapper.subscribe(input.componentInstance.onChange, function (value) {
                        testing_internal_1.expect(fixture.debugElement.componentInstance.form.value).toEqual({ "name": "bb" });
                        async.done();
                    });
                    input.componentInstance.dispatchChangeEvent();
                });
            }));
        });
        testing_internal_1.describe("validations", function () {
            testing_internal_1.it("should use sync validators defined in html", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.ControlGroup({ "login": new core_1.Control(""), "min": new core_1.Control(""), "max": new core_1.Control("") });
                var t = "<div [ng-form-model]=\"form\" login-is-empty-validator>\n                    <input type=\"text\" ng-control=\"login\" required>\n                    <input type=\"text\" ng-control=\"min\" minlength=\"3\">\n                    <input type=\"text\" ng-control=\"max\" maxlength=\"3\">\n                 </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    var required = fixture.debugElement.query(debug_1.By.css("[required]"));
                    var minLength = fixture.debugElement.query(debug_1.By.css("[minlength]"));
                    var maxLength = fixture.debugElement.query(debug_1.By.css("[maxlength]"));
                    required.nativeElement.value = "";
                    minLength.nativeElement.value = "1";
                    maxLength.nativeElement.value = "1234";
                    testing_internal_1.dispatchEvent(required.nativeElement, "change");
                    testing_internal_1.dispatchEvent(minLength.nativeElement, "change");
                    testing_internal_1.dispatchEvent(maxLength.nativeElement, "change");
                    testing_internal_1.expect(form.hasError("required", ["login"])).toEqual(true);
                    testing_internal_1.expect(form.hasError("minlength", ["min"])).toEqual(true);
                    testing_internal_1.expect(form.hasError("maxlength", ["max"])).toEqual(true);
                    testing_internal_1.expect(form.hasError("loginIsEmpty")).toEqual(true);
                    required.nativeElement.value = "1";
                    minLength.nativeElement.value = "123";
                    maxLength.nativeElement.value = "123";
                    testing_internal_1.dispatchEvent(required.nativeElement, "change");
                    testing_internal_1.dispatchEvent(minLength.nativeElement, "change");
                    testing_internal_1.dispatchEvent(maxLength.nativeElement, "change");
                    testing_internal_1.expect(form.valid).toEqual(true);
                    async.done();
                });
            }));
            testing_internal_1.it("should use async validators defined in the html", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var form = new core_1.ControlGroup({ "login": new core_1.Control("") });
                var t = "<div [ng-form-model]=\"form\">\n                    <input type=\"text\" ng-control=\"login\" uniq-login-validator=\"expected\">\n                 </div>";
                var rootTC;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { return rootTC = root; });
                testing_internal_1.tick();
                rootTC.debugElement.componentInstance.form = form;
                rootTC.detectChanges();
                testing_internal_1.expect(form.pending).toEqual(true);
                testing_internal_1.tick(100);
                testing_internal_1.expect(form.hasError("uniqLogin", ["login"])).toEqual(true);
                var input = rootTC.debugElement.query(debug_1.By.css("input"));
                input.nativeElement.value = "expected";
                testing_internal_1.dispatchEvent(input.nativeElement, "change");
                testing_internal_1.tick(100);
                testing_internal_1.expect(form.valid).toEqual(true);
            })));
            testing_internal_1.it("should use sync validators defined in the model", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.ControlGroup({ "login": new core_1.Control("aa", core_1.Validators.required) });
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"text\" ng-control=\"login\">\n                 </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    testing_internal_1.expect(form.valid).toEqual(true);
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    input.nativeElement.value = "";
                    testing_internal_1.dispatchEvent(input.nativeElement, "change");
                    testing_internal_1.expect(form.valid).toEqual(false);
                    async.done();
                });
            }));
            testing_internal_1.it("should use async validators defined in the model", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var control = new core_1.Control("", core_1.Validators.required, uniqLoginAsyncValidator("expected"));
                var form = new core_1.ControlGroup({ "login": control });
                var t = "<div [ng-form-model]=\"form\">\n                  <input type=\"text\" ng-control=\"login\">\n                 </div>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { return fixture =
                    root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.form = form;
                fixture.detectChanges();
                testing_internal_1.expect(form.hasError("required", ["login"])).toEqual(true);
                var input = fixture.debugElement.query(debug_1.By.css("input"));
                input.nativeElement.value = "wrong value";
                testing_internal_1.dispatchEvent(input.nativeElement, "change");
                testing_internal_1.expect(form.pending).toEqual(true);
                testing_internal_1.tick();
                testing_internal_1.expect(form.hasError("uniqLogin", ["login"])).toEqual(true);
                input.nativeElement.value = "expected";
                testing_internal_1.dispatchEvent(input.nativeElement, "change");
                testing_internal_1.tick();
                testing_internal_1.expect(form.valid).toEqual(true);
            })));
        });
        testing_internal_1.describe("nested forms", function () {
            testing_internal_1.it("should init DOM with the given form object", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.ControlGroup({ "nested": new core_1.ControlGroup({ "login": new core_1.Control("value") }) });
                var t = "<div [ng-form-model]=\"form\">\n                  <div ng-control-group=\"nested\">\n                    <input type=\"text\" ng-control=\"login\">\n                  </div>\n              </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    testing_internal_1.expect(input.nativeElement.value).toEqual("value");
                    async.done();
                });
            }));
            testing_internal_1.it("should update the control group values on DOM change", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.ControlGroup({ "nested": new core_1.ControlGroup({ "login": new core_1.Control("value") }) });
                var t = "<div [ng-form-model]=\"form\">\n                    <div ng-control-group=\"nested\">\n                      <input type=\"text\" ng-control=\"login\">\n                    </div>\n                </div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input"));
                    input.nativeElement.value = "updatedValue";
                    testing_internal_1.dispatchEvent(input.nativeElement, "change");
                    testing_internal_1.expect(form.value).toEqual({ "nested": { "login": "updatedValue" } });
                    async.done();
                });
            }));
        });
        testing_internal_1.it("should support ng-model for complex forms", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
            var form = new core_1.ControlGroup({ "name": new core_1.Control("") });
            var t = "<div [ng-form-model]=\"form\"><input type=\"text\" ng-control=\"name\" [(ng-model)]=\"name\"></div>";
            var fixture;
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
            testing_internal_1.tick();
            fixture.debugElement.componentInstance.name = 'oldValue';
            fixture.debugElement.componentInstance.form = form;
            fixture.detectChanges();
            var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
            testing_internal_1.expect(input.value).toEqual("oldValue");
            input.value = "updatedValue";
            testing_internal_1.dispatchEvent(input, "change");
            testing_internal_1.tick();
            testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("updatedValue");
        })));
        testing_internal_1.it("should support ng-model for single fields", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
            var form = new core_1.Control("");
            var t = "<div><input type=\"text\" [ng-form-control]=\"form\" [(ng-model)]=\"name\"></div>";
            var fixture;
            tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
            testing_internal_1.tick();
            fixture.debugElement.componentInstance.form = form;
            fixture.debugElement.componentInstance.name = "oldValue";
            fixture.detectChanges();
            var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
            testing_internal_1.expect(input.value).toEqual("oldValue");
            input.value = "updatedValue";
            testing_internal_1.dispatchEvent(input, "change");
            testing_internal_1.tick();
            testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("updatedValue");
        })));
        testing_internal_1.describe("template-driven forms", function () {
            testing_internal_1.it("should add new controls and control groups", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<form>\n                     <div ng-control-group=\"user\">\n                      <input type=\"text\" ng-control=\"login\">\n                     </div>\n               </form>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = null;
                fixture.detectChanges();
                var form = fixture.debugElement.componentViewChildren[0].inject(core_1.NgForm);
                testing_internal_1.expect(form.controls['user']).not.toBeDefined();
                testing_internal_1.tick();
                testing_internal_1.expect(form.controls['user']).toBeDefined();
                testing_internal_1.expect(form.controls['user'].controls['login']).toBeDefined();
            })));
            testing_internal_1.it("should emit ng-submit event on submit", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<div><form (ng-submit)=\"name='updated'\"></form></div>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = 'old';
                var form = fixture.debugElement.query(debug_1.By.css("form"));
                testing_internal_1.dispatchEvent(form.nativeElement, "submit");
                testing_internal_1.tick();
                testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("updated");
            })));
            testing_internal_1.it("should not create a template-driven form when ng-no-form is used", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<form ng-no-form>\n               </form>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.name = null;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.componentViewChildren.length).toEqual(0);
                    async.done();
                });
            }));
            testing_internal_1.it("should remove controls", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<form>\n                    <div *ng-if=\"name == 'show'\">\n                      <input type=\"text\" ng-control=\"login\">\n                    </div>\n                  </form>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = 'show';
                fixture.detectChanges();
                testing_internal_1.tick();
                var form = fixture.debugElement.componentViewChildren[0].inject(core_1.NgForm);
                testing_internal_1.expect(form.controls['login']).toBeDefined();
                fixture.debugElement.componentInstance.name = 'hide';
                fixture.detectChanges();
                testing_internal_1.tick();
                testing_internal_1.expect(form.controls['login']).not.toBeDefined();
            })));
            testing_internal_1.it("should remove control groups", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<form>\n                     <div *ng-if=\"name=='show'\" ng-control-group=\"user\">\n                      <input type=\"text\" ng-control=\"login\">\n                     </div>\n               </form>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = 'show';
                fixture.detectChanges();
                testing_internal_1.tick();
                var form = fixture.debugElement.componentViewChildren[0].inject(core_1.NgForm);
                testing_internal_1.expect(form.controls['user']).toBeDefined();
                fixture.debugElement.componentInstance.name = 'hide';
                fixture.detectChanges();
                testing_internal_1.tick();
                testing_internal_1.expect(form.controls['user']).not.toBeDefined();
            })));
            testing_internal_1.it("should support ng-model for complex forms", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<form>\n                      <input type=\"text\" ng-control=\"name\" [(ng-model)]=\"name\">\n               </form>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = "oldValue";
                fixture.detectChanges();
                testing_internal_1.tick();
                var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                testing_internal_1.expect(input.value).toEqual("oldValue");
                input.value = "updatedValue";
                testing_internal_1.dispatchEvent(input, "change");
                testing_internal_1.tick();
                testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("updatedValue");
            })));
            testing_internal_1.it("should support ng-model for single fields", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<div><input type=\"text\" [(ng-model)]=\"name\"></div>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = "oldValue";
                fixture.detectChanges();
                var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                testing_internal_1.expect(input.value).toEqual("oldValue");
                input.value = "updatedValue";
                testing_internal_1.dispatchEvent(input, "change");
                testing_internal_1.tick();
                testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("updatedValue");
            })));
        });
        testing_internal_1.describe("setting status classes", function () {
            testing_internal_1.it("should work with single fields", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.Control("", core_1.Validators.required);
                var t = "<div><input type=\"text\" [ng-form-control]=\"form\"></div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                    testing_internal_1.expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);
                    testing_internal_1.dispatchEvent(input, "blur");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);
                    input.value = "updatedValue";
                    testing_internal_1.dispatchEvent(input, "change");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
                    async.done();
                });
            }));
            testing_internal_1.it("should work with complex model-driven forms", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var form = new core_1.ControlGroup({ "name": new core_1.Control("", core_1.Validators.required) });
                var t = "<form [ng-form-model]=\"form\"><input type=\"text\" ng-control=\"name\"></form>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.form = form;
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-untouched"]);
                    testing_internal_1.dispatchEvent(input, "blur");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);
                    input.value = "updatedValue";
                    testing_internal_1.dispatchEvent(input, "change");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
                    async.done();
                });
            }));
            testing_internal_1.it("should work with ng-model", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                var t = "<div><input [(ng-model)]=\"name\" required></div>";
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (fixture) {
                    fixture.debugElement.componentInstance.name = "";
                    fixture.detectChanges();
                    var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-untouched"]);
                    testing_internal_1.dispatchEvent(input, "blur");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);
                    input.value = "updatedValue";
                    testing_internal_1.dispatchEvent(input, "change");
                    fixture.detectChanges();
                    testing_internal_1.expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
                    async.done();
                });
            }));
        });
        testing_internal_1.describe("ng-model corner cases", function () {
            testing_internal_1.it("should not update the view when the value initially came from the view", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var form = new core_1.Control("");
                var t = "<div><input type=\"text\" [ng-form-control]=\"form\" [(ng-model)]=\"name\"></div>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.form = form;
                fixture.detectChanges();
                // In Firefox, effective text selection in the real DOM requires an actual focus
                // of the field. This is not an issue in a new HTML document.
                if (testing_internal_1.browserDetection.isFirefox) {
                    var fakeDoc = dom_adapter_1.DOM.createHtmlDocument();
                    dom_adapter_1.DOM.appendChild(fakeDoc.body, fixture.debugElement.nativeElement);
                }
                var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                input.value = "aa";
                input.selectionStart = 1;
                testing_internal_1.dispatchEvent(input, "change");
                testing_internal_1.tick();
                fixture.detectChanges();
                // selection start has not changed because we did not reset the value
                testing_internal_1.expect(input.selectionStart).toEqual(1);
            })));
            testing_internal_1.it("should update the view when the model is set back to what used to be in the view", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                var t = "<input type=\"text\" [(ng-model)]=\"name\">";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.debugElement.componentInstance.name = "";
                fixture.detectChanges();
                // Type "aa" into the input.
                var input = fixture.debugElement.query(debug_1.By.css("input")).nativeElement;
                input.value = "aa";
                input.selectionStart = 1;
                testing_internal_1.dispatchEvent(input, "change");
                testing_internal_1.tick();
                fixture.detectChanges();
                testing_internal_1.expect(fixture.debugElement.componentInstance.name).toEqual("aa");
                // Programatically update the input value to be "bb".
                fixture.debugElement.componentInstance.name = "bb";
                testing_internal_1.tick();
                fixture.detectChanges();
                testing_internal_1.expect(input.value).toEqual("bb");
                // Programatically set it back to "aa".
                fixture.debugElement.componentInstance.name = "aa";
                testing_internal_1.tick();
                fixture.detectChanges();
                testing_internal_1.expect(input.value).toEqual("aa");
            })));
            testing_internal_1.it("should not crash when validity is checked from a binding", testing_internal_1.inject([testing_internal_1.TestComponentBuilder], testing_internal_1.fakeAsync(function (tcb) {
                // {{x.valid}} used to crash because valid() tried to read a property
                // from form.control before it was set. This test verifies this bug is
                // fixed.
                var t = "<form><div ng-control-group=\"x\" #x=\"form\">\n                  <input type=\"text\" ng-control=\"test\"></div>{{x.valid}}</form>";
                var fixture;
                tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(function (root) { fixture = root; });
                testing_internal_1.tick();
                fixture.detectChanges();
            })));
        });
    });
}
exports.main = main;
var WrappedValue = (function () {
    function WrappedValue(cd) {
        cd.valueAccessor = this;
    }
    WrappedValue.prototype.writeValue = function (value) { this.value = "!" + value + "!"; };
    WrappedValue.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    WrappedValue.prototype.registerOnTouched = function (fn) { };
    WrappedValue.prototype.handleOnChange = function (value) { this.onChange(value.substring(1, value.length - 1)); };
    WrappedValue = __decorate([
        angular2_1.Directive({
            selector: '[wrapped-value]',
            host: { '(change)': 'handleOnChange($event.target.value)', '[value]': 'value' }
        }), 
        __metadata('design:paramtypes', [core_1.NgControl])
    ], WrappedValue);
    return WrappedValue;
})();
var MyInput = (function () {
    function MyInput(cd) {
        this.onChange = new angular2_1.EventEmitter();
        cd.valueAccessor = this;
    }
    MyInput.prototype.writeValue = function (value) { this.value = "!" + value + "!"; };
    MyInput.prototype.registerOnChange = function (fn) { async_1.ObservableWrapper.subscribe(this.onChange, fn); };
    MyInput.prototype.registerOnTouched = function (fn) { };
    MyInput.prototype.dispatchChangeEvent = function () {
        async_1.ObservableWrapper.callNext(this.onChange, this.value.substring(1, this.value.length - 1));
    };
    __decorate([
        angular2_1.Output('change'), 
        __metadata('design:type', angular2_1.EventEmitter)
    ], MyInput.prototype, "onChange");
    MyInput = __decorate([
        angular2_1.Component({ selector: "my-input", template: '' }), 
        __metadata('design:paramtypes', [core_1.NgControl])
    ], MyInput);
    return MyInput;
})();
function uniqLoginAsyncValidator(expectedValue) {
    return function (c) {
        var completer = promise_1.PromiseWrapper.completer();
        var res = (c.value == expectedValue) ? null : { "uniqLogin": true };
        completer.resolve(res);
        return completer.promise;
    };
}
function loginIsEmptyGroupValidator(c) {
    return c.controls["login"].value == "" ? { "loginIsEmpty": true } : null;
}
var LoginIsEmptyValidator = (function () {
    function LoginIsEmptyValidator() {
    }
    LoginIsEmptyValidator = __decorate([
        angular2_1.Directive({
            selector: '[login-is-empty-validator]',
            providers: [new core_1.Provider(core_1.NG_VALIDATORS, { useValue: loginIsEmptyGroupValidator, multi: true })]
        }), 
        __metadata('design:paramtypes', [])
    ], LoginIsEmptyValidator);
    return LoginIsEmptyValidator;
})();
var UniqLoginValidator = (function () {
    function UniqLoginValidator() {
    }
    UniqLoginValidator.prototype.validate = function (c) { return uniqLoginAsyncValidator(this.expected)(c); };
    __decorate([
        core_1.Input('uniq-login-validator'), 
        __metadata('design:type', Object)
    ], UniqLoginValidator.prototype, "expected");
    UniqLoginValidator = __decorate([
        angular2_1.Directive({
            selector: '[uniq-login-validator]',
            providers: [
                new core_1.Provider(core_1.NG_ASYNC_VALIDATORS, { useExisting: core_1.forwardRef(function () { return UniqLoginValidator; }), multi: true })
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], UniqLoginValidator);
    return UniqLoginValidator;
})();
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        angular2_1.Component({
            selector: "my-comp",
            template: '',
            directives: [
                core_1.FORM_DIRECTIVES,
                WrappedValue,
                MyInput,
                core_1.NgIf,
                core_1.NgFor,
                LoginIsEmptyValidator,
                UniqLoginValidator
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
function sortedClassList(el) {
    var l = dom_adapter_1.DOM.classList(el);
    collection_1.ListWrapper.sort(l);
    return l;
}
//# sourceMappingURL=integration_spec.js.map
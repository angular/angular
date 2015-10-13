import {Component, Directive, View} from 'angular2/angular2';
import {
  RootTestComponent,
  afterEach,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  describe,
  dispatchEvent,
  fakeAsync,
  tick,
  expect,
  it,
  inject,
  iit,
  xit,
  browserDetection
} from 'angular2/testing_internal';

import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {
  Control,
  ControlGroup,
  ControlValueAccessor,
  FORM_DIRECTIVES,
  NgControl,
  NgIf,
  NgFor,
  NgForm,
  Validators,
} from 'angular2/core';
import {By} from 'angular2/src/core/debug';
import {ListWrapper} from 'angular2/src/core/facade/collection';

export function main() {
  describe("integration tests", () => {

    it("should initialize DOM elements with the given form object",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form =
               new ControlGroup({"login": new Control("loginValue")});
           rootTC.detectChanges();

           var input = rootTC.debugElement.query(By.css("input"));
           expect(input.nativeElement.value).toEqual("loginValue");
           async.done();
         });
       }));

    it("should update the control group values on DOM change",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var form = new ControlGroup({"login": new Control("oldValue")});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
              </div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form = form;
           rootTC.detectChanges();
           var input = rootTC.debugElement.query(By.css("input"));

           input.nativeElement.value = "updatedValue";
           dispatchEvent(input.nativeElement, "change");

           expect(form.value).toEqual({"login": "updatedValue"});
           async.done();
         });
       }));

    it("should emit ng-submit event on submit",
       inject(
           [TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
             var t =
                 `<div><form [ng-form-model]="form" (ng-submit)="name='updated'"></form><span>{{name}}</span></div>`;

             var rootTC: RootTestComponent;

             tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((root) => { rootTC = root; });
             tick();

             rootTC.debugElement.componentInstance.form = new ControlGroup({});
             rootTC.debugElement.componentInstance.name = 'old';

             tick();

             var form = rootTC.debugElement.query(By.css("form"));
             dispatchEvent(form.nativeElement, "submit");

             tick();
             expect(rootTC.debugElement.componentInstance.name).toEqual('updated');
           })));

    it("should work with single controls",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var control = new Control("loginValue");

         var t = `<div><input type="text" [ng-form-control]="form"></div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form = control;
           rootTC.detectChanges();

           var input = rootTC.debugElement.query(By.css("input"));
           expect(input.nativeElement.value).toEqual("loginValue");

           input.nativeElement.value = "updatedValue";
           dispatchEvent(input.nativeElement, "change");

           expect(control.value).toEqual("updatedValue");
           async.done();
         });
       }));

    it("should update DOM elements when rebinding the control group",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form =
               new ControlGroup({"login": new Control("oldValue")});
           rootTC.detectChanges();

           rootTC.debugElement.componentInstance.form =
               new ControlGroup({"login": new Control("newValue")});
           rootTC.detectChanges();

           var input = rootTC.debugElement.query(By.css("input"));
           expect(input.nativeElement.value).toEqual("newValue");
           async.done();
         });
       }));

    it("should update DOM elements when updating the value of a control",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var login = new Control("oldValue");
         var form = new ControlGroup({"login": login});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form = form;
           rootTC.detectChanges();

           login.updateValue("newValue");

           rootTC.detectChanges();

           var input = rootTC.debugElement.query(By.css("input"));
           expect(input.nativeElement.value).toEqual("newValue");
           async.done();
         });
       }));

    it("should mark controls as touched after interacting with the DOM control",
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         var login = new Control("oldValue");
         var form = new ControlGroup({"login": login});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
           rootTC.debugElement.componentInstance.form = form;
           rootTC.detectChanges();

           var loginEl = rootTC.debugElement.query(By.css("input"));
           expect(login.touched).toBe(false);

           dispatchEvent(loginEl.nativeElement, "blur");

           expect(login.touched).toBe(true);

           async.done();
         });
       }));

    describe("different control types", () => {
      it("should support <input type=text>",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="text">
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"text": new Control("old")});
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input"));
             expect(input.nativeElement.value).toEqual("old");

             input.nativeElement.value = "new";
             dispatchEvent(input.nativeElement, "input");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"text": "new"});
             async.done();
           });
         }));

      it("should support <input> without type",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                  <input ng-control="text">
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"text": new Control("old")});
             rootTC.detectChanges();
             var input = rootTC.debugElement.query(By.css("input"));
             expect(input.nativeElement.value).toEqual("old");

             input.nativeElement.value = "new";
             dispatchEvent(input.nativeElement, "input");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"text": "new"});
             async.done();
           });
         }));

      it("should support <textarea>",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                  <textarea ng-control="text"></textarea>
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"text": new Control('old')});
             rootTC.detectChanges();

             var textarea = rootTC.debugElement.query(By.css("textarea"));
             expect(textarea.nativeElement.value).toEqual("old");

             textarea.nativeElement.value = "new";
             dispatchEvent(textarea.nativeElement, "input");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"text": 'new'});
             async.done();
           });
         }));

      it("should support <type=checkbox>",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                  <input type="checkbox" ng-control="checkbox">
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"checkbox": new Control(true)});
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input"));
             expect(input.nativeElement.checked).toBe(true);

             input.nativeElement.checked = false;
             dispatchEvent(input.nativeElement, "change");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"checkbox": false});
             async.done();
           });
         }));

      it("should support <select>",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                    <select ng-control="city">
                      <option value="SF"></option>
                      <option value="NYC"></option>
                    </select>
                  </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"city": new Control("SF")});
             rootTC.detectChanges();

             var select = rootTC.debugElement.query(By.css("select"));
             var sfOption = rootTC.debugElement.query(By.css("option"));
             expect(select.nativeElement.value).toEqual('SF');
             expect(sfOption.nativeElement.selected).toBe(true);

             select.nativeElement.value = 'NYC';
             dispatchEvent(select.nativeElement, "change");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"city": 'NYC'});
             expect(sfOption.nativeElement.selected).toBe(false);
             async.done();
           });
         }));

      it("should support <select> with a dynamic list of options",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<div [ng-form-model]="form">
                      <select ng-control="city">
                        <option *ng-for="#c of data" [value]="c"></option>
                      </select>
                  </div>`;

                  var rootTC;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rtc) => rootTC = rtc);
                  tick();

                  rootTC.debugElement.componentInstance.form =
                      new ControlGroup({"city": new Control("NYC")});
                  rootTC.debugElement.componentInstance.data = ['SF', 'NYC'];
                  rootTC.detectChanges();
                  tick();

                  var select = rootTC.debugElement.query(By.css('select'));
                  expect(select.nativeElement.value).toEqual('NYC');
                })));

      it("should support custom value accessors",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="name" wrapped-value>
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form =
                 new ControlGroup({"name": new Control("aa")});
             rootTC.detectChanges();
             var input = rootTC.debugElement.query(By.css("input"));
             expect(input.nativeElement.value).toEqual("!aa!");

             input.nativeElement.value = "!bb!";
             dispatchEvent(input.nativeElement, "change");

             expect(rootTC.debugElement.componentInstance.form.value).toEqual({"name": "bb"});
             async.done();
           });
         }));
    });

    describe("validations", () => {
      it("should use validators defined in html",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form = new ControlGroup({"login": new Control("aa")});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="login" required>
                 </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();
             expect(form.valid).toEqual(true);

             var input = rootTC.debugElement.query(By.css("input"));

             input.nativeElement.value = "";
             dispatchEvent(input.nativeElement, "change");

             expect(form.valid).toEqual(false);
             async.done();
           });
         }));

      it("should use validators defined in the model",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form = new ControlGroup({"login": new Control("aa", Validators.required)});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="login">
                 </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();
             expect(form.valid).toEqual(true);

             var input = rootTC.debugElement.query(By.css("input"));

             input.nativeElement.value = "";
             dispatchEvent(input.nativeElement, "change");

             expect(form.valid).toEqual(false);
             async.done();
           });
         }));
    });

    describe("nested forms", () => {
      it("should init DOM with the given form object",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});

           var t = `<div [ng-form-model]="form">
                  <div ng-control-group="nested">
                    <input type="text" ng-control="login">
                  </div>
              </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input"));
             expect(input.nativeElement.value).toEqual("value");
             async.done();
           });
         }));

      it("should update the control group values on DOM change",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});

           var t = `<div [ng-form-model]="form">
                    <div ng-control-group="nested">
                      <input type="text" ng-control="login">
                    </div>
                </div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();
             var input = rootTC.debugElement.query(By.css("input"));

             input.nativeElement.value = "updatedValue";
             dispatchEvent(input.nativeElement, "change");

             expect(form.value).toEqual({"nested": {"login": "updatedValue"}});
             async.done();
           });
         }));
    });

    it("should support ng-model for complex forms",
       inject(
           [TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
             var form = new ControlGroup({"name": new Control("")});

             var t =
                 `<div [ng-form-model]="form"><input type="text" ng-control="name" [(ng-model)]="name"></div>`;

             var rootTC: RootTestComponent;
             tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((root) => { rootTC = root; });
             tick();

             rootTC.debugElement.componentInstance.name = 'oldValue';
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input")).nativeElement;
             expect(input.value).toEqual("oldValue");

             input.value = "updatedValue";
             dispatchEvent(input, "change");

             tick();
             expect(rootTC.debugElement.componentInstance.name).toEqual("updatedValue");
           })));

    it("should support ng-model for single fields",
       inject(
           [TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
             var form = new Control("");

             var t = `<div><input type="text" [ng-form-control]="form" [(ng-model)]="name"></div>`;

             var rootTC: RootTestComponent;
             tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((root) => { rootTC = root; });
             tick();
             rootTC.debugElement.componentInstance.form = form;
             rootTC.debugElement.componentInstance.name = "oldValue";
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input")).nativeElement;
             expect(input.value).toEqual("oldValue");

             input.value = "updatedValue";
             dispatchEvent(input, "change");
             tick();

             expect(rootTC.debugElement.componentInstance.name).toEqual("updatedValue");
           })));

    describe("template-driven forms", () => {
      it("should add new controls and control groups",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<form>
                     <div ng-control-group="user">
                      <input type="text" ng-control="login">
                     </div>
               </form>`;

                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = null;
                  rootTC.detectChanges();

                  var form = rootTC.debugElement.componentViewChildren[0].inject(NgForm);
                  expect(form.controls['user']).not.toBeDefined();

                  tick();

                  expect(form.controls['user']).toBeDefined();
                  expect(form.controls['user'].controls['login']).toBeDefined();
                })));

      it("should emit ng-submit event on submit",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<div><form (ng-submit)="name='updated'"></form></div>`;

                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = 'old';
                  var form = rootTC.debugElement.query(By.css("form"));

                  dispatchEvent(form.nativeElement, "submit");
                  tick();

                  expect(rootTC.debugElement.componentInstance.name).toEqual("updated");
                })));

      it("should not create a template-driven form when ng-no-form is used",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<form ng-no-form>
               </form>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.name = null;
             rootTC.detectChanges();

             expect(rootTC.debugElement.componentViewChildren.length).toEqual(0);
             async.done();
           });
         }));

      it("should remove controls",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<form>
                    <div *ng-if="name == 'show'">
                      <input type="text" ng-control="login">
                    </div>
                  </form>`;

                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = 'show';
                  rootTC.detectChanges();
                  tick();
                  var form = rootTC.debugElement.componentViewChildren[0].inject(NgForm);


                  expect(form.controls['login']).toBeDefined();

                  rootTC.debugElement.componentInstance.name = 'hide';
                  rootTC.detectChanges();
                  tick();

                  expect(form.controls['login']).not.toBeDefined();
                })));

      it("should remove control groups",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<form>
                     <div *ng-if="name=='show'" ng-control-group="user">
                      <input type="text" ng-control="login">
                     </div>
               </form>`;


                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = 'show';
                  rootTC.detectChanges();
                  tick();
                  var form = rootTC.debugElement.componentViewChildren[0].inject(NgForm);

                  expect(form.controls['user']).toBeDefined();

                  rootTC.debugElement.componentInstance.name = 'hide';
                  rootTC.detectChanges();
                  tick();

                  expect(form.controls['user']).not.toBeDefined();
                })));

      it("should support ng-model for complex forms",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<form>
                      <input type="text" ng-control="name" [(ng-model)]="name">
               </form>`;

                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = "oldValue";
                  rootTC.detectChanges();
                  tick();

                  var input = rootTC.debugElement.query(By.css("input")).nativeElement;
                  expect(input.value).toEqual("oldValue");

                  input.value = "updatedValue";
                  dispatchEvent(input, "change");
                  tick();

                  expect(rootTC.debugElement.componentInstance.name).toEqual("updatedValue");
                })));


      it("should support ng-model for single fields",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<div><input type="text" [(ng-model)]="name"></div>`;

                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = "oldValue";
                  rootTC.detectChanges();

                  var input = rootTC.debugElement.query(By.css("input")).nativeElement;
                  expect(input.value).toEqual("oldValue");

                  input.value = "updatedValue";
                  dispatchEvent(input, "change");
                  tick();

                  expect(rootTC.debugElement.componentInstance.name).toEqual("updatedValue");
                })));
    });


    describe("setting status classes", () => {
      it("should work with single fields",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form = new Control("", Validators.required);

           var t = `<div><input type="text" [ng-form-control]="form"></div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input")).nativeElement;
             expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

             dispatchEvent(input, "blur");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);

             input.value = "updatedValue";
             dispatchEvent(input, "change");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
             async.done();
           });
         }));

      it("should work with complex model-driven forms",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var form = new ControlGroup({"name": new Control("", Validators.required)});

           var t = `<form [ng-form-model]="form"><input type="text" ng-control="name"></form>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.form = form;
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input")).nativeElement;
             expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-untouched"]);

             dispatchEvent(input, "blur");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);

             input.value = "updatedValue";
             dispatchEvent(input, "change");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
             async.done();
           });
         }));

      it("should work with ng-model",
         inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
           var t = `<div><input [(ng-model)]="name" required></div>`;

           tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then((rootTC) => {
             rootTC.debugElement.componentInstance.name = "";
             rootTC.detectChanges();

             var input = rootTC.debugElement.query(By.css("input")).nativeElement;
             expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-untouched"]);

             dispatchEvent(input, "blur");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-invalid", "ng-pristine", "ng-touched"]);

             input.value = "updatedValue";
             dispatchEvent(input, "change");
             rootTC.detectChanges();

             expect(sortedClassList(input)).toEqual(["ng-dirty", "ng-touched", "ng-valid"]);
             async.done();
           });
         }));
    });

    describe("ng-model corner cases", () => {
      it("should not update the view when the value initially came from the view",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var form = new Control("");

                  var t =
                      `<div><input type="text" [ng-form-control]="form" [(ng-model)]="name"></div>`;
                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.form = form;
                  rootTC.detectChanges();

                  // In Firefox, effective text selection in the real DOM requires an actual focus
                  // of the field. This is not an issue in a new HTML document.
                  if (browserDetection.isFirefox) {
                    var fakeDoc = DOM.createHtmlDocument();
                    DOM.appendChild(fakeDoc.body, rootTC.debugElement.nativeElement);
                  }

                  var input = rootTC.debugElement.query(By.css("input")).nativeElement;
                  input.value = "aa";
                  input.selectionStart = 1;
                  dispatchEvent(input, "change");

                  tick();
                  rootTC.detectChanges();

                  // selection start has not changed because we did not reset the value
                  expect(input.selectionStart).toEqual(1);
                })));

      it("should update the view when the model is set back to what used to be in the view",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  var t = `<input type="text" [(ng-model)]="name">`;
                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.debugElement.componentInstance.name = "";
                  rootTC.detectChanges();

                  // Type "aa" into the input.
                  var input = rootTC.debugElement.query(By.css("input")).nativeElement;
                  input.value = "aa";
                  input.selectionStart = 1;
                  dispatchEvent(input, "change");

                  tick();
                  rootTC.detectChanges();
                  expect(rootTC.debugElement.componentInstance.name).toEqual("aa");

                  // Programatically update the input value to be "bb".
                  rootTC.debugElement.componentInstance.name = "bb";
                  tick();
                  rootTC.detectChanges();
                  expect(input.value).toEqual("bb");

                  // Programatically set it back to "aa".
                  rootTC.debugElement.componentInstance.name = "aa";
                  tick();
                  rootTC.detectChanges();
                  expect(input.value).toEqual("aa");
                })));
      it("should not crash when validity is checked from a binding",
         inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                  // {{x.valid}} used to crash because valid() tried to read a property
                  // from form.control before it was set. This test verifies this bug is
                  // fixed.
                  var t = `<form><div ng-control-group="x" #x="form">
                  <input type="text" ng-control="test"></div>{{x.valid}}</form>`;
                  var rootTC: RootTestComponent;
                  tcb.overrideTemplate(MyComp, t).createAsync(MyComp).then(
                      (root) => { rootTC = root; });
                  tick();
                  rootTC.detectChanges();
                })));
    });
  });
}

@Directive({
  selector: '[wrapped-value]',
  host: {'(change)': 'handleOnChange($event.target.value)', '[value]': 'value'}
})
class WrappedValue implements ControlValueAccessor {
  value;
  onChange: Function;

  constructor(cd: NgControl) { cd.valueAccessor = this; }

  writeValue(value) { this.value = `!${value}!`; }

  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) {}

  handleOnChange(value) { this.onChange(value.substring(1, value.length - 1)); }
}

@Component({selector: "my-comp"})
@View({directives: [FORM_DIRECTIVES, WrappedValue, NgIf, NgFor]})
class MyComp {
  form: any;
  name: string;
  data: any;
}

function sortedClassList(el) {
  var l = DOM.classList(el);
  ListWrapper.sort(l);
  return l;
}
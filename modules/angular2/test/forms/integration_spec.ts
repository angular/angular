import {Component, Directive, View} from 'angular2/angular2';
import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  dispatchEvent,
  fakeAsync,
  flushMicrotasks,
  tick,
  el,
  expect,
  it,
  inject,
  iit,
  xit
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';
import {TestBed} from 'angular2/src/test_lib/test_bed';
import {NgIf, NgFor} from 'angular2/directives';

import {
  Control,
  ControlGroup,
  NgForm,
  formDirectives,
  Validators,
  NgControl,
  ControlValueAccessor
} from 'angular2/forms';

export function main() {
  describe("integration tests", () => {
    it("should initialize DOM elements with the given form object",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var ctx = MyComp.create({form: new ControlGroup({"login": new Control("loginValue")})});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();

               var input = view.querySelector("input");
               expect(input.value).toEqual("loginValue");
               async.done();
             });
       }));

    it("should update the control group values on DOM change",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var form = new ControlGroup({"login": new Control("oldValue")});
         var ctx = MyComp.create({form: form});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
              </div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();
               var input = view.querySelector("input");

               input.value = "updatedValue";
               dispatchEvent(input, "change");

               expect(form.value).toEqual({"login": "updatedValue"});
               async.done();
             });
       }));

    it("should emit ng-submit event on submit",
       inject([TestBed], fakeAsync(tb => {
                var form = new ControlGroup({});
                var ctx = MyComp.create({form: form, name: 'old'});

                var t =
                    `<div><form [ng-form-model]="form" (ng-submit)="name='updated'"></form></div>`;

                tb.createView(MyComp, {context: ctx, html: t})
                    .then((view) => {
                      var form = view.querySelector("form");

                      dispatchEvent(form, "submit");
                      tick();

                      expect(ctx.name).toEqual("updated");
                    });
              })));

    it("should work with single controls",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var control = new Control("loginValue");
         var ctx = MyComp.create({form: control});

         var t = `<div><input type="text" [ng-form-control]="form"></div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();
               var input = view.querySelector("input");
               expect(input.value).toEqual("loginValue");

               input.value = "updatedValue";
               dispatchEvent(input, "change");

               expect(control.value).toEqual("updatedValue");
               async.done();
             });
       }));

    it("should update DOM elements when rebinding the control group",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var form = new ControlGroup({"login": new Control("oldValue")});
         var ctx = MyComp.create({form: form});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();
               ctx.form = new ControlGroup({"login": new Control("newValue")});
               view.detectChanges();

               var input = view.querySelector("input");
               expect(input.value).toEqual("newValue");
               async.done();
             });
       }));

    it("should update DOM elements when updating the value of a control",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var login = new Control("oldValue");
         var form = new ControlGroup({"login": login});
         var ctx = MyComp.create({form: form});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();

               login.updateValue("newValue");

               view.detectChanges();

               var input = view.querySelector("input");
               expect(input.value).toEqual("newValue");
               async.done();
             });
       }));

    it("should mark controls as touched after interacting with the DOM control",
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         var login = new Control("oldValue");
         var form = new ControlGroup({"login": login});
         var ctx = MyComp.create({form: form});

         var t = `<div [ng-form-model]="form">
                <input type="text" ng-control="login">
               </div>`;

         tb.createView(MyComp, {context: ctx, html: t})
             .then((view) => {
               view.detectChanges();

               var loginEl = view.querySelector("input");

               expect(login.touched).toBe(false);

               dispatchEvent(loginEl, "blur");

               expect(login.touched).toBe(true);

               async.done();
             });
       }));

    describe("different control types", () => {
      it("should support <input type=text>",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control("old")})});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="text">
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");
                 expect(input.value).toEqual("old");

                 input.value = "new";
                 dispatchEvent(input, "input");

                 expect(ctx.form.value).toEqual({"text": "new"});
                 async.done();
               });
         }));

      it("should support <input> without type",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control("old")})});

           var t = `<div [ng-form-model]="form">
                  <input ng-control="text">
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");
                 expect(input.value).toEqual("old");

                 input.value = "new";
                 dispatchEvent(input, "input");

                 expect(ctx.form.value).toEqual({"text": "new"});
                 async.done();
               });
         }));

      it("should support <textarea>",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control('old')})});

           var t = `<div [ng-form-model]="form">
                  <textarea ng-control="text"></textarea>
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var textarea = view.querySelector("textarea");
                 expect(textarea.value).toEqual("old");

                 textarea.value = "new";
                 dispatchEvent(textarea, "input");

                 expect(ctx.form.value).toEqual({"text": 'new'});
                 async.done();
               });
         }));

      it("should support <type=checkbox>",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"checkbox": new Control(true)})});

           var t = `<div [ng-form-model]="form">
                  <input type="checkbox" ng-control="checkbox">
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");
                 expect(input.checked).toBe(true);

                 input.checked = false;
                 dispatchEvent(input, "change");

                 expect(ctx.form.value).toEqual({"checkbox": false});
                 async.done();
               });
         }));

      it("should support <select>", inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"city": new Control("SF")})});

           var t = `<div [ng-form-model]="form">
                    <select ng-control="city">
                      <option value="SF"></option>
                      <option value="NYC"></option>
                    </select>
                  </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var select = view.querySelector("select");
                 var sfOption = view.querySelector("option");
                 expect(select.value).toEqual('SF');
                 expect(sfOption.selected).toBe(true);

                 select.value = 'NYC';
                 dispatchEvent(select, "change");

                 expect(ctx.form.value).toEqual({"city": 'NYC'});
                 expect(sfOption.selected).toBe(false);
                 async.done();
               });
         }));

      it("should support <select> with a dynamic list of options",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create(
                      {form: new ControlGroup({"city": new Control("NYC")}), data: ['SF', 'NYC']});

                  var t = `<div [ng-form-model]="form">
                      <select ng-control="city">
                        <option *ng-for="#c of data" [value]="c"></option>
                      </select>
                  </div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        tick();

                        var select = view.querySelector('select');

                        expect(select.value).toEqual('NYC');
                      });
                })));

      it("should support custom value accessors",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"name": new Control("aa")})});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="name" wrapped-value>
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");
                 expect(input.value).toEqual("!aa!");

                 input.value = "!bb!";
                 dispatchEvent(input, "change");

                 expect(ctx.form.value).toEqual({"name": "bb"});
                 async.done();
               });
         }));
    });

    describe("validations", () => {
      it("should use validators defined in html",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var form = new ControlGroup({"login": new Control("aa")});
           var ctx = MyComp.create({form: form});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="login" required>
                 </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 expect(form.valid).toEqual(true);

                 var input = view.querySelector("input");

                 input.value = "";
                 dispatchEvent(input, "change");

                 expect(form.valid).toEqual(false);
                 async.done();
               });
         }));

      it("should use validators defined in the model",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var form = new ControlGroup({"login": new Control("aa", Validators.required)});
           var ctx = MyComp.create({form: form});

           var t = `<div [ng-form-model]="form">
                  <input type="text" ng-control="login">
                 </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 expect(form.valid).toEqual(true);

                 var input = view.querySelector("input");

                 input.value = "";
                 dispatchEvent(input, "change");

                 expect(form.valid).toEqual(false);
                 async.done();
               });
         }));
    });

    describe("nested forms", () => {
      it("should init DOM with the given form object",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});
           var ctx = MyComp.create({form: form});

           var t = `<div [ng-form-model]="form">
                  <div ng-control-group="nested">
                    <input type="text" ng-control="login">
                  </div>
              </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");
                 expect(input.value).toEqual("value");
                 async.done();
               });
         }));

      it("should update the control group values on DOM change",
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});
           var ctx = MyComp.create({form: form});

           var t = `<div [ng-form-model]="form">
                    <div ng-control-group="nested">
                      <input type="text" ng-control="login">
                    </div>
                </div>`;

           tb.createView(MyComp, {context: ctx, html: t})
               .then((view) => {
                 view.detectChanges();
                 var input = view.querySelector("input");

                 input.value = "updatedValue";
                 dispatchEvent(input, "change");

                 expect(form.value).toEqual({"nested": {"login": "updatedValue"}});
                 async.done();
               });
         }));
    });

    it("should support ng-model for complex forms",
       inject(
           [TestBed], fakeAsync(tb => {
             var form = new ControlGroup({"name": new Control("")});
             var ctx = MyComp.create({name: "oldValue", form: form});

             var t =
                 `<div [ng-form-model]="form"><input type="text" ng-control="name" [(ng-model)]="name"></div>`;

             tb.createView(MyComp, {context: ctx, html: t})
                 .then((view) => {
                   view.detectChanges();

                   var input = view.querySelector("input");
                   expect(input.value).toEqual("oldValue");

                   input.value = "updatedValue";
                   dispatchEvent(input, "change");

                   tick();

                   expect(ctx.name).toEqual("updatedValue");
                 });
           })));

    it("should support ng-model for single fields",
       inject([TestBed], fakeAsync(tb => {
                var form = new Control("");
                var ctx = MyComp.create({name: "oldValue", form: form});

                var t =
                    `<div><input type="text" [ng-form-control]="form" [(ng-model)]="name"></div>`;

                tb.createView(MyComp, {context: ctx, html: t})
                    .then((view) => {
                      view.detectChanges();

                      var input = view.querySelector("input");
                      expect(input.value).toEqual("oldValue");

                      input.value = "updatedValue";
                      dispatchEvent(input, "change");

                      tick();

                      expect(ctx.name).toEqual("updatedValue");
                    });
              })));

    describe("template-driven forms", () => {
      it("should add new controls and control groups",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: null});

                  var t = `<form>
                     <div ng-control-group="user">
                      <input type="text" ng-control="login">
                     </div>
               </form>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        var form = view.rawView.elementInjectors[0].get(NgForm);
                        expect(form.controls['user']).not.toBeDefined();

                        tick();

                        expect(form.controls['user']).toBeDefined();
                        expect(form.controls['user'].controls['login']).toBeDefined();
                      });
                })));

      it("should emit ng-submit event on submit",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: 'old'});

                  var t = `<div><form (ng-submit)="name='updated'"></form></div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        var form = view.querySelector("form");

                        dispatchEvent(form, "submit");
                        tick();

                        expect(ctx.name).toEqual("updated");
                      });
                })));

      it("should not create a template-driven form when ng-no-form is used",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: null});

                  var t = `<form ng-no-form>
               </form>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();

                        expect(view.rawView.elementInjectors.length).toEqual(0);
                      });
                })));

      it("should remove controls", inject([TestBed], fakeAsync((tb: TestBed) => {
                                            var ctx = MyComp.create({name: 'show'});

                                            var t = `<form>
                    <div *ng-if="name == 'show'">
                      <input type="text" ng-control="login">
                    </div>
                  </form>`;

                                            tb.createView(MyComp, {context: ctx, html: t})
                                                .then((view) => {
                                                  view.detectChanges();
                                                  var form =
                                                      view.rawView.elementInjectors[0].get(NgForm);

                                                  tick();

                                                  expect(form.controls['login']).toBeDefined();

                                                  ctx.name = 'hide';
                                                  view.detectChanges();
                                                  tick();

                                                  expect(form.controls['login']).not.toBeDefined();
                                                });
                                          })));

      it("should remove control groups",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: 'show'});


                  var t = `<form>
                     <div *ng-if="name=='show'" ng-control-group="user">
                      <input type="text" ng-control="login">
                     </div>
               </form>`;


                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        var form = view.rawView.elementInjectors[0].get(NgForm);
                        flushMicrotasks();

                        expect(form.controls['user']).toBeDefined();

                        ctx.name = 'hide';
                        view.detectChanges();
                        flushMicrotasks();

                        expect(form.controls['user']).not.toBeDefined();
                      });
                  flushMicrotasks();
                })));

      it("should support ng-model for complex forms",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: "oldValue"});

                  var t = `<form>
                      <input type="text" ng-control="name" [(ng-model)]="name">
               </form>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        tick();
                        view.detectChanges();

                        var input = view.querySelector("input");
                        expect(input.value).toEqual("oldValue");

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");

                        tick();

                        expect(ctx.name).toEqual("updatedValue");
                      });
                })));


      it("should support ng-model for single fields",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: "oldValue"});

                  var t = `<div><input type="text" [(ng-model)]="name"></div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();

                        var input = view.querySelector("input");
                        expect(input.value).toEqual("oldValue");

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");

                        tick();

                        expect(ctx.name).toEqual("updatedValue");
                      });
                  flushMicrotasks();
                })));
    });


    describe("setting status classes", () => {
      it("should work with single fields",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var form = new Control("", Validators.required);
                  var ctx = MyComp.create({form: form});

                  var t = `<div><input type="text" [ng-form-control]="form"></div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();

                        var input = view.querySelector("input");
                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-untouched", "ng-pristine", "ng-invalid"]);

                        dispatchEvent(input, "blur");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-pristine", "ng-invalid", "ng-touched"]);

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-touched", "ng-dirty", "ng-valid"]);
                        tick();
                      });
                  flushMicrotasks();
                })));

      it("should work with complex model-driven forms",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var form = new ControlGroup({"name": new Control("", Validators.required)});
                  var ctx = MyComp.create({form: form});

                  var t =
                      `<form [ng-form-model]="form"><input type="text" ng-control="name"></form>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();

                        var input = view.querySelector("input");
                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-untouched", "ng-pristine", "ng-invalid"]);

                        dispatchEvent(input, "blur");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-pristine", "ng-invalid", "ng-touched"]);

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-touched", "ng-dirty", "ng-valid"]);
                        tick();
                      });
                  flushMicrotasks();
                })));

      it("should work with ng-model",
         inject([TestBed], fakeAsync((tb: TestBed) => {
                  var ctx = MyComp.create({name: ""});

                  var t = `<div><input [(ng-model)]="name" required></div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();

                        var input = view.querySelector("input");
                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-untouched", "ng-pristine", "ng-invalid"]);

                        dispatchEvent(input, "blur");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-pristine", "ng-invalid", "ng-touched"]);

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");
                        view.detectChanges();

                        expect(DOM.classList(input))
                            .toEqual(["ng-binding", "ng-touched", "ng-dirty", "ng-valid"]);
                        tick();
                      });
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
@View({directives: [formDirectives, WrappedValue, NgIf, NgFor]})
class MyComp {
  form: any;
  name: string;
  data: any;

  static create({form, name, data}: {form?: any, name?: any, data?: any}) {
    var mc = new MyComp();
    mc.form = form;
    mc.name = name;
    mc.data = data;
    return mc;
  }
}

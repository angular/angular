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

import {TestBed} from 'angular2/src/test_lib/test_bed';
import {NgIf} from 'angular2/directives';

import {
  Control,
  ControlGroup,
  RequiredValidatorDirective,
  TemplateDrivenFormDirective,
  formDirectives,
  Validators,
  ControlDirective,
  ControlValueAccessor
} from 'angular2/forms';

export function main() {
  describe("integration tests", () => {
    it("should initialize DOM elements with the given form object",
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var ctx = MyComp.create({form: new ControlGroup({"login": new Control("loginValue")})});

         var t = `<div [form-model]="form">
                <input type="text" control="login">
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
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var form = new ControlGroup({"login": new Control("oldValue")});
         var ctx = MyComp.create({form: form});

         var t = `<div [form-model]="form">
                <input type="text" control="login">
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

    it("should work with single controls", inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var control = new Control("loginValue");
         var ctx = MyComp.create({form: control});

         var t = `<div><input type="text" [form-control]="form"></div>`;

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
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
         var form = new ControlGroup({"login": new Control("oldValue")});
         var ctx = MyComp.create({form: form});

         var t = `<div [form-model]="form">
                <input type="text" control="login">
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

    describe("different control types", () => {
      it("should support <input type=text>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control("old")})});

           var t = `<div [form-model]="form">
                  <input type="text" control="text">
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
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control("old")})});

           var t = `<div [form-model]="form">
                  <input control="text">
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

      it("should support <textarea>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"text": new Control('old')})});

           var t = `<div [form-model]="form">
                  <textarea control="text"></textarea>
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

      it("should support <type=checkbox>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"checkbox": new Control(true)})});

           var t = `<div [form-model]="form">
                  <input type="checkbox" control="checkbox">
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

      it("should support <select>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"city": new Control("SF")})});

           var t = `<div [form-model]="form">
                    <select control="city">
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

      it("should support custom value accessors",
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var ctx = MyComp.create({form: new ControlGroup({"name": new Control("aa")})});

           var t = `<div [form-model]="form">
                  <input type="text" control="name" wrapped-value>
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
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var form = new ControlGroup({"login": new Control("aa")});
           var ctx = MyComp.create({form: form});

           var t = `<div [form-model]="form">
                  <input type="text" control="login" required>
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
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var form = new ControlGroup({"login": new Control("aa", Validators.required)});
           var ctx = MyComp.create({form: form});

           var t = `<div [form-model]="form">
                  <input type="text" control="login">
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
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});
           var ctx = MyComp.create({form: form});

           var t = `<div [form-model]="form">
                  <div control-group="nested">
                    <input type="text" control="login">
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
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           var form =
               new ControlGroup({"nested": new ControlGroup({"login": new Control("value")})});
           var ctx = MyComp.create({form: form});

           var t = `<div [form-model]="form">
                    <div control-group="nested">
                      <input type="text" control="login">
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
                 `<div [form-model]="form"><input type="text" control="name" [(ng-model)]="name"></div>`;

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

    it("should support ng-model for single fields",
       inject([TestBed], fakeAsync(tb => {
                var form = new Control("");
                var ctx = MyComp.create({name: "oldValue", form: form});

                var t = `<div><input type="text" [form-control]="form" [(ng-model)]="name"></div>`;

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

    describe("template-driven forms", () => {
      it("should add new controls and control groups",
         inject([TestBed], fakeAsync(tb => {
                  var ctx = MyComp.create({name: null});

                  var t = `<div form>
                     <div control-group="user">
                      <input type="text" control="login">
                     </div>
               </div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        var form =
                            view.rawView.elementInjectors[0].get(TemplateDrivenFormDirective);
                        expect(form.controls['user']).not.toBeDefined();

                        tick();

                        expect(form.controls['user']).toBeDefined();
                        expect(form.controls['user'].controls['login']).toBeDefined();
                      });
                  flushMicrotasks();
                })));

      it("should remove controls", inject([TestBed], fakeAsync(tb => {
                                            var ctx = MyComp.create({name: 'show'});

                                            var t = `<div form>
                    <div *ng-if="name == 'show'">
                      <input type="text" control="login">
                    </div>
                  </div>`;

                                            tb.createView(MyComp, {context: ctx, html: t})
                                                .then((view) => {
                                                  view.detectChanges();
                                                  var form = view.rawView.elementInjectors[0].get(
                                                      TemplateDrivenFormDirective);

                                                  tick();

                                                  expect(form.controls['login']).toBeDefined();

                                                  ctx.name = 'hide';
                                                  view.detectChanges();
                                                  tick();

                                                  expect(form.controls['login']).not.toBeDefined();
                                                });
                                            flushMicrotasks();
                                          })));

      it("should remove control groups",
         inject([TestBed], fakeAsync(tb => {
                  var ctx = MyComp.create({name: 'show'});


                  var t = `<div form>
                     <div *ng-if="name=='show'" control-group="user">
                      <input type="text" control="login">
                     </div>
               </div>`;


                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        var form =
                            view.rawView.elementInjectors[0].get(TemplateDrivenFormDirective);
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
         inject([TestBed], fakeAsync(tb => {
                  var ctx = MyComp.create({name: "oldValue"});

                  var t = `<div form>
                      <input type="text" control="name" [(ng-model)]="name">
               </div>`;

                  tb.createView(MyComp, {context: ctx, html: t})
                      .then((view) => {
                        view.detectChanges();
                        tick();

                        var input = view.querySelector("input");
                        expect(input.value).toEqual("oldValue");

                        input.value = "updatedValue";
                        dispatchEvent(input, "change");

                        tick();

                        expect(ctx.name).toEqual("updatedValue");
                      });
                  flushMicrotasks();
                })));


      it("should support ng-model for single fields",
         inject([TestBed], fakeAsync(tb => {
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
  });
}

@Directive({
  selector: '[wrapped-value]',
  hostListeners: {'change': 'handleOnChange($event.target.value)'},
  hostProperties: {'value': 'value'}
})
class WrappedValue implements ControlValueAccessor {
  value;
  onChange: Function;

  constructor(cd: ControlDirective) { cd.valueAccessor = this; }

  writeValue(value) { this.value = `!${value}!`; }

  registerOnChange(fn) { this.onChange = fn; }

  handleOnChange(value) { this.onChange(value.substring(1, value.length - 1)); }
}

@Component({selector: "my-comp"})
@View({directives: [formDirectives, WrappedValue, RequiredValidatorDirective, NgIf]})
class MyComp {
  form: any;
  name: string;

  static create({form, name}: {form?: any, name?: any}) {
    var mc = new MyComp();
    mc.form = form;
    mc.name = name;
    return mc;
  }
}
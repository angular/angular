import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  dispatchEvent,
  el,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {Inject} from 'angular2/di';

import {Component, Decorator, Template, PropertySetter} from 'angular2/angular2';

import {TestBed} from 'angular2/src/test_lib/test_bed';

import {ControlGroupDirective, ControlDirective, Control, ControlGroup, OptionalControl,
  ControlValueAccessor, RequiredValidatorDirective, CheckboxControlValueAccessor,
  DefaultValueAccessor, Validators} from 'angular2/forms';

export function main() {
  if (DOM.supportsDOMEvents()) {
    describe("integration tests", () => {
      it("should initialize DOM elements with the given form object",
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var ctx = new MyComp(new ControlGroup({
          "login": new Control("loginValue")
        }));

        var t = `<div [control-group]="form">
                <input type="text" control="login">
              </div>`;

        tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
          view.detectChanges();
          var input = view.querySelector("input");
          expect(input.value).toEqual("loginValue");
          async.done();
        });
      }));

      it("should update the control group values on DOM change",
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var form = new ControlGroup({
          "login": new Control("oldValue")
        });
        var ctx = new MyComp(form);

        var t = `<div [control-group]="form">
                  <input type="text" control="login">
                </div>`;

        tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
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
        var ctx = new MyComp(control);

        var t = `<div><input type="text" [control]="form"></div>`;

        tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
          view.detectChanges();
          var input = view.querySelector("input")
          expect(input.value).toEqual("loginValue");

          input.value = "updatedValue";
          dispatchEvent(input, "change");

          expect(control.value).toEqual("updatedValue");
          async.done();
        });
      }));

      it("should update DOM elements when rebinding the control group",
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var form = new ControlGroup({
          "login": new Control("oldValue")
        });
        var ctx = new MyComp(form);

        var t = `<div [control-group]="form">
                <input type="text" control="login">
              </div>`;

        tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
          view.detectChanges();
          ctx.form = new ControlGroup({
            "login": new Control("newValue")
          });
          view.detectChanges();

          var input = view.querySelector("input")
          expect(input.value).toEqual("newValue");
          async.done();
        });
      }));

      it("should update DOM element when rebinding the control name",
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
        var ctx = new MyComp(new ControlGroup({
          "one": new Control("one"),
          "two": new Control("two")
        }), "one");

        var t = `<div [control-group]="form">
                <input type="text" [control]="name">
              </div>`;

        tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
          view.detectChanges();
          var input = view.querySelector("input")
          expect(input.value).toEqual("one");

          ctx.name = "two";
          view.detectChanges();

          expect(input.value).toEqual("two");
          async.done();
        });
      }));

      describe("different control types", () => {
        it("should support <input type=text>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"text": new Control("old")}));

          var t = `<div [control-group]="form">
                    <input type="text" control="text">
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")
            expect(input.value).toEqual("old");

            input.value = "new";
            dispatchEvent(input, "input");

            expect(ctx.form.value).toEqual({"text": "new"});
            async.done();
          });
        }));

        it("should support <input> without type", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"text": new Control("old")}));

          var t = `<div [control-group]="form">
                    <input control="text">
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")
            expect(input.value).toEqual("old");

            input.value = "new";
            dispatchEvent(input, "input");

            expect(ctx.form.value).toEqual({"text": "new"});
            async.done();
          });
        }));

        it("should support <textarea>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"text": new Control('old')}));

          var t = `<div [control-group]="form">
                    <textarea control="text"></textarea>
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var textarea = view.querySelector("textarea")
            expect(textarea.value).toEqual("old");

            textarea.value = "new";
            dispatchEvent(textarea, "input");

            expect(ctx.form.value).toEqual({"text": 'new'});
            async.done();
          });
        }));

        it("should support <type=checkbox>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"checkbox": new Control(true)}));

          var t = `<div [control-group]="form">
                    <input type="checkbox" control="checkbox">
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")
            expect(input.checked).toBe(true);

            input.checked = false;
            dispatchEvent(input, "change");

            expect(ctx.form.value).toEqual({"checkbox": false});
            async.done();
          });
        }));

        it("should support <select>", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"city": new Control("SF")}));

          var t = `<div [control-group]="form">
                      <select control="city">
                        <option value="SF"></option>
                        <option value="NYC"></option>
                      </select>
                    </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var select = view.querySelector("select")
            var sfOption = view.querySelector("option")
            expect(select.value).toEqual('SF');
            expect(sfOption.selected).toBe(true);

            select.value = 'NYC';
            dispatchEvent(select, "change");

            expect(ctx.form.value).toEqual({"city": 'NYC'});
            expect(sfOption.selected).toBe(false);
            async.done();
          });
        }));

        it("should support custom value accessors", inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var ctx = new MyComp(new ControlGroup({"name": new Control("aa")}));

          var t = `<div [control-group]="form">
                    <input type="text" control="name" wrapped-value>
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")
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
          var ctx = new MyComp(form);

          var t = `<div [control-group]="form">
                    <input type="text" control="login" required>
                   </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
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
          var ctx = new MyComp(form);

          var t = `<div [control-group]="form">
                    <input type="text" control="login">
                   </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
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
          var form = new ControlGroup({
            "nested": new ControlGroup({
              "login": new Control("value")
            })
          });
          var ctx = new MyComp(form);

          var t = `<div [control-group]="form">
                    <div control-group="nested">
                      <input type="text" control="login">
                    </div>
                </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")
            expect(input.value).toEqual("value");
            async.done();
          });
        }));

        it("should update the control group values on DOM change",
          inject([TestBed, AsyncTestCompleter], (tb, async) => {
          var form = new ControlGroup({
            "nested": new ControlGroup({
              "login": new Control("value")
            })
          });
          var ctx = new MyComp(form);

          var t = `<div [control-group]="form">
                      <div control-group="nested">
                        <input type="text" control="login">
                      </div>
                  </div>`;

          tb.createView(MyComp, {context: ctx, html: t}).then((view) => {
            view.detectChanges();
            var input = view.querySelector("input")

            input.value = "updatedValue";
            dispatchEvent(input, "change");

            expect(form.value).toEqual({"nested": {"login": "updatedValue"}});
            async.done();
          });
        }));
      });
    });
  }
}

@Component({selector: "my-comp"})
@Template({directives: [
  ControlGroupDirective,
  ControlDirective,
  WrappedValue,
  RequiredValidatorDirective,
  CheckboxControlValueAccessor,
  DefaultValueAccessor]})
class MyComp {
  form:any;
  name:string;

  constructor(@Inject('form') form = null, @Inject('name') name = null) {
    this.form = form;
    this.name = name;
  }
}

@Decorator({
  selector:'[wrapped-value]',
  events: {
    'change' : 'handleOnChange($event.target.value)'
  }
})
class WrappedValue {
  _setProperty:Function;
  onChange:Function;

  constructor(cd:ControlDirective, @PropertySetter('value') setProperty:Function) {
    this._setProperty = setProperty;
    cd.valueAccessor = this;
  }

  writeValue(value) {
    this._setProperty(`!${value}!`);
  }

  handleOnChange(value) {
    this.onChange(value.substring(1, value.length - 1));
  }
}

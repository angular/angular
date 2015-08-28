import {
  ddescribe,
  describe,
  fakeAsync,
  flushMicrotasks,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  el,
  AsyncTestCompleter,
  inject
} from 'angular2/test_lib';

import {QueryList} from 'angular2/angular2';

import {
  ControlGroup,
  Control,
  NgControlName,
  NgControlGroup,
  NgFormModel,
  ControlValueAccessor,
  Validators,
  NgForm,
  NgModel,
  NgFormControl,
  NgRequiredValidator
} from 'angular2/forms';

class DummyControlValueAccessor implements ControlValueAccessor {
  writtenValue;

  registerOnChange(fn) {}
  registerOnTouched(fn) {}

  writeValue(obj: any): void { this.writtenValue = obj; }
}

export function main() {
  describe("Form Directives", () => {
    describe("NgFormModel", () => {
      var form;
      var formModel;
      var loginControlDir;

      beforeEach(() => {
        form = new NgFormModel();
        formModel = new ControlGroup({"login": new Control(null)});
        form.form = formModel;

        loginControlDir = new NgControlName(form, new QueryList<any>());
        loginControlDir.name = "login";
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
      });

      it("should reexport control properties", () => {
        expect(form.control).toBe(formModel);
        expect(form.value).toBe(formModel.value);
        expect(form.valid).toBe(formModel.valid);
        expect(form.errors).toBe(formModel.errors);
        expect(form.pristine).toBe(formModel.pristine);
        expect(form.dirty).toBe(formModel.dirty);
        expect(form.touched).toBe(formModel.touched);
        expect(form.untouched).toBe(formModel.untouched);
      });

      describe("addControl", () => {
        it("should throw when no control found", () => {
          var dir = new NgControlName(form, null);
          dir.name = "invalidName";

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp("Cannot find control 'invalidName'"));
        });

        it("should throw when no value accessor", () => {
          var dir = new NgControlName(form, null);
          dir.name = "login";

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp("No value accessor for 'login'"));
        });

        it("should set up validator", () => {
          loginControlDir.ngValidators.reset([new NgRequiredValidator()]);

          expect(formModel.find(["login"]).valid).toBe(true);

          // this will add the required validator and recalculate the validity
          form.addControl(loginControlDir);

          expect(formModel.find(["login"]).valid).toBe(false);
        });

        it("should write value to the DOM", () => {
          formModel.find(["login"]).updateValue("initValue");

          form.addControl(loginControlDir);

          expect((<any>loginControlDir.valueAccessor).writtenValue).toEqual("initValue");
        });

        it("should add the directive to the list of directives included in the form", () => {
          form.addControl(loginControlDir);
          expect(form.directives).toEqual([loginControlDir]);
        });
      });

      describe("removeControl", () => {
        it("should remove the directive to the list of directives included in the form", () => {
          form.addControl(loginControlDir);
          form.removeControl(loginControlDir);
          expect(form.directives).toEqual([]);
        });
      });

      describe("onChanges", () => {
        it("should update dom values of all the directives", () => {
          form.addControl(loginControlDir);

          formModel.find(["login"]).updateValue("new value");

          form.onChanges(null);

          expect((<any>loginControlDir.valueAccessor).writtenValue).toEqual("new value");
        });
      });
    });

    describe("NgForm", () => {
      var form;
      var formModel;
      var loginControlDir;
      var personControlGroupDir;

      beforeEach(() => {
        form = new NgForm();
        formModel = form.form;

        personControlGroupDir = new NgControlGroup(form);
        personControlGroupDir.name = "person";

        loginControlDir = new NgControlName(personControlGroupDir, null);
        loginControlDir.name = "login";
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
      });

      it("should reexport control properties", () => {
        expect(form.control).toBe(formModel);
        expect(form.value).toBe(formModel.value);
        expect(form.valid).toBe(formModel.valid);
        expect(form.errors).toBe(formModel.errors);
        expect(form.pristine).toBe(formModel.pristine);
        expect(form.dirty).toBe(formModel.dirty);
        expect(form.touched).toBe(formModel.touched);
        expect(form.untouched).toBe(formModel.untouched);
      });

      describe("addControl & addControlGroup", () => {
        it("should create a control with the given name", fakeAsync(() => {
             form.addControlGroup(personControlGroupDir);
             form.addControl(loginControlDir);

             flushMicrotasks();

             expect(formModel.find(["person", "login"])).not.toBeNull;
           }));

        // should update the form's value and validity
      });

      describe("removeControl & removeControlGroup", () => {
        it("should remove control", fakeAsync(() => {
             form.addControlGroup(personControlGroupDir);
             form.addControl(loginControlDir);

             form.removeControlGroup(personControlGroupDir);
             form.removeControl(loginControlDir);

             flushMicrotasks();

             expect(formModel.find(["person"])).toBeNull();
             expect(formModel.find(["person", "login"])).toBeNull();
           }));

        // should update the form's value and validity
      });
    });

    describe("NgControlGroup", () => {
      var formModel;
      var controlGroupDir;

      beforeEach(() => {
        formModel = new ControlGroup({"login": new Control(null)});

        var parent = new NgFormModel();
        parent.form = new ControlGroup({"group": formModel});
        controlGroupDir = new NgControlGroup(parent);
        controlGroupDir.name = "group";
      });

      it("should reexport control properties", () => {
        expect(controlGroupDir.control).toBe(formModel);
        expect(controlGroupDir.value).toBe(formModel.value);
        expect(controlGroupDir.valid).toBe(formModel.valid);
        expect(controlGroupDir.errors).toBe(formModel.errors);
        expect(controlGroupDir.pristine).toBe(formModel.pristine);
        expect(controlGroupDir.dirty).toBe(formModel.dirty);
        expect(controlGroupDir.touched).toBe(formModel.touched);
        expect(controlGroupDir.untouched).toBe(formModel.untouched);
      });
    });

    describe("NgFormControl", () => {
      var controlDir;
      var control;

      beforeEach(() => {
        controlDir = new NgFormControl(new QueryList<any>());
        controlDir.valueAccessor = new DummyControlValueAccessor();

        control = new Control(null);
        controlDir.form = control;
      });

      it("should reexport control properties", () => {
        expect(controlDir.control).toBe(control);
        expect(controlDir.value).toBe(control.value);
        expect(controlDir.valid).toBe(control.valid);
        expect(controlDir.errors).toBe(control.errors);
        expect(controlDir.pristine).toBe(control.pristine);
        expect(controlDir.dirty).toBe(control.dirty);
        expect(controlDir.touched).toBe(control.touched);
        expect(controlDir.untouched).toBe(control.untouched);
      });

      it("should set up validator", () => {
        controlDir.ngValidators.reset([new NgRequiredValidator()]);

        expect(control.valid).toBe(true);

        // this will add the required validator and recalculate the validity
        controlDir.onChanges({});

        expect(control.valid).toBe(false);
      });
    });

    describe("NgModel", () => {
      var ngModel;

      beforeEach(() => {
        ngModel = new NgModel(new QueryList<any>());
        ngModel.valueAccessor = new DummyControlValueAccessor();
      });

      it("should reexport control properties", () => {
        var control = ngModel.control;
        expect(ngModel.control).toBe(control);
        expect(ngModel.value).toBe(control.value);
        expect(ngModel.valid).toBe(control.valid);
        expect(ngModel.errors).toBe(control.errors);
        expect(ngModel.pristine).toBe(control.pristine);
        expect(ngModel.dirty).toBe(control.dirty);
        expect(ngModel.touched).toBe(control.touched);
        expect(ngModel.untouched).toBe(control.untouched);
      });

      it("should set up validator", () => {
        ngModel.ngValidators.reset([new NgRequiredValidator()]);

        expect(ngModel.control.valid).toBe(true);

        // this will add the required validator and recalculate the validity
        ngModel.onChanges({});

        expect(ngModel.control.valid).toBe(false);
      });
    });

    describe("NgControlName", () => {
      var formModel;
      var controlNameDir;

      beforeEach(() => {
        formModel = new Control("name");

        var parent = new NgFormModel();
        parent.form = new ControlGroup({"name": formModel});
        controlNameDir = new NgControlName(parent, new QueryList<any>());
        controlNameDir.name = "name";
      });

      it("should reexport control properties", () => {
        expect(controlNameDir.control).toBe(formModel);
        expect(controlNameDir.value).toBe(formModel.value);
        expect(controlNameDir.valid).toBe(formModel.valid);
        expect(controlNameDir.errors).toBe(formModel.errors);
        expect(controlNameDir.pristine).toBe(formModel.pristine);
        expect(controlNameDir.dirty).toBe(formModel.dirty);
        expect(controlNameDir.touched).toBe(formModel.touched);
        expect(controlNameDir.untouched).toBe(formModel.untouched);
      });
    });
  });
}

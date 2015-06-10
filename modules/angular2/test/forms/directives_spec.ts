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
import {
  ControlGroup,
  Control,
  NgControlName,
  NgControlGroup,
  NgFormModel,
  ControlValueAccessor,
  Validators,
  NgForm,
  NgFormControl
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

        loginControlDir = new NgControlName(form);
        loginControlDir.name = "login";
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
      });

      describe("addControl", () => {
        it("should throw when no control found", () => {
          var dir = new NgControlName(form);
          dir.name = "invalidName";

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp("Cannot find control 'invalidName'"));
        });

        it("should throw when no value accessor", () => {
          var dir = new NgControlName(form);
          dir.name = "login";

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp("No value accessor for 'login'"));
        });

        it("should set up validator", () => {
          loginControlDir.validator = Validators.required;

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

      describe("onChange", () => {
        it("should update dom values of all the directives", () => {
          form.addControl(loginControlDir);

          formModel.find(["login"]).updateValue("new value");

          form.onChange(null);

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

        loginControlDir = new NgControlName(personControlGroupDir);
        loginControlDir.name = "login";
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
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

    describe("NgFormControl", () => {
      var controlDir;
      var control;

      beforeEach(() => {
        controlDir = new NgFormControl();
        controlDir.valueAccessor = new DummyControlValueAccessor();

        control = new Control(null);
        controlDir.form = control;
      });

      it("should set up validator", () => {
        controlDir.validator = Validators.required;

        expect(control.valid).toBe(true);

        // this will add the required validator and recalculate the validity
        controlDir.onChange({});

        expect(control.valid).toBe(false);
      });
    });
  });
}

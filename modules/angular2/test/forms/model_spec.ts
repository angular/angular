import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  el,
  AsyncTestCompleter,
  fakeAsync,
  flushMicrotasks,
  tick,
  inject
} from 'angular2/test_lib';
import {ControlGroup, Control, ControlArray, Validators} from 'angular2/forms';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe("Form Model", () => {
    describe("Control", () => {
      describe("validator", () => {
        it("should run validator with the initial value", () => {
          var c = new Control("value", Validators.required);
          expect(c.valid).toEqual(true);
        });

        it("should rerun the validator when the value changes", () => {
          var c = new Control("value", Validators.required);
          c.updateValue(null);
          expect(c.valid).toEqual(false);
        });

        it("should return errors", () => {
          var c = new Control(null, Validators.required);
          expect(c.errors).toEqual({"required": true});
        });
      });

      describe("pristine", () => {
        it("should be true after creating a control", () => {
          var c = new Control("value");
          expect(c.pristine).toEqual(true);
        });

        it("should be false after changing the value of the control", () => {
          var c = new Control("value");
          c.updateValue("new value");
          expect(c.pristine).toEqual(false);
        });
      });

      describe("dirty", () => {
        it("should be false after creating a control", () => {
          var c = new Control("value");
          expect(c.dirty).toEqual(false);
        });

        it("should be true after changing the value of the control", () => {
          var c = new Control("value");
          c.updateValue("new value");
          expect(c.dirty).toEqual(true);
        });
      });

      describe("updateValue", () => {
        var g, c;
        beforeEach(() => {
          c = new Control("oldValue");
          g = new ControlGroup({"one": c});
        });

        it("should update the value of the control", () => {
          c.updateValue("newValue");
          expect(c.value).toEqual("newValue");
        });

        it("should invoke onChange if it is present", () => {
          var onChange;
          c.registerOnChange((v) => onChange = ["invoked", v]);

          c.updateValue("newValue");

          expect(onChange).toEqual(["invoked", "newValue"]);
        });

        it("should update the parent", () => {
          c.updateValue("newValue");
          expect(g.value).toEqual({"one": "newValue"});
        });

        it("should not update the parent when explicitly specified", () => {
          c.updateValue("newValue", {onlySelf: true});
          expect(g.value).toEqual({"one": "oldValue"});
        });

        it("should fire an event", fakeAsync(() => {
             ObservableWrapper.subscribe(c.valueChanges,
                                         (value) => { expect(value).toEqual("newValue"); });

             c.updateValue("newValue");
             tick();
           }));

        it("should not fire an event when explicitly specified", fakeAsync(() => {
             ObservableWrapper.subscribe(c.valueChanges, (value) => { throw "Should not happen"; });

             c.updateValue("newValue", {emitEvent: false});

             tick();
           }));
      });

      describe("valueChanges", () => {
        var c;

        beforeEach(() => { c = new Control("old"); });

        it("should fire an event after the value has been updated",
           inject([AsyncTestCompleter], (async) => {
             ObservableWrapper.subscribe(c.valueChanges, (value) => {
               expect(c.value).toEqual('new');
               expect(value).toEqual('new');
               async.done();
             });
             c.updateValue("new");
           }));

        it("should return a cold observable", inject([AsyncTestCompleter], (async) => {
             c.updateValue("will be ignored");
             ObservableWrapper.subscribe(c.valueChanges, (value) => {
               expect(value).toEqual('new');
               async.done();
             });
             c.updateValue("new");
           }));
      });
    });

    describe("ControlGroup", () => {
      describe("value", () => {
        it("should be the reduced value of the child controls", () => {
          var g = new ControlGroup({"one": new Control("111"), "two": new Control("222")});
          expect(g.value).toEqual({"one": "111", "two": "222"});
        });

        it("should be empty when there are no child controls", () => {
          var g = new ControlGroup({});
          expect(g.value).toEqual({});
        });

        it("should support nested groups", () => {
          var g = new ControlGroup({
            "one": new Control("111"),
            "nested": new ControlGroup({"two": new Control("222")})
          });
          expect(g.value).toEqual({"one": "111", "nested": {"two": "222"}});

          g.controls["nested"].controls["two"].updateValue("333");

          expect(g.value).toEqual({"one": "111", "nested": {"two": "333"}});
        });
      });

      describe("find", () => {
        var g;
        beforeEach(() => {
          g = new ControlGroup({
            "one": new Control("111"),
            "nested": new ControlGroup({"two": new Control("222")})
          });
        });

        it("should return a control if it is present", () => {
          expect(g.find(["nested", "two"]).value).toEqual("222");
          expect(g.find(["one"]).value).toEqual("111");
          expect(g.find("nested/two").value).toEqual("222");
          expect(g.find("one").value).toEqual("111");
        });

        it("should return null otherwise", () => {
          expect(g.find("invalid")).toBeNull();
          expect(g.find("one/invalid")).toBeNull();
        });
      });

      describe("validator", () => {
        it("should run the validator with the initial value (valid)", () => {
          var g = new ControlGroup({"one": new Control('value', Validators.required)});

          expect(g.valid).toEqual(true);

          expect(g.errors).toEqual(null);
        });

        it("should run the validator with the initial value (invalid)", () => {
          var one = new Control(null, Validators.required);
          var g = new ControlGroup({"one": one});

          expect(g.valid).toEqual(false);

          expect(g.errors).toEqual({"required": [one]});
        });

        it("should run the validator with the value changes", () => {
          var c = new Control(null, Validators.required);
          var g = new ControlGroup({"one": c});

          c.updateValue("some value");

          expect(g.valid).toEqual(true);
          expect(g.errors).toEqual(null);
        });
      });

      describe("pristine", () => {
        it("should be true after creating a control", () => {
          var c = new Control('value');
          var g = new ControlGroup({"one": c});

          expect(g.pristine).toEqual(true);
        });

        it("should be false after changing the value of the control", () => {
          var c = new Control('value');
          var g = new ControlGroup({"one": c});
          c.updateValue('new value');

          expect(g.pristine).toEqual(false);
        });
      });

      describe("optional components", () => {
        describe("contains", () => {
          var group;

          beforeEach(() => {
            group = new ControlGroup(
                {
                  "required": new Control("requiredValue"),
                  "optional": new Control("optionalValue")
                },
                {"optional": false});
          });

          // rename contains into has
          it("should return false when the component is not included",
             () => { expect(group.contains("optional")).toEqual(false); })

              it("should return false when there is no component with the given name",
                 () => { expect(group.contains("something else")).toEqual(false); });

          it("should return true when the component is included", () => {
            expect(group.contains("required")).toEqual(true);

            group.include("optional");

            expect(group.contains("optional")).toEqual(true);
          });
        });

        it("should not include an inactive component into the group value", () => {
          var group = new ControlGroup(
              {"required": new Control("requiredValue"), "optional": new Control("optionalValue")},
              {"optional": false});

          expect(group.value).toEqual({"required": "requiredValue"});

          group.include("optional");

          expect(group.value).toEqual({"required": "requiredValue", "optional": "optionalValue"});
        });

        it("should not run Validators on an inactive component", () => {
          var group = new ControlGroup(
              {
                "required": new Control("requiredValue", Validators.required),
                "optional": new Control("", Validators.required)
              },
              {"optional": false});

          expect(group.valid).toEqual(true);

          group.include("optional");

          expect(group.valid).toEqual(false);
        });

        describe("valueChanges", () => {
          var g, c1, c2;

          beforeEach(() => {
            c1 = new Control("old1");
            c2 = new Control("old2");
            g = new ControlGroup({"one": c1, "two": c2}, {"two": true});
          });

          it("should fire an event after the value has been updated",
             inject([AsyncTestCompleter], (async) => {
               ObservableWrapper.subscribe(g.valueChanges, (value) => {
                 expect(g.value).toEqual({'one': 'new1', 'two': 'old2'});
                 expect(value).toEqual({'one': 'new1', 'two': 'old2'});
                 async.done();
               });
               c1.updateValue("new1");
             }));

          it("should fire an event after the control's observable fired an event",
             inject([AsyncTestCompleter], (async) => {
               var controlCallbackIsCalled = false;

               ObservableWrapper.subscribe(c1.valueChanges,
                                           (value) => { controlCallbackIsCalled = true; });

               ObservableWrapper.subscribe(g.valueChanges, (value) => {
                 expect(controlCallbackIsCalled).toBe(true);
                 async.done();
               });

               c1.updateValue("new1");
             }));

          it("should fire an event when a control is excluded",
             inject([AsyncTestCompleter], (async) => {
               ObservableWrapper.subscribe(g.valueChanges, (value) => {
                 expect(value).toEqual({'one': 'old1'});
                 async.done();
               });

               g.exclude("two");
             }));

          it("should fire an event when a control is included",
             inject([AsyncTestCompleter], (async) => {
               g.exclude("two");

               ObservableWrapper.subscribe(g.valueChanges, (value) => {
                 expect(value).toEqual({'one': 'old1', 'two': 'old2'});
                 async.done();
               });

               g.include("two");
             }));

          it("should fire an event every time a control is updated",
             inject([AsyncTestCompleter], (async) => {
               var loggedValues = [];

               ObservableWrapper.subscribe(g.valueChanges, (value) => {
                 ListWrapper.push(loggedValues, value);

                 if (loggedValues.length == 2) {
                   expect(loggedValues)
                       .toEqual([{"one": "new1", "two": "old2"}, {"one": "new1", "two": "new2"}]);
                   async.done();
                 }
               });

               c1.updateValue("new1");
               c2.updateValue("new2");
             }));

          xit("should not fire an event when an excluded control is updated",
              inject([AsyncTestCompleter], (async) => {
                                               // hard to test without hacking zones
                                           }));
        });
      });

      describe("ControlArray", () => {
        describe("adding/removing", () => {
          var a;
          var c1, c2, c3;

          beforeEach(() => {
            a = new ControlArray([]);
            c1 = new Control(1);
            c2 = new Control(2);
            c3 = new Control(3);
          });

          it("should support pushing", () => {
            a.push(c1);
            expect(a.length).toEqual(1);
            expect(a.controls).toEqual([c1]);
          });

          it("should support removing", () => {
            a.push(c1);
            a.push(c2);
            a.push(c3);

            a.removeAt(1);

            expect(a.controls).toEqual([c1, c3]);
          });

          it("should support inserting", () => {
            a.push(c1);
            a.push(c3);

            a.insert(1, c2);

            expect(a.controls).toEqual([c1, c2, c3]);
          });
        });

        describe("value", () => {
          it("should be the reduced value of the child controls", () => {
            var a = new ControlArray([new Control(1), new Control(2)]);
            expect(a.value).toEqual([1, 2]);
          });

          it("should be an empty array when there are no child controls", () => {
            var a = new ControlArray([]);
            expect(a.value).toEqual([]);
          });
        });

        describe("validator", () => {
          it("should run the validator with the initial value (valid)", () => {
            var a = new ControlArray(
                [new Control(1, Validators.required), new Control(2, Validators.required)]);

            expect(a.valid).toBe(true);
            expect(a.errors).toBe(null);
          });

          it("should run the validator with the initial value (invalid)", () => {
            var a = new ControlArray([
              new Control(1, Validators.required),
              new Control(null, Validators.required),
              new Control(2, Validators.required)
            ]);

            expect(a.valid).toBe(false);
            expect(a.errors).toEqual({"required": [a.controls[1]]});
          });

          it("should run the validator when the value changes", () => {
            var a = new ControlArray([]);
            var c = new Control(null, Validators.required);
            a.push(c);
            expect(a.valid).toBe(false);

            c.updateValue("some value");

            expect(a.valid).toBe(true);
            expect(a.errors).toBe(null);
          });
        });

        describe("pristine", () => {
          it("should be true after creating a control", () => {
            var a = new ControlArray([new Control(1)]);
            expect(a.pristine).toBe(true);
          });

          it("should be false after changing the value of the control", () => {
            var c = new Control(1);
            var a = new ControlArray([c]);

            c.updateValue('new value');

            expect(a.pristine).toEqual(false);
          });
        });

        describe("valueChanges", () => {
          var a, c1, c2;

          beforeEach(() => {
            c1 = new Control("old1");
            c2 = new Control("old2");
            a = new ControlArray([c1, c2]);
          });

          it("should fire an event after the value has been updated",
             inject([AsyncTestCompleter], (async) => {
               ObservableWrapper.subscribe(a.valueChanges, (value) => {
                 expect(a.value).toEqual(['new1', 'old2']);
                 expect(value).toEqual(['new1', 'old2']);
                 async.done();
               });
               c1.updateValue("new1");
             }));

          it("should fire an event after the control's observable fired an event",
             inject([AsyncTestCompleter], (async) => {
               var controlCallbackIsCalled = false;

               ObservableWrapper.subscribe(c1.valueChanges,
                                           (value) => { controlCallbackIsCalled = true; });

               ObservableWrapper.subscribe(a.valueChanges, (value) => {
                 expect(controlCallbackIsCalled).toBe(true);
                 async.done();
               });

               c1.updateValue("new1");
             }));

          it("should fire an event when a control is removed",
             inject([AsyncTestCompleter], (async) => {
               ObservableWrapper.subscribe(a.valueChanges, (value) => {
                 expect(value).toEqual(['old1']);
                 async.done();
               });

               a.removeAt(1);
             }));

          it("should fire an event when a control is added",
             inject([AsyncTestCompleter], (async) => {
               a.removeAt(1);

               ObservableWrapper.subscribe(a.valueChanges, (value) => {
                 expect(value).toEqual(['old1', 'old2']);
                 async.done();
               });

               a.push(c2);
             }));
        });
      });
    });
  });
}

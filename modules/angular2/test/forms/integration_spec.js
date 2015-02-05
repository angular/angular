import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach,
  el, queryView, dispatchEvent} from 'angular2/test_lib';

import {Lexer, Parser, ChangeDetector, dynamicChangeDetection} from 'angular2/change_detection';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {Injector} from 'angular2/di';
import {DOM} from 'angular2/src/facade/dom';

import {Component, TemplateConfig} from 'angular2/core';
import {ControlDecorator, ControlGroupDecorator, Control, ControlGroup} from 'angular2/forms';

export function main() {
  function detectChanges(view) {
    view.changeDetector.detectChanges();
  }

  function compile(componentType, template, context, callback) {
    var compiler = new Compiler(dynamicChangeDetection, null, new DirectiveMetadataReader(),
      new Parser(new Lexer()), new CompilerCache());

    compiler.compile(componentType, el(template)).then((pv) => {
      var view = pv.instantiate(null);
      view.hydrate(new Injector([]), null, context);
      detectChanges(view);
      callback(view);
    });
  }

  var compiler;

  beforeEach(() => {
    compiler = new Compiler(dynamicChangeDetection, null, new DirectiveMetadataReader(),
      new Parser(new Lexer()), new CompilerCache());
  });

  describe("integration tests", () => {
    it("should initialize DOM elements with the given form object", (done) => {
      var ctx = new MyComp(new ControlGroup({
        "login": new Control("loginValue")
      }));

      var t = `<div [control-group]="form">
                <input [control-name]="'login'">
              </div>`;

      compile(MyComp, t, ctx, (view) => {
        var input = queryView(view, "input")
        expect(input.value).toEqual("loginValue");
        done();
      });
    });

    it("should update the control group values on DOM change", (done) => {
      var form = new ControlGroup({
        "login": new Control("oldValue")
      });
      var ctx = new MyComp(form);

      var t = `<div [control-group]="form">
                <input [control-name]="'login'">
              </div>`;

      compile(MyComp, t, ctx, (view) => {
        var input = queryView(view, "input")

        input.value = "updatedValue";
        dispatchEvent(input, "change");

        expect(form.value).toEqual({"login": "updatedValue"});
        done();
      });
    });

    it("should update DOM elements when rebinding the control group", (done) => {
      var form = new ControlGroup({
        "login": new Control("oldValue")
      });
      var ctx = new MyComp(form);

      var t = `<div [control-group]="form">
                <input [control-name]="'login'">
              </div>`;

      compile(MyComp, t, ctx, (view) => {
        ctx.form = new ControlGroup({
          "login": new Control("newValue")
        });
        detectChanges(view);

        var input = queryView(view, "input")
        expect(input.value).toEqual("newValue");
        done();
      });
    });

    it("should update DOM element when rebinding the control name", (done) => {
      var ctx = new MyComp(new ControlGroup({
        "one": new Control("one"),
        "two": new Control("two")
      }), "one");

      var t = `<div [control-group]="form">
                <input [control-name]="name">
              </div>`;

      compile(MyComp, t, ctx, (view) => {
        var input = queryView(view, "input")
        expect(input.value).toEqual("one");

        ctx.name = "two";
        detectChanges(view);

        expect(input.value).toEqual("two");
        done();
      });
    });
  });
}

@Component({
  template: new TemplateConfig({
    directives: [ControlGroupDecorator, ControlDecorator]
  })
})
class MyComp {
  form:ControlGroup;
  name:string;

  constructor(form, name = null) {
    this.form = form;
    this.name = name;
  }
}
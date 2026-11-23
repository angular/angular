import { Directive, EventEmitter, Output, output } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import * as i0 from "@angular/core";
export class TestDir {
  click1 = output();
  click2 = output();
  click3 = outputFromObservable(new EventEmitter());
  _bla = output({ alias: "decoratorPublicName" });
  _bla2 = outputFromObservable(new EventEmitter(), { alias: "decoratorPublicName2" });
  clickDecorator1 = new EventEmitter();
  clickDecorator2 = new EventEmitter();
  _blaDecorator = new EventEmitter();
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    outputs: {
      click1: "click1",
      click2: "click2",
      click3: "click3",
      _bla: "decoratorPublicName",
      _bla2: "decoratorPublicName2",
      clickDecorator1: "clickDecorator1",
      clickDecorator2: "clickDecorator2",
      _blaDecorator: "decoratorPublicName3"
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestDir,
      [
        {
          type: Directive
        }
      ],
      null,
      {
        click1: [{ type: i0.Output, args: ["click1"] }],
        click2: [{ type: i0.Output, args: ["click2"] }],
        click3: [{ type: i0.Output, args: ["click3"] }],
        _bla: [{ type: i0.Output, args: ["decoratorPublicName"] }],
        _bla2: [{ type: i0.Output, args: ["decoratorPublicName2"] }],
        clickDecorator1: [
          {
            type: Output
          }
        ],
        clickDecorator2: [
          {
            type: Output
          }
        ],
        _blaDecorator: [
          {
            type: Output,
            args: ["decoratorPublicName3"]
          }
        ]
      }
    );
})();

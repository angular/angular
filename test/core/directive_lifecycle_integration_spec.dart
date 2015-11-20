library angular2.test.core.directive_lifecycle_integration_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        xit,
        Log,
        TestComponentBuilder;
import "package:angular2/core.dart"
    show
        OnChanges,
        OnInit,
        DoCheck,
        AfterContentInit,
        AfterContentChecked,
        AfterViewInit,
        AfterViewChecked;
import "package:angular2/src/core/metadata.dart"
    show Directive, Component, View, ViewMetadata;

main() {
  describe("directive lifecycle integration spec", () {
    it(
        "should invoke lifecycle methods onChanges > onInit > doCheck > afterContentChecked",
        inject([TestComponentBuilder, Log, AsyncTestCompleter],
            (TestComponentBuilder tcb, Log log, async) {
          tcb
              .overrideView(
                  MyComp,
                  new ViewMetadata(
                      template: "<div [field]=\"123\" lifecycle></div>",
                      directives: [LifecycleCmp]))
              .createAsync(MyComp)
              .then((tc) {
            tc.detectChanges();
            expect(log.result()).toEqual(
                "onChanges; onInit; doCheck; afterContentInit; afterContentChecked; child_doCheck; " +
                    "afterViewInit; afterViewChecked");
            log.clear();
            tc.detectChanges();
            expect(log.result()).toEqual(
                "doCheck; afterContentChecked; child_doCheck; afterViewChecked");
            async.done();
          });
        }));
  });
}

@Directive(selector: "[lifecycle-dir]")
class LifecycleDir implements DoCheck {
  Log _log;
  LifecycleDir(this._log) {}
  doCheck() {
    this._log.add("child_doCheck");
  }
}

@Component(selector: "[lifecycle]", inputs: const ["field"])
@View(
    template: '''<div lifecycle-dir></div>''', directives: const [LifecycleDir])
class LifecycleCmp
    implements
        OnChanges,
        OnInit,
        DoCheck,
        AfterContentInit,
        AfterContentChecked,
        AfterViewInit,
        AfterViewChecked {
  Log _log;
  var field;
  LifecycleCmp(this._log) {}
  onChanges(_) {
    this._log.add("onChanges");
  }

  onInit() {
    this._log.add("onInit");
  }

  doCheck() {
    this._log.add("doCheck");
  }

  afterContentInit() {
    this._log.add("afterContentInit");
  }

  afterContentChecked() {
    this._log.add("afterContentChecked");
  }

  afterViewInit() {
    this._log.add("afterViewInit");
  }

  afterViewChecked() {
    this._log.add("afterViewChecked");
  }
}

@Component(selector: "my-comp")
@View(directives: const [])
class MyComp {}

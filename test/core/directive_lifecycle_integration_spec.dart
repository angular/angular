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
        "should invoke lifecycle methods ngOnChanges > ngOnInit > ngDoCheck > ngAfterContentChecked",
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
                "ngOnChanges; ngOnInit; ngDoCheck; ngAfterContentInit; ngAfterContentChecked; child_ngDoCheck; " +
                    "ngAfterViewInit; ngAfterViewChecked");
            log.clear();
            tc.detectChanges();
            expect(log.result()).toEqual(
                "ngDoCheck; ngAfterContentChecked; child_ngDoCheck; ngAfterViewChecked");
            async.done();
          });
        }));
  });
}

@Directive(selector: "[lifecycle-dir]")
class LifecycleDir implements DoCheck {
  Log _log;
  LifecycleDir(this._log) {}
  ngDoCheck() {
    this._log.add("child_ngDoCheck");
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
  ngOnChanges(_) {
    this._log.add("ngOnChanges");
  }

  ngOnInit() {
    this._log.add("ngOnInit");
  }

  ngDoCheck() {
    this._log.add("ngDoCheck");
  }

  ngAfterContentInit() {
    this._log.add("ngAfterContentInit");
  }

  ngAfterContentChecked() {
    this._log.add("ngAfterContentChecked");
  }

  ngAfterViewInit() {
    this._log.add("ngAfterViewInit");
  }

  ngAfterViewChecked() {
    this._log.add("ngAfterViewChecked");
  }
}

@Component(selector: "my-comp")
@View(directives: const [])
class MyComp {}

import {
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
  TestComponentBuilder
} from 'angular2/test_lib';

import {Directive, Component, View, ViewMetadata, LifecycleEvent} from 'angular2/metadata';

export function main() {
  describe('directive lifecycle integration spec', () => {

    it('should invoke lifecycle methods onChanges > onInit > doCheck > afterContentChecked',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    {template: '<div [field]="123" lifecycle></div>', directives: [LifecycleDir]}))
             .createAsync(MyComp)
             .then((tc) => {
               var dir = tc.componentViewChildren[0].inject(LifecycleDir);
               tc.detectChanges();

               expect(dir.log).toEqual(["onChanges", "onInit", "doCheck", "afterContentChecked"]);

               tc.detectChanges();

               expect(dir.log).toEqual([
                 "onChanges",
                 "onInit",
                 "doCheck",
                 "afterContentChecked",
                 "doCheck",
                 "afterContentChecked"
               ]);

               async.done();
             });
       }));
  });
}


@Directive({
  selector: "[lifecycle]",
  properties: ['field'],
  lifecycle: [
    LifecycleEvent.OnChanges,
    LifecycleEvent.DoCheck,
    LifecycleEvent.OnInit,
    LifecycleEvent.AfterContentChecked
  ]
})
class LifecycleDir {
  field;
  log: List<string>;

  constructor() { this.log = []; }

  onChanges(_) { this.log.push("onChanges"); }

  onInit() { this.log.push("onInit"); }

  doCheck() { this.log.push("doCheck"); }

  afterContentChecked() { this.log.push("afterContentChecked"); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
}

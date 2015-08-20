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

    it('should invoke lifecycle methods onChange > onInit > onCheck > onAllChangesDone',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    {template: '<div [field]="123" lifecycle></div>', directives: [LifecycleDir]}))
             .createAsync(MyComp)
             .then((tc) => {
               var dir = tc.componentViewChildren[0].inject(LifecycleDir);
               tc.detectChanges();

               expect(dir.log).toEqual(["onChange", "onInit", "onCheck", "onAllChangesDone"]);

               tc.detectChanges();

               expect(dir.log).toEqual([
                 "onChange",
                 "onInit",
                 "onCheck",
                 "onAllChangesDone",
                 "onCheck",
                 "onAllChangesDone"
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
    LifecycleEvent.onChange,
    LifecycleEvent.onCheck,
    LifecycleEvent.onInit,
    LifecycleEvent.onAllChangesDone
  ]
})
class LifecycleDir {
  field;
  log: List<string>;

  constructor() { this.log = []; }

  onChange(_) { this.log.push("onChange"); }

  onInit() { this.log.push("onInit"); }

  onCheck() { this.log.push("onCheck"); }

  onAllChangesDone() { this.log.push("onAllChangesDone"); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
}

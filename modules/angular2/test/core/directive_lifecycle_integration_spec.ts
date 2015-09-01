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
  Log,
  TestComponentBuilder
} from 'angular2/test_lib';

import {
  Directive,
  Component,
  View,
  ViewMetadata,
  OnChanges,
  OnInit,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked
} from 'angular2/metadata';

export function main() {
  describe('directive lifecycle integration spec', () => {

    it('should invoke lifecycle methods onChanges > onInit > doCheck > afterContentChecked',
       inject([TestComponentBuilder, Log, AsyncTestCompleter], (tcb: TestComponentBuilder, log: Log,
                                                                async) => {
         tcb.overrideView(
                MyComp,
                new ViewMetadata(
                    {template: '<div [field]="123" lifecycle></div>', directives: [LifecycleCmp]}))
             .createAsync(MyComp)
             .then((tc) => {
               tc.detectChanges();

               expect(log.result())
                   .toEqual(
                       "onChanges; onInit; doCheck; afterContentInit; afterContentChecked; child_doCheck; " +
                       "afterViewInit; afterViewChecked");

               log.clear();
               tc.detectChanges();

               expect(log.result())
                   .toEqual("doCheck; afterContentChecked; child_doCheck; afterViewChecked");

               async.done();
             });
       }));
  });
}


@Directive({selector: '[lifecycle-dir]'})
class LifecycleDir implements DoCheck {
  constructor(private log: Log) {}
  doCheck() { this.log.add("child_doCheck"); }
}

@Component({selector: "[lifecycle]", properties: ['field']})
@View({template: `<div lifecycle-dir></div>`, directives: [LifecycleDir]})
class LifecycleCmp implements OnChanges, OnInit, DoCheck, AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked {
  field;
  constructor(private log: Log) {}

  onChanges(_) { this.log.add("onChanges"); }

  onInit() { this.log.add("onInit"); }

  doCheck() { this.log.add("doCheck"); }

  afterContentInit() { this.log.add("afterContentInit"); }

  afterContentChecked() { this.log.add("afterContentChecked"); }

  afterViewInit() { this.log.add("afterViewInit"); }

  afterViewChecked() { this.log.add("afterViewChecked"); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
}

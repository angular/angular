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
} from 'angular2/testing_internal';

import {
  OnChanges,
  OnInit,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked
} from 'angular2/core';
import {Directive, Component, View, ViewMetadata} from 'angular2/src/core/metadata';

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
  constructor(private _log: Log) {}
  doCheck() { this._log.add("child_doCheck"); }
}

@Component({selector: "[lifecycle]", inputs: ['field']})
@View({template: `<div lifecycle-dir></div>`, directives: [LifecycleDir]})
class LifecycleCmp implements OnChanges, OnInit, DoCheck, AfterContentInit, AfterContentChecked,
    AfterViewInit, AfterViewChecked {
  field;
  constructor(private _log: Log) {}

  onChanges(_) { this._log.add("onChanges"); }

  onInit() { this._log.add("onInit"); }

  doCheck() { this._log.add("doCheck"); }

  afterContentInit() { this._log.add("afterContentInit"); }

  afterContentChecked() { this._log.add("afterContentChecked"); }

  afterViewInit() { this._log.add("afterViewInit"); }

  afterViewChecked() { this._log.add("afterViewChecked"); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
}

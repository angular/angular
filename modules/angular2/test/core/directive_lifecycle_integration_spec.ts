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
  IS_DARTIUM
} from 'angular2/test_lib';

import {ListWrapper} from 'angular2/src/facade/collection';
import {TestBed} from 'angular2/src/test_lib/test_bed';
import {Directive, Component, View, onCheck, onInit, onChange} from 'angular2/angular2';
import * as viewAnn from 'angular2/src/core/annotations_impl/view';

export function main() {
  describe('directive lifecycle integration spec', () => {
    var ctx;

    beforeEach(() => { ctx = new MyComp(); });

    it('should invoke lifecycle methods onChanges > onInit > onCheck',
       inject([TestBed, AsyncTestCompleter], (tb, async) => {
         tb.overrideView(
             MyComp,
             new viewAnn.View(
                 {template: '<div [field]="123" [lifecycle]></div>', directives: [LifecycleDir]}));

         tb.createView(MyComp, {context: ctx})
             .then((view) => {
               var dir = view.rawView.elementInjectors[0].get(LifecycleDir);
               view.detectChanges();

               expect(dir.log).toEqual(["onChanges", "onInit", "onCheck"]);

               view.detectChanges();

               expect(dir.log).toEqual(["onChanges", "onInit", "onCheck", "onCheck"]);

               async.done();
             });
       }));
  });
}


@Directive({selector: "[lifecycle]", properties: ['field'], lifecycle: [onChange, onCheck, onInit]})
class LifecycleDir {
  field;
  log: List<string>;

  constructor() { this.log = []; }

  onChange(_) { ListWrapper.push(this.log, "onChanges"); }

  onInit() { ListWrapper.push(this.log, "onInit"); }

  onCheck() { ListWrapper.push(this.log, "onCheck"); }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
}

import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';
import {TestBed} from 'angular2/src/test_lib/test_bed';
import {Directive, Component} from 'angular2/src/core/annotations_impl/annotations';
import {Query} from 'angular2/src/core/annotations_impl/di';
import {View} from 'angular2/src/core/annotations_impl/view';
import {QueryList, NgFor} from 'angular2/angular2';
import {Inject} from 'angular2/src/di/annotations_impl';
import {forwardRef, resolveForwardRef, bind} from 'angular2/di';
import {Type} from 'angular2/src/facade/lang';

export function main() {
  describe("forwardRef integration", function () {
    it('should instantiate components which are declared using forwardRef', inject(
      [TestBed, AsyncTestCompleter],
      (tb, async) => {
        tb.createView(App).then((view) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('frame(lock)');
          async.done();
        });
      })
    );
  });
}

@Component({
  selector: 'app',
  injectables: [
    forwardRef(() => Frame)
  ]
})
@View({
  template: `<door><lock></lock></door>`,
  directives: [
    bind(forwardRef(() => Door)).toClass(forwardRef(() => Door)),
    bind(forwardRef(() => Lock)).toClass(forwardRef(() => Lock))
  ]
})
class App {
}

@Component({
  selector: 'Lock'
})
@View({
  directives: [NgFor],
  template: `{{frame.name}}(<span *ng-for="var lock of locks">{{lock.name}}</span>)`
})
class Door {
  locks: QueryList;
  frame: Frame;

  constructor(@Query(forwardRef(() => Lock)) locks: QueryList, @Inject(forwardRef(() => Frame)) frame:Frame) {
    this.frame = frame;
    this.locks = locks;
  }
}

class Frame {
  name: string;
  constructor() {
    this.name = 'frame';
  }
}

@Directive({
  selector: 'lock'
})
class Lock {
  name: string;
  constructor() {
    this.name = 'lock';
  }
}

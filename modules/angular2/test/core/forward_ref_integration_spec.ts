import {
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from 'angular2/test_lib';
import {
  bind,
  forwardRef,
  resolveForwardRef,
  Component,
  Directive,
  Inject,
  NgFor,
  Query,
  QueryList,
  View
} from 'angular2/core';
import {Type} from 'angular2/src/core/facade/lang';
import {asNativeElements} from 'angular2/src/core/debug';

export function main() {
  describe("forwardRef integration", function() {
    it('should instantiate components which are declared using forwardRef',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async) => {
         tcb.createAsync(App).then((tc) => {
           tc.detectChanges();
           expect(asNativeElements(tc.componentViewChildren)).toHaveText('frame(lock)');
           async.done();
         });
       }));
  });
}

@Component({selector: 'app', viewBindings: [forwardRef(() => Frame)]})
@View({
  template: `<door><lock></lock></door>`,
  directives: [
    bind(forwardRef(() => Door))
        .toClass(forwardRef(() => Door)),
    bind(forwardRef(() => Lock)).toClass(forwardRef(() => Lock))
  ]
})
class App {
}

@Component({selector: 'Lock'})
@View({
  directives: [NgFor],
  template: `{{frame.name}}(<span *ng-for="var lock of locks">{{lock.name}}</span>)`
})
class Door {
  locks: QueryList<Lock>;
  frame: Frame;

  constructor(@Query(forwardRef(() => Lock)) locks: QueryList<Lock>,
              @Inject(forwardRef(() => Frame)) frame: Frame) {
    this.frame = frame;
    this.locks = locks;
  }
}

class Frame {
  name: string;
  constructor() { this.name = 'frame'; }
}

@Directive({selector: 'lock'})
class Lock {
  name: string;
  constructor() { this.name = 'lock'; }
}

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
import {Directive, Component, Query, View} from 'angular2/annotations';
import {QueryList, NgFor} from 'angular2/angular2';
import {forwardRef, resolveForwardRef, bind, Inject} from 'angular2/di';
import {Type} from 'angular2/src/facade/lang';

export function main() {
  describe("forwardRef integration", function() {
    it('should instantiate components which are declared using forwardRef',
       inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
         tb.createView(App).then((view) => {
           view.detectChanges();
           expect(view.rootNodes).toHaveText('frame(lock)');
           async.done();
         });
       }));
  });
}

@Component({selector: 'app', appInjector: [forwardRef(() => Frame)]})
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

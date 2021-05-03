/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ContentChildren, Directive, DoCheck, Input, NgModule, OnChanges, QueryList, SimpleChange, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {onlyInIvy} from '@angular/private/testing';

describe('onChanges', () => {
  it('should correctly support updating one Input among many', () => {
    let log: string[] = [];

    @Component({selector: 'child-comp', template: 'child'})
    class ChildComp implements OnChanges {
      @Input() a: number = 0;
      @Input() b: number = 0;
      @Input() c: number = 0;

      ngOnChanges(changes: SimpleChanges) {
        for (let key in changes) {
          const simpleChange = changes[key];
          log.push(key + ': ' + simpleChange.previousValue + ' -> ' + simpleChange.currentValue);
        }
      }
    }

    @Component(
        {selector: 'app-comp', template: '<child-comp [a]="a" [b]="b" [c]="c"></child-comp>'})
    class AppComp {
      a = 0;
      b = 0;
      c = 0;
    }

    TestBed.configureTestingModule({declarations: [AppComp, ChildComp]});
    const fixture = TestBed.createComponent(AppComp);
    fixture.detectChanges();
    const appComp = fixture.componentInstance;
    expect(log).toEqual(['a: undefined -> 0', 'b: undefined -> 0', 'c: undefined -> 0']);
    log.length = 0;

    appComp.a = 1;
    fixture.detectChanges();
    expect(log).toEqual(['a: 0 -> 1']);
    log.length = 0;

    appComp.b = 2;
    fixture.detectChanges();
    expect(log).toEqual(['b: 0 -> 2']);
    log.length = 0;

    appComp.c = 3;
    fixture.detectChanges();
    expect(log).toEqual(['c: 0 -> 3']);
  });

  it('should call onChanges method after inputs are set in creation and update mode', () => {
    const events: any[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() val1 = 'a';

      @Input('publicVal2') val2 = 'b';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp', changes});
      }
    }

    @Component({template: `<comp [val1]="val1" [publicVal2]="val2"></comp>`})
    class App {
      val1 = 'a2';

      val2 = 'b2';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([{
      name: 'comp',
      changes: {
        val1: new SimpleChange(undefined, 'a2', true),
        val2: new SimpleChange(undefined, 'b2', true),
      }
    }]);

    events.length = 0;
    fixture.componentInstance.val1 = 'a3';
    fixture.componentInstance.val2 = 'b3';
    fixture.detectChanges();


    expect(events).toEqual([{
      name: 'comp',
      changes: {
        val1: new SimpleChange('a2', 'a3', false),
        val2: new SimpleChange('b2', 'b3', false),
      }
    }]);
  });

  it('should call parent onChanges before child onChanges', () => {
    const events: any[] = [];

    @Component({
      selector: 'parent',
      template: `<child [val]="val"></child>`,
    })
    class Parent {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'parent', changes});
      }
    }

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'child', changes});
      }
    }

    @Component({template: `<parent [val]="val"></parent>`})
    class App {
      val = 'foo';
    }

    TestBed.configureTestingModule({
      declarations: [App, Child, Parent],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent',
        changes: {
          val: new SimpleChange(undefined, 'foo', true),
        }
      },
      {
        name: 'child',
        changes: {
          val: new SimpleChange(undefined, 'foo', true),
        }
      }
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'bar';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      },
      {
        name: 'child',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      }
    ]);
  });

  it('should call all parent onChanges across view before calling children onChanges', () => {
    const events: any[] = [];

    @Component({
      selector: 'parent',
      template: `<child [name]="name" [val]="val"></child>`,
    })
    class Parent {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'parent ' + this.name, changes});
      }
    }

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'child ' + this.name, changes});
      }
    }

    @Component({
      template: `
        <parent name="1" [val]="val"></parent>
        <parent name="2" [val]="val"></parent>
      `
    })
    class App {
      val = 'foo';
    }

    TestBed.configureTestingModule({
      declarations: [App, Child, Parent],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'foo', true),
        }
      },
      {
        name: 'parent 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'foo', true),
        }
      },
      {
        name: 'child 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'foo', true),
        }
      },
      {
        name: 'child 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'foo', true),
        }
      },
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'bar';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent 1',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      },
      {
        name: 'parent 2',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      },
      {
        name: 'child 1',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      },
      {
        name: 'child 2',
        changes: {
          val: new SimpleChange('foo', 'bar', false),
        }
      },
    ]);
  });

  it('should call onChanges every time a new view is created with ngIf', () => {
    const events: any[] = [];

    @Component({
      selector: 'comp',
      template: `<p>{{val}}</p>`,
    })
    class Comp {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp', changes});
      }
    }

    @Component({template: `<comp *ngIf="show" [val]="val"></comp>`})
    class App {
      show = true;

      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([{
      name: 'comp',
      changes: {
        val: new SimpleChange(undefined, 'a', true),
      }
    }]);

    events.length = 0;
    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.val = 'b';
    fixture.componentInstance.show = true;
    fixture.detectChanges();

    expect(events).toEqual([{
      name: 'comp',
      changes: {
        val: new SimpleChange(undefined, 'b', true),
      }
    }]);
  });

  it('should call onChanges in hosts before their content children', () => {
    const events: any[] = [];
    @Component({
      selector: 'projected',
      template: `<p>{{val}}</p>`,
    })
    class Projected {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'projected', changes});
      }
    }

    @Component({
      selector: 'comp',
      template: `<div><ng-content></ng-content></div>`,
    })
    class Comp {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp', changes});
      }
    }

    @Component({
      template: `<comp [val]="val"><projected [val]="val"></projected></comp>`,
    })
    class App {
      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp',
        changes: {
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'projected',
        changes: {
          val: new SimpleChange(undefined, 'a', true),
        }
      },
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'projected',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
    ]);
  });

  it('should call onChanges in host and its content children before next host', () => {
    const events: any[] = [];
    @Component({
      selector: 'projected',
      template: `<p>{{val}}</p>`,
    })
    class Projected {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'projected ' + this.name, changes});
      }
    }

    @Component({
      selector: 'comp',
      template: `<div><ng-content></ng-content></div>`,
    })
    class Comp {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp ' + this.name, changes});
      }
    }

    @Component({
      template: `
        <comp name="1" [val]="val">
          <projected name="1" [val]="val"></projected>
        </comp>
        <comp name="2" [val]="val">
          <projected name="2" [val]="val"></projected>
        </comp>
      `,
    })
    class App {
      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'projected 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'projected 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp 1',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'projected 1',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp 2',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'projected 2',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
    ]);
  });

  it('should be called on directives after component by default', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'dir', changes});
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>{{val}}</p>`,
    })
    class Comp {
      @Input() val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp', changes});
      }
    }

    @Component({
      template: `<comp [dir]="val" [val]="val"></comp>`,
    })
    class App {
      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp',
        changes: {
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'dir',
        changes: {
          dir: new SimpleChange(undefined, 'a', true),
        }
      }
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'dir',
        changes: {
          dir: new SimpleChange('a', 'b', false),
        }
      }
    ]);
  });

  it('should be called on directives before component if component injects directives', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'dir', changes});
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>{{val}}</p>`,
    })
    class Comp {
      @Input() val = '';

      constructor(public dir: Dir) {}

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp', changes});
      }
    }

    @Component({
      template: `<comp [dir]="val" [val]="val"></comp>`,
    })
    class App {
      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'dir',
        changes: {
          dir: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp',
        changes: {
          val: new SimpleChange(undefined, 'a', true),
        }
      }
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'dir',
        changes: {
          dir: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      }
    ]);
  });

  it('should be called on multiple directives in injection order', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'dir', changes});
      }
    }

    @Directive({
      selector: '[injectionDir]',
    })
    class InjectionDir {
      @Input() injectionDir = '';

      constructor(public dir: Dir) {}

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'injectionDir', changes});
      }
    }

    @Component({
      template: `<div [injectionDir]="val" [dir]="val"></div>`,
    })
    class App {
      val = 'a';
    }

    TestBed.configureTestingModule({
      declarations: [App, InjectionDir, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'dir',
        changes: {
          dir: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'injectionDir',
        changes: {
          injectionDir: new SimpleChange(undefined, 'a', true),
        }
      }
    ]);
  });


  it('should be called on directives on an element', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      @Input('dir-val') val = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'dir', changes});
      }
    }

    @Component({template: `<div [dir]="val1" [dir-val]="val2"></div>`})
    class App {
      val1 = 'a';
      val2 = 'b';
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([{
      name: 'dir',
      changes: {
        dir: new SimpleChange(undefined, 'a', true),
        val: new SimpleChange(undefined, 'b', true),
      }
    }]);

    events.length = 0;
    fixture.componentInstance.val1 = 'a1';
    fixture.componentInstance.val2 = 'b1';
    fixture.detectChanges();
    expect(events).toEqual([{
      name: 'dir',
      changes: {
        dir: new SimpleChange('a', 'a1', false),
        val: new SimpleChange('b', 'b1', false),
      }
    }]);
  });

  it('should call onChanges properly in for loop', () => {
    const events: any[] = [];

    @Component({
      selector: 'comp',
      template: `<p>{{val}}</p>`,
    })
    class Comp {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'comp ' + this.name, changes});
      }
    }

    @Component({
      template: `
      <comp name="0" [val]="val"></comp>
      <comp *ngFor="let number of numbers" [name]="number" [val]="val"></comp>
      <comp name="1" [val]="val"></comp>
      `
    })
    class App {
      val = 'a';

      numbers = ['2', '3', '4'];
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp 0',
        changes: {
          name: new SimpleChange(undefined, '0', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp 3',
        changes: {
          name: new SimpleChange(undefined, '3', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'comp 4',
        changes: {
          name: new SimpleChange(undefined, '4', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      }
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'comp 0',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp 1',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp 2',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp 3',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'comp 4',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      }
    ]);
  });

  it('should call onChanges properly in for loop with children', () => {
    const events: any[] = [];

    @Component({
      selector: 'child',
      template: `<p>{{val}}</p>`,
    })
    class Child {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'child of parent ' + this.name, changes});
      }
    }

    @Component({
      selector: 'parent',
      template: `<child [name]="name" [val]="val"></child>`,
    })
    class Parent {
      @Input() val = '';

      @Input() name = '';

      ngOnChanges(changes: SimpleChanges) {
        events.push({name: 'parent ' + this.name, changes});
      }
    }

    @Component({
      template: `
        <parent name="0" [val]="val"></parent>
        <parent *ngFor="let number of numbers" [name]="number" [val]="val"></parent>
        <parent name="1" [val]="val"></parent>
      `
    })
    class App {
      val = 'a';
      numbers = ['2', '3', '4'];
    }

    TestBed.configureTestingModule({
      declarations: [App, Child, Parent],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent 0',
        changes: {
          name: new SimpleChange(undefined, '0', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'parent 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'parent 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'child of parent 2',
        changes: {
          name: new SimpleChange(undefined, '2', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'parent 3',
        changes: {
          name: new SimpleChange(undefined, '3', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'child of parent 3',
        changes: {
          name: new SimpleChange(undefined, '3', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'parent 4',
        changes: {
          name: new SimpleChange(undefined, '4', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'child of parent 4',
        changes: {
          name: new SimpleChange(undefined, '4', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'child of parent 0',
        changes: {
          name: new SimpleChange(undefined, '0', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
      {
        name: 'child of parent 1',
        changes: {
          name: new SimpleChange(undefined, '1', true),
          val: new SimpleChange(undefined, 'a', true),
        }
      },
    ]);

    events.length = 0;
    fixture.componentInstance.val = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      {
        name: 'parent 0',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'parent 1',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'parent 2',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'child of parent 2',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'parent 3',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'child of parent 3',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'parent 4',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'child of parent 4',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'child of parent 0',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
      {
        name: 'child of parent 1',
        changes: {
          val: new SimpleChange('a', 'b', false),
        }
      },
    ]);
  });

  it('should not call onChanges if props are set directly', () => {
    const events: any[] = [];

    @Component({template: `<p>{{value}}</p>`})
    class App {
      value = 'a';
      ngOnChanges(changes: SimpleChanges) {
        events.push(changes);
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.value = 'b';
    fixture.detectChanges();

    expect(events).toEqual([]);
  });
});

describe('meta-programing', () => {
  it('should allow adding lifecycle hook methods any time before first instance creation', () => {
    const events: any[] = [];

    @Component({template: `<child name="value"></child>`})
    class App {
    }

    @Component({selector: 'child', template: `empty`})
    class Child {
      @Input() name: string = '';
    }

    const ChildPrototype = Child.prototype as any;
    ChildPrototype.ngOnInit = () => events.push('onInit');
    ChildPrototype.ngOnChanges = (e: SimpleChanges) => {
      const name = e['name'];
      expect(name.previousValue).toEqual(undefined);
      expect(name.currentValue).toEqual('value');
      expect(name.firstChange).toEqual(true);
      events.push('ngOnChanges');
    };
    ChildPrototype.ngDoCheck = () => events.push('ngDoCheck');
    ChildPrototype.ngAfterContentInit = () => events.push('ngAfterContentInit');
    ChildPrototype.ngAfterContentChecked = () => events.push('ngAfterContentChecked');
    ChildPrototype.ngAfterViewInit = () => events.push('ngAfterViewInit');
    ChildPrototype.ngAfterViewChecked = () => events.push('ngAfterViewChecked');
    ChildPrototype.ngOnDestroy = () => events.push('ngOnDestroy');

    TestBed.configureTestingModule({
      declarations: [App, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.destroy();
    expect(events).toEqual([
      'ngOnChanges', 'onInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked',
      'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'
    ]);
  });

  it('should allow adding lifecycle hook methods with inheritance any time before first instance creation',
     () => {
       const events: any[] = [];

       @Component({template: `<child name="value"></child>`})
       class App {
       }

       class BaseChild {}

       @Component({selector: 'child', template: `empty`})
       class Child extends BaseChild {
         @Input() name: string = '';
       }

       // These are defined on the base class
       const BasePrototype = BaseChild.prototype as any;
       BasePrototype.ngOnInit = () => events.push('onInit');
       BasePrototype.ngOnChanges = (e: SimpleChanges) => {
         const name = e['name'];
         expect(name.previousValue).toEqual(undefined);
         expect(name.currentValue).toEqual('value');
         expect(name.firstChange).toEqual(true);
         events.push('ngOnChanges');
       };

       // These will be overwritten later
       BasePrototype.ngDoCheck = () => events.push('Expected to be overbidden');
       BasePrototype.ngAfterContentInit = () => events.push('Expected to be overbidden');


       // These are define on the concrete class
       const ChildPrototype = Child.prototype as any;
       ChildPrototype.ngDoCheck = () => events.push('ngDoCheck');
       ChildPrototype.ngAfterContentInit = () => events.push('ngAfterContentInit');
       ChildPrototype.ngAfterContentChecked = () => events.push('ngAfterContentChecked');
       ChildPrototype.ngAfterViewInit = () => events.push('ngAfterViewInit');
       ChildPrototype.ngAfterViewChecked = () => events.push('ngAfterViewChecked');
       ChildPrototype.ngOnDestroy = () => events.push('ngOnDestroy');

       TestBed.configureTestingModule({
         declarations: [App, Child],
       });
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();
       fixture.destroy();
       expect(events).toEqual([
         'ngOnChanges', 'onInit', 'ngDoCheck', 'ngAfterContentInit', 'ngAfterContentChecked',
         'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'
       ]);
     });
});

it('should call all hooks in correct order when several directives on same node', () => {
  let log: string[] = [];

  class AllHooks {
    id: number = -1;

    /** @internal */
    private _log(hook: string, id: number) {
      log.push(hook + id);
    }

    ngOnChanges() {
      this._log('onChanges', this.id);
    }
    ngOnInit() {
      this._log('onInit', this.id);
    }
    ngDoCheck() {
      this._log('doCheck', this.id);
    }
    ngAfterContentInit() {
      this._log('afterContentInit', this.id);
    }
    ngAfterContentChecked() {
      this._log('afterContentChecked', this.id);
    }
    ngAfterViewInit() {
      this._log('afterViewInit', this.id);
    }
    ngAfterViewChecked() {
      this._log('afterViewChecked', this.id);
    }
  }

  @Directive({selector: 'div'})
  class DirA extends AllHooks {
    @Input('a') id: number = 0;
  }

  @Directive({selector: 'div'})
  class DirB extends AllHooks {
    @Input('b') id: number = 0;
  }

  @Directive({selector: 'div'})
  class DirC extends AllHooks {
    @Input('c') id: number = 0;
  }

  @Component({selector: 'app-comp', template: '<div [a]="1" [b]="2" [c]="3"></div>'})
  class AppComp {
  }

  TestBed.configureTestingModule({declarations: [AppComp, DirA, DirB, DirC]});
  const fixture = TestBed.createComponent(AppComp);
  fixture.detectChanges();

  expect(log).toEqual([
    'onChanges1',
    'onInit1',
    'doCheck1',
    'onChanges2',
    'onInit2',
    'doCheck2',
    'onChanges3',
    'onInit3',
    'doCheck3',
    'afterContentInit1',
    'afterContentChecked1',
    'afterContentInit2',
    'afterContentChecked2',
    'afterContentInit3',
    'afterContentChecked3',
    'afterViewInit1',
    'afterViewChecked1',
    'afterViewInit2',
    'afterViewChecked2',
    'afterViewInit3',
    'afterViewChecked3'
  ]);
});

it('should call hooks after setting directives inputs', () => {
  let log: string[] = [];

  @Directive({selector: 'div'})
  class DirA {
    @Input() a: number = 0;
    ngOnInit() {
      log.push('onInitA' + this.a);
    }
  }

  @Directive({selector: 'div'})
  class DirB {
    @Input() b: number = 0;
    ngOnInit() {
      log.push('onInitB' + this.b);
    }
    ngDoCheck() {
      log.push('doCheckB' + this.b);
    }
  }

  @Directive({selector: 'div'})
  class DirC {
    @Input() c: number = 0;
    ngOnInit() {
      log.push('onInitC' + this.c);
    }
    ngDoCheck() {
      log.push('doCheckC' + this.c);
    }
  }

  @Component({
    selector: 'app-comp',
    template: '<div [a]="id" [b]="id" [c]="id"></div><div [a]="id" [b]="id" [c]="id"></div>'
  })
  class AppComp {
    id = 0;
  }

  TestBed.configureTestingModule({declarations: [AppComp, DirA, DirB, DirC]});
  const fixture = TestBed.createComponent(AppComp);
  fixture.detectChanges();

  expect(log).toEqual([
    'onInitA0', 'onInitB0', 'doCheckB0', 'onInitC0', 'doCheckC0', 'onInitA0', 'onInitB0',
    'doCheckB0', 'onInitC0', 'doCheckC0'
  ]);

  log = [];
  fixture.componentInstance.id = 1;
  fixture.detectChanges();
  expect(log).toEqual(['doCheckB1', 'doCheckC1', 'doCheckB1', 'doCheckC1']);
});

describe('onInit', () => {
  it('should call onInit after inputs are the first time', () => {
    const input1Values: string[] = [];
    const input2Values: string[] = [];

    @Component({
      selector: 'my-comp',
      template: `<p>test</p>`,
    })
    class MyComponent {
      @Input() input1 = '';

      @Input() input2 = '';

      ngOnInit() {
        input1Values.push(this.input1);
        input2Values.push(this.input2);
      }
    }

    @Component({
      template: `
        <my-comp [input1]="value1" [input2]="value2"></my-comp>
      `,
    })
    class App {
      value1 = 'a';
      value2 = 'b';
    }

    TestBed.configureTestingModule({
      declarations: [App, MyComponent],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(input1Values).toEqual(['a']);
    expect(input2Values).toEqual(['b']);

    fixture.componentInstance.value1 = 'c';
    fixture.componentInstance.value2 = 'd';
    fixture.detectChanges();

    // Shouldn't be called again just because change detection ran.
    expect(input1Values).toEqual(['a']);
    expect(input2Values).toEqual(['b']);
  });

  it('should be called on root component', () => {
    let onInitCalled = 0;

    @Component({template: ``})
    class App {
      ngOnInit() {
        onInitCalled++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(onInitCalled).toBe(1);
  });

  it('should call parent onInit before it calls child onInit', () => {
    const initCalls: string[] = [];

    @Component({
      selector: `child-comp`,
      template: `<p>child</p>`,
    })
    class ChildComp {
      ngOnInit() {
        initCalls.push('child');
      }
    }

    @Component({
      template: `<child-comp></child-comp>`,
    })
    class ParentComp {
      ngOnInit() {
        initCalls.push('parent');
      }
    }

    TestBed.configureTestingModule({
      declarations: [ParentComp, ChildComp],
    });
    const fixture = TestBed.createComponent(ParentComp);
    fixture.detectChanges();

    expect(initCalls).toEqual(['parent', 'child']);
  });

  it('should call all parent onInits across view before calling children onInits', () => {
    const initCalls: string[] = [];

    @Component({
      selector: `child-comp`,
      template: `<p>child</p>`,
    })
    class ChildComp {
      @Input() name = '';

      ngOnInit() {
        initCalls.push(`child of parent ${this.name}`);
      }
    }

    @Component({
      selector: 'parent-comp',
      template: `<child-comp [name]="name"></child-comp>`,
    })
    class ParentComp {
      @Input() name = '';

      ngOnInit() {
        initCalls.push(`parent ${this.name}`);
      }
    }

    @Component({
      template: `
        <parent-comp name="1"></parent-comp>
        <parent-comp name="2"></parent-comp>
      `
    })
    class App {
    }

    TestBed.configureTestingModule({
      declarations: [App, ParentComp, ChildComp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initCalls).toEqual(['parent 1', 'parent 2', 'child of parent 1', 'child of parent 2']);
  });

  it('should call onInit every time a new view is created (if block)', () => {
    let onInitCalls = 0;

    @Component({selector: 'my-comp', template: '<p>test</p>'})
    class MyComp {
      ngOnInit() {
        onInitCalls++;
      }
    }

    @Component({
      template: `
        <div *ngIf="show"><my-comp></my-comp></div>
      `
    })
    class App {
      show = true;
    }
    TestBed.configureTestingModule({
      declarations: [App, MyComp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(onInitCalls).toBe(1);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(onInitCalls).toBe(1);

    fixture.componentInstance.show = true;
    fixture.detectChanges();

    expect(onInitCalls).toBe(2);
  });

  it('should call onInit for children of dynamically created components', () => {
    @Component({selector: 'my-comp', template: '<p>test</p>'})
    class MyComp {
      onInitCalled = false;

      ngOnInit() {
        this.onInitCalled = true;
      }
    }

    @Component({
      selector: 'dynamic-comp',
      template: `
        <my-comp></my-comp>
      `,
    })
    class DynamicComp {
    }

    @Component({
      template: `
        <div #container></div>
      `,
    })
    class App {
      @ViewChild('container', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;

      constructor(public compFactoryResolver: ComponentFactoryResolver) {}

      createDynamicView() {
        const dynamicCompFactory = this.compFactoryResolver.resolveComponentFactory(DynamicComp);
        this.viewContainerRef.createComponent(dynamicCompFactory);
      }
    }

    // View Engine requires that DynamicComp be in entryComponents.
    @NgModule({
      declarations: [App, MyComp, DynamicComp],
      entryComponents: [DynamicComp, App],
    })
    class AppModule {
    }

    TestBed.configureTestingModule({imports: [AppModule]});

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    fixture.componentInstance.createDynamicView();
    fixture.detectChanges();

    const myComp = fixture.debugElement.query(By.directive(MyComp)).componentInstance;
    expect(myComp.onInitCalled).toBe(true);
  });

  it('should call onInit in hosts before their content children', () => {
    const initialized: string[] = [];

    @Component({
      selector: 'projected',
      template: '',
    })
    class Projected {
      ngOnInit() {
        initialized.push('projected');
      }
    }

    @Component({
      selector: 'comp',
      template: `<ng-content></ng-content>`,
    })
    class Comp {
      ngOnInit() {
        initialized.push('comp');
      }
    }

    @Component({
      template: `
        <comp>
          <projected></projected>
        </comp>
      `
    })
    class App {
      ngOnInit() {
        initialized.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual(['app', 'comp', 'projected']);
  });


  it('should call onInit in host and its content children before next host', () => {
    const initialized: string[] = [];

    @Component({
      selector: 'projected',
      template: '',
    })
    class Projected {
      @Input() name = '';

      ngOnInit() {
        initialized.push('projected ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<ng-content></ng-content>`,
    })
    class Comp {
      @Input() name = '';

      ngOnInit() {
        initialized.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1">
          <projected name="1"></projected>
        </comp>
        <comp name="2">
          <projected name="2"></projected>
        </comp>
      `
    })
    class App {
      ngOnInit() {
        initialized.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual(['app', 'comp 1', 'projected 1', 'comp 2', 'projected 2']);
  });

  it('should be called on directives after component by default', () => {
    const initialized: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir-name') name = '';

      ngOnInit() {
        initialized.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p></p>`,
    })
    class Comp {
      @Input() name = '';

      ngOnInit() {
        initialized.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1" dir dir-name="1"></comp>
        <comp name="2" dir dir-name="2"></comp>
      `
    })
    class App {
      ngOnInit() {
        initialized.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual(['app', 'comp 1', 'dir 1', 'comp 2', 'dir 2']);
  });

  it('should be called on multiple directives in injection order', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      ngOnInit() {
        events.push('dir');
      }
    }

    @Directive({
      selector: '[injectionDir]',
    })
    class InjectionDir {
      @Input() injectionDir = '';

      constructor(public dir: Dir) {}

      ngOnInit() {
        events.push('injectionDir');
      }
    }

    @Component({
      template: `<div [injectionDir]="val" [dir]="val"></div>`,
    })
    class App {
      val = 'a';

      ngOnInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, InjectionDir, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['app', 'dir', 'injectionDir']);
  });

  it('should be called on directives before component if component injects directives', () => {
    const initialized: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir-name') name = '';

      ngOnInit() {
        initialized.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p></p>`,
    })
    class Comp {
      @Input() name = '';

      constructor(public dir: Dir) {}

      ngOnInit() {
        initialized.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1" dir dir-name="1"></comp>
        <comp name="2" dir dir-name="2"></comp>
      `
    })
    class App {
      ngOnInit() {
        initialized.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual(['app', 'dir 1', 'comp 1', 'dir 2', 'comp 2']);
  });

  it('should be called on directives on an element', () => {
    const initialized: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir-name') name = '';

      ngOnInit() {
        initialized.push('dir ' + this.name);
      }
    }

    @Component({
      template: `
        <p name="1" dir dir-name="1"></p>
        <p name="2" dir dir-name="2"></p>
      `
    })
    class App {
      ngOnInit() {
        initialized.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual(['app', 'dir 1', 'dir 2']);
  });


  it('should call onInit properly in for loop', () => {
    const initialized: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p></p>`,
    })
    class Comp {
      @Input() name = '';

      ngOnInit() {
        initialized.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="0"></comp>
        <comp *ngFor="let number of numbers" [name]="number"></comp>
        <comp name="1"></comp>
      `
    })
    class App {
      numbers = [2, 3, 4, 5, 6];
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual([
      'comp 0', 'comp 1', 'comp 2', 'comp 3', 'comp 4', 'comp 5', 'comp 6'
    ]);
  });

  it('should call onInit properly in for loop with children', () => {
    const initialized: string[] = [];

    @Component({
      selector: 'child',
      template: `<p></p>`,
    })
    class Child {
      @Input() name = '';

      ngOnInit() {
        initialized.push('child of parent ' + this.name);
      }
    }

    @Component({selector: 'parent', template: '<child [name]="name"></child>'})
    class Parent {
      @Input() name = '';

      ngOnInit() {
        initialized.push('parent ' + this.name);
      }
    }

    @Component({
      template: `
        <parent name="0"></parent>
        <parent *ngFor="let number of numbers" [name]="number"></parent>
        <parent name="1"></parent>
      `
    })
    class App {
      numbers = [2, 3, 4, 5, 6];
    }

    TestBed.configureTestingModule({
      declarations: [App, Child, Parent],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(initialized).toEqual([
      // First the two root level components
      'parent 0',
      'parent 1',

      // Then our 5 embedded views
      'parent 2',
      'child of parent 2',
      'parent 3',
      'child of parent 3',
      'parent 4',
      'child of parent 4',
      'parent 5',
      'child of parent 5',
      'parent 6',
      'child of parent 6',

      // Then the children of the root level components
      'child of parent 0',
      'child of parent 1',
    ]);
  });
});

describe('doCheck', () => {
  it('should call doCheck on every refresh', () => {
    let doCheckCalled = 0;

    @Component({template: ``})
    class App {
      ngDoCheck() {
        doCheckCalled++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(doCheckCalled).toBe(1);

    fixture.detectChanges();

    expect(doCheckCalled).toBe(2);
  });

  it('should call parent doCheck before child doCheck', () => {
    const doChecks: string[] = [];

    @Component({
      selector: 'parent',
      template: `<child></child>`,
    })
    class Parent {
      ngDoCheck() {
        doChecks.push('parent');
      }
    }

    @Component({
      selector: 'child',
      template: ``,
    })
    class Child {
      ngDoCheck() {
        doChecks.push('child');
      }
    }

    @Component({template: `<parent></parent>`})
    class App {
      ngDoCheck() {
        doChecks.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(doChecks).toEqual(['app', 'parent', 'child']);
  });

  it('should call ngOnInit before ngDoCheck if creation mode', () => {
    const events: string[] = [];
    @Component({template: ``})
    class App {
      ngOnInit() {
        events.push('onInit');
      }

      ngDoCheck() {
        events.push('doCheck');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['onInit', 'doCheck']);
  });

  it('should be called on directives after component by default', () => {
    const doChecks: string[] = [];
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngDoCheck() {
        doChecks.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngDoCheck() {
        doChecks.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
      <comp name="1" dir="1"></comp>
      <comp name="2" dir="2"></comp>
    `
    })
    class App {
      ngDoCheck() {
        doChecks.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(doChecks).toEqual(['app', 'comp 1', 'dir 1', 'comp 2', 'dir 2']);
  });

  it('should be called on directives before component if component injects directives', () => {
    const doChecks: string[] = [];
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngDoCheck() {
        doChecks.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      constructor(public dir: Dir) {}

      ngDoCheck() {
        doChecks.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
      <comp name="1" dir="1"></comp>
      <comp name="2" dir="2"></comp>
    `
    })
    class App {
      ngDoCheck() {
        doChecks.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(doChecks).toEqual(['app', 'dir 1', 'comp 1', 'dir 2', 'comp 2']);
  });

  it('should be called on multiple directives in injection order', () => {
    const events: any[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input() dir = '';

      ngDoCheck() {
        events.push('dir');
      }
    }

    @Directive({
      selector: '[injectionDir]',
    })
    class InjectionDir {
      @Input() injectionDir = '';

      constructor(public dir: Dir) {}

      ngDoCheck() {
        events.push('injectionDir');
      }
    }

    @Component({
      template: `<div [injectionDir]="val" [dir]="val"></div>`,
    })
    class App {
      val = 'a';

      ngDoCheck() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, InjectionDir, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['app', 'dir', 'injectionDir']);
  });

  it('should be called on directives on an element', () => {
    const doChecks: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngDoCheck() {
        doChecks.push('dir ' + this.name);
      }
    }

    @Component({
      template: `
        <p dir="1"></p>
        <p dir="2"></p>
      `
    })
    class App {
      ngDoCheck() {
        doChecks.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(doChecks).toEqual(['app', 'dir 1', 'dir 2']);
  });
});

describe('afterContentinit', () => {
  it('should be called only in creation mode', () => {
    let afterContentInitCalls = 0;

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterContentInit() {
        afterContentInitCalls++;
      }
    }
    @Component({template: `<comp></comp>`})
    class App {
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // two updates
    fixture.detectChanges();
    fixture.detectChanges();

    expect(afterContentInitCalls).toBe(1);
  });

  it('should be called on root component in creation mode', () => {
    let afterContentInitCalls = 0;

    @Component({template: `<p>test</p>`})
    class App {
      ngAfterContentInit() {
        afterContentInitCalls++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // two updates
    fixture.detectChanges();
    fixture.detectChanges();

    expect(afterContentInitCalls).toBe(1);
  });

  it('should be called on every create ngIf', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterContentInit() {
        events.push('comp afterContentInit');
      }
    }

    @Component({template: `<comp *ngIf="show"></comp>`})
    class App {
      show = true;

      ngAfterContentInit() {
        events.push('app afterContentInit');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['app afterContentInit', 'comp afterContentInit']);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual(['app afterContentInit', 'comp afterContentInit']);

    fixture.componentInstance.show = true;
    fixture.detectChanges();


    expect(events).toEqual(
        ['app afterContentInit', 'comp afterContentInit', 'comp afterContentInit']);
  });

  it('should be called in parents before children', () => {
    const events: string[] = [];

    @Component({
      selector: 'parent',
      template: `<child [name]="name"></child>`,
    })
    class Parent {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('child of parent ' + this.name);
      }
    }

    @Component({
      template: `
      <parent name="1"></parent>
      <parent name="2"></parent>
      `
    })
    class App {
      ngAfterContentInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(
        ['app', 'parent 1', 'parent 2', 'child of parent 1', 'child of parent 2']);
  });

  it('should be called in projected components before their hosts', () => {
    const events: string[] = [];

    @Component({
      selector: 'projected-child',
      template: `<p>test</p>`,
    })
    class ProjectedChild {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('projected child ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<div><ng-content></ng-content></div>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      selector: 'projected',
      template: `<projected-child [name]=name></projected-child>`,
    })
    class Projected {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('projected ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1">
          <projected name="1"></projected>
          <projected name="2"></projected>
        </comp>
        <comp name="2">
          <projected name="3"></projected>
          <projected name="4"></projected>
        </comp>
      `
    })
    class App {
      ngAfterContentInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected, ProjectedChild],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      // root
      'app',
      // projections of comp 1
      'projected 1',
      'projected 2',
      // comp 1
      'comp 1',
      // projections of comp 2
      'projected 3',
      'projected 4',
      // comp 2
      'comp 2',
      // children of projections
      'projected child 1',
      'projected child 2',
      'projected child 3',
      'projected child 4',
    ]);
  });

  it('should be called in correct order in a for loop', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="4"></comp>
        <comp *ngFor="let number of numbers" [name]="number"></comp>
        <comp name="5"></comp>
      `
    })
    class App {
      numbers = [0, 1, 2, 3];

      ngAfterContentInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['app', 'comp 0', 'comp 1', 'comp 2', 'comp 3', 'comp 4', 'comp 5']);
  });

  it('should be called in correct order in a for loop with children', () => {
    const events: string[] = [];

    @Component({
      selector: 'parent',
      template: `<child [name]=name></child>`,
    })
    class Parent {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('child of parent ' + this.name);
      }
    }

    @Component({
      template: `
        <parent name="4"></parent>
        <parent *ngFor="let number of numbers" [name]="number"></parent>
        <parent name="5"></parent>
      `
    })
    class App {
      numbers = [0, 1, 2, 3];
      ngAfterContentInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      // root
      'app',
      // 4 embedded views
      'parent 0',
      'child of parent 0',
      'parent 1',
      'child of parent 1',
      'parent 2',
      'child of parent 2',
      'parent 3',
      'child of parent 3',
      // root children
      'parent 4',
      'parent 5',
      // children of root children
      'child of parent 4',
      'child of parent 5',
    ]);
  });

  it('should be called on directives after component', () => {
    const events: string[] = [];
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngAfterContentInit() {
        events.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterContentInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1" dir="1"></comp>
        <comp name="2" dir="2"></comp>
      `
    })
    class App {
      ngAfterContentInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'app',
      'comp 1',
      'dir 1',
      'comp 2',
      'dir 2',
    ]);
  });
});

describe('afterContentChecked', () => {
  it('should be called every change detection run after afterContentInit', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterContentInit() {
        events.push('comp afterContentInit');
      }

      ngAfterContentChecked() {
        events.push('comp afterContentChecked');
      }
    }

    @Component({template: `<comp></comp>`})
    class App {
      ngAfterContentInit() {
        events.push('app afterContentInit');
      }

      ngAfterContentChecked() {
        events.push('app afterContentChecked');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'app afterContentInit',
      'app afterContentChecked',
      'comp afterContentInit',
      'comp afterContentChecked',
    ]);
  });
});

describe('afterViewInit', () => {
  it('should be called on creation and not in update mode', () => {
    let afterViewInitCalls = 0;

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterViewInit() {
        afterViewInitCalls++;
      }
    }

    @Component({template: `<comp></comp>`})
    class App {
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // two updates
    fixture.detectChanges();
    fixture.detectChanges();

    expect(afterViewInitCalls).toBe(1);
  });

  it('should be called on root component in creation mode', () => {
    let afterViewInitCalls = 0;

    @Component({template: `<p>test</p>`})
    class App {
      ngAfterViewInit() {
        afterViewInitCalls++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // two updates
    fixture.detectChanges();
    fixture.detectChanges();

    expect(afterViewInitCalls).toBe(1);
  });

  it('should be called every time a view is initialized with ngIf', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterViewInit() {
        events.push('comp');
      }
    }

    @Component({
      template: `<comp *ngIf="show"></comp>`,
    })
    class App {
      show = true;

      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual(['comp', 'app']);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual(['comp', 'app']);

    fixture.componentInstance.show = true;
    fixture.detectChanges();

    expect(events).toEqual(['comp', 'app', 'comp']);
  });

  it('should be called in children before parents', () => {
    const events: string[] = [];

    @Component({
      selector: 'parent',
      template: `<child [name]=name></child>`,
    })
    class Parent {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('child of parent ' + this.name);
      }
    }

    @Component({
      template: `
        <parent name="1"></parent>
        <parent name="2"></parent>
      `
    })
    class App {
      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent 1',
      'child of parent 2',
      'parent 1',
      'parent 2',
      'app',
    ]);
  });

  it('should be called in projected components before their hosts', () => {
    const events: string[] = [];

    @Component({
      selector: 'projected',
      template: `<p>test</p>`,
    })
    class Projected {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('projected ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<ng-content></ng-content>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1"><projected name="1"></projected></comp>
        <comp name="2"><projected name="2"></projected></comp>
      `
    })
    class App {
      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();


    expect(events).toEqual([
      'projected 1',
      'comp 1',
      'projected 2',
      'comp 2',
      'app',
    ]);
  });

  it('should call afterViewInit in content children and host before next host', () => {
    const events: string[] = [];

    @Component({
      selector: 'projected-child',
      template: `<p>test</p>`,
    })
    class ProjectedChild {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('child of projected ' + this.name);
      }
    }

    @Component({
      selector: 'projected',
      template: `<projected-child [name]="name"></projected-child>`,
    })
    class Projected {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('projected ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<div><ng-content></ng-content></div>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1"><projected name="1"></projected></comp>
        <comp name="2"><projected name="2"></projected></comp>
      `
    })
    class App {
      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected, ProjectedChild],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'child of projected 1',
      'child of projected 2',
      'projected 1',
      'comp 1',
      'projected 2',
      'comp 2',
      'app',
    ]);
  });

  it('should be called in correct order with ngFor', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="4"></comp>
        <comp *ngFor="let number of numbers" [name]="number"></comp>
        <comp name="5"></comp>
      `
    })
    class App {
      numbers = [0, 1, 2, 3];

      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'comp 0',
      'comp 1',
      'comp 2',
      'comp 3',
      'comp 4',
      'comp 5',
      'app',
    ]);
  });

  it('should be called in correct order with for loops with children', () => {
    const events: string[] = [];

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('child of parent ' + this.name);
      }
    }
    @Component({
      selector: 'parent',
      template: `<child [name]="name"></child>`,
    })
    class Parent {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      template: `
        <parent name="4"></parent>
        <parent *ngFor="let number of numbers" [name]="number"></parent>
        <parent name="5"></parent>
      `
    })
    class App {
      numbers = [0, 1, 2, 3];

      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent 0',
      'parent 0',
      'child of parent 1',
      'parent 1',
      'child of parent 2',
      'parent 2',
      'child of parent 3',
      'parent 3',
      'child of parent 4',
      'child of parent 5',
      'parent 4',
      'parent 5',
      'app',
    ]);
  });

  it('should be called on directives after component', () => {
    const events: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngAfterViewInit() {
        events.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterViewInit() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <comp name="1" dir="1"></comp>
        <comp name="2" dir="2"></comp>
      `
    })
    class App {
      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'comp 1',
      'dir 1',
      'comp 2',
      'dir 2',
      'app',
    ]);
  });

  it('should be called on directives on an element', () => {
    const events: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngAfterViewInit() {
        events.push('dir ' + this.name);
      }
    }

    @Component({
      template: `
        <div dir="1"></div>
        <div dir="2"></div>
      `
    })
    class App {
      ngAfterViewInit() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'dir 1',
      'dir 2',
      'app',
    ]);
  });
});

describe('afterViewChecked', () => {
  it('should call ngAfterViewChecked every update', () => {
    let afterViewCheckedCalls = 0;

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngAfterViewChecked() {
        afterViewCheckedCalls++;
      }
    }

    @Component({template: `<comp></comp>`})
    class App {
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(1);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(2);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(3);
  });

  it('should be called on root component', () => {
    let afterViewCheckedCalls = 0;

    @Component({template: `<p>test</p>`})
    class App {
      ngAfterViewChecked() {
        afterViewCheckedCalls++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(1);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(2);

    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(3);
  });

  it('should call ngAfterViewChecked with bindings', () => {
    let afterViewCheckedCalls = 0;

    @Component({
      selector: 'comp',
      template: `<p>{{value}}</p>`,
    })
    class Comp {
      @Input() value = '';
      ngAfterViewChecked() {
        afterViewCheckedCalls++;
      }
    }

    @Component({template: `<comp [value]="value"></comp>`})
    class App {
      value = 1;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(1);

    fixture.componentInstance.value = 1337;
    fixture.detectChanges();
    expect(afterViewCheckedCalls).toBe(2);
  });

  it('should be called in correct order with for loops with children', () => {
    const events: string[] = [];

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngAfterViewChecked() {
        events.push('child of parent ' + this.name);
      }
    }

    @Component({
      selector: 'parent',
      template: `<child [name]="name"></child>`,
    })
    class Parent {
      @Input() name = '';

      ngAfterViewChecked() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      template: `
      <parent name="4"></parent>
      <parent *ngFor="let number of numbers" [name]="number"></parent>
      <parent name="5"></parent>
      `
    })
    class App {
      numbers = [0, 1, 2, 3];

      ngAfterViewChecked() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent 0',
      'parent 0',
      'child of parent 1',
      'parent 1',
      'child of parent 2',
      'parent 2',
      'child of parent 3',
      'parent 3',
      'child of parent 4',
      'child of parent 5',
      'parent 4',
      'parent 5',
      'app',
    ]);
  });

  it('should be called on directives after component', () => {
    const events: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngAfterViewChecked() {
        events.push('dir ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngAfterViewChecked() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
      <comp name="1" dir="1"></comp>
      <comp name="2" dir="2"></comp>
    `
    })
    class App {
      ngAfterViewChecked() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'comp 1',
      'dir 1',
      'comp 2',
      'dir 2',
      'app',
    ]);
  });

  it('should be called on directives on an element', () => {
    const events: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('dir') name = '';

      ngAfterViewChecked() {
        events.push('dir ' + this.name);
      }
    }

    @Component({
      template: `
      <div dir="1"></div>
      <div dir="2"></div>
    `
    })
    class App {
      ngAfterViewChecked() {
        events.push('app');
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'dir 1',
      'dir 2',
      'app',
    ]);
  });
});

describe('onDestroy', () => {
  it('should call destroy when view is removed', () => {
    let destroyCalled = 0;

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngOnDestroy() {
        destroyCalled++;
      }
    }

    @Component({
      template: `<comp *ngIf="show"></comp>`,
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(destroyCalled).toBe(0);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(destroyCalled).toBe(1);

    fixture.componentInstance.show = true;
    fixture.detectChanges();

    expect(destroyCalled).toBe(1);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(destroyCalled).toBe(2);
  });

  it('should call destroy when multiple views are removed', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngOnDestroy() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <div *ngIf="show">
          <comp name="1"></comp>
          <comp name="2"></comp>
        </div>
      `
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual(['comp 1', 'comp 2']);
  });

  it('should be called in child components before parent components', () => {
    const events: string[] = [];

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngOnDestroy() {
        events.push('child of parent ' + this.name);
      }
    }

    @Component({
      selector: 'parent',
      template: `<child [name]="name"></child>`,
    })
    class Parent {
      @Input() name = '';
      ngOnDestroy() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      template: `
        <div *ngIf="show">
          <parent name="1"></parent>
          <parent name="2"></parent>
        </div>
      `
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent 1',
      'child of parent 2',
      'parent 1',
      'parent 2',
    ]);
  });

  it('should be called bottom up with children nested 2 levels deep', () => {
    const events: string[] = [];

    @Component({
      selector: 'child',
      template: `<p>test</p>`,
    })
    class Child {
      @Input() name = '';

      ngOnDestroy() {
        events.push('child ' + this.name);
      }
    }

    @Component({
      selector: 'parent',
      template: `<child [name]="name"></child>`,
    })
    class Parent {
      @Input() name = '';
      ngOnDestroy() {
        events.push('parent ' + this.name);
      }
    }

    @Component({
      selector: 'grandparent',
      template: `<parent [name]="name"></parent>`,
    })
    class Grandparent {
      @Input() name = '';

      ngOnDestroy() {
        events.push('grandparent ' + this.name);
      }
    }
    @Component({
      template: `
        <div *ngIf="show">
          <grandparent name="1"></grandparent>
          <grandparent name="2"></grandparent>
        </div>
      `
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Grandparent, Parent, Child],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'child 1',
      'parent 1',
      'child 2',
      'parent 2',
      'grandparent 1',
      'grandparent 2',
    ]);
  });

  it('should be called in projected components before their hosts', () => {
    const events: string[] = [];

    @Component({
      selector: 'projected',
      template: `<p>test</p>`,
    })
    class Projected {
      @Input() name = '';

      ngOnDestroy() {
        events.push('projected ' + this.name);
      }
    }

    @Component({
      selector: 'comp',
      template: `<div><ng-content></ng-content></div>`,
    })
    class Comp {
      @Input() name = '';

      ngOnDestroy() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <div *ngIf="show">
          <comp name="1">
            <projected name="1"></projected>
          </comp>
          <comp name="2">
            <projected name="2"></projected>
          </comp>
        </div>
      `
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp, Projected],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'projected 1',
      'comp 1',
      'projected 2',
      'comp 2',
    ]);
  });


  it('should be called in consistent order if views are removed and re-added', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngOnDestroy() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
      <div *ngIf="showAll">
        <comp name="1"></comp>
        <comp *ngIf="showMiddle" name="2"></comp>
        <comp name="3"></comp>
      </div>
      `
    })
    class App {
      showAll = true;
      showMiddle = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.showMiddle = false;
    fixture.detectChanges();
    expect(events).toEqual(['comp 2']);

    fixture.componentInstance.showAll = false;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp 2',
      'comp 1',
      'comp 3',
    ]);

    fixture.componentInstance.showAll = true;
    fixture.componentInstance.showMiddle = true;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp 2',
      'comp 1',
      'comp 3',
    ]);

    fixture.componentInstance.showAll = false;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp 2',
      'comp 1',
      'comp 3',
      'comp 2',
      'comp 1',
      'comp 3',
    ]);
  });

  it('should be called on every iteration of a destroyed for loop', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      @Input() name = '';

      ngOnDestroy() {
        events.push('comp ' + this.name);
      }
    }

    @Component({
      template: `
        <div *ngIf="show">
          <comp *ngFor="let number of numbers" [name]="number"></comp>
        </div>
      `
    })
    class App {
      show = true;
      numbers = [0, 1, 2, 3];
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'comp 0',
      'comp 1',
      'comp 2',
      'comp 3',
    ]);

    fixture.componentInstance.show = true;
    fixture.detectChanges();

    expect(events).toEqual([
      'comp 0',
      'comp 1',
      'comp 2',
      'comp 3',
    ]);

    fixture.componentInstance.numbers.splice(1, 1);
    fixture.detectChanges();
    expect(events).toEqual([
      'comp 0',
      'comp 1',
      'comp 2',
      'comp 3',
      'comp 1',
    ]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp 0',
      'comp 1',
      'comp 2',
      'comp 3',
      'comp 1',
      'comp 0',
      'comp 2',
      'comp 3',
    ]);
  });

  it('should call destroy properly if view also has listeners', () => {
    const events: string[] = [];

    @Component({
      selector: 'comp',
      template: `<p>test</p>`,
    })
    class Comp {
      ngOnDestroy() {
        events.push('comp');
      }
    }
    @Component({
      template: `
        <div *ngIf="show">
          <button (click)="handleClick1()">test 1</button>
          <comp></comp>
          <button (click)="handleClick2()">test 2</button>
        </div>
      `
    })
    class App {
      show = true;

      clicksToButton1 = 0;

      clicksToButton2 = 0;

      handleClick1() {
        this.clicksToButton1++;
      }

      handleClick2() {
        this.clicksToButton2++;
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach(button => button.nativeElement.click());

    expect(fixture.componentInstance.clicksToButton1).toBe(1);
    expect(fixture.componentInstance.clicksToButton2).toBe(1);
    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    buttons.forEach(button => button.nativeElement.click());
    expect(fixture.componentInstance.clicksToButton1).toBe(1);
    expect(fixture.componentInstance.clicksToButton2).toBe(1);

    expect(events).toEqual(['comp']);
  });

  it('should not produce errors if change detection is triggered during ngOnDestroy', () => {
    @Component({selector: 'child', template: `<ng-content></ng-content>`})
    class Child {
    }

    @Component({selector: 'parent', template: `<ng-content></ng-content>`})
    class Parent {
      @ContentChildren(Child, {descendants: true}) child!: QueryList<Child>;
    }

    @Component({
      selector: 'app',
      template: `
        <ng-template #tpl>
          <parent>
            <child></child>
          </parent>
        </ng-template>
        <div #container dir></div>
      `
    })
    class App {
      @ViewChild('container', {read: ViewContainerRef, static: true}) container!: ViewContainerRef;

      @ViewChild('tpl', {read: TemplateRef, static: true}) tpl!: TemplateRef<any>;

      ngOnInit() {
        this.container.createEmbeddedView(this.tpl);
      }
    }

    @Directive({selector: '[dir]'})
    class Dir {
      constructor(public cdr: ChangeDetectorRef) {}

      ngOnDestroy() {
        // Important: calling detectChanges in destroy hook like that
        // doesn’t have practical purpose, but in real-world cases it might
        // happen, for example as a result of "focus()" call on a DOM element,
        // in case ZoneJS is active.
        this.cdr.detectChanges();
      }
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Child, Dir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.autoDetectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });

  onlyInIvy(
      'View Engine has the opposite behavior, where it calls destroy on the directives first, then the components')
      .it('should be called on directives after component', () => {
        const events: string[] = [];

        @Directive({
          selector: '[dir]',
        })
        class Dir {
          @Input('dir') name = '';

          ngOnDestroy() {
            events.push('dir ' + this.name);
          }
        }

        @Component({
          selector: 'comp',
          template: `<p>test</p>`,
        })
        class Comp {
          @Input() name = '';

          ngOnDestroy() {
            events.push('comp ' + this.name);
          }
        }

        @Component({
          template: `
        <div *ngIf="show">
          <comp name="1" dir="1"></comp>
          <comp name="2" dir="2"></comp>
        </div>
      `
        })
        class App {
          show = true;
        }

        TestBed.configureTestingModule({
          declarations: [App, Dir, Comp],
          imports: [CommonModule],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(events).toEqual([]);

        fixture.componentInstance.show = false;
        fixture.detectChanges();

        expect(events).toEqual([
          'comp 1',
          'dir 1',
          'comp 2',
          'dir 2',
        ]);
      });

  it('should be called on directives on an element', () => {
    const events: string[] = [];

    @Directive({
      selector: '[dir]',
    })
    class Dir {
      ngOnDestroy() {
        events.push('dir');
      }
    }

    @Component({template: `<p *ngIf="show" dir></p>`})
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Dir],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual(['dir']);
  });
});

describe('hook order', () => {
  let events: string[] = [];

  beforeEach(() => events = []);

  @Component({
    selector: 'comp',
    template: `{{value}}<div><ng-content></ng-content></div>`,
  })
  class Comp {
    @Input() value = '';

    @Input() name = '';

    ngOnInit() {
      events.push(`${this.name} onInit`);
    }

    ngDoCheck() {
      events.push(`${this.name} doCheck`);
    }

    ngOnChanges() {
      events.push(`${this.name} onChanges`);
    }

    ngAfterContentInit() {
      events.push(`${this.name} afterContentInit`);
    }

    ngAfterContentChecked() {
      events.push(`${this.name} afterContentChecked`);
    }

    ngAfterViewInit() {
      events.push(`${this.name} afterViewInit`);
    }

    ngAfterViewChecked() {
      events.push(`${this.name} afterViewChecked`);
    }

    ngOnDestroy() {
      events.push(`${this.name} onDestroy`);
    }
  }

  @Component({
    selector: 'parent',
    template:
        `<comp [name]="'child of ' + this.name" [value]="value"><ng-content></ng-content></comp>`,
  })
  class Parent extends Comp {
  }

  it('should call all hooks in correct order', () => {
    @Component({template: `<comp *ngIf="show" name="comp" [value]="value"></comp>`})
    class App {
      value = 'a';

      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'comp onChanges',
      'comp onInit',
      'comp doCheck',
      'comp afterContentInit',
      'comp afterContentChecked',
      'comp afterViewInit',
      'comp afterViewChecked',
    ]);

    events.length = 0;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp doCheck',
      'comp afterContentChecked',
      'comp afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.value = 'b';
    fixture.detectChanges();
    expect(events).toEqual([
      'comp onChanges',
      'comp doCheck',
      'comp afterContentChecked',
      'comp afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.show = false;
    fixture.detectChanges();
    expect(events).toEqual([
      'comp onDestroy',
    ]);
  });

  it('should call all hooks in correct order with children', () => {
    @Component({
      template: `
        <div *ngIf="show">
          <parent name="parent1" [value]="value"></parent>
          <parent name="parent2" [value]="value"></parent>
        </div>
      `
    })
    class App {
      value = 'a';

      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'parent1 onChanges',
      'parent1 onInit',
      'parent1 doCheck',
      'parent2 onChanges',
      'parent2 onInit',
      'parent2 doCheck',
      'parent1 afterContentInit',
      'parent1 afterContentChecked',
      'parent2 afterContentInit',
      'parent2 afterContentChecked',
      'child of parent1 onChanges',
      'child of parent1 onInit',
      'child of parent1 doCheck',
      'child of parent1 afterContentInit',
      'child of parent1 afterContentChecked',
      'child of parent1 afterViewInit',
      'child of parent1 afterViewChecked',
      'child of parent2 onChanges',
      'child of parent2 onInit',
      'child of parent2 doCheck',
      'child of parent2 afterContentInit',
      'child of parent2 afterContentChecked',
      'child of parent2 afterViewInit',
      'child of parent2 afterViewChecked',
      'parent1 afterViewInit',
      'parent1 afterViewChecked',
      'parent2 afterViewInit',
      'parent2 afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.value = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      'parent1 onChanges',
      'parent1 doCheck',
      'parent2 onChanges',
      'parent2 doCheck',
      'parent1 afterContentChecked',
      'parent2 afterContentChecked',
      'child of parent1 onChanges',
      'child of parent1 doCheck',
      'child of parent1 afterContentChecked',
      'child of parent1 afterViewChecked',
      'child of parent2 onChanges',
      'child of parent2 doCheck',
      'child of parent2 afterContentChecked',
      'child of parent2 afterViewChecked',
      'parent1 afterViewChecked',
      'parent2 afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent1 onDestroy',
      'child of parent2 onDestroy',
      'parent1 onDestroy',
      'parent2 onDestroy',
    ]);
  });

  // Angular 5 reference: https://stackblitz.com/edit/lifecycle-hooks-ng
  it('should call all hooks in correct order with view and content', () => {
    @Component({
      template: `
        <div *ngIf="show">
          <parent name="parent1" [value]="value">
            <comp name="projected1" [value]="value"></comp>
          </parent>
          <parent name="parent2" [value]="value">
            <comp name="projected2" [value]="value"></comp>
          </parent>
        </div>
      `
    })
    class App {
      value = 'a';
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, Parent, Comp],
      imports: [CommonModule],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(events).toEqual([
      'parent1 onChanges',
      'parent1 onInit',
      'parent1 doCheck',
      'projected1 onChanges',
      'projected1 onInit',
      'projected1 doCheck',
      'parent2 onChanges',
      'parent2 onInit',
      'parent2 doCheck',
      'projected2 onChanges',
      'projected2 onInit',
      'projected2 doCheck',
      'projected1 afterContentInit',
      'projected1 afterContentChecked',
      'parent1 afterContentInit',
      'parent1 afterContentChecked',
      'projected2 afterContentInit',
      'projected2 afterContentChecked',
      'parent2 afterContentInit',
      'parent2 afterContentChecked',
      'child of parent1 onChanges',
      'child of parent1 onInit',
      'child of parent1 doCheck',
      'child of parent1 afterContentInit',
      'child of parent1 afterContentChecked',
      'child of parent1 afterViewInit',
      'child of parent1 afterViewChecked',
      'child of parent2 onChanges',
      'child of parent2 onInit',
      'child of parent2 doCheck',
      'child of parent2 afterContentInit',
      'child of parent2 afterContentChecked',
      'child of parent2 afterViewInit',
      'child of parent2 afterViewChecked',
      'projected1 afterViewInit',
      'projected1 afterViewChecked',
      'parent1 afterViewInit',
      'parent1 afterViewChecked',
      'projected2 afterViewInit',
      'projected2 afterViewChecked',
      'parent2 afterViewInit',
      'parent2 afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.value = 'b';
    fixture.detectChanges();

    expect(events).toEqual([
      'parent1 onChanges',
      'parent1 doCheck',
      'projected1 onChanges',
      'projected1 doCheck',
      'parent2 onChanges',
      'parent2 doCheck',
      'projected2 onChanges',
      'projected2 doCheck',
      'projected1 afterContentChecked',
      'parent1 afterContentChecked',
      'projected2 afterContentChecked',
      'parent2 afterContentChecked',
      'child of parent1 onChanges',
      'child of parent1 doCheck',
      'child of parent1 afterContentChecked',
      'child of parent1 afterViewChecked',
      'child of parent2 onChanges',
      'child of parent2 doCheck',
      'child of parent2 afterContentChecked',
      'child of parent2 afterViewChecked',
      'projected1 afterViewChecked',
      'parent1 afterViewChecked',
      'projected2 afterViewChecked',
      'parent2 afterViewChecked',
    ]);

    events.length = 0;
    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(events).toEqual([
      'child of parent1 onDestroy',
      'child of parent2 onDestroy',
      'projected1 onDestroy',
      'parent1 onDestroy',
      'projected2 onDestroy',
      'parent2 onDestroy',
    ]);
  });
});

describe('non-regression', () => {
  it('should call lifecycle hooks for directives active on <ng-template>', () => {
    let destroyed = false;

    @Directive({
      selector: '[onDestroyDir]',
    })
    class OnDestroyDir {
      ngOnDestroy() {
        destroyed = true;
      }
    }

    @Component({
      template: `<ng-template [ngIf]="show">
        <ng-template onDestroyDir>content</ng-template>
      </ng-template>`
    })
    class App {
      show = true;
    }

    TestBed.configureTestingModule({
      declarations: [App, OnDestroyDir],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(destroyed).toBeFalsy();

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(destroyed).toBeTruthy();
  });

  onlyInIvy('Use case is not supported in ViewEngine')
      .it('should not throw when calling detectChanges from a setter in the presence of a data binding, ngOnChanges and ngAfterViewInit',
          () => {
            const hooks: string[] = [];

            @Directive({selector: '[testDir]'})
            class TestDirective implements OnChanges, AfterViewInit {
              constructor(private _changeDetectorRef: ChangeDetectorRef) {}

              @Input('testDir')
              set value(_value: any) {
                this._changeDetectorRef.detectChanges();
              }
              ngOnChanges() {
                hooks.push('ngOnChanges');
              }
              ngAfterViewInit() {
                hooks.push('ngAfterViewInit');
              }
            }

            @Component({template: `<div [testDir]="value">{{value}}</div>`})
            class App {
              value = 1;
            }

            TestBed.configureTestingModule({declarations: [App, TestDirective]});
            const fixture = TestBed.createComponent(App);
            expect(() => fixture.detectChanges()).not.toThrow();
            expect(hooks).toEqual(['ngOnChanges', 'ngAfterViewInit']);
            expect(fixture.nativeElement.textContent.trim()).toBe('1');
          });

  onlyInIvy('Use case is not supported in ViewEngine')
      .it('should call hooks in the correct order when calling detectChanges in a setter', () => {
        const hooks: string[] = [];

        @Directive({selector: '[testDir]'})
        class TestDirective implements OnChanges, DoCheck, AfterViewInit {
          constructor(private _changeDetectorRef: ChangeDetectorRef) {}

          @Input('testDir')
          set value(_value: any) {
            this._changeDetectorRef.detectChanges();
          }
          ngOnChanges() {
            hooks.push('ngOnChanges');
          }
          ngDoCheck() {
            hooks.push('ngDoCheck');
          }
          ngAfterViewInit() {
            hooks.push('ngAfterViewInit');
          }
        }

        @Component({template: `<div [testDir]="value">{{value}}</div>`})
        class App {
          value = 1;
        }

        TestBed.configureTestingModule({declarations: [App, TestDirective]});
        const fixture = TestBed.createComponent(App);
        expect(() => fixture.detectChanges()).not.toThrow();
        expect(hooks).toEqual(['ngOnChanges', 'ngDoCheck', 'ngAfterViewInit']);
        expect(fixture.nativeElement.textContent.trim()).toBe('1');
      });
});

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnInit,
  Output,
  provideZoneChangeDetection,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
  ɵɵdefineDirective,
  ɵɵHostDirectivesFeature,
} from '../../src/core';
import {TestBed} from '../../testing';
import {By} from '@angular/platform-browser';

import {getComponent, getDirectives} from '../../src/render3/util/discovery_utils';

describe('host directives', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  it('should apply a basic host directive', () => {
    const logs: string[] = [];

    @Directive({
      host: {'host-dir-attr': '', 'class': 'host-dir', 'style': 'height: 50px'},
    })
    class HostDir {
      constructor() {
        logs.push('HostDir');
      }
    }

    @Directive({
      selector: '[dir]',
      host: {'host-attr': '', 'class': 'dir', 'style': 'width: 50px'},
      hostDirectives: [HostDir],
      standalone: false,
    })
    class Dir {
      constructor() {
        logs.push('Dir');
      }
    }

    @Component({
      template: '<div dir></div>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(logs).toEqual(['HostDir', 'Dir']);
    expect(fixture.nativeElement.innerHTML).toBe(
      '<div host-dir-attr="" host-attr="" dir="" ' +
        'class="host-dir dir" style="height: 50px; width: 50px;"></div>',
    );
  });

  it('should apply a host directive referenced through a forwardRef', () => {
    const logs: string[] = [];

    // This directive was "compiled" manually, because our tests are JIT-compiled and the JIT
    // compiler doesn't produce the callback-based variant of the `ɵɵHostDirectivesFeature`.
    // This represents the following metadata:
    // @Directive({
    //   selector: '[dir]',
    //   hostDirectives: [forwardRef(() => HostDir), {directive: forwardRef(() => OtherHostDir)}],
    //   standalone: false,
    // })
    class Dir {
      static ɵfac = () => new Dir();
      static ɵdir = ɵɵdefineDirective({
        type: Dir,
        selectors: [['', 'dir', '']],
        standalone: false,
        features: [ɵɵHostDirectivesFeature(() => [HostDir, {directive: OtherHostDir}])],
      });

      constructor() {
        logs.push('Dir');
      }
    }

    @Directive()
    class OtherHostDir {
      constructor() {
        logs.push('OtherHostDir');
      }
    }

    @Directive()
    class HostDir {
      constructor() {
        logs.push('HostDir');
      }
    }

    @Component({
      template: '<div dir></div>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(logs).toEqual(['HostDir', 'OtherHostDir', 'Dir']);
  });

  it('should apply a directive that references host directives through a forwardRef and is injected by its host directives', () => {
    // This directive was "compiled" manually, because our tests are JIT-compiled and the JIT
    // compiler doesn't produce the callback-based variant of the `ɵɵHostDirectivesFeature`.
    // This represents the following metadata:
    // @Directive({
    //   selector: '[dir]',
    //   hostDirectives: [forwardRef(() => HostDir), {directive: forwardRef(() => OtherHostDir)}],
    //   standalone: false,
    //   host: {'one': 'override', 'two': 'override'}
    // })
    class Dir {
      static ɵfac = () => new Dir();
      static ɵdir = ɵɵdefineDirective({
        type: Dir,
        selectors: [['', 'dir', '']],
        standalone: false,
        hostAttrs: ['one', 'override', 'two', 'override'],
        features: [ɵɵHostDirectivesFeature(() => [HostDir, {directive: OtherHostDir}])],
      });
    }

    @Directive({host: {'one': 'base'}})
    class OtherHostDir {
      constructor() {
        inject(Dir);
      }
    }

    @Directive({host: {'two': 'base'}})
    class HostDir {
      constructor() {
        inject(Dir);
      }
    }

    @Component({
      template: '<div dir></div>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // Note: we can't use the constructor call order here to determine the initialization order,
    // because the act of injecting `Dir` will cause it to be created earlier than its host bindings
    // will be invoked. Instead we check that the host bindings apply in the right order.
    const host = fixture.nativeElement.querySelector('[dir]');
    expect(host.getAttribute('one')).toBe('override');
    expect(host.getAttribute('two')).toBe('override');
  });

  it('should apply a chain of host directives', () => {
    const logs: string[] = [];
    const token = new InjectionToken('message');
    let diTokenValue: string;

    @Directive({
      host: {
        'class': 'leaf',
        'id': 'leaf-id',
      },
      providers: [{provide: token, useValue: 'leaf value'}],
    })
    class Chain1_3 {
      constructor(@Inject(token) tokenValue: string) {
        diTokenValue = tokenValue;
        logs.push('Chain1 - level 3');
      }
    }

    @Directive({
      hostDirectives: [Chain1_3],
    })
    class Chain1_2 {
      constructor() {
        logs.push('Chain1 - level 2');
      }
    }

    @Directive({
      hostDirectives: [Chain1_2],
    })
    class Chain1 {
      constructor() {
        logs.push('Chain1 - level 1');
      }
    }

    @Directive({
      host: {
        'class': 'middle',
        'id': 'middle-id',
      },
      providers: [{provide: token, useValue: 'middle value'}],
    })
    class Chain2_2 {
      constructor() {
        logs.push('Chain2 - level 2');
      }
    }

    @Directive({
      hostDirectives: [Chain2_2],
    })
    class Chain2 {
      constructor() {
        logs.push('Chain2 - level 1');
      }
    }

    @Directive()
    class Chain3_2 {
      constructor() {
        logs.push('Chain3 - level 2');
      }
    }

    @Directive({hostDirectives: [Chain3_2]})
    class Chain3 {
      constructor() {
        logs.push('Chain3 - level 1');
      }
    }

    @Component({
      selector: 'my-comp',
      host: {
        'class': 'host',
        'id': 'host-id',
      },
      template: '',
      hostDirectives: [Chain1, Chain2, Chain3],
      providers: [{provide: token, useValue: 'host value'}],
      standalone: false,
    })
    class MyComp {
      constructor() {
        logs.push('MyComp');
      }
    }

    @Directive()
    class SelectorMatchedHostDir {
      constructor() {
        logs.push('SelectorMatchedHostDir');
      }
    }

    @Directive({
      selector: '[selector-matched-dir]',
      hostDirectives: [SelectorMatchedHostDir],
      standalone: false,
    })
    class SelectorMatchedDir {
      constructor() {
        logs.push('SelectorMatchedDir');
      }
    }

    @Component({
      template: '<my-comp selector-matched-dir></my-comp>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, MyComp, SelectorMatchedDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(diTokenValue!).toBe('host value');
    expect(fixture.nativeElement.innerHTML).toBe(
      '<my-comp id="host-id" selector-matched-dir="" class="leaf middle host"></my-comp>',
    );
    expect(logs).toEqual([
      'Chain1 - level 3',
      'Chain1 - level 2',
      'Chain1 - level 1',
      'Chain2 - level 2',
      'Chain2 - level 1',
      'Chain3 - level 2',
      'Chain3 - level 1',
      'MyComp',
      'SelectorMatchedHostDir',
      'SelectorMatchedDir',
    ]);
  });

  it('should be able to query for the host directives', () => {
    let hostInstance!: Host;
    let firstHostDirInstance!: FirstHostDir;
    let secondHostDirInstance!: SecondHostDir;

    @Directive()
    class SecondHostDir {
      constructor() {
        secondHostDirInstance = this;
      }
    }

    @Directive({hostDirectives: [SecondHostDir]})
    class FirstHostDir {
      constructor() {
        firstHostDirInstance = this;
      }
    }

    @Directive({
      selector: '[dir]',
      hostDirectives: [FirstHostDir],
      standalone: false,
    })
    class Host {
      constructor() {
        hostInstance = this;
      }
    }

    @Component({
      template: '<div dir></div>',
      standalone: false,
    })
    class App {
      @ViewChild(FirstHostDir) firstHost!: FirstHostDir;
      @ViewChild(SecondHostDir) secondHost!: SecondHostDir;
    }

    TestBed.configureTestingModule({declarations: [App, Host]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(hostInstance instanceof Host).toBe(true);
    expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
    expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

    expect(fixture.componentInstance.firstHost).toBe(firstHostDirInstance);
    expect(fixture.componentInstance.secondHost).toBe(secondHostDirInstance);
  });

  it('should be able to reference exported host directives', () => {
    @Directive({exportAs: 'secondHost'})
    class SecondHostDir {
      name = 'SecondHost';
    }

    @Directive({hostDirectives: [SecondHostDir], exportAs: 'firstHost'})
    class FirstHostDir {
      name = 'FirstHost';
    }

    @Directive({
      selector: '[dir]',
      hostDirectives: [FirstHostDir],
      standalone: false,
    })
    class Host {}

    @Component({
      template: `
        <div
          dir
          #firstHost="firstHost"
          #secondHost="secondHost">{{firstHost.name}} | {{secondHost.name}}</div>
      `,
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Host]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('FirstHost | SecondHost');
  });

  it('should execute inherited host directives in the correct order', () => {
    const logs: string[] = [];

    @Directive()
    class HostGrandparent_1 {
      constructor() {
        logs.push('HostGrandparent_1');
      }
    }

    @Directive()
    class HostGrandparent_2 {
      constructor() {
        logs.push('HostGrandparent_2');
      }
    }

    @Directive({hostDirectives: [HostGrandparent_1, HostGrandparent_2]})
    class Grandparent {
      constructor() {
        logs.push('Grandparent');
      }
    }

    @Directive()
    class HostParent_1 {
      constructor() {
        logs.push('HostParent_1');
      }
    }

    @Directive()
    class HostParent_2 {
      constructor() {
        logs.push('HostParent_2');
      }
    }

    @Directive({hostDirectives: [HostParent_1, HostParent_2]})
    class Parent extends Grandparent {
      constructor() {
        super();
        logs.push('Parent');
      }
    }

    @Directive()
    class HostDir_1 {
      constructor() {
        logs.push('HostDir_1');
      }
    }

    @Directive()
    class HostDir_2 {
      constructor() {
        logs.push('HostDir_2');
      }
    }

    @Directive({
      selector: '[dir]',
      hostDirectives: [HostDir_1, HostDir_2],
      standalone: false,
    })
    class Dir extends Parent {
      constructor() {
        super();
        logs.push('Dir');
      }
    }

    @Component({
      template: '<div dir></div>',
      standalone: false,
    })
    class App {}

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(logs).toEqual([
      'HostGrandparent_1',
      'HostGrandparent_2',
      'HostParent_1',
      'HostParent_2',
      'HostDir_1',
      'HostDir_2',
      'Grandparent',
      'Parent',
      'Dir',
    ]);
  });

  describe('lifecycle hooks', () => {
    it('should invoke lifecycle hooks from the host directives', () => {
      const logs: string[] = [];

      @Directive()
      class HostDir implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('HostDir - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('HostDir - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('HostDir - ngAfterViewChecked');
        }
      }

      @Directive()
      class OtherHostDir implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('OtherHostDir - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('OtherHostDir - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('OtherHostDir - ngAfterViewChecked');
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir, OtherHostDir],
        standalone: false,
      })
      class Dir implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('Dir - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('Dir - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('Dir - ngAfterViewChecked');
        }
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(logs).toEqual([
        'HostDir - ngOnInit',
        'OtherHostDir - ngOnInit',
        'Dir - ngOnInit',
        'HostDir - ngAfterViewInit',
        'HostDir - ngAfterViewChecked',
        'OtherHostDir - ngAfterViewInit',
        'OtherHostDir - ngAfterViewChecked',
        'Dir - ngAfterViewInit',
        'Dir - ngAfterViewChecked',
      ]);
    });

    // Note: lifecycle hook order is different when components and directives are mixed so this
    // test aims to cover it. Usually lifecycle hooks are invoked based on the order in which
    // directives were matched, but components bypass this logic and always execute first.
    it('should invoke host directive lifecycle hooks before the host component hooks', () => {
      const logs: string[] = [];

      // Utility so we don't have to repeat the logging code.
      @Directive()
      abstract class LogsLifecycles implements OnInit, AfterViewInit {
        abstract name: string;

        ngOnInit() {
          logs.push(`${this.name} - ngOnInit`);
        }

        ngAfterViewInit() {
          logs.push(`${this.name} - ngAfterViewInit`);
        }
      }

      @Directive()
      class ChildHostDir extends LogsLifecycles {
        override name = 'ChildHostDir';
      }

      @Directive()
      class OtherChildHostDir extends LogsLifecycles {
        override name = 'OtherChildHostDir';
      }

      @Component({
        selector: 'child',
        hostDirectives: [ChildHostDir, OtherChildHostDir],
        standalone: false,
      })
      class Child extends LogsLifecycles {
        override name = 'Child';
      }

      @Directive()
      class ParentHostDir extends LogsLifecycles {
        override name = 'ParentHostDir';
      }

      @Directive()
      class OtherParentHostDir extends LogsLifecycles {
        override name = 'OtherParentHostDir';
      }

      @Component({
        selector: 'parent',
        hostDirectives: [ParentHostDir, OtherParentHostDir],
        template: '<child plain-dir="PlainDir on child"></child>',
        standalone: false,
      })
      class Parent extends LogsLifecycles {
        override name = 'Parent';
      }

      @Directive({
        selector: '[plain-dir]',
        standalone: false,
      })
      class PlainDir extends LogsLifecycles {
        @Input('plain-dir') override name = '';
      }

      @Component({
        template: '<parent plain-dir="PlainDir on parent"></parent>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Parent, Child, PlainDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(logs).toEqual([
        'ParentHostDir - ngOnInit',
        'OtherParentHostDir - ngOnInit',
        'Parent - ngOnInit',
        'PlainDir on parent - ngOnInit',
        'ChildHostDir - ngOnInit',
        'OtherChildHostDir - ngOnInit',
        'Child - ngOnInit',
        'PlainDir on child - ngOnInit',
        'ChildHostDir - ngAfterViewInit',
        'OtherChildHostDir - ngAfterViewInit',
        'Child - ngAfterViewInit',
        'PlainDir on child - ngAfterViewInit',
        'ParentHostDir - ngAfterViewInit',
        'OtherParentHostDir - ngAfterViewInit',
        'Parent - ngAfterViewInit',
        'PlainDir on parent - ngAfterViewInit',
      ]);
    });

    it('should invoke host directive ngOnChanges hooks before the host component', () => {
      let logs: string[] = [];

      // Utility so we don't have to repeat the logging code.
      @Directive()
      abstract class LogsLifecycles implements OnChanges {
        @Input() someInput: any;
        abstract name: string;

        ngOnChanges(changes: SimpleChanges) {
          logs.push(`${this.name} - ${changes['someInput'].currentValue}`);
        }
      }

      @Directive()
      class HostDir extends LogsLifecycles {
        override name = 'HostDir';
      }

      @Directive()
      class OtherHostDir extends LogsLifecycles {
        override name = 'OtherHostDir';
      }

      @Component({
        selector: 'host-comp',
        hostDirectives: [
          {directive: HostDir, inputs: ['someInput']},
          {directive: OtherHostDir, inputs: ['someInput']},
        ],
        standalone: false,
      })
      class HostComp extends LogsLifecycles {
        override name = 'HostComp';
      }

      @Directive({
        selector: '[plain-dir]',
        standalone: false,
      })
      class PlainDir extends LogsLifecycles {
        override name = 'PlainDir';
      }

      @Component({
        template: '<host-comp plain-dir="PlainDir" [someInput]="inputValue"></host-comp>',
        standalone: false,
      })
      class App {
        inputValue = 'hello';
      }

      TestBed.configureTestingModule({declarations: [App, HostComp, PlainDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(logs).toEqual([
        'HostDir - hello',
        'OtherHostDir - hello',
        'HostComp - hello',
        'PlainDir - hello',
      ]);

      logs = [];
      fixture.componentInstance.inputValue = 'changed';
      fixture.detectChanges();

      expect(logs).toEqual([
        'HostDir - changed',
        'OtherHostDir - changed',
        'HostComp - changed',
        'PlainDir - changed',
      ]);
    });
  });

  describe('host bindings', () => {
    it('should apply the host bindings from all host directives', () => {
      const clicks: string[] = [];

      @Directive({host: {'host-dir-attr': 'true', '(click)': 'handleClick()'}})
      class HostDir {
        handleClick() {
          clicks.push('HostDir');
        }
      }

      @Directive({
        host: {'other-host-dir-attr': 'true', '(click)': 'handleClick()'},
      })
      class OtherHostDir {
        handleClick() {
          clicks.push('OtherHostDir');
        }
      }

      @Directive({
        selector: '[dir]',
        host: {'host-attr': 'true', '(click)': 'handleClick()'},
        hostDirectives: [HostDir, OtherHostDir],
        standalone: false,
      })
      class Dir {
        handleClick() {
          clicks.push('Dir');
        }
      }

      @Component({
        template: '<button dir></button>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const host = fixture.nativeElement.querySelector('[dir]');

      expect(host.outerHTML).toBe(
        '<button host-dir-attr="true" other-host-dir-attr="true" host-attr="true" dir=""></button>',
      );

      host.click();
      fixture.detectChanges();

      expect(clicks).toEqual(['HostDir', 'OtherHostDir', 'Dir']);
    });

    it('should have the host bindings take precedence over the ones from the host directives', () => {
      @Directive({host: {'id': 'host-dir'}})
      class HostDir {}

      @Directive({host: {'id': 'other-host-dir'}})
      class OtherHostDir {}

      @Directive({
        selector: '[dir]',
        host: {'id': 'host'},
        hostDirectives: [HostDir, OtherHostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('[dir]').getAttribute('id')).toBe('host');
    });
  });

  describe('dependency injection', () => {
    it('should allow the host to inject its host directives', () => {
      let hostInstance!: Host;
      let firstHostDirInstance!: FirstHostDir;
      let secondHostDirInstance!: SecondHostDir;

      @Directive()
      class SecondHostDir {
        constructor() {
          secondHostDirInstance = this;
        }
      }

      @Directive({hostDirectives: [SecondHostDir]})
      class FirstHostDir {
        constructor() {
          firstHostDirInstance = this;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir],
        standalone: false,
      })
      class Host {
        firstHostDir = inject(FirstHostDir);
        secondHostDir = inject(SecondHostDir);

        constructor() {
          hostInstance = this;
        }
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(hostInstance instanceof Host).toBe(true);
      expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
      expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

      expect(hostInstance.firstHostDir).toBe(firstHostDirInstance);
      expect(hostInstance.secondHostDir).toBe(secondHostDirInstance);
    });

    it('should be able to inject a host directive into a child component', () => {
      let hostDirectiveInstance!: HostDir;

      @Component({
        selector: 'child',
        template: '',
        standalone: false,
      })
      class Child {
        hostDir = inject(HostDir);
      }

      @Directive()
      class HostDir {
        constructor() {
          hostDirectiveInstance = this;
        }
      }

      @Component({
        selector: 'host',
        template: '<child></child>',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Host {
        @ViewChild(Child) child!: Child;
      }

      @Component({
        template: '<host></host>',
        standalone: false,
      })
      class App {
        @ViewChild(Host) host!: Host;
      }

      TestBed.configureTestingModule({declarations: [App, Host, Child]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const injectedInstance = fixture.componentInstance.host.child.hostDir;

      expect(injectedInstance instanceof HostDir).toBe(true);
      expect(injectedInstance).toBe(hostDirectiveInstance);
    });

    it('should allow the host directives to inject their host', () => {
      let hostInstance!: Host;
      let firstHostDirInstance!: FirstHostDir;
      let secondHostDirInstance!: SecondHostDir;

      @Directive()
      class SecondHostDir {
        host = inject(Host);

        constructor() {
          secondHostDirInstance = this;
        }
      }

      @Directive({hostDirectives: [SecondHostDir]})
      class FirstHostDir {
        host = inject(Host);

        constructor() {
          firstHostDirInstance = this;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir],
        standalone: false,
      })
      class Host {
        constructor() {
          hostInstance = this;
        }
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(hostInstance instanceof Host).toBe(true);
      expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
      expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

      expect(firstHostDirInstance.host).toBe(hostInstance);
      expect(secondHostDirInstance.host).toBe(hostInstance);
    });

    it('should give precedence to the DI tokens from the host over the host directive tokens', () => {
      const token = new InjectionToken<string>('token');
      let hostInstance!: Host;
      let firstHostDirInstance!: FirstHostDir;
      let secondHostDirInstance!: SecondHostDir;

      @Directive({providers: [{provide: token, useValue: 'SecondDir'}]})
      class SecondHostDir {
        tokenValue = inject(token);

        constructor() {
          secondHostDirInstance = this;
        }
      }

      @Directive({
        hostDirectives: [SecondHostDir],
        providers: [{provide: token, useValue: 'FirstDir'}],
      })
      class FirstHostDir {
        tokenValue = inject(token);

        constructor() {
          firstHostDirInstance = this;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir],
        providers: [{provide: token, useValue: 'HostDir'}],
        standalone: false,
      })
      class Host {
        tokenValue = inject(token);

        constructor() {
          hostInstance = this;
        }
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(hostInstance instanceof Host).toBe(true);
      expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
      expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

      expect(hostInstance.tokenValue).toBe('HostDir');
      expect(firstHostDirInstance.tokenValue).toBe('HostDir');
      expect(secondHostDirInstance.tokenValue).toBe('HostDir');
    });

    it('should allow the host to inject tokens from the host directives', () => {
      const firstToken = new InjectionToken<string>('firstToken');
      const secondToken = new InjectionToken<string>('secondToken');

      @Directive({providers: [{provide: secondToken, useValue: 'SecondDir'}]})
      class SecondHostDir {}

      @Directive({
        hostDirectives: [SecondHostDir],
        providers: [{provide: firstToken, useValue: 'FirstDir'}],
      })
      class FirstHostDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir],
        standalone: false,
      })
      class Host {
        firstTokenValue = inject(firstToken);
        secondTokenValue = inject(secondToken);
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {
        @ViewChild(Host) host!: Host;
      }

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.host.firstTokenValue).toBe('FirstDir');
      expect(fixture.componentInstance.host.secondTokenValue).toBe('SecondDir');
    });

    it('should not give precedence to tokens from host directives over ones in viewProviders', () => {
      const token = new InjectionToken<string>('token');
      let tokenValue: string | undefined;

      @Directive({providers: [{provide: token, useValue: 'host-dir'}]})
      class HostDir {}

      @Component({
        selector: 'host',
        hostDirectives: [HostDir],
        providers: [{provide: token, useValue: 'host'}],
        template: '<span child></span>',
        standalone: false,
      })
      class Host {}

      @Directive({
        selector: '[child]',
        standalone: false,
      })
      class Child {
        constructor() {
          tokenValue = inject(token);
        }
      }

      @Component({
        template: '<host></host>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host, Child]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(tokenValue).toBe('host');
    });

    it('should not be able to access viewProviders from the host in the host directives', () => {
      const token = new InjectionToken<string>('token');
      let tokenValue: string | null = null;

      @Directive()
      class HostDir {
        constructor() {
          tokenValue = inject(token, {optional: true});
        }
      }

      @Component({
        selector: 'host',
        hostDirectives: [HostDir],
        viewProviders: [{provide: token, useValue: 'host'}],
        template: '',
        standalone: false,
      })
      class Host {}

      @Component({
        template: '<host></host>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(tokenValue).toBe(null);
    });

    it('should throw a circular dependency error if a host and a host directive inject each other', () => {
      @Directive()
      class HostDir {
        host = inject(Host);
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Host {
        hostDir = inject(HostDir);
      }

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Host]});
      expect(() => TestBed.createComponent(App)).toThrowError(
        /NG0200: Circular dependency detected for `HostDir`/,
      );
    });

    it('should inject a valid ChangeDetectorRef when attached to a component', () => {
      type InternalChangeDetectorRef = ChangeDetectorRef & {_lView: unknown};

      @Directive()
      class HostDir {
        changeDetectorRef = inject(ChangeDetectorRef) as InternalChangeDetectorRef;
      }

      @Component({
        selector: 'my-comp',
        hostDirectives: [HostDir],
        template: '',
        standalone: false,
      })
      class Comp {
        changeDetectorRef = inject(ChangeDetectorRef) as InternalChangeDetectorRef;
      }

      @Component({
        template: '<my-comp></my-comp>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        @ViewChild(Comp) comp!: Comp;
      }

      TestBed.configureTestingModule({declarations: [App, Comp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const hostDirectiveCdr = fixture.componentInstance.hostDir.changeDetectorRef;
      const componentCdr = fixture.componentInstance.comp.changeDetectorRef;

      // We can't assert that the change detectors are the same by comparing
      // them directly, because a new one is created each time. Instead of we
      // compare that they're associated with the same LView.
      expect(hostDirectiveCdr._lView).toBeTruthy();
      expect(componentCdr._lView).toBeTruthy();
      expect(hostDirectiveCdr._lView).toBe(componentCdr._lView);
      expect(() => {
        hostDirectiveCdr.markForCheck();
        hostDirectiveCdr.detectChanges();
      }).not.toThrow();
    });
  });

  describe('outputs', () => {
    it('should not emit to an output of a host directive that has not been exposed', () => {
      let hostDirectiveInstance: HostDir | undefined;

      @Directive({host: {'(click)': 'hasBeenClicked.emit()'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<void>();

        constructor() {
          hostDirectiveInstance = this;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy()"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(hostDirectiveInstance instanceof HostDir).toBe(true);
      expect(fixture.componentInstance.spy).not.toHaveBeenCalled();
    });

    it('should emit to an output of a host directive that has been exposed', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {
            directive: HostDir,
            outputs: ['hasBeenClicked'],
          },
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledOnceWith('hello');
    });

    it('should emit to an output of a host directive that has been exposed under an alias', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked: wasClicked']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: `
          <button dir (wasClicked)="validSpy($event)" (hasBeenClicked)="invalidSpy($event)"></button>`,
        standalone: false,
      })
      class App {
        validSpy = jasmine.createSpy('valid spy');
        invalidSpy = jasmine.createSpy('invalid spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.validSpy).toHaveBeenCalledOnceWith('hello');
      expect(fixture.componentInstance.invalidSpy).not.toHaveBeenCalled();
    });

    it('should alias to the public name of the host directive output, not the private one', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output('wasClicked') hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['wasClicked: clickOccurred']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: `
          <button
            dir
            (clickOccurred)="validSpy($event)"
            (hasBeenClicked)="invalidSpy($event)"></button>`,
        standalone: false,
      })
      class App {
        validSpy = jasmine.createSpy('valid spy');
        invalidSpy = jasmine.createSpy('invalid spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.validSpy).toHaveBeenCalledOnceWith('hello');
      expect(fixture.componentInstance.invalidSpy).not.toHaveBeenCalled();
    });

    it('should emit to an output of a host that has the same name as a non-exposed output of a host directive', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        host: {'(click)': 'hasBeenClicked.emit("Dir")'},
        standalone: false,
      })
      class Dir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledOnceWith('Dir');
    });

    it('should emit to an output of a host that has the same name as an exposed output of a host directive', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked']}],
        host: {'(click)': 'hasBeenClicked.emit("Dir")'},
        standalone: false,
      })
      class Dir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('HostDir');
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('Dir');
    });

    it('should emit to an output of a host that has the same name as the alias of a host directive output', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked: wasClicked']}],
        host: {'(click)': 'wasClicked.emit("Dir")'},
        standalone: false,
      })
      class Dir {
        @Output() wasClicked = new EventEmitter<string>();
      }

      @Component({
        template: '<button dir (wasClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('HostDir');
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('Dir');
    });

    it('should not expose the same output more than once', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit()'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<void>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked', 'hasBeenClicked']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(1);
    });

    it('should emit to an inherited output of a host directive', () => {
      @Directive({
        host: {'(click)': 'hasBeenClicked.emit("hello")'},
        standalone: false,
      })
      class ParentDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive()
      class HostDir extends ParentDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledOnceWith('hello');
    });

    it('should emit to an output that was exposed from one host directive, but not another', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("ExposedHostDir")'}})
      class ExposedHostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({host: {'(click)': 'hasBeenClicked.emit("UnExposedHostDir")'}})
      class UnExposedHostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: ExposedHostDir, outputs: ['hasBeenClicked']},
          UnExposedHostDir,
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledOnceWith('ExposedHostDir');
      expect(fixture.componentInstance.spy).not.toHaveBeenCalledWith('UnExposedHostDir');
    });

    it('should emit to outputs from different host directives that have been aliased to the same name', () => {
      @Directive({
        host: {'(click)': 'firstHasBeenClicked.emit("FirstHostDir")'},
      })
      class FirstHostDir {
        @Output() firstHasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        host: {'(click)': 'secondHasBeenClicked.emit("SecondHostDir")'},
      })
      class SecondHostDir {
        @Output() secondHasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: FirstHostDir, outputs: ['firstHasBeenClicked: wasClicked']},
          {directive: SecondHostDir, outputs: ['secondHasBeenClicked: wasClicked']},
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir (wasClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('FirstHostDir');
      expect(fixture.componentInstance.spy).toHaveBeenCalledWith('SecondHostDir');
    });

    it('should emit to an output of an inherited host directive that has been exposed', () => {
      @Directive({host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        hostDirectives: [
          {
            directive: HostDir,
            outputs: ['hasBeenClicked'],
          },
        ],
        standalone: false,
      })
      class Parent {}

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir extends Parent {}

      @Component({
        template: '<button dir (hasBeenClicked)="spy($event)"></button>',
        standalone: false,
      })
      class App {
        spy = jasmine.createSpy('click spy');
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.spy).toHaveBeenCalledOnceWith('hello');
    });
  });

  describe('inputs', () => {
    it('should not set an input of a host directive that has not been exposed', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir], errorOnUnknownProperties: true});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(/Can't bind to 'color' since it isn't a known property/);
    });

    it('should set the input of a host directive that has been exposed', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('green');
    });

    it('should set an input of a host directive that has been exposed under an alias', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [buttonColor]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('green');
    });

    it('should alias to the public name of the host directive input, not the private one', () => {
      @Directive()
      class HostDir {
        @Input('colorAlias') color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [buttonColor]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('green');
    });

    it('should set an input of a host that has the same name as a non-exposed input of a host directive', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {
        @Input() color?: string;
      }

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dir!: Dir;
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {dir, hostDir} = fixture.componentInstance;

      expect(dir.color).toBe('red');
      expect(hostDir.color).toBe(undefined);

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(dir.color).toBe('green');
      expect(hostDir.color).toBe(undefined);
    });

    it('should set an input of a host that has the same name as an exposed input of a host directive', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
        standalone: false,
      })
      class Dir {
        @Input() color?: string;
      }

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dir!: Dir;
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {dir, hostDir} = fixture.componentInstance;

      expect(dir.color).toBe('red');
      expect(hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(dir.color).toBe('green');
      expect(hostDir.color).toBe('green');
    });

    it('should set an input of a host that has the same name as the alias of a host directive input', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}],
        standalone: false,
      })
      class Dir {
        @Input() buttonColor?: string;
      }

      @Component({
        template: '<button dir [buttonColor]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(Dir) dir!: Dir;
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {dir, hostDir} = fixture.componentInstance;

      expect(dir.buttonColor).toBe('red');
      expect(hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(dir.buttonColor).toBe('green');
      expect(hostDir.color).toBe('green');
    });

    it('should set an inherited input of a host directive', () => {
      @Directive()
      class ParentDir {
        @Input() color?: string;
      }

      @Directive()
      class HostDir extends ParentDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.color).toBe('green');
    });

    it('should set an input that was exposed from one host directive, but not another', () => {
      @Directive()
      class ExposedHostDir {
        @Input() color?: string;
      }

      @Directive()
      class UnExposedHostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: ExposedHostDir, inputs: ['color']}, UnExposedHostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(ExposedHostDir) exposedHostDir!: ExposedHostDir;
        @ViewChild(UnExposedHostDir) unExposedHostDir!: UnExposedHostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {exposedHostDir, unExposedHostDir} = fixture.componentInstance;

      expect(exposedHostDir.color).toBe('red');
      expect(unExposedHostDir.color).toBe(undefined);

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(exposedHostDir.color).toBe('green');
      expect(unExposedHostDir.color).toBe(undefined);
    });

    it('should set inputs from different host directives that have been aliased to the same name', () => {
      @Directive()
      class FirstHostDir {
        @Input() firstColor?: string;
      }

      @Directive()
      class SecondHostDir {
        @Input() secondColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: FirstHostDir, inputs: ['firstColor: buttonColor']},
          {directive: SecondHostDir, inputs: ['secondColor: buttonColor']},
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [buttonColor]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(FirstHostDir) firstHostDir!: FirstHostDir;
        @ViewChild(SecondHostDir) secondHostDir!: SecondHostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const {firstHostDir, secondHostDir} = fixture.componentInstance;

      expect(firstHostDir.firstColor).toBe('red');
      expect(secondHostDir.secondColor).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstHostDir.firstColor).toBe('green');
      expect(secondHostDir.secondColor).toBe('green');
    });

    it('should not set a static input of a host directive that has not been exposed', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir color="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.color).toBe(undefined);
    });

    it('should set a static input of a host directive that has been exposed', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir color="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');
    });

    it('should set a static input of a host directive that has been exposed under an alias', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');
    });

    it('should alias to the public name of a static host directive input, not the private one', () => {
      @Directive()
      class HostDir {
        @Input('colorAlias') color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');
    });

    it('should set a static input that was exposed from one host directive, but not another', () => {
      @Directive()
      class ExposedHostDir {
        @Input() color?: string;
      }

      @Directive()
      class UnExposedHostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: ExposedHostDir, inputs: ['color']}, UnExposedHostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir color="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(ExposedHostDir) exposedHostDir!: ExposedHostDir;
        @ViewChild(UnExposedHostDir) unExposedHostDir!: UnExposedHostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.exposedHostDir.color).toBe('red');
      expect(fixture.componentInstance.unExposedHostDir.color).toBe(undefined);
    });

    it('should set static inputs from different host directives that have been aliased to the same name', () => {
      @Directive()
      class FirstHostDir {
        @Input() firstColor?: string;
      }

      @Directive()
      class SecondHostDir {
        @Input() secondColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: FirstHostDir, inputs: ['firstColor: buttonColor']},
          {directive: SecondHostDir, inputs: ['secondColor: buttonColor']},
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(FirstHostDir) firstHostDir!: FirstHostDir;
        @ViewChild(SecondHostDir) secondHostDir!: SecondHostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.firstHostDir.firstColor).toBe('red');
      expect(fixture.componentInstance.secondHostDir.secondColor).toBe('red');
    });

    it('should not expose an input under its host directive alias if a host directive is not applied', () => {
      const logs: string[] = [];

      @Directive({selector: '[host-dir]'})
      class HostDir implements OnChanges {
        @Input('colorAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          logs.push(changes['color'].currentValue);
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        // Note that `[dir]` doesn't match on the `button` on purpose.
        // The wrong behavior would be if the `buttonColor` binding worked on `host-dir`.
        template: `
              <span dir [buttonColor]="spanValue"></span>
              <button host-dir [buttonColor]="buttonValue"></button>
            `,
      })
      class App {
        spanValue = 'spanValue';
        buttonValue = 'buttonValue';
      }

      TestBed.configureTestingModule({errorOnUnknownProperties: true});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(/Can't bind to 'buttonColor' since it isn't a known property of 'button'/);

      // The input on the button instance should not have been written to.
      expect(logs).toEqual(['spanValue']);
    });

    it('should set the input of an inherited host directive that has been exposed', () => {
      @Directive()
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
        standalone: false,
      })
      class Parent {}

      @Directive({
        selector: '[dir]',
        standalone: false,
      })
      class Dir extends Parent {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('green');
    });
  });

  describe('ngOnChanges', () => {
    it('should invoke ngOnChanges when an input is set on a host directive', () => {
      let firstDirChangeEvent: SimpleChanges | undefined;
      let secondDirChangeEvent: SimpleChanges | undefined;

      @Directive()
      class FirstHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive()
      class SecondHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          secondDirChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: FirstHostDir, inputs: ['color']},
          {directive: SecondHostDir, inputs: ['color']},
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );

      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: false,
            previousValue: 'red',
            currentValue: 'green',
          }),
        }),
      );
      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: false,
            previousValue: 'red',
            currentValue: 'green',
          }),
        }),
      );
    });

    it('should invoke ngOnChanges when an aliased property is set on a host directive', () => {
      let firstDirChangeEvent: SimpleChanges | undefined;
      let secondDirChangeEvent: SimpleChanges | undefined;

      @Directive()
      class FirstHostDir implements OnChanges {
        @Input('firstAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive()
      class SecondHostDir implements OnChanges {
        @Input('secondAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          secondDirChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: FirstHostDir, inputs: ['firstAlias: buttonColor']},
          {directive: SecondHostDir, inputs: ['secondAlias: buttonColor']},
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [buttonColor]="color"></button>',
        standalone: false,
      })
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );

      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: false,
            previousValue: 'red',
            currentValue: 'green',
          }),
        }),
      );
      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: false,
            previousValue: 'red',
            currentValue: 'green',
          }),
        }),
      );
    });

    it('should only invoke ngOnChanges on the directives that have exposed an input', () => {
      let firstDirChangeEvent: SimpleChanges | undefined;
      let secondDirChangeEvent: SimpleChanges | undefined;

      @Directive()
      class FirstHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive()
      class SecondHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          secondDirChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir, {directive: SecondHostDir, inputs: ['color']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir [color]="color"></button>',
        standalone: false,
      })
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toBe(undefined);
      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toBe(undefined);
      expect(secondDirChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: false,
            previousValue: 'red',
            currentValue: 'green',
          }),
        }),
      );
    });

    it('should invoke ngOnChanges when a static aliased host directive input is set', () => {
      let latestChangeEvent: SimpleChanges | undefined;

      @Directive()
      class HostDir implements OnChanges {
        @Input('colorAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          latestChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(latestChangeEvent).toEqual(
        jasmine.objectContaining({
          color: jasmine.objectContaining({
            firstChange: true,
            previousValue: undefined,
            currentValue: 'red',
          }),
        }),
      );
    });
  });

  describe('debugging and testing utilities', () => {
    it('should be able to retrieve host directives using ng.getDirectives', () => {
      let hostDirInstance!: HostDir;
      let otherHostDirInstance!: OtherHostDir;
      let plainDirInstance!: PlainDir;

      @Directive()
      class HostDir {
        constructor() {
          hostDirInstance = this;
        }
      }

      @Directive()
      class OtherHostDir {
        constructor() {
          otherHostDirInstance = this;
        }
      }

      @Directive({
        selector: '[plain-dir]',
        standalone: false,
      })
      class PlainDir {
        constructor() {
          plainDirInstance = this;
        }
      }

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir, OtherHostDir],
        standalone: false,
      })
      class Comp {}

      @Component({
        template: '<comp plain-dir></comp>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Comp, PlainDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const componentHost = fixture.nativeElement.querySelector('comp');

      expect(hostDirInstance instanceof HostDir).toBe(true);
      expect(otherHostDirInstance instanceof OtherHostDir).toBe(true);
      expect(plainDirInstance instanceof PlainDir).toBe(true);
      expect(getDirectives(componentHost)).toEqual([
        hostDirInstance,
        otherHostDirInstance,
        plainDirInstance,
      ]);
    });

    it('should be able to retrieve components that have host directives using ng.getComponent', () => {
      let compInstance!: Comp;

      @Directive()
      class HostDir {}

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Comp {
        constructor() {
          compInstance = this;
        }
      }

      @Component({
        template: '<comp></comp>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Comp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const componentHost = fixture.nativeElement.querySelector('comp');

      expect(compInstance instanceof Comp).toBe(true);
      expect(getComponent(componentHost)).toBe(compInstance);
    });

    it('should be able to retrieve components that have host directives using DebugNode.componentInstance', () => {
      let compInstance!: Comp;

      @Directive()
      class HostDir {}

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Comp {
        constructor() {
          compInstance = this;
        }
      }

      @Component({
        template: '<comp></comp>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Comp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const node = fixture.debugElement.query(By.css('comp'));

      expect(compInstance instanceof Comp).toBe(true);
      expect(node.componentInstance).toBe(compInstance);
    });

    it('should be able to query by a host directive', () => {
      @Directive()
      class HostDir {}

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Comp {
        constructor(public elementRef: ElementRef<HTMLElement>) {}
      }

      @Component({
        template: '<comp></comp>',
        standalone: false,
      })
      class App {
        @ViewChild(Comp) compInstance!: Comp;
      }

      TestBed.configureTestingModule({declarations: [App, Comp]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const expected = fixture.componentInstance.compInstance.elementRef.nativeElement;
      const result = fixture.debugElement.query(By.directive(HostDir)).nativeElement;

      expect(result).toBe(expected);
    });
  });

  describe('root component with host directives', () => {
    function createRootComponent<T>(componentType: Type<T>) {
      @Component({
        template: '<ng-container #insertionPoint></ng-container>',
        standalone: false,
      })
      class App {
        @ViewChild('insertionPoint', {read: ViewContainerRef}) insertionPoint!: ViewContainerRef;
      }

      TestBed.configureTestingModule({
        declarations: [App, componentType],
        errorOnUnknownProperties: true,
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const ref = fixture.componentInstance.insertionPoint.createComponent(componentType);

      return {ref, fixture};
    }

    it('should apply a basic host directive to the root component', () => {
      const logs: string[] = [];

      @Directive({
        host: {'host-dir-attr': '', 'class': 'host-dir', 'style': 'height: 50px'},
      })
      class HostDir {
        constructor() {
          logs.push('HostDir');
        }
      }

      @Component({
        selector: 'host',
        host: {'host-attr': '', 'class': 'dir', 'style': 'width: 50px'},
        hostDirectives: [HostDir],
        template: '',
        standalone: false,
      })
      class HostComp {
        constructor() {
          logs.push('HostComp');
        }
      }

      const {fixture} = createRootComponent(HostComp);

      expect(logs).toEqual(['HostDir', 'HostComp']);
      expect(fixture.nativeElement.innerHTML).toContain(
        '<host host-dir-attr="" host-attr="" class="host-dir dir" ' +
          'style="height: 50px; width: 50px;"></host>',
      );
    });

    it('should invoke lifecycle hooks on host directives applied to a root component', () => {
      const logs: string[] = [];

      @Directive()
      class HostDir implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('HostDir - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('HostDir - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('HostDir - ngAfterViewChecked');
        }
      }

      @Directive()
      class OtherHostDir implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('OtherHostDir - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('OtherHostDir - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('OtherHostDir - ngAfterViewChecked');
        }
      }

      @Component({
        template: '',
        hostDirectives: [HostDir, OtherHostDir],
        standalone: false,
      })
      class HostComp implements OnInit, AfterViewInit, AfterViewChecked {
        ngOnInit() {
          logs.push('HostComp - ngOnInit');
        }

        ngAfterViewInit() {
          logs.push('HostComp - ngAfterViewInit');
        }

        ngAfterViewChecked() {
          logs.push('HostComp - ngAfterViewChecked');
        }
      }

      const {fixture} = createRootComponent(HostComp);
      fixture.detectChanges();

      expect(logs).toEqual([
        'HostDir - ngOnInit',
        'OtherHostDir - ngOnInit',
        'HostComp - ngOnInit',
        'HostDir - ngAfterViewInit',
        'HostDir - ngAfterViewChecked',
        'OtherHostDir - ngAfterViewInit',
        'OtherHostDir - ngAfterViewChecked',
        'HostComp - ngAfterViewInit',
        'HostComp - ngAfterViewChecked',
      ]);
    });

    describe('host bindings', () => {
      it('should support host attribute bindings coming from the host directives', () => {
        @Directive({
          host: {
            '[attr.host-dir-only]': 'value',
            '[attr.shadowed-attr]': 'value',
          },
        })
        class HostDir {
          value = 'host-dir';
        }

        @Directive({
          host: {
            '[attr.other-host-dir-only]': 'value',
            '[attr.shadowed-attr]': 'value',
          },
        })
        class OtherHostDir {
          value = 'other-host-dir';
        }

        @Component({
          selector: 'host-comp',
          host: {
            '[attr.shadowed-attr]': 'value',
          },
          hostDirectives: [HostDir, OtherHostDir],
          standalone: false,
        })
        class HostComp {
          value = 'host';
          hostDir = inject(HostDir);
          otherHostDir = inject(OtherHostDir);
        }

        const {fixture, ref} = createRootComponent(HostComp);
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).toContain(
          '<host-comp host-dir-only="host-dir" shadowed-attr="host" ' +
            'other-host-dir-only="other-host-dir"></host-comp>',
        );

        ref.instance.hostDir.value = 'host-dir-changed';
        ref.instance.otherHostDir.value = 'other-host-dir-changed';
        ref.instance.value = 'host-changed';
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML).toContain(
          '<host-comp host-dir-only="host-dir-changed" shadowed-attr="host-changed" ' +
            'other-host-dir-only="other-host-dir-changed"></host-comp>',
        );
      });

      it('should support host event bindings coming from the host directives', () => {
        const logs: string[] = [];

        @Directive({host: {'(click)': 'handleClick()'}})
        class HostDir {
          handleClick() {
            logs.push('HostDir');
          }
        }

        @Directive({host: {'(click)': 'handleClick()'}})
        class OtherHostDir {
          handleClick() {
            logs.push('OtherHostDir');
          }
        }

        @Component({
          selector: 'host-comp',
          host: {'(click)': 'handleClick()'},
          hostDirectives: [HostDir, OtherHostDir],
          standalone: false,
        })
        class HostComp {
          handleClick() {
            logs.push('HostComp');
          }
        }

        const {fixture, ref} = createRootComponent(HostComp);

        ref.location.nativeElement.click();
        fixture.detectChanges();

        expect(logs).toEqual(['HostDir', 'OtherHostDir', 'HostComp']);
      });

      it('should have the host bindings of the root component take precedence over the ones from the host directives', () => {
        @Directive({host: {'id': 'host-dir'}})
        class HostDir {}

        @Directive({host: {'id': 'other-host-dir'}})
        class OtherHostDir {}

        @Component({
          template: '',
          host: {'id': 'host'},
          hostDirectives: [HostDir, OtherHostDir],
          standalone: false,
        })
        class HostComp {}

        const {ref, fixture} = createRootComponent(HostComp);
        fixture.detectChanges();
        expect(ref.location.nativeElement.getAttribute('id')).toBe('host');
      });
    });

    describe('dependency injection', () => {
      it('should allow the host directive to inject the root component', () => {
        let hostDirInstance!: HostDir;

        @Directive()
        class HostDir {
          host = inject(HostComp);

          constructor() {
            hostDirInstance = this;
          }
        }

        @Component({
          hostDirectives: [HostDir],
          template: '',
          standalone: false,
        })
        class HostComp {}

        const {ref} = createRootComponent(HostComp);

        expect(hostDirInstance instanceof HostDir).toBe(true);
        expect(hostDirInstance.host).toBe(ref.instance);
      });

      it('should allow the root component to inject the host directive', () => {
        let hostDirInstance!: HostDir;

        @Directive()
        class HostDir {
          constructor() {
            hostDirInstance = this;
          }
        }

        @Component({
          hostDirectives: [HostDir],
          template: '',
          standalone: false,
        })
        class HostComp {
          hostDir = inject(HostDir);
        }

        const {ref} = createRootComponent(HostComp);
        expect(hostDirInstance instanceof HostDir).toBe(true);
        expect(ref.instance.hostDir).toBe(hostDirInstance);
      });

      it('should give precedence to the DI tokens from the root component over the host directive tokens', () => {
        const token = new InjectionToken<string>('token');
        let hostInstance!: HostComp;
        let firstHostDirInstance!: FirstHostDir;
        let secondHostDirInstance!: SecondHostDir;

        @Directive({providers: [{provide: token, useValue: 'SecondDir'}]})
        class SecondHostDir {
          tokenValue = inject(token);

          constructor() {
            secondHostDirInstance = this;
          }
        }

        @Directive({
          hostDirectives: [SecondHostDir],
          providers: [{provide: token, useValue: 'FirstDir'}],
        })
        class FirstHostDir {
          tokenValue = inject(token);

          constructor() {
            firstHostDirInstance = this;
          }
        }

        @Component({
          template: '',
          hostDirectives: [FirstHostDir],
          providers: [{provide: token, useValue: 'HostDir'}],
          standalone: false,
        })
        class HostComp {
          tokenValue = inject(token);

          constructor() {
            hostInstance = this;
          }
        }

        createRootComponent(HostComp);

        expect(hostInstance instanceof HostComp).toBe(true);
        expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
        expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

        expect(hostInstance.tokenValue).toBe('HostDir');
        expect(firstHostDirInstance.tokenValue).toBe('HostDir');
        expect(secondHostDirInstance.tokenValue).toBe('HostDir');
      });

      it('should allow the root component to inject tokens from the host directives', () => {
        const firstToken = new InjectionToken<string>('firstToken');
        const secondToken = new InjectionToken<string>('secondToken');

        @Directive({providers: [{provide: secondToken, useValue: 'SecondDir'}]})
        class SecondHostDir {}

        @Directive({
          hostDirectives: [SecondHostDir],
          providers: [{provide: firstToken, useValue: 'FirstDir'}],
        })
        class FirstHostDir {}

        @Component({
          template: '',
          hostDirectives: [FirstHostDir],
          standalone: false,
        })
        class HostComp {
          firstTokenValue = inject(firstToken);
          secondTokenValue = inject(secondToken);
        }

        const {ref} = createRootComponent(HostComp);
        expect(ref.instance.firstTokenValue).toBe('FirstDir');
        expect(ref.instance.secondTokenValue).toBe('SecondDir');
      });
    });

    describe('inputs', () => {
      it('should set inputs on root component and all host directive instances using `setInput`', () => {
        let hostDirInstance!: HostDir;
        let otherHostDirInstance!: OtherHostDir;

        @Directive()
        class HostDir {
          @Input() color?: string;

          constructor() {
            hostDirInstance = this;
          }
        }

        @Directive()
        class OtherHostDir {
          @Input() color?: string;

          constructor() {
            otherHostDirInstance = this;
          }
        }

        @Component({
          selector: 'host-comp',
          hostDirectives: [
            {
              directive: HostDir,
              inputs: ['color'],
            },
            {
              directive: OtherHostDir,
              inputs: ['color'],
            },
          ],
          standalone: false,
        })
        class HostComp {
          @Input() color?: string;
        }

        const {fixture, ref} = createRootComponent(HostComp);
        fixture.detectChanges();

        expect(hostDirInstance.color).toBe(undefined);
        expect(otherHostDirInstance.color).toBe(undefined);
        expect(ref.instance.color).toBe(undefined);

        ref.setInput('color', 'green');

        expect(hostDirInstance.color).toBe('green');
        expect(otherHostDirInstance.color).toBe('green');
        expect(ref.instance.color).toBe('green');
      });

      it('should set inputs that only exist on a host directive when using `setInput`', () => {
        let hostDirInstance!: HostDir;

        @Directive()
        class HostDir {
          @Input() color?: string;

          constructor() {
            hostDirInstance = this;
          }
        }

        @Component({
          selector: 'host-comp',
          hostDirectives: [
            {
              directive: HostDir,
              inputs: ['color'],
            },
          ],
          standalone: false,
        })
        class HostComp {
          color?: string; // Note: intentionally not marked as @Input.
        }

        const {ref} = createRootComponent(HostComp);

        expect(hostDirInstance.color).toBe(undefined);
        expect(ref.instance.color).toBe(undefined);

        ref.setInput('color', 'color');

        expect(hostDirInstance.color).toBe('color');
        expect(ref.instance.color).toBe(undefined);
      });

      it('should set inputs that only exist on the root component when using `setInput`', () => {
        let hostDirInstance!: HostDir;

        @Directive()
        class HostDir {
          @Input() color?: string;

          constructor() {
            hostDirInstance = this;
          }
        }

        @Component({
          selector: 'host-comp',
          hostDirectives: [HostDir],
          standalone: false,
        })
        class HostComp {
          @Input() color?: string;
        }

        const {ref, fixture} = createRootComponent(HostComp);
        fixture.detectChanges();

        expect(hostDirInstance.color).toBe(undefined);
        expect(ref.instance.color).toBe(undefined);

        ref.setInput('color', 'green');

        expect(hostDirInstance.color).toBe(undefined);
        expect(ref.instance.color).toBe('green');
      });

      it('should use the input name alias in `setInput`', () => {
        let hostDirInstance!: HostDir;

        @Directive()
        class HostDir {
          @Input('alias') color?: string;

          constructor() {
            hostDirInstance = this;
          }
        }

        @Component({
          selector: 'host-comp',
          hostDirectives: [
            {
              directive: HostDir,
              inputs: ['alias: customAlias'],
            },
          ],
          standalone: false,
        })
        class HostComp {}

        const {ref, fixture} = createRootComponent(HostComp);
        fixture.detectChanges();

        expect(hostDirInstance.color).toBe(undefined);

        // Check that the old alias or the original name aren't available first.
        expect(() => ref.setInput('color', 'hello')).toThrowError(
          /NG0303: Can't set value of the 'color' input/,
        );
        expect(() => ref.setInput('alias', 'hello')).toThrowError(
          /NG0303: Can't set value of the 'alias' input/,
        );
        expect(hostDirInstance.color).toBe(undefined);

        // Check the alias.
        ref.setInput('customAlias', 'hello');
        expect(hostDirInstance.color).toBe('hello');
      });

      it('should invoke ngOnChanges when setting host directive inputs using setInput', () => {
        let latestChanges: SimpleChanges | undefined;

        @Directive()
        class HostDir implements OnChanges {
          @Input('alias') color?: string;

          ngOnChanges(changes: SimpleChanges) {
            latestChanges = changes;
          }
        }

        @Component({
          selector: 'host-comp',
          hostDirectives: [{directive: HostDir, inputs: ['alias: customAlias']}],
          standalone: false,
        })
        class HostComp {}

        const {ref, fixture} = createRootComponent(HostComp);

        expect(latestChanges).toBe(undefined);

        ref.setInput('customAlias', 'red');
        fixture.detectChanges();

        expect(latestChanges).toEqual(
          jasmine.objectContaining({
            color: jasmine.objectContaining({
              previousValue: undefined,
              currentValue: 'red',
              firstChange: true,
            }),
          }),
        );

        ref.setInput('customAlias', 'green');
        fixture.detectChanges();

        expect(latestChanges).toEqual(
          jasmine.objectContaining({
            color: jasmine.objectContaining({
              previousValue: 'red',
              currentValue: 'green',
              firstChange: false,
            }),
          }),
        );
      });
    });

    it('should throw an error if a host directive is applied multiple times to a root component', () => {
      @Directive()
      class DuplicateHostDir {}

      @Directive({hostDirectives: [DuplicateHostDir]})
      class HostDir {}

      @Directive({hostDirectives: [HostDir, DuplicateHostDir]})
      class Dir {}

      @Component({
        hostDirectives: [Dir],
        standalone: false,
      })
      class HostComp {}

      expect(() => createRootComponent(HostComp)).toThrowError(
        'NG0309: Directive DuplicateHostDir matches multiple times on the same element. Directives can only match an element once.',
      );
    });
  });

  describe('invalid usage validations', () => {
    it('should throw an error if the metadata of a host directive cannot be resolved', () => {
      class HostDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0307: Could not resolve metadata for host directive HostDir. ' +
          'Make sure that the HostDir class is annotated with an @Directive decorator.',
      );
    });

    it('should throw an error if a host directive is not standalone', () => {
      @Directive({standalone: false})
      class HostDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0308: Host directive HostDir must be standalone.',
      );
    });

    it('should throw an error if a host directive matches multiple times in a template', () => {
      @Directive({selector: '[dir]'})
      class HostDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
      })
      class Dir {}

      @Component({template: '<div dir></div>', imports: [HostDir, Dir]})
      class App {}

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0309: Directive HostDir matches multiple times on the same element. Directives can only match an element once.',
      );
    });

    it('should throw an error if a host directive matches multiple times on a component', () => {
      @Directive({selector: '[dir]'})
      class HostDir {}

      @Component({
        selector: 'comp',
        hostDirectives: [HostDir],
        template: '',
      })
      class Comp {}

      const baseAppMetadata = {
        template: '<comp dir></comp>',
      };

      const expectedError =
        'NG0309: Directive HostDir matches multiple times on the same element. Directives can only match an element once.';

      // Note: the definition order in `imports` seems to affect the
      // directive matching order so we test both scenarios.
      expect(() => {
        @Component({
          ...baseAppMetadata,
          imports: [Comp, HostDir],
        })
        class App {}
        TestBed.createComponent(App);
      }).toThrowError(expectedError);

      expect(() => {
        @Component({
          ...baseAppMetadata,
          imports: [HostDir, Comp],
        })
        class App {}
        TestBed.createComponent(App);
      }).toThrowError(expectedError);
    });

    it('should throw an error if a host directive appears multiple times in a chain', () => {
      @Directive()
      class DuplicateHostDir {}

      @Directive({hostDirectives: [DuplicateHostDir]})
      class HostDir {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir, DuplicateHostDir],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0309: Directive DuplicateHostDir matches multiple times on the same element. Directives can only match an element once.',
      );
    });

    it('should throw an error if a host directive is a component', () => {
      @Component({template: '', selector: 'host-comp'})
      class HostComp {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostComp],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0310: Host directive HostComp cannot be a component.',
      );
    });

    it('should throw an error if a host directive output does not exist', () => {
      @Directive()
      class HostDir {
        @Output() foo = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {
            directive: HostDir,
            outputs: ['doesNotExist'],
          },
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0311: Directive HostDir does not have an output with a public name of doesNotExist.',
      );
    });

    it('should throw an error if a host directive output alias does not exist', () => {
      @Directive()
      class HostDir {
        @Output('alias') foo = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {
            directive: HostDir,
            outputs: ['foo'],
          },
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0311: Directive HostDir does not have an output with a public name of foo.',
      );
    });

    it('should throw an error if a host directive input does not exist', () => {
      @Directive()
      class HostDir {
        @Input() foo: any;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {
            directive: HostDir,
            inputs: ['doesNotExist'],
          },
        ],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0311: Directive HostDir does not have an input with a public name of doesNotExist.',
      );
    });

    it('should throw an error if a host directive input alias does not exist', () => {
      @Directive()
      class HostDir {
        @Input('alias') foo: any;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['foo']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0311: Directive HostDir does not have an input with a public name of foo.',
      );
    });

    it('should throw an error if a host directive tries to alias to an existing input', () => {
      @Directive({selector: '[host-dir]'})
      class HostDir {
        @Input('colorAlias') color?: string;
        @Input() buttonColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(
        'NG0312: Cannot alias input colorAlias of host directive HostDir ' +
          'to buttonColor, because it already has a different input with the same public name.',
      );
    });

    it('should throw an error if a host directive tries to alias to an existing input alias', () => {
      @Directive({selector: '[host-dir]'})
      class HostDir {
        @Input('colorAlias') color?: string;
        @Input('buttonColorAlias') buttonColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColorAlias']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir buttonColorAlias="red"></button>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(
        'NG0312: Cannot alias input colorAlias of host directive HostDir ' +
          'to buttonColorAlias, because it already has a different input with the same public name.',
      );
    });

    it('should not throw if a host directive input aliases to the same name', () => {
      @Directive({selector: '[host-dir]'})
      class HostDir {
        @Input('color') color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir buttonColor="red"></button>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should throw an error if a host directive tries to alias to an existing output alias', () => {
      @Directive({selector: '[host-dir]'})
      class HostDir {
        @Output('clickedAlias') clicked = new EventEmitter();
        @Output('tappedAlias') tapped = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['clickedAlias: tappedAlias']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir (tappedAlias)="handleTap()"></button>',
        standalone: false,
      })
      class App {
        handleTap() {}
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(
        'NG0312: Cannot alias output clickedAlias of host directive HostDir ' +
          'to tappedAlias, because it already has a different output with the same public name.',
      );
    });

    it('should not throw if a host directive output aliases to the same name', () => {
      @Directive({selector: '[host-dir]'})
      class HostDir {
        @Output('clicked') clicked = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['clicked: wasClicked']}],
        standalone: false,
      })
      class Dir {}

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir (wasClicked)="handleClick()"></button>',
        standalone: false,
      })
      class App {
        handleClick() {}
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not throw when exposing an aliased binding', () => {
      @Directive({
        outputs: ['opened: triggerOpened'],
        selector: '[trigger]',
      })
      class Trigger {
        opened = new EventEmitter();
      }

      @Directive({
        selector: '[host]',
        hostDirectives: [{directive: Trigger, outputs: ['triggerOpened']}],
      })
      class Host {}

      @Component({template: '<div host></div>', imports: [Host]})
      class App {}

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not throw when exposing an inherited aliased binding', () => {
      @Directive()
      abstract class Base {
        opened = new EventEmitter();
      }

      @Directive({
        outputs: ['opened: triggerOpened'],
        selector: '[trigger]',
      })
      class Trigger extends Base {}

      @Directive({
        selector: '[host]',
        hostDirectives: [{directive: Trigger, outputs: ['triggerOpened: hostOpened']}],
      })
      class Host {}

      @Component({template: '<div host></div>', imports: [Host]})
      class App {}

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should throw an error if a duplicate directive is inherited', () => {
      @Directive()
      class HostDir {}

      @Directive({hostDirectives: [HostDir]})
      class Grandparent {}

      @Directive()
      class Parent extends Grandparent {}

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: false,
      })
      class Dir extends Parent {}

      @Component({
        template: '<div dir></div>',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App)).toThrowError(
        'NG0309: Directive HostDir matches multiple times on the same element. Directives can only match an element once.',
      );
    });
  });
});

/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewChecked, AfterViewInit, Component, Directive, ElementRef, EventEmitter, forwardRef, inject, Inject, InjectionToken, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {getComponent, getDirectives} from '../../src/render3/util/discovery_utils';

/**
 * Temporary `any` used for metadata until `hostDirectives` is enabled publicly.
 * TODO(crisbeto): remove this once host directives are enabled in the public API.
 */
type HostDirectiveAny = any;

describe('host directives', () => {
  it('should apply a basic host directive', () => {
    const logs: string[] = [];

    @Directive({
      standalone: true,
      host: {'host-dir-attr': '', 'class': 'host-dir', 'style': 'height: 50px'}
    })
    class HostDir {
      constructor() {
        logs.push('HostDir');
      }
    }

    @Directive({
      selector: '[dir]',
      host: {'host-attr': '', 'class': 'dir', 'style': 'width: 50px'},
      hostDirectives: [HostDir]
    } as HostDirectiveAny)
    class Dir {
      constructor() {
        logs.push('Dir');
      }
    }

    @Component({template: '<div dir></div>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(logs).toEqual(['HostDir', 'Dir']);
    expect(fixture.nativeElement.innerHTML)
        .toBe(
            '<div host-dir-attr="" host-attr="" dir="" ' +
            'class="host-dir dir" style="height: 50px; width: 50px;"></div>');
  });

  it('should apply a host directive referenced through a forwardRef', () => {
    const logs: string[] = [];

    @Directive({
      selector: '[dir]',
      hostDirectives: [forwardRef(() => HostDir), {directive: forwardRef(() => OtherHostDir)}]
    } as HostDirectiveAny)
    class Dir {
      constructor() {
        logs.push('Dir');
      }
    }

    @Directive({standalone: true})
    class HostDir {
      constructor() {
        logs.push('HostDir');
      }
    }

    @Directive({standalone: true})
    class OtherHostDir {
      constructor() {
        logs.push('OtherHostDir');
      }
    }

    @Component({template: '<div dir></div>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(logs).toEqual(['HostDir', 'OtherHostDir', 'Dir']);
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
      standalone: true
    })
    class Chain1_3 {
      constructor(@Inject(token) tokenValue: string) {
        diTokenValue = tokenValue;
        logs.push('Chain1 - level 3');
      }
    }

    @Directive({
      standalone: true,
      hostDirectives: [Chain1_3],
    } as HostDirectiveAny)
    class Chain1_2 {
      constructor() {
        logs.push('Chain1 - level 2');
      }
    }

    @Directive({
      standalone: true,
      hostDirectives: [Chain1_2],
    } as HostDirectiveAny)
    class Chain1 {
      constructor() {
        logs.push('Chain1 - level 1');
      }
    }

    @Directive({
      standalone: true,
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
      standalone: true,
      hostDirectives: [Chain2_2],
    } as HostDirectiveAny)
    class Chain2 {
      constructor() {
        logs.push('Chain2 - level 1');
      }
    }

    @Directive({standalone: true})
    class Chain3_2 {
      constructor() {
        logs.push('Chain3 - level 2');
      }
    }

    @Directive({standalone: true, hostDirectives: [Chain3_2]} as HostDirectiveAny)
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
    } as HostDirectiveAny)
    class MyComp {
      constructor() {
        logs.push('MyComp');
      }
    }

    @Directive({standalone: true})
    class SelectorMatchedHostDir {
      constructor() {
        logs.push('SelectorMatchedHostDir');
      }
    }

    @Directive({
      selector: '[selector-matched-dir]',
      hostDirectives: [SelectorMatchedHostDir],
    } as HostDirectiveAny)
    class SelectorMatchedDir {
      constructor() {
        logs.push('SelectorMatchedDir');
      }
    }

    @Component({template: '<my-comp selector-matched-dir></my-comp>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, MyComp, SelectorMatchedDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(diTokenValue!).toBe('host value');
    expect(fixture.nativeElement.innerHTML)
        .toBe('<my-comp id="host-id" selector-matched-dir="" class="leaf middle host"></my-comp>');
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

    @Directive({standalone: true})
    class SecondHostDir {
      constructor() {
        secondHostDirInstance = this;
      }
    }

    @Directive({standalone: true, hostDirectives: [SecondHostDir]} as HostDirectiveAny)
    class FirstHostDir {
      constructor() {
        firstHostDirInstance = this;
      }
    }

    @Directive({selector: '[dir]', hostDirectives: [FirstHostDir]} as HostDirectiveAny)
    class Host {
      constructor() {
        hostInstance = this;
      }
    }

    @Component({template: '<div dir></div>'})
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
    @Directive({standalone: true, exportAs: 'secondHost'})
    class SecondHostDir {
      name = 'SecondHost';
    }

    @Directive(
        {standalone: true, hostDirectives: [SecondHostDir], exportAs: 'firstHost'} as
        HostDirectiveAny)
    class FirstHostDir {
      name = 'FirstHost';
    }

    @Directive({selector: '[dir]', hostDirectives: [FirstHostDir]} as HostDirectiveAny)
    class Host {
    }

    @Component({
      template: `
        <div
          dir
          #firstHost="firstHost"
          #secondHost="secondHost">{{firstHost.name}} | {{secondHost.name}}</div>
      `
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, Host]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('FirstHost | SecondHost');
  });

  describe('lifecycle hooks', () => {
    it('should invoke lifecycle hooks from the host directives', () => {
      const logs: string[] = [];

      @Directive({standalone: true})
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

      @Directive({standalone: true})
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

      @Directive({selector: '[dir]', hostDirectives: [HostDir, OtherHostDir]} as HostDirectiveAny)
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

      @Component({template: '<div dir></div>'})
      class App {
      }

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
      @Directive({standalone: true})
      abstract class LogsLifecycles implements OnInit, AfterViewInit {
        abstract name: string;

        ngOnInit() {
          logs.push(`${this.name} - ngOnInit`);
        }

        ngAfterViewInit() {
          logs.push(`${this.name} - ngAfterViewInit`);
        }
      }

      @Directive({standalone: true})
      class ChildHostDir extends LogsLifecycles {
        override name = 'ChildHostDir';
      }

      @Directive({standalone: true})
      class OtherChildHostDir extends LogsLifecycles {
        override name = 'OtherChildHostDir';
      }

      @Component({
        selector: 'child',
        hostDirectives: [ChildHostDir, OtherChildHostDir],
      } as HostDirectiveAny)
      class Child extends LogsLifecycles {
        override name = 'Child';
      }

      @Directive({standalone: true})
      class ParentHostDir extends LogsLifecycles {
        override name = 'ParentHostDir';
      }

      @Directive({standalone: true})
      class OtherParentHostDir extends LogsLifecycles {
        override name = 'OtherParentHostDir';
      }

      @Component({
        selector: 'parent',
        hostDirectives: [ParentHostDir, OtherParentHostDir],
        template: '<child plain-dir="PlainDir on child"></child>',
      } as HostDirectiveAny)
      class Parent extends LogsLifecycles {
        override name = 'Parent';
      }

      @Directive({selector: '[plain-dir]'})
      class PlainDir extends LogsLifecycles {
        @Input('plain-dir') override name = '';
      }

      @Component({template: '<parent plain-dir="PlainDir on parent"></parent>'})
      class App {
      }

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
      @Directive({standalone: true})
      abstract class LogsLifecycles implements OnChanges {
        @Input() someInput: any;
        abstract name: string;

        ngOnChanges(changes: SimpleChanges) {
          logs.push(`${this.name} - ${changes.someInput.currentValue}`);
        }
      }

      @Directive({standalone: true})
      class HostDir extends LogsLifecycles {
        override name = 'HostDir';
      }

      @Directive({standalone: true})
      class OtherHostDir extends LogsLifecycles {
        override name = 'OtherHostDir';
      }

      @Component({
        selector: 'host-comp',
        hostDirectives: [
          {directive: HostDir, inputs: ['someInput']},
          {directive: OtherHostDir, inputs: ['someInput']},
        ],
      } as HostDirectiveAny)
      class HostComp extends LogsLifecycles {
        override name = 'HostComp';
      }

      @Directive({selector: '[plain-dir]'})
      class PlainDir extends LogsLifecycles {
        override name = 'PlainDir';
      }

      @Component({
        template: '<host-comp plain-dir="PlainDir" [someInput]="inputValue"></host-comp>',
      })
      class App {
        inputValue = 'hello';
      }

      TestBed.configureTestingModule({declarations: [App, HostComp, PlainDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(logs).toEqual(
          ['HostDir - hello', 'OtherHostDir - hello', 'HostComp - hello', 'PlainDir - hello']);

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

      @Directive({standalone: true, host: {'host-dir-attr': 'true', '(click)': 'handleClick()'}})
      class HostDir {
        handleClick() {
          clicks.push('HostDir');
        }
      }

      @Directive(
          {standalone: true, host: {'other-host-dir-attr': 'true', '(click)': 'handleClick()'}})
      class OtherHostDir {
        handleClick() {
          clicks.push('OtherHostDir');
        }
      }

      @Directive({
        selector: '[dir]',
        host: {'host-attr': 'true', '(click)': 'handleClick()'},
        hostDirectives: [HostDir, OtherHostDir]
      } as HostDirectiveAny)
      class Dir {
        handleClick() {
          clicks.push('Dir');
        }
      }

      @Component({template: '<button dir></button>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const host = fixture.nativeElement.querySelector('[dir]');

      expect(host.outerHTML)
          .toBe(
              '<button host-dir-attr="true" other-host-dir-attr="true" host-attr="true" dir=""></button>');

      host.click();
      fixture.detectChanges();

      expect(clicks).toEqual(['HostDir', 'OtherHostDir', 'Dir']);
    });

    it('should have the host bindings take precedence over the ones from the host directives',
       () => {
         @Directive({standalone: true, host: {'id': 'host-dir'}})
         class HostDir {
         }

         @Directive({standalone: true, host: {'id': 'other-host-dir'}})
         class OtherHostDir {
         }

         @Directive(
             {selector: '[dir]', host: {'id': 'host'}, hostDirectives: [HostDir, OtherHostDir]} as
             HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<div dir></div>'})
         class App {
         }

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

      @Directive({standalone: true})
      class SecondHostDir {
        constructor() {
          secondHostDirInstance = this;
        }
      }

      @Directive({standalone: true, hostDirectives: [SecondHostDir]} as HostDirectiveAny)
      class FirstHostDir {
        constructor() {
          firstHostDirInstance = this;
        }
      }

      @Directive({selector: '[dir]', hostDirectives: [FirstHostDir]} as HostDirectiveAny)
      class Host {
        firstHostDir = inject(FirstHostDir);
        secondHostDir = inject(SecondHostDir);

        constructor() {
          hostInstance = this;
        }
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

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

      @Component({selector: 'child', template: ''})
      class Child {
        hostDir = inject(HostDir);
      }

      @Directive({standalone: true})
      class HostDir {
        constructor() {
          hostDirectiveInstance = this;
        }
      }

      @Component({
        selector: 'host',
        template: '<child></child>',
        hostDirectives: [HostDir],
      } as HostDirectiveAny)
      class Host {
        @ViewChild(Child) child!: Child;
      }

      @Component({template: '<host></host>'})
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

      @Directive({standalone: true})
      class SecondHostDir {
        host = inject(Host);

        constructor() {
          secondHostDirInstance = this;
        }
      }

      @Directive({standalone: true, hostDirectives: [SecondHostDir]} as HostDirectiveAny)
      class FirstHostDir {
        host = inject(Host);

        constructor() {
          firstHostDirInstance = this;
        }
      }

      @Directive({selector: '[dir]', hostDirectives: [FirstHostDir]} as HostDirectiveAny)
      class Host {
        constructor() {
          hostInstance = this;
        }
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(hostInstance instanceof Host).toBe(true);
      expect(firstHostDirInstance instanceof FirstHostDir).toBe(true);
      expect(secondHostDirInstance instanceof SecondHostDir).toBe(true);

      expect(firstHostDirInstance.host).toBe(hostInstance);
      expect(secondHostDirInstance.host).toBe(hostInstance);
    });

    it('should give precedence to the DI tokens from the host over the host directive tokens',
       () => {
         const token = new InjectionToken<string>('token');
         let hostInstance!: Host;
         let firstHostDirInstance!: FirstHostDir;
         let secondHostDirInstance!: SecondHostDir;

         @Directive({standalone: true, providers: [{provide: token, useValue: 'SecondDir'}]})
         class SecondHostDir {
           tokenValue = inject(token);

           constructor() {
             secondHostDirInstance = this;
           }
         }

         @Directive({
           standalone: true,
           hostDirectives: [SecondHostDir],
           providers: [{provide: token, useValue: 'FirstDir'}]
         } as HostDirectiveAny)
         class FirstHostDir {
           tokenValue = inject(token);

           constructor() {
             firstHostDirInstance = this;
           }
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [FirstHostDir],
           providers: [{provide: token, useValue: 'HostDir'}]
         } as HostDirectiveAny)
         class Host {
           tokenValue = inject(token);

           constructor() {
             hostInstance = this;
           }
         }

         @Component({template: '<div dir></div>'})
         class App {
         }

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

      @Directive({standalone: true, providers: [{provide: secondToken, useValue: 'SecondDir'}]})
      class SecondHostDir {
      }

      @Directive({
        standalone: true,
        hostDirectives: [SecondHostDir],
        providers: [{provide: firstToken, useValue: 'FirstDir'}]
      } as HostDirectiveAny)
      class FirstHostDir {
      }

      @Directive({selector: '[dir]', hostDirectives: [FirstHostDir]} as HostDirectiveAny)
      class Host {
        firstTokenValue = inject(firstToken);
        secondTokenValue = inject(secondToken);
      }

      @Component({template: '<div dir></div>'})
      class App {
        @ViewChild(Host) host!: Host;
      }

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.host.firstTokenValue).toBe('FirstDir');
      expect(fixture.componentInstance.host.secondTokenValue).toBe('SecondDir');
    });

    it('should not give precedence to tokens from host directives over ones in viewProviders',
       () => {
         const token = new InjectionToken<string>('token');
         let tokenValue: string|undefined;

         @Directive({standalone: true, providers: [{provide: token, useValue: 'host-dir'}]})
         class HostDir {
         }

         @Component({
           selector: 'host',
           hostDirectives: [HostDir],
           providers: [{provide: token, useValue: 'host'}],
           template: '<span child></span>',
         } as HostDirectiveAny)
         class Host {
         }

         @Directive({selector: '[child]'})
         class Child {
           constructor() {
             tokenValue = inject(token);
           }
         }

         @Component({template: '<host></host>'})
         class App {
         }

         TestBed.configureTestingModule({declarations: [App, Host, Child]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();

         expect(tokenValue).toBe('host');
       });

    it('should not be able to access viewProviders from the host in the host directives', () => {
      const token = new InjectionToken<string>('token');
      let tokenValue: string|null = null;

      @Directive({standalone: true})
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
      } as HostDirectiveAny)
      class Host {
      }

      @Component({template: '<host></host>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Host]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(tokenValue).toBe(null);
    });

    it('should throw a circular dependency error if a host and a host directive inject each other',
       () => {
         @Directive({standalone: true})
         class HostDir {
           host = inject(Host);
         }

         @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
         class Host {
           hostDir = inject(HostDir);
         }

         @Component({template: '<div dir></div>'})
         class App {
         }

         TestBed.configureTestingModule({declarations: [App, Host]});
         expect(() => TestBed.createComponent(App))
             .toThrowError(/NG0200: Circular dependency in DI detected for HostDir/);
       });
  });

  describe('outputs', () => {
    it('should not emit to an output of a host directive that has not been exposed', () => {
      let hostDirectiveInstance: HostDir|undefined;

      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit()'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<void>();

        constructor() {
          hostDirectiveInstance = this;
        }
      }

      @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir (hasBeenClicked)="spy()"></button>'})
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
      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          outputs: ['hasBeenClicked'],
        }]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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
      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked: wasClicked']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({
        template: `
          <button dir (wasClicked)="validSpy($event)" (hasBeenClicked)="invalidSpy($event)"></button>`
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
      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class HostDir {
        @Output('wasClicked') hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [
          {directive: HostDir, outputs: ['wasClicked: clickOccurred']},
        ]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({
        template: `
          <button
            dir
            (clickOccurred)="validSpy($event)"
            (hasBeenClicked)="invalidSpy($event)"></button>`
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

    it('should emit to an output of a host that has the same name as a non-exposed output of a host directive',
       () => {
         @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
         class HostDir {
           @Output() hasBeenClicked = new EventEmitter<string>();
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [HostDir],
           host: {'(click)': 'hasBeenClicked.emit("Dir")'}
         } as HostDirectiveAny)
         class Dir {
           @Output() hasBeenClicked = new EventEmitter<string>();
         }

         @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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

    it('should emit to an output of a host that has the same name as an exposed output of a host directive',
       () => {
         @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
         class HostDir {
           @Output() hasBeenClicked = new EventEmitter<string>();
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked']}],
           host: {'(click)': 'hasBeenClicked.emit("Dir")'}
         } as HostDirectiveAny)
         class Dir {
           @Output() hasBeenClicked = new EventEmitter<string>();
         }

         @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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

    it('should emit to an output of a host that has the same name as the alias of a host directive output',
       () => {
         @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("HostDir")'}})
         class HostDir {
           @Output() hasBeenClicked = new EventEmitter<string>();
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked: wasClicked']}],
           host: {'(click)': 'wasClicked.emit("Dir")'}
         } as HostDirectiveAny)
         class Dir {
           @Output() wasClicked = new EventEmitter<string>();
         }

         @Component({template: '<button dir (wasClicked)="spy($event)"></button>'})
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
      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit()'}})
      class HostDir {
        @Output() hasBeenClicked = new EventEmitter<void>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked', 'hasBeenClicked']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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
      @Directive({host: {'(click)': 'hasBeenClicked.emit("hello")'}})
      class ParentDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({standalone: true})
      class HostDir extends ParentDir {
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['hasBeenClicked']}],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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
      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("ExposedHostDir")'}})
      class ExposedHostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({standalone: true, host: {'(click)': 'hasBeenClicked.emit("UnExposedHostDir")'}})
      class UnExposedHostDir {
        @Output() hasBeenClicked = new EventEmitter<string>();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: ExposedHostDir, outputs: ['hasBeenClicked']}, UnExposedHostDir]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir (hasBeenClicked)="spy($event)"></button>'})
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

    it('should emit to outputs from different host directives that have been aliased to the same name',
       () => {
         @Directive({
           standalone: true,
           host: {'(click)': 'firstHasBeenClicked.emit("FirstHostDir")'},
         })
         class FirstHostDir {
           @Output() firstHasBeenClicked = new EventEmitter<string>();
         }

         @Directive({
           standalone: true,
           host: {'(click)': 'secondHasBeenClicked.emit("SecondHostDir")'},
         })
         class SecondHostDir {
           @Output() secondHasBeenClicked = new EventEmitter<string>();
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [
             {directive: FirstHostDir, outputs: ['firstHasBeenClicked: wasClicked']},
             {directive: SecondHostDir, outputs: ['secondHasBeenClicked: wasClicked']}
           ]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<button dir (wasClicked)="spy($event)"></button>'})
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
  });

  describe('inputs', () => {
    it('should not set an input of a host directive that has not been exposed', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
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
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive(
          {selector: '[dir]', hostDirectives: [{directive: HostDir, inputs: ['color']}]} as
          HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
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
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [buttonColor]="color"></button>'})
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
      @Directive({standalone: true})
      class HostDir {
        @Input('colorAlias') color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [buttonColor]="color"></button>'})
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

    it('should set an input of a host that has the same name as a non-exposed input of a host directive',
       () => {
         @Directive({standalone: true})
         class HostDir {
           @Input() color?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [HostDir],
         } as HostDirectiveAny)
         class Dir {
           @Input() color?: string;
         }

         @Component({template: '<button dir [color]="color"></button>'})
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

    it('should set an input of a host that has the same name as an exposed input of a host directive',
       () => {
         @Directive({standalone: true})
         class HostDir {
           @Input() color?: string;
         }

         @Directive(
             {selector: '[dir]', hostDirectives: [{directive: HostDir, inputs: ['color']}]} as
             HostDirectiveAny)
         class Dir {
           @Input() color?: string;
         }

         @Component({template: '<button dir [color]="color"></button>'})
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

    it('should set an input of a host that has the same name as the alias of a host directive input',
       () => {
         @Directive({standalone: true})
         class HostDir {
           @Input() color?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}]
         } as HostDirectiveAny)
         class Dir {
           @Input() buttonColor?: string;
         }

         @Component({template: '<button dir [buttonColor]="color"></button>'})
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

      @Directive({standalone: true})
      class HostDir extends ParentDir {
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color']}],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
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
      @Directive({standalone: true})
      class ExposedHostDir {
        @Input() color?: string;
      }

      @Directive({standalone: true})
      class UnExposedHostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: ExposedHostDir, inputs: ['color']}, UnExposedHostDir]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
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

    it('should set inputs from different host directives that have been aliased to the same name',
       () => {
         @Directive({standalone: true})
         class FirstHostDir {
           @Input() firstColor?: string;
         }

         @Directive({standalone: true})
         class SecondHostDir {
           @Input() secondColor?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [
             {directive: FirstHostDir, inputs: ['firstColor: buttonColor']},
             {directive: SecondHostDir, inputs: ['secondColor: buttonColor']}
           ]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<button dir [buttonColor]="color"></button>'})
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
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir color="red"></button>'})
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.hostDir.color).toBe(undefined);
    });

    it('should set a static input of a host directive that has been exposed', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive(
          {selector: '[dir]', hostDirectives: [{directive: HostDir, inputs: ['color']}]} as
          HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir color="red"></button>'})
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');
    });

    it('should set a static input of a host directive that has been exposed under an alias', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input() color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir buttonColor="red"></button>'})
      class App {
        @ViewChild(HostDir) hostDir!: HostDir;
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(fixture.componentInstance.hostDir.color).toBe('red');
    });

    it('should alias to the public name of a static host directive input, not the private one',
       () => {
         @Directive({standalone: true})
         class HostDir {
           @Input('colorAlias') color?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<button dir buttonColor="red"></button>'})
         class App {
           @ViewChild(HostDir) hostDir!: HostDir;
         }

         TestBed.configureTestingModule({declarations: [App, Dir]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();
         expect(fixture.componentInstance.hostDir.color).toBe('red');
       });

    it('should set a static input that was exposed from one host directive, but not another',
       () => {
         @Directive({standalone: true})
         class ExposedHostDir {
           @Input() color?: string;
         }

         @Directive({standalone: true})
         class UnExposedHostDir {
           @Input() color?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [{directive: ExposedHostDir, inputs: ['color']}, UnExposedHostDir]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<button dir color="red"></button>'})
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

    it('should set static inputs from different host directives that have been aliased to the same name',
       () => {
         @Directive({standalone: true})
         class FirstHostDir {
           @Input() firstColor?: string;
         }

         @Directive({standalone: true})
         class SecondHostDir {
           @Input() secondColor?: string;
         }

         @Directive({
           selector: '[dir]',
           hostDirectives: [
             {directive: FirstHostDir, inputs: ['firstColor: buttonColor']},
             {directive: SecondHostDir, inputs: ['secondColor: buttonColor']}
           ]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({template: '<button dir buttonColor="red"></button>'})
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

    it('should not expose an input under its host directive alias if a host directive is not applied',
       () => {
         const logs: string[] = [];

         @Directive({selector: '[host-dir]', standalone: true})
         class HostDir implements OnChanges {
           @Input('colorAlias') color?: string;

           ngOnChanges(changes: SimpleChanges) {
             logs.push(changes.color.currentValue);
           }
         }

         @Directive({
           selector: '[dir]',
           standalone: true,
           hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}]
         } as HostDirectiveAny)
         class Dir {
         }

         @Component({
           standalone: true,
           imports: [Dir, HostDir],
           // Note that `[dir]` doesn't match on the `button` on purpose.
           // The wrong behavior would be if the `buttonColor` binding worked on `host-dir`.
           template: `
              <span dir [buttonColor]="spanValue"></span>
              <button host-dir [buttonColor]="buttonValue"></button>
            `
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
  });

  describe('ngOnChanges', () => {
    it('should invoke ngOnChanges when an input is set on a host directive', () => {
      let firstDirChangeEvent: SimpleChanges|undefined;
      let secondDirChangeEvent: SimpleChanges|undefined;

      @Directive({standalone: true})
      class FirstHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive({standalone: true})
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
          {directive: SecondHostDir, inputs: ['color']}
        ],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));

      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: false,
          previousValue: 'red',
          currentValue: 'green',
        })
      }));
      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: false,
          previousValue: 'red',
          currentValue: 'green',
        })
      }));
    });

    it('should invoke ngOnChanges when an aliased property is set on a host directive', () => {
      let firstDirChangeEvent: SimpleChanges|undefined;
      let secondDirChangeEvent: SimpleChanges|undefined;

      @Directive({standalone: true})
      class FirstHostDir implements OnChanges {
        @Input('firstAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive({standalone: true})
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
          {directive: SecondHostDir, inputs: ['secondAlias: buttonColor']}
        ],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [buttonColor]="color"></button>'})
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));

      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: false,
          previousValue: 'red',
          currentValue: 'green',
        })
      }));
      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: false,
          previousValue: 'red',
          currentValue: 'green',
        })
      }));
    });

    it('should only invoke ngOnChanges on the directives that have exposed an input', () => {
      let firstDirChangeEvent: SimpleChanges|undefined;
      let secondDirChangeEvent: SimpleChanges|undefined;

      @Directive({standalone: true})
      class FirstHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          firstDirChangeEvent = changes;
        }
      }

      @Directive({standalone: true})
      class SecondHostDir implements OnChanges {
        @Input() color?: string;

        ngOnChanges(changes: SimpleChanges) {
          secondDirChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [FirstHostDir, {directive: SecondHostDir, inputs: ['color']}],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir [color]="color"></button>'})
      class App {
        color = 'red';
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(firstDirChangeEvent).toBe(undefined);
      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));

      fixture.componentInstance.color = 'green';
      fixture.detectChanges();

      expect(firstDirChangeEvent).toBe(undefined);
      expect(secondDirChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: false,
          previousValue: 'red',
          currentValue: 'green',
        })
      }));
    });

    it('should invoke ngOnChanges when a static aliased host directive input is set', () => {
      let latestChangeEvent: SimpleChanges|undefined;

      @Directive({standalone: true})
      class HostDir implements OnChanges {
        @Input('colorAlias') color?: string;

        ngOnChanges(changes: SimpleChanges) {
          latestChangeEvent = changes;
        }
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<button dir buttonColor="red"></button>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(latestChangeEvent).toEqual(jasmine.objectContaining({
        color: jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'red',
        })
      }));
    });
  });

  describe('debugging and testing utilities', () => {
    it('should be able to retrieve host directives using ng.getDirectives', () => {
      let hostDirInstance!: HostDir;
      let otherHostDirInstance!: OtherHostDir;
      let plainDirInstance!: PlainDir;

      @Directive({standalone: true})
      class HostDir {
        constructor() {
          hostDirInstance = this;
        }
      }

      @Directive({standalone: true})
      class OtherHostDir {
        constructor() {
          otherHostDirInstance = this;
        }
      }

      @Directive({selector: '[plain-dir]'})
      class PlainDir {
        constructor() {
          plainDirInstance = this;
        }
      }

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir, OtherHostDir],
      } as HostDirectiveAny)
      class Comp {
      }

      @Component({template: '<comp plain-dir></comp>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Comp, PlainDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const componentHost = fixture.nativeElement.querySelector('comp');

      expect(hostDirInstance instanceof HostDir).toBe(true);
      expect(otherHostDirInstance instanceof OtherHostDir).toBe(true);
      expect(plainDirInstance instanceof PlainDir).toBe(true);
      expect(getDirectives(componentHost)).toEqual([
        hostDirInstance, otherHostDirInstance, plainDirInstance
      ]);
    });

    it('should be able to retrieve components that have host directives using ng.getComponent',
       () => {
         let compInstance!: Comp;

         @Directive({standalone: true})
         class HostDir {
         }

         @Component({
           selector: 'comp',
           template: '',
           hostDirectives: [HostDir],
         } as HostDirectiveAny)
         class Comp {
           constructor() {
             compInstance = this;
           }
         }

         @Component({template: '<comp></comp>'})
         class App {
         }

         TestBed.configureTestingModule({declarations: [App, Comp]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();
         const componentHost = fixture.nativeElement.querySelector('comp');

         expect(compInstance instanceof Comp).toBe(true);
         expect(getComponent(componentHost)).toBe(compInstance);
       });

    it('should be able to retrieve components that have host directives using DebugNode.componentInstance',
       () => {
         let compInstance!: Comp;

         @Directive({standalone: true})
         class HostDir {
         }

         @Component({
           selector: 'comp',
           template: '',
           hostDirectives: [HostDir],
         } as HostDirectiveAny)
         class Comp {
           constructor() {
             compInstance = this;
           }
         }

         @Component({template: '<comp></comp>'})
         class App {
         }

         TestBed.configureTestingModule({declarations: [App, Comp]});
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();
         const node = fixture.debugElement.query(By.css('comp'));

         expect(compInstance instanceof Comp).toBe(true);
         expect(node.componentInstance).toBe(compInstance);
       });

    it('should be able to query by a host directive', () => {
      @Directive({standalone: true})
      class HostDir {
      }

      @Component({
        selector: 'comp',
        template: '',
        hostDirectives: [HostDir],
      } as HostDirectiveAny)
      class Comp {
        constructor(public elementRef: ElementRef<HTMLElement>) {}
      }

      @Component({template: '<comp></comp>'})
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

  describe('invalid usage validations', () => {
    it('should throw an error if the metadata of a host directive cannot be resolved', () => {
      class HostDir {}

      @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0307: Could not resolve metadata for host directive HostDir. ' +
              'Make sure that the HostDir class is annotated with an @Directive decorator.');
    });

    it('should throw an error if a host directive is not standalone', () => {
      @Directive({standalone: false})
      class HostDir {
      }

      @Directive({selector: '[dir]', hostDirectives: [HostDir]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError('NG0308: Host directive HostDir must be standalone.');
    });

    it('should throw an error if a host directive matches multiple times in a template', () => {
      @Directive({standalone: true, selector: '[dir]'})
      class HostDir {
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir],
        standalone: true,
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>', standalone: true, imports: [HostDir, Dir]})
      class App {
      }

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0309: Directive HostDir matches multiple times on the same element. Directives can only match an element once.');
    });

    it('should throw an error if a host directive appears multiple times in a chain', () => {
      @Directive({standalone: true})
      class DuplicateHostDir {
      }

      @Directive({standalone: true, hostDirectives: [DuplicateHostDir]} as HostDirectiveAny)
      class HostDir {
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [HostDir, DuplicateHostDir],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0309: Directive DuplicateHostDir matches multiple times on the same element. Directives can only match an element once.');
    });

    it('should throw an error if a host directive is a component', () => {
      @Component({standalone: true, template: '', selector: 'host-comp'})
      class HostComp {
      }

      @Directive({selector: '[dir]', hostDirectives: [HostComp]} as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError('NG0310: Host directive HostComp cannot be a component.');
    });

    it('should throw an error if a host directive output does not exist', () => {
      @Directive({standalone: true})
      class HostDir {
        @Output() foo = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          outputs: ['doesNotExist'],
        }]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0311: Directive HostDir does not have an output with a public name of doesNotExist.');
    });

    it('should throw an error if a host directive output alias does not exist', () => {
      @Directive({standalone: true})
      class HostDir {
        @Output('alias') foo = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          outputs: ['foo'],
        }]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0311: Directive HostDir does not have an output with a public name of foo.');
    });

    it('should throw an error if a host directive input does not exist', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input() foo: any;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{
          directive: HostDir,
          inputs: ['doesNotExist'],
        }]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0311: Directive HostDir does not have an input with a public name of doesNotExist.');
    });

    it('should throw an error if a host directive input alias does not exist', () => {
      @Directive({standalone: true})
      class HostDir {
        @Input('alias') foo: any;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['foo']}],
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({template: '<div dir></div>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => TestBed.createComponent(App))
          .toThrowError(
              'NG0311: Directive HostDir does not have an input with a public name of foo.');
    });

    it('should throw an error if a host directive tries to alias to an existing input', () => {
      @Directive({selector: '[host-dir]', standalone: true})
      class HostDir {
        @Input('colorAlias') color?: string;
        @Input() buttonColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({imports: [Dir, HostDir], template: '<button dir buttonColor="red"></button>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG0312: Cannot alias input colorAlias of host directive HostDir ' +
              'to buttonColor, because it already has a different input with the same public name.');
    });

    it('should throw an error if a host directive tries to alias to an existing input alias', () => {
      @Directive({selector: '[host-dir]', standalone: true})
      class HostDir {
        @Input('colorAlias') color?: string;
        @Input('buttonColorAlias') buttonColor?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['colorAlias: buttonColorAlias']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir buttonColorAlias="red"></button>',
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG0312: Cannot alias input colorAlias of host directive HostDir ' +
              'to buttonColorAlias, because it already has a different input with the same public name.');
    });

    it('should not throw if a host directive input aliases to the same name', () => {
      @Directive({selector: '[host-dir]', standalone: true})
      class HostDir {
        @Input('color') color?: string;
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, inputs: ['color: buttonColor']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({imports: [Dir, HostDir], template: '<button dir buttonColor="red"></button>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should throw an error if a host directive tries to alias to an existing output alias', () => {
      @Directive({selector: '[host-dir]', standalone: true})
      class HostDir {
        @Output('clickedAlias') clicked = new EventEmitter();
        @Output('tappedAlias') tapped = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['clickedAlias: tappedAlias']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir (tappedAlias)="handleTap()"></button>',
      })
      class App {
        handleTap() {}
      }

      TestBed.configureTestingModule({declarations: [App, Dir]});

      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      })
          .toThrowError(
              'NG0312: Cannot alias output clickedAlias of host directive HostDir ' +
              'to tappedAlias, because it already has a different output with the same public name.');
    });

    it('should not throw if a host directive output aliases to the same name', () => {
      @Directive({selector: '[host-dir]', standalone: true})
      class HostDir {
        @Output('clicked') clicked = new EventEmitter();
      }

      @Directive({
        selector: '[dir]',
        hostDirectives: [{directive: HostDir, outputs: ['clicked: wasClicked']}]
      } as HostDirectiveAny)
      class Dir {
      }

      @Component({
        imports: [Dir, HostDir],
        template: '<button dir (wasClicked)="handleClick()"></button>',
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
  });
});

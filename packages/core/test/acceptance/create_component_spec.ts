/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createComponent,
  createEnvironmentInjector,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  inputBinding,
  NgModule,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChange,
  SimpleChanges,
  Type,
  ViewChild,
} from '@angular/core';
import {stringifyForError} from '@angular/core/src/render3/util/stringify_utils';
import {TestBed} from '@angular/core/testing';

describe('createComponent', () => {
  it('should create an instance of a standalone component', () => {
    @Component({
      template: 'Hello {{ name }}!',
    })
    class StandaloneComponent {
      name = 'Angular';
    }

    const hostElement = document.createElement('div');
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const componentRef = createComponent(StandaloneComponent, {hostElement, environmentInjector});

    componentRef.changeDetectorRef.detectChanges();
    expect(hostElement.textContent).toBe('Hello Angular!');

    // Verify basic change detection works.
    componentRef.instance.name = 'ZoneJS';
    componentRef.changeDetectorRef.detectChanges();
    expect(hostElement.textContent).toBe('Hello ZoneJS!');
    componentRef.destroy();
  });

  it('should create an instance of an NgModule-based component', () => {
    @Component({
      template: 'Hello {{ name }}!',
      standalone: false,
    })
    class NgModuleBasedComponent {
      name = 'Angular';
    }

    @NgModule({
      declarations: [NgModuleBasedComponent],
    })
    class AppModule {}

    const hostElement = document.createElement('div');
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const componentRef = createComponent(NgModuleBasedComponent, {
      hostElement,
      environmentInjector,
    });

    componentRef.changeDetectorRef.detectChanges();
    expect(hostElement.textContent).toBe('Hello Angular!');

    // Verify basic change detection works.
    componentRef.instance.name = 'ZoneJS';
    componentRef.changeDetectorRef.detectChanges();
    expect(hostElement.textContent).toBe('Hello ZoneJS!');
  });

  it('should render projected content', () => {
    @Component({
      template: `
        <ng-content></ng-content>|
        <ng-content></ng-content>|
        <ng-content></ng-content>
      `,
    })
    class StandaloneComponent {}

    // Helper method to create a `<p>` element
    const p = (content: string): Element => {
      const element = document.createElement('p');
      element.innerHTML = content;
      return element;
    };
    const hostElement = document.createElement('div');
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const projectableNodes = [[p('1')], [p('2')], [p('3')]];
    const componentRef = createComponent(StandaloneComponent, {
      hostElement,
      environmentInjector,
      projectableNodes,
    });

    componentRef.changeDetectorRef.detectChanges();
    expect(hostElement.innerHTML.replace(/\s*/g, '')).toBe('<p>1</p>|<p>2</p>|<p>3</p>');
    componentRef.destroy();
  });

  it('should be able to inject tokens from EnvironmentInjector', () => {
    const A = new InjectionToken('A');
    @Component({
      template: 'Token: {{ a }}',
    })
    class StandaloneComponent {
      a = inject(A);
    }

    const hostElement = document.createElement('div');
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const providers = [{provide: A, useValue: 'EnvironmentInjector(A)'}];
    const environmentInjector = createEnvironmentInjector(providers, parentInjector);
    const componentRef = createComponent(StandaloneComponent, {hostElement, environmentInjector});
    componentRef.changeDetectorRef.detectChanges();

    expect(hostElement.textContent).toBe('Token: EnvironmentInjector(A)');
    componentRef.destroy();
  });

  it('should be able to use NodeInjector from the node hierarchy', () => {
    const A = new InjectionToken('A');
    const B = new InjectionToken('B');
    @Component({
      template: '{{ a }} and {{ b }}',
    })
    class ChildStandaloneComponent {
      a = inject(A);
      b = inject(B);
    }

    @Component({
      template: 'Tokens: <div #target></div>',
      providers: [{provide: A, useValue: 'ElementInjector(A)'}],
    })
    class RootStandaloneComponent {
      @ViewChild('target', {read: ElementRef}) target!: ElementRef;
      constructor(private injector: Injector) {}

      createChildComponent() {
        const hostElement = this.target.nativeElement;
        const parentInjector = this.injector.get(EnvironmentInjector);
        const providers = [
          {provide: A, useValue: 'EnvironmentInjector(A)'},
          {provide: B, useValue: 'EnvironmentInjector(B)'},
        ];
        const environmentInjector = createEnvironmentInjector(providers, parentInjector);
        const childComponentRef = createComponent(ChildStandaloneComponent, {
          hostElement,
          elementInjector: this.injector,
          environmentInjector,
        });
        childComponentRef.changeDetectorRef.detectChanges();
      }
    }

    const fixture = TestBed.createComponent(RootStandaloneComponent);
    fixture.detectChanges();

    fixture.componentInstance.createChildComponent();

    const rootEl = fixture.nativeElement;

    // Token A is coming from the Element Injector, token B - from the Environment Injector.
    expect(rootEl.textContent).toBe('Tokens: ElementInjector(A) and EnvironmentInjector(B)');
  });

  it('should create a host element if none provided', () => {
    const selector = 'standalone-comp';
    @Component({
      selector,
      template: 'Hello {{ name }}!',
    })
    class StandaloneComponent {
      name = 'Angular';
    }

    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const componentRef = createComponent(StandaloneComponent, {environmentInjector});
    componentRef.changeDetectorRef.detectChanges();

    const hostElement = (componentRef.hostView as EmbeddedViewRef<StandaloneComponent>)
      .rootNodes[0];

    // A host element that matches component's selector.
    expect(hostElement.tagName.toLowerCase()).toBe(selector);

    expect(hostElement.textContent).toBe('Hello Angular!');
    componentRef.destroy();
  });

  it(
    'should fall-back to use a `div` as a host element if none provided ' +
      'and element selector does not have a tag name',
    () => {
      @Component({
        selector: '.some-class',
        template: 'Hello {{ name }}!',
      })
      class StandaloneComponent {
        name = 'Angular';
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const componentRef = createComponent(StandaloneComponent, {environmentInjector});
      componentRef.changeDetectorRef.detectChanges();

      const hostElement = (componentRef.hostView as EmbeddedViewRef<StandaloneComponent>)
        .rootNodes[0];

      // A host element has the `div` tag name, since component's selector doesn't contain
      // tag name information (only a class name).
      expect(hostElement.tagName.toLowerCase()).toBe('div');

      expect(hostElement.textContent).toBe('Hello Angular!');
      componentRef.destroy();
    },
  );

  describe('attaching directives to root component', () => {
    it('should be able to attach directives when creating a component', () => {
      const logs: string[] = [];

      @Directive({
        host: {
          'class': 'class-1',
          'attr-one': 'one',
        },
      })
      class Dir1 {
        constructor() {
          logs.push('Dir1');
        }
      }

      @Directive({
        host: {
          'class': 'class-2',
          'attr-two': 'two',
        },
      })
      class Dir2 {
        constructor() {
          logs.push('Dir2');
        }
      }

      @Component({
        template: '',
        host: {
          'class': 'host',
          'attr-three': 'host',
        },
      })
      class HostComponent {
        constructor() {
          logs.push('HostComponent');
        }
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir1, Dir2],
      });

      expect(logs).toEqual(['HostComponent', 'Dir1', 'Dir2']);
      expect(hostElement.className).toBe('host class-1 class-2');
      expect(hostElement.getAttribute('attr-one')).toBe('one');
      expect(hostElement.getAttribute('attr-two')).toBe('two');
      expect(hostElement.getAttribute('attr-three')).toBe('host');
    });

    it('should support setting the value of a directive using setInput', () => {
      let dirInstance: Dir;

      @Directive({})
      class Dir {
        @Input() value: number | null = null;

        constructor() {
          dirInstance = this;
        }
      }

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir],
      });

      expect(dirInstance!.value).toBe(null);

      ref.setInput('value', 1);
      expect(dirInstance!.value).toBe(1);

      ref.setInput('value', 2);
      expect(dirInstance!.value).toBe(2);
    });

    it('should execute host directives in the correct order', () => {
      const logs: string[] = [];

      @Directive({})
      class Chain1_3 {
        constructor() {
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

      @Directive({})
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
        template: '',
        hostDirectives: [Chain1, Chain2, Chain3],
      })
      class HostComponent {
        constructor() {
          logs.push('HostComponent');
        }
      }

      @Directive()
      class Dir1 {
        constructor() {
          logs.push('Dir1');
        }
      }

      @Directive({})
      class Dir2 {
        constructor() {
          logs.push('Dir2');
        }
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir1, Dir2],
      });

      expect(logs).toEqual([
        'Chain1 - level 3',
        'Chain1 - level 2',
        'Chain1 - level 1',
        'Chain2 - level 2',
        'Chain2 - level 1',
        'Chain3 - level 2',
        'Chain3 - level 1',
        'HostComponent',
        'Dir1',
        'Dir2',
      ]);
    });

    it('should destroy the attached directives when the component ref is destroyed', () => {
      const logs: string[] = [];

      @Directive({})
      class Dir1 implements OnDestroy {
        ngOnDestroy() {
          logs.push('Dir1');
        }
      }

      @Directive({})
      class Dir2 implements OnDestroy {
        ngOnDestroy() {
          logs.push('Dir2');
        }
      }

      @Component({template: ''})
      class HostComponent implements OnDestroy {
        ngOnDestroy() {
          logs.push('HostComponent');
        }
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir1, Dir2],
      });

      ref.destroy();
      expect(logs).toEqual(['HostComponent', 'Dir1', 'Dir2']);
    });

    it('should be able to inject the attached directive', () => {
      let createdInstance: Dir | undefined;
      let injectedInstance: Dir | undefined;

      @Directive({})
      class Dir {
        constructor() {
          createdInstance = this;
        }
      }

      @Component({template: ''})
      class HostComponent {
        constructor() {
          injectedInstance = inject(Dir);
        }
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir],
      });

      expect(createdInstance).toBeTruthy();
      expect(injectedInstance).toBeTruthy();
      expect(createdInstance).toBe(injectedInstance);
    });

    it('should write to the inputs of the attached directives using setInput', () => {
      let dirInstance!: Dir;

      @Directive()
      class Dir {
        @Input() someInput = 0;

        constructor() {
          dirInstance = this;
        }
      }

      @Component({template: ''})
      class HostComponent {
        @Input() someInput = 0;
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(HostComponent, {
        hostElement,
        environmentInjector,
        directives: [Dir],
      });

      expect(dirInstance.someInput).toBe(0);
      expect(ref.instance.someInput).toBe(0);

      ref.setInput('someInput', 1);
      expect(dirInstance.someInput).toBe(1);
      expect(ref.instance.someInput).toBe(1);

      ref.setInput('someInput', 2);
      expect(dirInstance.someInput).toBe(2);
      expect(ref.instance.someInput).toBe(2);
    });

    it('should throw if the same directive is attached multiple times', () => {
      @Directive({})
      class Dir {}

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(HostComponent, {
          hostElement,
          environmentInjector,
          directives: [Dir, Dir],
        });
      }).toThrowError(/Directive Dir matches multiple times on the same element/);
    });

    it('should throw if a non-directive class is attached', () => {
      class NotADir {}

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(HostComponent, {
          hostElement,
          environmentInjector,
          directives: [NotADir],
        });
      }).toThrowError(/Type NotADir does not have 'ɵdir' property/);
    });

    it('should throw if a non-directive class is attached using the DirectiveWithBinding syntax', () => {
      class NotADir {}

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(HostComponent, {
          hostElement,
          environmentInjector,
          directives: [
            {
              type: NotADir,
              bindings: [],
            },
          ],
        });
      }).toThrowError(/Type NotADir does not have 'ɵdir' property/);
    });

    it('should throw if a component class is attached', () => {
      @Component({template: '', standalone: true})
      class NotADir {}

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(HostComponent, {
          hostElement,
          environmentInjector,
          directives: [NotADir],
        });
      }).toThrowError(/Type NotADir does not have 'ɵdir' property/);
    });

    it('should throw if attached directive is not standalone', () => {
      @Directive({standalone: false})
      class Dir {}

      @Component({template: ''})
      class HostComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(HostComponent, {
          hostElement,
          environmentInjector,
          directives: [Dir],
        });
      }).toThrowError(
        /The Dir directive must be standalone in order to be applied to a dynamically-created component/,
      );
    });
  });

  describe('root component inputs', () => {
    it('should be able to bind to inputs of the root component', () => {
      @Component({template: '{{one}} - {{two}} - {{other}}'})
      class RootComp {
        @Input() one = '';
        @Input({alias: 'twoAlias'}) two = '';
        other = 'other';
      }

      const oneValue = signal('initial');
      let twoValue = 'initial';
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('one', oneValue), inputBinding('twoAlias', () => twoValue)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('initial - initial - other');

      oneValue.set('1');
      ref.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('1 - initial - other');

      twoValue = '1';
      ref.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('1 - 1 - other');

      oneValue.set('2');
      twoValue = '2';
      ref.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('2 - 2 - other');
    });

    it('should not bind root component inputs to directives', () => {
      let dirInstance!: RootDir;

      @Directive()
      class RootDir {
        @Input() someInput = '';

        constructor() {
          dirInstance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() someInput = '';
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [RootDir],
        bindings: [inputBinding('someInput', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('initial');
      expect(dirInstance.someInput).toBe('');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('changed');
      expect(dirInstance.someInput).toBe('');
    });

    it('should bind root component inputs to host directives of the root component, in addition to the component itself', () => {
      let hostDirInstance!: RootHostDir;
      let dirInstance!: RootDir;

      @Directive()
      class RootDir {
        @Input() someInput = '';

        constructor() {
          dirInstance = this;
        }
      }

      @Directive()
      class RootHostDir {
        @Input() someInput = '';

        constructor() {
          hostDirInstance = this;
        }
      }

      @Component({
        template: '',
        hostDirectives: [{directive: RootHostDir, inputs: ['someInput']}],
      })
      class RootComp {
        @Input() someInput = '';
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [RootDir],
        bindings: [inputBinding('someInput', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('initial');
      expect(hostDirInstance.someInput).toBe('initial');
      expect(dirInstance.someInput).toBe('');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('changed');
      expect(hostDirInstance.someInput).toBe('changed');
      expect(dirInstance.someInput).toBe('');
    });

    it('should bind to inputs of host directives of directives applied to the root component', () => {
      let hostDirInstance!: RootHostDir;

      @Directive()
      class RootHostDir {
        @Input() someInput = '';

        constructor() {
          hostDirInstance = this;
        }
      }

      @Directive({
        hostDirectives: [
          {
            directive: RootHostDir,
            inputs: ['someInput: alias'],
          },
        ],
      })
      class RootDir {}

      @Component({template: ''})
      class RootComp {}

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [
          {
            type: RootDir,
            bindings: [inputBinding('alias', value)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(hostDirInstance.someInput).toBe('initial');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(hostDirInstance.someInput).toBe('changed');
    });

    it('should bind to aliased inputs of host directives of the root component', () => {
      let dirInstance!: RootHostDir;

      @Directive()
      class RootHostDir {
        @Input({alias: 'someAlias'}) someInput = '';

        constructor() {
          dirInstance = this;
        }
      }

      @Component({
        template: '',
        hostDirectives: [{directive: RootHostDir, inputs: ['someAlias: alias']}],
      })
      class RootComp {}

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('alias', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(dirInstance.someInput).toBe('initial');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(dirInstance.someInput).toBe('changed');
    });

    it('should bind input to directives, but not the root component', () => {
      let dir1Instance!: RootDir1;
      let dir2Instance!: RootDir2;

      @Directive()
      class RootDir1 {
        @Input() someInput = '';

        constructor() {
          dir1Instance = this;
        }
      }

      @Directive()
      class RootDir2 {
        @Input() someOtherInput = '';

        constructor() {
          dir2Instance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() someInput = '';
        @Input() someOtherInput = '';
      }

      const oneValue = signal('initial');
      const twoValue = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [
          {
            type: RootDir1,
            bindings: [inputBinding('someInput', oneValue)],
          },
          {
            type: RootDir2,
            bindings: [inputBinding('someOtherInput', twoValue)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('');
      expect(ref.instance.someOtherInput).toBe('');
      expect(dir1Instance.someInput).toBe('initial');
      expect(dir2Instance.someOtherInput).toBe('initial');

      oneValue.set('one changed');
      twoValue.set('two changed');
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('');
      expect(ref.instance.someOtherInput).toBe('');
      expect(dir1Instance.someInput).toBe('one changed');
      expect(dir2Instance.someOtherInput).toBe('two changed');
    });

    it('should invoke ngOnChanges when binding to a root component input', () => {
      const changes: SimpleChange[] = [];

      @Component({template: ''})
      class RootComp implements OnChanges {
        @Input() someInput = '';

        ngOnChanges(c: SimpleChanges) {
          changes.push(c['someInput']);
        }
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('someInput', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(changes).toEqual([
        jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'initial',
        }),
      ]);

      value.set('1');
      ref.changeDetectorRef.detectChanges();
      expect(changes).toEqual([
        jasmine.objectContaining({
          firstChange: true,
          previousValue: undefined,
          currentValue: 'initial',
        }),
        jasmine.objectContaining({
          firstChange: false,
          previousValue: 'initial',
          currentValue: '1',
        }),
      ]);
    });

    it('should transform input bound to the root component', () => {
      @Component({template: ''})
      class RootComp {
        @Input({transform: (value: string) => parseInt(value)}) someInput = -1;
      }

      const value = signal(0);
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('someInput', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe(0);

      value.set(1);
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe(1);
    });

    it('should bind different values to inputs that all have the same name', () => {
      let dir1Instance!: RootDir1;
      let dir2Instance!: RootDir2;

      @Directive()
      class RootDir1 {
        @Input() someInput = '';

        constructor() {
          dir1Instance = this;
        }
      }

      @Directive()
      class RootDir2 {
        @Input() someInput = '';

        constructor() {
          dir2Instance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() someInput = '';
      }

      const rootValue = signal('initial');
      const oneValue = signal('initial');
      const twoValue = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('someInput', rootValue)],
        directives: [
          {
            type: RootDir1,
            bindings: [inputBinding('someInput', oneValue)],
          },
          {
            type: RootDir2,
            bindings: [inputBinding('someInput', twoValue)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('initial');
      expect(dir1Instance.someInput).toBe('initial');
      expect(dir2Instance.someInput).toBe('initial');

      rootValue.set('root changed');
      oneValue.set('one changed');
      twoValue.set('two changed');
      ref.changeDetectorRef.detectChanges();
      expect(ref.instance.someInput).toBe('root changed');
      expect(dir1Instance.someInput).toBe('one changed');
      expect(dir2Instance.someInput).toBe('two changed');
    });

    it('should only invoke setters if the value has changed', () => {
      let setterCount = 0;

      @Component({template: ''})
      class RootComp {
        @Input()
        set someInput(_: string) {
          setterCount++;
        }
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('someInput', value)],
      });
      expect(setterCount).toBe(0);

      ref.changeDetectorRef.detectChanges();
      expect(setterCount).toBe(1);
      ref.changeDetectorRef.detectChanges();
      expect(setterCount).toBe(1);

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(setterCount).toBe(2);
      ref.changeDetectorRef.detectChanges();
      expect(setterCount).toBe(2);
    });

    it('should throw if target does not have an input with a specific name', () => {
      @Component({template: ''})
      class RootComp {
        @Input() someInput = '';
      }

      @Directive()
      class RootDir {}

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [
          {
            type: RootDir,
            // `someInput` exists on `RootComp`, but not `RootDir`.
            bindings: [inputBinding('someInput', value)],
          },
        ],
      });

      expect(() => {
        ref.changeDetectorRef.detectChanges();
      }).toThrowError(/RootDir does not have an input with a public name of "someInput"/);
    });
  });

  describe('error checking', () => {
    it('should throw when provided class is not a component', () => {
      class NotAComponent {}

      @Directive()
      class ADirective {}

      @Injectable()
      class AnInjectiable {}

      const errorFor = (type: Type<unknown>): string =>
        `NG0906: The ${stringifyForError(type)} is not an Angular component, ` +
        `make sure it has the \`@Component\` decorator.`;
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => createComponent(NotAComponent, {hostElement, environmentInjector})).toThrowError(
        errorFor(NotAComponent),
      );

      expect(() => createComponent(ADirective, {hostElement, environmentInjector})).toThrowError(
        errorFor(ADirective),
      );

      expect(() => createComponent(AnInjectiable, {hostElement, environmentInjector})).toThrowError(
        errorFor(AnInjectiable),
      );
    });
  });
});

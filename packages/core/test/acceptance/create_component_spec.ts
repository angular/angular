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
  ErrorHandler,
  EventEmitter,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  inputBinding,
  NgModule,
  OnChanges,
  OnDestroy,
  Output,
  outputBinding,
  signal,
  SimpleChange,
  SimpleChanges,
  twoWayBinding,
  Type,
  ViewChild,
} from '../../src/core';
import {stringifyForError} from '../../src/render3/util/stringify_utils';
import {TestBed} from '../../testing';
import {ChangeDetectionStrategy} from '@angular/compiler';

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

    it('should throw when using setInput on a component already using inputBindings', () => {
      @Component({template: ''})
      class RootComp {
        @Input() someInput = '';
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('someInput', () => 'hello')],
      });
      ref.changeDetectorRef.detectChanges();

      expect(() => {
        ref.setInput('someInput', 'changed');
      }).toThrowError(
        /Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions/,
      );
    });

    it('should throw when using multiple inputBindings targeting the same property', () => {
      @Component({
        standalone: true,
        template: 'Text: {{ text }}',
      })
      class DummyChildComponent {
        @Input() text = '';
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const modelInput = signal('first');
      const anotherSignal = signal('second');

      expect(() => {
        createComponent(DummyChildComponent, {
          hostElement,
          environmentInjector,
          bindings: [
            inputBinding('text', modelInput),
            inputBinding('text', anotherSignal),
            inputBinding('text', () => 'static'),
          ],
        });
      }).toThrowError(
        /Multiple input bindings found for the same property 'text'. Each input property can only have one binding per component./,
      );
    });

    it('should throw when using inputBinding and twoWayBinding targeting the same property', () => {
      @Component({
        standalone: true,
        template: 'Text: {{ text }}',
      })
      class DummyChildComponent {
        @Input() text = '';
        @Output() textChange = new EventEmitter();
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const modelInput = signal('first');
      const twoWaySignal = signal('second');

      expect(() => {
        createComponent(DummyChildComponent, {
          hostElement,
          environmentInjector,
          bindings: [inputBinding('text', modelInput), twoWayBinding('text', twoWaySignal)],
        });
      }).toThrowError(
        /Multiple input bindings found for the same property 'text'. Each input property can only have one binding per component./,
      );
    });

    it('should throw when using multiple inputBindings targeting the same property on a directive', () => {
      @Directive()
      class TestDirective {
        @Input() value = '';
      }

      @Component({
        standalone: true,
        template: 'Component',
      })
      class TestComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const firstSignal = signal('first');
      const secondSignal = signal('second');

      expect(() => {
        createComponent(TestComponent, {
          hostElement,
          environmentInjector,
          directives: [
            {
              type: TestDirective,
              bindings: [
                inputBinding('value', firstSignal),
                inputBinding('value', secondSignal),
                inputBinding('value', () => 'static'),
              ],
            },
          ],
        });
      }).toThrowError(
        /Multiple input bindings found for the same property 'value'. Each input property can only have one binding per directive./,
      );
    });

    it('should throw when using inputBinding and twoWayBinding targeting the same property on a directive', () => {
      @Directive()
      class TestDirective {
        @Input() value = '';
        @Output() valueChange = new EventEmitter();
      }

      @Component({
        standalone: true,
        template: 'Component',
      })
      class TestComponent {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const inputSignal = signal('input');
      const twoWaySignal = signal('twoWay');

      expect(() => {
        createComponent(TestComponent, {
          hostElement,
          environmentInjector,
          directives: [
            {
              type: TestDirective,
              bindings: [inputBinding('value', inputSignal), twoWayBinding('value', twoWaySignal)],
            },
          ],
        });
      }).toThrowError(
        /Multiple input bindings found for the same property 'value'. Each input property can only have one binding per directive./,
      );
    });

    it('should update view of component set with the onPush strategy after input change', () => {
      @Component({
        standalone: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: 'Value: {{ value }}',
      })
      class DisplayOnPushComponent {
        @Input() value: number = -1;
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const valueSignal = signal(10);

      const componentRef = createComponent(DisplayOnPushComponent, {
        hostElement,
        environmentInjector,
        bindings: [inputBinding('value', valueSignal)],
      });

      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Value: 10');

      valueSignal.set(20);
      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Value: 20');
    });
  });

  describe('root component outputs', () => {
    it('should be able to bind to outputs of the root component', () => {
      @Component({template: ''})
      class RootComp {
        @Output() event = new EventEmitter<{value: number}>();
      }

      const events: {value: number}[] = [];
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [outputBinding<{value: number}>('event', (event) => events.push(event))],
      });
      ref.changeDetectorRef.detectChanges();
      expect(events).toEqual([]);

      ref.instance.event.emit({value: 0});
      expect(events).toEqual([jasmine.objectContaining({value: 0})]);

      ref.instance.event.emit({value: 1});
      expect(events).toEqual([
        jasmine.objectContaining({value: 0}),
        jasmine.objectContaining({value: 1}),
      ]);
    });

    it('should clean up root component output listeners', () => {
      @Component({template: ''})
      class RootComp {
        @Output() event = new EventEmitter<void>();
      }

      let count = 0;
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [outputBinding('event', () => count++)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(count).toBe(0);

      ref.instance.event.emit();
      expect(count).toBe(1);

      ref.destroy();
      ref.instance.event.emit();
      expect(count).toBe(1);
    });

    it('should handle errors in root component listeners through the ErrorHandler', () => {
      @Component({template: ''})
      class RootComp {
        @Output() event = new EventEmitter<void>();
      }

      TestBed.configureTestingModule({
        rethrowApplicationErrors: false,
        providers: [
          {
            provide: ErrorHandler,
            useValue: {
              handleError: (error: Error) => errors.push(error.message),
            },
          },
        ],
      });
      const errors: string[] = [];
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [
          outputBinding('event', () => {
            throw new Error('oh no');
          }),
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(errors).toEqual([]);

      ref.instance.event.emit();
      expect(errors).toEqual(['oh no']);
    });

    it('should listen to host directive outputs on the root component', () => {
      let hostDirInstance!: RootHostDir;
      let dirInstance!: RootDir;

      @Directive()
      class RootHostDir {
        @Output() myEvent = new EventEmitter<string>();

        constructor() {
          hostDirInstance = this;
        }
      }

      @Component({
        template: '',
        hostDirectives: [
          {
            directive: RootHostDir,
            outputs: ['myEvent: event'],
          },
        ],
      })
      class RootComp {
        @Output() event = new EventEmitter<string>();
      }

      @Directive()
      class RootDir {
        @Output() event = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      const logs: string[] = [];
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [outputBinding<string>('event', (value) => logs.push(value))],
        directives: [RootDir],
      });
      ref.changeDetectorRef.detectChanges();
      expect(logs).toEqual([]);

      ref.instance.event.emit('component');
      expect(logs).toEqual(['component']);

      hostDirInstance.myEvent.emit('host directive');
      expect(logs).toEqual(['component', 'host directive']);

      dirInstance.event.emit('directive');
      expect(logs).toEqual(['component', 'host directive']);
    });

    it('should not listen to directive outputs with the same name as outputs on the root component', () => {
      let dirInstance!: RootDir;

      @Component({template: ''})
      class RootComp {
        @Output() event = new EventEmitter<string>();
      }

      @Directive()
      class RootDir {
        @Output() event = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      const logs: string[] = [];
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [outputBinding<string>('event', (value) => logs.push(value))],
        directives: [RootDir],
      });
      ref.changeDetectorRef.detectChanges();
      expect(logs).toEqual([]);

      ref.instance.event.emit('component');
      expect(logs).toEqual(['component']);

      dirInstance.event.emit('directive');
      expect(logs).toEqual(['component']);
    });

    it('should not listen to root component outputs with the same name as outputs on one of the directives', () => {
      let dirInstance!: RootDir;

      @Component({template: ''})
      class RootComp {
        @Output() event = new EventEmitter<string>();
      }

      @Directive()
      class RootDir {
        @Output() event = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      const logs: string[] = [];
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [
          {
            type: RootDir,
            bindings: [outputBinding<string>('event', (value) => logs.push(value))],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(logs).toEqual([]);

      dirInstance.event.emit('directive');
      expect(logs).toEqual(['directive']);

      ref.instance.event.emit('component');
      expect(logs).toEqual(['directive']);
    });

    it('should throw if root component does not have an output with the specified name', () => {
      @Component({template: ''})
      class RootComp {}

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(RootComp, {
          hostElement,
          environmentInjector,
          bindings: [outputBinding('click', () => {})],
        });
      }).toThrowError(/RootComp does not have an output with a public name of "click"/);
    });

    it('should not listen to native event when creating an output binding', () => {
      @Component({template: ''})
      class RootComp {
        @Output() click = new EventEmitter<void>();
      }

      const hostElement = document.createElement('button');
      const spy = spyOn(hostElement, 'addEventListener');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [outputBinding('click', () => {})],
      });
      ref.changeDetectorRef.detectChanges();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('root component two-way bindings', () => {
    it('should be able to use a two-way binding on the root component', () => {
      @Component({template: 'Value: {{value}}'})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [twoWayBinding('value', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(hostElement.textContent).toBe('Value: initial');

      value.set('1');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('1');
      expect(hostElement.textContent).toBe('Value: 1');

      ref.instance.value = '2';
      ref.instance.valueChange.emit('2');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('2');
      expect(hostElement.textContent).toBe('Value: 2');
    });

    it('should be able to two-way bind the same signal to multiple directives', () => {
      let dirInstance!: RootDir;

      @Directive()
      class RootDir {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [
          {
            type: RootDir,
            bindings: [twoWayBinding('value', value)],
          },
        ],
        bindings: [twoWayBinding('value', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(ref.instance.value).toBe('initial');
      expect(dirInstance.value).toBe('initial');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('changed');
      expect(ref.instance.value).toBe('changed');
      expect(dirInstance.value).toBe('changed');

      ref.instance.value = 'root changed';
      ref.instance.valueChange.emit('root changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('root changed');
      expect(ref.instance.value).toBe('root changed');
      expect(dirInstance.value).toBe('root changed');

      dirInstance.value = 'dir changed';
      dirInstance.valueChange.emit('dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('dir changed');
      expect(ref.instance.value).toBe('dir changed');
      expect(dirInstance.value).toBe('dir changed');
    });

    it('should not bind root component two-way bindings to directives', () => {
      let dirInstance!: RootDir;

      @Directive()
      class RootDir {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [RootDir],
        bindings: [twoWayBinding('value', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(ref.instance.value).toBe('initial');
      expect(dirInstance.value).toBe('');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('changed');
      expect(ref.instance.value).toBe('changed');
      expect(dirInstance.value).toBe('');

      ref.instance.value = 'root changed';
      ref.instance.valueChange.emit('root changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('root changed');
      expect(ref.instance.value).toBe('root changed');
      expect(dirInstance.value).toBe('');

      dirInstance.value = 'dir changed';
      dirInstance.valueChange.emit('dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('root changed');
      expect(ref.instance.value).toBe('root changed');
      expect(dirInstance.value).toBe('dir changed');
    });

    it('should bind root component two-way bindings to host directives of the root component, in addition to the component itself', () => {
      let hostDirInstance!: RootHostDir;
      let dirInstance!: RootDir;

      @Directive()
      class RootDir {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      @Directive()
      class RootHostDir {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          hostDirInstance = this;
        }
      }

      @Component({
        template: '',
        hostDirectives: [{directive: RootHostDir, inputs: ['value'], outputs: ['valueChange']}],
      })
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        directives: [RootDir],
        bindings: [twoWayBinding('value', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(ref.instance.value).toBe('initial');
      expect(hostDirInstance.value).toBe('initial');
      expect(dirInstance.value).toBe('');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('changed');
      expect(ref.instance.value).toBe('changed');
      expect(hostDirInstance.value).toBe('changed');
      expect(dirInstance.value).toBe('');

      hostDirInstance.value = 'host dir changed';
      hostDirInstance.valueChange.emit('host dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('host dir changed');
      expect(ref.instance.value).toBe('host dir changed');
      expect(hostDirInstance.value).toBe('host dir changed');
      expect(dirInstance.value).toBe('');

      ref.instance.value = 'root changed';
      ref.instance.valueChange.emit('root changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('root changed');
      expect(ref.instance.value).toBe('root changed');
      expect(hostDirInstance.value).toBe('root changed');
      expect(dirInstance.value).toBe('');

      dirInstance.value = 'dir changed';
      dirInstance.valueChange.emit('dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('root changed');
      expect(ref.instance.value).toBe('root changed');
      expect(hostDirInstance.value).toBe('root changed');
      expect(dirInstance.value).toBe('dir changed');
    });

    it('should two-way bind to inputs of host directives of directives applied to the root component', () => {
      let hostDirInstance!: RootHostDir;

      @Directive()
      class RootHostDir {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          hostDirInstance = this;
        }
      }

      @Directive({
        hostDirectives: [
          {
            directive: RootHostDir,
            inputs: ['value: valueAlias'],
            outputs: ['valueChange: valueAliasChange'],
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
            bindings: [twoWayBinding('valueAlias', value)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(hostDirInstance.value).toBe('initial');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('changed');
      expect(hostDirInstance.value).toBe('changed');

      hostDirInstance.value = 'host dir changed';
      hostDirInstance.valueChange.emit('host dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('host dir changed');
      expect(hostDirInstance.value).toBe('host dir changed');
    });

    it('should two-way bind to aliased inputs of host directives of the root component', () => {
      let dirInstance!: RootHostDir;

      @Directive()
      class RootHostDir {
        @Input({alias: 'valueAlias'}) value = '';
        @Output('valueAliasChange') valueChange = new EventEmitter<string>();

        constructor() {
          dirInstance = this;
        }
      }

      @Component({
        template: '',
        hostDirectives: [
          {
            directive: RootHostDir,
            inputs: ['valueAlias: myAlias'],
            outputs: ['valueAliasChange: myAliasChange'],
          },
        ],
      })
      class RootComp {}

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [twoWayBinding('myAlias', value)],
      });
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('initial');
      expect(dirInstance.value).toBe('initial');

      value.set('changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('changed');
      expect(dirInstance.value).toBe('changed');

      dirInstance.value = 'host dir changed';
      dirInstance.valueChange.emit('host dir changed');
      ref.changeDetectorRef.detectChanges();
      expect(value()).toBe('host dir changed');
      expect(dirInstance.value).toBe('host dir changed');
    });

    it('should two-way bind to directive inputs, but not inputs on the root component', () => {
      let dir1Instance!: RootDir1;
      let dir2Instance!: RootDir2;

      @Directive()
      class RootDir1 {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dir1Instance = this;
        }
      }

      @Directive()
      class RootDir2 {
        @Input() otherValue = '';
        @Output() otherValueChange = new EventEmitter<string>();

        constructor() {
          dir2Instance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        @Input() otherValue = '';
        @Output() otherValueChange = new EventEmitter<string>();
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
            bindings: [twoWayBinding('value', oneValue)],
          },
          {
            type: RootDir2,
            bindings: [twoWayBinding('otherValue', twoValue)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(oneValue()).toBe('initial');
      expect(twoValue()).toBe('initial');
      expect(ref.instance.value).toBe('');
      expect(ref.instance.otherValue).toBe('');
      expect(dir1Instance.value).toBe('initial');
      expect(dir2Instance.otherValue).toBe('initial');

      oneValue.set('one changed');
      twoValue.set('two changed');
      ref.changeDetectorRef.detectChanges();
      expect(oneValue()).toBe('one changed');
      expect(twoValue()).toBe('two changed');
      expect(ref.instance.value).toBe('');
      expect(ref.instance.otherValue).toBe('');
      expect(dir1Instance.value).toBe('one changed');
      expect(dir2Instance.otherValue).toBe('two changed');

      ref.instance.value = 'root changed one';
      ref.instance.valueChange.emit('root changed one');
      ref.instance.otherValue = 'root changed two';
      ref.instance.otherValueChange.emit('root changed two');
      ref.changeDetectorRef.detectChanges();
      expect(oneValue()).toBe('one changed');
      expect(twoValue()).toBe('two changed');
      expect(ref.instance.value).toBe('root changed one');
      expect(ref.instance.otherValue).toBe('root changed two');
      expect(dir1Instance.value).toBe('one changed');
      expect(dir2Instance.otherValue).toBe('two changed');

      dir1Instance.value = 'one changed again';
      dir1Instance.valueChange.emit('one changed again');
      ref.changeDetectorRef.detectChanges();
      expect(oneValue()).toBe('one changed again');
      expect(twoValue()).toBe('two changed');
      expect(ref.instance.value).toBe('root changed one');
      expect(ref.instance.otherValue).toBe('root changed two');
      expect(dir1Instance.value).toBe('one changed again');
      expect(dir2Instance.otherValue).toBe('two changed');

      dir2Instance.otherValue = 'two changed again';
      dir2Instance.otherValueChange.emit('two changed again');
      ref.changeDetectorRef.detectChanges();
      expect(oneValue()).toBe('one changed again');
      expect(twoValue()).toBe('two changed again');
      expect(ref.instance.value).toBe('root changed one');
      expect(ref.instance.otherValue).toBe('root changed two');
      expect(dir1Instance.value).toBe('one changed again');
      expect(dir2Instance.otherValue).toBe('two changed again');
    });

    it('should two-way bind different values to inputs that all have the same name', () => {
      let dir1Instance!: RootDir1;
      let dir2Instance!: RootDir2;

      @Directive()
      class RootDir1 {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dir1Instance = this;
        }
      }

      @Directive()
      class RootDir2 {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();

        constructor() {
          dir2Instance = this;
        }
      }

      @Component({template: ''})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const rootValue = signal('initial');
      const oneValue = signal('initial');
      const twoValue = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [twoWayBinding('value', rootValue)],
        directives: [
          {
            type: RootDir1,
            bindings: [twoWayBinding('value', oneValue)],
          },
          {
            type: RootDir2,
            bindings: [twoWayBinding('value', twoValue)],
          },
        ],
      });
      ref.changeDetectorRef.detectChanges();
      expect(rootValue()).toBe('initial');
      expect(oneValue()).toBe('initial');
      expect(twoValue()).toBe('initial');
      expect(ref.instance.value).toBe('initial');
      expect(dir1Instance.value).toBe('initial');
      expect(dir2Instance.value).toBe('initial');

      rootValue.set('root changed');
      oneValue.set('one changed');
      twoValue.set('two changed');
      ref.changeDetectorRef.detectChanges();
      expect(rootValue()).toBe('root changed');
      expect(oneValue()).toBe('one changed');
      expect(twoValue()).toBe('two changed');
      expect(ref.instance.value).toBe('root changed');
      expect(dir1Instance.value).toBe('one changed');
      expect(dir2Instance.value).toBe('two changed');

      dir1Instance.value = 'one changed again';
      dir1Instance.valueChange.emit('one changed again');
      ref.changeDetectorRef.detectChanges();
      expect(rootValue()).toBe('root changed');
      expect(oneValue()).toBe('one changed again');
      expect(twoValue()).toBe('two changed');
      expect(ref.instance.value).toBe('root changed');
      expect(dir1Instance.value).toBe('one changed again');
      expect(dir2Instance.value).toBe('two changed');

      dir2Instance.value = 'two changed again';
      dir2Instance.valueChange.emit('two changed again');
      ref.changeDetectorRef.detectChanges();
      expect(rootValue()).toBe('root changed');
      expect(oneValue()).toBe('one changed again');
      expect(twoValue()).toBe('two changed again');
      expect(ref.instance.value).toBe('root changed');
      expect(dir1Instance.value).toBe('one changed again');
      expect(dir2Instance.value).toBe('two changed again');
    });

    it('should throw if two-way binding target does not have an input with the specific name', () => {
      @Component({template: ''})
      class RootComp {
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        const ref = createComponent(RootComp, {
          hostElement,
          environmentInjector,
          bindings: [twoWayBinding('value', value)],
        });
        ref.changeDetectorRef.detectChanges();
      }).toThrowError(/RootComp does not have an input with a public name of "value"/);
    });

    it('should throw if two-way binding target does not have an output with the specific name', () => {
      @Component({template: ''})
      class RootComp {
        @Input() value = '';
      }

      const value = signal('initial');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);

      expect(() => {
        createComponent(RootComp, {
          hostElement,
          environmentInjector,
          bindings: [twoWayBinding('value', value)],
        });
      }).toThrowError(/RootComp does not have an output with a public name of "valueChange"/);
    });

    it('should throw when using setInput on a component already using twoWayBinding', () => {
      @Component({template: ''})
      class RootComp {
        @Input() value = '';
        @Output() valueChange = new EventEmitter<string>();
      }

      const value = signal('');
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const ref = createComponent(RootComp, {
        hostElement,
        environmentInjector,
        bindings: [twoWayBinding('value', value)],
      });
      ref.changeDetectorRef.detectChanges();

      expect(() => {
        ref.setInput('value', 'changed');
      }).toThrowError(
        /Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions/,
      );
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

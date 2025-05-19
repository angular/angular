/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  Pipe,
  PipeTransform,
  SimpleChanges,
  ViewChild,
  ɵɵdefineInjectable,
  ɵɵdefinePipe,
  ɵɵgetInheritedFactory,
  ɵɵinject,
} from '../../src/core';
import {TestBed} from '../../testing';
import {expect} from '@angular/private/testing/matchers';

describe('pipe', () => {
  @Pipe({
    name: 'countingPipe',
    standalone: false,
  })
  class CountingPipe implements PipeTransform {
    state: number = 0;
    transform(value: any) {
      return `${value} state:${this.state++}`;
    }
  }

  @Pipe({
    name: 'multiArgPipe',
    standalone: false,
  })
  class MultiArgPipe implements PipeTransform {
    transform(value: any, arg1: any, arg2: any, arg3 = 'default') {
      return `${value} ${arg1} ${arg2} ${arg3}`;
    }
  }

  it('should support interpolation', () => {
    @Component({
      template: '{{person.name | countingPipe}}',
      standalone: false,
    })
    class App {
      person = {name: 'bob'};
    }

    TestBed.configureTestingModule({declarations: [App, CountingPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('bob state:0');
  });

  it('should support bindings', () => {
    @Directive({
      selector: '[my-dir]',
      standalone: false,
    })
    class Dir {
      @Input() dirProp: string = '';
    }

    @Pipe({
      name: 'double',
      standalone: false,
    })
    class DoublePipe implements PipeTransform {
      transform(value: any) {
        return `${value}${value}`;
      }
    }

    @Component({
      template: `<div my-dir [dirProp]="'a'|double"></div>`,
      standalone: false,
    })
    class App {
      @ViewChild(Dir) directive!: Dir;
    }

    TestBed.configureTestingModule({declarations: [App, DoublePipe, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.directive.dirProp).toBe('aa');
  });

  it('should support arguments in pipes', () => {
    @Component({
      template: `{{person.name | multiArgPipe:'one':person.address.city}}`,
      standalone: false,
    })
    class App {
      person = {name: 'value', address: {city: 'two'}};
    }

    TestBed.configureTestingModule({declarations: [App, MultiArgPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('value one two default');
  });

  it('should support calling pipes with different number of arguments', () => {
    @Component({
      template: `{{person.name | multiArgPipe:'a':'b'}} {{0 | multiArgPipe:1:2:3}}`,
      standalone: false,
    })
    class App {
      person = {name: 'value'};
    }

    TestBed.configureTestingModule({declarations: [App, MultiArgPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toEqual('value a b default 0 1 2 3');
  });

  it('should pick a Pipe defined in `declarations` over imported Pipes', () => {
    @Pipe({
      name: 'number',
      standalone: false,
    })
    class PipeA implements PipeTransform {
      transform(value: any) {
        return `PipeA: ${value}`;
      }
    }

    @NgModule({
      declarations: [PipeA],
      exports: [PipeA],
    })
    class ModuleA {}

    @Pipe({
      name: 'number',
      standalone: false,
    })
    class PipeB implements PipeTransform {
      transform(value: any) {
        return `PipeB: ${value}`;
      }
    }

    @Component({
      selector: 'app',
      template: '{{ count | number }}',
      standalone: false,
    })
    class App {
      count = 10;
    }

    TestBed.configureTestingModule({
      imports: [ModuleA],
      declarations: [PipeB, App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('PipeB: 10');
  });

  it('should respect imported module order when selecting Pipe (last imported Pipe is used)', () => {
    @Pipe({
      name: 'number',
      standalone: false,
    })
    class PipeA implements PipeTransform {
      transform(value: any) {
        return `PipeA: ${value}`;
      }
    }

    @NgModule({
      declarations: [PipeA],
      exports: [PipeA],
    })
    class ModuleA {}

    @Pipe({
      name: 'number',
      standalone: false,
    })
    class PipeB implements PipeTransform {
      transform(value: any) {
        return `PipeB: ${value}`;
      }
    }

    @NgModule({
      declarations: [PipeB],
      exports: [PipeB],
    })
    class ModuleB {}

    @Component({
      selector: 'app',
      template: '{{ count | number }}',
      standalone: false,
    })
    class App {
      count = 10;
    }

    TestBed.configureTestingModule({
      imports: [ModuleA, ModuleB],
      declarations: [App],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('PipeB: 10');
  });

  it('should do nothing when no change', () => {
    let calls: any[] = [];

    @Pipe({
      name: 'identityPipe',
      standalone: false,
    })
    class IdentityPipe implements PipeTransform {
      transform(value: any) {
        calls.push(value);
        return value;
      }
    }

    @Component({
      template: `{{person.name | identityPipe}}`,
      standalone: false,
    })
    class App {
      person = {name: 'Megatron'};
    }

    TestBed.configureTestingModule({declarations: [App, IdentityPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(calls).toEqual(['Megatron']);

    fixture.detectChanges();

    expect(calls).toEqual(['Megatron']);
  });

  it('should support duplicates by using the later entry', () => {
    @Pipe({
      name: 'duplicatePipe',
      standalone: false,
    })
    class DuplicatePipe1 implements PipeTransform {
      transform(value: any) {
        return `${value} from duplicate 1`;
      }
    }

    @Pipe({
      name: 'duplicatePipe',
      standalone: false,
    })
    class DuplicatePipe2 implements PipeTransform {
      transform(value: any) {
        return `${value} from duplicate 2`;
      }
    }

    @Component({
      template: '{{person.name | duplicatePipe}}',
      standalone: false,
    })
    class App {
      person = {name: 'bob'};
    }

    TestBed.configureTestingModule({declarations: [App, DuplicatePipe1, DuplicatePipe2]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toEqual('bob from duplicate 2');
  });

  it('should support pipe in context of ternary operator', () => {
    @Pipe({
      name: 'pipe',
      standalone: false,
    })
    class MyPipe implements PipeTransform {
      transform(value: any): any {
        return value;
      }
    }

    @Component({
      template: `{{ condition ? 'a' : 'b' | pipe }}`,
      standalone: false,
    })
    class App {
      condition = false;
    }

    TestBed.configureTestingModule({declarations: [App, MyPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement).toHaveText('b');

    fixture.componentInstance.condition = true;
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('a');
  });

  // This test uses AOT-generated code, because we can't capture the same behavior that we want
  // when going through `TestBed`. Here we're testing the behavior of AOT-compiled code which
  // differs from the JIT code in `TestBed`, because it includes a `ɵɵgetInheritedFactory` call
  // when the pipe is using inheritance.
  it('should be able to use DI in a Pipe that extends an Injectable', () => {
    @Injectable({providedIn: 'root'})
    class SayHelloService {
      getHello() {
        return 'Hello there';
      }
    }

    // The generated code corresponds to the following decorator:
    // @Injectable()
    class ParentPipe {
      constructor(protected sayHelloService: SayHelloService) {}

      static ɵfac = (t?: any) => new (t || ParentPipe)(ɵɵinject(SayHelloService));
      static ɵprov = ɵɵdefineInjectable({token: ParentPipe, factory: ParentPipe.ɵfac});
    }

    // The generated code corresponds to the following decorator:
    // @Pipe({name: 'sayHello', pure: true})
    class SayHelloPipe extends ParentPipe implements PipeTransform {
      transform() {
        return this.sayHelloService.getHello();
      }

      static override ɵfac = (t?: any) => ɵɵgetInheritedFactory(t || SayHelloPipe)(SayHelloPipe);
      static ɵpipe = ɵɵdefinePipe({
        name: 'sayHello',
        type: SayHelloPipe,
        pure: true,
      });
    }

    @Component({
      selector: 'app',
      template: '{{ value | sayHello }}',
      imports: [SayHelloPipe],
    })
    class AppComponent {
      value = 'test';
    }
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello there');
  });

  describe('pure', () => {
    it('should call pure pipes only if the arguments change', () => {
      @Component({
        template: '{{person.name | countingPipe}}',
        standalone: false,
      })
      class App {
        person = {name: null as string | null};
      }

      TestBed.configureTestingModule({declarations: [App, CountingPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      // change from undefined -> null
      fixture.componentInstance.person.name = null;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('null state:0');

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('null state:0');

      // change from null -> some value
      fixture.componentInstance.person.name = 'bob';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('bob state:1');

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('bob state:1');

      // change from some value -> some other value
      fixture.componentInstance.person.name = 'bart';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('bart state:2');

      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('bart state:2');
    });
  });

  describe('impure', () => {
    let impurePipeInstances: CountingImpurePipe[] = [];

    @Pipe({
      name: 'countingImpurePipe',
      pure: false,
      standalone: false,
    })
    class CountingImpurePipe implements PipeTransform {
      state: number = 0;
      transform(value: any) {
        return `${value} state:${this.state++}`;
      }
      constructor() {
        impurePipeInstances.push(this);
      }
    }

    beforeEach(() => (impurePipeInstances = []));
    afterEach(() => (impurePipeInstances = []));

    it('should call impure pipes on each change detection run', () => {
      @Component({
        template: '{{person.name | countingImpurePipe}}',
        standalone: false,
      })
      class App {
        person = {name: 'bob'};
      }

      TestBed.configureTestingModule({declarations: [App, CountingImpurePipe]});
      const fixture = TestBed.createComponent(App);
      const pipe = impurePipeInstances[0];

      spyOn(pipe, 'transform').and.returnValue('');
      expect(pipe.transform).not.toHaveBeenCalled();

      fixture.detectChanges();
      expect(pipe.transform).toHaveBeenCalledTimes(2);

      fixture.detectChanges();
      expect(pipe.transform).toHaveBeenCalledTimes(4);
    });

    it('should not cache impure pipes', () => {
      @Component({
        template: `
          <div [id]="0 | countingImpurePipe">{{1 | countingImpurePipe}}</div>
          <div [id]="2 | countingImpurePipe">{{3 | countingImpurePipe}}</div>
        `,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, CountingImpurePipe]});
      TestBed.createComponent(App);

      expect(impurePipeInstances.length).toEqual(4);
      expect(impurePipeInstances[0]).toBeInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[1]).toBeInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[1]).not.toBe(impurePipeInstances[0]);
      expect(impurePipeInstances[2]).toBeInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[2]).not.toBe(impurePipeInstances[0]);
      expect(impurePipeInstances[3]).toBeInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[3]).not.toBe(impurePipeInstances[0]);
    });
  });

  describe('lifecycles', () => {
    it('should call ngOnDestroy on pipes', () => {
      let destroyCalls = 0;

      @Pipe({
        name: 'pipeWithOnDestroy',
        standalone: false,
      })
      class PipeWithOnDestroy implements PipeTransform, OnDestroy {
        ngOnDestroy() {
          destroyCalls++;
        }
        transform(value: any): any {
          return null;
        }
      }

      @Component({
        template: '{{1 | pipeWithOnDestroy}}',
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App, PipeWithOnDestroy]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(destroyCalls).toBe(1);
    });
  });

  describe('injection mechanism', () => {
    it('should be able to handle Service injection', () => {
      @Injectable()
      class Service {
        title = 'Service Title';
      }

      @Pipe({
        name: 'myConcatPipe',
        standalone: false,
      })
      class ConcatPipe implements PipeTransform {
        constructor(public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
        standalone: false,
      })
      class App {
        title = 'MyComponent Title';
      }

      TestBed.configureTestingModule({declarations: [App, ConcatPipe], providers: [Service]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('MyComponent Title - Service Title');
    });

    it('should be able to handle Token injections', () => {
      class Service {
        title = 'Service Title';
      }

      const token = new InjectionToken<Service>('service token');

      @Pipe({
        name: 'myConcatPipe',
        standalone: false,
      })
      class ConcatPipe implements PipeTransform {
        constructor(@Inject(token) public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
        standalone: false,
      })
      class App {
        title = 'MyComponent Title';
      }

      TestBed.configureTestingModule({
        declarations: [App, ConcatPipe],
        providers: [{provide: token, useValue: new Service()}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('MyComponent Title - Service Title');
    });

    it('should be able to handle Module injection', () => {
      @Injectable()
      class Service {
        title = 'Service Title';
      }

      @NgModule({providers: [Service]})
      class SomeModule {}

      @Pipe({
        name: 'myConcatPipe',
        standalone: false,
      })
      class ConcatPipe implements PipeTransform {
        constructor(public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
        standalone: false,
      })
      class App {
        title = 'MyComponent Title';
      }

      TestBed.configureTestingModule({declarations: [App, ConcatPipe], imports: [SomeModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('MyComponent Title - Service Title');
    });

    it('should inject the ChangeDetectorRef of the containing view when using pipe inside a component input', () => {
      let pipeChangeDetectorRef: ChangeDetectorRef | undefined;

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        selector: 'some-comp',
        template: 'Inner value: "{{displayValue}}"',
        standalone: false,
      })
      class SomeComp {
        @Input() value: any;
        displayValue = 0;
      }

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
              <some-comp [value]="pipeValue | testPipe"></some-comp>
              Outer value: "{{displayValue}}"
            `,
        standalone: false,
      })
      class App {
        @Input() something: any;
        @ViewChild(SomeComp) comp!: SomeComp;
        pipeValue = 10;
        displayValue = 0;
      }

      @Pipe({
        name: 'testPipe',
        standalone: false,
      })
      class TestPipe implements PipeTransform {
        constructor(changeDetectorRef: ChangeDetectorRef) {
          pipeChangeDetectorRef = changeDetectorRef;
        }

        transform() {
          return '';
        }
      }

      TestBed.configureTestingModule({declarations: [App, SomeComp, TestPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.displayValue = 1;
      fixture.componentInstance.comp.displayValue = 1;
      pipeChangeDetectorRef!.markForCheck();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Outer value: "1"');
      expect(fixture.nativeElement.textContent).toContain('Inner value: "0"');
    });

    it('should inject the ChangeDetectorRef of the containing view when using pipe inside a component input which has child nodes', () => {
      let pipeChangeDetectorRef: ChangeDetectorRef | undefined;

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        selector: 'some-comp',
        template: 'Inner value: "{{displayValue}}" <ng-content></ng-content>',
        standalone: false,
      })
      class SomeComp {
        @Input() value: any;
        displayValue = 0;
      }

      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
              <some-comp [value]="pipeValue | testPipe">
                <div>Hello</div>
              </some-comp>
              Outer value: "{{displayValue}}"
            `,
        standalone: false,
      })
      class App {
        @Input() something: any;
        @ViewChild(SomeComp) comp!: SomeComp;
        pipeValue = 10;
        displayValue = 0;
      }

      @Pipe({
        name: 'testPipe',
        standalone: false,
      })
      class TestPipe implements PipeTransform {
        constructor(changeDetectorRef: ChangeDetectorRef) {
          pipeChangeDetectorRef = changeDetectorRef;
        }

        transform() {
          return '';
        }
      }

      TestBed.configureTestingModule({declarations: [App, SomeComp, TestPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.displayValue = 1;
      fixture.componentInstance.comp.displayValue = 1;
      pipeChangeDetectorRef!.markForCheck();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Outer value: "1"');
      expect(fixture.nativeElement.textContent).toContain('Inner value: "0"');
    });
  });

  describe('pure pipe error handling', () => {
    it('should not re-invoke pure pipes if it fails initially', () => {
      @Pipe({
        name: 'throwPipe',
        pure: true,
        standalone: false,
      })
      class ThrowPipe implements PipeTransform {
        transform(): never {
          throw new Error('ThrowPipeError');
        }
      }
      @Component({
        template: `{{val | throwPipe}}`,
        standalone: false,
      })
      class App {
        val = 'anything';
      }

      const fixture = TestBed.configureTestingModule({
        declarations: [App, ThrowPipe],
      }).createComponent(App);

      // first invocation
      expect(() => fixture.detectChanges()).toThrowError(/ThrowPipeError/);

      // second invocation - should not throw
      fixture.detectChanges();
    });

    it('should display the last known result from a pure pipe when it throws', () => {
      @Pipe({
        name: 'throwPipe',
        pure: true,
        standalone: false,
      })
      class ThrowPipe implements PipeTransform {
        transform(value: string): string {
          if (value === 'KO') {
            throw new Error('ThrowPipeError');
          } else {
            return value;
          }
        }
      }

      @Component({
        template: `{{val | throwPipe}}`,
        standalone: false,
      })
      class App {
        val = 'anything';
      }

      const fixture = TestBed.configureTestingModule({
        declarations: [App, ThrowPipe],
      }).createComponent(App);

      // first invocation - no error thrown
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('anything');

      // second invocation when the error is thrown
      fixture.componentInstance.val = 'KO';
      expect(() => fixture.detectChanges()).toThrowError(/ThrowPipeError/);
      expect(fixture.nativeElement.textContent).toBe('anything');

      // third invocation with no changes to input - should not thrown and preserve the last known
      // results
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('anything');
    });

    describe('pure pipe error handling with multiple arguments', () => {
      const args: string[] = new Array(10).fill(':0');
      for (let numberOfPipeArgs = 0; numberOfPipeArgs < args.length; numberOfPipeArgs++) {
        it(`should not invoke ${numberOfPipeArgs} argument pure pipe second time if it throws unless input changes`, () => {
          // https://stackblitz.com/edit/angular-mbx2pg
          const log: string[] = [];
          @Pipe({
            name: 'throw',
            pure: true,
            standalone: false,
          })
          class ThrowPipe implements PipeTransform {
            transform(): never {
              log.push('throw');
              throw new Error('ThrowPipeError');
            }
          }
          @Component({
            template: `{{val | throw${args.slice(0, numberOfPipeArgs).join('')}}}`,
            standalone: false,
          })
          class App {
            val = 'anything';
          }

          const fixture = TestBed.configureTestingModule({
            declarations: [App, ThrowPipe],
          }).createComponent(App);
          // First invocation of detect changes should throw.
          expect(() => fixture.detectChanges()).toThrowError(/ThrowPipeError/);
          expect(log).toEqual(['throw']);
          // Second invocation should not throw as input to the `throw` pipe has not changed and
          // the pipe is pure.
          log.length = 0;
          expect(() => fixture.detectChanges()).not.toThrow();
          expect(log).toEqual([]);
          fixture.componentInstance.val = 'change';
          // First invocation of detect changes should throw because the input changed.
          expect(() => fixture.detectChanges()).toThrowError(/ThrowPipeError/);
          expect(log).toEqual(['throw']);
          // Second invocation should not throw as input to the `throw` pipe has not changed and
          // the pipe is pure.
          log.length = 0;
          expect(() => fixture.detectChanges()).not.toThrow();
          expect(log).toEqual([]);
        });
      }
    });
  });

  [false, true].forEach((componentIsStandalone) => {
    const expectedThrowRegex = new RegExp(
      "The pipe 'testMissingPipe' could not be found in the 'TestComponent' component." +
        (componentIsStandalone
          ? " Verify that it is included in the '@Component.imports' of this component"
          : ' Verify that it is declared or imported in this module'),
    );

    describe(`missing pipe detection logic (inside ${
      componentIsStandalone ? '' : 'non-'
    }standalone component)`, () => {
      it(`should throw an error if a pipe is not found in a component`, () => {
        @Component({
          template: '{{ 1 | testMissingPipe }}',
          standalone: componentIsStandalone,
        })
        class TestComponent {}

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });

      it('should throw an error if a pipe is not found inside an inline template', () => {
        @Component({
          template: `
            <ng-container *ngIf="true">
              {{ value | testMissingPipe }}
            </ng-container>`,
          standalone: componentIsStandalone,
          ...(componentIsStandalone ? {imports: [CommonModule]} : {}),
        })
        class TestComponent {
          value: string = 'test';
        }

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });

      it('should throw an error if a pipe is not found inside a projected content', () => {
        @Component({
          selector: 'app-test-child',
          template: '<ng-content></ng-content>',
          standalone: componentIsStandalone,
        })
        class TestChildComponent {}

        @Component({
          template: `
            <app-test-child>
              {{ value | testMissingPipe }}
            </app-test-child>`,
          standalone: componentIsStandalone,
          ...(componentIsStandalone ? {imports: [TestChildComponent]} : {}),
        })
        class TestComponent {
          value: string = 'test';
        }

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent, TestChildComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });

      it('should throw an error if a pipe is not found inside a projected content in an inline template', () => {
        @Component({
          selector: 'app-test-child',
          template: '<ng-content></ng-content>',
          standalone: componentIsStandalone,
        })
        class TestChildComponent {}

        @Component({
          template: `
              <app-test-child>
                <ng-container *ngIf="true">
                  {{ value | testMissingPipe }}
                </ng-container>
              </app-test-child>`,
          standalone: componentIsStandalone,
          ...(componentIsStandalone ? {imports: [TestChildComponent, CommonModule]} : {}),
        })
        class TestComponent {
          value: string = 'test';
        }

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent, TestChildComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });

      it('should throw an error if a pipe is not found in a property binding', () => {
        @Component({
          template: '<div [title]="value | testMissingPipe"></div>',
          standalone: componentIsStandalone,
        })
        class TestComponent {
          value: string = 'test';
        }

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });

      it('should throw an error if a pipe is not found inside a structural directive input', () => {
        @Component({
          template: '<div *ngIf="isVisible | testMissingPipe"></div>',
          standalone: componentIsStandalone,
          ...(componentIsStandalone ? {imports: [CommonModule]} : {}),
        })
        class TestComponent {
          isVisible: boolean = true;
        }

        if (!componentIsStandalone) {
          TestBed.configureTestingModule({declarations: [TestComponent]});
        }

        expect(() => {
          const fixture = TestBed.createComponent(TestComponent);
          fixture.detectChanges();
        }).toThrowError(expectedThrowRegex);
      });
    });
  });
});

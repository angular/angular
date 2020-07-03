/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, Inject, Injectable, InjectionToken, Input, NgModule, OnChanges, OnDestroy, Pipe, PipeTransform, SimpleChanges, ViewChild, WrappedValue} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled} from '@angular/private/testing';

describe('pipe', () => {
  @Pipe({name: 'countingPipe'})
  class CountingPipe implements PipeTransform {
    state: number = 0;
    transform(value: any) {
      return `${value} state:${this.state++}`;
    }
  }

  @Pipe({name: 'multiArgPipe'})
  class MultiArgPipe implements PipeTransform {
    transform(value: any, arg1: any, arg2: any, arg3 = 'default') {
      return `${value} ${arg1} ${arg2} ${arg3}`;
    }
  }

  it('should support interpolation', () => {
    @Component({
      template: '{{person.name | countingPipe}}',
    })
    class App {
      person = {name: 'bob'};
    }

    TestBed.configureTestingModule({declarations: [App, CountingPipe]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('bob state:0');
  });

  it('should throw if pipe is not found', () => {
    @Component({
      template: '{{1 | randomPipeName}}',
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App]});

    expect(() => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    }).toThrowError(/The pipe 'randomPipeName' could not be found/);
  });

  it('should support bindings', () => {
    @Directive({selector: '[my-dir]'})
    class Dir {
      @Input() dirProp: string = '';
    }

    @Pipe({name: 'double'})
    class DoublePipe implements PipeTransform {
      transform(value: any) {
        return `${value}${value}`;
      }
    }

    @Component({
      template: `<div my-dir [dirProp]="'a'|double"></div>`,
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
    @Pipe({name: 'number'})
    class PipeA implements PipeTransform {
      transform(value: any) {
        return `PipeA: ${value}`;
      }
    }

    @NgModule({
      declarations: [PipeA],
      exports: [PipeA],
    })
    class ModuleA {
    }

    @Pipe({name: 'number'})
    class PipeB implements PipeTransform {
      transform(value: any) {
        return `PipeB: ${value}`;
      }
    }

    @Component({
      selector: 'app',
      template: '{{ count | number }}',
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

  it('should respect imported module order when selecting Pipe (last imported Pipe is used)',
     () => {
       @Pipe({name: 'number'})
       class PipeA implements PipeTransform {
         transform(value: any) {
           return `PipeA: ${value}`;
         }
       }

       @NgModule({
         declarations: [PipeA],
         exports: [PipeA],
       })
       class ModuleA {
       }

       @Pipe({name: 'number'})
       class PipeB implements PipeTransform {
         transform(value: any) {
           return `PipeB: ${value}`;
         }
       }

       @NgModule({
         declarations: [PipeB],
         exports: [PipeB],
       })
       class ModuleB {
       }

       @Component({
         selector: 'app',
         template: '{{ count | number }}',
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

    @Pipe({name: 'identityPipe'})
    class IdentityPipe implements PipeTransform {
      transform(value: any) {
        calls.push(value);
        return value;
      }
    }

    @Component({
      template: `{{person.name | identityPipe}}`,
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
    @Pipe({name: 'duplicatePipe'})
    class DuplicatePipe1 implements PipeTransform {
      transform(value: any) {
        return `${value} from duplicate 1`;
      }
    }

    @Pipe({name: 'duplicatePipe'})
    class DuplicatePipe2 implements PipeTransform {
      transform(value: any) {
        return `${value} from duplicate 2`;
      }
    }

    @Component({
      template: '{{person.name | duplicatePipe}}',
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
    @Pipe({name: 'pipe'})
    class MyPipe implements PipeTransform {
      transform(value: any): any {
        return value;
      }
    }

    @Component({
      template: `{{ condition ? 'a' : 'b' | pipe }}`,
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

  describe('pipes within an optional chain', () => {
    it('should not dirty unrelated inputs', () => {
      // https://github.com/angular/angular/issues/37194
      // https://github.com/angular/angular/issues/37591
      // Using a pipe in the LHS of safe navigation operators would clobber unrelated bindings
      // iff the pipe returns WrappedValue, incorrectly causing the unrelated binding
      // to be considered changed.
      const log: string[] = [];

      @Component({template: `<my-cmp [value1]="1" [value2]="(value2 | pipe)?.id"></my-cmp>`})
      class App {
        value2 = {id: 2};
      }

      @Component({selector: 'my-cmp', template: ''})
      class MyCmp {
        @Input()
        set value1(value1: number) {
          log.push(`set value1=${value1}`);
        }

        @Input()
        set value2(value2: number) {
          log.push(`set value2=${value2}`);
        }
      }

      @Pipe({name: 'pipe'})
      class MyPipe implements PipeTransform {
        transform(value: any): any {
          log.push('pipe');
          return WrappedValue.wrap(value);
        }
      }

      TestBed.configureTestingModule({declarations: [App, MyCmp, MyPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges(/* checkNoChanges */ false);

      // Both bindings should have been set. Note: ViewEngine evaluates the pipe out-of-order,
      // before setting inputs.
      expect(log).toEqual(
          ivyEnabled ?
              [
                'set value1=1',
                'pipe',
                'set value2=2',
              ] :
              [
                'pipe',
                'set value1=1',
                'set value2=2',
              ]);
      log.length = 0;

      fixture.componentInstance.value2 = {id: 3};
      fixture.detectChanges(/* checkNoChanges */ false);

      // value1 did not change, so it should not have been set.
      expect(log).toEqual([
        'pipe',
        'set value2=3',
      ]);
    });

    it('should not include unrelated inputs in ngOnChanges', () => {
      // https://github.com/angular/angular/issues/37194
      // https://github.com/angular/angular/issues/37591
      // Using a pipe in the LHS of safe navigation operators would clobber unrelated bindings
      // iff the pipe returns WrappedValue, incorrectly causing the unrelated binding
      // to be considered changed.
      const log: string[] = [];

      @Component({template: `<my-cmp [value1]="1" [value2]="(value2 | pipe)?.id"></my-cmp>`})
      class App {
        value2 = {id: 2};
      }

      @Component({selector: 'my-cmp', template: ''})
      class MyCmp implements OnChanges {
        @Input() value1!: number;

        @Input() value2!: number;

        ngOnChanges(changes: SimpleChanges): void {
          if (changes.value1) {
            const {previousValue, currentValue, firstChange} = changes.value1;
            log.push(`change value1: ${previousValue} -> ${currentValue} (${firstChange})`);
          }
          if (changes.value2) {
            const {previousValue, currentValue, firstChange} = changes.value2;
            log.push(`change value2: ${previousValue} -> ${currentValue} (${firstChange})`);
          }
        }
      }

      @Pipe({name: 'pipe'})
      class MyPipe implements PipeTransform {
        transform(value: any): any {
          log.push('pipe');
          return WrappedValue.wrap(value);
        }
      }

      TestBed.configureTestingModule({declarations: [App, MyCmp, MyPipe]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges(/* checkNoChanges */ false);

      // Both bindings should have been included in ngOnChanges.
      expect(log).toEqual([
        'pipe',
        'change value1: undefined -> 1 (true)',
        'change value2: undefined -> 2 (true)',
      ]);
      log.length = 0;

      fixture.componentInstance.value2 = {id: 3};
      fixture.detectChanges(/* checkNoChanges */ false);

      // value1 did not change, so it should not have been included in ngOnChanges
      expect(log).toEqual([
        'pipe',
        'change value2: 2 -> 3 (false)',
      ]);
    });
  });

  describe('pure', () => {
    it('should call pure pipes only if the arguments change', () => {
      @Component({
        template: '{{person.name | countingPipe}}',
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

    @Pipe({name: 'countingImpurePipe', pure: false})
    class CountingImpurePipe implements PipeTransform {
      state: number = 0;
      transform(value: any) {
        return `${value} state:${this.state++}`;
      }
      constructor() {
        impurePipeInstances.push(this);
      }
    }

    beforeEach(() => impurePipeInstances = []);
    afterEach(() => impurePipeInstances = []);

    it('should call impure pipes on each change detection run', () => {
      @Component({
        template: '{{person.name | countingImpurePipe}}',
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
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, CountingImpurePipe]});
      TestBed.createComponent(App);

      expect(impurePipeInstances.length).toEqual(4);
      expect(impurePipeInstances[0]).toBeAnInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[1]).toBeAnInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[1]).not.toBe(impurePipeInstances[0]);
      expect(impurePipeInstances[2]).toBeAnInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[2]).not.toBe(impurePipeInstances[0]);
      expect(impurePipeInstances[3]).toBeAnInstanceOf(CountingImpurePipe);
      expect(impurePipeInstances[3]).not.toBe(impurePipeInstances[0]);
    });
  });

  describe('lifecycles', () => {
    it('should call ngOnDestroy on pipes', () => {
      let destroyCalls = 0;

      @Pipe({name: 'pipeWithOnDestroy'})
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
      })
      class App {
      }

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

      @Pipe({name: 'myConcatPipe'})
      class ConcatPipe implements PipeTransform {
        constructor(public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
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

      @Pipe({name: 'myConcatPipe'})
      class ConcatPipe implements PipeTransform {
        constructor(@Inject(token) public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
      })
      class App {
        title = 'MyComponent Title';
      }

      TestBed.configureTestingModule({
        declarations: [App, ConcatPipe],
        providers: [{provide: token, useValue: new Service()}]
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
      class SomeModule {
      }

      @Pipe({name: 'myConcatPipe'})
      class ConcatPipe implements PipeTransform {
        constructor(public service: Service) {}
        transform(value: string): string {
          return `${value} - ${this.service.title}`;
        }
      }

      @Component({
        template: '{{title | myConcatPipe}}',
      })
      class App {
        title = 'MyComponent Title';
      }

      TestBed.configureTestingModule({declarations: [App, ConcatPipe], imports: [SomeModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('MyComponent Title - Service Title');
    });

    it('should inject the ChangeDetectorRef of the containing view when using pipe inside a component input',
       () => {
         let pipeChangeDetectorRef: ChangeDetectorRef|undefined;

         @Component({
           changeDetection: ChangeDetectionStrategy.OnPush,
           selector: 'some-comp',
           template: 'Inner value: "{{displayValue}}"',
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
         })
         class App {
           @Input() something: any;
           @ViewChild(SomeComp) comp!: SomeComp;
           pipeValue = 10;
           displayValue = 0;
         }

         @Pipe({name: 'testPipe'})
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

    it('should inject the ChangeDetectorRef of the containing view when using pipe inside a component input which has child nodes',
       () => {
         let pipeChangeDetectorRef: ChangeDetectorRef|undefined;

         @Component({
           changeDetection: ChangeDetectionStrategy.OnPush,
           selector: 'some-comp',
           template: 'Inner value: "{{displayValue}}" <ng-content></ng-content>',
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
         })
         class App {
           @Input() something: any;
           @ViewChild(SomeComp) comp!: SomeComp;
           pipeValue = 10;
           displayValue = 0;
         }

         @Pipe({name: 'testPipe'})
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
      @Pipe({name: 'throwPipe', pure: true})
      class ThrowPipe implements PipeTransform {
        transform(): never {
          throw new Error('ThrowPipeError');
        }
      }
      @Component({template: `{{val | throwPipe}}`})
      class App {
        val = 'anything';
      }

      const fixture =
          TestBed.configureTestingModule({declarations: [App, ThrowPipe]}).createComponent(App);

      // first invocation
      expect(() => fixture.detectChanges()).toThrowError(/ThrowPipeError/);

      // second invocation - should not throw
      fixture.detectChanges();
    });


    it('should display the last known result from a pure pipe when it throws', () => {
      @Pipe({name: 'throwPipe', pure: true})
      class ThrowPipe implements PipeTransform {
        transform(value: string): string {
          if (value === 'KO') {
            throw new Error('ThrowPipeError');
          } else {
            return value;
          }
        }
      }

      @Component({template: `{{val | throwPipe}}`})
      class App {
        val = 'anything';
      }

      const fixture =
          TestBed.configureTestingModule({declarations: [App, ThrowPipe]}).createComponent(App);

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
        it(`should not invoke ${
               numberOfPipeArgs} argument pure pipe second time if it throws unless input changes`,
           () => {
             // https://stackblitz.com/edit/angular-mbx2pg
             const log: string[] = [];
             @Pipe({name: 'throw', pure: true})
             class ThrowPipe implements PipeTransform {
               transform(): never {
                 log.push('throw');
                 throw new Error('ThrowPipeError');
               }
             }
             @Component({template: `{{val | throw${args.slice(0, numberOfPipeArgs).join('')}}}`})
             class App {
               val = 'anything';
             }

             const fixture = TestBed.configureTestingModule({declarations: [App, ThrowPipe]})
                                 .createComponent(App);
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
});

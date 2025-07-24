/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DebugElement,
  Directive,
  DoCheck,
  EventEmitter,
  HostBinding,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  Provider,
  RendererFactory2,
  RendererType2,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {ComponentFixture, fakeAsync, TestBed} from '../../testing';
import {By} from '@angular/platform-browser';
import {isTextNode} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';

import {MockResourceLoader} from './resource_loader_mock';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

const TEST_COMPILER_PROVIDERS: Provider[] = [
  {provide: ResourceLoader, useClass: MockResourceLoader, deps: []},
];

(function () {
  let renderLog: RenderLog;
  let directiveLog: DirectiveLog;

  function createCompFixture<T>(template: string): ComponentFixture<TestComponent>;
  function createCompFixture<T>(template: string, compType: Type<T>): ComponentFixture<T>;
  function createCompFixture<T>(
    template: string,
    compType: Type<T> = <any>TestComponent,
  ): ComponentFixture<T> {
    TestBed.overrideComponent(compType, {set: new Component({template})});

    initHelpers();

    return TestBed.createComponent(compType);
  }

  function initHelpers(): void {
    renderLog = TestBed.inject(RenderLog);
    directiveLog = TestBed.inject(DirectiveLog);
    patchLoggingRenderer2(TestBed.inject(RendererFactory2), renderLog);
  }

  function queryDirs(el: DebugElement, dirType: Type<any>): any {
    const nodes = el.queryAllNodes(By.directive(dirType));
    return nodes.map((node) => node.injector.get(dirType));
  }

  function _bindSimpleProp<T>(bindAttr: string): ComponentFixture<TestComponent>;
  function _bindSimpleProp<T>(bindAttr: string, compType: Type<T>): ComponentFixture<T>;
  function _bindSimpleProp<T>(
    bindAttr: string,
    compType: Type<T> = <any>TestComponent,
  ): ComponentFixture<T> {
    const template = `<div ${bindAttr}></div>`;
    return createCompFixture(template, compType);
  }

  function _bindSimpleValue(expression: any): ComponentFixture<TestComponent>;
  function _bindSimpleValue<T>(expression: any, compType: Type<T>): ComponentFixture<T>;
  function _bindSimpleValue<T>(
    expression: any,
    compType: Type<T> = <any>TestComponent,
  ): ComponentFixture<T> {
    return _bindSimpleProp(`[id]='${expression}'`, compType);
  }

  function _bindAndCheckSimpleValue(
    expression: any,
    compType: Type<any> = TestComponent,
  ): string[] {
    const ctx = _bindSimpleValue(expression, compType);
    ctx.detectChanges(false);
    return renderLog.log;
  }

  describe(`ChangeDetection`, () => {
    beforeEach(() => {
      TestBed.configureCompiler({providers: TEST_COMPILER_PROVIDERS});
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
        declarations: [
          TestData,
          TestDirective,
          TestComponent,
          AnotherComponent,
          TestLocals,
          CompWithRef,
          WrapCompWithRef,
          EmitterDirective,
          PushComp,
          OnDestroyDirective,
          OrderCheckDirective2,
          OrderCheckDirective0,
          OrderCheckDirective1,
          Gh9882,
          Uninitialized,
          Person,
          PersonHolder,
          PersonHolderHolder,
          CountingPipe,
          CountingImpurePipe,
          MultiArgPipe,
          PipeWithOnDestroy,
          IdentityPipe,
        ],
        providers: [RenderLog, DirectiveLog],
      });
    });

    describe('expressions', () => {
      it('should support literals', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue(10)).toEqual(['id=10']);
      }));

      it('should strip quotes from literals', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('"str"')).toEqual(['id=str']);
      }));

      it('should support newlines in literals', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('"a\n\nb"')).toEqual(['id=a\n\nb']);
      }));

      it('should support + operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('10 + 2')).toEqual(['id=12']);
      }));

      it('should support - operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('10 - 2')).toEqual(['id=8']);
      }));

      it('should support * operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('10 * 2')).toEqual(['id=20']);
      }));

      it('should support / operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('10 / 2')).toEqual([`id=5`]);
      }));

      it('should support % operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('11 % 2')).toEqual(['id=1']);
      }));

      it('should support == operations on identical', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 == 1')).toEqual(['id=true']);
      }));

      it('should support != operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 != 1')).toEqual(['id=false']);
      }));

      it('should support == operations on coerceible', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 == true')).toEqual([`id=true`]);
      }));

      it('should support === operations on identical', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 === 1')).toEqual(['id=true']);
      }));

      it('should support !== operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 !== 1')).toEqual(['id=false']);
      }));

      it('should support === operations on coerceible', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 === true')).toEqual(['id=false']);
      }));

      it('should support true < operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 < 2')).toEqual(['id=true']);
      }));

      it('should support false < operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 < 1')).toEqual(['id=false']);
      }));

      it('should support false > operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 > 2')).toEqual(['id=false']);
      }));

      it('should support true > operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 > 1')).toEqual(['id=true']);
      }));

      it('should support true <= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 <= 2')).toEqual(['id=true']);
      }));

      it('should support equal <= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 <= 2')).toEqual(['id=true']);
      }));

      it('should support false <= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 <= 1')).toEqual(['id=false']);
      }));

      it('should support true >= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 >= 1')).toEqual(['id=true']);
      }));

      it('should support equal >= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('2 >= 2')).toEqual(['id=true']);
      }));

      it('should support false >= operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 >= 2')).toEqual(['id=false']);
      }));

      it('should support true && operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('true && true')).toEqual(['id=true']);
      }));

      it('should support false && operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('true && false')).toEqual(['id=false']);
      }));

      it('should support true || operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('true || false')).toEqual(['id=true']);
      }));

      it('should support false || operations', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('false || false')).toEqual(['id=false']);
      }));

      it('should support negate', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('!true')).toEqual(['id=false']);
      }));

      it('should support double negate', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('!!true')).toEqual(['id=true']);
      }));

      it('should support true conditionals', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 < 2 ? 1 : 2')).toEqual(['id=1']);
      }));

      it('should support false conditionals', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('1 > 2 ? 1 : 2')).toEqual(['id=2']);
      }));

      it('should support keyed access to a list item', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('["foo", "bar"][0]')).toEqual(['id=foo']);
      }));

      it('should support keyed access to a map item', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('{"foo": "bar"}["foo"]')).toEqual(['id=bar']);
      }));

      it('should report all changes on the first run including uninitialized values', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('value', Uninitialized)).toEqual(['id=null']);
      }));

      it('should report all changes on the first run including null values', fakeAsync(() => {
        const ctx = _bindSimpleValue('a', TestData);
        ctx.componentInstance.a = null;
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=null']);
      }));

      it('should support simple chained property access', fakeAsync(() => {
        const ctx = _bindSimpleValue('address.city', Person);
        ctx.componentInstance.name = 'Victor';
        ctx.componentInstance.address = new Address('Grenoble');
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=Grenoble']);
      }));

      describe('safe navigation operator', () => {
        it('should support reading properties of nulls', fakeAsync(() => {
          const ctx = _bindSimpleValue('address?.city', Person);
          ctx.componentInstance.address = null!;
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should support calling methods on nulls', fakeAsync(() => {
          const ctx = _bindSimpleValue('address?.toString()', Person);
          ctx.componentInstance.address = null!;
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should support reading properties on non nulls', fakeAsync(() => {
          const ctx = _bindSimpleValue('address?.city', Person);
          ctx.componentInstance.address = new Address('MTV');
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=MTV']);
        }));

        it('should support calling methods on non nulls', fakeAsync(() => {
          const ctx = _bindSimpleValue('address?.toString()', Person);
          ctx.componentInstance.address = new Address('MTV');
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=MTV']);
        }));

        it('should support short-circuting safe navigation', fakeAsync(() => {
          const ctx = _bindSimpleValue('value?.address.city', PersonHolder);
          ctx.componentInstance.value = null!;
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should support nested short-circuting safe navigation', fakeAsync(() => {
          const ctx = _bindSimpleValue('value.value?.address.city', PersonHolderHolder);
          ctx.componentInstance.value = new PersonHolder();
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should support chained short-circuting safe navigation', fakeAsync(() => {
          const ctx = _bindSimpleValue('value?.value?.address.city', PersonHolderHolder);
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should support short-circuting array index operations', fakeAsync(() => {
          const ctx = _bindSimpleValue('value?.phones[0]', PersonHolder);
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual(['id=null']);
        }));

        it('should still throw if right-side would throw', fakeAsync(() => {
          expect(() => {
            const ctx = _bindSimpleValue('value?.address.city', PersonHolder);
            const person = new Person();
            person.address = null!;
            ctx.componentInstance.value = person;
            ctx.detectChanges(false);
          }).toThrow();
        }));
      });

      it('should support method calls', fakeAsync(() => {
        const ctx = _bindSimpleValue('sayHi("Jim")', Person);
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=Hi, Jim']);
      }));

      it('should support function calls', fakeAsync(() => {
        const ctx = _bindSimpleValue('a()(99)', TestData);
        ctx.componentInstance.a = () => (a: any) => a;
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=99']);
      }));

      it('should support chained method calls', fakeAsync(() => {
        const ctx = _bindSimpleValue('address.toString()', Person);
        ctx.componentInstance.address = new Address('MTV');
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=MTV']);
      }));

      it('should support NaN', fakeAsync(() => {
        const ctx = _bindSimpleValue('age', Person);
        ctx.componentInstance.age = NaN;
        ctx.detectChanges(false);

        expect(renderLog.log).toEqual(['id=NaN']);
        renderLog.clear();

        ctx.detectChanges(false);
        expect(renderLog.log).toEqual([]);
      }));

      it('should do simple watching', fakeAsync(() => {
        const ctx = _bindSimpleValue('name', Person);
        ctx.componentInstance.name = 'misko';

        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=misko']);
        renderLog.clear();

        ctx.detectChanges(false);
        expect(renderLog.log).toEqual([]);
        renderLog.clear();

        ctx.componentInstance.name = 'Misko';
        ctx.detectChanges(false);
        expect(renderLog.log).toEqual(['id=Misko']);
      }));

      it('should support literal array made of literals', fakeAsync(() => {
        const ctx = _bindSimpleValue('[1, 2]');
        ctx.detectChanges(false);
        expect(renderLog.loggedValues).toEqual([[1, 2]]);
      }));

      it('should support empty literal array', fakeAsync(() => {
        const ctx = _bindSimpleValue('[]');
        ctx.detectChanges(false);
        expect(renderLog.loggedValues).toEqual([[]]);
      }));

      it('should support literal array made of expressions', fakeAsync(() => {
        const ctx = _bindSimpleValue('[1, a]', TestData);
        ctx.componentInstance.a = 2;
        ctx.detectChanges(false);
        expect(renderLog.loggedValues).toEqual([[1, 2]]);
      }));

      it('should not recreate literal arrays unless their content changed', fakeAsync(() => {
        const ctx = _bindSimpleValue('[1, a]', TestData);
        ctx.componentInstance.a = 2;
        ctx.detectChanges(false);
        ctx.detectChanges(false);
        ctx.componentInstance.a = 3;
        ctx.detectChanges(false);
        ctx.detectChanges(false);
        expect(renderLog.loggedValues).toEqual([
          [1, 2],
          [1, 3],
        ]);
      }));

      it('should support literal maps made of literals', fakeAsync(() => {
        const ctx = _bindSimpleValue('{z: 1}');
        ctx.detectChanges(false);
        expect(renderLog.loggedValues[0]['z']).toEqual(1);
      }));

      it('should support empty literal map', fakeAsync(() => {
        const ctx = _bindSimpleValue('{}');
        ctx.detectChanges(false);
        expect(renderLog.loggedValues).toEqual([{}]);
      }));

      it('should support literal maps made of expressions', fakeAsync(() => {
        const ctx = _bindSimpleValue('{z: a}');
        ctx.componentInstance.a = 1;
        ctx.detectChanges(false);
        expect(renderLog.loggedValues[0]['z']).toEqual(1);
      }));

      it('should not recreate literal maps unless their content changed', fakeAsync(() => {
        const ctx = _bindSimpleValue('{z: a}');
        ctx.componentInstance.a = 1;
        ctx.detectChanges(false);
        ctx.detectChanges(false);
        ctx.componentInstance.a = 2;
        ctx.detectChanges(false);
        ctx.detectChanges(false);
        expect(renderLog.loggedValues.length).toBe(2);
        expect(renderLog.loggedValues[0]['z']).toEqual(1);
        expect(renderLog.loggedValues[1]['z']).toEqual(2);
      }));

      it('should ignore empty bindings', fakeAsync(() => {
        const ctx = _bindSimpleProp('[id]', TestData);
        ctx.componentInstance.a = 'value';
        ctx.detectChanges(false);

        expect(renderLog.log).toEqual([]);
      }));

      it('should support interpolation', fakeAsync(() => {
        const ctx = _bindSimpleProp('id="B{{a}}A"', TestData);
        ctx.componentInstance.a = 'value';
        ctx.detectChanges(false);

        expect(renderLog.log).toEqual(['id=BvalueA']);
      }));

      it('should output empty strings for null values in interpolation', fakeAsync(() => {
        const ctx = _bindSimpleProp('id="B{{a}}A"', TestData);
        ctx.componentInstance.a = null;
        ctx.detectChanges(false);

        expect(renderLog.log).toEqual(['id=BA']);
      }));

      it('should escape values in literals that indicate interpolation', fakeAsync(() => {
        expect(_bindAndCheckSimpleValue('"$"')).toEqual(['id=$']);
      }));

      it('should read locals', fakeAsync(() => {
        const ctx = createCompFixture(
          '<ng-template testLocals let-local="someLocal">{{local}}</ng-template>',
        );
        ctx.detectChanges(false);

        expect(renderLog.log).toEqual(['{{someLocalValue}}']);
      }));

      describe('pipes', () => {
        it('should use the return value of the pipe', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | countingPipe', Person);
          ctx.componentInstance.name = 'bob';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['bob state:0']);
        }));

        it('should support arguments in pipes', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | multiArgPipe:"one":address.city', Person);
          ctx.componentInstance.name = 'value';
          ctx.componentInstance.address = new Address('two');
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['value one two default']);
        }));

        it('should associate pipes right-to-left', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | multiArgPipe:"a":"b" | multiArgPipe:0:1', Person);
          ctx.componentInstance.name = 'value';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['value a b default 0 1 default']);
        }));

        it('should support calling pure pipes with different number of arguments', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | multiArgPipe:"a":"b" | multiArgPipe:0:1:2', Person);
          ctx.componentInstance.name = 'value';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['value a b default 0 1 2']);
        }));

        it('should do nothing when no change', fakeAsync(() => {
          const ctx = _bindSimpleValue('"Megatron" | identityPipe', Person);

          ctx.detectChanges(false);

          expect(renderLog.log).toEqual(['id=Megatron']);

          renderLog.clear();
          ctx.detectChanges(false);

          expect(renderLog.log).toEqual([]);
        }));

        it('should call pure pipes only if the arguments change', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | countingPipe', Person);
          // change from undefined -> null
          ctx.componentInstance.name = null!;
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0']);
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0']);

          // change from null -> some value
          ctx.componentInstance.name = 'bob';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1']);
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1']);

          // change from some value -> some other value
          ctx.componentInstance.name = 'bart';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1', 'bart state:2']);
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['null state:0', 'bob state:1', 'bart state:2']);
        }));

        it('should call pure pipes that are used multiple times only when the arguments change', fakeAsync(() => {
          const ctx = createCompFixture(
            `<div [id]="name | countingPipe"></div><div [id]="age | countingPipe"></div>` +
              '<div *ngFor="let x of [1,2]" [id]="address.city | countingPipe"></div>',
            Person,
          );
          ctx.componentInstance.name = 'a';
          ctx.componentInstance.age = 10;
          ctx.componentInstance.address = new Address('mtv');
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual([
            'a state:0',
            '10 state:0',
            'mtv state:0',
            'mtv state:0',
          ]);
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual([
            'a state:0',
            '10 state:0',
            'mtv state:0',
            'mtv state:0',
          ]);
          ctx.componentInstance.age = 11;
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual([
            'a state:0',
            '10 state:0',
            'mtv state:0',
            'mtv state:0',
            '11 state:1',
          ]);
        }));

        it('should call impure pipes on each change detection run', fakeAsync(() => {
          const ctx = _bindSimpleValue('name | countingImpurePipe', Person);
          ctx.componentInstance.name = 'bob';
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['bob state:0']);
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual(['bob state:0', 'bob state:1']);
        }));
      });

      describe('event expressions', () => {
        it('should support field assignments', fakeAsync(() => {
          const ctx = _bindSimpleProp('(event)="b=a=$event"');
          const childEl = ctx.debugElement.children[0];
          const evt = 'EVENT';
          childEl.triggerEventHandler('event', evt);

          expect(ctx.componentInstance.a).toEqual(evt);
          expect(ctx.componentInstance.b).toEqual(evt);
        }));

        it('should support keyed assignments', fakeAsync(() => {
          const ctx = _bindSimpleProp('(event)="a[0]=$event"');
          const childEl = ctx.debugElement.children[0];
          ctx.componentInstance.a = ['OLD'];
          const evt = 'EVENT';
          childEl.triggerEventHandler('event', evt);
          expect(ctx.componentInstance.a).toEqual([evt]);
        }));

        it('should support chains', fakeAsync(() => {
          const ctx = _bindSimpleProp('(event)="a=a+1; a=a+1;"');
          const childEl = ctx.debugElement.children[0];
          ctx.componentInstance.a = 0;
          childEl.triggerEventHandler('event', 'EVENT');
          expect(ctx.componentInstance.a).toEqual(2);
        }));

        it('should support empty literals', fakeAsync(() => {
          const ctx = _bindSimpleProp('(event)="a=[{},[]]"');
          const childEl = ctx.debugElement.children[0];
          childEl.triggerEventHandler('event', 'EVENT');

          expect(ctx.componentInstance.a).toEqual([{}, []]);
        }));

        xit('should throw when trying to assign to a local', fakeAsync(() => {
          expect(() => {
            _bindSimpleProp('(event)="$event=1"');
          }).toThrowError(
            new RegExp(
              'Cannot assign value (.*) to template variable (.*). Template variables are read-only.',
            ),
          );
        }));

        it('should support short-circuiting', fakeAsync(() => {
          const ctx = _bindSimpleProp('(event)="true ? a = a + 1 : a = a + 1"');
          const childEl = ctx.debugElement.children[0];
          ctx.componentInstance.a = 0;
          childEl.triggerEventHandler('event', 'EVENT');
          expect(ctx.componentInstance.a).toEqual(1);
        }));
      });
    });

    describe('RendererFactory', () => {
      it('should call the begin and end methods on the renderer factory when change detection is called', fakeAsync(() => {
        const ctx = createCompFixture('<div testDirective [a]="42"></div>');
        const rf = TestBed.inject(RendererFactory2);
        // TODO: @JiaLiPassion, need to wait @types/jasmine to fix the
        // optional method infer issue.
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43486
        spyOn(rf as any, 'begin');
        spyOn(rf as any, 'end');
        expect(rf.begin).not.toHaveBeenCalled();
        expect(rf.end).not.toHaveBeenCalled();

        ctx.detectChanges(false);
        expect(rf.begin).toHaveBeenCalled();
        expect(rf.end).toHaveBeenCalled();
      }));
    });

    describe('change notification', () => {
      describe('updating directives', () => {
        it('should happen without invoking the renderer', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective [a]="42"></div>');
          ctx.detectChanges(false);
          expect(renderLog.log).toEqual([]);
          expect(queryDirs(ctx.debugElement, TestDirective)[0].a).toEqual(42);
        }));
      });

      describe('reading directives', () => {
        it('should read directive properties', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective [a]="42" ref-dir="testDirective" [id]="dir.a"></div>',
          );
          ctx.detectChanges(false);
          expect(renderLog.loggedValues).toEqual([42]);
        }));
      });

      describe('ngOnChanges', () => {
        it('should notify the directive when a group of records changes', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div [testDirective]="\'aName\'" [a]="1" [b]="2"></div><div [testDirective]="\'bName\'" [a]="4"></div>',
          );
          ctx.detectChanges(false);

          const dirs = <TestDirective[]>queryDirs(ctx.debugElement, TestDirective);
          expect(dirs[0].changes).toEqual({
            'a': new SimpleChange(undefined, 1, true),
            'b': new SimpleChange(undefined, 2, true),
            'name': new SimpleChange(undefined, 'aName', true),
          });
          expect(dirs[1].changes).toEqual({
            'a': new SimpleChange(undefined, 4, true),
            'name': new SimpleChange(undefined, 'bName', true),
          });
        }));
      });
    });

    describe('lifecycle', () => {
      function createCompWithContentAndViewChild(): ComponentFixture<any> {
        TestBed.overrideComponent(AnotherComponent, {
          set: new Component({
            selector: 'other-cmp',
            template: '<div testDirective="viewChild"></div>',
          }),
        });

        return createCompFixture(
          '<div testDirective="parent"><div *ngIf="true" testDirective="contentChild"></div><other-cmp></other-cmp></div>',
          TestComponent,
        );
      }

      describe('ngOnInit', () => {
        it('should be called after ngOnChanges', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');
          expect(directiveLog.filter(['ngOnInit', 'ngOnChanges'])).toEqual([]);

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngOnInit', 'ngOnChanges'])).toEqual([
            'dir.ngOnChanges',
            'dir.ngOnInit',
          ]);
          directiveLog.clear();

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
        }));

        it('should only be called only once', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngOnInit'])).toEqual(['dir.ngOnInit']);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngOnInit'])).toEqual([]);

          // re-verify that changes should not call them
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
        }));

        it('should not call ngOnInit again if it throws', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir" throwOn="ngOnInit"></div>');

          let errored = false;
          // First pass fails, but ngOnInit should be called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            expect((e as Error).message).toBe('Boom!');
            errored = true;
          }
          expect(errored).toBe(true);

          expect(directiveLog.filter(['ngOnInit'])).toEqual(['dir.ngOnInit']);
          directiveLog.clear();

          // Second change detection also fails, but this time ngOnInit should not be called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            expect((e as Error).message).toBe('Boom!');
            throw new Error('Second detectChanges() should not have called ngOnInit.');
          }
          expect(directiveLog.filter(['ngOnInit'])).toEqual([]);
        }));
      });

      describe('ngDoCheck', () => {
        it('should be called after ngOnInit', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);
          expect(directiveLog.filter(['ngDoCheck', 'ngOnInit'])).toEqual([
            'dir.ngOnInit',
            'dir.ngDoCheck',
          ]);
        }));

        it('should be called on every detectChanges run, except for checkNoChanges', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck'])).toEqual(['dir.ngDoCheck']);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngDoCheck'])).toEqual([]);

          // re-verify that changes are still detected
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck'])).toEqual(['dir.ngDoCheck']);
        }));
      });

      describe('ngAfterContentInit', () => {
        it('should be called after processing the content children but before the view children', fakeAsync(() => {
          const ctx = createCompWithContentAndViewChild();
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck', 'ngAfterContentInit'])).toEqual([
            'parent.ngDoCheck',
            'contentChild.ngDoCheck',
            'contentChild.ngAfterContentInit',
            'parent.ngAfterContentInit',
            'viewChild.ngDoCheck',
            'viewChild.ngAfterContentInit',
          ]);
        }));

        it('should only be called only once', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterContentInit'])).toEqual(['dir.ngAfterContentInit']);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);

          // re-verify that changes should not call them
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);
        }));

        it('should not call ngAfterContentInit again if it throws', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective="dir" throwOn="ngAfterContentInit"></div>',
          );

          let errored = false;
          // First pass fails, but ngAfterContentInit should be called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            errored = true;
          }
          expect(errored).toBe(true);

          expect(directiveLog.filter(['ngAfterContentInit'])).toEqual(['dir.ngAfterContentInit']);
          directiveLog.clear();

          // Second change detection also fails, but this time ngAfterContentInit should not be
          // called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            throw new Error('Second detectChanges() should not have run detection.');
          }
          expect(directiveLog.filter(['ngAfterContentInit'])).toEqual([]);
        }));
      });

      describe('ngAfterContentChecked', () => {
        it('should be called after the content children but before the view children', fakeAsync(() => {
          const ctx = createCompWithContentAndViewChild();

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck', 'ngAfterContentChecked'])).toEqual([
            'parent.ngDoCheck',
            'contentChild.ngDoCheck',
            'contentChild.ngAfterContentChecked',
            'parent.ngAfterContentChecked',
            'viewChild.ngDoCheck',
            'viewChild.ngAfterContentChecked',
          ]);
        }));

        it('should be called on every detectChanges run, except for checkNoChanges', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
            'dir.ngAfterContentChecked',
          ]);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([]);

          // re-verify that changes are still detected
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
            'dir.ngAfterContentChecked',
          ]);
        }));

        it('should be called in reverse order so the child is always notified before the parent', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>',
          );

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterContentChecked'])).toEqual([
            'child.ngAfterContentChecked',
            'parent.ngAfterContentChecked',
            'sibling.ngAfterContentChecked',
          ]);
        }));
      });

      describe('ngAfterViewInit', () => {
        it('should be called after processing the view children', fakeAsync(() => {
          const ctx = createCompWithContentAndViewChild();

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck', 'ngAfterViewInit'])).toEqual([
            'parent.ngDoCheck',
            'contentChild.ngDoCheck',
            'contentChild.ngAfterViewInit',
            'viewChild.ngDoCheck',
            'viewChild.ngAfterViewInit',
            'parent.ngAfterViewInit',
          ]);
        }));

        it('should only be called only once', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterViewInit'])).toEqual(['dir.ngAfterViewInit']);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);

          // re-verify that changes should not call them
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);
        }));

        it('should not call ngAfterViewInit again if it throws', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective="dir" throwOn="ngAfterViewInit"></div>',
          );

          let errored = false;
          // First pass fails, but ngAfterViewInit should be called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            errored = true;
          }
          expect(errored).toBe(true);

          expect(directiveLog.filter(['ngAfterViewInit'])).toEqual(['dir.ngAfterViewInit']);
          directiveLog.clear();

          // Second change detection also fails, but this time ngAfterViewInit should not be
          // called.
          try {
            ctx.detectChanges(false);
          } catch (e) {
            throw new Error('Second detectChanges() should not have run detection.');
          }
          expect(directiveLog.filter(['ngAfterViewInit'])).toEqual([]);
        }));
      });

      describe('ngAfterViewChecked', () => {
        it('should be called after processing the view children', fakeAsync(() => {
          const ctx = createCompWithContentAndViewChild();

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngDoCheck', 'ngAfterViewChecked'])).toEqual([
            'parent.ngDoCheck',
            'contentChild.ngDoCheck',
            'contentChild.ngAfterViewChecked',
            'viewChild.ngDoCheck',
            'viewChild.ngAfterViewChecked',
            'parent.ngAfterViewChecked',
          ]);
        }));

        it('should be called on every detectChanges run, except for checkNoChanges', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual(['dir.ngAfterViewChecked']);

          // reset directives
          directiveLog.clear();

          // Verify that checking should not call them.
          ctx.checkNoChanges();

          expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([]);

          // re-verify that changes are still detected
          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual(['dir.ngAfterViewChecked']);
        }));

        it('should be called in reverse order so the child is always notified before the parent', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>',
          );

          ctx.detectChanges(false);

          expect(directiveLog.filter(['ngAfterViewChecked'])).toEqual([
            'child.ngAfterViewChecked',
            'parent.ngAfterViewChecked',
            'sibling.ngAfterViewChecked',
          ]);
        }));
      });

      describe('ngOnDestroy', () => {
        it('should be called on view destruction', fakeAsync(() => {
          const ctx = createCompFixture('<div testDirective="dir"></div>');
          ctx.detectChanges(false);

          ctx.destroy();

          expect(directiveLog.filter(['ngOnDestroy'])).toEqual(['dir.ngOnDestroy']);
        }));

        it('should be called after processing the content and view children', fakeAsync(() => {
          TestBed.overrideComponent(AnotherComponent, {
            set: new Component({
              selector: 'other-cmp',
              template: '<div testDirective="viewChild"></div>',
            }),
          });

          const ctx = createCompFixture(
            '<div testDirective="parent"><div *ngFor="let x of [0,1]" testDirective="contentChild{{x}}"></div>' +
              '<other-cmp></other-cmp></div>',
            TestComponent,
          );

          ctx.detectChanges(false);
          ctx.destroy();

          expect(directiveLog.filter(['ngOnDestroy'])).toEqual([
            'contentChild0.ngOnDestroy',
            'contentChild1.ngOnDestroy',
            'viewChild.ngOnDestroy',
            'parent.ngOnDestroy',
          ]);
        }));

        it('should be called in reverse order so the child is always notified before the parent', fakeAsync(() => {
          const ctx = createCompFixture(
            '<div testDirective="parent"><div testDirective="child"></div></div><div testDirective="sibling"></div>',
          );

          ctx.detectChanges(false);
          ctx.destroy();

          expect(directiveLog.filter(['ngOnDestroy'])).toEqual([
            'child.ngOnDestroy',
            'parent.ngOnDestroy',
            'sibling.ngOnDestroy',
          ]);
        }));

        it('should deliver synchronous events to parent', fakeAsync(() => {
          const ctx = createCompFixture('<div (destroy)="a=$event" onDestroyDirective></div>');

          ctx.detectChanges(false);
          ctx.destroy();

          expect(ctx.componentInstance.a).toEqual('destroyed');
        }));

        it('should call ngOnDestroy on pipes', fakeAsync(() => {
          const ctx = createCompFixture('{{true | pipeWithOnDestroy }}');

          ctx.detectChanges(false);
          ctx.destroy();

          expect(directiveLog.filter(['ngOnDestroy'])).toEqual(['pipeWithOnDestroy.ngOnDestroy']);
        }));

        it('should call ngOnDestroy on an injectable class', fakeAsync(() => {
          TestBed.overrideDirective(TestDirective, {set: {providers: [InjectableWithLifecycle]}});

          const ctx = createCompFixture('<div testDirective="dir"></div>', TestComponent);

          ctx.debugElement.children[0].injector.get(InjectableWithLifecycle);
          ctx.detectChanges(false);

          ctx.destroy();

          // We don't care about the exact order in this test.
          expect(directiveLog.filter(['ngOnDestroy']).sort()).toEqual([
            'dir.ngOnDestroy',
            'injectable.ngOnDestroy',
          ]);
        }));
      });
    });

    describe('enforce no new changes', () => {
      it('should throw when a record gets changed after it has been checked', fakeAsync(() => {
        @Directive({
          selector: '[changed]',
          standalone: false,
        })
        class ChangingDirective {
          @Input() changed: any;
        }

        TestBed.configureTestingModule({declarations: [ChangingDirective]});

        const ctx = createCompFixture('<div [id]="a" [changed]="b"></div>', TestData);

        ctx.componentInstance.b = 1;
        const errMsgRegExp = /Previous value: 'undefined'\. Current value: '1'/g;
        expect(() => ctx.checkNoChanges()).toThrowError(errMsgRegExp);
      }));

      it('should throw when a record gets changed after the first change detection pass', fakeAsync(() => {
        @Directive({
          selector: '[changed]',
          standalone: false,
        })
        class ChangingDirective {
          @Input() changed: any;
        }

        TestBed.configureTestingModule({declarations: [ChangingDirective]});

        const ctx = createCompFixture('<div [id]="a" [changed]="b"></div>', TestData);

        ctx.componentInstance.b = 1;
        ctx.detectChanges();

        ctx.componentInstance.b = 2;
        const errMsgRegExp = /Previous value: '1'\. Current value: '2'/g;
        expect(() => ctx.checkNoChanges()).toThrowError(errMsgRegExp);
      }));

      it('should allow view to be created in a cd hook', () => {
        const ctx = createCompFixture('<div *gh9882>{{ a }}</div>', TestData);
        ctx.componentInstance.a = 1;
        ctx.detectChanges();
        expect(ctx.nativeElement.innerText).toEqual('1');
      });

      it('should not throw when two arrays are structurally the same', fakeAsync(() => {
        const ctx = _bindSimpleValue('a', TestData);
        ctx.componentInstance.a = ['value'];
        ctx.detectChanges(false);
        ctx.componentInstance.a = ['value'];
        expect(() => ctx.checkNoChanges()).not.toThrow();
      }));

      it('should not break the next run', fakeAsync(() => {
        const ctx = _bindSimpleValue('a', TestData);
        ctx.componentInstance.a = 'value';
        expect(() => ctx.checkNoChanges()).toThrow();

        ctx.detectChanges();
        expect(renderLog.loggedValues).toEqual(['value']);
      }));

      it('should not break the next run (view engine and ivy)', fakeAsync(() => {
        const ctx = _bindSimpleValue('a', TestData);

        ctx.detectChanges();
        renderLog.clear();

        ctx.componentInstance.a = 'value';
        expect(() => ctx.checkNoChanges()).toThrow();

        ctx.detectChanges();
        expect(renderLog.loggedValues).toEqual(['value']);
      }));
    });

    describe('mode', () => {
      it('Detached', fakeAsync(() => {
        const ctx = createCompFixture('<comp-with-ref></comp-with-ref>');
        const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];
        cmp.value = 'hello';
        cmp.changeDetectorRef.detach();

        ctx.detectChanges();

        expect(renderLog.log).toEqual([]);
      }));

      it('Detached should disable OnPush', fakeAsync(() => {
        const ctx = createCompFixture('<push-cmp [value]="value"></push-cmp>');
        ctx.componentInstance.value = 0;
        ctx.detectChanges();
        renderLog.clear();

        const cmp: CompWithRef = queryDirs(ctx.debugElement, PushComp)[0];
        cmp.changeDetectorRef.detach();

        ctx.componentInstance.value = 1;
        ctx.detectChanges();

        expect(renderLog.log).toEqual([]);
      }));

      it('Detached view can be checked locally', fakeAsync(() => {
        const ctx = createCompFixture('<wrap-comp-with-ref></wrap-comp-with-ref>');
        const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];
        cmp.value = 'hello';
        cmp.changeDetectorRef.detach();
        expect(renderLog.log).toEqual([]);

        ctx.detectChanges();

        expect(renderLog.log).toEqual([]);

        cmp.changeDetectorRef.detectChanges();

        expect(renderLog.log).toEqual(['{{hello}}']);
      }));

      it('Reattaches', fakeAsync(() => {
        const ctx = createCompFixture('<comp-with-ref></comp-with-ref>');
        const cmp: CompWithRef = queryDirs(ctx.debugElement, CompWithRef)[0];

        cmp.value = 'hello';
        cmp.changeDetectorRef.detach();

        ctx.detectChanges();

        expect(renderLog.log).toEqual([]);

        cmp.changeDetectorRef.reattach();

        ctx.detectChanges();

        expect(renderLog.log).toEqual(['{{hello}}']);
      }));

      it('Reattaches in the original cd mode', fakeAsync(() => {
        const ctx = createCompFixture('<push-cmp></push-cmp>');
        const cmp: PushComp = queryDirs(ctx.debugElement, PushComp)[0];
        cmp.changeDetectorRef.detach();
        cmp.changeDetectorRef.reattach();

        // renderCount should NOT be incremented with each CD as CD mode
        // should be resetted to
        // on-push
        ctx.detectChanges();
        expect(cmp.renderCount).toBeGreaterThan(0);
        const count = cmp.renderCount;

        ctx.detectChanges();
        expect(cmp.renderCount).toBe(count);
      }));
    });

    describe('nested view recursion', () => {
      it('should recurse into nested components even if there are no bindings in the component view', () => {
        @Component({
          selector: 'nested',
          template: '{{name}}',
          standalone: false,
        })
        class Nested {
          name = 'Tom';
        }

        TestBed.configureTestingModule({declarations: [Nested]});

        const ctx = createCompFixture('<nested></nested>');
        ctx.detectChanges();
        expect(renderLog.loggedValues).toEqual(['Tom']);
      });

      it('should recurse into nested view containers even if there are no bindings in the component view', () => {
        @Component({
          template: '<ng-template #vc>{{name}}</ng-template>',
          standalone: false,
        })
        class Comp {
          name = 'Tom';
          @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
          @ViewChild(TemplateRef, {static: true}) template!: TemplateRef<any>;
        }

        TestBed.configureTestingModule({declarations: [Comp]});
        initHelpers();

        const ctx = TestBed.createComponent(Comp);
        ctx.detectChanges();
        expect(renderLog.loggedValues).toEqual([]);

        ctx.componentInstance.vc.createEmbeddedView(ctx.componentInstance.template);
        ctx.detectChanges();
        expect(renderLog.loggedValues).toEqual(['Tom']);
      });

      describe('projected views', () => {
        let log: string[];

        @Directive({
          selector: '[i]',
          standalone: false,
        })
        class DummyDirective {
          @Input() i: any;
        }

        @Component({
          selector: 'main-cmp',
          template: `<span [i]="log('start')"></span><outer-cmp><ng-template><span [i]="log('tpl')"></span></ng-template></outer-cmp>`,
          standalone: false,
        })
        class MainComp {
          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) {
            log.push(`main-${id}`);
          }
        }

        @Component({
          selector: 'outer-cmp',
          template: `<span [i]="log('start')"></span><inner-cmp [outerTpl]="tpl"><ng-template><span [i]="log('tpl')"></span></ng-template></inner-cmp>`,
          standalone: false,
        })
        class OuterComp {
          @ContentChild(TemplateRef, {static: true}) tpl!: TemplateRef<any>;

          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) {
            log.push(`outer-${id}`);
          }
        }

        @Component({
          selector: 'inner-cmp',
          template: `<span [i]="log('start')"></span>><ng-container [ngTemplateOutlet]="outerTpl"></ng-container><ng-container [ngTemplateOutlet]="tpl"></ng-container>`,
          standalone: false,
        })
        class InnerComp {
          @ContentChild(TemplateRef, {static: true}) tpl!: TemplateRef<any>;
          @Input() outerTpl: TemplateRef<any> | undefined;

          constructor(public cdRef: ChangeDetectorRef) {}
          log(id: string) {
            log.push(`inner-${id}`);
          }
        }

        let ctx: ComponentFixture<MainComp>;
        let mainComp: MainComp;
        let outerComp: OuterComp;
        let innerComp: InnerComp;

        beforeEach(() => {
          log = [];
          ctx = TestBed.configureTestingModule({
            declarations: [MainComp, OuterComp, InnerComp, DummyDirective],
          }).createComponent(MainComp);
          mainComp = ctx.componentInstance;
          outerComp = ctx.debugElement.query(By.directive(OuterComp)).injector.get(OuterComp);
          innerComp = ctx.debugElement.query(By.directive(InnerComp)).injector.get(InnerComp);
        });

        it('should dirty check projected views in regular order', () => {
          ctx.detectChanges(false);
          expect(log).toEqual([
            'main-start',
            'outer-start',
            'inner-start',
            'main-tpl',
            'outer-tpl',
          ]);

          log = [];
          ctx.detectChanges(false);
          expect(log).toEqual([
            'main-start',
            'outer-start',
            'inner-start',
            'main-tpl',
            'outer-tpl',
          ]);
        });

        it('should not dirty check projected views if neither the declaration nor the insertion place is dirty checked', () => {
          ctx.detectChanges(false);
          log = [];
          mainComp.cdRef.detach();
          ctx.detectChanges(false);

          expect(log).toEqual([]);
        });

        it('should dirty check projected views if the insertion place is dirty checked', () => {
          ctx.detectChanges(false);
          log = [];

          innerComp.cdRef.detectChanges();
          expect(log).toEqual(['inner-start', 'main-tpl', 'outer-tpl']);
        });

        it('should not dirty check views that are inserted into a detached tree, even if the declaration place is dirty checked', () => {
          ctx.detectChanges(false);
          log = [];
          innerComp.cdRef.detach();
          mainComp.cdRef.detectChanges();

          expect(log).toEqual(['main-start', 'outer-start']);

          log = [];
          outerComp.cdRef.detectChanges();

          expect(log).toEqual(['outer-start']);

          log = [];
          outerComp.cdRef.detach();
          mainComp.cdRef.detectChanges();

          expect(log).toEqual(['main-start']);
        });
      });
    });

    describe('class binding', () => {
      it('should coordinate class attribute and class host binding', () => {
        @Component({
          template: `<div class="{{initClasses}}" someDir></div>`,
          standalone: false,
        })
        class Comp {
          initClasses = 'init';
        }

        @Directive({
          selector: '[someDir]',
          standalone: false,
        })
        class SomeDir {
          @HostBinding('class.foo') fooClass = true;
        }

        const ctx = TestBed.configureTestingModule({declarations: [Comp, SomeDir]}).createComponent(
          Comp,
        );

        ctx.detectChanges();

        const divEl = ctx.debugElement.children[0];
        expect(divEl.nativeElement).toHaveCssClass('init');
        expect(divEl.nativeElement).toHaveCssClass('foo');
      });
    });

    describe('lifecycle asserts', () => {
      let logged: string[];

      function log(value: string) {
        logged.push(value);
      }
      function clearLog() {
        logged = [];
      }

      function expectOnceAndOnlyOnce(log: string) {
        expect(logged.indexOf(log) >= 0).toBeTruthy(
          `'${log}' not logged. Log was ${JSON.stringify(logged)}`,
        );
        expect(logged.lastIndexOf(log) === logged.indexOf(log)).toBeTruthy(
          `'${log}' logged more than once. Log was ${JSON.stringify(logged)}`,
        );
      }

      beforeEach(() => {
        clearLog();
      });

      enum LifetimeMethods {
        None = 0,
        ngOnInit = 1 << 0,
        ngOnChanges = 1 << 1,
        ngAfterViewInit = 1 << 2,
        ngAfterContentInit = 1 << 3,
        ngDoCheck = 1 << 4,
        InitMethods = ngOnInit | ngAfterViewInit | ngAfterContentInit,
        InitMethodsAndChanges = InitMethods | ngOnChanges,
        All = InitMethodsAndChanges | ngDoCheck,
      }

      function forEachMethod(methods: LifetimeMethods, cb: (method: LifetimeMethods) => void) {
        if (methods & LifetimeMethods.ngOnInit) cb(LifetimeMethods.ngOnInit);
        if (methods & LifetimeMethods.ngOnChanges) cb(LifetimeMethods.ngOnChanges);
        if (methods & LifetimeMethods.ngAfterContentInit) cb(LifetimeMethods.ngAfterContentInit);
        if (methods & LifetimeMethods.ngAfterViewInit) cb(LifetimeMethods.ngAfterViewInit);
        if (methods & LifetimeMethods.ngDoCheck) cb(LifetimeMethods.ngDoCheck);
      }

      interface Options {
        childRecursion: LifetimeMethods;
        childThrows: LifetimeMethods;
      }

      describe('calling init', () => {
        function initialize(options: Options) {
          @Component({
            selector: 'my-child',
            template: '',
            standalone: false,
          })
          class MyChild {
            private thrown = LifetimeMethods.None;

            @Input() inp: boolean | undefined;
            @Output() outp = new EventEmitter<any>();

            constructor() {}

            ngDoCheck() {
              this.check(LifetimeMethods.ngDoCheck);
            }
            ngOnInit() {
              this.check(LifetimeMethods.ngOnInit);
            }
            ngOnChanges() {
              this.check(LifetimeMethods.ngOnChanges);
            }
            ngAfterViewInit() {
              this.check(LifetimeMethods.ngAfterViewInit);
            }
            ngAfterContentInit() {
              this.check(LifetimeMethods.ngAfterContentInit);
            }

            private check(method: LifetimeMethods) {
              log(`MyChild::${LifetimeMethods[method]}()`);

              if ((options.childRecursion & method) !== 0) {
                if (logged.length < 20) {
                  this.outp.emit(null);
                } else {
                  fail(`Unexpected MyChild::${LifetimeMethods[method]} recursion`);
                }
              }
              if ((options.childThrows & method) !== 0) {
                if ((this.thrown & method) === 0) {
                  this.thrown |= method;
                  log(`<THROW from MyChild::${LifetimeMethods[method]}>()`);
                  throw new Error(`Throw from MyChild::${LifetimeMethods[method]}`);
                }
              }
            }
          }

          @Component({
            selector: 'my-component',
            template: `<my-child [inp]='true' (outp)='onOutp()'></my-child>`,
            standalone: false,
          })
          class MyComponent {
            constructor(private changeDetectionRef: ChangeDetectorRef) {}
            ngDoCheck() {
              this.check(LifetimeMethods.ngDoCheck);
            }
            ngOnInit() {
              this.check(LifetimeMethods.ngOnInit);
            }
            ngAfterViewInit() {
              this.check(LifetimeMethods.ngAfterViewInit);
            }
            ngAfterContentInit() {
              this.check(LifetimeMethods.ngAfterContentInit);
            }
            onOutp() {
              log('<RECURSION START>');
              this.changeDetectionRef.detectChanges();
              log('<RECURSION DONE>');
            }

            private check(method: LifetimeMethods) {
              log(`MyComponent::${LifetimeMethods[method]}()`);
            }
          }

          TestBed.configureTestingModule({declarations: [MyChild, MyComponent]});

          return createCompFixture(`<my-component></my-component>`);
        }

        function ensureOneInit(options: Options) {
          const ctx = initialize(options);

          const throws = options.childThrows != LifetimeMethods.None;
          if (throws) {
            log(`<CYCLE 0 START>`);
            expect(() => {
              // Expect child to throw.
              ctx.detectChanges();
            }).toThrow();
            log(`<CYCLE 0 END>`);
            log(`<CYCLE 1 START>`);
          }
          ctx.detectChanges();
          if (throws) log(`<CYCLE 1 DONE>`);
          expectOnceAndOnlyOnce('MyComponent::ngOnInit()');
          expectOnceAndOnlyOnce('MyChild::ngOnInit()');
          expectOnceAndOnlyOnce('MyComponent::ngAfterViewInit()');
          expectOnceAndOnlyOnce('MyComponent::ngAfterContentInit()');
          expectOnceAndOnlyOnce('MyChild::ngAfterViewInit()');
          expectOnceAndOnlyOnce('MyChild::ngAfterContentInit()');
        }

        forEachMethod(LifetimeMethods.InitMethodsAndChanges, (method) => {
          it(`should ensure that init hooks are called once an only once with recursion in ${LifetimeMethods[method]} `, () => {
            // Ensure all the init methods are called once.
            ensureOneInit({childRecursion: method, childThrows: LifetimeMethods.None});
          });
        });
        forEachMethod(LifetimeMethods.All, (method) => {
          it(`should ensure that init hooks are called once an only once with a throw in ${LifetimeMethods[method]} `, () => {
            // Ensure all the init methods are called once.
            // the first cycle throws but the next cycle should complete the inits.
            ensureOneInit({childRecursion: LifetimeMethods.None, childThrows: method});
          });
        });
      });
    });
  });
})();

@Injectable()
class RenderLog {
  log: string[] = [];
  loggedValues: any[] = [];

  setElementProperty(el: any, propName: string, propValue: any) {
    this.log.push(`${propName}=${propValue}`);
    this.loggedValues.push(propValue);
  }

  setText(node: any, value: string) {
    this.log.push(`{{${value}}}`);
    this.loggedValues.push(value);
  }

  clear() {
    this.log = [];
    this.loggedValues = [];
  }
}

class DirectiveLogEntry {
  constructor(
    public directiveName: string,
    public method: string,
  ) {}
}

function patchLoggingRenderer2(rendererFactory: RendererFactory2, log: RenderLog) {
  if ((<any>rendererFactory).__patchedForLogging) {
    return;
  }
  (<any>rendererFactory).__patchedForLogging = true;
  const origCreateRenderer = rendererFactory.createRenderer;
  rendererFactory.createRenderer = function (element: any, type: RendererType2 | null) {
    const renderer = origCreateRenderer.call(this, element, type);
    if ((<any>renderer).__patchedForLogging) {
      return renderer;
    }
    (<any>renderer).__patchedForLogging = true;
    const origSetProperty = renderer.setProperty;
    const origSetValue = renderer.setValue;
    renderer.setProperty = function (el: any, name: string, value: any): void {
      log.setElementProperty(el, name, value);
      origSetProperty.call(renderer, el, name, value);
    };
    renderer.setValue = function (node: any, value: string): void {
      if (isTextNode(node)) {
        log.setText(node, value);
      }
      origSetValue.call(renderer, node, value);
    };
    return renderer;
  };
}

@Injectable()
class DirectiveLog {
  entries: DirectiveLogEntry[] = [];

  add(directiveName: string, method: string) {
    this.entries.push(new DirectiveLogEntry(directiveName, method));
  }

  clear() {
    this.entries = [];
  }

  filter(methods: string[]): string[] {
    return this.entries
      .filter((entry) => methods.indexOf(entry.method) !== -1)
      .map((entry) => `${entry.directiveName}.${entry.method}`);
  }
}

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
  name: 'countingImpurePipe',
  pure: false,
  standalone: false,
})
class CountingImpurePipe implements PipeTransform {
  state: number = 0;
  transform(value: any) {
    return `${value} state:${this.state++}`;
  }
}

@Pipe({
  name: 'pipeWithOnDestroy',
  standalone: false,
})
class PipeWithOnDestroy implements PipeTransform, OnDestroy {
  constructor(private directiveLog: DirectiveLog) {}

  ngOnDestroy() {
    this.directiveLog.add('pipeWithOnDestroy', 'ngOnDestroy');
  }

  transform(value: any): any {
    return null;
  }
}

@Pipe({
  name: 'identityPipe',
  standalone: false,
})
class IdentityPipe implements PipeTransform {
  transform(value: any) {
    return value;
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

@Component({
  selector: 'test-cmp',
  template: 'empty',
  standalone: false,
})
class TestComponent {
  value: any;
  a: any;
  b: any;
}

@Component({
  selector: 'other-cmp',
  template: 'empty',
  standalone: false,
})
class AnotherComponent {}

@Component({
  selector: 'comp-with-ref',
  template: '<div (event)="noop()" emitterDirective></div>{{value}}',
  host: {'event': 'noop()'},
  standalone: false,
})
class CompWithRef {
  @Input() public value: any;

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  noop() {}
}

@Component({
  selector: 'wrap-comp-with-ref',
  template: '<comp-with-ref></comp-with-ref>',
  standalone: false,
})
class WrapCompWithRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Component({
  selector: 'push-cmp',
  template: '<div (event)="noop()" emitterDirective></div>{{value}}{{renderIncrement}}',
  host: {'(event)': 'noop()'},
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
class PushComp {
  @Input() public value: any;
  public renderCount: any = 0;

  get renderIncrement() {
    this.renderCount++;
    return '';
  }

  constructor(public changeDetectorRef: ChangeDetectorRef) {}

  noop() {}
}

@Directive({
  selector: '[emitterDirective]',
  standalone: false,
})
class EmitterDirective {
  @Output('event') emitter = new EventEmitter<string>();
}

@Directive({
  selector: '[gh9882]',
  standalone: false,
})
class Gh9882 implements AfterContentInit {
  constructor(
    private _viewContainer: ViewContainerRef,
    private _templateRef: TemplateRef<Object>,
  ) {}

  ngAfterContentInit(): any {
    this._viewContainer.createEmbeddedView(this._templateRef);
  }
}

@Directive({
  selector: '[testDirective]',
  exportAs: 'testDirective',
  standalone: false,
})
class TestDirective
  implements
    OnInit,
    DoCheck,
    OnChanges,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  @Input() a: any;
  @Input() b: any;
  changes: SimpleChanges | undefined;
  event: any;
  eventEmitter: EventEmitter<string> = new EventEmitter<string>();

  @Input('testDirective') name: string = '';

  @Input() throwOn: string | undefined;

  constructor(public log: DirectiveLog) {}

  onEvent(event: any) {
    this.event = event;
  }

  ngDoCheck() {
    this.log.add(this.name, 'ngDoCheck');
  }

  ngOnInit() {
    this.log.add(this.name, 'ngOnInit');
    if (this.throwOn == 'ngOnInit') {
      throw new Error('Boom!');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.log.add(this.name, 'ngOnChanges');
    this.changes = changes;
    if (this.throwOn == 'ngOnChanges') {
      throw new Error('Boom!');
    }
  }

  ngAfterContentInit() {
    this.log.add(this.name, 'ngAfterContentInit');
    if (this.throwOn == 'ngAfterContentInit') {
      throw new Error('Boom!');
    }
  }

  ngAfterContentChecked() {
    this.log.add(this.name, 'ngAfterContentChecked');
    if (this.throwOn == 'ngAfterContentChecked') {
      throw new Error('Boom!');
    }
  }

  ngAfterViewInit() {
    this.log.add(this.name, 'ngAfterViewInit');
    if (this.throwOn == 'ngAfterViewInit') {
      throw new Error('Boom!');
    }
  }

  ngAfterViewChecked() {
    this.log.add(this.name, 'ngAfterViewChecked');
    if (this.throwOn == 'ngAfterViewChecked') {
      throw new Error('Boom!');
    }
  }

  ngOnDestroy() {
    this.log.add(this.name, 'ngOnDestroy');
    if (this.throwOn == 'ngOnDestroy') {
      throw new Error('Boom!');
    }
  }
}

@Injectable()
class InjectableWithLifecycle {
  name = 'injectable';
  constructor(public log: DirectiveLog) {}

  ngOnDestroy() {
    this.log.add(this.name, 'ngOnDestroy');
  }
}

@Directive({
  selector: '[onDestroyDirective]',
  standalone: false,
})
class OnDestroyDirective implements OnDestroy {
  @Output('destroy') emitter = new EventEmitter<string>(false);

  ngOnDestroy() {
    this.emitter.emit('destroyed');
  }
}

@Directive({
  selector: '[orderCheck0]',
  standalone: false,
})
class OrderCheckDirective0 {
  private _name: string | undefined;

  @Input('orderCheck0')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(public log: DirectiveLog) {}
}

@Directive({
  selector: '[orderCheck1]',
  standalone: false,
})
class OrderCheckDirective1 {
  private _name: string | undefined;

  @Input('orderCheck1')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(
    public log: DirectiveLog,
    _check0: OrderCheckDirective0,
  ) {}
}

@Directive({
  selector: '[orderCheck2]',
  standalone: false,
})
class OrderCheckDirective2 {
  private _name: string | undefined;

  @Input('orderCheck2')
  set name(value: string) {
    this._name = value;
    this.log.add(this._name, 'set');
  }

  constructor(
    public log: DirectiveLog,
    _check1: OrderCheckDirective1,
  ) {}
}

class TestLocalsContext {
  constructor(public someLocal: string) {}
}

@Directive({
  selector: '[testLocals]',
  standalone: false,
})
class TestLocals {
  constructor(templateRef: TemplateRef<TestLocalsContext>, vcRef: ViewContainerRef) {
    vcRef.createEmbeddedView(templateRef, new TestLocalsContext('someLocalValue'));
  }
}

@Component({
  selector: 'root',
  template: 'empty',
  standalone: false,
})
class Person {
  age: number | undefined;
  name: string | undefined;
  address: Address | null = null;
  phones: number[] | undefined;

  init(name: string, address: Address | null = null) {
    this.name = name;
    this.address = address;
  }

  sayHi(m: any): string {
    return `Hi, ${m}`;
  }

  passThrough(val: any): any {
    return val;
  }

  toString(): string {
    const address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name + address;
  }
}

class Address {
  cityGetterCalls: number = 0;
  zipCodeGetterCalls: number = 0;

  constructor(
    public _city: string,
    public _zipcode: any = null,
  ) {}

  get city() {
    this.cityGetterCalls++;
    return this._city;
  }

  get zipcode() {
    this.zipCodeGetterCalls++;
    return this._zipcode;
  }

  set city(v) {
    this._city = v;
  }

  set zipcode(v) {
    this._zipcode = v;
  }

  toString(): string {
    return this.city || '-';
  }
}

@Component({
  selector: 'root',
  template: 'empty',
  standalone: false,
})
class Uninitialized {
  value: any = null;
}

@Component({
  selector: 'root',
  template: 'empty',
  standalone: false,
})
class TestData {
  a: any;
  b: any;
}

class Holder<T> {
  value: T | undefined;
}

@Component({
  selector: 'root',
  template: 'empty',
  standalone: false,
})
class PersonHolder extends Holder<Person> {}

@Component({
  selector: 'root',
  template: 'empty',
  standalone: false,
})
class PersonHolderHolder extends Holder<Holder<Person>> {}

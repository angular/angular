/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {ANALYZE_FOR_ENTRY_COMPONENTS, ApplicationRef, Component, ComponentRef, ContentChild, destroyPlatform, Directive, ErrorHandler, EventEmitter, HostListener, InjectionToken, Injector, Input, NgModule, NgModuleRef, NgZone, Output, Pipe, PipeTransform, Provider, QueryList, Renderer2, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef, ɵivyEnabled as ivyEnabled} from '@angular/core';
import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {BrowserModule, By} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {modifiedInIvy, onlyInIvy} from '@angular/private/testing';

if (ivyEnabled) {
  describe('ivy', () => {
    declareTests();
  });
} else {
  describe('jit', () => {
    declareTests({useJit: true});
  });
  describe('no jit', () => {
    declareTests({useJit: false});
  });
}

declareTestsUsingBootstrap();

function declareTests(config?: {useJit: boolean}) {
  // Place to put reproductions for regressions
  describe('regressions', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [MyComp1, PlatformPipe]});
    });

    describe('platform pipes', () => {
      beforeEach(() => {
        TestBed.configureCompiler({...config});
      });

      it('should overwrite them by custom pipes', () => {
        TestBed.configureTestingModule({declarations: [CustomPipe]});
        const template = '{{true | somePipe}}';
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('someCustomPipe');
      });
    });

    describe('expressions', () => {
      it('should evaluate conditional and boolean operators with right precedence - #8244', () => {
        const template = `{{'red' + (true ? ' border' : '')}}`;
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('red border');
      });

      it('should evaluate conditional and unary operators with right precedence - #8235', () => {
        const template = `{{!null?.length}}`;
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('true');
      });

      it('should only evaluate stateful pipes once - #10639', () => {
        TestBed.configureTestingModule({declarations: [CountingPipe]});
        const template = '{{(null|countingPipe)?.value}}';
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        CountingPipe.reset();
        fixture.detectChanges(/* checkNoChanges */ false);
        expect(fixture.nativeElement).toHaveText('counting pipe value');
        expect(CountingPipe.calls).toBe(1);
      });

      it('should only update the bound property when using asyncPipe - #15205', fakeAsync(() => {
           @Component({template: '<div myDir [a]="p | async" [b]="2"></div>'})
           class MyComp {
             p = Promise.resolve(1);
           }

           @Directive({selector: '[myDir]'})
           class MyDir {
             setterCalls: {[key: string]: any} = {};
             // TODO(issue/24571): remove '!'.
             changes!: SimpleChanges;

             @Input()
             set a(v: number) {
               this.setterCalls['a'] = v;
             }
             @Input()
             set b(v: number) {
               this.setterCalls['b'] = v;
             }

             ngOnChanges(changes: SimpleChanges) {
               this.changes = changes;
             }
           }

           TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
           const fixture = TestBed.createComponent(MyComp);
           const dir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir) as MyDir;

           fixture.detectChanges();
           expect(dir.setterCalls).toEqual({'a': null, 'b': 2});
           expect(Object.keys(dir.changes)).toEqual(['a', 'b']);

           dir.setterCalls = {};
           dir.changes = {};

           tick();
           fixture.detectChanges();

           expect(dir.setterCalls).toEqual({'a': 1});
           expect(Object.keys(dir.changes)).toEqual(['a']);
         }));

      it('should only evaluate methods once - #10639', () => {
        TestBed.configureTestingModule({declarations: [MyCountingComp]});
        const template = '{{method()?.value}}';
        TestBed.overrideComponent(MyCountingComp, {set: {template}});
        const fixture = TestBed.createComponent(MyCountingComp);

        MyCountingComp.reset();
        fixture.detectChanges(/* checkNoChanges */ false);
        expect(fixture.nativeElement).toHaveText('counting method value');
        expect(MyCountingComp.calls).toBe(1);
      });

      it('should evaluate a conditional in a statement binding', () => {
        @Component({selector: 'some-comp', template: '<p (click)="nullValue?.click()"></p>'})
        class SomeComponent {
          // TODO(issue/24571): remove '!'.
          nullValue!: SomeReferencedClass;
        }

        class SomeReferencedClass {
          click() {}
        }

        expect(() => {
          const fixture = TestBed.configureTestingModule({declarations: [SomeComponent]})
                              .createComponent(SomeComponent);

          fixture.detectChanges(/* checkNoChanges */ false);
        }).not.toThrow();
      });
    });

    describe('providers', () => {
      function createInjector(providers: Provider[]): Injector {
        TestBed.overrideComponent(MyComp1, {add: {providers}});
        return TestBed.createComponent(MyComp1).componentInstance.injector;
      }

      it('should support providers with an InjectionToken that contains a `.` in the name', () => {
        const token = new InjectionToken('a.b');
        const tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);
        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with string token with a `.` in it', () => {
        const token = 'a.b';
        const tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);

        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with an anonymous function as token', () => {
        const token = () => true;
        const tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);

        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with an InjectionToken that has a StringMap as value', () => {
        const token1 = new InjectionToken('someToken');
        const token2 = new InjectionToken('someToken');
        const tokenValue1 = {'a': 1};
        const tokenValue2 = {'a': 1};
        const injector = createInjector(
            [{provide: token1, useValue: tokenValue1}, {provide: token2, useValue: tokenValue2}]);

        expect(injector.get(token1)).toEqual(tokenValue1);
        expect(injector.get(token2)).toEqual(tokenValue2);
      });

      it('should support providers that have a `name` property with a number value', () => {
        class TestClass {
          constructor(public name: number) {}
        }
        const data = [new TestClass(1), new TestClass(2)];
        const injector = createInjector([{provide: 'someToken', useValue: data}]);
        expect(injector.get('someToken')).toEqual(data);
      });

      describe('ANALYZE_FOR_ENTRY_COMPONENTS providers', () => {
        it('should support class instances', () => {
          class SomeObject {
            someMethod() {}
          }

          expect(() => createInjector([
                   {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: new SomeObject(), multi: true}
                 ]))
              .not.toThrow();
        });
      });
    });

    it('should allow logging a previous elements class binding via interpolation', () => {
      const template = `<div [class.a]="true" #el>Class: {{el.className}}</div>`;
      TestBed.overrideComponent(MyComp1, {set: {template}});
      const fixture = TestBed.createComponent(MyComp1);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Class: a');
    });

    it('should support ngClass before a component and content projection inside of an ngIf', () => {
      TestBed.configureTestingModule({declarations: [CmpWithNgContent]});
      const template = `A<cmp-content *ngIf="true" [ngClass]="'red'">B</cmp-content>C`;
      TestBed.overrideComponent(MyComp1, {set: {template}});
      const fixture = TestBed.createComponent(MyComp1);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('ABC');
    });

    it('should handle mutual recursion entered from multiple sides - #7084', () => {
      TestBed.configureTestingModule({declarations: [FakeRecursiveComp, LeftComp, RightComp]});
      const fixture = TestBed.createComponent(FakeRecursiveComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('[]');
    });

    it('should generate the correct output when constructors have the same name', () => {
      function ComponentFactory(selector: string, template: string) {
        @Component({selector, template})
        class MyComponent {
        }
        return MyComponent;
      }
      const HeroComponent = ComponentFactory('my-hero', 'my hero');
      const VillainComponent = ComponentFactory('a-villain', 'a villain');
      const MainComponent = ComponentFactory(
          'my-app', 'I was saved by <my-hero></my-hero> from <a-villain></a-villain>.');

      TestBed.configureTestingModule(
          {declarations: [HeroComponent, VillainComponent, MainComponent]});
      const fixture = TestBed.createComponent(MainComponent);
      expect(fixture.nativeElement).toHaveText('I was saved by my hero from a villain.');
    });

    it('should allow to use the renderer outside of views', () => {
      @Component({template: ''})
      class MyComp {
        constructor(public renderer: Renderer2) {}
      }

      TestBed.configureTestingModule({declarations: [MyComp]});
      const ctx = TestBed.createComponent(MyComp);

      const txtNode = ctx.componentInstance.renderer.createText('test');
      expect(txtNode).toHaveText('test');
    });

    it('should not recreate TemplateRef references during dirty checking', () => {
      @Component({template: '<div [someDir]="someRef"></div><ng-template #someRef></ng-template>'})
      class MyComp {
      }

      @Directive({selector: '[someDir]'})
      class MyDir {
        // TODO(issue/24571): remove '!'.
        @Input('someDir') template !: TemplateRef<any>;
      }

      const ctx =
          TestBed.configureTestingModule({declarations: [MyComp, MyDir]}).createComponent(MyComp);
      const dir = <MyDir>ctx.debugElement.query(By.directive(MyDir)).injector.get(MyDir);

      expect(dir.template).toBeUndefined();

      ctx.detectChanges();
      const template = dir.template;
      expect(template).toBeDefined();

      ctx.detectChanges();
      expect(dir.template).toBe(template);
    });

    it('should not recreate ViewContainerRefs in queries', () => {
      @Component({template: '<div #vc></div><div *ngIf="show" #vc></div>'})
      class MyComp {
        // TODO(issue/24571): remove '!'.
        @ViewChildren('vc', {read: ViewContainerRef}) viewContainers!: QueryList<ViewContainerRef>;

        show = true;
      }

      const ctx = TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);

      ctx.componentInstance.show = true;
      ctx.detectChanges();
      expect(ctx.componentInstance.viewContainers.length).toBe(2);
      const vc = ctx.componentInstance.viewContainers.first;
      expect(vc).toBeDefined();

      ctx.componentInstance.show = false;
      ctx.detectChanges();
      expect(ctx.componentInstance.viewContainers.first).toBe(vc);
    });

    it('should not throw when encountering an empty class attribute', () => {
      const template = '<div class=""></div>';
      TestBed.overrideComponent(MyComp1, {set: {template}});

      expect(() => TestBed.createComponent(MyComp1)).not.toThrow();
    });

    describe('empty templates - #15143', () => {
      it('should allow empty components', () => {
        @Component({template: ''})
        class MyComp {
        }

        const fixture =
            TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
        fixture.detectChanges();

        expect(fixture.debugElement.childNodes.length).toBe(0);
      });

      modifiedInIvy('Comment node order changed')
          .it('should allow empty embedded templates', () => {
            @Component({template: '<ng-template [ngIf]="true"></ng-template>'})
            class MyComp {
            }

            const fixture =
                TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
            fixture.detectChanges();

            // Note: We always need to create at least a comment in an embedded template,
            // so we can append other templates after it.
            // 1 comment for the anchor,
            // 1 comment for the empty embedded template.
            expect(fixture.debugElement.childNodes.length).toBe(2);
          });
    });

    modifiedInIvy('Static ViewChild and ContentChild queries are resolved in update mode')
        .it('should support @ContentChild and @Input on the same property for static queries',
            () => {
              @Directive({selector: 'test'})
              class Test {
                // TODO(issue/24571): remove '!'.
                @Input() @ContentChild(TemplateRef, {static: true}) tpl!: TemplateRef<any>;
              }

              @Component({
                selector: 'my-app',
                template: `
          <test></test><br>
          <test><ng-template>Custom as a child</ng-template></test><br>
          <ng-template #custom>Custom as a binding</ng-template>
          <test [tpl]="custom"></test><br>
        `
              })
              class App {
              }

              const fixture =
                  TestBed.configureTestingModule({declarations: [App, Test]}).createComponent(App);
              fixture.detectChanges();

              const testDirs = fixture.debugElement.queryAll(By.directive(Test))
                                   .map(el => el.injector.get(Test));
              expect(testDirs[0].tpl).toBeUndefined();
              expect(testDirs[1].tpl).toBeDefined();
              expect(testDirs[2].tpl).toBeDefined();
            });

    onlyInIvy('Ivy does not support @ContentChild and @Input on the same property')
        .it('should throw if @ContentChild and @Input are on the same property', () => {
          @Directive({selector: 'test'})
          class Test {
            @Input() @ContentChild(TemplateRef, {static: true}) tpl!: TemplateRef<any>;
          }

          @Component({selector: 'my-app', template: `<test></test>`})
          class App {
          }

          expect(() => {
            TestBed.configureTestingModule({declarations: [App, Test]}).createComponent(App);
          }).toThrowError(/Cannot combine @Input decorators with query decorators/);
        });

    it('should not add ng-version for dynamically created components', () => {
      @Component({template: ''})
      class App {
      }

      @NgModule({declarations: [App], entryComponents: [App]})
      class MyModule {
      }

      const modRef = TestBed.configureTestingModule({imports: [MyModule]}).get(NgModuleRef) as
          NgModuleRef<MyModule>;
      const compRef =
          modRef.componentFactoryResolver.resolveComponentFactory(App).create(Injector.NULL);

      expect(compRef.location.nativeElement.hasAttribute('ng-version')).toBe(false);
    });
  });
}

function declareTestsUsingBootstrap() {
  // Place to put reproductions for regressions
  describe('regressions using bootstrap', () => {
    const COMP_SELECTOR = 'root-comp';

    class MockConsole {
      errors: any[][] = [];
      error(...s: any[]): void {
        this.errors.push(s);
      }
    }

    let logger: MockConsole;
    let errorHandler: ErrorHandler;

    beforeEach(inject([DOCUMENT], (doc: any) => {
      destroyPlatform();
      const el = getDOM().createElement(COMP_SELECTOR, doc);
      doc.body.appendChild(el);

      logger = new MockConsole();
      errorHandler = new ErrorHandler();
      (errorHandler as any)._console = logger as any;
    }));

    afterEach(() => {
      destroyPlatform();
    });

    if (getDOM().supportsDOMEvents) {
      // This test needs a real DOM....

      it('should keep change detecting if there was an error', (done) => {
        @Component({
          selector: COMP_SELECTOR,
          template:
              '<button (click)="next()"></button><button (click)="nextAndThrow()"></button><button (dirClick)="nextAndThrow()"></button><span>Value:{{value}}</span><span>{{throwIfNeeded()}}</span>'
        })
        class ErrorComp {
          value = 0;
          thrownValue = 0;
          next() {
            this.value++;
          }
          nextAndThrow() {
            this.value++;
            this.throwIfNeeded();
          }
          throwIfNeeded() {
            NgZone.assertInAngularZone();
            if (this.thrownValue !== this.value) {
              this.thrownValue = this.value;
              throw new Error(`Error: ${this.value}`);
            }
          }
        }

        @Directive({selector: '[dirClick]'})
        class EventDir {
          @Output() dirClick = new EventEmitter();

          @HostListener('click', ['$event'])
          onClick(event: any) {
            this.dirClick.next(event);
          }
        }

        @NgModule({
          imports: [BrowserModule],
          declarations: [ErrorComp, EventDir],
          bootstrap: [ErrorComp],
          providers: [{provide: ErrorHandler, useValue: errorHandler}],
        })
        class TestModule {
        }

        platformBrowserDynamic().bootstrapModule(TestModule).then((ref) => {
          NgZone.assertNotInAngularZone();
          const appRef = ref.injector.get(ApplicationRef) as ApplicationRef;
          const compRef = appRef.components[0] as ComponentRef<ErrorComp>;
          const compEl = compRef.location.nativeElement;
          const nextBtn = compEl.children[0];
          const nextAndThrowBtn = compEl.children[1];
          const nextAndThrowDirBtn = compEl.children[2];

          // Note: the amount of events sent to the logger will differ between ViewEngine
          // and Ivy, because Ivy doesn't attach an error context. This means that the amount
          // of logged errors increases by 1 for Ivy and 2 for ViewEngine after each event.
          const errorDelta = ivyEnabled ? 1 : 2;
          let currentErrorIndex = 0;

          nextBtn.click();
          assertValueAndErrors(compEl, 1, currentErrorIndex);
          currentErrorIndex += errorDelta;
          nextBtn.click();
          assertValueAndErrors(compEl, 2, currentErrorIndex);
          currentErrorIndex += errorDelta;

          nextAndThrowBtn.click();
          assertValueAndErrors(compEl, 3, currentErrorIndex);
          currentErrorIndex += errorDelta;
          nextAndThrowBtn.click();
          assertValueAndErrors(compEl, 4, currentErrorIndex);
          currentErrorIndex += errorDelta;

          nextAndThrowDirBtn.click();
          assertValueAndErrors(compEl, 5, currentErrorIndex);
          currentErrorIndex += errorDelta;
          nextAndThrowDirBtn.click();
          assertValueAndErrors(compEl, 6, currentErrorIndex);
          currentErrorIndex += errorDelta;

          // Assert that there were no more errors
          expect(logger.errors.length).toBe(currentErrorIndex);
          done();
        });

        function assertValueAndErrors(compEl: any, value: number, errorIndex: number) {
          expect(compEl).toHaveText(`Value:${value}`);
          expect(logger.errors[errorIndex][0]).toBe('ERROR');
          expect(logger.errors[errorIndex][1].message).toBe(`Error: ${value}`);

          // Ivy doesn't attach an error context.
          !ivyEnabled && expect(logger.errors[errorIndex + 1][0]).toBe('ERROR CONTEXT');
        }
      });
    }
  });
}

@Component({selector: 'my-comp', template: ''})
class MyComp1 {
  constructor(public injector: Injector) {}
}

@Pipe({name: 'somePipe', pure: true})
class PlatformPipe implements PipeTransform {
  transform(value: any): any {
    return 'somePlatformPipe';
  }
}

@Pipe({name: 'somePipe', pure: true})
class CustomPipe implements PipeTransform {
  transform(value: any): any {
    return 'someCustomPipe';
  }
}

@Component({selector: 'cmp-content', template: `<ng-content></ng-content>`})
class CmpWithNgContent {
}

@Component({selector: 'counting-cmp', template: ''})
class MyCountingComp {
  method(): {value: string}|undefined {
    MyCountingComp.calls++;
    return {value: 'counting method value'};
  }

  static reset() {
    MyCountingComp.calls = 0;
  }
  static calls = 0;
}

@Pipe({name: 'countingPipe'})
class CountingPipe implements PipeTransform {
  transform(value: any): any {
    CountingPipe.calls++;
    return {value: 'counting pipe value'};
  }
  static reset() {
    CountingPipe.calls = 0;
  }
  static calls = 0;
}

@Component({
  selector: 'left',
  template: `L<right *ngIf="false"></right>`,
})
class LeftComp {
}

@Component({
  selector: 'right',
  template: `R<left *ngIf="false"></left>`,
})
class RightComp {
}

@Component({
  selector: 'fakeRecursiveComp',
  template: `[<left *ngIf="false"></left><right *ngIf="false"></right>]`,
})
export class FakeRecursiveComp {
}

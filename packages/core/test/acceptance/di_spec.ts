/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Attribute, ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, Host, HostBinding, INJECTOR, Inject, Injectable, InjectionToken, Injector, Input, LOCALE_ID, ModuleWithProviders, NgModule, Optional, Output, Pipe, PipeTransform, Self, SkipSelf, TemplateRef, ViewChild, ViewContainerRef, forwardRef, ɵDEFAULT_LOCALE_ID as DEFAULT_LOCALE_ID} from '@angular/core';
import {ViewRef} from '@angular/core/src/render3/view_ref';
import {TestBed} from '@angular/core/testing';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('di', () => {
  describe('no dependencies', () => {
    it('should create directive with no deps', () => {
      @Directive({selector: '[dir]', exportAs: 'dir'})
      class MyDirective {
        value = 'Created';
      }
      @Component({template: '<div dir #dir="dir">{{ dir.value }}</div>'})
      class MyComp {
      }
      TestBed.configureTestingModule({declarations: [MyDirective, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toContain('Created');
    });
  });

  describe('multi providers', () => {
    it('should process ModuleWithProvider providers after module imports', () => {
      const testToken = new InjectionToken<string[]>('test-multi');

      @NgModule({providers: [{provide: testToken, useValue: 'A', multi: true}]})
      class TestModuleA {
      }

      @NgModule({providers: [{provide: testToken, useValue: 'B', multi: true}]})
      class TestModuleB {
      }

      TestBed.configureTestingModule({
        imports: [
          {
            ngModule: TestModuleA,
            providers: [{provide: testToken, useValue: 'C', multi: true}],
          },
          TestModuleB,
        ]
      });

      expect(TestBed.get(testToken) as string[]).toEqual(['A', 'B', 'C']);
    });
  });

  describe('directive injection', () => {

    let log: string[] = [];

    @Directive({selector: '[dirB]', exportAs: 'dirB'})
    class DirectiveB {
      @Input() value = 'DirB';

      constructor() { log.push(this.value); }
    }

    beforeEach(() => log = []);

    it('should create directive with intra view dependencies', () => {
      @Directive({selector: '[dirA]', exportAs: 'dirA'})
      class DirectiveA {
        value = 'DirA';
      }

      @Directive({selector: '[dirC]', exportAs: 'dirC'})
      class DirectiveC {
        value: string;

        constructor(dirA: DirectiveA, dirB: DirectiveB) { this.value = dirA.value + dirB.value; }
      }

      @Component({
        template: `
        <div dirA>
          <span dirB dirC #dir="dirC">{{ dir.value }}</span>
        </div>
      `
      })
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, DirectiveC, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('span');
      expect(divElement.textContent).toContain('DirADirB');
    });

    it('should instantiate injected directives in dependency order', () => {
      @Directive({selector: '[dirA]'})
      class DirectiveA {
        value = 'dirA';

        constructor(dirB: DirectiveB) { log.push(`DirA (dep: ${dirB.value})`); }
      }

      @Component({template: '<div dirA dirB></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (dep: DirB)']);
    });

    it('should fallback to the module injector', () => {
      @Directive({selector: '[dirA]'})
      class DirectiveA {
        value = 'dirA';

        constructor(dirB: DirectiveB) { log.push(`DirA (dep: ${dirB.value})`); }
      }

      // - dirB is know to the node injectors
      // - then when dirA tries to inject dirB, it will check the node injector first tree
      // - if not found, it will check the module injector tree
      @Component({template: '<div dirB></div><div dirA></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({
        declarations: [DirectiveA, DirectiveB, MyComp],
        providers: [{provide: DirectiveB, useValue: {value: 'module'}}]
      });
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (dep: module)']);
    });

    it('should instantiate injected directives before components', () => {
      @Component({selector: 'my-comp', template: ''})
      class MyComp {
        constructor(dirB: DirectiveB) { log.push(`Comp (dep: ${dirB.value})`); }
      }

      @Component({template: '<my-comp dirB></my-comp>'})
      class MyApp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveB, MyComp, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'Comp (dep: DirB)']);
    });

    it('should inject directives in the correct order in a for loop', () => {
      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(dir: DirectiveB) { log.push(`DirA (dep: ${dir.value})`); }
      }

      @Component({template: '<div dirA dirB *ngFor="let i of array"></div>'})
      class MyComp {
        array = [1, 2, 3];
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(
          ['DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)', 'DirB', 'DirA (dep: DirB)']);
    });

    it('should instantiate directives with multiple out-of-order dependencies', () => {
      @Directive({selector: '[dirA]'})
      class DirectiveA {
        value = 'DirA';

        constructor() { log.push(this.value); }
      }

      @Directive({selector: '[dirC]'})
      class DirectiveC {
        value = 'DirC';

        constructor() { log.push(this.value); }
      }

      @Directive({selector: '[dirB]'})
      class DirectiveB {
        constructor(dirA: DirectiveA, dirC: DirectiveC) {
          log.push(`DirB (deps: ${dirA.value} and ${dirC.value})`);
        }
      }

      @Component({template: '<div dirA dirB dirC></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, DirectiveC, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(log).toEqual(['DirA', 'DirC', 'DirB (deps: DirA and DirC)']);
    });

    it('should instantiate in the correct order for complex case', () => {
      @Directive({selector: '[dirC]'})
      class DirectiveC {
        value = 'DirC';

        constructor(dirB: DirectiveB) { log.push(`DirC (dep: ${dirB.value})`); }
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        value = 'DirA';

        constructor(dirC: DirectiveC) { log.push(`DirA (dep: ${dirC.value})`); }
      }

      @Directive({selector: '[dirD]'})
      class DirectiveD {
        value = 'DirD';

        constructor(dirA: DirectiveA) { log.push(`DirD (dep: ${dirA.value})`); }
      }

      @Component({selector: 'my-comp', template: ''})
      class MyComp {
        constructor(dirD: DirectiveD) { log.push(`Comp (dep: ${dirD.value})`); }
      }

      @Component({template: '<my-comp dirA dirB dirC dirD></my-comp>'})
      class MyApp {
      }

      TestBed.configureTestingModule(
          {declarations: [DirectiveA, DirectiveB, DirectiveC, DirectiveD, MyComp, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(
          ['DirB', 'DirC (dep: DirB)', 'DirA (dep: DirC)', 'DirD (dep: DirA)', 'Comp (dep: DirD)']);
    });

    it('should instantiate in correct order with mixed parent and peer dependencies', () => {
      @Component({template: '<div dirA dirB dirC></div>'})
      class MyApp {
        value = 'App';
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(dirB: DirectiveB, app: MyApp) {
          log.push(`DirA (deps: ${dirB.value} and ${app.value})`);
        }
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirA (deps: DirB and App)']);
    });

    it('should not use a parent when peer dep is available', () => {
      let count = 1;

      @Directive({selector: '[dirB]'})
      class DirectiveB {
        count: number;

        constructor() {
          log.push(`DirB`);
          this.count = count++;
        }
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(dirB: DirectiveB) { log.push(`DirA (dep: DirB - ${dirB.count})`); }
      }

      @Component({selector: 'my-comp', template: '<div dirA dirB></div>'})
      class MyComp {
      }

      @Component({template: '<my-comp dirB></my-comp>'})
      class MyApp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();

      expect(log).toEqual(['DirB', 'DirB', 'DirA (dep: DirB - 2)']);
    });

    describe('dependencies in parent views', () => {

      @Directive({selector: '[dirA]', exportAs: 'dirA'})
      class DirectiveA {
        injector: Injector;

        constructor(public dirB: DirectiveB, public vcr: ViewContainerRef) {
          this.injector = vcr.injector;
        }
      }

      @Component(
          {selector: 'my-comp', template: '<div dirA #dir="dirA">{{ dir.dirB.value }}</div>'})
      class MyComp {
      }

      it('should find dependencies on component hosts', () => {
        @Component({template: '<my-comp dirB></my-comp>'})
        class MyApp {
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies for directives in embedded views', () => {
        @Component({
          template: `<div dirB>
            <div *ngIf="showing">
              <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
            </div>
          </div>`
        })
        class MyApp {
          showing = false;
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.componentInstance.showing = true;
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies of directives nested deeply in inline views', () => {
        @Component({
          template: `<div dirB>
            <ng-container *ngIf="!skipContent">
              <ng-container *ngIf="!skipContent2">
                <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
              </ng-container>
            </ng-container>
          </div>`
        })
        class MyApp {
          skipContent = false;
          skipContent2 = false;
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
      });

      it('should find dependencies in declaration tree of ng-template (not insertion tree)', () => {
        @Directive({selector: '[structuralDir]'})
        class StructuralDirective {
          @Input() tmp !: TemplateRef<any>;

          constructor(public vcr: ViewContainerRef) {}

          create() { this.vcr.createEmbeddedView(this.tmp); }
        }

        @Component({
          template: `<div dirB value="declaration">
           <ng-template #foo>
               <div dirA #dir="dirA">{{ dir.dirB.value }}</div>
           </ng-template>
         </div>

         <div dirB value="insertion">
           <div structuralDir [tmp]="foo"></div>
           <!-- insertion point -->
         </div>`
        })
        class MyComp {
          @ViewChild(StructuralDirective, {static: false}) structuralDir !: StructuralDirective;
        }

        TestBed.configureTestingModule(
            {declarations: [StructuralDirective, DirectiveA, DirectiveB, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        fixture.componentInstance.structuralDir.create();
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div[value=insertion]');
        expect(divElement.textContent).toEqual('declaration');
      });

      it('should create injectors on second template pass', () => {
        @Component({
          template: `<div>
            <my-comp dirB></my-comp>
            <my-comp dirB></my-comp>
          </div>`
        })
        class MyApp {
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirBDirB');
      });

      it('should create injectors and host bindings in same view', () => {
        @Directive({selector: '[hostBindingDir]'})
        class HostBindingDirective {
          @HostBinding('id') id = 'foo';
        }

        @Component({
          template: `<div dirB hostBindingDir>
            <p dirA #dir="dirA">{{ dir.dirB.value }}</p>
          </div>`
        })
        class MyApp {
          @ViewChild(HostBindingDirective, {static: false}) hostBindingDir !: HostBindingDirective;
          @ViewChild(DirectiveA, {static: false}) dirA !: DirectiveA;
        }

        TestBed.configureTestingModule(
            {declarations: [DirectiveA, DirectiveB, HostBindingDirective, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        expect(divElement.textContent).toEqual('DirB');
        expect(divElement.id).toEqual('foo');

        const dirA = fixture.componentInstance.dirA;
        expect(dirA.vcr.injector).toEqual(dirA.injector);

        const hostBindingDir = fixture.componentInstance.hostBindingDir;
        hostBindingDir.id = 'bar';
        fixture.detectChanges();
        expect(divElement.id).toBe('bar');
      });
    });

    it('should throw if directive is not found anywhere', () => {
      @Directive({selector: '[dirB]'})
      class DirectiveB {
        constructor() {}
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(siblingDir: DirectiveB) {}
      }

      @Component({template: '<div dirA></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for DirectiveB/);
    });

    it('should throw if directive is not found in ancestor tree', () => {
      @Directive({selector: '[dirB]'})
      class DirectiveB {
        constructor() {}
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(siblingDir: DirectiveB) {}
      }

      @Component({template: '<div dirA></div><div dirB></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for DirectiveB/);
    });

    onlyInIvy('Ivy has different error message for circular dependency')
        .it('should throw if directives try to inject each other', () => {
          @Directive({selector: '[dirB]'})
          class DirectiveB {
            constructor(@Inject(forwardRef(() => DirectiveA)) siblingDir: DirectiveA) {}
          }

          @Directive({selector: '[dirA]'})
          class DirectiveA {
            constructor(siblingDir: DirectiveB) {}
          }

          @Component({template: '<div dirA dirB></div>'})
          class MyComp {
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
          expect(() => TestBed.createComponent(MyComp)).toThrowError(/Circular dep for/);
        });

    onlyInIvy('Ivy has different error message for circular dependency')
        .it('should throw if directive tries to inject itself', () => {
          @Directive({selector: '[dirA]'})
          class DirectiveA {
            constructor(siblingDir: DirectiveA) {}
          }

          @Component({template: '<div dirA></div>'})
          class MyComp {
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
          expect(() => TestBed.createComponent(MyComp)).toThrowError(/Circular dep for/);
        });

    describe('flags', () => {

      @Directive({selector: '[dirB]'})
      class DirectiveB {
        @Input('dirB') value = '';
      }

      describe('Optional', () => {

        @Directive({selector: '[dirA]'})
        class DirectiveA {
          constructor(@Optional() public dirB: DirectiveB) {}
        }

        it('should not throw if dependency is @Optional (module injector)', () => {

          @Component({template: '<div dirA></div>'})
          class MyComp {
            @ViewChild(DirectiveA, {static: false}) dirA !: DirectiveA;
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirA = fixture.componentInstance.dirA;
          expect(dirA.dirB).toBeNull();
        });

        it('should return null if @Optional dependency has @Self flag', () => {

          @Directive({selector: '[dirC]'})
          class DirectiveC {
            constructor(@Optional() @Self() public dirB: DirectiveB) {}
          }

          @Component({template: '<div dirC></div>'})
          class MyComp {
            @ViewChild(DirectiveC, {static: false}) dirC !: DirectiveC;
          }

          TestBed.configureTestingModule({declarations: [DirectiveC, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirC = fixture.componentInstance.dirC;
          expect(dirC.dirB).toBeNull();
        });

        it('should not throw if dependency is @Optional but defined elsewhere', () => {

          @Directive({selector: '[dirC]'})
          class DirectiveC {
            constructor(@Optional() public dirB: DirectiveB) {}
          }

          @Component({template: '<div dirB></div><div dirC></div>'})
          class MyComp {
            @ViewChild(DirectiveC, {static: false}) dirC !: DirectiveC;
          }

          TestBed.configureTestingModule({declarations: [DirectiveB, DirectiveC, MyComp]});
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();

          const dirC = fixture.componentInstance.dirC;
          expect(dirC.dirB).toBeNull();
        });
      });

      it('should skip the current node with @SkipSelf', () => {

        @Directive({selector: '[dirA]'})
        class DirectiveA {
          constructor(@SkipSelf() public dirB: DirectiveB) {}
        }

        @Component({selector: 'my-comp', template: '<div dirA dirB="self"></div>'})
        class MyComp {
          @ViewChild(DirectiveA, {static: false}) dirA !: DirectiveA;
        }

        @Component({template: '<my-comp dirB="parent"></my-comp>'})
        class MyApp {
          @ViewChild(MyComp, {static: false}) myComp !: MyComp;
        }

        TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();

        const dirA = fixture.componentInstance.myComp.dirA;
        expect(dirA.dirB.value).toEqual('parent');
      });

      onlyInIvy('Ivy has different error message when dependency is not found')
          .it('should check only the current node with @Self', () => {

            @Directive({selector: '[dirA]'})
            class DirectiveA {
              constructor(@Self() public dirB: DirectiveB) {}
            }

            @Component({template: '<div dirB><div dirA></div></div>'})
            class MyComp {
            }
            TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
            expect(() => TestBed.createComponent(MyComp))
                .toThrowError(/NodeInjector: NOT_FOUND \[DirectiveB]/);
          });

      describe('@Host', () => {
        @Directive({selector: '[dirA]'})
        class DirectiveA {
          constructor(@Host() public dirB: DirectiveB) {}
        }

        @Directive({selector: '[dirString]'})
        class DirectiveString {
          constructor(@Host() public s: String) {}
        }

        it('should find viewProviders on the host itself', () => {
          @Component({
            selector: 'my-comp',
            template: '<div dirString></div>',
            viewProviders: [{provide: String, useValue: 'Foo'}]
          })
          class MyComp {
            @ViewChild(DirectiveString, {static: false}) dirString !: DirectiveString;
          }

          @Component({template: '<my-comp></my-comp>'})
          class MyApp {
            @ViewChild(MyComp, {static: false}) myComp !: MyComp;
          }

          TestBed.configureTestingModule({declarations: [DirectiveString, MyComp, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          const dirString = fixture.componentInstance.myComp.dirString;
          expect(dirString.s).toBe('Foo');
        });

        it('should find host component on the host itself', () => {
          @Directive({selector: '[dirComp]'})
          class DirectiveComp {
            constructor(@Inject(forwardRef(() => MyComp)) @Host() public comp: MyComp) {}
          }

          @Component({selector: 'my-comp', template: '<div dirComp></div>'})
          class MyComp {
            @ViewChild(DirectiveComp, {static: false}) dirComp !: DirectiveComp;
          }

          @Component({template: '<my-comp></my-comp>'})
          class MyApp {
            @ViewChild(MyComp, {static: false}) myComp !: MyComp;
          }

          TestBed.configureTestingModule({declarations: [DirectiveComp, MyComp, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          const myComp = fixture.componentInstance.myComp;
          const dirComp = myComp.dirComp;
          expect(dirComp.comp).toBe(myComp);
        });

        onlyInIvy('Ivy has different error message when dependency is not found')
            .it('should not find providers on the host itself', () => {
              @Component({
                selector: 'my-comp',
                template: '<div dirString></div>',
                providers: [{provide: String, useValue: 'Foo'}]
              })
              class MyComp {
              }

              @Component({template: '<my-comp></my-comp>'})
              class MyApp {
              }

              TestBed.configureTestingModule({declarations: [DirectiveString, MyComp, MyApp]});
              expect(() => TestBed.createComponent(MyApp))
                  .toThrowError(/NodeInjector: NOT_FOUND \[String]/);
            });

        onlyInIvy('Ivy has different error message when dependency is not found')
            .it('should not find other directives on the host itself', () => {
              @Component({selector: 'my-comp', template: '<div dirA></div>'})
              class MyComp {
              }

              @Component({template: '<my-comp dirB></my-comp>'})
              class MyApp {
              }

              TestBed.configureTestingModule(
                  {declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
              expect(() => TestBed.createComponent(MyApp))
                  .toThrowError(/NodeInjector: NOT_FOUND \[DirectiveB]/);
            });

        onlyInIvy('Ivy has different error message when dependency is not found')
            .it('should not find providers on the host itself if in inline view', () => {
              @Component({
                selector: 'my-comp',
                template: '<ng-container *ngIf="showing"><div dirA></div></ng-container>'
              })
              class MyComp {
                showing = false;
              }

              @Component({template: '<my-comp dirB></my-comp>'})
              class MyApp {
                @ViewChild(MyComp, {static: false}) myComp !: MyComp;
              }

              TestBed.configureTestingModule(
                  {declarations: [DirectiveA, DirectiveB, MyComp, MyApp]});
              const fixture = TestBed.createComponent(MyApp);
              fixture.detectChanges();
              expect(() => {
                fixture.componentInstance.myComp.showing = true;
                fixture.detectChanges();
              }).toThrowError(/NodeInjector: NOT_FOUND \[DirectiveB]/);
            });

        it('should find providers across embedded views if not passing component boundary', () => {
          @Component({template: '<div dirB><div *ngIf="showing" dirA></div></div>'})
          class MyApp {
            showing = false;
            @ViewChild(DirectiveA, {static: false}) dirA !: DirectiveA;
            @ViewChild(DirectiveB, {static: false}) dirB !: DirectiveB;
          }

          TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();
          fixture.componentInstance.showing = true;
          fixture.detectChanges();

          const dirA = fixture.componentInstance.dirA;
          const dirB = fixture.componentInstance.dirB;
          expect(dirA.dirB).toBe(dirB);
        });

        onlyInIvy('Ivy has different error message when dependency is not found')
            .it('should not find component above the host', () => {
              @Directive({selector: '[dirComp]'})
              class DirectiveComp {
                constructor(@Inject(forwardRef(() => MyApp)) @Host() public comp: MyApp) {}
              }

              @Component({selector: 'my-comp', template: '<div dirComp></div>'})
              class MyComp {
              }

              @Component({template: '<my-comp></my-comp>'})
              class MyApp {
              }

              TestBed.configureTestingModule({declarations: [DirectiveComp, MyComp, MyApp]});
              expect(() => TestBed.createComponent(MyApp))
                  .toThrowError(/NodeInjector: NOT_FOUND \[MyApp]/);
            });

        describe('regression', () => {
          // based on https://stackblitz.com/edit/angular-riss8k?file=src/app/app.component.ts
          it('should allow directives with Host flag to inject view providers from containing component',
             () => {
               class ControlContainer {}
               let controlContainers: ControlContainer[] = [];
               let injectedControlContainer: ControlContainer|null = null;

               @Directive({
                 selector: '[group]',
                 providers: [{provide: ControlContainer, useExisting: GroupDirective}]
               })
               class GroupDirective {
                 constructor() { controlContainers.push(this); }
               }

               @Directive({selector: '[control]'})
               class ControlDirective {
                 constructor(@Host() @SkipSelf() @Inject(ControlContainer) parent:
                                 ControlContainer) {
                   injectedControlContainer = parent;
                 }
               }

               @Component({
                 selector: 'my-comp',
                 template: '<input control>',
                 viewProviders: [{provide: ControlContainer, useExisting: GroupDirective}]
               })
               class MyComp {
               }

               @Component({
                 template: `
                   <div group>
                     <my-comp></my-comp>
                   </div>
                 `
               })
               class MyApp {
               }

               TestBed.configureTestingModule(
                   {declarations: [GroupDirective, ControlDirective, MyComp, MyApp]});
               const fixture = TestBed.createComponent(MyApp);
               expect(fixture.nativeElement.innerHTML)
                   .toBe('<div group=""><my-comp><input control=""></my-comp></div>');
               expect(controlContainers).toEqual([injectedControlContainer !]);
             });
        });
      });
    });
  });

  describe('service injection', () => {

    it('should create instance even when no injector present', () => {
      @Injectable({providedIn: 'root'})
      class MyService {
        value = 'MyService';
      }
      @Component({template: '<div>{{myService.value}}</div>'})
      class MyComp {
        constructor(public myService: MyService) {}
      }
      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toEqual('MyService');
    });

    it('should support sub-classes with no @Injectable decorator', () => {
      @Injectable()
      class Dependency {
      }

      @Injectable()
      class SuperClass {
        constructor(public dep: Dependency) {}
      }

      // Note, no @Injectable decorators for these two classes
      class SubClass extends SuperClass {}
      class SubSubClass extends SubClass {}

      @Component({template: ''})
      class MyComp {
        constructor(public myService: SuperClass) {}
      }
      TestBed.configureTestingModule({
        declarations: [MyComp],
        providers: [{provide: SuperClass, useClass: SubSubClass}, Dependency]
      });

      const warnSpy = spyOn(console, 'warn');
      const fixture = TestBed.createComponent(MyComp);
      expect(fixture.componentInstance.myService.dep instanceof Dependency).toBe(true);

      if (ivyEnabled) {
        expect(warnSpy).toHaveBeenCalledWith(
            `DEPRECATED: DI is instantiating a token "SubSubClass" that inherits its @Injectable decorator but does not provide one itself.\n` +
            `This will become an error in v10. Please add @Injectable() to the "SubSubClass" class.`);
      }
    });
  });

  describe('inject', () => {

    it('should inject from parent view', () => {
      @Directive({selector: '[parentDir]'})
      class ParentDirective {
      }

      @Directive({selector: '[childDir]', exportAs: 'childDir'})
      class ChildDirective {
        value: string;
        constructor(public parent: ParentDirective) { this.value = parent.constructor.name; }
      }

      @Directive({selector: '[child2Dir]', exportAs: 'child2Dir'})
      class Child2Directive {
        value: boolean;
        constructor(parent: ParentDirective, child: ChildDirective) {
          this.value = parent === child.parent;
        }
      }

      @Component({
        template: `<div parentDir>
          <ng-container *ngIf="showing">
            <span childDir child2Dir #child1="childDir" #child2="child2Dir">{{ child1.value }}-{{ child2.value }}</span>
          </ng-container>
        </div>`
      })
      class MyComp {
        showing = true;
      }
      TestBed.configureTestingModule(
          {declarations: [ParentDirective, ChildDirective, Child2Directive, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const divElement = fixture.nativeElement.querySelector('div');
      expect(divElement.textContent).toBe('ParentDirective-true');
    });
  });

  describe('Special tokens', () => {

    describe('Injector', () => {

      it('should inject the injector', () => {
        @Directive({selector: '[injectorDir]'})
        class InjectorDir {
          constructor(public injector: Injector) {}
        }

        @Directive({selector: '[otherInjectorDir]'})
        class OtherInjectorDir {
          constructor(public otherDir: InjectorDir, public injector: Injector) {}
        }

        @Component({template: '<div injectorDir otherInjectorDir></div>'})
        class MyComp {
          @ViewChild(InjectorDir, {static: false}) injectorDir !: InjectorDir;
          @ViewChild(OtherInjectorDir, {static: false}) otherInjectorDir !: OtherInjectorDir;
        }

        TestBed.configureTestingModule({declarations: [InjectorDir, OtherInjectorDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const injectorDir = fixture.componentInstance.injectorDir;
        const otherInjectorDir = fixture.componentInstance.otherInjectorDir;

        expect(injectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(otherInjectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(otherInjectorDir.injector.get(InjectorDir)).toBe(injectorDir);
        expect(injectorDir.injector).not.toBe(otherInjectorDir.injector);
      });

      it('should inject INJECTOR', () => {
        @Directive({selector: '[injectorDir]'})
        class InjectorDir {
          constructor(@Inject(INJECTOR) public injector: Injector) {}
        }

        @Component({template: '<div injectorDir></div>'})
        class MyComp {
          @ViewChild(InjectorDir, {static: false}) injectorDir !: InjectorDir;
        }

        TestBed.configureTestingModule({declarations: [InjectorDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const injectorDir = fixture.componentInstance.injectorDir;

        expect(injectorDir.injector.get(ElementRef).nativeElement).toBe(divElement);
        expect(injectorDir.injector.get(Injector).get(ElementRef).nativeElement).toBe(divElement);
        expect(injectorDir.injector.get(INJECTOR).get(ElementRef).nativeElement).toBe(divElement);
      });
    });

    describe('ElementRef', () => {

      it('should create directive with ElementRef dependencies', () => {
        @Directive({selector: '[dir]'})
        class MyDir {
          value: string;
          constructor(public elementRef: ElementRef) {
            this.value = (elementRef.constructor as any).name;
          }
        }

        @Directive({selector: '[otherDir]'})
        class MyOtherDir {
          isSameInstance: boolean;
          constructor(public elementRef: ElementRef, public directive: MyDir) {
            this.isSameInstance = elementRef === directive.elementRef;
          }
        }

        @Component({template: '<div dir otherDir></div>'})
        class MyComp {
          @ViewChild(MyDir, {static: false}) directive !: MyDir;
          @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        const divElement = fixture.nativeElement.querySelector('div');
        const directive = fixture.componentInstance.directive;
        const otherDirective = fixture.componentInstance.otherDirective;

        expect(directive.value).toContain('ElementRef');
        expect(directive.elementRef.nativeElement).toEqual(divElement);
        expect(otherDirective.elementRef.nativeElement).toEqual(divElement);

        // Each ElementRef instance should be unique
        expect(otherDirective.isSameInstance).toBe(false);
      });

      it('should create ElementRef with comment if requesting directive is on <ng-template> node',
         () => {
           @Directive({selector: '[dir]'})
           class MyDir {
             value: string;
             constructor(public elementRef: ElementRef<Node>) {
               this.value = (elementRef.constructor as any).name;
             }
           }

           @Component({template: '<ng-template dir></ng-template>'})
           class MyComp {
             @ViewChild(MyDir, {static: false}) directive !: MyDir;
           }

           TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
           const fixture = TestBed.createComponent(MyComp);
           fixture.detectChanges();

           const directive = fixture.componentInstance.directive;

           expect(directive.value).toContain('ElementRef');
           // the nativeElement should be a comment
           expect(directive.elementRef.nativeElement.nodeType).toEqual(Node.COMMENT_NODE);
         });
    });

    describe('TemplateRef', () => {

      @Directive({selector: '[dir]', exportAs: 'dir'})
      class MyDir {
        value: string;
        constructor(public templateRef: TemplateRef<any>) {
          this.value = (templateRef.constructor as any).name;
        }
      }
      onlyInIvy('Ivy creates a unique instance of TemplateRef for each directive')
          .it('should create directive with TemplateRef dependencies', () => {
            @Directive({selector: '[otherDir]', exportAs: 'otherDir'})
            class MyOtherDir {
              isSameInstance: boolean;
              constructor(public templateRef: TemplateRef<any>, public directive: MyDir) {
                this.isSameInstance = templateRef === directive.templateRef;
              }
            }

            @Component({
              template: '<ng-template dir otherDir #dir="dir" #otherDir="otherDir"></ng-template>'
            })
            class MyComp {
              @ViewChild(MyDir, {static: false}) directive !: MyDir;
              @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
            }

            TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            const directive = fixture.componentInstance.directive;
            const otherDirective = fixture.componentInstance.otherDirective;

            expect(directive.value).toContain('TemplateRef');
            expect(directive.templateRef).not.toBeNull();
            expect(otherDirective.templateRef).not.toBeNull();

            // Each TemplateRef instance should be unique
            expect(otherDirective.isSameInstance).toBe(false);
          });

      it('should throw if injected on an element', () => {
        @Component({template: '<div dir></div>'})
        class MyComp {
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
        expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for TemplateRef/);
      });

      it('should throw if injected on an ng-container', () => {
        @Component({template: '<ng-container dir></ng-container>'})
        class MyComp {
        }

        TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
        expect(() => TestBed.createComponent(MyComp)).toThrowError(/No provider for TemplateRef/);
      });

      it('should NOT throw if optional and injected on an element', () => {
        @Directive({selector: '[optionalDir]', exportAs: 'optionalDir'})
        class OptionalDir {
          constructor(@Optional() public templateRef: TemplateRef<any>) {}
        }
        @Component({template: '<div optionalDir></div>'})
        class MyComp {
          @ViewChild(OptionalDir, {static: false}) directive !: OptionalDir;
        }

        TestBed.configureTestingModule({declarations: [OptionalDir, MyComp]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        expect(fixture.componentInstance.directive.templateRef).toBeNull();
      });
    });

    describe('ViewContainerRef', () => {
      onlyInIvy('Ivy creates a unique instance of ViewContainerRef for each directive')
          .it('should create directive with ViewContainerRef dependencies', () => {
            @Directive({selector: '[dir]', exportAs: 'dir'})
            class MyDir {
              value: string;
              constructor(public viewContainerRef: ViewContainerRef) {
                this.value = (viewContainerRef.constructor as any).name;
              }
            }
            @Directive({selector: '[otherDir]', exportAs: 'otherDir'})
            class MyOtherDir {
              isSameInstance: boolean;
              constructor(public viewContainerRef: ViewContainerRef, public directive: MyDir) {
                this.isSameInstance = viewContainerRef === directive.viewContainerRef;
              }
            }
            @Component({template: '<div dir otherDir #dir="dir" #otherDir="otherDir"></div>'})
            class MyComp {
              @ViewChild(MyDir, {static: false}) directive !: MyDir;
              @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
            }

            TestBed.configureTestingModule({declarations: [MyDir, MyOtherDir, MyComp]});
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();

            const directive = fixture.componentInstance.directive;
            const otherDirective = fixture.componentInstance.otherDirective;

            expect(directive.value).toContain('ViewContainerRef');
            expect(directive.viewContainerRef).not.toBeNull();
            expect(otherDirective.viewContainerRef).not.toBeNull();

            // Each ViewContainerRef instance should be unique
            expect(otherDirective.isSameInstance).toBe(false);
          });

      it('should sync ViewContainerRef state between all injected instances', () => {
        @Component({
          selector: 'root',
          template: `<ng-template #tmpl>Test</ng-template>`,
        })
        class Root {
          @ViewChild(TemplateRef, {static: true})
          tmpl !: TemplateRef<any>;

          constructor(public vcr: ViewContainerRef, public vcr2: ViewContainerRef) {}

          ngOnInit(): void { this.vcr.createEmbeddedView(this.tmpl); }
        }

        TestBed.configureTestingModule({
          declarations: [Root],
        });

        const fixture = TestBed.createComponent(Root);
        fixture.detectChanges();
        const cmp = fixture.componentInstance;

        expect(cmp.vcr.length).toBe(1);
        expect(cmp.vcr2.length).toBe(1);
        expect(cmp.vcr2.get(0)).toEqual(cmp.vcr.get(0));

        cmp.vcr2.remove(0);
        expect(cmp.vcr.length).toBe(0);
        expect(cmp.vcr.get(0)).toBeNull();
      });
    });

    describe('ChangeDetectorRef', () => {

      @Directive({selector: '[dir]', exportAs: 'dir'})
      class MyDir {
        value: string;
        constructor(public cdr: ChangeDetectorRef) { this.value = (cdr.constructor as any).name; }
      }
      @Directive({selector: '[otherDir]', exportAs: 'otherDir'})
      class MyOtherDir {
        constructor(public cdr: ChangeDetectorRef) {}
      }
      @Component({selector: 'my-comp', template: '<ng-content></ng-content>'})
      class MyComp {
        constructor(public cdr: ChangeDetectorRef) {}
      }

      it('should inject host component ChangeDetectorRef into directives on templates', () => {
        let pipeInstance: MyPipe;

        @Pipe({name: 'pipe'})
        class MyPipe implements PipeTransform {
          constructor(public cdr: ChangeDetectorRef) { pipeInstance = this; }

          transform(value: any): any { return value; }
        }

        @Component({
          selector: 'my-app',
          template: `<div *ngIf="showing | pipe">Visible</div>`,
        })
        class MyApp {
          showing = true;

          constructor(public cdr: ChangeDetectorRef) {}
        }

        TestBed.configureTestingModule({declarations: [MyApp, MyPipe], imports: [CommonModule]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        expect((pipeInstance !.cdr as ViewRef<MyApp>).context).toBe(fixture.componentInstance);
      });

      it('should inject current component ChangeDetectorRef into directives on the same node as components',
         () => {
           @Component({selector: 'my-app', template: '<my-comp dir otherDir #dir="dir"></my-comp>'})
           class MyApp {
             @ViewChild(MyComp, {static: false}) component !: MyComp;
             @ViewChild(MyDir, {static: false}) directive !: MyDir;
             @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
           }
           TestBed.configureTestingModule({declarations: [MyApp, MyComp, MyDir, MyOtherDir]});
           const fixture = TestBed.createComponent(MyApp);
           fixture.detectChanges();
           const app = fixture.componentInstance;
           const comp = fixture.componentInstance.component;
           expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);
           // ChangeDetectorRef is the token, ViewRef has historically been the constructor
           expect(app.directive.value).toContain('ViewRef');

           // Each ChangeDetectorRef instance should be unique
           expect(app.directive !.cdr).not.toBe(comp !.cdr);
           expect(app.directive !.cdr).not.toBe(app.otherDirective !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives on normal elements',
         () => {
           @Component({selector: 'my-comp', template: '<div dir otherDir #dir="dir"></div>'})
           class MyComp {
             constructor(public cdr: ChangeDetectorRef) {}
             @ViewChild(MyDir, {static: false}) directive !: MyDir;
             @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
           }
           TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
           const fixture = TestBed.createComponent(MyComp);
           fixture.detectChanges();
           const comp = fixture.componentInstance;
           expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);
           // ChangeDetectorRef is the token, ViewRef has historically been the constructor
           expect(comp.directive.value).toContain('ViewRef');

           // Each ChangeDetectorRef instance should be unique
           expect(comp.directive !.cdr).not.toBe(comp.cdr);
           expect(comp.directive !.cdr).not.toBe(comp.otherDirective !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives in a component\'s ContentChildren',
         () => {
           @Component({
             selector: 'my-app',
             template: `<my-comp>
               <div dir otherDir #dir="dir"></div>
             </my-comp>
              `
           })
           class MyApp {
             constructor(public cdr: ChangeDetectorRef) {}
             @ViewChild(MyComp, {static: false}) component !: MyComp;
             @ViewChild(MyDir, {static: false}) directive !: MyDir;
             @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
           }
           TestBed.configureTestingModule({declarations: [MyApp, MyComp, MyDir, MyOtherDir]});
           const fixture = TestBed.createComponent(MyApp);
           fixture.detectChanges();
           const app = fixture.componentInstance;
           expect((app !.cdr as ViewRef<MyApp>).context).toBe(app);
           const comp = fixture.componentInstance.component;
           // ChangeDetectorRef is the token, ViewRef has historically been the constructor
           expect(app.directive.value).toContain('ViewRef');

           // Each ChangeDetectorRef instance should be unique
           expect(app.directive !.cdr).not.toBe(comp.cdr);
           expect(app.directive !.cdr).not.toBe(app.otherDirective !.cdr);
         });

      it('should inject host component ChangeDetectorRef into directives in embedded views', () => {
        @Component({
          selector: 'my-comp',
          template: `<ng-container *ngIf="showing">
            <div dir otherDir #dir="dir" *ngIf="showing"></div>
          </ng-container>`
        })
        class MyComp {
          showing = true;
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyDir, {static: false}) directive !: MyDir;
          @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(comp.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(comp.directive !.cdr).not.toBe(comp.cdr);
        expect(comp.directive !.cdr).not.toBe(comp.otherDirective !.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on containers', () => {
        @Component(
            {selector: 'my-comp', template: '<div dir otherDir #dir="dir" *ngIf="showing"></div>'})
        class MyComp {
          showing = true;
          constructor(public cdr: ChangeDetectorRef) {}
          @ViewChild(MyDir, {static: false}) directive !: MyDir;
          @ViewChild(MyOtherDir, {static: false}) otherDirective !: MyOtherDir;
        }

        TestBed.configureTestingModule({declarations: [MyComp, MyDir, MyOtherDir]});
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        expect((comp !.cdr as ViewRef<MyComp>).context).toBe(comp);
        // ChangeDetectorRef is the token, ViewRef has historically been the constructor
        expect(comp.directive.value).toContain('ViewRef');

        // Each ChangeDetectorRef instance should be unique
        expect(comp.directive !.cdr).not.toBe(comp.cdr);
        expect(comp.directive !.cdr).not.toBe(comp.otherDirective !.cdr);
      });

      it('should inject host component ChangeDetectorRef into directives on ng-container', () => {
        let dirInstance: MyDirective;

        @Directive({selector: '[getCDR]'})
        class MyDirective {
          constructor(public cdr: ChangeDetectorRef) { dirInstance = this; }
        }

        @Component({
          selector: 'my-app',
          template: `<ng-container getCDR>Visible</ng-container>`,
        })
        class MyApp {
          constructor(public cdr: ChangeDetectorRef) {}
        }

        TestBed.configureTestingModule({declarations: [MyApp, MyDirective]});
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        expect((dirInstance !.cdr as ViewRef<MyApp>).context).toBe(fixture.componentInstance);
      });
    });
  });

  describe('string tokens', () => {
    it('should be able to provide a string token', () => {
      @Directive({selector: '[injectorDir]', providers: [{provide: 'test', useValue: 'provided'}]})
      class InjectorDir {
        constructor(@Inject('test') public value: string) {}
      }

      @Component({template: '<div injectorDir></div>'})
      class MyComp {
        @ViewChild(InjectorDir, {static: false}) injectorDirInstance !: InjectorDir;
      }

      TestBed.configureTestingModule({declarations: [InjectorDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const injectorDir = fixture.componentInstance.injectorDirInstance;

      expect(injectorDir.value).toBe('provided');
    });
  });

  it('should not cause cyclic dependency if same token is requested in deps with @SkipSelf', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{
        provide: LOCALE_ID,
        useFactory: () => 'ja-JP',
        // Note: `LOCALE_ID` is also provided within APPLICATION_MODULE_PROVIDERS, so we use it here
        // as a dep and making sure it doesn't cause cyclic dependency (since @SkipSelf is present)
        deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
      }]
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('ja-JP');
  });

  it('module-level deps should not access Component/Directive providers', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{
        provide: 'LOCALE_ID_DEP',  //
        useValue: 'LOCALE_ID_DEP_VALUE'
      }]
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({
      declarations: [MyComp],
      providers: [{
        provide: LOCALE_ID,
        // we expect `localeDepValue` to be undefined, since it's not provided at a module level
        useFactory: (localeDepValue: any) => localeDepValue || 'en-GB',
        deps: [[new Inject('LOCALE_ID_DEP'), new Optional()]]
      }]
    });
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('en-GB');
  });

  it('should skip current level while retrieving tokens if @SkipSelf is defined', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{provide: LOCALE_ID, useFactory: () => 'en-GB'}]
    })
    class MyComp {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    // takes `LOCALE_ID` from module injector, since we skip Component level with @SkipSelf
    expect(fixture.componentInstance.localeId).toBe(DEFAULT_LOCALE_ID);
  });

  it('should work when injecting dependency in Directives', () => {
    @Directive({
      selector: '[dir]',  //
      providers: [{provide: LOCALE_ID, useValue: 'ja-JP'}]
    })
    class MyDir {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }
    @Component({
      selector: 'my-comp',
      template: '<div dir></div>',
      providers: [{provide: LOCALE_ID, useValue: 'en-GB'}]
    })
    class MyComp {
      @ViewChild(MyDir, {static: false}) myDir !: MyDir;
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyDir, MyComp, MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.myDir.localeId).toBe('en-GB');
  });

  describe('@Attribute', () => {

    it('should inject attributes', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('nonExist') public nonExist: string) {}
      }

      @Component({template: '<div dir exist="existValue" other="ignore"></div>'})
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.nonExist).toBeNull();
    });

    it('should inject attributes on <ng-template>', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('dir') public myDirectiveAttrValue: string) {}
      }

      @Component(
          {template: '<ng-template dir="initial" exist="existValue" other="ignore"></ng-template>'})
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.myDirectiveAttrValue).toBe('initial');
    });

    it('should inject attributes on <ng-container>', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('dir') public myDirectiveAttrValue: string) {}
      }

      @Component({
        template: '<ng-container dir="initial" exist="existValue" other="ignore"></ng-container>'
      })
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.myDirectiveAttrValue).toBe('initial');
    });

    it('should be able to inject different kinds of attributes', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('class') public className: string,
            @Attribute('style') public inlineStyles: string,
            @Attribute('other-attr') public otherAttr: string) {}
      }

      @Component({
        template:
            '<div dir style="margin: 1px; color: red;" class="hello there" other-attr="value"></div>'
      })
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.otherAttr).toBe('value');
      expect(directive.className).toBe('hello there');
      expect(directive.inlineStyles).toMatch(/color:\s*red/);
      expect(directive.inlineStyles).toMatch(/margin:\s*1px/);
    });

    it('should not inject attributes with namespace', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('svg:exist') public namespacedExist: string,
            @Attribute('other') public other: string) {}
      }

      @Component({
        template: '<div dir exist="existValue" svg:exist="testExistValue" other="otherValue"></div>'
      })
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.namespacedExist).toBeNull();
      expect(directive.other).toBe('otherValue');
    });

    it('should not inject attributes representing bindings and outputs', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        @Input() binding !: string;
        @Output() output = new EventEmitter();
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('binding') public bindingAttr: string,
            @Attribute('output') public outputAttr: string,
            @Attribute('other') public other: string) {}
      }

      @Component({
        template:
            '<div dir exist="existValue" [binding]="bindingValue" (output)="outputValue" other="otherValue" ignore="ignoreValue"></div>'
      })
      class MyComp {
        @ViewChild(MyDir, {static: false}) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.bindingAttr).toBeNull();
      expect(directive.outputAttr).toBeNull();
      expect(directive.other).toBe('otherValue');
    });
  });
});

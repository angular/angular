/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Attribute, ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, INJECTOR, Inject, Injector, Input, LOCALE_ID, Optional, Output, Pipe, PipeTransform, SkipSelf, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {ViewRef} from '@angular/core/src/render3/view_ref';
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';


describe('di', () => {
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
          @ViewChild(InjectorDir) injectorDir !: InjectorDir;
          @ViewChild(OtherInjectorDir) otherInjectorDir !: OtherInjectorDir;
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
          @ViewChild(InjectorDir) injectorDir !: InjectorDir;
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
          @ViewChild(MyDir) directive !: MyDir;
          @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
             @ViewChild(MyDir) directive !: MyDir;
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
              @ViewChild(MyDir) directive !: MyDir;
              @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
          @ViewChild(OptionalDir) directive !: OptionalDir;
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
              @ViewChild(MyDir) directive !: MyDir;
              @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
             @ViewChild(MyComp) component !: MyComp;
             @ViewChild(MyDir) directive !: MyDir;
             @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
             @ViewChild(MyDir) directive !: MyDir;
             @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
             @ViewChild(MyComp) component !: MyComp;
             @ViewChild(MyDir) directive !: MyDir;
             @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
          @ViewChild(MyDir) directive !: MyDir;
          @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
          @ViewChild(MyDir) directive !: MyDir;
          @ViewChild(MyOtherDir) otherDirective !: MyOtherDir;
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
        @ViewChild(InjectorDir) injectorDirInstance !: InjectorDir;
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
    expect(fixture.componentInstance.localeId).toBe('en-US');
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
      @ViewChild(MyDir) myDir !: MyDir;
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.otherAttr).toBe('value');
      expect(directive.className).toBe('hello there');
      expect(directive.inlineStyles).toBe('margin: 1px; color: red;');
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
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
        @ViewChild(MyDir) directiveInstance !: MyDir;
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

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {state, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {AfterContentInit, Component, ComponentFactoryResolver, ComponentRef, ContentChildren, Directive, DoCheck, HostBinding, HostListener, Injectable, Input, NgModule, OnChanges, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {bypassSanitizationTrustHtml, bypassSanitizationTrustStyle, bypassSanitizationTrustUrl} from '@angular/core/src/sanitization/bypass';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('host bindings', () => {
  onlyInIvy('map-based [style] and [class] bindings are not supported in VE')
      .it('should render host bindings on the root component', () => {
        @Component({template: '...'})
        class MyApp {
          @HostBinding('style') myStylesExp = {};
          @HostBinding('class') myClassesExp = {};
        }

        TestBed.configureTestingModule({declarations: [MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        const element = fixture.nativeElement;
        fixture.detectChanges();

        const component = fixture.componentInstance;
        component.myStylesExp = {width: '100px'};
        component.myClassesExp = 'foo';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('100px');
        expect(element.classList.contains('foo')).toBeTruthy();

        component.myStylesExp = {width: '200px'};
        component.myClassesExp = 'bar';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('200px');
        expect(element.classList.contains('foo')).toBeFalsy();
        expect(element.classList.contains('bar')).toBeTruthy();
      });

  describe('defined in @Component', () => {
    it('should combine the inherited static classes of a parent and child component', () => {
      @Component({template: '...', host: {'class': 'foo bar'}})
      class ParentCmp {
      }

      @Component({template: '...', host: {'class': 'foo baz'}})
      class ChildCmp extends ParentCmp {
      }

      TestBed.configureTestingModule({declarations: [ChildCmp]});
      const fixture = TestBed.createComponent(ChildCmp);
      fixture.detectChanges();

      const element = fixture.nativeElement;
      if (ivyEnabled) {
        expect(element.classList.contains('bar')).toBeTruthy();
      }
      expect(element.classList.contains('foo')).toBeTruthy();
      expect(element.classList.contains('baz')).toBeTruthy();
    });

    it('should render host class and style on the root component', () => {
      @Component({template: '...', host: {class: 'foo', style: 'color: red'}})
      class MyApp {
      }

      TestBed.configureTestingModule({declarations: [MyApp]});
      const fixture = TestBed.createComponent(MyApp);
      const element = fixture.nativeElement;
      fixture.detectChanges();

      expect(element.style['color']).toEqual('red');
      expect(element.classList.contains('foo')).toBeTruthy();
    });


    it('should not cause problems if detectChanges is called when a property updates', () => {
      /**
       * Angular Material CDK Tree contains a code path whereby:
       *
       * 1. During the execution of a template function in which **more than one** property is
       * updated in a row.
       * 2. A property that **is not the last property** is updated in the **original template**:
       *   - That sets up a new observable and subscribes to it
       *   - The new observable it sets up can emit synchronously.
       *   - When it emits, it calls `detectChanges` on a `ViewRef` that it has a handle to
       *   - That executes a **different template**, that has host bindings
       *     - this executes `setHostBindings`
       *     - Inside of `setHostBindings` we are currently updating the selected index **global
       *       state** via `setSelectedIndex`.
       * 3. We attempt to update the next property in the **original template**.
       *  - But the selected index has been altered, and we get errors.
       */

      @Component({
        selector: 'child',
        template: `...`,
      })
      class ChildCmp {
      }

      @Component({
        selector: 'parent',
        template: `
        <div>
          <div #template></div>
          <p>{{prop}}</p>
          <p>{{prop2}}</p>
        </div>
      `,
        host: {
          '[style.color]': 'color',
        },
      })
      class ParentCmp {
        private _prop = '';

        @ViewChild('template', {read: ViewContainerRef}) vcr: ViewContainerRef = null!;

        private child: ComponentRef<ChildCmp> = null!;

        @Input()
        set prop(value: string) {
          // Material CdkTree has at least one scenario where setting a property causes a data
          // source
          // to update, which causes a synchronous call to detectChanges().
          this._prop = value;
          if (this.child) {
            this.child.changeDetectorRef.detectChanges();
          }
        }

        get prop() {
          return this._prop;
        }

        @Input() prop2 = 0;

        ngAfterViewInit() {
          const factory = this.componentFactoryResolver.resolveComponentFactory(ChildCmp);
          this.child = this.vcr.createComponent(factory);
        }

        constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
      }

      @Component({
        template: `<parent [prop]="prop" [prop2]="prop2"></parent>`,
      })
      class App {
        prop = 'a';
        prop2 = 1;
      }

      @NgModule({
        entryComponents: [ChildCmp],
        declarations: [ChildCmp],
      })
      class ChildCmpModule {
      }

      TestBed.configureTestingModule({declarations: [App, ParentCmp], imports: [ChildCmpModule]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.prop = 'b';
      fixture.componentInstance.prop2 = 2;
      fixture.detectChanges();
    });
  });

  describe('with synthetic (animations) props', () => {
    it('should work when directive contains synthetic props', () => {
      @Directive({
        selector: '[animationPropDir]',
      })
      class AnimationPropDir {
        @HostBinding('@myAnimation') myAnimation: string = 'color';
      }

      @Component({
        selector: 'my-comp',
        template: '<div animationPropDir>Some content</div>',
        animations: [
          trigger('myAnimation', [state('color', style({color: 'red'}))]),
        ],
      })
      class Comp {
      }

      TestBed.configureTestingModule({
        declarations: [Comp, AnimationPropDir],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();
      const queryResult = fixture.debugElement.query(By.directive(AnimationPropDir));
      expect(queryResult.nativeElement.style.color).toBe('red');
    });

    it('should work when directive contains synthetic props and directive is applied to a component',
       () => {
         @Directive({
           selector: '[animationPropDir]',
         })
         class AnimationPropDir {
           @HostBinding('@myAnimation') myAnimation: string = 'color';
         }

         @Component({
           selector: 'my-comp',
           template: 'Some content',
           animations: [
             trigger('myAnimation', [state('color', style({color: 'red'}))]),
           ],
         })
         class Comp {
         }

         @Component({
           selector: 'app',
           template: '<my-comp animationPropDir></my-comp>',
           animations: [
             trigger('myAnimation', [state('color', style({color: 'green'}))]),
           ],
         })
         class App {
         }

         TestBed.configureTestingModule({
           declarations: [App, Comp, AnimationPropDir],
           imports: [NoopAnimationsModule],
         });
         const fixture = TestBed.createComponent(App);
         fixture.detectChanges();
         const queryResult = fixture.debugElement.query(By.directive(AnimationPropDir));
         expect(queryResult.nativeElement.style.color).toBe('green');
       });

    it('should work when component contains synthetic props', () => {
      @Component({
        selector: 'my-comp',
        template: '<div>Some content/div>',
        animations: [
          trigger('myAnimation', [state('color', style({color: 'red'}))]),
        ],
      })
      class Comp {
        @HostBinding('@myAnimation') myAnimation: string = 'color';
      }

      TestBed.configureTestingModule({
        declarations: [Comp],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();
      expect(fixture.nativeElement.style.color).toBe('red');
    });

    it('should work when child component contains synthetic props', () => {
      @Component({
        selector: 'my-comp',
        template: '<div>Some content/div>',
        animations: [
          trigger('myAnimation', [state('color', style({color: 'red'}))]),
        ],
      })
      class Comp {
        @HostBinding('@myAnimation') myAnimation: string = 'color';
      }

      @Component({
        template: '<my-comp></my-comp>',
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, Comp],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const queryResult = fixture.debugElement.query(By.directive(Comp));
      expect(queryResult.nativeElement.style.color).toBe('red');
    });

    it('should work when component extends a directive that contains synthetic props', () => {
      @Directive({
        selector: 'animation-dir',
      })
      class AnimationDir {
        @HostBinding('@myAnimation') myAnimation: string = 'color';
      }

      @Component({
        selector: 'my-comp',
        template: '<div>Some content</div>',
        animations: [
          trigger('myAnimation', [state('color', style({color: 'red'}))]),
        ],
      })
      class Comp extends AnimationDir {
      }

      TestBed.configureTestingModule({
        declarations: [Comp, AnimationDir],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();
      expect(fixture.nativeElement.style.color).toBe('red');
    });

    it('should work when directive contains synthetic listeners', async () => {
      const events: string[] = [];

      @Directive({
        selector: '[animationPropDir]',
      })
      class AnimationPropDir {
        @HostBinding('@myAnimation') myAnimation: string = 'a';

        @HostListener('@myAnimation.start')
        onAnimationStart() {
          events.push('@myAnimation.start');
        }

        @HostListener('@myAnimation.done')
        onAnimationDone() {
          events.push('@myAnimation.done');
        }
      }

      @Component({
        selector: 'my-comp',
        template: '<div animationPropDir>Some content</div>',
        animations: [
          trigger('myAnimation', [state('a', style({color: 'yellow'})), transition('* => a', [])]),
        ],
      })
      class Comp {
      }

      TestBed.configureTestingModule({
        declarations: [Comp, AnimationPropDir],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();
      await fixture.whenStable();  // wait for animations to complete
      const queryResult = fixture.debugElement.query(By.directive(AnimationPropDir));
      expect(queryResult.nativeElement.style.color).toBe('yellow');
      expect(events).toEqual(['@myAnimation.start', '@myAnimation.done']);
    });

    it('should work when component contains synthetic listeners', async () => {
      const events: string[] = [];

      @Component({
        selector: 'my-comp',
        template: '<div>Some content</div>',
        animations: [
          trigger('myAnimation', [state('a', style({color: 'yellow'})), transition('* => a', [])]),
        ],
      })
      class Comp {
        @HostBinding('@myAnimation') myAnimation: string = 'a';

        @HostListener('@myAnimation.start')
        onAnimationStart() {
          events.push('@myAnimation.start');
        }

        @HostListener('@myAnimation.done')
        onAnimationDone() {
          events.push('@myAnimation.done');
        }
      }

      TestBed.configureTestingModule({
        declarations: [Comp],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();
      await fixture.whenStable();  // wait for animations to complete
      expect(fixture.nativeElement.style.color).toBe('yellow');
      expect(events).toEqual(['@myAnimation.start', '@myAnimation.done']);
    });

    it('should work when child component contains synthetic listeners', async () => {
      const events: string[] = [];

      @Component({
        selector: 'my-comp',
        template: '<div>Some content</div>',
        animations: [
          trigger('myAnimation', [state('a', style({color: 'yellow'})), transition('* => a', [])]),
        ],
      })
      class Comp {
        @HostBinding('@myAnimation') myAnimation: string = 'a';

        @HostListener('@myAnimation.start')
        onAnimationStart() {
          events.push('@myAnimation.start');
        }

        @HostListener('@myAnimation.done')
        onAnimationDone() {
          events.push('@myAnimation.done');
        }
      }

      @Component({
        template: '<my-comp></my-comp>',
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, Comp],
        imports: [NoopAnimationsModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      await fixture.whenStable();  // wait for animations to complete
      const queryResult = fixture.debugElement.query(By.directive(Comp));
      expect(queryResult.nativeElement.style.color).toBe('yellow');
      expect(events).toEqual(['@myAnimation.start', '@myAnimation.done']);
    });

    it('should work when component extends a directive that contains synthetic listeners',
       async () => {
         const events: string[] = [];

         @Directive({
           selector: 'animation-dir',
         })
         class AnimationDir {
           @HostBinding('@myAnimation') myAnimation: string = 'a';

           @HostListener('@myAnimation.start')
           onAnimationStart() {
             events.push('@myAnimation.start');
           }

           @HostListener('@myAnimation.done')
           onAnimationDone() {
             events.push('@myAnimation.done');
           }
         }

         @Component({
           selector: 'my-comp',
           template: '<div>Some content</div>',
           animations: [
             trigger(
                 'myAnimation', [state('a', style({color: 'yellow'})), transition('* => a', [])]),
           ],
         })
         class Comp extends AnimationDir {
         }

         TestBed.configureTestingModule({
           declarations: [Comp],
           imports: [NoopAnimationsModule],
         });
         const fixture = TestBed.createComponent(Comp);
         fixture.detectChanges();
         await fixture.whenStable();  // wait for animations to complete
         expect(fixture.nativeElement.style.color).toBe('yellow');
         expect(events).toEqual(['@myAnimation.start', '@myAnimation.done']);
       });
  });

  describe('via @HostBinding', () => {
    it('should render styling for parent and sub-classed components in order', () => {
      @Component({
        template: `
        <child-and-parent-cmp></child-and-parent-cmp>
      `
      })
      class MyApp {
      }

      @Component({template: '...'})
      class ParentCmp {
        @HostBinding('style.width') width1 = '100px';
        @HostBinding('style.height') height1 = '100px';
        @HostBinding('style.opacity') opacity1 = '0.5';
      }

      @Component({selector: 'child-and-parent-cmp', template: '...'})
      class ChildCmp extends ParentCmp {
        @HostBinding('style.width') width2 = '200px';
        @HostBinding('style.height') height2 = '200px';
      }

      TestBed.configureTestingModule({declarations: [MyApp, ParentCmp, ChildCmp]});
      const fixture = TestBed.createComponent(MyApp);
      const element = fixture.nativeElement;
      fixture.detectChanges();

      const childElement = element.querySelector('child-and-parent-cmp');
      expect(childElement.style.width).toEqual('200px');
      expect(childElement.style.height).toEqual('200px');
      expect(childElement.style.opacity).toEqual('0.5');
    });

    onlyInIvy('[style.prop] and [class.name] prioritization is a new feature')
        .it('should prioritize styling present in the order of directive hostBinding evaluation, but consider sub-classed directive styling to be the most important',
            () => {
              @Component({template: '<div child-dir sibling-dir></div>'})
              class MyApp {
              }

              @Directive({selector: '[parent-dir]'})
              class ParentDir {
                @HostBinding('style.width')
                get width1() {
                  return '100px';
                }

                @HostBinding('style.height')
                get height1() {
                  return '100px';
                }

                @HostBinding('style.color')
                get color1() {
                  return 'red';
                }
              }

              @Directive({selector: '[child-dir]'})
              class ChildDir extends ParentDir {
                @HostBinding('style.width')
                get width2() {
                  return '200px';
                }

                @HostBinding('style.height')
                get height2() {
                  return '200px';
                }
              }

              @Directive({selector: '[sibling-dir]'})
              class SiblingDir {
                @HostBinding('style.width')
                get width3() {
                  return '300px';
                }

                @HostBinding('style.height')
                get height3() {
                  return '300px';
                }

                @HostBinding('style.opacity')
                get opacity3() {
                  return '0.5';
                }

                @HostBinding('style.color')
                get color1() {
                  return 'blue';
                }
              }

              TestBed.configureTestingModule(
                  {declarations: [MyApp, ParentDir, SiblingDir, ChildDir]});
              const fixture = TestBed.createComponent(MyApp);
              const element = fixture.nativeElement;
              fixture.detectChanges();

              const childElement = element.querySelector('div');

              // width/height values were set in all directives, but the sub-class directive
              // (ChildDir) had priority over the parent directive (ParentDir) which is why its
              // value won. It also won over Dir because the SiblingDir directive was declared
              // later in `declarations`.
              expect(childElement.style.width).toEqual('200px');
              expect(childElement.style.height).toEqual('200px');

              // ParentDir styled the color first before Dir
              expect(childElement.style.color).toEqual('red');

              // Dir was the only directive to style opacity
              expect(childElement.style.opacity).toEqual('0.5');
            });

    it('should allow class-bindings to be placed on ng-container elements', () => {
      @Component({
        template: `
        <ng-container [class.foo]="true" dir-that-adds-other-classes>...</ng-container>
      `
      })
      class MyApp {
      }

      @Directive({selector: '[dir-that-adds-other-classes]'})
      class DirThatAddsOtherClasses {
        @HostBinding('class.other-class') bool = true;
      }

      TestBed.configureTestingModule({declarations: [MyApp, DirThatAddsOtherClasses]});
      expect(() => {
        const fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  @Directive({selector: '[hostBindingDir]'})
  class HostBindingDir {
    @HostBinding() id = 'foo';
  }

  it('should support host bindings in directives', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      @HostBinding('className') klass = 'foo';
    }

    @Component({template: '<span dir></span>'})
    class App {
      @ViewChild(Dir) directiveInstance!: Dir;
    }

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    expect(element.innerHTML).toContain('class="foo"');

    fixture.componentInstance.directiveInstance.klass = 'bar';
    fixture.detectChanges();

    expect(element.innerHTML).toContain('class="bar"');
  });


  it('should support host bindings on root component', () => {
    @Component({template: ''})
    class HostBindingComp {
      @HostBinding() title = 'my-title';
    }

    TestBed.configureTestingModule({declarations: [HostBindingComp]});
    const fixture = TestBed.createComponent(HostBindingComp);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    expect(element.title).toBe('my-title');

    fixture.componentInstance.title = 'other-title';
    fixture.detectChanges();

    expect(element.title).toBe('other-title');
  });

  it('should support host bindings on nodes with providers', () => {
    @Injectable()
    class ServiceOne {
      value = 'one';
    }

    @Injectable()
    class ServiceTwo {
      value = 'two';
    }

    @Component({template: '', providers: [ServiceOne, ServiceTwo]})
    class App {
      constructor(public serviceOne: ServiceOne, public serviceTwo: ServiceTwo) {}

      @HostBinding() title = 'my-title';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    expect(element.title).toBe('my-title');
    expect(fixture.componentInstance.serviceOne.value).toEqual('one');
    expect(fixture.componentInstance.serviceTwo.value).toEqual('two');

    fixture.componentInstance.title = 'other-title';
    fixture.detectChanges();
    expect(element.title).toBe('other-title');
  });

  it('should support host bindings on multiple nodes', () => {
    @Directive({selector: '[someDir]'})
    class SomeDir {
    }

    @Component({selector: 'host-title-comp', template: ''})
    class HostTitleComp {
      @HostBinding() title = 'my-title';
    }

    @Component({
      template: `
          <div hostBindingDir></div>
          <div someDir></div>
          <host-title-comp></host-title-comp>
        `
    })
    class App {
      @ViewChild(HostBindingDir) hostBindingDir!: HostBindingDir;
    }

    TestBed.configureTestingModule({declarations: [App, SomeDir, HostTitleComp, HostBindingDir]});
    const fixture = TestBed.createComponent(App);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    const hostBindingDiv = element.querySelector('div') as HTMLElement;
    const hostTitleComp = element.querySelector('host-title-comp') as HTMLElement;
    expect(hostBindingDiv.id).toEqual('foo');
    expect(hostTitleComp.title).toEqual('my-title');

    fixture.componentInstance.hostBindingDir!.id = 'bar';
    fixture.detectChanges();
    expect(hostBindingDiv.id).toEqual('bar');
  });

  it('should support consecutive components with host bindings', () => {
    @Component({selector: 'host-binding-comp', template: ''})
    class HostBindingComp {
      @HostBinding() id = 'blue';
    }

    @Component({
      template: `
          <host-binding-comp></host-binding-comp>
          <host-binding-comp></host-binding-comp>
        `
    })
    class App {
      @ViewChildren(HostBindingComp) hostBindingComp!: QueryList<HostBindingComp>;
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const comps = fixture.componentInstance.hostBindingComp.toArray();

    const hostBindingEls =
        fixture.nativeElement.querySelectorAll('host-binding-comp') as NodeListOf<HTMLElement>;

    expect(hostBindingEls.length).toBe(2);

    comps[0].id = 'red';
    fixture.detectChanges();
    expect(hostBindingEls[0].id).toBe('red');

    // second element should not be affected
    expect(hostBindingEls[1].id).toBe('blue');

    comps[1].id = 'red';
    fixture.detectChanges();

    // now second element should take updated value
    expect(hostBindingEls[1].id).toBe('red');
  });


  it('should support dirs with host bindings on the same node as dirs without host bindings',
     () => {
       @Directive({selector: '[someDir]'})
       class SomeDir {
       }

       @Component({template: '<div someDir hostBindingDir></div>'})
       class App {
         @ViewChild(HostBindingDir) hostBindingDir!: HostBindingDir;
       }

       TestBed.configureTestingModule({declarations: [App, SomeDir, HostBindingDir]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();

       const hostBindingDiv = fixture.nativeElement.querySelector('div') as HTMLElement;
       expect(hostBindingDiv.id).toEqual('foo');

       fixture.componentInstance.hostBindingDir!.id = 'bar';
       fixture.detectChanges();
       expect(hostBindingDiv.id).toEqual('bar');
     });



  it('should support host bindings that rely on values from init hooks', () => {
    @Component({template: '', selector: 'init-hook-comp'})
    class InitHookComp implements OnInit, OnChanges, DoCheck {
      @Input() inputValue = '';

      changesValue = '';
      initValue = '';
      checkValue = '';

      ngOnChanges() {
        this.changesValue = 'changes';
      }

      ngOnInit() {
        this.initValue = 'init';
      }

      ngDoCheck() {
        this.checkValue = 'check';
      }

      @HostBinding('title')
      get value() {
        return `${this.inputValue}-${this.changesValue}-${this.initValue}-${this.checkValue}`;
      }
    }

    @Component({template: '<init-hook-comp [inputValue]="value"></init-hook-comp>'})
    class App {
      value = 'input';
    }

    TestBed.configureTestingModule({declarations: [App, InitHookComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const initHookComp = fixture.nativeElement.querySelector('init-hook-comp') as HTMLElement;
    expect(initHookComp.title).toEqual('input-changes-init-check');

    fixture.componentInstance.value = 'input2';
    fixture.detectChanges();
    expect(initHookComp.title).toEqual('input2-changes-init-check');
  });

  it('should support host bindings with the same name as inputs', () => {
    @Directive({selector: '[hostBindingDir]'})
    class HostBindingInputDir {
      @Input() disabled = false;

      @HostBinding('disabled') hostDisabled = false;
    }

    @Component({template: '<input hostBindingDir [disabled]="isDisabled">'})
    class App {
      @ViewChild(HostBindingInputDir) hostBindingInputDir!: HostBindingInputDir;
      isDisabled = true;
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingInputDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const hostBindingInputDir = fixture.componentInstance.hostBindingInputDir;

    const hostBindingEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(hostBindingInputDir.disabled).toBe(true);
    expect(hostBindingEl.disabled).toBe(false);

    fixture.componentInstance.isDisabled = false;
    fixture.detectChanges();
    expect(hostBindingInputDir.disabled).toBe(false);
    expect(hostBindingEl.disabled).toBe(false);

    hostBindingInputDir.hostDisabled = true;
    fixture.detectChanges();
    expect(hostBindingInputDir.disabled).toBe(false);
    expect(hostBindingEl.disabled).toBe(true);
  });

  it('should support host bindings on second template pass', () => {
    @Component({selector: 'parent', template: '<div hostBindingDir></div>'})
    class Parent {
    }

    @Component({
      template: `
          <parent></parent>
          <parent></parent>
        `
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, Parent, HostBindingDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const divs = fixture.nativeElement.querySelectorAll('div');
    expect(divs[0].id).toEqual('foo');
    expect(divs[1].id).toEqual('foo');
  });

  it('should support host bindings in for loop', () => {
    @Component({
      template: `
          <div *ngFor="let row of rows">
            <p hostBindingDir></p>
          </div>
        `
    })
    class App {
      rows: number[] = [];
    }

    TestBed.configureTestingModule({imports: [CommonModule], declarations: [App, HostBindingDir]});
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.rows = [1, 2, 3];
    fixture.detectChanges();

    const paragraphs = fixture.nativeElement.querySelectorAll('p');
    expect(paragraphs[0].id).toEqual('foo');
    expect(paragraphs[1].id).toEqual('foo');
    expect(paragraphs[2].id).toEqual('foo');
  });

  it('should support component with host bindings and array literals', () => {
    @Component({selector: 'host-binding-comp', template: ''})
    class HostBindingComp {
      @HostBinding() id = 'my-id';
    }

    @Component({selector: 'name-comp', template: ''})
    class NameComp {
      @Input() names!: string[];
    }

    @Component({
      template: `
          <name-comp [names]="['Nancy', name, 'Ned']"></name-comp>
          <host-binding-comp></host-binding-comp>
        `
    })
    class App {
      @ViewChild(NameComp) nameComp!: NameComp;
      name = '';
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingComp, NameComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const nameComp = fixture.componentInstance.nameComp;
    const hostBindingEl = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    fixture.componentInstance.name = 'Betty';
    fixture.detectChanges();
    expect(hostBindingEl.id).toBe('my-id');
    expect(nameComp.names).toEqual(['Nancy', 'Betty', 'Ned']);

    const firstArray = nameComp.names;
    fixture.detectChanges();
    expect(firstArray).toBe(nameComp.names);

    fixture.componentInstance.name = 'my-id';
    fixture.detectChanges();
    expect(hostBindingEl.id).toBe('my-id');
    expect(nameComp.names).toEqual(['Nancy', 'my-id', 'Ned']);
  });


  // Note: This is a contrived example. For feature parity with render2, we should make sure it
  // works in this way (see https://stackblitz.com/edit/angular-cbqpbe), but a more realistic
  // example would be an animation host binding with a literal defining the animation config.
  // When animation support is added, we should add another test for that case.
  it('should support host bindings that contain array literals', () => {
    @Component({selector: 'name-comp', template: ''})
    class NameComp {
      @Input() names!: string[];
    }

    @Component({
      selector: 'host-binding-comp',
      host: {'[id]': `['red', id]`, '[dir]': `dir`, '[title]': `[title, otherTitle]`},
      template: ''
    })
    class HostBindingComp {
      id = 'blue';
      dir = 'ltr';
      title = 'my title';
      otherTitle = 'other title';
    }

    @Component({
      template: `
          <name-comp [names]="[name, 'Nancy', otherName]"></name-comp>
          <host-binding-comp></host-binding-comp>
        `
    })
    class App {
      @ViewChild(HostBindingComp) hostBindingComp!: HostBindingComp;
      @ViewChild(NameComp) nameComp!: NameComp;
      name = '';
      otherName = '';
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingComp, NameComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const {nameComp, hostBindingComp} = fixture.componentInstance;

    fixture.componentInstance.name = 'Frank';
    fixture.componentInstance.otherName = 'Joe';
    fixture.detectChanges();

    const hostBindingEl = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toBe('red,blue');
    expect(hostBindingEl.dir).toBe('ltr');
    expect(hostBindingEl.title).toBe('my title,other title');
    expect(nameComp!.names).toEqual(['Frank', 'Nancy', 'Joe']);

    const firstArray = nameComp!.names;
    fixture.detectChanges();
    expect(firstArray).toBe(nameComp!.names);

    hostBindingComp.id = 'green';
    hostBindingComp.dir = 'rtl';
    hostBindingComp.title = 'TITLE';
    fixture.detectChanges();
    expect(hostBindingEl.id).toBe('red,green');
    expect(hostBindingEl.dir).toBe('rtl');
    expect(hostBindingEl.title).toBe('TITLE,other title');
  });

  it('should support directives with and without allocHostVars on the same component', () => {
    let events: string[] = [];

    @Directive({selector: '[hostDir]', host: {'[title]': `[title, 'other title']`}})
    class HostBindingDir {
      title = 'my title';
    }

    @Directive({selector: '[hostListenerDir]'})
    class HostListenerDir {
      @HostListener('click')
      onClick() {
        events.push('click!');
      }
    }

    @Component({template: '<button hostListenerDir hostDir>Click</button>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingDir, HostListenerDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button')!;
    button.click();
    expect(events).toEqual(['click!']);
    expect(button.title).toEqual('my title,other title');
  });

  it('should support host bindings with literals from multiple directives', () => {
    @Component({selector: 'host-binding-comp', host: {'[id]': `['red', id]`}, template: ''})
    class HostBindingComp {
      id = 'blue';
    }

    @Directive({selector: '[hostDir]', host: {'[title]': `[title, 'other title']`}})
    class HostBindingDir {
      title = 'my title';
    }

    @Component({template: '<host-binding-comp hostDir></host-binding-comp>'})
    class App {
      @ViewChild(HostBindingComp) hostBindingComp!: HostBindingComp;
      @ViewChild(HostBindingDir) hostBindingDir!: HostBindingDir;
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingComp, HostBindingDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const hostElement = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostElement.id).toBe('red,blue');
    expect(hostElement.title).toBe('my title,other title');

    fixture.componentInstance.hostBindingDir.title = 'blue';
    fixture.detectChanges();
    expect(hostElement.title).toBe('blue,other title');

    fixture.componentInstance.hostBindingComp.id = 'green';
    fixture.detectChanges();
    expect(hostElement.id).toBe('red,green');
  });

  it('should support ternary expressions in host bindings', () => {
    @Component({
      selector: 'host-binding-comp',
      template: '',
      host: {
        // Use `attr` since IE doesn't support the `title` property on all elements.
        '[attr.id]': `condition ? ['red', id] : 'green'`,
        '[attr.title]': `otherCondition ? [title] : 'other title'`
      }
    })
    class HostBindingComp {
      condition = true;
      otherCondition = true;
      id = 'blue';
      title = 'blue';
    }

    @Component({template: `<host-binding-comp></host-binding-comp>{{ name }}`})
    class App {
      @ViewChild(HostBindingComp) hostBindingComp!: HostBindingComp;
      name = '';
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingComp]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const hostElement = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    fixture.componentInstance.name = 'Ned';
    fixture.detectChanges();

    expect(hostElement.id).toBe('red,blue');
    expect(hostElement.title).toBe('blue');
    expect(fixture.nativeElement.innerHTML.endsWith('Ned')).toBe(true);

    fixture.componentInstance.hostBindingComp.condition = false;
    fixture.componentInstance.hostBindingComp.title = 'TITLE';
    fixture.detectChanges();
    expect(hostElement.id).toBe('green');
    expect(hostElement.title).toBe('TITLE');

    fixture.componentInstance.hostBindingComp.otherCondition = false;
    fixture.detectChanges();
    expect(hostElement.id).toBe('green');
    expect(hostElement.title).toBe('other title');
  });

  it('should merge attributes on host and template', () => {
    @Directive({selector: '[dir1]', host: {id: 'dir1'}})
    class MyDir1 {
    }
    @Directive({selector: '[dir2]', host: {id: 'dir2'}})
    class MyDir2 {
    }

    @Component({template: `<div dir1 dir2 id="tmpl"></div>`})
    class MyComp {
    }

    TestBed.configureTestingModule({declarations: [MyComp, MyDir1, MyDir2]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    const div: HTMLElement = fixture.debugElement.nativeElement.firstChild;
    expect(div.id).toEqual(
        ivyEnabled ?
            // In ivy the correct result is `tmpl` because template has the highest priority.
            'tmpl' :
            // In VE the order was simply that of execution and so dir2 would win.
            'dir2');
  });

  onlyInIvy('Host bindings do not get merged in ViewEngine')
      .it('should work correctly with inherited directives with hostBindings', () => {
        @Directive({selector: '[superDir]', host: {'[id]': 'id'}})
        class SuperDirective {
          id = 'my-id';
        }

        @Directive({selector: '[subDir]', host: {'[title]': 'title'}})
        class SubDirective extends SuperDirective {
          title = 'my-title';
        }

        @Component({
          template: `
        <div subDir></div>
        <div superDir></div>
      `
        })
        class App {
          @ViewChild(SubDirective) subDir!: SubDirective;
          @ViewChild(SuperDirective) superDir!: SuperDirective;
        }

        TestBed.configureTestingModule({declarations: [App, SuperDirective, SubDirective]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const els = fixture.nativeElement.querySelectorAll('div') as NodeListOf<HTMLElement>;

        const firstDivEl = els[0];
        const secondDivEl = els[1];

        // checking first div element with inherited directive
        expect(firstDivEl.id).toEqual('my-id');
        expect(firstDivEl.title).toEqual('my-title');

        fixture.componentInstance.subDir.title = 'new-title';
        fixture.detectChanges();
        expect(firstDivEl.id).toEqual('my-id');
        expect(firstDivEl.title).toEqual('new-title');

        fixture.componentInstance.subDir.id = 'new-id';
        fixture.detectChanges();
        expect(firstDivEl.id).toEqual('new-id');
        expect(firstDivEl.title).toEqual('new-title');

        // checking second div element with simple directive
        expect(secondDivEl.id).toEqual('my-id');

        fixture.componentInstance.superDir.id = 'new-id';
        fixture.detectChanges();
        expect(secondDivEl.id).toEqual('new-id');
      });

  it('should support host attributes', () => {
    @Directive({selector: '[hostAttributeDir]', host: {'role': 'listbox'}})
    class HostAttributeDir {
    }

    @Component({template: '<div hostAttributeDir></div>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, HostAttributeDir]});
    const fixture = TestBed.createComponent(App);
    expect(fixture.nativeElement.innerHTML).toContain(`role="listbox"`);
  });

  it('should support content children in host bindings', () => {
    @Component({
      selector: 'host-binding-comp',
      template: '<ng-content></ng-content>',
      host: {'[id]': 'foos.length'}
    })
    class HostBindingWithContentChildren {
      @ContentChildren('foo') foos!: QueryList<any>;
    }

    @Component({
      template: `
          <host-binding-comp>
            <div #foo></div>
            <div #foo></div>
          </host-binding-comp>
        `
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingWithContentChildren]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const hostBindingEl = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toEqual('2');
  });

  it('should support host bindings dependent on content hooks', () => {
    @Component({selector: 'host-binding-comp', template: '', host: {'[id]': 'myValue'}})
    class HostBindingWithContentHooks implements AfterContentInit {
      myValue = 'initial';

      ngAfterContentInit() {
        this.myValue = 'after-content';
      }
    }

    @Component({template: '<host-binding-comp></host-binding-comp>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, HostBindingWithContentHooks]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const hostBindingEl = fixture.nativeElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toEqual('after-content');
  });

  describe('styles', () => {
    it('should bind to host styles', () => {
      @Component(
          {selector: 'host-binding-to-styles', host: {'[style.width.px]': 'width'}, template: ''})
      class HostBindingToStyles {
        width = 2;
      }

      @Component({template: '<host-binding-to-styles></host-binding-to-styles>'})
      class App {
        @ViewChild(HostBindingToStyles) hostBindingDir!: HostBindingToStyles;
      }

      TestBed.configureTestingModule({declarations: [App, HostBindingToStyles]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const hostBindingEl =
          fixture.nativeElement.querySelector('host-binding-to-styles') as HTMLElement;
      expect(hostBindingEl.style.width).toEqual('2px');

      fixture.componentInstance.hostBindingDir.width = 5;
      fixture.detectChanges();
      expect(hostBindingEl.style.width).toEqual('5px');
    });

    it('should bind to host styles on containers', () => {
      @Directive({selector: '[hostStyles]', host: {'[style.width.px]': 'width'}})
      class HostBindingToStyles {
        width = 2;
      }

      @Directive({selector: '[containerDir]'})
      class ContainerDir {
        constructor(public vcr: ViewContainerRef) {}
      }

      @Component({template: '<div hostStyles containerDir></div>'})
      class App {
        @ViewChild(HostBindingToStyles) hostBindingDir!: HostBindingToStyles;
      }

      TestBed.configureTestingModule({declarations: [App, HostBindingToStyles, ContainerDir]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const hostBindingEl = fixture.nativeElement.querySelector('div') as HTMLElement;
      expect(hostBindingEl.style.width).toEqual('2px');

      fixture.componentInstance.hostBindingDir.width = 5;
      fixture.detectChanges();
      expect(hostBindingEl.style.width).toEqual('5px');
    });

    it('should apply static host classes', () => {
      @Component({selector: 'static-host-class', host: {'class': 'mat-toolbar'}, template: ''})
      class StaticHostClass {
      }

      @Component({template: '<static-host-class></static-host-class>'})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, StaticHostClass]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const hostBindingEl = fixture.nativeElement.querySelector('static-host-class') as HTMLElement;
      expect(hostBindingEl.className).toEqual('mat-toolbar');
    });
  });

  describe('sanitization', () => {
    function identity(value: any) {
      return value;
    }
    function verify(tag: string, prop: string, value: any, expectedSanitizedValue: any,
                    bypassFn: Function, isAttribute: boolean = true,
                    throws: boolean = false) {
      it(`should sanitize <${tag} ${prop}> ${isAttribute ? 'properties' : 'attributes'}`, () => {
        @Directive({
          selector: '[unsafeUrlHostBindingDir]',
          host: {
            [`[${isAttribute ? 'attr.' : ''}${prop}]`]: 'value',
          }
        })
        class UnsafeDir {
          value: any = value;
        }

        @Component({template: `<${tag} unsafeUrlHostBindingDir></${tag}>`})
        class App {
          @ViewChild(UnsafeDir) unsafeDir!: UnsafeDir;
        }

        TestBed.configureTestingModule({declarations: [App, UnsafeDir]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const el = fixture.nativeElement.querySelector(tag)!;
        const current = () => isAttribute ? el.getAttribute(prop) : (el as any)[prop];

        fixture.componentInstance.unsafeDir.value = value;
        fixture.detectChanges();
        expect(current()).toEqual(expectedSanitizedValue);

        fixture.componentInstance.unsafeDir.value = bypassFn(value);
        if (throws) {
          expect(() => fixture.detectChanges()).toThrowError(/Required a safe URL, got a \w+/);
        } else {
          fixture.detectChanges();
          expect(current()).toEqual(bypassFn == identity ? expectedSanitizedValue : value);
        }
      });
    }

    verify(
        'a', 'href', 'javascript:alert(1)', 'unsafe:javascript:alert(1)',
        bypassSanitizationTrustUrl);
    verify('a', 'href', 'javascript:alert(1.1)', 'unsafe:javascript:alert(1.1)', identity);
    verify(
        'a', 'href', 'javascript:alert(1.2)', 'unsafe:javascript:alert(1.2)',
        bypassSanitizationTrustStyle, true, true);
    verify(
        'blockquote', 'cite', 'javascript:alert(2)', 'unsafe:javascript:alert(2)',
        bypassSanitizationTrustUrl);
    verify('blockquote', 'cite', 'javascript:alert(2.1)', 'unsafe:javascript:alert(2.1)', identity);
    verify(
        'blockquote', 'cite', 'javascript:alert(2.2)', 'unsafe:javascript:alert(2.2)',
        bypassSanitizationTrustHtml, true, true);
    verify(
        'b', 'innerHTML', '<img src="javascript:alert(3)">',
        '<img src="unsafe:javascript:alert(3)">', bypassSanitizationTrustHtml,
        /* isAttribute */ false);
  });

  onlyInIvy('VE would silently ignore this').describe('host binding on containers', () => {
    @Directive({selector: '[staticHostAtt]', host: {'static': 'attr'}})
    class StaticHostAttr {
      constructor() {}
    }

    @Directive({selector: '[dynamicHostAtt]', host: {'[attr.dynamic]': '"dynamic"'}})
    class DynamicHostAttr {
      constructor() {}
    }

    it('should fail with expected error with ng-container', () => {
      @Component({
        selector: 'my-app',
        template: `
          <ng-template #ref></ng-template>
          <ng-container [ngTemplateOutlet]="ref" staticHostAtt dynamicHostAtt></ng-container>
        `
      })
      class App {
      }

      const comp =
          TestBed.configureTestingModule({declarations: [App, StaticHostAttr, DynamicHostAttr]})
              .createComponent(App);
      // TODO(FW-2202): binding static attrs won't throw an error. We should be more consistent.
      expect(() => comp.detectChanges())
          .toThrowError(
              /Attempted to set attribute `dynamic` on a container node. Host bindings are not valid on ng-container or ng-template./);
    });

    it('should fail with expected error with ng-template', () => {
      @Component({
        selector: 'my-app',
        template: ` <ng-template staticHostAtt dynamicHostAtt></ng-template> `
      })
      class App {
      }

      const comp =
          TestBed.configureTestingModule({declarations: [App, StaticHostAttr, DynamicHostAttr]})
              .createComponent(App);
      // TODO(FW-2202): binding static attrs won't throw an error. We should be more consistent.
      expect(() => comp.detectChanges())
          .toThrowError(
              /Attempted to set attribute `dynamic` on a container node. Host bindings are not valid on ng-container or ng-template./);
    });
  });

  onlyInIvy('VE does not support this').describe('host bindings on edge case properties', () => {
    it('should handle host bindings with the same name as a primitive value', () => {
      @Directive({
        selector: '[dir]',
        host: {
          '[class.a]': 'true',
          '[class.b]': 'false',
        }
      })
      class MyDirective {
        @HostBinding('class.c') true: any;
        @HostBinding('class.d') false: any;
      }

      @Component({template: '<span dir></span>'})
      class MyApp {
        @ViewChild(MyDirective) dir!: MyDirective;
      }

      TestBed.configureTestingModule({declarations: [MyApp, MyDirective]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('span');
      expect(span.className).toBe('a');

      fixture.componentInstance.dir.true = 1;
      fixture.componentInstance.dir.false = 2;
      fixture.detectChanges();

      expect(span.className).toBe('a c d');
    });

    it('should handle host bindings with quoted names', () => {
      @Directive({selector: '[dir]'})
      class MyDirective {
        @HostBinding('class.a') 'is-a': any;
        @HostBinding('class.b') 'is-"b"': any = true;
        @HostBinding('class.c') '"is-c"': any;
      }

      @Component({template: '<span dir></span>'})
      class MyApp {
        @ViewChild(MyDirective) dir!: MyDirective;
      }

      TestBed.configureTestingModule({declarations: [MyApp, MyDirective]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      const span = fixture.nativeElement.querySelector('span');
      expect(span.className).toBe('b');

      fixture.componentInstance.dir['is-a'] = 1;
      fixture.componentInstance.dir['"is-c"'] = 2;
      fixture.detectChanges();

      expect(span.className).toBe('b a c');
    });
  });
});

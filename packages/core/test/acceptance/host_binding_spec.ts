/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, ComponentRef, Directive, HostBinding, Input, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
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
       *       state** via `setActiveHostElement`.
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

        @ViewChild('template', {read: ViewContainerRef})
        vcr: ViewContainerRef = null !;

        private child: ComponentRef<ChildCmp> = null !;

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

        get prop() { return this._prop; }

        @Input()
        prop2 = 0;

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
                get width1() { return '100px'; }

                @HostBinding('style.height')
                get height1() { return '100px'; }

                @HostBinding('style.color')
                get color1() { return 'red'; }
              }

              @Directive({selector: '[child-dir]'})
              class ChildDir extends ParentDir {
                @HostBinding('style.width')
                get width2() { return '200px'; }

                @HostBinding('style.height')
                get height2() { return '200px'; }
              }

              @Directive({selector: '[sibling-dir]'})
              class SiblingDir {
                @HostBinding('style.width')
                get width3() { return '300px'; }

                @HostBinding('style.height')
                get height3() { return '300px'; }

                @HostBinding('style.opacity')
                get opacity3() { return '0.5'; }

                @HostBinding('style.color')
                get color1() { return 'blue'; }
              }

              TestBed.configureTestingModule(
                  {declarations: [MyApp, ParentDir, ChildDir, SiblingDir]});
              const fixture = TestBed.createComponent(MyApp);
              const element = fixture.nativeElement;
              fixture.detectChanges();

              const childElement = element.querySelector('div');

              // width/height values were set in all directives, but the sub-class directive
              // (ChildDir)
              // had priority over the parent directive (ParentDir) which is why its value won. It
              // also
              // won over Dir because the SiblingDir directive was evaluated later on.
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
});
